import React, { useState, useMemo } from 'react';
import { Business, ProductService } from '../../types';
import { 
  Store, ShieldCheck, TrendingUp, Sparkles, ArrowRight, Layers, Eye, Users, 
  ChevronRight, Search, Building2, Package, RefreshCw, Moon, Sun, Shield, 
  ShoppingBag, Truck, CheckCircle2, Star, Zap, BarChart3, Database
} from 'lucide-react';

interface HomeSectionProps {
  businesses: Business[];
  products: ProductService[];
  onNavigateToBusinesses: () => void;
  onOpenStoreCatalog: (biz: Business) => void;
  onOpenLoginModal: () => void;
}

type AudienceRole = 'buyers' | 'merchants' | 'suppliers';

export const HomeSection: React.FC<HomeSectionProps> = ({
  businesses,
  products,
  onNavigateToBusinesses,
  onOpenStoreCatalog,
  onOpenLoginModal,
}) => {
  // 1. Role Toggle State
  const [activeRole, setActiveRole] = useState<AudienceRole>('buyers');

  // 2. Central Omnichannel Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Active stores count
  const activeStores = useMemo(() => businesses.filter(b => b.status === 'active'), [businesses]);

  // Real-time omnichannel filtering (Products + Businesses)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { matchedBusinesses: [], matchedProducts: [] };

    const q = searchQuery.toLowerCase().trim();

    const matchedBusinesses = businesses.filter(b => 
      b.name.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      (b.city && b.city.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedProducts = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ).slice(0, 5);

    return { matchedBusinesses, matchedProducts };
  }, [searchQuery, businesses, products]);

  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="space-y-12 animate-fade-in pb-8">

      {/* 1. HERO SECTION WITH DYNAMIC ROLE TOGGLE */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-950 text-white shadow-2xl border border-slate-800">
        {/* Backdrop Image & Overlay */}
        <img
          src="/src/assets/images/nexus_prime_hero_1793077099714.jpg"
          alt="JPB Commerce Platform"
          className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-900/60"></div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-5xl space-y-8">
          
          {/* Top Honorific Kicker */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Plataforma Macro Nexus Commerce</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">·</span>
            <span className="text-xs font-medium text-slate-300 hidden sm:inline">
              Ecosistema Multi-Tenant Nexus Web Studio
            </span>
          </div>

          {/* Interactive Role Switcher Toggle */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
              Selecciona tu perfil en la plataforma:
            </label>
            <div className="inline-flex p-1.5 bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl gap-1">
              <button
                onClick={() => setActiveRole('buyers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeRole === 'buyers'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Para Compradores</span>
              </button>

              <button
                onClick={() => setActiveRole('merchants')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeRole === 'merchants'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Para Negocios</span>
              </button>

              <button
                onClick={() => setActiveRole('suppliers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeRole === 'suppliers'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Para Proveedores</span>
              </button>
            </div>
          </div>

          {/* Dynamic Content Based on Role */}
          {activeRole === 'buyers' && (
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-3xl sm:text-5xl font-black font-sans text-white tracking-tight leading-tight">
                Descubre Tiendas Virtuales Exclusivas &amp; Catálogos Directos
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Explora marcas independientes registradas en <strong>JPB Commerce Platform</strong>. Encuentra ofertas en moda, calzado, tecnología y gastronomía con compras directas y soporte garantizado.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onNavigateToBusinesses}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>Explorar {businesses.length} Negocios</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const firstBiz = activeStores[0] || businesses[0];
                    if (firstBiz) onOpenStoreCatalog(firstBiz);
                  }}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer"
                >
                  Ver Catálogo Destacado
                </button>
              </div>
            </div>
          )}

          {activeRole === 'merchants' && (
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-3xl sm:text-5xl font-black font-sans text-white tracking-tight leading-tight">
                Lanza y Escala Tu Tienda Virtual en el Ecosistema JPB
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Aislamiento completo de datos con <strong>PostgreSQL Row-Level Security (RLS)</strong>, sincronización instantánea bidireccional con Google Sheets y panel de control personalizado para tu negocio.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenLoginModal}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>Acceder al Panel de Negocio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onNavigateToBusinesses}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer"
                >
                  Directorio de Tiendas
                </button>
              </div>
            </div>
          )}

          {activeRole === 'suppliers' && (
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-3xl sm:text-5xl font-black font-sans text-white tracking-tight leading-tight">
                Conecta Tu Inventario B2B con la Red de Tiendas JPB
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Suministra directamente tus productos y materias primas a los negocios registrados en la plataforma. Red de abastecimiento optimizada con órdenes automatizadas e inventario cruzado.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenLoginModal}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>Ingresar como Proveedor B2B</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onNavigateToBusinesses}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer"
                >
                  Ver Negocios Objetivo
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 2. CENTRAL OMNICHANNEL SEARCH BAR */}
      <div className="relative z-20 max-w-4xl mx-auto -mt-6 sm:-mt-8 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 sm:p-4">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Buscador Omnicanal: Busca tiendas, productos o categorías en tiempo real..."
              className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-sm border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Omnichannel Live Search Dropdown Results */}
          {hasSearchQuery && (
            <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-4 max-h-96 overflow-y-auto">
              
              {/* Matched Stores */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Negocios Encontrados ({searchResults.matchedBusinesses.length})</span>
                </div>
                {searchResults.matchedBusinesses.length === 0 ? (
                  <p className="text-xs text-slate-400 px-2 italic">No se encontraron tiendas coincidentes.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResults.matchedBusinesses.map(biz => (
                      <div
                        key={biz.id}
                        onClick={() => {
                          onOpenStoreCatalog(biz);
                          setSearchQuery('');
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer flex items-center gap-3"
                      >
                        <img
                          src={biz.logoUrl || biz.logo}
                          alt={biz.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{biz.name}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{biz.category} · {biz.city || 'Colombia'}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matched Products */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                  <Package className="w-3.5 h-3.5 text-amber-500" />
                  <span>Productos &amp; Servicios ({searchResults.matchedProducts.length})</span>
                </div>
                {searchResults.matchedProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 px-2 italic">No se encontraron productos coincidentes.</p>
                ) : (
                  <div className="space-y-1.5">
                    {searchResults.matchedProducts.map(prod => {
                      const ownerBiz = businesses.find(b => b.id === prod.businessId);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => {
                            if (ownerBiz) onOpenStoreCatalog(ownerBiz);
                            setSearchQuery('');
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{prod.title}</h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              Tienda: {ownerBiz?.name || 'Ver catálogo'} · {prod.category}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                              ${prod.retailPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 3. BENTO GRID SECTION - PLATFORM PILLARS */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Pilares Tecnológicos JPB Commerce
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Arquitectura enterprise diseñada para rendimiento, aislamiento de datos y sincronización en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento Card 1 (Span 2 cols): PostgreSQL Row-Level Security (RLS) */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-7 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Seguridad de Aislamiento</span>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Aislamiento de Datos RLS (Row-Level Security)
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Cada tienda virtual opera en un entorno estrictamente delimitado en la base de datos PostgreSQL. Las políticas de seguridad a nivel de filas garantizan que las ventas, clientes y configuraciones de cada negocio sean accesibles únicamente por sus propietarios autorizados.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 relative z-10">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>PostgreSQL 16 + Rules</span>
              </div>
              <span className="text-emerald-400 font-medium">● RBAC Activo de 5 Roles</span>
            </div>
          </div>

          {/* Bento Card 2: Inventario Cruzado Proveedor-Negocio */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Cadena B2B</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Inventario Cruzado Proveedor-Negocio
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Los proveedores registrados alimentan directamente los catálogos de los negocios con stock en tiempo real y precios mayoristas automatizados.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Suministro B2B</span>
              <span className="font-bold text-slate-900 dark:text-white">Automatizado</span>
            </div>
          </div>

          {/* Bento Card 3: Soporte Nativo Dark / Light Mode */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Experiencia Visual</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Modo Día &amp; Noche Nativo
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Diseñado bajo especificaciones de contraste WCAG AA, con paletas ultra pulidas en tonos #FAFAFA y #09090B para legibilidad ejecutiva.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Tailwind v4</span>
              <span className="font-bold text-slate-900 dark:text-white">60-30-10 Balanced</span>
            </div>
          </div>

          {/* Bento Card 4 (Span 2 cols): Analíticas & Google Sheets Sync */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sincronización en Vivo</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Analíticas en Tiempo Real &amp; Google Sheets Sync
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Copia de respaldo bidireccional inmediata. Cada alta de producto o actualización de tienda en el sitio web se refleja instantáneamente en las hojas de Google Sheets conectadas vía API oficial.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
              <span>Google Sheets REST API v4</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Sync Status: OK</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. FEATURED STORES SHOWCASE */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Directorio de Tiendas Destacadas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Negocios activos sincronizados con Google Sheets y la base de datos de JPB Commerce.
            </p>
          </div>
          <button
            onClick={onNavigateToBusinesses}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Todos ({businesses.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.slice(0, 3).map((biz) => (
            <div
              key={biz.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={biz.logoUrl || biz.logo}
                    alt={biz.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{biz.name}</h3>
                    <p className="text-xs text-slate-500">{biz.category} · {biz.city || 'Colombia'}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {biz.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenStoreCatalog(biz)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Ver Catálogo
                </button>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Activo
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
