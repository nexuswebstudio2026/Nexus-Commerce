import React, { useState } from 'react';
import { ShieldCheck, Database, Layers, Palette, Lock, Code, Terminal, CheckCircle2, ChevronRight, X, Copy, Server, Cpu, Users, Store } from 'lucide-react';

interface ArchitectureDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocModal: React.FC<ArchitectureDocModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'rbac' | 'uiux' | 'security'>('architecture');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const sqlDDL = `-- =========================================================================
-- ESQUEMA DE BASE DE DATOS MULTI-TENANT & CROSS-INVENTORY (PostgreSQL / Cloud SQL)
-- Soporta N:M Clientes/Proveedores a Múltiples Negocios y Control RBAC
-- =========================================================================

-- 1. Tabla Global de Inquilinos (Negocios / Stores)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    logo_url TEXT,
    currency VARCHAR(10) DEFAULT 'USD',
    commission_rate NUMERIC(4, 2) DEFAULT 5.00,
    status VARCHAR(20) CHECK (status IN ('active', 'pending', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Usuarios Globales y Autenticación
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    global_role VARCHAR(50) CHECK (global_role IN ('superadmin', 'business_owner', 'employee', 'customer', 'supplier')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Relación N:M entre Usuarios (Clientes / Proveedores / Empleados) y Negocios
CREATE TABLE tenant_user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_in_tenant VARCHAR(50) CHECK (role_in_tenant IN ('owner', 'employee', 'customer', 'supplier')) NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb, -- Permisos específicos para empleados
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tenant_id, role_in_tenant)
);

-- 4. Catálogo Unificado de Productos & Servicios por Negocio
CREATE TABLE products_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    item_type VARCHAR(20) CHECK (item_type IN ('product', 'service')) NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    -- Precios definidos por el NEGOCIO (Owner)
    retail_price NUMERIC(12, 2) NOT NULL,
    promo_price NUMERIC(12, 2),
    is_promo BOOLEAN DEFAULT FALSE,
    
    -- Control de Inventario & Proveedor predeterminado
    stock_quantity INT DEFAULT 0,
    primary_supplier_id UUID REFERENCES users(id),
    current_cost_price NUMERIC(12, 2) DEFAULT 0.00, -- Definido por Proveedor
    
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, sku)
);

-- 5. Historial de Abastecimiento e Inventario por Proveedor (Modelo Cruzado)
CREATE TABLE supplier_restock_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    product_id UUID NOT NULL REFERENCES products_services(id),
    units_added INT NOT NULL CHECK (units_added > 0),
    cost_price_unit NUMERIC(12, 2) NOT NULL, -- Precio de costo ingresado por Proveedor
    total_cost_batch NUMERIC(12, 2) GENERATED ALWAYS AS (units_added * cost_price_unit) STORED,
    restock_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 6. Órdenes y Transacciones E-Commerce
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Triggers de Seguridad RLS en PostgreSQL
ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_products ON products_services
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlDDL);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif-luxury text-slate-900 dark:text-white">
                Plan Maestro de Arquitectura & Blueprint Téćnico
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Jessica Paola Enterprise · Solución Full-Stack Multi-Tenant, RBAC 5-Roles, Firebase & RLS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/50 dark:bg-slate-950/50 overflow-x-auto">
          {[
            { id: 'architecture', label: '1. Arquitectura Técnica', icon: Server },
            { id: 'database', label: '2. Base de Datos & SQL', icon: Database },
            { id: 'rbac', label: '3. Módulos por Rol', icon: Users },
            { id: 'uiux', label: '4. Lineamientos UI/UX', icon: Palette },
            { id: 'security', label: '5. Seguridad & Permisos', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white/40 dark:bg-slate-900/40'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Viewport */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700 dark:text-slate-300 space-y-6">

          {/* TAB 1: ARQUITECTURA TÉCNICA RECOMENDADA */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-xl border border-amber-500/20">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-500" />
                  Stack Tecnológico Recomendado para Producción Multi-Tenant
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Para escalar una plataforma multi-negocio con garantías de aislamiento de datos, latencias inferiores a 100ms y alta concordancia financiera entre costo e inventario, se recomienda una arquitectura desacoplada basada en micro-servicios o monolith modular.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Frontend Layer
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>React 19 + TypeScript:</strong> Tipado estricto para modelos de dominio multi-inquilino.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Vite + Tailwind CSS v4:</strong> Diseño impecable en Modo Día y Noche sin sobrecarga de runtime CSS.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Zustand / React Context:</strong> Estado global reactivo para el selector de contexto de negocio activo y carrito.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Backend & API Middleware
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Node.js / Express / Next.js API Routes:</strong> API REST / GraphQL con middleware de resolución de inquilino (Tenant Context).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Firebase Auth / Custom JWT:</strong> Custom Claims conteniendo <code className="text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 rounded">tenant_ids</code> y <code className="text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 rounded">role</code> del usuario.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Database & Persistence
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>PostgreSQL / Cloud SQL / Supabase:</strong> Motor relacional de alto rendimiento con Row-Level Security (RLS) habilitado.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Drizzle ORM / Prisma:</strong> Consultas tipo-seguras con scoping automático por <code className="text-slate-700 dark:text-slate-300">tenant_id</code>.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Storage & Payments
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Cloud Storage / AWS S3:</strong> Hosting de imágenes de catálogo aisladas por carpeta de inquilino.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span><strong>Stripe Connect / MercadoPago Multi-Account:</strong> Enrutamiento automático de pagos directos a las cuentas del dueño con comisión retenida para el Superadmin.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BASE DE DATOS Y RELACIONES */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Esquema Relacional N:M & Modelo de Inventario Cruzado
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Relaciones relacionales entre Clientes/Proveedores a Múltiples Negocios y gestión de costo vs precio de venta.
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? '¡Copiado!' : 'Copiar SQL DDL'}</span>
                </button>
              </div>

              {/* Explanatory Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                    Relación N:M Multi-Tenant
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Un <strong>Cliente</strong> o <strong>Proveedor</strong> se registra una sola vez y se vincula a MÚLTIPLES negocios mediante la tabla puente <code className="text-amber-600 dark:text-amber-400">tenant_user_memberships</code>.
                  </p>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                    Gestión de Precio de Venta (Dueño)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    El Negocio define el <strong>Precio de Venta (Retail)</strong> y las <strong>Promociones</strong> en la tabla <code className="text-emerald-600 dark:text-emerald-400">products_services</code>.
                  </p>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                    Inventario Cruzado & Costo (Proveedor)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    El Proveedor selecciona el Negocio, ve sus productos y registra reabastecimiento especificando su <strong>Precio de Costo</strong> en <code className="text-blue-600 dark:text-blue-400">supplier_restock_logs</code>.
                  </p>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 text-xs">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    schema.sql - PostgreSQL DDL con Políticas RLS
                  </span>
                </div>
                <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed max-h-72">
                  <code>{sqlDDL}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: DESGLOSE DE MÓDULOS POR ROL */}
          {activeTab === 'rbac' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Matriz de Responsabilidades y Paneles de Control (RBAC)
              </h3>

              <div className="space-y-4">
                {[
                  {
                    role: '1. Superadmin',
                    color: 'text-purple-600 dark:text-purple-400 border-purple-500/20 bg-purple-500/5',
                    desc: 'Supervisión global del ecosistema multi-tenant.',
                    features: [
                      'Alta, aprobación y suspensión de Negocios (Tenants).',
                      'Panel de métricas consolidadas (Ventas globales, volumen por negocio, comisiones).',
                      'Auditoría de logs de seguridad y parámetros de plataforma.',
                      'Ajuste de tasas de comisión por negocio.',
                    ],
                  },
                  {
                    role: '2. Usuario Negocio (Dueño / Admin)',
                    color: 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/5',
                    desc: 'Control exclusivo de la tienda o establecimiento.',
                    features: [
                      'Catálogo Propio: Creación de Productos y Servicios, configuración de Precio de Venta y Promociones.',
                      'Cálculo automático de Margen de Ganancia (Precio Venta - Precio Costo Proveedor).',
                      'Gestión de Empleados: Invitación y asignación de permisos delegados.',
                      'Visualización de inventarios restockeadas por Proveedores.',
                    ],
                  },
                  {
                    role: '3. Usuario Empleado',
                    color: 'text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/5',
                    desc: 'Panel operativo del día a día con permisos delegados.',
                    features: [
                      'Procesamiento y cambio de estado de pedidos (Pending -> Completed).',
                      'Terminal Punto de Venta (POS) rápido para atención en mostrador o chat.',
                      'Atención al cliente y verificación rápida de stock disponible.',
                    ],
                  },
                  {
                    role: '4. Usuario Cliente',
                    color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
                    desc: 'Portal del comprador con pertenencia a múltiples tiendas.',
                    features: [
                      'Asociación simultánea a 1 o múltiples negocios desde una sola cuenta.',
                      'Navegación por tiendas virtuales asociadas con conmutador rápido.',
                      'Exploración de catálogo, carrito de compras unificado y simulador de Checkout.',
                      'Historial de pedidos y reservas de servicios.',
                    ],
                  },
                  {
                    role: '5. Usuario Proveedor',
                    color: 'text-indigo-600 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
                    desc: 'Portal de suministro e incremento de inventario.',
                    features: [
                      'Selección del negocio registrado al que desea proveer insumos/productos.',
                      'Carga automática del catálogo comercial del negocio seleccionado.',
                      'Formulario de Restock: Aumentar inventario (unidades) y fijar Precio de Costo.',
                      'Historial de despachos y valoración financiera total del suministro.',
                    ],
                  },
                ].map((item, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${item.color}`}>
                    <div className="font-semibold text-sm mb-1">{item.role}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{item.desc}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {item.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROPUESTA DE UI/UX */}
          {activeTab === 'uiux' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Lineamientos de Diseño UI/UX y Sistema Día / Noche
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider text-amber-500">
                    Estética Minimalista y de Alta Gama
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li>• <strong>Tipografía Editorial:</strong> Encabezados refinados en <em>Playfair Display</em> para títulos luxury y <em>Plus Jakarta Sans</em> para legibilidad perfecta.</li>
                    <li>• <strong>Cero Disciplina de Pastillas Ficticias:</strong> Metadatos formateados como texto limpio desmarcado con separadores discretos (· / -).</li>
                    <li>• <strong>Regla 60-30-10 de Color:</strong> 60% lienzo neutro (Slate 50 / Slate 950), 30% superficies de tarjeta con bordes de 1px hair-line, 10% acentos dorados/ámbar en CTAs.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-wider text-amber-500">
                    Estrategia de Modo Día / Noche (Theme Toggle)
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li>• <strong>Modo Día (Light):</strong> Fondos <code className="text-slate-800">#F8FAFC</code> con tarjetas de contraste claro <code className="text-slate-800">#FFFFFF</code> y tipografía en Slate 900 para máxima legibilidad bajo sol.</li>
                    <li>• <strong>Modo Noche (Dark):</strong> Fondos <code className="text-slate-800">#020617</code> con tarjetas en Slate 900 y bordes sutiles en Slate 800 que reducen fatiga visual.</li>
                    <li>• <strong>Transición Suave:</strong> Conmutación instantánea mediante clase CSS <code className="text-slate-800">dark</code> en la raíz HTML con transiciones suave en 200ms.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ESTRATEGIA DE SEGURIDAD Y PERMISOS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Aislamiento Multi-Tenant & Seguridad RBAC
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 text-xs uppercase tracking-wider mb-2">
                    Aislamiento Estricto de Datos entre Inquilinos (Tenants)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Cada consulta en el backend pasa obligatoriamente por un Middleware de Inquilino que extrae el ID de negocio activo desde las reclamaciones verificadas del Token JWT o la cabecera cifrada <code className="text-red-600 dark:text-red-400">X-Tenant-ID</code>. Ningún negocio puede consultar o alterar registros pertenecientes a otro <code className="text-red-600 dark:text-red-400">tenant_id</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-semibold text-slate-900 dark:text-white text-xs mb-2">
                      Control de Permisos por Empleado (Granular Permissions)
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Los empleados reciben un array de permisos explícitos (ej. <code className="text-amber-500">['manage_orders', 'customer_support']</code>). Si un empleado intenta editar precios de venta sin la bandera <code className="text-amber-500">'manage_catalog'</code>, la API rechaza la petición con estado HTTP 403 Forbidden.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-semibold text-slate-900 dark:text-white text-xs mb-2">
                      Auditoría Completa de Registro de Eventos (Audit Logs)
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Cada acción sensible (modificación de precios por el dueño, restock por el proveedor o aprobación por el superadmin) genera una entrada inmutable en la tabla <code className="text-amber-500">audit_logs</code> con timestamp, actor y rol.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Documentación lista para implementación en producción</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-xl transition-colors"
          >
            Entendido, Explorar Demo Interactivo
          </button>
        </div>

      </div>
    </div>
  );
};
