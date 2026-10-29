import React, { useState } from 'react';
import { Business, ProductService, Order, User } from '../../types';
import { Store, ShoppingCart, Tag, Check, ArrowRight, ShieldCheck, Heart, Clock, CreditCard, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface CustomerDashboardProps {
  customerUser: User;
  businesses: Business[];
  products: ProductService[];
  orders: Order[];
  onPlaceOrder: (items: { product: ProductService; qty: number }[], paymentMethod: Order['paymentMethod'], businessId: string) => void;
  onSwitchActiveBusiness: (businessId: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  customerUser,
  businesses,
  products,
  orders,
  onPlaceOrder,
  onSwitchActiveBusiness,
}) => {
  const [activeTab, setActiveTab] = useState<'storefront' | 'my_orders'>('storefront');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Cart state
  const [cart, setCart] = useState<{ product: ProductService; qty: number }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('credit_card');

  const currentBusiness = businesses.find(b => b.id === customerUser.activeBusinessId) || businesses[0];
  const currentProducts = products.filter(p => p.businessId === currentBusiness.id);

  const categories = ['all', ...Array.from(new Set(currentProducts.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'all' 
    ? currentProducts 
    : currentProducts.filter(p => p.category === selectedCategory);

  const addToCart = (product: ProductService) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
    setShowCartDrawer(true);
  };

  const updateCartQty = (prodId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === prodId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (prodId: string) => {
    setCart(cart.filter(item => item.product.id !== prodId));
  };

  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.retailPrice;
    return sum + (price * item.qty);
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onPlaceOrder(cart, paymentMethod, currentBusiness.id);
    setCart([]);
    setShowCartDrawer(false);
    setActiveTab('my_orders');
  };

  const myOrders = orders.filter(o => o.customerId === customerUser.id);

  return (
    <div className="space-y-6">

      {/* Customer Multi-Tenant Membership Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700/50 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={customerUser.avatar} alt={customerUser.name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-500" />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                  MEMBRESÍA MULTI-TIENDA ACTIVA
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif-luxury text-white mt-1">{customerUser.name}</h2>
              <p className="text-xs text-slate-300">Perteneces simultáneamente a 3 establecimientos de lujo registrados.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Mi Carrito</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] flex items-center justify-center font-mono">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Multi-Tenant Store Selector Tabs */}
        <div className="pt-2 border-t border-slate-700/60">
          <div className="text-xs font-semibold text-slate-400 mb-2">SELECCIONAR TIENDA VIRTUAL ASOCIADA:</div>
          <div className="flex flex-wrap gap-2">
            {businesses.map((biz) => {
              const isSelected = biz.id === currentBusiness.id;
              return (
                <button
                  key={biz.id}
                  onClick={() => onSwitchActiveBusiness(biz.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 font-bold shadow-lg ring-2 ring-amber-400'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <img src={biz.logo} alt={biz.name} className="w-5 h-5 rounded object-cover" />
                  <span>{biz.name}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('storefront')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'storefront'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Explorar Tienda: {currentBusiness.name}</span>
        </button>

        <button
          onClick={() => setActiveTab('my_orders')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'my_orders'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Mis Pedidos & Historial Multi-Tienda ({myOrders.length})</span>
        </button>
      </div>

      {/* STOREFRONT VIEW */}
      {activeTab === 'storefront' && (
        <div className="space-y-6">
          {/* Category Filter Pills (Zero-Pill discipline: Segmented control buttons) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Ver Todos' : cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const hasPromo = product.isPromo && product.promoPrice;
              const displayPrice = hasPromo ? product.promoPrice : product.retailPrice;

              return (
                <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    {/* Image Container */}
                    <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {hasPromo && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                          OFERTA ESPECIAL
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        {product.type === 'product' ? 'Producto' : 'Servicio'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      {/* Zero-pill metadata text */}
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{product.category}</span>
                        <span>·</span>
                        <span>Stock: {product.stockQuantity} {product.unit}s</span>
                      </div>

                      <h3 className="text-base font-bold font-serif-luxury text-slate-900 dark:text-white line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Price & Add to Cart Footer */}
                  <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                    <div>
                      {hasPromo && (
                        <span className="text-xs line-through text-slate-400 font-mono-tabular block">
                          ${product.retailPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-lg font-bold font-mono-tabular text-slate-900 dark:text-white">
                        ${displayPrice?.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MY ORDERS VIEW */}
      {activeTab === 'my_orders' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Historial Unificado de Compras en Plataforma</h3>
            <p className="text-xs text-slate-500">
              Órdenes realizadas en Aura Maison, Luminary Tech o Verve Artisan Gastronomy.
            </p>
          </div>

          <div className="space-y-3">
            {myOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                Aún no has realizado pedidos. Explora el catálogo de arriba para realizar tu primera compra.
              </div>
            ) : (
              myOrders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{order.businessName}</span>
                      <div className="font-mono-tabular font-bold text-slate-900 dark:text-white text-sm">{order.id}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-md">
                        {order.status.toUpperCase()}
                      </span>
                      <div className="text-xs text-slate-400 font-mono-tabular mt-1">{order.createdAt}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={it.image} alt={it.title} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-medium text-slate-900 dark:text-white">{it.quantity}x {it.title}</span>
                        </div>
                        <span className="font-mono-tabular font-bold text-slate-900 dark:text-white">${(it.unitPrice * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Pago por: {order.paymentMethod}</span>
                    <span className="font-mono-tabular text-sm text-slate-900 dark:text-white">Total Pagado: ${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cart Side Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold font-serif-luxury text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-500" />
                  Carrito de Compras ({currentBusiness.name})
                </h3>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="text-slate-400 hover:text-slate-900 text-xs font-bold"
                >
                  CERRAR ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">Tu carrito está vacío.</div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const price = item.product.isPromo && item.product.promoPrice ? item.product.promoPrice : item.product.retailPrice;
                    return (
                      <div key={item.product.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <img src={item.product.image} alt={item.product.title} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <div className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{item.product.title}</div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-mono-tabular">${price.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button onClick={() => updateCartQty(item.product.id, -1)} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">-</button>
                          <span className="text-xs font-bold font-mono">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.product.id, 1)} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">+</button>
                          <button onClick={() => removeFromCart(item.product.id)} className="ml-2 text-red-500 text-xs">✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="space-y-1 text-xs">
                  <label className="font-semibold block text-slate-700 dark:text-slate-300">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs"
                  >
                    <option value="credit_card">Tarjeta de Crédito / Débito (Stripe)</option>
                    <option value="apple_pay">Apple Pay / Google Pay</option>
                    <option value="bank_transfer">Transferencia Bancaria Directa</option>
                  </select>
                </div>

                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2">
                  <span>Subtotal a Pagar:</span>
                  <span className="font-mono-tabular text-amber-600 dark:text-amber-400">${cartSubtotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg"
                >
                  Confirmar & Simular Checkout ($ {cartSubtotal.toFixed(2)})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
