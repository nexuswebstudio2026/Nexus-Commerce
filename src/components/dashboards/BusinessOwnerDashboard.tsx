import React, { useState } from 'react';
import { Business, ProductService, User, EmployeePermission, SupplierRestockRecord } from '../../types';
import { Package, Plus, Tag, Users, Shield, DollarSign, TrendingUp, Percent, CheckCircle2, AlertTriangle, Layers, Edit2, Trash2 } from 'lucide-react';

interface BusinessOwnerDashboardProps {
  business: Business;
  products: ProductService[];
  employees: User[];
  restockRecords: SupplierRestockRecord[];
  onAddProduct: (prod: Omit<ProductService, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<ProductService>) => void;
  onAddEmployee: (name: string, email: string, permissions: EmployeePermission[]) => void;
}

export const BusinessOwnerDashboard: React.FC<BusinessOwnerDashboardProps> = ({
  business,
  products,
  employees,
  restockRecords,
  onAddProduct,
  onUpdateProduct,
  onAddEmployee,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'employees' | 'inventory'>('catalog');
  
  // Modals state
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);

  // New product form
  const [prodTitle, setProdTitle] = useState('');
  const [prodType, setProdType] = useState<'product' | 'service'>('product');
  const [prodCategory, setProdCategory] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodRetailPrice, setProdRetailPrice] = useState(100);
  const [prodPromoPrice, setProdPromoPrice] = useState(85);
  const [prodIsPromo, setProdIsPromo] = useState(false);

  // New employee form
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPermissions, setEmpPermissions] = useState<EmployeePermission[]>([
    'manage_orders',
    'customer_support',
  ]);

  const bizProducts = products.filter(p => p.businessId === business.id);
  const bizRestocks = restockRecords.filter(r => r.businessId === business.id);

  const togglePermission = (perm: EmployeePermission) => {
    if (empPermissions.includes(perm)) {
      setEmpPermissions(empPermissions.filter(p => p !== perm));
    } else {
      setEmpPermissions([...empPermissions, perm]);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) return;
    onAddProduct({
      businessId: business.id,
      title: prodTitle,
      type: prodType,
      category: prodCategory || (prodType === 'product' ? 'Productos Luxury' : 'Servicios Exclusivos'),
      sku: prodSku || `SKU-${Math.floor(Math.random() * 89999 + 10000)}`,
      description: prodDesc || 'Descripción detallada del artículo.',
      retailPrice: prodRetailPrice,
      promoPrice: prodIsPromo ? prodPromoPrice : undefined,
      isPromo: prodIsPromo,
      stockQuantity: prodType === 'product' ? 10 : 99,
      supplierCost: 40.0, // Default cost until supplier updates
      image: prodType === 'product' 
        ? '/src/assets/images/luxury_perfume_bottle_1793074526785.jpg'
        : '/src/assets/images/gourmet_coffee_beans_1793074527765.jpg',
      status: 'active',
      unit: prodType === 'product' ? 'unidad' : 'sesión',
    });

    setProdTitle('');
    setProdCategory('');
    setProdSku('');
    setProdDesc('');
    setShowAddProdModal(false);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim()) return;
    onAddEmployee(empName, empEmail, empPermissions);
    setEmpName('');
    setEmpEmail('');
    setShowAddEmpModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Business Owner Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={business.logo} alt={business.name} className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/50" />
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">PANEL DE CONTROL DE NEGOCIO</div>
            <h2 className="text-2xl font-bold font-serif-luxury">{business.name}</h2>
            <p className="text-xs text-slate-300 mt-1">{business.category} · Moneda: {business.currency}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="text-xs text-slate-400">Comisión Retenida</div>
            <div className="text-sm font-bold font-mono-tabular text-amber-400">{business.commissionRate}% por venta</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>1. Catálogo Propio & Precios de Venta</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'employees'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Gestión de Empleados & Roles ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Control de Costos e Inventario Suministrado</span>
        </button>
      </div>

      {/* TAB 1: CATÁLOGO PROPIO & PRECIOS */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Catálogo de Productos y Servicios</h3>
              <p className="text-xs text-slate-500">
                El dueño gestiona los Precios de Venta y Promociones. Los Proveedores determinan el Costo de Insumo.
              </p>
            </div>
            <button
              onClick={() => setShowAddProdModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Producto o Servicio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bizProducts.map((p) => {
              const currentPrice = p.isPromo && p.promoPrice ? p.promoPrice : p.retailPrice;
              const grossMarginDollar = currentPrice - p.supplierCost;
              const grossMarginPercent = (grossMarginDollar / currentPrice) * 100;

              return (
                <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <img src={p.image} alt={p.title} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          p.type === 'product' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
                        }`}>
                          {p.type === 'product' ? 'Producto' : 'Servicio'}
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono mt-1">SKU: {p.sku}</div>
                      </div>
                    </div>

                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">{p.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    {/* Price and Promo Controls */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Precio de Venta:</span>
                      <div className="flex items-center gap-2">
                        {p.isPromo && p.promoPrice && (
                          <span className="text-xs line-through text-slate-400 font-mono-tabular">${p.retailPrice.toFixed(2)}</span>
                        )}
                        <span className="font-bold font-mono-tabular text-slate-900 dark:text-white text-sm">
                          ${currentPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Costo Proveedor:</span>
                      <span className="font-mono-tabular text-slate-600 dark:text-slate-400">${p.supplierCost.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span className="text-slate-500 font-medium">Margen Bruto Estimado:</span>
                      <span className={`font-bold font-mono-tabular ${grossMarginPercent > 35 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        +${grossMarginDollar.toFixed(2)} ({grossMarginPercent.toFixed(1)}%)
                      </span>
                    </div>

                    {/* Stock & Quick Toggle Promo */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500">Stock Actual: <strong className="text-slate-900 dark:text-white font-mono-tabular">{p.stockQuantity} {p.unit}s</strong></span>
                      <button
                        onClick={() => onUpdateProduct(p.id, { isPromo: !p.isPromo, promoPrice: p.promoPrice || p.retailPrice * 0.85 })}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                          p.isPromo 
                            ? 'bg-amber-500 text-slate-950 font-bold' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {p.isPromo ? 'Promo Activa (% OFF)' : '+ Activar Oferta'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: GESTIÓN DE EMPLEADOS */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Equipo de Trabajo y Permisos Granulares</h3>
              <p className="text-xs text-slate-500">
                Registra empleados y asigna paneles de acceso específicos según sus tareas delegadas.
              </p>
            </div>
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Empleado</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-4">Empleado</th>
                  <th className="p-4">Correo Electrónico</th>
                  <th className="p-4">Rol Delegado</th>
                  <th className="p-4">Permisos Asignados</th>
                  <th className="p-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                      <span>{emp.name}</span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">{emp.email}</td>
                    <td className="p-4 font-semibold text-amber-600 dark:text-amber-400">Empleado Operativo</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.permissions?.map((p, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px]">
                            {p.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">● Activo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTROL DE INVENTARIO Y COSTOS DE PROVEEDORES */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bitácora de Reabastecimiento de Proveedores</h3>
            <p className="text-xs text-slate-500">
              Registros en vivo cuando los proveedores registrados restockean unidades en tu catálogo y definen su precio de costo.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Proveedor</th>
                  <th className="p-4">Producto Insumo</th>
                  <th className="p-4">Unidades Agregadas</th>
                  <th className="p-4">Precio Costo Unitario</th>
                  <th className="p-4">Costo Total Lote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-tabular">
                {bizRestocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                      Aún no hay registros de restock de proveedores para esta tienda.
                    </td>
                  </tr>
                ) : (
                  bizRestocks.map((r) => (
                    <tr key={r.id}>
                      <td className="p-4 text-slate-500">{r.date}</td>
                      <td className="p-4 font-sans font-semibold text-indigo-600 dark:text-indigo-400">{r.supplierName}</td>
                      <td className="p-4 font-sans text-slate-900 dark:text-white font-medium">{r.productTitle}</td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">+{r.unitsAdded}</td>
                      <td className="p-4">${r.costPrice.toFixed(2)}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">${r.totalCost.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-serif-luxury text-slate-900 dark:text-white">Añadir al Catálogo del Negocio</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Título del Producto o Servicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Kit Esencia Floral 50ml"
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Tipo de Item</label>
                  <select
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
                  >
                    <option value="product">Producto Físico</option>
                    <option value="service">Servicio / Experiencia</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Categoría</label>
                  <input
                    type="text"
                    placeholder="Ej. Perfumería"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Precio de Venta (Retail $)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={prodRetailPrice}
                    onChange={(e) => setProdRetailPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">SKU Código</label>
                  <input
                    type="text"
                    placeholder="AUR-101"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el producto..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProdModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl"
                >
                  Publicar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-serif-luxury text-slate-900 dark:text-white">Registrar Nuevo Empleado</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Fernando Gómez"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="fernando@negocio.com"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-2">Permisos Delegados (RBAC Granular)</label>
                <div className="space-y-2 text-xs">
                  {[
                    { id: 'manage_orders', label: 'Procesar Pedidos & POS Terminal' },
                    { id: 'customer_support', label: 'Atención al Cliente' },
                    { id: 'manage_catalog', label: 'Editar Precios & Catálogo' },
                    { id: 'view_analytics', label: 'Ver Reportes de Ventas' },
                  ].map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={empPermissions.includes(perm.id as any)}
                        onChange={() => togglePermission(perm.id as any)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl"
                >
                  Crear Credenciales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
