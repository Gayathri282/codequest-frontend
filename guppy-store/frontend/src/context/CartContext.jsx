import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product === product._id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty };
        return updated;
      }
      return [...prev, {
        product: product._id,
        name:    product.name,
        image:   product.images?.[0] || '',
        price:   product.price,
        qty,
        stock:   product.stock,
      }];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => prev.map(i => i.product === productId ? { ...i, qty } : i));
  };

  const removeFromCart = (productId) =>
    setCart(prev => prev.filter(i => i.product !== productId));

  const clearCart = () => setCart([]);

  const total    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount= cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
