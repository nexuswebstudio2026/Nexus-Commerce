import React, { useState, useEffect } from 'react';
import { 
  INITIAL_BUSINESSES, 
  INITIAL_PRODUCTS, 
  INITIAL_USERS, 
  INITIAL_RESTOCK_RECORDS, 
  INITIAL_ORDERS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS
} from './initialData';
import { Business, ProductService, User, SupplierRestockRecord, Order, AuditLog, EmployeePermission, AppNotification } from './types';
import { Navbar, MainNavPage } from './components/Navbar';
import { ArchitectureDocModal } from './components/ArchitectureDocModal';
import { LoginModal } from './components/LoginModal';
import { HomeSection } from './components/pages/HomeSection';
import { RegisteredBusinessesSection } from './components/pages/RegisteredBusinessesSection';
import { AboutUsSection } from './components/pages/AboutUsSection';
import { ContactUsSection } from './components/pages/ContactUsSection';
import { ProfileSection } from './components/pages/ProfileSection';
import { SuperadminDashboard } from './components/dashboards/SuperadminDashboard';
import { BusinessOwnerDashboard } from './components/dashboards/BusinessOwnerDashboard';
import { EmployeeDashboard } from './components/dashboards/EmployeeDashboard';
import { CustomerDashboard } from './components/dashboards/CustomerDashboard';
import { SupplierDashboard } from './components/dashboards/SupplierDashboard';
import { StorefrontPage } from './components/pages/StorefrontPage';
import { enforceSuperadminRole, ensureUserIsSuperadmin, TARGET_SUPERADMIN_EMAIL } from './userUtils';
import { ShieldCheck, UserCheck, CheckCircle2, Info, RefreshCw, Sparkles, Lock, Layers } from 'lucide-react';
import { 
  fetchBusinessesFromGoogleSheets, 
  getGoogleAccessToken, 
  initGoogleSheetsAuth, 
  DEFAULT_SPREADSHEET_ID 
} from './googleSheetsAuth';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showArchModal, setShowArchModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Main Page Navigation State
  const [activeNavPage, setActiveNavPage] = useState<MainNavPage>('home');
  const [selectedBizCatalogModal, setSelectedBizCatalogModal] = useState<Business | null>(null);
  const [selectedStorefrontBusiness, setSelectedStorefrontBusiness] = useState<Business | null>(null);

  // Core domain state - initialize users with superadmin role enforced
  const [businesses, setBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [products, setProducts] = useState<ProductService[]>(INITIAL_PRODUCTS);
  const [users, setUsers] = useState<User[]>(() => enforceSuperadminRole(INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => ensureUserIsSuperadmin(INITIAL_USERS[0]));
  const [restockRecords, setRestockRecords] = useState<SupplierRestockRecord[]>(INITIAL_RESTOCK_RECORDS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Helper: Add Real-Time Notification
  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Ahora mismo',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Dynamic Initial Loading & Real-Time Sync Hook for Businesses from Google Sheets API
  useEffect(() => {
    let isMounted = true;

    const loadBusinessesFromSheets = async () => {
      try {
        const activeSpreadsheetId = localStorage.getItem('nexus_active_spreadsheet_id') || DEFAULT_SPREADSHEET_ID;
        const token = getGoogleAccessToken();
        const fetchedBizs = await fetchBusinessesFromGoogleSheets(activeSpreadsheetId, token);
        
        if (isMounted && Array.isArray(fetchedBizs)) {
          setBusinesses(prev => {
            console.log('[GoogleSheets Sync Audit]', {
              fetchedCount: fetchedBizs.length,
              localCount: prev.length,
              fetchedIds: fetchedBizs.map(b => b.id),
              localIds: prev.map(b => b.id),
              fetchedNames: fetchedBizs.map(b => b.name),
              localNames: prev.map(b => b.name),
              fetchedBizs,
              localBizs: prev,
            });
            return fetchedBizs;
          });
        }
      } catch (err) {
        console.warn('Error al obtener negocios dinámicamente desde Google Sheets:', err);
      }
    };

    // Immediate fetch on mount, login, or user role change
    loadBusinessesFromSheets();

    // Init Google Sheets Auth listener to refetch when token changes
    initGoogleSheetsAuth((_user, token) => {
      const activeSpreadsheetId = localStorage.getItem('nexus_active_spreadsheet_id') || DEFAULT_SPREADSHEET_ID;
      fetchBusinessesFromGoogleSheets(activeSpreadsheetId, token).then(fetchedBizs => {
        if (isMounted && Array.isArray(fetchedBizs)) {
          setBusinesses(prev => {
            console.log('[GoogleSheets Auth Callback Sync Audit]', {
              fetchedCount: fetchedBizs.length,
              localCount: prev.length,
              fetchedIds: fetchedBizs.map(b => b.id),
              localIds: prev.map(b => b.id),
              fetchedBizs,
              localBizs: prev,
            });
            return fetchedBizs;
          });
        }
      });
    });

    // Real-time periodic polling (every 6 seconds)
    const intervalId = setInterval(loadBusinessesFromSheets, 6000);

    // Refetch when window regains focus
    const handleFocus = () => loadBusinessesFromSheets();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLoggedIn, currentUser?.role, currentUser?.id]);

  // Enforce superadmin role
  useEffect(() => {
    setUsers((prevUsers) => {
      const enforced = enforceSuperadminRole(prevUsers);
      return JSON.stringify(enforced) === JSON.stringify(prevUsers) ? prevUsers : enforced;
    });

    setCurrentUser((prevCurrent) => ensureUserIsSuperadmin(prevCurrent));
  }, []);

  // Handle URL Routing for dedicated business slugs: /{business-slug}/inicio
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const storeParam = urlParams.get('store');

      let targetSlug = storeParam;
      if (!targetSlug && path.includes('/inicio')) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 2 && parts[1] === 'inicio') {
          targetSlug = parts[0];
        }
      }

      if (targetSlug) {
        const foundBiz = businesses.find(b => b.slug.toLowerCase() === targetSlug?.toLowerCase() || b.id.toLowerCase() === targetSlug?.toLowerCase());
        if (foundBiz) {
          setSelectedStorefrontBusiness(foundBiz);
          setActiveNavPage('storefront');
          return;
        }
      }

      if (path === '/negocios') {
        setActiveNavPage('businesses');
      } else if (path === '/sobre-nosotros') {
        setActiveNavPage('about');
      } else if (path === '/contactenos') {
        setActiveNavPage('contact');
      } else if (path === '/panel') {
        setActiveNavPage('dashboard');
      } else if (path === '/perfil') {
        setActiveNavPage('profile');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [businesses]);

  // Navigation handlers with pushState
  const handleNavigatePage = (page: MainNavPage) => {
    setActiveNavPage(page);
    if (page === 'home') {
      window.history.pushState({}, '', '/');
    } else if (page === 'businesses') {
      window.history.pushState({}, '', '/negocios');
    } else if (page === 'about') {
      window.history.pushState({}, '', '/sobre-nosotros');
    } else if (page === 'contact') {
      window.history.pushState({}, '', '/contactenos');
    } else if (page === 'dashboard') {
      window.history.pushState({}, '', '/panel');
    } else if (page === 'profile') {
      window.history.pushState({}, '', '/perfil');
    }
  };

  const handleOpenStorefront = (biz: Business) => {
    setSelectedStorefrontBusiness(biz);
    setActiveNavPage('storefront');
    window.history.pushState({}, '', `/${biz.slug}/inicio`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    handleNavigatePage('home');
  };

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handler: Add Audit Log
  const addAuditLog = (action: string, targetTenant: string, details: string, severity: AuditLog['severity'] = 'info') => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      targetTenant,
      details,
      severity,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Handler: Update User Profile
  const handleUpdateProfile = (updatedData: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
    addAuditLog('UPDATE_USER_PROFILE', 'Nexus User Account', `Usuario ${currentUser.name} actualizó su información de perfil.`);
  };

  // Handler: Superadmin update business status
  const handleUpdateBusinessStatus = (id: string, status: 'active' | 'pending' | 'suspended') => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    const target = businesses.find(b => b.id === id)?.name || id;
    addAuditLog('UPDATE_TENANT_STATUS', target, `Cambió estado de inquilino a: ${status}`);
    addNotification({
      type: 'tenant',
      title: 'Estado de Inquilino Actualizado',
      message: `El inquilino "${target}" cambió su estado a ${status.toUpperCase()}.`,
      severity: 'info',
      linkTo: 'businesses',
    });
  };

  // Handler: Superadmin update commission
  const handleUpdateCommission = (id: string, rate: number) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, commissionRate: rate } : b));
    const target = businesses.find(b => b.id === id)?.name || id;
    addAuditLog('UPDATE_COMMISSION_RATE', target, `Ajustó comisión de plataforma a: ${rate}%`);
  };

  // Handler: Superadmin create business
  const handleAddBusiness = (newBizData: Omit<Business, 'id' | 'createdDate' | 'rating'>) => {
    const newId = `biz-${Date.now().toString().slice(-4)}`;
    const newBiz: Business = {
      ...newBizData,
      id: newId,
      createdDate: new Date().toISOString().split('T')[0],
      rating: 5.0,
    };
    setBusinesses(prev => [...prev, newBiz]);
    addAuditLog('PROVISION_NEW_TENANT', newBiz.name, `Nuevo inquilino registrado por Nexus Web Studio.`);
    addNotification({
      type: 'tenant',
      title: 'Nuevo Inquilino Registrado',
      message: `Se registró el comercio "${newBiz.name}" con aislamiento RLS PostgreSQL.`,
      severity: 'success',
      linkTo: 'businesses',
    });
  };

  // Handler: Business Owner add product
  const handleAddProduct = (prodData: Omit<ProductService, 'id'>) => {
    const newProd: ProductService = {
      ...prodData,
      id: `prod-${Date.now().toString().slice(-4)}`,
    };
    setProducts(prev => [newProd, ...prev]);
    const biz = businesses.find(b => b.id === prodData.businessId)?.name || prodData.businessId;
    addAuditLog('CREATE_CATALOG_ITEM', biz, `Añadió item "${prodData.title}" (Retail: $${prodData.retailPrice.toFixed(2)})`);
    addNotification({
      type: 'inventory',
      title: 'Nuevo Producto en Catálogo',
      message: `Se añadió "${prodData.title}" ($${prodData.retailPrice.toFixed(2)}) en ${biz}.`,
      severity: 'info',
      linkTo: 'dashboard',
    });
  };

  // Handler: Business Owner update product
  const handleUpdateProduct = (id: string, updates: Partial<ProductService>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const prod = products.find(p => p.id === id);
    if (prod) {
      const biz = businesses.find(b => b.id === prod.businessId)?.name || prod.businessId;
      addAuditLog('UPDATE_CATALOG_ITEM', biz, `Modificó producto "${prod.title}".`);
    }
  };

  // Handler: Business Owner add employee
  const handleAddEmployee = (name: string, email: string, permissions: EmployeePermission[]) => {
    const newEmp: User = {
      id: `usr-emp-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role: 'employee',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      businessIds: [currentUser.activeBusinessId],
      activeBusinessId: currentUser.activeBusinessId,
      permissions,
    };
    setUsers(prev => [...prev, newEmp]);
    const biz = businesses.find(b => b.id === currentUser.activeBusinessId)?.name || currentUser.activeBusinessId;
    addAuditLog('REGISTER_EMPLOYEE', biz, `Asignó permisos RBAC a empleado "${name}": ${permissions.join(', ')}`);
  };

  // Handler: Supplier Restock Inventory
  const handleAddRestock = (recordData: Omit<SupplierRestockRecord, 'id' | 'date' | 'totalCost'>) => {
    const totalCost = recordData.unitsAdded * recordData.costPrice;
    const newRecord: SupplierRestockRecord = {
      ...recordData,
      id: `rst-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalCost,
    };

    setRestockRecords(prev => [newRecord, ...prev]);

    setProducts(prev => prev.map(p => {
      if (p.id === recordData.productId) {
        return {
          ...p,
          stockQuantity: p.stockQuantity + recordData.unitsAdded,
          supplierCost: recordData.costPrice,
          supplierId: recordData.supplierId,
          supplierName: recordData.supplierName,
        };
      }
      return p;
    }));

    addAuditLog('RESTOCK_INVENTORY_UPDATE', recordData.businessName, `Aumentó +${recordData.unitsAdded} unidades en "${recordData.productTitle}" a costo unitario de $${recordData.costPrice.toFixed(2)}.`);
    addNotification({
      type: 'inventory',
      title: 'Insumos B2B Recibidos',
      message: `Proveedor ${recordData.supplierName} reabasteció +${recordData.unitsAdded} unidades de "${recordData.productTitle}".`,
      severity: 'success',
      linkTo: 'dashboard',
    });
  };

  // Handler: Employee update order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    addAuditLog('UPDATE_ORDER_STATUS', 'Store Order', `Actualizó estado de pedido ${orderId} a ${newStatus}`);
    addNotification({
      type: 'order',
      title: `Estado de Orden #${orderId} Actualizado`,
      message: `El pedido de la tienda cambió a estado "${newStatus.toUpperCase()}".`,
      severity: 'info',
      linkTo: 'dashboard',
    });
  };

  // Handler: Customer Checkout / POS Order
  const handlePlaceOrder = (items: { product: ProductService; qty: number }[], paymentMethod: Order['paymentMethod'], businessId: string) => {
    const biz = businesses.find(b => b.id === businessId) || businesses[0];
    const subtotal = items.reduce((sum, item) => sum + item.product.retailPrice * item.qty, 0);
    const totalAmount = items.reduce((sum, item) => {
      const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.retailPrice;
      return sum + price * item.qty;
    }, 0);
    const discount = subtotal - totalAmount;

    const newOrder: Order = {
      id: `ORD-2026-${Math.floor(Math.random() * 8999 + 1000)}`,
      businessId,
      businessName: biz.name,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      items: items.map(i => ({
        productId: i.product.id,
        title: i.product.title,
        quantity: i.qty,
        unitPrice: i.product.isPromo && i.product.promoPrice ? i.product.promoPrice : i.product.retailPrice,
        image: i.product.image,
        businessId,
      })),
      subtotal,
      discount,
      totalAmount,
      status: 'pending',
      paymentMethod,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setOrders(prev => [newOrder, ...prev]);

    setProducts(prev => prev.map(p => {
      const item = items.find(i => i.product.id === p.id);
      if (item) {
        return { ...p, stockQuantity: Math.max(0, p.stockQuantity - item.qty) };
      }
      return p;
    }));

    addAuditLog('CREATE_NEW_ORDER', biz.name, `Cliente ${currentUser.name} creó orden #${newOrder.id} por $${totalAmount.toFixed(2)}.`);
    addNotification({
      type: 'order',
      title: `Nueva Orden Registrada #${newOrder.id}`,
      message: `Cliente ${currentUser.name} realizó pedido por $${totalAmount.toFixed(2)} en ${biz.name}.`,
      severity: 'success',
      linkTo: 'dashboard',
    });
  };

  // Handler: Customer switch store context
  const handleSwitchActiveBusiness = (businessId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      activeBusinessId: businessId,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSelectRoleUser={(u) => setCurrentUser(u)}
        activeNavPage={activeNavPage}
        onNavigate={handleNavigatePage}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenLoginModal={() => setShowLoginModal(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onClearNotifications={handleClearNotifications}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-8 py-6 sm:py-10 lg:py-12 space-y-10 sm:space-y-14">
        
        {/* RENDER ACTIVE PAGE SECTION */}
        {activeNavPage === 'home' && (
          <HomeSection
            businesses={businesses}
            products={products}
            onNavigateToBusinesses={() => handleNavigatePage('businesses')}
            onOpenStoreCatalog={(biz) => setSelectedBizCatalogModal(biz)}
            onOpenLoginModal={() => setShowLoginModal(true)}
          />
        )}

        {activeNavPage === 'businesses' && (
          <RegisteredBusinessesSection
            businesses={businesses}
            products={products}
            selectedBizCatalogModal={selectedBizCatalogModal}
            onOpenStoreCatalog={(biz) => setSelectedBizCatalogModal(biz)}
            onCloseStoreCatalog={() => setSelectedBizCatalogModal(null)}
            onOpenStorefront={handleOpenStorefront}
          />
        )}

        {activeNavPage === 'about' && (
          <AboutUsSection />
        )}

        {activeNavPage === 'contact' && (
          <ContactUsSection businesses={businesses} />
        )}

        {activeNavPage === 'storefront' && selectedStorefrontBusiness && (
          <StorefrontPage
            business={selectedStorefrontBusiness}
            products={products}
            currentUser={currentUser}
            onBackToDirectory={() => handleNavigatePage('businesses')}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {activeNavPage === 'profile' && (
          <ProfileSection
            currentUser={currentUser}
            businesses={businesses}
            onUpdateProfile={handleUpdateProfile}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />
        )}

        {/* ACTIVE ROLE DASHBOARD WORKSPACE (Rendered ONLY when visiting Mi Panel) */}
        {activeNavPage === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Panel Operativo Activo: </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400 mx-1">·</span>
                  <span className="text-slate-500 dark:text-slate-400">{currentUser.name} ({currentUser.email})</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5 shadow-xs border border-rose-200 dark:border-rose-900"
                >
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>

            {/* Dynamic Dashboard View according to active user role */}
            {currentUser.role === 'superadmin' && (
              <SuperadminDashboard
                businesses={businesses}
                products={products}
                users={users}
                onUpdateBusinesses={(updatedBizs) => setBusinesses(updatedBizs)}
                onUpdateProducts={(updatedProds) => setProducts(updatedProds)}
                onUpdateUsers={(updatedUsers) => setUsers(enforceSuperadminRole(updatedUsers))}
                onUpdateBusinessStatus={handleUpdateBusinessStatus}
                onUpdateCommission={handleUpdateCommission}
                onAddBusiness={handleAddBusiness}
                onOpenStoreCatalog={(biz) => setSelectedBizCatalogModal(biz)}
                auditLogs={auditLogs}
              />
            )}

            {currentUser.role === 'business_owner' && (
              <BusinessOwnerDashboard
                business={businesses.find(b => b.id === currentUser.activeBusinessId) || businesses[0]}
                products={products}
                employees={users.filter(u => u.role === 'employee')}
                restockRecords={restockRecords}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onAddEmployee={handleAddEmployee}
              />
            )}

            {currentUser.role === 'employee' && (
              <EmployeeDashboard
                employeeUser={currentUser}
                orders={orders}
                products={products}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onPOSCreateOrder={(items, customerEmail) => handlePlaceOrder(items, 'credit_card', currentUser.activeBusinessId)}
              />
            )}

            {currentUser.role === 'customer' && (
              <CustomerDashboard
                customerUser={currentUser}
                businesses={businesses}
                products={products}
                orders={orders}
                onPlaceOrder={handlePlaceOrder}
                onSwitchActiveBusiness={handleSwitchActiveBusiness}
              />
            )}

            {currentUser.role === 'supplier' && (
              <SupplierDashboard
                supplierUser={currentUser}
                businesses={businesses}
                products={products}
                restockRecords={restockRecords}
                onAddRestock={handleAddRestock}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 sm:py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            Nexus Commerce Suite &copy; Administrado por Nexus Web Studio
          </div>
          <div>
            Contacto: nexuswebstudio2026@gmail.com · WhatsApp: 304 347 0984 · Control RBAC 5 Roles · Multi-Tienda · RLS PostgreSQL
          </div>
        </div>
      </footer>

      {/* Architecture Documentation Modal */}
      <ArchitectureDocModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />

      {/* Superadmin & Role Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        users={users}
        businesses={businesses}
        currentBusinessName={selectedStorefrontBusiness ? selectedStorefrontBusiness.name : 'Nexus Web Studio Core'}
        onLoginSuccess={(loggedInUser) => {
          setIsLoggedIn(true);
          setCurrentUser(loggedInUser);
          handleNavigatePage('home');
          addAuditLog('SUPERADMIN_AUTHENTICATION_SUCCESS', 'Jessica Paola Enterprise Core', `Autenticación exitosa en Firebase/DB para usuario ${loggedInUser.name}`);
        }}
      />

    </div>
  );
}
