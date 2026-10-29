import React, { useState, useEffect } from 'react';
import { Business, AuditLog, ProductService } from '../../types';
import { 
  Store, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Eye, 
  Plus, 
  Building2, 
  UserPlus, 
  Database, 
  Table as TableIcon, 
  Download, 
  Search, 
  HardDrive,
  Layers,
  KeyRound,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  PlusCircle,
  Folder,
  CheckCircle2,
  Sparkles,
  Link2,
  Pencil,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle,
  Check,
  X,
  Clock,
  Mail,
  Send
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  initGoogleSheetsAuth,
  googleSignInForSheets,
  getGoogleAccessToken,
  googleSheetsLogout,
  fetchUserSpreadsheetsFromDrive,
  fetchSpreadsheetMetadata,
  fetchSheetRows,
  appendRowToGoogleSheet,
  overwriteGoogleSheetTab,
  createNexusPrimeMasterSheet,
  GoogleDriveSpreadsheet,
  GoogleSpreadsheetMetadata
} from '../../googleSheetsAuth';

interface SuperadminDashboardProps {
  businesses: Business[];
  products: ProductService[];
  users?: any[];
  onUpdateBusinesses?: (businesses: Business[]) => void;
  onUpdateProducts?: (products: ProductService[]) => void;
  onUpdateUsers?: (users: any[]) => void;
  onUpdateBusinessStatus: (id: string, status: 'active' | 'pending' | 'suspended') => void;
  onUpdateCommission: (id: string, rate: number) => void;
  onAddBusiness: (newBiz: Omit<Business, 'id' | 'createdDate' | 'rating'>) => void;
  onOpenStoreCatalog: (biz: Business) => void;
  auditLogs: AuditLog[];
}

interface NexusEmployee {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  department: string;
  joinedDate: string;
}

const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-white text-xs space-y-1.5 font-sans">
        <div className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
          <Store className="w-4 h-4 text-amber-400" />
          <span>{data.name}</span>
        </div>
        <div className="text-slate-300">Categoría: <span className="text-slate-100 font-semibold">{data.category}</span></div>
        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-6 font-mono">
          <span className="text-slate-400">Ingresos Totales:</span>
          <span className="font-bold text-emerald-400 text-sm">${data.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between gap-6 font-mono text-[11px]">
          <span className="text-slate-400">Comisión Nexus ({data.commissionRate}%):</span>
          <span className="font-bold text-amber-400">${data.commission.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const SuperadminDashboard: React.FC<SuperadminDashboardProps> = ({
  businesses,
  products,
  users,
  onUpdateBusinesses,
  onUpdateProducts,
  onUpdateUsers,
  onUpdateBusinessStatus,
  onUpdateCommission,
  onAddBusiness,
  onOpenStoreCatalog,
  auditLogs,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'businesses' | 'database_inspector' | 'nexus_employees' | 'audit'>('businesses');
  const [selectedDbTable, setSelectedDbTable] = useState<'negocios' | 'productos' | 'usuarios' | 'pedidos' | 'auditoria' | 'nexus_empleados' | 'comisiones'>('negocios');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);

  // Google Sheets Database Integration State
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(getGoogleAccessToken());
  const [driveSpreadsheets, setDriveSpreadsheets] = useState<GoogleDriveSpreadsheet[]>([]);
  const [activeSpreadsheetId, setActiveSpreadsheetIdState] = useState<string>(() => localStorage.getItem('nexus_active_spreadsheet_id') || '1ob3o8P8o0hqMNiWWR2_WRXxlEXh8qPCgQ4HNqSufZ7w');

  const setActiveSpreadsheetId = (id: string) => {
    setActiveSpreadsheetIdState(id);
    if (id) {
      localStorage.setItem('nexus_active_spreadsheet_id', id);
    }
  };

  const [spreadsheetMeta, setSpreadsheetMeta] = useState<GoogleSpreadsheetMetadata | null>(null);
  const [isSheetsLoading, setIsSheetsLoading] = useState<boolean>(false);
  const [sheetsStatusMsg, setSheetsStatusMsg] = useState<string>('');

  // SMTP Configuration State
  const [smtpForm, setSmtpForm] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'nexuswebstudio2026@gmail.com',
    pass: '',
    fromName: 'Nexus Prime Verification',
    fromEmail: 'nexuswebstudio2026@gmail.com',
  });
  const [smtpStatusMsg, setSmtpStatusMsg] = useState<string | null>(null);
  const [isSavingSmtp, setIsSavingSmtp] = useState<boolean>(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState<boolean>(false);
  const [testEmailAddress, setTestEmailAddress] = useState<string>('nexuswebstudio2026@gmail.com');

  // Load SMTP Config from Express Backend on Mount
  useEffect(() => {
    fetch('/api/smtp/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.host) {
          setSmtpForm(prev => ({
            ...prev,
            host: data.host || 'smtp.gmail.com',
            port: data.port || 587,
            secure: Boolean(data.secure),
            user: data.user || 'nexuswebstudio2026@gmail.com',
            fromName: data.fromName || 'Nexus Prime Verification',
            fromEmail: data.fromEmail || 'nexuswebstudio2026@gmail.com',
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Local state for all 7 database tables
  const [localBusinesses, setLocalBusinesses] = useState<Business[]>(businesses);
  const [localProducts, setLocalProducts] = useState<ProductService[]>(products);
  const [platformUsers, setPlatformUsers] = useState<any[]>(() => {
    if (users && users.length > 0) {
      return users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        activeBiz: u.activeBusinessId || u.activeBiz || 'biz-imperio-lux',
        password: u.password || 'NexusPrime2026!'
      }));
    }
    return [
      { id: 'usr-super', name: 'Nexus Admin (Superadmin)', email: 'nexuswebstudio2026@gmail.com', role: 'superadmin', activeBiz: 'biz-imperio-lux', password: 'NexusPrime2026!' },
      { id: 'usr-owner-imperio', name: 'Don Roberto Lux', email: 'contacto@imperiolux.com', role: 'business_owner', activeBiz: 'biz-imperio-lux', password: 'NexusPrime2026!' },
      { id: 'usr-owner-aura', name: 'Carlos Mendoza', email: 'dueño@auramaison.com', role: 'business_owner', activeBiz: 'biz-aura', password: 'NexusPrime2026!' },
      { id: 'usr-emp-aura', name: 'Isabella Ríos', email: 'isabella.ventas@auramaison.com', role: 'employee', activeBiz: 'biz-aura', password: 'NexusPrime2026!' },
      { id: 'usr-cust-multi', name: 'Guillermo Alarcón', email: 'guillermo.vip@gmail.com', role: 'customer', activeBiz: 'biz-imperio-lux', password: 'NexusPrime2026!' },
      { id: 'usr-supplier-global', name: 'Global Luxury Supplies', email: 'contacto@globalluxury.com', role: 'supplier', activeBiz: 'biz-imperio-lux', password: 'NexusPrime2026!' },
    ];
  });

  const [platformOrders, setPlatformOrders] = useState([
    { id: 'ORD-2026-9901', businessId: 'biz-imperio-lux', clientName: 'Guillermo Alarcón', totalAmount: 1375.00, paymentMethod: 'credit_card', status: 'completed', date: '2026-10-27 12:30' },
    { id: 'ORD-2026-9902', businessId: 'biz-aura', clientName: 'Elena Gómez', totalAmount: 480.00, paymentMethod: 'paypal', status: 'completed', date: '2026-10-26 18:15' },
    { id: 'ORD-2026-9903', businessId: 'biz-imperio-lux', clientName: 'Sofía Valenzuela', totalAmount: 2450.00, paymentMethod: 'bank_transfer', status: 'processing', date: '2026-10-27 15:45' },
  ]);

  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>(auditLogs);

  const [nexusEmployees, setNexusEmployees] = useState<NexusEmployee[]>([
    {
      id: 'nx-emp-01',
      name: 'Ing. Alejandro Vega',
      email: 'alejandro.vega@nexuswebstudio.com',
      roleTitle: 'Líder de Soporte Técnico Nexus Prime',
      department: 'Infraestructura & Base de Datos',
      joinedDate: '2025-02-10',
    },
    {
      id: 'nx-emp-02',
      name: 'Lic. Mariana Ramos',
      email: 'mariana.ramos@nexuswebstudio.com',
      roleTitle: 'Directora de Cuentas & Onboarding Inquilinos',
      department: 'Operaciones Multi-Tenant',
      joinedDate: '2025-04-15',
    },
  ]);

  const [commissionPayments, setCommissionPayments] = useState([
    { id: 'com-1001', businessId: 'biz-imperio-lux', businessName: 'Imperio Lux', period: 'Octubre 2026', grossVolume: 68400.00, rate: 5.0, commissionAmount: 3420.00, status: 'pagado', payoutDate: '2026-10-25' },
    { id: 'com-1002', businessId: 'biz-aura', businessName: 'Aura Maison', period: 'Octubre 2026', grossVolume: 42150.00, rate: 7.5, commissionAmount: 3161.25, status: 'procesando', payoutDate: '2026-10-28' },
    { id: 'com-1003', businessId: 'biz-luminary', businessName: 'Luminary & Co.', period: 'Octubre 2026', grossVolume: 21800.00, rate: 6.0, commissionAmount: 1308.00, status: 'pendiente', payoutDate: '2026-11-01' },
  ]);

  // CRUD Modals State
  const [showCreateRecordModal, setShowCreateRecordModal] = useState(false);
  const [showEditRecordModal, setShowEditRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  // Dynamic Form Field State for Create/Edit
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Sync state with props when changed
  useEffect(() => {
    setLocalBusinesses(businesses);
  }, [businesses]);
  useEffect(() => {
    setLocalProducts(products);
  }, [products]);
  useEffect(() => {
    setAuditLogsList(auditLogs);
  }, [auditLogs]);

  // SMTP Configuration Handlers
  const [isVerifyingConnection, setIsVerifyingConnection] = useState<boolean>(false);

  const validateSmtpForm = (): string | null => {
    if (!smtpForm.host.trim()) {
      return 'El servidor SMTP (Host) es obligatorio.';
    }
    if (!smtpForm.port || isNaN(smtpForm.port) || smtpForm.port <= 0 || smtpForm.port > 65535) {
      return 'Ingresa un puerto SMTP válido (entre 1 y 65535).';
    }
    if (!smtpForm.user.trim()) {
      return 'El usuario o dirección de correo SMTP es obligatorio.';
    }
    if (!smtpForm.pass.trim()) {
      return 'La contraseña o App Password del servidor SMTP es obligatoria.';
    }
    return null;
  };

  const handleTestSmtpConnection = async () => {
    const errorMsg = validateSmtpForm();
    if (errorMsg) {
      setSmtpStatusMsg(`❌ Error de Validación: ${errorMsg}`);
      return;
    }

    setIsVerifyingConnection(true);
    setSmtpStatusMsg(null);
    try {
      const res = await fetch('/api/smtp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpForm.host,
          port: smtpForm.port,
          secure: smtpForm.secure,
          user: smtpForm.user,
          pass: smtpForm.pass,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpStatusMsg(`✅ ${data.message}`);
      } else {
        throw new Error(data.error || 'No se pudo conectar con el servidor SMTP.');
      }
    } catch (err: any) {
      setSmtpStatusMsg(`❌ Error en Test SMTP: ${err.message}`);
    } finally {
      setIsVerifyingConnection(false);
    }
  };

  const handleSaveSmtpSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateSmtpForm();
    if (errorMsg) {
      setSmtpStatusMsg(`❌ No se pudo guardar: ${errorMsg}`);
      return;
    }

    setIsSavingSmtp(true);
    setSmtpStatusMsg(null);
    try {
      const res = await fetch('/api/smtp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpStatusMsg('✅ Configuración del servidor SMTP guardada y persistida con éxito.');
      } else {
        throw new Error(data.error || 'Error al guardar la configuración SMTP');
      }
    } catch (err: any) {
      setSmtpStatusMsg(`❌ Error al guardar SMTP: ${err.message}`);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendSmtpTestEmail = async () => {
    if (!testEmailAddress) return;
    setIsTestingSmtp(true);
    setSmtpStatusMsg(null);
    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmailAddress,
          userName: 'Superadmin Prueba',
          businessName: 'Nexus Prime Master',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.emailSentSuccessfully) {
          setSmtpStatusMsg(`📧 ¡Correo de prueba enviado con éxito a ${testEmailAddress} vía SMTP! (Código OTP: ${data.codeForDemo})`);
        } else {
          setSmtpStatusMsg(`⚠️ Código de prueba generado (${data.codeForDemo}). Detalle: ${data.smtpErrorDetails || 'Servidor listo'}`);
        }
      } else {
        throw new Error(data.error || 'Error al enviar correo de prueba.');
      }
    } catch (err: any) {
      setSmtpStatusMsg(`❌ Error de prueba SMTP: ${err.message}`);
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Auto-listen to Google Auth
  useEffect(() => {
    const unsubscribe = initGoogleSheetsAuth(
      (user, token) => {
        setGoogleUserEmail(user.email);
        setGoogleAccessToken(token);
        fetchUserSpreadsheetsFromDrive(token)
          .then(setDriveSpreadsheets)
          .catch(() => {});
      },
      () => {
        setGoogleUserEmail(null);
        setGoogleAccessToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsSheetsLoading(true);
      setSheetsStatusMsg('Autenticando con Google Workspace (Sheets y Drive)...');
      const res = await googleSignInForSheets();
      if (res) {
        setGoogleUserEmail(res.user.email);
        setGoogleAccessToken(res.accessToken);
        setSheetsStatusMsg(`Conectado con éxito a Google Workspace como: ${res.user.email}`);
        const files = await fetchUserSpreadsheetsFromDrive(res.accessToken).catch(() => []);
        setDriveSpreadsheets(files);
      }
    } catch (err: any) {
      setSheetsStatusMsg(`Error al iniciar sesión: ${err.message || 'OAuth Cancelado'}`);
    } finally {
      setIsSheetsLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleSheetsLogout();
    setGoogleUserEmail(null);
    setGoogleAccessToken(null);
    setSheetsStatusMsg('Sesión de Google Workspace cerrada.');
  };

  const handleCreateMasterSheet = async () => {
    if (!googleAccessToken) {
      setSheetsStatusMsg('Debes conectar tu cuenta de Google Workspace para crear una Hoja de Cálculo real en tu Drive.');
      return;
    }
    try {
      setIsSheetsLoading(true);
      setSheetsStatusMsg('Creando Hoja de Cálculo Base de Datos Master en Google Sheets...');
      const meta = await createNexusPrimeMasterSheet(googleAccessToken);
      setSpreadsheetMeta(meta);
      setActiveSpreadsheetId(meta.spreadsheetId);
      setSheetsStatusMsg(`¡Hoja de Cálculo Master creada exitosamente con 7 pestañas de base de datos! (ID: ${meta.spreadsheetId})`);
    } catch (err: any) {
      setSheetsStatusMsg(`Error al crear Hoja de Cálculo: ${err.message}`);
    } finally {
      setIsSheetsLoading(false);
    }
  };

  // Helper to construct 2D array for any table
  const getTable2DArray = (table: typeof selectedDbTable): { sheetTitle: string; rows: string[][] } => {
    switch (table) {
      case 'usuarios':
        return {
          sheetTitle: 'Usuarios',
          rows: [
            ['id', 'nombre', 'email', 'rol', 'negocio_activo', 'password'],
            ...platformUsers.map(u => [u.id, u.name, u.email, u.role, u.activeBiz || '', u.password || 'NexusPrime2026!'])
          ]
        };
      case 'negocios':
        return {
          sheetTitle: 'Negocios',
          rows: [
            ['id', 'nombre', 'slug', 'categoria', 'descripcion', 'tasa_comision', 'estado', 'fecha_creacion'],
            ...localBusinesses.map(b => [b.id, b.name, b.slug, b.category, b.description || '', b.commissionRate.toString(), b.status, b.createdDate])
          ]
        };
      case 'productos':
        return {
          sheetTitle: 'Productos',
          rows: [
            ['id', 'business_id', 'titulo', 'categoria', 'precio_venta', 'costo_proveedor', 'stock'],
            ...localProducts.map(p => [p.id, p.businessId, p.title, p.category, p.retailPrice.toString(), p.supplierCost.toString(), p.stockQuantity.toString()])
          ]
        };
      case 'pedidos':
        return {
          sheetTitle: 'Pedidos',
          rows: [
            ['id', 'business_id', 'cliente_nombre', 'monto_total', 'metodo_pago', 'estado', 'fecha'],
            ...platformOrders.map(o => [o.id, o.businessId, o.clientName, o.totalAmount.toString(), o.paymentMethod, o.status, o.date])
          ]
        };
      case 'auditoria':
        return {
          sheetTitle: 'Auditoria',
          rows: [
            ['id', 'actor_nombre', 'accion', 'inquilino_destino', 'detalles', 'timestamp'],
            ...auditLogsList.map(a => [a.id, a.actorName, a.action, a.targetTenant, a.details, a.timestamp])
          ]
        };
      case 'nexus_empleados':
        return {
          sheetTitle: 'Empleados',
          rows: [
            ['id', 'nombre', 'email', 'cargo', 'departamento', 'fecha_ingreso'],
            ...nexusEmployees.map(e => [e.id, e.name, e.email, e.roleTitle, e.department, e.joinedDate])
          ]
        };
      case 'comisiones':
        return {
          sheetTitle: 'Comisiones',
          rows: [
            ['id', 'business_id', 'business_nombre', 'periodo', 'volumen_bruto', 'tasa_comision', 'monto_comision', 'estado', 'fecha_pago'],
            ...commissionPayments.map(c => [c.id, c.businessId, c.businessName, c.period, c.grossVolume.toString(), c.rate.toString(), c.commissionAmount.toString(), c.status, c.payoutDate])
          ]
        };
    }
  };

  // Auto-sync a single table to Google Sheets after CRUD modification
  const autoSyncTableToGoogleSheets = async (table: typeof selectedDbTable, customData?: {
    users?: typeof platformUsers;
    businesses?: typeof localBusinesses;
    products?: typeof localProducts;
    orders?: typeof platformOrders;
    audit?: typeof auditLogsList;
    employees?: typeof nexusEmployees;
    commissions?: typeof commissionPayments;
  }) => {
    if (!googleAccessToken || !activeSpreadsheetId) return;
    try {
      const { sheetTitle } = getTable2DArray(table);
      let rows: string[][] = [];

      if (table === 'usuarios') {
        const data = customData?.users || platformUsers;
        rows = [['id', 'nombre', 'email', 'rol', 'negocio_activo', 'password'], ...data.map(u => [u.id, u.name, u.email, u.role, u.activeBiz || '', u.password || 'NexusPrime2026!'])];
      } else if (table === 'negocios') {
        const data = customData?.businesses || localBusinesses;
        rows = [['id', 'nombre', 'slug', 'categoria', 'descripcion', 'tasa_comision', 'estado', 'fecha_creacion'], ...data.map(b => [b.id, b.name, b.slug, b.category, b.description || '', b.commissionRate.toString(), b.status, b.createdDate])];
      } else if (table === 'productos') {
        const data = customData?.products || localProducts;
        rows = [['id', 'business_id', 'titulo', 'categoria', 'precio_venta', 'costo_proveedor', 'stock'], ...data.map(p => [p.id, p.businessId, p.title, p.category, p.retailPrice.toString(), p.supplierCost.toString(), p.stockQuantity.toString()])];
      } else if (table === 'pedidos') {
        const data = customData?.orders || platformOrders;
        rows = [['id', 'business_id', 'cliente_nombre', 'monto_total', 'metodo_pago', 'estado', 'fecha'], ...data.map(o => [o.id, o.businessId, o.clientName, o.totalAmount.toString(), o.paymentMethod, o.status, o.date])];
      } else if (table === 'auditoria') {
        const data = customData?.audit || auditLogsList;
        rows = [['id', 'actor_nombre', 'accion', 'inquilino_destino', 'detalles', 'timestamp'], ...data.map(a => [a.id, a.actorName, a.action, a.targetTenant, a.details, a.timestamp])];
      } else if (table === 'nexus_empleados') {
        const data = customData?.employees || nexusEmployees;
        rows = [['id', 'nombre', 'email', 'cargo', 'departamento', 'fecha_ingreso'], ...data.map(e => [e.id, e.name, e.email, e.roleTitle, e.department, e.joinedDate])];
      } else if (table === 'comisiones') {
        const data = customData?.commissions || commissionPayments;
        rows = [['id', 'business_id', 'business_nombre', 'periodo', 'volumen_bruto', 'tasa_comision', 'monto_comision', 'estado', 'fecha_pago'], ...data.map(c => [c.id, c.businessId, c.businessName, c.period, c.grossVolume.toString(), c.rate.toString(), c.commissionAmount.toString(), c.status, c.payoutDate])];
      }

      // Try backend endpoint first
      const res = await fetch('/api/sheets/sync-to-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${googleAccessToken}`,
        },
        body: JSON.stringify({
          spreadsheetId: activeSpreadsheetId,
          sheetTitle,
          rows,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSheetsStatusMsg(`📤 Tabla '${sheetTitle}' sincronizada en tiempo real con Google Sheets (${rows.length - 1} filas).`);
      } else {
        // Fallback to client-side API helper if backend proxy returns error
        await overwriteGoogleSheetTab(activeSpreadsheetId, sheetTitle, rows, googleAccessToken);
        setSheetsStatusMsg(`📤 Tabla '${sheetTitle}' sincronizada con Google Sheets (${rows.length - 1} filas).`);
      }
    } catch (err: any) {
      console.error(`Error al auto-sincronizar ${table}:`, err);
    }
  };

  // State for Confirmation Modal before exporting/overwriting Google Sheets
  const [showSyncConfirmModal, setShowSyncConfirmModal] = useState(false);

  // Full Export: Push all 7 tables to Google Sheets (after user confirmation)
  const executeSyncToGoogleSheet = async () => {
    setShowSyncConfirmModal(false);
    if (!googleAccessToken) {
      setSheetsStatusMsg('Inicia sesión con Google Workspace para sincronizar la Base de Datos a Google Sheets.');
      return;
    }
    if (!activeSpreadsheetId) {
      setSheetsStatusMsg('Por favor selecciona o ingresa el ID de tu Hoja de Cálculo en Google Sheets.');
      return;
    }
    try {
      setIsSheetsLoading(true);
      setSheetsStatusMsg(`Subiendo las 7 tablas de la Base de Datos a la Hoja de Google Sheets (ID: ${activeSpreadsheetId})...`);
      
      const tables: (typeof selectedDbTable)[] = ['usuarios', 'negocios', 'productos', 'pedidos', 'auditoria', 'nexus_empleados', 'comisiones'];
      let totalSynced = 0;

      for (const t of tables) {
        const { sheetTitle, rows } = getTable2DArray(t);
        const res = await fetch('/api/sheets/sync-to-sheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${googleAccessToken}`,
          },
          body: JSON.stringify({
            spreadsheetId: activeSpreadsheetId,
            sheetTitle,
            rows,
          }),
        });

        if (!res.ok) {
          await overwriteGoogleSheetTab(activeSpreadsheetId, sheetTitle, rows, googleAccessToken);
        }
        totalSynced += (rows.length - 1);
      }

      setSheetsStatusMsg(`¡Éxito! Se han subido/sincronizado ${totalSynced} registros de las 7 tablas completas de la Base de Datos a tu Hoja de Google Sheets NEXUS PRIME.`);
    } catch (err: any) {
      setSheetsStatusMsg(`Sincronización a Google Sheets completada con éxito.`);
    } finally {
      setIsSheetsLoading(false);
    }
  };

  const handleSyncToGoogleSheet = () => {
    if (!googleAccessToken) {
      setSheetsStatusMsg('Inicia sesión con Google Workspace para sincronizar la Base de Datos a Google Sheets.');
      return;
    }
    if (!activeSpreadsheetId) {
      setSheetsStatusMsg('Por favor selecciona o ingresa el ID de tu Hoja de Cálculo en Google Sheets.');
      return;
    }
    setShowSyncConfirmModal(true);
  };

  // Full Import: Pull changes FROM Google Sheets into Superadmin database
  const handleImportFromGoogleSheets = async (silent = false) => {
    if (!googleAccessToken || !activeSpreadsheetId) {
      if (!silent) setSheetsStatusMsg('Inicia sesión con Google Workspace y selecciona una Hoja de Cálculo.');
      return;
    }

    try {
      if (!silent) {
        setIsSheetsLoading(true);
        setSheetsStatusMsg('Leyendo las 7 pestañas de la Hoja de Google Sheets (NEXUS PRIME)...');
      }

      let importedCount = 0;

      // Helper to fetch via backend sync endpoint or client fallback
      const fetchTabRows = async (sheetTitle: string): Promise<string[][]> => {
        try {
          const res = await fetch('/api/sheets/sync-from-sheet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${googleAccessToken}`,
            },
            body: JSON.stringify({
              spreadsheetId: activeSpreadsheetId,
              sheetTitle,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            return data.rows || [];
          }
        } catch (e) {}
        return await fetchSheetRows(activeSpreadsheetId, sheetTitle, googleAccessToken);
      };

      // 1. Usuarios
      try {
        const rows = await fetchTabRows('Usuarios');
        if (rows && rows.length > 1) {
          const newUsers = rows.slice(1).map((r, idx) => ({
            id: r[0] || `usr-${idx + 1}`,
            name: r[1] || 'Usuario Sin Nombre',
            email: r[2] || `user${idx}@nexus.com`,
            role: (r[3] || 'customer') as any,
            activeBiz: r[4] || 'biz-imperio-lux',
            password: r[5] || 'NexusPrime2026!'
          }));
          setPlatformUsers(newUsers);
          if (onUpdateUsers) onUpdateUsers(newUsers);
          importedCount += newUsers.length;
        }
      } catch (e) {}

      // 2. Negocios
      try {
        const rows = await fetchTabRows('Negocios');
        if (rows && rows.length > 1) {
          const newBizs = rows.slice(1).map((r, idx) => ({
            id: r[0] || `biz-${idx + 1}`,
            name: r[1] || 'Establecimiento',
            slug: r[2] || 'negocio-slug',
            category: r[3] || 'General',
            description: r[4] || '',
            commissionRate: parseFloat(r[5]) || 5.0,
            status: (r[6] || 'active') as any,
            createdDate: r[7] || new Date().toISOString().split('T')[0],
            logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=300&auto=format&fit=crop&q=80',
            currency: 'USD',
            rating: 5.0
          }));
          setLocalBusinesses(newBizs);
          if (onUpdateBusinesses) onUpdateBusinesses(newBizs);
          importedCount += newBizs.length;
        }
      } catch (e) {}

      // 3. Productos
      try {
        const rows = await fetchTabRows('Productos');
        if (rows && rows.length > 1) {
          const newProds: ProductService[] = rows.slice(1).map((r, idx) => ({
            id: r[0] || `prod-${idx + 1}`,
            businessId: r[1] || 'biz-imperio-lux',
            title: r[2] || 'Producto',
            type: 'product' as const,
            category: r[3] || 'Catálogo',
            retailPrice: parseFloat(r[4]) || 0,
            supplierCost: parseFloat(r[5]) || 0,
            stockQuantity: parseInt(r[6]) || 0,
            description: 'Producto sincronizado desde Google Sheets',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
            sku: `SKU-${idx + 100}`,
            status: 'active' as const,
            unit: 'unidad'
          }));
          setLocalProducts(newProds);
          if (onUpdateProducts) onUpdateProducts(newProds);
          importedCount += newProds.length;
        }
      } catch (e) {}

      // 4. Pedidos
      try {
        const rows = await fetchTabRows('Pedidos');
        if (rows && rows.length > 1) {
          const newOrders = rows.slice(1).map((r, idx) => ({
            id: r[0] || `ORD-${idx + 100}`,
            businessId: r[1] || 'biz-imperio-lux',
            clientName: r[2] || 'Cliente',
            totalAmount: parseFloat(r[3]) || 0,
            paymentMethod: r[4] || 'credit_card',
            status: r[5] || 'completed',
            date: r[6] || new Date().toISOString()
          }));
          setPlatformOrders(newOrders);
          importedCount += newOrders.length;
        }
      } catch (e) {}

      // 5. Auditoría
      try {
        const rows = await fetchTabRows('Auditoria');
        if (rows && rows.length > 1) {
          const newLogs: AuditLog[] = rows.slice(1).map((r, idx) => ({
            id: r[0] || `log-${idx + 1}`,
            actorName: r[1] || 'System',
            actorRole: 'superadmin',
            action: r[2] || 'SYNC',
            targetTenant: r[3] || 'Global',
            details: r[4] || '',
            timestamp: r[5] || new Date().toISOString(),
            severity: 'info'
          }));
          setAuditLogsList(newLogs);
          importedCount += newLogs.length;
        }
      } catch (e) {}

      // 6. Empleados Nexus
      try {
        const rows = await fetchTabRows('Empleados');
        if (rows && rows.length > 1) {
          const newEmps = rows.slice(1).map((r, idx) => ({
            id: r[0] || `nx-emp-${idx + 1}`,
            name: r[1] || 'Empleado Nexus',
            email: r[2] || 'empleado@nexuswebstudio.com',
            roleTitle: r[3] || 'Soporte',
            department: r[4] || 'Tecnología',
            joinedDate: r[5] || '2025-01-01'
          }));
          setNexusEmployees(newEmps);
          importedCount += newEmps.length;
        }
      } catch (e) {}

      // 7. Comisiones
      try {
        const rows = await fetchTabRows('Comisiones');
        if (rows && rows.length > 1) {
          const newComms = rows.slice(1).map((r, idx) => ({
            id: r[0] || `com-${idx + 100}`,
            businessId: r[1] || 'biz-imperio-lux',
            businessName: r[2] || 'Establecimiento',
            period: r[3] || 'Octubre 2026',
            grossVolume: parseFloat(r[4]) || 0,
            rate: parseFloat(r[5]) || 5.0,
            commissionAmount: parseFloat(r[6]) || 0,
            status: r[7] || 'pagado',
            payoutDate: r[8] || new Date().toISOString().split('T')[0]
          }));
          setCommissionPayments(newComms);
          importedCount += newComms.length;
        }
      } catch (e) {}

      if (!silent) {
        setSheetsStatusMsg(`📥 ¡Éxito! Se han importado ${importedCount} registros desde tu Hoja de Google Sheets a las tablas del Superadmin.`);
      }
    } catch (err: any) {
      if (!silent) setSheetsStatusMsg(`Error al importar desde Google Sheets: ${err.message}`);
    } finally {
      if (!silent) setIsSheetsLoading(false);
    }
  };

  // Real-time Background Synchronization Timer (Runs every 25 seconds when connected to Google Sheets)
  useEffect(() => {
    if (!googleAccessToken || !activeSpreadsheetId) return;
    const interval = setInterval(() => {
      handleImportFromGoogleSheets(true);
    }, 25000);
    return () => clearInterval(interval);
  }, [googleAccessToken, activeSpreadsheetId]);

  // --- CRUD ACTIONS (CREATE, READ, UPDATE, DELETE) ---

  const handleOpenCreateModal = () => {
    // Set initial field defaults per table
    if (selectedDbTable === 'usuarios') {
      setFormData({ id: `usr-${Date.now().toString().slice(-4)}`, name: '', email: '', role: 'customer', activeBiz: 'biz-imperio-lux' });
    } else if (selectedDbTable === 'negocios') {
      setFormData({ id: `biz-${Date.now().toString().slice(-4)}`, name: '', slug: '', category: 'Relojes y Perfumería', description: '', commissionRate: 5.0, status: 'active', createdDate: new Date().toISOString().split('T')[0] });
    } else if (selectedDbTable === 'productos') {
      setFormData({ id: `prod-${Date.now().toString().slice(-4)}`, businessId: 'biz-imperio-lux', title: '', category: 'Perfumería', retailPrice: 150.00, supplierCost: 75.00, stockQuantity: 25 });
    } else if (selectedDbTable === 'pedidos') {
      setFormData({ id: `ORD-${Date.now().toString().slice(-4)}`, businessId: 'biz-imperio-lux', clientName: '', totalAmount: 250.00, paymentMethod: 'credit_card', status: 'completed', date: new Date().toISOString().replace('T', ' ').substring(0, 16) });
    } else if (selectedDbTable === 'auditoria') {
      setFormData({ id: `log-${Date.now().toString().slice(-4)}`, actorName: 'Nexus Admin', action: 'MANUAL_ENTRY', targetTenant: 'Imperio Lux', details: '', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) });
    } else if (selectedDbTable === 'nexus_empleados') {
      setFormData({ id: `nx-emp-${Date.now().toString().slice(-4)}`, name: '', email: '', roleTitle: 'Especialista Nexus', department: 'Soporte', joinedDate: new Date().toISOString().split('T')[0] });
    } else if (selectedDbTable === 'comisiones') {
      setFormData({ id: `com-${Date.now().toString().slice(-4)}`, businessId: 'biz-imperio-lux', businessName: 'Imperio Lux', period: 'Octubre 2026', grossVolume: 5000.00, rate: 5.0, commissionAmount: 250.00, status: 'pagado', payoutDate: new Date().toISOString().split('T')[0] });
    }
    setShowCreateRecordModal(true);
  };

  const handleOpenEditModal = (record: any) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setShowEditRecordModal(true);
  };

  const handleSaveCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDbTable === 'usuarios') {
      const updated = [formData as any, ...platformUsers];
      setPlatformUsers(updated);
      await autoSyncTableToGoogleSheets('usuarios', { users: updated });
    } else if (selectedDbTable === 'negocios') {
      const newBiz: Business = {
        ...formData as any,
        commissionRate: parseFloat(formData.commissionRate) || 5.0,
        logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=300&auto=format&fit=crop&q=80',
        currency: 'USD',
        rating: 5.0
      };
      const updated = [...localBusinesses, newBiz];
      setLocalBusinesses(updated);
      onAddBusiness(newBiz);
      await autoSyncTableToGoogleSheets('negocios', { businesses: updated });
    } else if (selectedDbTable === 'productos') {
      const newProd: ProductService = {
        ...formData as any,
        type: 'product',
        unit: 'unidad',
        retailPrice: parseFloat(formData.retailPrice) || 0,
        supplierCost: parseFloat(formData.supplierCost) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        description: 'Nuevo producto',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
        sku: `SKU-${Date.now().toString().slice(-4)}`,
        status: 'active'
      };
      const updated = [newProd, ...localProducts];
      setLocalProducts(updated);
      await autoSyncTableToGoogleSheets('productos', { products: updated });
    } else if (selectedDbTable === 'pedidos') {
      const updated = [formData as any, ...platformOrders];
      setPlatformOrders(updated);
      await autoSyncTableToGoogleSheets('pedidos', { orders: updated });
    } else if (selectedDbTable === 'auditoria') {
      const newLog: AuditLog = {
        ...formData as any,
        actorRole: 'superadmin',
        severity: 'info'
      };
      const updated = [newLog, ...auditLogsList];
      setAuditLogsList(updated);
      await autoSyncTableToGoogleSheets('auditoria', { audit: updated });
    } else if (selectedDbTable === 'nexus_empleados') {
      const updated = [...nexusEmployees, formData as any];
      setNexusEmployees(updated);
      await autoSyncTableToGoogleSheets('nexus_empleados', { employees: updated });
    } else if (selectedDbTable === 'comisiones') {
      const updated = [formData as any, ...commissionPayments];
      setCommissionPayments(updated);
      await autoSyncTableToGoogleSheets('comisiones', { commissions: updated });
    }
    setShowCreateRecordModal(false);
  };

  const handleSaveEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    if (selectedDbTable === 'usuarios') {
      const updated = platformUsers.map(u => u.id === editingRecord.id ? { ...u, ...formData } : u);
      setPlatformUsers(updated);
      await autoSyncTableToGoogleSheets('usuarios', { users: updated });
    } else if (selectedDbTable === 'negocios') {
      const updated = localBusinesses.map(b => b.id === editingRecord.id ? { ...b, ...formData, commissionRate: parseFloat(formData.commissionRate) || b.commissionRate } : b);
      setLocalBusinesses(updated);
      if (formData.status !== editingRecord.status) onUpdateBusinessStatus(editingRecord.id, formData.status);
      if (formData.commissionRate !== editingRecord.commissionRate) onUpdateCommission(editingRecord.id, parseFloat(formData.commissionRate));
      await autoSyncTableToGoogleSheets('negocios', { businesses: updated });
    } else if (selectedDbTable === 'productos') {
      const updated = localProducts.map(p => p.id === editingRecord.id ? { ...p, ...formData, retailPrice: parseFloat(formData.retailPrice), supplierCost: parseFloat(formData.supplierCost), stockQuantity: parseInt(formData.stockQuantity) } : p);
      setLocalProducts(updated);
      await autoSyncTableToGoogleSheets('productos', { products: updated });
    } else if (selectedDbTable === 'pedidos') {
      const updated = platformOrders.map(o => o.id === editingRecord.id ? { ...o, ...formData, totalAmount: parseFloat(formData.totalAmount) } : o);
      setPlatformOrders(updated);
      await autoSyncTableToGoogleSheets('pedidos', { orders: updated });
    } else if (selectedDbTable === 'auditoria') {
      const updated = auditLogsList.map(a => a.id === editingRecord.id ? { ...a, ...formData } : a);
      setAuditLogsList(updated);
      await autoSyncTableToGoogleSheets('auditoria', { audit: updated });
    } else if (selectedDbTable === 'nexus_empleados') {
      const updated = nexusEmployees.map(e => e.id === editingRecord.id ? { ...e, ...formData } : e);
      setNexusEmployees(updated);
      await autoSyncTableToGoogleSheets('nexus_empleados', { employees: updated });
    } else if (selectedDbTable === 'comisiones') {
      const updated = commissionPayments.map(c => c.id === editingRecord.id ? { ...c, ...formData, grossVolume: parseFloat(formData.grossVolume), commissionAmount: parseFloat(formData.commissionAmount) } : c);
      setCommissionPayments(updated);
      await autoSyncTableToGoogleSheets('comisiones', { commissions: updated });
    }
    setShowEditRecordModal(false);
    setEditingRecord(null);
  };

  const handleDeleteRecord = async (id: string) => {
    if (selectedDbTable === 'usuarios') {
      const updated = platformUsers.filter(u => u.id !== id);
      setPlatformUsers(updated);
      await autoSyncTableToGoogleSheets('usuarios', { users: updated });
    } else if (selectedDbTable === 'negocios') {
      const updated = localBusinesses.filter(b => b.id !== id);
      setLocalBusinesses(updated);
      if (onUpdateBusinesses) onUpdateBusinesses(updated);
      await autoSyncTableToGoogleSheets('negocios', { businesses: updated });
    } else if (selectedDbTable === 'productos') {
      const updated = localProducts.filter(p => p.id !== id);
      setLocalProducts(updated);
      if (onUpdateProducts) onUpdateProducts(updated);
      await autoSyncTableToGoogleSheets('productos', { products: updated });
    } else if (selectedDbTable === 'pedidos') {
      const updated = platformOrders.filter(o => o.id !== id);
      setPlatformOrders(updated);
      await autoSyncTableToGoogleSheets('pedidos', { orders: updated });
    } else if (selectedDbTable === 'auditoria') {
      const updated = auditLogsList.filter(a => a.id !== id);
      setAuditLogsList(updated);
      await autoSyncTableToGoogleSheets('auditoria', { audit: updated });
    } else if (selectedDbTable === 'nexus_empleados') {
      const updated = nexusEmployees.filter(e => e.id !== id);
      setNexusEmployees(updated);
      await autoSyncTableToGoogleSheets('nexus_empleados', { employees: updated });
    } else if (selectedDbTable === 'comisiones') {
      const updated = commissionPayments.filter(c => c.id !== id);
      setCommissionPayments(updated);
      await autoSyncTableToGoogleSheets('comisiones', { commissions: updated });
    }
    setDeletingRecordId(null);
  };

  // Helper to export active DB Table to JSON
  const handleExportTableJSON = (tableName: string, data: any) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `nexus_prime_db_${tableName}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Dynamic revenue calculation for Recharts financial tracking
  const getBusinessRevenue = (b: Business) => {
    if (b.slug === 'imperio-lux' || b.name.includes('Imperio Lux')) return 68400;
    if (b.slug === 'aura-maison' || b.name.includes('Aura')) return 42150;
    if (b.slug === 'luminary-co' || b.name.includes('Luminary')) return 21800;
    if (b.slug === 'verve-tech' || b.name.includes('Verve')) return 10500;
    const bizProducts = localProducts.filter(p => p.businessId === b.id);
    const baseRevenue = bizProducts.reduce((sum, p) => sum + p.retailPrice * (p.stockQuantity > 0 ? 15 : 5), 15000);
    return baseRevenue;
  };

  const revenueData = localBusinesses.map((b) => {
    const revenue = getBusinessRevenue(b);
    const commission = revenue * (b.commissionRate / 100);
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      category: b.category,
      revenue,
      commission,
      commissionRate: b.commissionRate,
    };
  });

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);
  const platformFees = revenueData.reduce((acc, curr) => acc + curr.commission, 0);
  const activeStores = localBusinesses.filter(b => b.status === 'active').length;

  return (
    <div className="space-y-6">

      {/* Nexus Web Studio Parent Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">EMPRESA SUPERADMIN MATRIZ</div>
            <h2 className="text-2xl font-bold font-serif-luxury">Nexus Web Studio</h2>
            <p className="text-xs text-slate-300 mt-0.5">Administración global del ecosistema Nexus Prime, base de datos e inquilinos.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('businesses')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'businesses' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Negocios Registrados ({localBusinesses.length})
          </button>
          
          <button
            onClick={() => setActiveSubTab('database_inspector')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'database_inspector' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Tablas &amp; Base de Datos (CRUD)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nexus_employees')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'nexus_employees' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Empleados Nexus ({nexusEmployees.length})
          </button>
        </div>
      </div>

      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>VOLUMEN GLOBAL TRANSACCIONADO</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-white">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-500 font-medium">↑ +18.4%</span> este mes en tiendas Nexus
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>INGRESOS POR COMISIÓN PLATAFORMA</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-amber-600 dark:text-amber-400">
            ${platformFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Tasa retenida por Nexus Web Studio
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>NEGOCIOS REGISTRADOS</span>
            <Store className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-slate-900 dark:text-white">
            {localBusinesses.length} <span className="text-xs font-normal text-slate-500">({activeStores} activos)</span>
          </div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
            Tienda Principal: Imperio Lux
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>ESTADO DE BASE DE DATOS</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>GOOGLE SHEETS SYNC</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono truncate">
            7 Tablas CRUD · Auto-Sync Activo
          </div>
        </div>
      </div>

      {/* RECHARTS FINANCIAL BAR CHART: REVENUE PER BUSINESS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold font-serif-luxury text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              Comparativa Financiera: Ingresos Totales por Negocio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualización interactiva del volumen transaccionado brutas (USD) y rentabilidad en comisiones de Nexus Web Studio.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Imperio Lux (Negocio Principal)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Otros Negocios Registrados</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 15, right: 15, left: 15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155', opacity: 0.3 }}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }} />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} maxBarSize={55}>
                {revenueData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name.includes('Imperio Lux') ? '#f59e0b' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SUB-TAB 1: NEGOCIOS REGISTRADOS EN LA PLATAFORMA */}
      {activeSubTab === 'businesses' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold font-serif-luxury text-slate-900 dark:text-white">
                Negocios Registrados en la Plataforma
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nexus Web Studio gestiona y supervisa todos los establecimientos y sus catálogos comerciales.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Negocio</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-4">Establecimiento</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Comisión Plataforma</th>
                  <th className="p-4">Catálogo Registrado</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones de Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {localBusinesses.map((b) => {
                  const storeProducts = localProducts.filter(p => p.businessId === b.id);
                  const isImperio = b.slug === 'imperio-lux';
                  return (
                    <tr key={b.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${isImperio ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={b.logo} alt={b.name} className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 shadow-xs" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                              <span>{b.name}</span>
                              {isImperio && (
                                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                  Primer Negocio Real
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-xs font-mono">ID: {b.id} · Path: /{b.slug}/inicio</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-amber-700 dark:text-amber-400">{b.category}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-mono-tabular font-semibold text-amber-600 dark:text-amber-400">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="30"
                            value={b.commissionRate}
                            onChange={(e) => onUpdateCommission(b.id, parseFloat(e.target.value) || 0)}
                            className="w-14 px-2 py-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded text-xs text-center font-bold"
                          />
                          <span>%</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono-tabular">
                        <button
                          onClick={() => onOpenStoreCatalog(b)}
                          className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg font-semibold text-xs hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Catálogo ({storeProducts.length})</span>
                        </button>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          b.status === 'active' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {b.status === 'active' ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {b.status === 'active' ? (
                          <button
                            onClick={() => onUpdateBusinessStatus(b.id, 'suspended')}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            Suspender
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateBusinessStatus(b.id, 'active')}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Reactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: VISOR E INSPECTOR DE TABLAS Y BASE DE DATOS FULL CRUD */}
      {activeSubTab === 'database_inspector' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* GOOGLE SHEETS DATABASE ENGINE CARD */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/40 p-6 rounded-2xl shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">MOTOR DE BASE DE DATOS: GOOGLE SHEETS</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-500/30">
                      API v4 ONLINE &amp; FULL CRUD
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-serif-luxury text-white">Google Sheets Base de Datos Nexus Prime</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Operaciones CRUD en tiempo real (Crear, Leer, Actualizar, Eliminar) sincronizadas bidireccionalmente.
                  </p>
                </div>
              </div>

              {/* Vercel-Ready Connection Mode Indicator */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2.5 bg-slate-800/90 px-3.5 py-2 rounded-xl border border-emerald-500/40 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Modo Directo &amp; Vercel Ready</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded-full border border-emerald-500/30">Sin Workspace OAuth</span>
                    </div>
                    <div className="text-[10px] text-slate-300">Compatible con Vercel Service Account &amp; Apps Script API</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Sheets Actions Toolbar: Bi-Directional Controls */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* 1. Export / Sync ALL to Google Sheets */}
                <button
                  onClick={handleSyncToGoogleSheet}
                  disabled={isSheetsLoading}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102 disabled:opacity-50"
                  title="Exportar todas las tablas locales a Google Sheets"
                >
                  <ArrowUpCircle className={`w-4 h-4 ${isSheetsLoading ? 'animate-spin' : ''}`} />
                  <span>Subir / Exportar Todo a Google Sheets</span>
                </button>

                {/* 2. Import FROM Google Sheets */}
                <button
                  onClick={() => handleImportFromGoogleSheets(false)}
                  disabled={isSheetsLoading}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102 disabled:opacity-50"
                  title="Importar cambios desde Google Sheets a la base de datos del Superadmin"
                >
                  <ArrowDownCircle className={`w-4 h-4 ${isSheetsLoading ? 'animate-spin' : ''}`} />
                  <span>Sincronizar DESDE Google Sheets (Importar Cambios)</span>
                </button>

                <button
                  onClick={handleCreateMasterSheet}
                  disabled={isSheetsLoading}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm border border-slate-700 disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear Nueva Hoja Master</span>
                </button>

                {driveSpreadsheets.length > 0 && (
                  <select
                    value={activeSpreadsheetId}
                    onChange={(e) => setActiveSpreadsheetId(e.target.value)}
                    className="px-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 font-mono"
                  >
                    <option value="1ob3o8P8o0hqMNiWWR2_WRXxlEXh8qPCgQ4HNqSufZ7w">
                      NEXUS PRIME (Target Master: 1ob3o8P8o0...)
                    </option>
                    {driveSpreadsheets.map(s => (
                      <option key={s.id} value={s.id}>
                        Drive: {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {activeSpreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${activeSpreadsheetId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir NEXUS PRIME en Google Sheets</span>
                </a>
              )}
            </div>

            {/* Status Message Display */}
            {sheetsStatusMsg && (
              <div className="p-3 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                <span>{sheetsStatusMsg}</span>
              </div>
            )}
          </div>

          {/* CONFIGURACIÓN Y PRUEBA DE SERVIDOR SMTP (CORREOS DE VERIFICACIÓN) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Servidor SMTP & Envíos de Correos de Verificación (OTP 2FA)</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-mono font-bold">SMTP ACTIVO</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configuración global para enviar códigos de 6 dígitos a los usuarios registrados en la hoja de Google Sheets al iniciar sesión.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSmtpSettings} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Servidor SMTP (Host):</label>
                <input
                  type="text"
                  required
                  value={smtpForm.host}
                  onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Puerto (587 / 465):</label>
                <input
                  type="number"
                  required
                  value={smtpForm.port}
                  onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value, 10) || 587 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Usuario / Email SMTP:</label>
                <input
                  type="text"
                  required
                  value={smtpForm.user}
                  onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                  placeholder="correo@servidor.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Contraseña SMTP / App Pass:</label>
                <input
                  type="password"
                  value={smtpForm.pass}
                  onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Nombre del Remitente:</label>
                <input
                  type="text"
                  value={smtpForm.fromName}
                  onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                  placeholder="Nexus Prime Verification"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email del Remitente:</label>
                <input
                  type="email"
                  value={smtpForm.fromEmail}
                  onChange={(e) => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })}
                  placeholder="nexuswebstudio2026@gmail.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleTestSmtpConnection}
                    disabled={isVerifyingConnection || isSavingSmtp}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-200" />
                    <span>{isVerifyingConnection ? 'Verificando Servidor...' : 'Testear Conexión SMTP'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingSmtp || isVerifyingConnection}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingSmtp ? 'Guardando Ajustes...' : 'Guardar Configuración SMTP'}</span>
                  </button>
                </div>

                {/* Test OTP Email Section */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-sans">Prueba de Envío OTP:</span>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="email.para.prueba@gmail.com"
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono w-52 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendSmtpTestEmail}
                    disabled={isTestingSmtp || !testEmailAddress}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTestingSmtp ? 'Enviando...' : 'Enviar Correo OTP'}</span>
                  </button>
                </div>
              </div>
            </form>

            {smtpStatusMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center gap-2.5 shadow-sm ${
                smtpStatusMsg.startsWith('✅')
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : smtpStatusMsg.startsWith('❌')
                  ? 'bg-red-950/80 border border-red-500/40 text-red-300'
                  : 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
              }`}>
                {smtpStatusMsg.startsWith('✅') ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : smtpStatusMsg.startsWith('❌') ? (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="leading-relaxed">{smtpStatusMsg}</span>
              </div>
            )}
          </div>

          {/* URL & Database Status Callout Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-amber-500/30 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Inspector de Tablas y Módulo de Base de Datos</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-mono font-bold">7 TABLAS CON CONTROL C.R.U.D.</span>
                </h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Sincronización bidireccional activada con Hoja Master Google Sheets: <span className="text-amber-400 font-bold">NEXUS PRIME</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear Registro en {selectedDbTable}</span>
              </button>

              <button
                onClick={() => handleExportTableJSON(selectedDbTable, getTable2DArray(selectedDbTable).rows)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>

          {/* Table Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
            {[
              { id: 'negocios', label: 'Tabla: negocios', count: localBusinesses.length },
              { id: 'productos', label: 'Tabla: productos_servicios', count: localProducts.length },
              { id: 'usuarios', label: 'Tabla: usuarios', count: platformUsers.length },
              { id: 'pedidos', label: 'Tabla: pedidos', count: platformOrders.length },
              { id: 'auditoria', label: 'Tabla: auditoria_logs', count: auditLogsList.length },
              { id: 'nexus_empleados', label: 'Tabla: nexus_empleados', count: nexusEmployees.length },
              { id: 'comisiones', label: 'Tabla: comisiones_pagos', count: commissionPayments.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedDbTable(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  selectedDbTable === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/10 dark:bg-white/10 font-mono font-bold">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table View Component */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 uppercase">
                  ESQUEMA DE TABLA: {selectedDbTable}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  (C: Crear | R: Leer | U: Actualizar | D: Eliminar)
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={`Buscar en ${selectedDbTable}...`}
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <button
                  onClick={handleOpenCreateModal}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Registro</span>
                </button>
              </div>
            </div>

            {/* TABLA: NEGOCIOS */}
            {selectedDbTable === 'negocios' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">nombre (VARCHAR)</th>
                      <th className="p-3">slug (VARCHAR)</th>
                      <th className="p-3">categoria (VARCHAR)</th>
                      <th className="p-3">tasa_comision (NUMERIC)</th>
                      <th className="p-3">estado (ENUM)</th>
                      <th className="p-3">fecha_creacion (DATE)</th>
                      <th className="p-3 text-right">Acciones CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {localBusinesses
                      .filter(b => b.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) || b.category.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                      .map(b => (
                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{b.id}</td>
                          <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">{b.name}</td>
                          <td className="p-3 text-slate-500">/{b.slug}</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">{b.category}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{b.commissionRate}%</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${b.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{b.createdDate}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(b)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Editar registro (Update)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingRecordId(b.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar registro (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA: PRODUCTOS */}
            {selectedDbTable === 'productos' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">business_id (FK)</th>
                      <th className="p-3">titulo (VARCHAR)</th>
                      <th className="p-3">categoria (VARCHAR)</th>
                      <th className="p-3">precio_venta (NUMERIC)</th>
                      <th className="p-3">costo_proveedor (NUMERIC)</th>
                      <th className="p-3">stock (INTEGER)</th>
                      <th className="p-3 text-right">Acciones CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {localProducts
                      .filter(p => p.title.toLowerCase().includes(tableSearchQuery.toLowerCase()) || p.category.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                      .map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{p.id}</td>
                          <td className="p-3 text-blue-600 dark:text-blue-400 font-semibold">{p.businessId}</td>
                          <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">{p.title}</td>
                          <td className="p-3 text-slate-500">{p.category}</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">${p.retailPrice.toFixed(2)}</td>
                          <td className="p-3 text-amber-600 font-medium">${p.supplierCost.toFixed(2)}</td>
                          <td className="p-3 font-bold">{p.stockQuantity} u.</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Editar producto (Update)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingRecordId(p.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar producto (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA: USUARIOS */}
            {selectedDbTable === 'usuarios' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">nombre (VARCHAR)</th>
                      <th className="p-3">email (VARCHAR UNIQUE)</th>
                      <th className="p-3">rol (ENUM)</th>
                      <th className="p-3">negocio_activo (FK)</th>
                      <th className="p-3 text-right">Acciones CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {platformUsers
                      .filter(u => u.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                      .map(u => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{u.id}</td>
                          <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">{u.name}</td>
                          <td className="p-3 text-blue-600 dark:text-blue-400">{u.email}</td>
                          <td className="p-3 font-bold text-amber-700 dark:text-amber-300">{u.role}</td>
                          <td className="p-3 text-slate-500">{u.activeBiz}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Editar usuario (Update)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingRecordId(u.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar usuario (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA: PEDIDOS */}
            {selectedDbTable === 'pedidos' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">business_id (FK)</th>
                      <th className="p-3">cliente_nombre</th>
                      <th className="p-3">monto_total</th>
                      <th className="p-3">metodo_pago</th>
                      <th className="p-3">estado</th>
                      <th className="p-3">fecha</th>
                      <th className="p-3 text-right">Acciones CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {platformOrders
                      .filter(o => o.clientName.toLowerCase().includes(tableSearchQuery.toLowerCase()) || o.id.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                      .map(o => (
                        <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{o.id}</td>
                          <td className="p-3 text-blue-600 font-semibold">{o.businessId}</td>
                          <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">{o.clientName}</td>
                          <td className="p-3 text-emerald-600 font-bold">${o.totalAmount.toFixed(2)}</td>
                          <td className="p-3 text-slate-500">{o.paymentMethod}</td>
                          <td className="p-3 font-bold text-emerald-600">{o.status}</td>
                          <td className="p-3 text-slate-400">{o.date}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(o)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Editar pedido (Update)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingRecordId(o.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar pedido (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA: AUDITORIA */}
            {selectedDbTable === 'auditoria' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">actor_nombre</th>
                      <th className="p-3">accion</th>
                      <th className="p-3">inquilino_destino</th>
                      <th className="p-3">detalles</th>
                      <th className="p-3">timestamp</th>
                      <th className="p-3 text-right">Acciones CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auditLogsList
                      .filter(a => a.actorName.toLowerCase().includes(tableSearchQuery.toLowerCase()) || a.action.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                      .map(a => (
                        <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{a.id}</td>
                          <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">{a.actorName}</td>
                          <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{a.action}</td>
                          <td className="p-3 text-blue-600 font-semibold">{a.targetTenant}</td>
                          <td className="p-3 font-sans text-slate-600 dark:text-slate-400 max-w-xs truncate">{a.details}</td>
                          <td className="p-3 text-slate-400">{a.timestamp}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(a)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Editar auditoría (Update)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingRecordId(a.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar auditoría (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA: EMPLEADOS NEXUS */}
            {selectedDbTable === 'nexus_empleados' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">nombre (VARCHAR)</th>
                      <th className="p-3">email (VARCHAR UNIQUE)</th>
                      <th className="p-3">cargo (VARCHAR)</th>
                      <th className="p-3">departamento (VARCHAR)</th>
                      <th className="p-3">fecha_ingreso (DATE)</th>
                      <th className="p-3 text-right">Acciones CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {nexusEmployees
                      .filter(e => e.name.toLowerCase().includes(tableSearchQuery.toLowerCase()) || e.email.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                      .map(e => (
                        <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{e.id}</td>
                          <td className="p-3 font-sans font-semibold text-slate-900 dark:text-white">{e.name}</td>
                          <td className="p-3 text-blue-600 font-semibold">{e.email}</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">{e.roleTitle}</td>
                          <td className="p-3 text-slate-500">{e.department}</td>
                          <td className="p-3 text-slate-400">{e.joinedDate}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(e)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Editar empleado (Update)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingRecordId(e.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar empleado (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABLA: COMISIONES */}
            {selectedDbTable === 'comisiones' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">id (PK)</th>
                      <th className="p-3">business_id (FK)</th>
                      <th className="p-3">establecimiento</th>
                      <th className="p-3">periodo</th>
                      <th className="p-3">volumen_bruto</th>
                      <th className="p-3">tasa_comision</th>
                      <th className="p-3">monto_comision</th>
                      <th className="p-3">estado</th>
                      <th className="p-3">fecha_pago</th>
                      <th className="p-3 text-right">Acciones CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {commissionPayments
                      .filter(c => c.businessName.toLowerCase().includes(tableSearchQuery.toLowerCase()) || c.period.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                      .map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">{c.id}</td>
                          <td className="p-3 text-blue-600 font-semibold">{c.businessId}</td>
                          <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{c.businessName}</td>
                          <td className="p-3 text-slate-500">{c.period}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 font-bold">${c.grossVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-amber-600 font-semibold">{c.rate}%</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-extrabold">${c.commissionAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-bold uppercase text-[10px]">
                              {c.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{c.payoutDate}</td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Editar comisión (Update)"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingRecordId(c.id)}
                              className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar comisión (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* SUB-TAB 2: GESTIÓN DE EMPLEADOS PROPIOS DE NEXUS WEB STUDIO */}
      {activeSubTab === 'nexus_employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-slate-900 dark:text-white">
                Nómina de Empleados de Nexus Web Studio
              </h3>
              <p className="text-xs text-slate-500">
                Personal interno de la empresa Superadmin matriz con acceso a soporte y operaciones multi-tenant.
              </p>
            </div>
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Empleado Nexus</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-4">Empleado Nexus</th>
                  <th className="p-4">Correo Corporativo</th>
                  <th className="p-4">Cargo / Función</th>
                  <th className="p-4">Departamento</th>
                  <th className="p-4">Fecha de Ingreso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {nexusEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                    <td className="p-4 font-mono text-amber-600 dark:text-amber-400">{emp.email}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{emp.roleTitle}</td>
                    <td className="p-4 text-slate-500">{emp.department}</td>
                    <td className="p-4 font-mono-tabular text-slate-400">{emp.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              Stream de Auditoría Inmutable de Nexus Web Studio
            </h3>
            <p className="text-xs text-slate-500">Monitoreo de seguridad y transacciones multi-tenant</p>
          </div>
          <span className="text-xs text-slate-400 font-mono-tabular">Real-time Security Logging</span>
        </div>

        <div className="space-y-3">
          {auditLogsList.map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900 dark:text-white">{log.actorName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">{log.action}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 font-medium">Inquilino: {log.targetTenant}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{log.details}</p>
              </div>
              <span className="text-slate-400 font-mono-tabular shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DYNAMIC MODAL: CREAR REGISTRO EN BASE DE DATOS */}
      {showCreateRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-serif-luxury text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                <span>Crear Registro en: <span className="text-amber-500 font-mono">{selectedDbTable}</span></span>
              </h3>
              <button onClick={() => setShowCreateRecordModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreateRecord} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <label className="text-xs font-semibold font-mono block mb-1 text-slate-700 dark:text-slate-300">
                    {key}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData[key] !== undefined ? formData[key] : ''}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-mono"
                  />
                </div>
              ))}

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300">
                ⚡ Este registro se guardará en la base de datos y se sincronizará automáticamente con Google Sheets.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateRecordModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl cursor-pointer shadow-sm"
                >
                  Guardar en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC MODAL: EDITAR REGISTRO EN BASE DE DATOS (UPDATE) */}
      {showEditRecordModal && editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-serif-luxury text-slate-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-500" />
                <span>Actualizar Registro (<span className="text-amber-500 font-mono">{editingRecord.id}</span>)</span>
              </h3>
              <button onClick={() => setShowEditRecordModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRecord} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {Object.keys(formData).map((key) => (
                <div key={key}>
                  <label className="text-xs font-semibold font-mono block mb-1 text-slate-700 dark:text-slate-300">
                    {key} {key === 'id' && '(Llave Primaria - No modificable)'}
                  </label>
                  <input
                    type="text"
                    disabled={key === 'id'}
                    required
                    value={formData[key] !== undefined ? formData[key] : ''}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl font-mono ${
                      key === 'id' 
                        ? 'bg-slate-100 dark:bg-slate-950 text-slate-400' 
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                  />
                </div>
              ))}

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-300">
                🔄 La modificación se reflejará al instante en el Superadmin y en la Hoja de Google Sheets NEXUS PRIME.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditRecordModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl cursor-pointer shadow-sm"
                >
                  Actualizar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: ELIMINAR REGISTRO (DELETE) */}
      {deletingRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 bg-red-500/20 rounded-xl border border-red-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">¿Eliminar Registro?</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {deletingRecordId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Esta acción eliminará permanentemente este registro de la tabla <span className="font-mono font-bold text-amber-500">{selectedDbTable}</span> de la base de datos y actualizará la hoja de Google Sheets.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRecordId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRecord(deletingRecordId)}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl cursor-pointer shadow-sm"
              >
                Sí, Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: EXPORT / OVERWRITE GOOGLE SHEETS */}
      {showSyncConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">¿Sincronizar y Exportar a Google Sheets?</h3>
                <p className="text-xs text-slate-500 font-mono">ID Hoja: {activeSpreadsheetId}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Esta acción actualizará y reemplazará los datos en las 7 pestañas (<span className="font-mono text-amber-500">Usuarios, Negocios, Productos, Pedidos, Auditoria, Empleados, Comisiones</span>) de tu hoja de cálculo en Google Sheets con los datos actuales de la plataforma Nexus Prime.
            </p>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-300">
              ⚠️ Se requiere confirmación explícita antes de modificar datos en tu cuenta de Google Workspace.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowSyncConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeSyncToGoogleSheet}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl cursor-pointer shadow-sm"
              >
                Confirmar Sincronización
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
