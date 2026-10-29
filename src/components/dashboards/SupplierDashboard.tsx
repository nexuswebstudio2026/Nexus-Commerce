import React, { useState } from 'react';
import { Business, ProductService, SupplierRestockRecord, User } from '../../types';
import { Truck, Store, Package, Plus, DollarSign, Layers, CheckCircle2, History, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

interface SupplierDashboardProps {
  supplierUser: User;
  businesses: Business[];
  products: ProductService[];
  restockRecords: SupplierRestockRecord[];
  onAddRestock: (record: Omit<SupplierRestockRecord, 'id' | 'date' | 'totalCost'>) => void;
}

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({
  supplierUser,
  businesses,
  products,
  restockRecords,
  onAddRestock,
}) => {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(businesses[0]?.id || 'biz-aura');
  const [activeTab, setActiveTab] = useState<'supply' | 'history'>('supply');

  // Restock Form Modal state
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [targetProduct, setTargetProduct] = useState<ProductService | null>(null);
  const [unitsToAdd, setUnitsToAdd] = useState<number>(20);
  const [costPriceInput, setCostPriceInput] = useState<number>(50);
  const [notesInput, setNotesInput] = useState<string>('');

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];
  const businessProducts = products.filter(p => p.businessId === selectedBusinessId);
  const supplierRestocks = restockRecords.filter(r => r.supplierId === supplierUser.id);

  const openRestockForm = (prod: ProductService) => {
    setTargetProduct(prod);
    setCostPriceInput(prod.supplierCost || 40);
    setUnitsToAdd(15);
    setNotesInput('Reabastecimiento regular de stock de fábrica.');
    setShowRestockModal(true);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProduct) return;

    onAddRestock({
      supplierId: supplierUser.id,
      supplierName: supplierUser.name,
      businessId: selectedBusiness.id,
      businessName: selectedBusiness.name,
      productId: targetProduct.id,
      productTitle: targetProduct.title,
      unitsAdded: unitsToAdd,
      costPrice: costPriceInput,
      notes: notesInput,
    });

    setShowRestockModal(false);
    setTargetProduct(null);
  };

  const totalSupplierValuation = supplierRestocks.reduce((sum, r) => sum + r.totalCost, 0);

  return (
    <div className="space-y-6">

      {/* Supplier Identity Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/50 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">PORTAL OFICIAL DE PROVEEDORES</div>
              <h2 className="text-2xl font-bold font-serif-luxury">{supplierUser.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5">Gestión de insumos, abastecimiento de inventario y establecimiento de precios de costo.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right px-4 py-2 bg-indigo-900/40 rounded-xl border border-indigo-800">
              <div className="text-xs text-slate-400">Valoración Total Despachada</div>
              <div className="text-lg font-bold font-mono-tabular text-emerald-400">${totalSupplierValuation.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Target Business Selection Dropdown */}
        <div className="pt-3 border-t border-indigo-900/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300">SELECCIONAR NEGOCIO A PROVEER:</span>
          </div>

          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl border border-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('supply')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'supply'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>1. Catálogo Comercia del Negocio Seleccionado ({selectedBusiness.name})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>2. Historial de Despachos Cargados ({supplierRestocks.length})</span>
        </button>
      </div>

      {/* TAB 1: CATÁLOGO DEL NEGOCIO & FORMULARIO RESTOCK */}
      {activeTab === 'supply' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Productos Comercializados por "{selectedBusiness.name}"
              </h3>
              <p className="text-xs text-slate-500">
                Como proveedor, puedes seleccionar cualquier item para **aumentar inventario** e **ingresar tu precio de costo**.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg">
              {businessProducts.length} Ítems Disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessProducts.map((p) => (
              <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{p.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">SKU: {p.sku}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Categoría: {p.category}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Stock Disponible Actual:</span>
                      <strong className="font-mono-tabular text-slate-900 dark:text-white">{p.stockQuantity} {p.unit}s</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Precio de Venta Negocio:</span>
                      <span className="font-mono-tabular font-semibold text-slate-700 dark:text-slate-300">${p.retailPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-700/60 pt-1">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Tu Precio de Costo Actual:</span>
                      <span className="font-mono-tabular font-bold text-indigo-600 dark:text-indigo-400">${p.supplierCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openRestockForm(p)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aumentar Inventario & Fijar Costo</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HISTORIAL DE DESPACHOS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Registro de Lotes Suministrados</h3>
            <p className="text-xs text-slate-500">
              Histórico de incrementos de stock realizados a los negocios de la plataforma.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="p-4">Fecha Despacho</th>
                  <th className="p-4">Negocio Destino</th>
                  <th className="p-4">Producto Insumo</th>
                  <th className="p-4">Unidades Suministradas</th>
                  <th className="p-4">Precio Costo Estipulado</th>
                  <th className="p-4">Valuación Total Lote</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-tabular">
                {supplierRestocks.map((r) => (
                  <tr key={r.id}>
                    <td className="p-4 text-slate-500">{r.date}</td>
                    <td className="p-4 font-sans font-semibold text-slate-900 dark:text-white">{r.businessName}</td>
                    <td className="p-4 font-sans text-indigo-600 dark:text-indigo-400">{r.productTitle}</td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">+{r.unitsAdded}</td>
                    <td className="p-4">${r.costPrice.toFixed(2)}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">${r.totalCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && targetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div>
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest">REGISTRAR SUMINISTRO EN CERO</div>
              <h3 className="text-lg font-bold font-serif-luxury text-slate-900 dark:text-white">
                Abastecer: {targetProduct.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Negocio: {selectedBusiness.name}</p>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Unidades a Añadir al Inventario (+Units)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="5000"
                  value={unitsToAdd}
                  onChange={(e) => setUnitsToAdd(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono-tabular font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Establecer Precio de Costo Unitario ($ USD)
                </label>
                <input
                  type="number"
                  required
                  step="0.5"
                  min="0.1"
                  value={costPriceInput}
                  onChange={(e) => setCostPriceInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl font-mono-tabular font-bold text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nota / Guía de Despacho (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
                />
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Valuación Total del Lote:</span>
                  <strong className="font-mono-tabular text-indigo-600 dark:text-indigo-400">
                    ${(unitsToAdd * costPriceInput).toFixed(2)}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Nuevo Stock Resultante:</span>
                  <span className="font-mono-tabular">{targetProduct.stockQuantity + unitsToAdd} {targetProduct.unit}s</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md"
                >
                  Confirmar Despacho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
