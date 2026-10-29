import React, { useState } from 'react';
import { 
  Store, ShieldCheck, Target, Eye, TrendingUp, CheckCircle2, Database, 
  Lock, Users, ArrowRight, Truck, ShoppingBag, Server, RefreshCw, Sparkles, Award
} from 'lucide-react';

type RLSRoleView = 'superadmin' | 'tenant' | 'supplier' | 'customer';

export const AboutUsSection: React.FC = () => {
  const [activeRLSRole, setActiveRLSRole] = useState<RLSRoleView>('tenant');

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-12">

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ecosistema JPB Commerce Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Sobre Nexus Commerce Suite
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Plataforma macro de comercio electrónico multi-tenant administrada por <strong>Nexus Web Studio</strong>. Diseñada para unificar tiendas virtuales independientes, proveedores de insumos y clientes finales con aislamiento de datos a nivel de filas (PostgreSQL RLS) y sincronización con Google Sheets.
          </p>
        </div>
      </div>

      {/* BLOQUE A: MISIÓN & VISIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Misión */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Nuestra Misión
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Empoderar a emprendedores y negocios independientes brindándoles infraestructura digital multi-tenant de nivel corporativo. Permitir que cada tienda opere con su URL propia, gestionando catálogos, pedidos y proveedores con total independencia y seguridad de datos.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Aislamiento de Inquilinos &amp; PostgreSQL RLS</span>
          </div>
        </div>

        {/* Visión */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Nuestra Visión
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Posicionar a <strong>Nexus Commerce Suite</strong>, administrado por <strong>Nexus Web Studio</strong>, como el estándar líder en ecosistemas de tiendas virtuales B2B2C, acelerando la transformación digital de comercios con analíticas en tiempo real y sincronización directa con Google Sheets.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ecosistema Conectado Nexus Web Studio</span>
          </div>
        </div>

      </div>

      {/* BLOQUE B: DIAGRAMA INTERACTIVO DE SEGURIDAD RLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
            Arquitectura de Seguridad
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Diagrama Interactivo: PostgreSQL Row-Level Security (RLS)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Haz clic en los diferentes roles para simular qué datos y políticas de aislamiento aplica el motor de PostgreSQL para cada tipo de usuario:
          </p>
        </div>

        {/* Interactive Role Selector for RLS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setActiveRLSRole('superadmin')}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRLSRole === 'superadmin'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Superadmin</span>
          </button>

          <button
            onClick={() => setActiveRLSRole('tenant')}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRLSRole === 'tenant'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Negocio (Tenant)</span>
          </button>

          <button
            onClick={() => setActiveRLSRole('supplier')}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRLSRole === 'supplier'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Proveedor B2B</span>
          </button>

          <button
            onClick={() => setActiveRLSRole('customer')}
            className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRLSRole === 'customer'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cliente Final</span>
          </button>
        </div>

        {/* Dynamic Interactive Diagram Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Database className="w-4 h-4" />
              <span>PostgreSQL Policy Enforcement Engine</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
              STATUS: RLS STRICT ENFORCED
            </span>
          </div>

          {activeRLSRole === 'superadmin' && (
            <div className="space-y-3 animate-fade-in text-xs text-slate-300">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Vista Superadmin (Acceso Global Bypassed por Admin Role)</span>
              </div>
              <p>
                El Superadmin posee privilegio de lectura y auditoría sobre todas las tablas del esquema (<code className="text-amber-300">businesses</code>, <code className="text-amber-300">products</code>, <code className="text-amber-300">orders</code>, <code className="text-amber-300">suppliers</code>).
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400">
                CREATE POLICY superadmin_all ON businesses FOR ALL USING (auth.jwt() -&gt;&gt; 'role' = 'superadmin');
              </div>
            </div>
          )}

          {activeRLSRole === 'tenant' && (
            <div className="space-y-3 animate-fade-in text-xs text-slate-300">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Vista Inquilino / Negocio (Aislamiento por Tenant ID)</span>
              </div>
              <p>
                Cada negocio únicamente puede consultar y modificar sus propias filas. La cláusula <code className="text-amber-300">business_id = current_tenant_id()</code> filtra de forma transparente el 100% de las consultas SQL.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-400">
                CREATE POLICY tenant_isolation ON products FOR ALL USING (business_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));
              </div>
            </div>
          )}

          {activeRLSRole === 'supplier' && (
            <div className="space-y-3 animate-fade-in text-xs text-slate-300">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Vista Proveedor B2B (Insumos &amp; Pedidos de Abastecimiento)</span>
              </div>
              <p>
                Los proveedores leen únicamente las ofertas de suministro y órdenes B2B dirigidas a su ID de proveedor, evitando fuga de precios o competencia desleal entre distribuidores.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-blue-400">
                CREATE POLICY supplier_orders ON supplier_items FOR SELECT USING (supplier_id = auth.uid());
              </div>
            </div>
          )}

          {activeRLSRole === 'customer' && (
            <div className="space-y-3 animate-fade-in text-xs text-slate-300">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Vista Cliente Final (Catálogos Públicos Read-Only &amp; Sus Pedidos)</span>
              </div>
              <p>
                Los clientes pueden navegar libremente por los catálogos públicos activos (<code className="text-amber-300">status = 'active'</code>) y consultar en privado sus órdenes de compra asignadas a su ID de cliente.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-purple-400">
                CREATE POLICY public_catalog ON products FOR SELECT USING (is_active = true);
              </div>
            </div>
          )}

        </div>
      </div>

      {/* BLOQUE C: EXPLICACIÓN DE LA CADENA DE SUMINISTRO CRUZADA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">
            Red de Abastecimiento
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Modelo de Cadena de Suministro Cruzada B2B2C
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Flujo optimizado en 3 etapas integrando proveedores, tiendas virtuales y consumidores:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Etapa 1: Proveedor */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Proveedor (Insumos B2B)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Publica materias primas, productos al por mayor y stock disponible con precios especiales para comercios afiliados.
            </p>
          </div>

          {/* Etapa 2: Negocio Tenant */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Negocio (Virtual Store)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Recibe insumos, actualiza existencias en su catálogo web y sincroniza automáticamente los inventarios en Google Sheets.
            </p>
          </div>

          {/* Etapa 3: Cliente Final */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              3. Cliente Final (B2C)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Realiza compras en la tienda virtual con entrega garantizada, seguimiento de pedido en línea y soporte directo del negocio.
            </p>
          </div>

        </div>
      </div>

      {/* BLOQUE D: MÉTRICAS E IMPACTO CON CONTADORES */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Métricas en Tiempo Real</span>
          <h2 className="text-2xl font-black text-white">Impacto &amp; Rendimiento del Ecosistema</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-3xl font-black font-mono text-amber-400">100%</span>
            <p className="text-xs font-bold text-slate-300">Aislamiento RLS</p>
            <p className="text-[10px] text-slate-400">PostgreSQL Policies</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-3xl font-black font-mono text-amber-400">&lt; 300ms</span>
            <p className="text-xs font-bold text-slate-300">Sincronización API</p>
            <p className="text-[10px] text-slate-400">Google Sheets Sync</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-3xl font-black font-mono text-amber-400">5 Roles</span>
            <p className="text-xs font-bold text-slate-300">Control RBAC</p>
            <p className="text-[10px] text-slate-400">Superadmin a Cliente</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-3xl font-black font-mono text-emerald-400">99.9%</span>
            <p className="text-xs font-bold text-slate-300">Uptime Garantizado</p>
            <p className="text-[10px] text-slate-400">Infraestructura Cloud</p>
          </div>

        </div>
      </div>

    </div>
  );
};
