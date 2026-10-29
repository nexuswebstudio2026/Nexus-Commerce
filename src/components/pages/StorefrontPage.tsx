import React, { useState } from 'react';
import { Business, ProductService, Order, User } from '../../types';
import { Store, ShoppingCart, Tag, Filter, CheckCircle2, ChevronRight, ArrowLeft, Star, Clock } from 'lucide-react';

interface StorefrontPageProps {
  business: Business;
  products: ProductService[];
  currentUser: User;
  onBackToDirectory: () => void;
  onPlaceOrder: (items: { product: ProductService; qty: number }[], paymentMethod: Order['paymentMethod'], businessId: string) => void;
}

export const StorefrontPage: React.FC<StorefrontPageProps> = ({
  business,
  products,
  currentUser,
  onBackToDirectory,
  onPlaceOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ product: ProductService; qty: number }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('credit_card');

  const storeProducts = products.filter(p => p.businessId === business.id);
  const categories = ['all', ...Array.from(new Set(storeProducts.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'all'
    ? storeProducts
    : storeProducts.filter(p => p.category === selectedCategory);

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
    onPlaceOrder(cart, paymentMethod, business.id);
    setCart([]);
    setShowCartDrawer(false);
    alert(`¡Gracias por tu compra en ${business.name}! Tu pedido se ha registrado.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* URL Breadcrumb & Navigation Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-slate-500 font-mono border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button onClick={onBackToDirectory} className="hover:text-amber-500 flex items-center gap-1 font-sans font-bold cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Jessica Paola Enterprise</span>
          </button>
          <span>/</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">{business.slug}</span>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">inicio</span>
        </div>

        <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-[11px] font-sans font-bold">
          URL Dedicada: https://jessicapaola.io/{business.slug}/inicio
        </div>
      </div>

      {/* Store Banner Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img src={business.logo} alt={business.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-md" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{business.category}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury">{business.name}</h1>
            <p className="text-xs text-slate-300 max-w-xl">{business.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="relative flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Carrito de Tienda</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] flex items-center justify-center font-mono">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Segmented Control */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
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
            {cat === 'all' ? 'Ver Catálogo Completo' : cat}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const hasPromo = product.isPromo && product.promoPrice;
          const displayPrice = hasPromo ? product.promoPrice : product.retailPrice;

          return (
            <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
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
                </div>

                <div className="p-5 space-y-2">
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
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold font-serif-luxury text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-500" />
                  Carrito ({business.name})
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
                  <span>Total a Pagar:</span>
                  <span className="font-mono-tabular text-amber-600 dark:text-amber-400">${cartSubtotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg"
                >
                  Procesar Compra Directa
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
