import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'kaldi_cart_v1';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [orderNote, setOrderNote] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore storage errors
    }
  }, [cartItems]);

  // Total quantity count in cart
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Subtotal in ETB
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calculate discount
  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);

  // Free shipping threshold in ETB
  const FREE_SHIPPING_THRESHOLD = 2000;
  const isFreeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD;
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((cur) => (cur === message ? null : cur));
    }, 3500);
  };

  /**
   * Add item to cart
   * @param {Object} product
   * @param {Object} options { weight: '250g', grind: 'Whole Bean', quantity: 1 }
   */
  const addToCart = (product, { weight = '250g', grind = 'Whole Bean', quantity = 1 } = {}) => {
    const unitPrice = product.prices[weight] || Object.values(product.prices)[0] || 650;
    const cartItemId = `${product.id}-${weight}-${grind.toLowerCase().replace(/\s+/g, '-')}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            productId: product.id,
            name: product.name,
            subtitle: product.subtitle || product.region,
            origin: product.origin || 'Ethiopia',
            region: product.region,
            image: product.image,
            colorAccent: product.colorAccent || '#4a2c1a',
            weight,
            grind,
            price: unitPrice,
            quantity,
          },
        ];
      }
    });

    showToast(`Added ${quantity}× ${product.name} (${weight}) to your cart.`);
    setIsDrawerOpen(true);
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setDiscountPercent(0);
    setOrderNote('');
  };

  const applyPromo = (code) => {
    const trimmed = (code || '').trim().toUpperCase();
    if (trimmed === 'KALDI10' || trimmed === 'WELCOME10') {
      setPromoCode(trimmed);
      setDiscountPercent(10);
      showToast('🎉 Promo code KALDI10 applied: 10% discount!');
      return { success: true, message: '10% discount applied!' };
    }
    if (trimmed === 'ETHIOPIA15') {
      setPromoCode(trimmed);
      setDiscountPercent(15);
      showToast('🎉 Promo code ETHIOPIA15 applied: 15% discount!');
      return { success: true, message: '15% discount applied!' };
    }
    return { success: false, message: 'Invalid promo code. Try KALDI10 or WELCOME10' };
  };

  const removePromo = () => {
    setPromoCode('');
    setDiscountPercent(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        discountAmount,
        discountPercent,
        promoCode,
        isFreeShipping,
        amountForFreeShipping,
        FREE_SHIPPING_THRESHOLD,
        isDrawerOpen,
        toastMessage,
        orderNote,
        setOrderNote,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
