import React, { useState, useMemo } from 'react';
import { Business, ProductService } from '../../types';
import { 
  Store, Eye, Search, Filter, CheckCircle2, Package, X, ArrowUpRight, 
  Star, Truck, Building2, MapPin, ArrowUpDown, ExternalLink, Sparkles, Send, Check 
} from 'lucide-react';

interface RegisteredBusinessesSectionProps {
  businesses: Business[];
  products: ProductService[];
  selectedBizCatalogModal?: Business | null;
  onOpenStoreCatalog: (biz: Business) => void;
  onCloseStoreCatalog: () => void;
  onOpenStorefront?: (biz: Business) => void;
}

type SortOption = 'recent' | 'rating' | 'alphabetical';

export const RegisteredBusinessesSection: React.FC<RegisteredBusinessesSectionProps> = ({
  businesses,
  products,
  selectedBizCatalogModal,
  onOpenStoreCatalog,
  onCloseStoreCatalog,
  onOpenStorefront,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [supplierModalBiz, setSupplierModalBiz] = useState<Business | null>(null);
  const [supplierSubmitted, setSupplierSubmitted] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(businesses.map(b => b.category)))];
  }, [businesses]);

  // Filter and sort businesses
  const filteredBusinesses = useMemo(() => {
    let result = businesses.filter(b => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        b.name.toLowerCase().includes(q) || 
        b.category.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        (b.city && b.city.toLowerCase().includes(q));
      
      const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
    }

    return result;
  }, [businesses, searchTerm, categoryFilter, sortBy]);

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierSubmitted(true);
    setTimeout(() => {
      setSupplierSubmitted(false);
      setSupplierModalBiz(null);
    }, 2200);
  };

  const activeCatalogProducts = selectedBizCatalogModal 
    ? products.filter(p => p.businessId === selectedBizCatalogModal.id)
    : [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Directorio Oficial Nexus Commerce Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Directorio Interactivo de Negocios &amp; Tiendas Virtuales
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Explora las marcas y tiendas virtuales administradas por Nexus Web Studio. Consulta catálogos en tiempo real o conecta directamente como proveedor B2B.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-400 font-medium block">Total Tiendas</span>
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">{businesses.length} Tenants</span>
          </div>
        </div>
      </div>

      {/* TOP CONTROL BAR: SEARCH, CATEGORIES, SORTING */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar tienda por nombre, ciudad o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
            />
          </div>

          {/* Sort Dropdown Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" /> Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
            >
              <option value="rating">Mejor Valorados (Puntuación)</option>
              <option value="recent">Más Recientes</option>
              <option value="alphabetical">Orden Alfabético (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Interactive Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
          <span className="text-xs text-slate-400 font-semibold shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Categoría:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'Todas las Categorías' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* BENTO GRID OF TENANT BUSINESS CARDS */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No se encontraron negocios</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Intenta cambiar los términos de búsqueda o selecciona otra categoría en el filtro superior.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors mt-2"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((biz, idx) => {
            const bizProducts = products.filter(p => p.businessId === biz.id);
            const isFeatured = idx === 0; // Highlight first card in Bento style
            const ratingScore = biz.rating || 4.9;

            return (
              <div
                key={biz.id}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group ${
                  isFeatured ? 'md:col-span-2 lg:col-span-1 bg-gradient-to-b from-amber-500/5 to-transparent dark:from-amber-500/10' : ''
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Top Row: Logo, Name, Category Badge & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={biz.logoUrl || biz.logo}
                        alt={biz.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {biz.name}
                        </h3>
                        
                        {/* Unboxed Metadata Line */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{biz.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {biz.city || 'Colombia'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Stars Score */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="font-mono">{ratingScore.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 font-normal">
                    {biz.description}
                  </p>

                  {/* Products Count Indicator */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 font-medium">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      Catálogo: {bizProducts.length} Ítems
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Estado: Activo
                    </span>
                  </div>

                </div>

                {/* TWO PRIMARY ACTION BUTTONS: "Ver Catálogo" AND "Suministrar como Proveedor" */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenStoreCatalog(biz)}
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Catálogo</span>
                  </button>

                  <button
                    onClick={() => setSupplierModalBiz(biz)}
                    className="w-full py-2.5 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-800 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">Suministrar B2B</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* SUPPLIER MODAL B2B CONNECT */}
      {supplierModalBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <button
              onClick={() => setSupplierModalBiz(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Propuesta B2B</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Suministrar a {supplierModalBiz.name}
                </h3>
              </div>
            </div>

            {supplierSubmitted ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">¡Propuesta Enviada!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  El equipo de administración de {supplierModalBiz.name} revisará tu catálogo de suministro B2B.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSupplierSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tu Nombre o Empresa Proveedora:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Distribuidora Textil del Valle S.A.S."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Correo de Contacto B2B:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="proveedor@empresa.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Productos / Insumos que Ofreces:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe los productos, precios al por mayor y condiciones de entrega..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Propuesta B2B</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* CATALOG PREVIEW MODAL */}
      {selectedBizCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] flex flex-col justify-between space-y-4">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedBizCatalogModal.logoUrl || selectedBizCatalogModal.logo}
                  alt={selectedBizCatalogModal.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Catálogo: {selectedBizCatalogModal.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedBizCatalogModal.category} · {selectedBizCatalogModal.city || 'Colombia'}</p>
                </div>
              </div>

              <button
                onClick={onCloseStoreCatalog}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Products List */}
            <div className="overflow-y-auto space-y-3 pr-2 flex-1 max-h-96">
              {activeCatalogProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Esta tienda aún no tiene productos publicados en su catálogo.
                </div>
              ) : (
                activeCatalogProducts.map(p => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</h4>
                      <p className="text-[11px] text-slate-500">{p.description}</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 shrink-0">
                      ${p.retailPrice.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={onCloseStoreCatalog}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Cerrar Ventana
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
