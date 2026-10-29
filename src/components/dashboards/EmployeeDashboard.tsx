import React, { useState } from 'react';
import { Order, ProductService, User } from '../../types';
import { ShoppingBag, Clock, CheckCircle2, Truck, AlertCircle, Search, ShieldAlert, CreditCard, Send, Plus } from 'lucide-react';

interface EmployeeDashboardProps {
  employeeUser: User;
  orders: Order[];
  products: ProductService[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onPOSCreateOrder: (items: { product: ProductService; qty: number }[], customerEmail: string) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  employeeUser,
  orders,
  products,
  onUpdateOrderStatus,
  onPOSCreateOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'pos' | 'catalog_view'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  
  // POS State
  const [posCart, setPosCart] = useState<{ product: ProductService; qty: number }[]>([]);
  const [posCustomerEmail, setPosCustomerEmail] = useState('cliente.mostrador@gmail.com');

  const bizOrders = orders.filter(o => o.businessId === employeeUser.activeBusinessId);
  const bizProducts = products.filter(p => p.businessId === employeeUser.activeBusinessId);

  const permissions = employeeUser.permissions || [];
  const canManageOrders = permissions.includes('manage_orders');

  const addToPOSCart = (prod: ProductService) => {
    const existing = posCart.find(item => item.product.id === prod.id);
    if (existing) {
      setPosCart(posCart.map(item => item.product.id === prod.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setPosCart([...posCart, { product: prod, qty: 1 }]);
    }
  };

  const removeFromPOSCart = (prodId: string) => {
    setPosCart(posCart.filter(item => item.product.id !== prodId));
  };

  const handlePOSCheckout = () => {
    if (posCart.length === 0) return;
    onPOSCreateOrder(posCart, posCustomerEmail);
    setPosCart([]);
    alert('¡Venta realizada exitosamente en Terminal POS Mostrador!');
  };

  const filteredOrders = bizOrders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Employee Identity Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={employeeUser.avatar} alt={employeeUser.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{employeeUser.name}</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded uppercase">
                Panel Empleado Operativo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Permisos otorgados por el dueño: {permissions.join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'orders' 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Cola de Pedidos ({bizOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === 'pos' 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Terminal POS Mostrador
          </button>
        </div>
      </div>

      {/* Permission Security Check Warning */}
      {!canManageOrders && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <span>
            <strong>Atención RBAC:</strong> Tu usuario no cuenta con la bandera <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">manage_orders</code>. Solo puedes consultar información en modo lectura.
          </span>
        </div>
      )}

      {/* TAB 1: COLA DE PEDIDOS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código de pedido o nombre del cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                No hay pedidos en la cola actual.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-tabular font-bold text-sm text-slate-900 dark:text-white">{order.id}</span>
                      <span className="text-xs text-slate-500 font-mono-tabular">{order.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Estado:</span>
                      <select
                        disabled={!canManageOrders}
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ${
                          order.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="processing">En Procesamiento</option>
                        <option value="shipped">Despachado</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">Cliente Solicitante:</div>
                      <div className="font-semibold text-slate-900 dark:text-white">{order.customerName}</div>
                      <div className="text-slate-500 font-mono">{order.customerEmail}</div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-1">Detalle de Items:</div>
                      <div className="space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                            <span>{it.quantity}x {it.title}</span>
                            <span className="font-mono-tabular">${(it.unitPrice * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Método de Pago: <strong className="uppercase">{order.paymentMethod.replace('_', ' ')}</strong></span>
                    <div className="text-sm font-bold font-mono-tabular text-slate-900 dark:text-white">
                      Total: ${order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TERMINAL POS MOSTRADOR */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Seleccionar Productos para Venta Directa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bizProducts.map((p) => (
                <div key={p.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{p.title}</div>
                      <div className="font-mono-tabular text-xs font-bold text-amber-600 dark:text-amber-400">
                        ${(p.isPromo && p.promoPrice ? p.promoPrice : p.retailPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={!canManageOrders}
                    onClick={() => addToPOSCart(p)}
                    className="p-2 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg shrink-0 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* POS Cart Sidebar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              Ticket de Venta POS
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {posCart.length === 0 ? (
                <div className="text-xs text-slate-400 italic text-center py-6">Ticket vacío. Selecciona productos a la izquierda.</div>
              ) : (
                posCart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{item.product.title}</div>
                      <div className="text-slate-400 font-mono-tabular">{item.qty} x ${item.product.retailPrice}</div>
                    </div>
                    <button
                      onClick={() => removeFromPOSCart(item.product.id)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>Total Ticket:</span>
                <span className="font-mono-tabular">
                  ${posCart.reduce((sum, item) => sum + (item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.retailPrice) * item.qty, 0).toFixed(2)}
                </span>
              </div>

              <button
                disabled={!canManageOrders || posCart.length === 0}
                onClick={handlePOSCheckout}
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                Cobrar & Generar Factura POS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
