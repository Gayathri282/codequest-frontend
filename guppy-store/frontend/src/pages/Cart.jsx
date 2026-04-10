import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, updateQty, removeFromCart, total, itemCount } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <img src="/fish.svg" alt="Empty cart — add some guppies to get started" className="w-16 h-16 mx-auto opacity-20 mb-4" />
      <h2 className="mt-4 text-xl font-semibold text-white">Your cart is empty</h2>
      <p className="text-white/40 mt-1 text-sm">Add some guppies to get started!</p>
      <Link to="/"
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-[0.98] shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)',
          color: '#000',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '12px 24px',
          boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
        }}>Shop Breeds</Link>
    </div>
  );

  const shipping = total < 500 ? 60 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Your Cart <span className="text-white/40 font-normal text-lg">({itemCount} items)</span></h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.product} className="flex gap-4 p-4 rounded-2xl" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}> {/* Dark gray background, subtle white border */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-ink-lighter flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src="/fish.svg" alt={`${item.name} photo placeholder`} className="w-10 h-10 opacity-25" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm line-clamp-1">{item.name}</h3>
                <p className="font-semibold mt-0.5 text-sm" style={{ color: '#D4AF37' }}>₹{item.price.toLocaleString('en-IN')}</p> {/* Gold price text */}

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-ink-border rounded-lg overflow-hidden text-sm bg-ink-lighter">
                    <button onClick={() => updateQty(item.product, item.qty - 1)}
                      className="px-2.5 py-1 hover:bg-white/5 text-white/60 transition">−</button>
                    <span className="px-3 py-1 border-x border-ink-border font-medium text-white">{item.qty}</span>
                    <button onClick={() => updateQty(item.product, item.qty + 1)}
                      className="px-2.5 py-1 hover:bg-white/5 text-white/60 transition" disabled={item.qty >= item.stock}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.product)}
                    className="text-white/30 hover:text-white/60 transition-colors p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="text-right text-sm font-bold text-white flex-shrink-0">
                ₹{(item.price * item.qty).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-2xl p-5 h-fit" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.05)' }}> {/* Dark gray background, subtle white border */}
          <h2 className="font-semibold text-white mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-white/50">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span style={{ color: '#D4AF37' }}>Free</span> : `₹${shipping}`}</span> {/* Gold text for free shipping */}
            </div>
            {shipping > 0 && (
              <p className="text-xs text-white/25">Free shipping on orders over ₹500</p>
            )}
            <hr className="border-ink-border my-2" />
            <div className="flex justify-between font-bold text-white text-base">
              <span>Total</span>
              <span>₹{(total + shipping).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} // Checkout button
            className="w-full mt-5 justify-center flex items-center gap-2 rounded-full transition-all active:scale-[0.98] shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)',
              color: '#000',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '12px 24px',
              boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
            }}>
            <ShoppingBag size={16} /> Checkout {/* Black icon */}
          </button>
        </div>
      </div>
    </div>
  );
}
