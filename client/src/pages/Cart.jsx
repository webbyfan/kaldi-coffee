import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './Cart.css';

export default function Cart() {
  const { lang } = useLang();
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    discountAmount,
    promoCode,
    applyPromo,
    removePromo,
    updateQuantity,
    removeFromCart,
    isFreeShipping,
    amountForFreeShipping,
    FREE_SHIPPING_THRESHOLD,
    orderNote,
    setOrderNote,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('addis-standard');

  const getShippingCost = () => {
    if (cartItems.length === 0) return 0;
    if (shippingMethod === 'pickup') return 0;
    if (shippingMethod === 'addis-express') return 250;
    if (shippingMethod === 'regional') return 450;
    // addis-standard
    return isFreeShipping ? 0 : 150;
  };

  const shippingCost = getShippingCost();
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromo(promoInput);
    setPromoFeedback(res);
    if (res.success) {
      setPromoInput('');
    }
  };

  return (
    <main className="cart-page" id="main-content">
      <div className="container">
        {/* Header */}
        <header className="cart-header">
          <span className="section-label">{tr(t.cart.orderTitle, lang)}</span>
          <h1 className="cart-title">{tr(t.cart.shopTitle, lang)}</h1>
          {cartCount > 0 && (
            <p style={{ color: 'var(--color-text-muted)' }}>
              {tr(t.cart.cartCountMsg, lang).replace('{count}', cartCount)}
            </p>
          )}
        </header>

        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <h2>{tr(t.cart.cartEmptyTitle, lang)}</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {tr(t.cart.cartEmptyDesc, lang)}
            </p>
            <Link to="/shop" className="btn btn-primary">
              {tr(t.cart.exploreBtn, lang)}
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left: Cart Items Table */}
            <div>
              {/* Shipping alert */}
              <div
                style={{
                  background: isFreeShipping ? 'var(--color-cream)' : 'var(--color-beige)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem',
                  fontSize: '0.88rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  {isFreeShipping
                    ? tr(t.cart.freeExpress, lang)
                    : tr(t.cart.addMore, lang).replace('{amount}', amountForFreeShipping.toLocaleString())}
                </span>
                <Link to="/shop" style={{ textDecoration: 'underline', fontWeight: 600, color: 'var(--color-coffee)' }}>
                  {tr(t.cart.shopMore, lang)}
                </Link>
              </div>

              <div className="cart-items-box">
                <table className="cart-items-table">
                  <thead>
                    <tr>
                      <th>{tr(t.cart.productCol, lang)}</th>
                      <th>{tr(t.cart.qtyCol, lang)}</th>
                      <th>{tr(t.cart.subCol, lang)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.cartItemId}>
                        <td>
                          <div className="cart-product-cell">
                            <div
                              className="cart-product-thumb"
                              style={{ backgroundColor: item.colorAccent || '#2c1810' }}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <span style={{ position: 'absolute' }}>☕</span>
                            </div>
                            <div className="cart-product-info">
                              <Link to={`/product/${item.productId}`} className="cart-product-title">
                                {item.name}
                              </Link>
                              <span className="cart-product-meta">
                                {item.weight} · {item.grind}
                              </span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-coffee)' }}>
                                {tr(t.general.etb, lang)} {item.price.toLocaleString()} {tr(t.cart.each, lang)}
                              </span>
                              <button
                                className="cart-remove-link"
                                onClick={() => removeFromCart(item.cartItemId)}
                              >
                                {tr(t.cart.remove, lang)}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '4px', width: 'fit-content', background: '#fff' }}>
                            <button
                              style={{ width: '28px', height: '28px' }}
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: 600 }}>
                              {item.quantity}
                            </span>
                            <button
                              style={{ width: '28px', height: '28px' }}
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-espresso)', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>
                          {tr(t.general.etb, lang)} {(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Special Roastery Note */}
              <div className="cart-extra-box">
                <label htmlFor="order-note" className="cart-extra-label">
                  {tr(t.cart.notesLabel, lang)}
                </label>
                <textarea
                  id="order-note"
                  className="cart-notes-input"
                  rows={3}
                  placeholder={tr(t.cart.notesPlacholder, lang)}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                />
              </div>
            </div>

            {/* Right: Order Summary */}
            <aside className="cart-summary-card">
              <h2 className="cart-summary-title">{tr(t.cart.summaryTitle, lang)}</h2>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>{tr(t.cart.bagSubtotal, lang)}</span>
                  <span>{tr(t.general.etb, lang)} {cartSubtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="cart-summary-row" style={{ color: 'var(--color-sage)', fontWeight: 600 }}>
                    <span>{tr(t.cart.promoDiscount, lang)} ({promoCode})</span>
                    <span>- {tr(t.general.etb, lang)} {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {/* Delivery Selector */}
                <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border-light)' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    {tr(t.cart.deliveryDest, lang)}
                  </label>
                  <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.85rem' }}
                  >
                    <option value="addis-standard">
                      {tr(t.cart.delAddisStd, lang)} ({isFreeShipping ? tr(t.cart.free, lang) : `${tr(t.general.etb, lang)} 150`})
                    </option>
                    <option value="addis-express">{tr(t.cart.delAddisVIP, lang)} ({tr(t.general.etb, lang)} 250)</option>
                    <option value="pickup">{tr(t.cart.delPickup, lang)} ({tr(t.cart.free, lang)})</option>
                    <option value="regional">{tr(t.cart.delRegional, lang)} ({tr(t.general.etb, lang)} 450)</option>
                  </select>
                </div>

                <div className="cart-summary-row">
                  <span>{tr(t.cart.shippingCost, lang)}</span>
                  <span>{shippingCost === 0 ? tr(t.cart.free, lang) : `${tr(t.general.etb, lang)} ${shippingCost.toLocaleString()}`}</span>
                </div>

                <div className="cart-summary-row cart-summary-row--total">
                  <span>{tr(t.cart.estTotal, lang)}</span>
                  <span>{tr(t.general.etb, lang)} {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Promo Code Box */}
              <div>
                <form className="cart-promo-form" onSubmit={handleApplyPromo}>
                  <input
                    type="text"
                    className="cart-promo-input"
                    placeholder={tr(t.cart.coupon, lang)}
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-outline-dark cart-promo-btn">
                    {tr(t.cart.apply, lang)}
                  </button>
                </form>
                {promoCode && (
                  <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', color: 'var(--color-sage)' }}>
                    <span>{tr(t.cart.activeCode, lang).replace('{code}', promoCode)}</span>
                    <button onClick={removePromo} style={{ textDecoration: 'underline', color: '#b33939' }}>
                      {tr(t.cart.remove, lang)}
                    </button>
                  </div>
                )}
                {promoFeedback && !promoFeedback.success && (
                  <p style={{ fontSize: '0.75rem', color: '#b33939', marginTop: '0.3rem' }}>
                    {promoFeedback.message}
                  </p>
                )}
              </div>

              {/* Checkout CTA */}
              <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                {tr(t.cart.checkout, lang)}
              </Link>

              {/* Trust Badges */}
              <div className="cart-guarantee-badges">
                <div>{tr(t.cart.badge1, lang)}</div>
                <div>{tr(t.cart.badge2, lang)}</div>
                <div>{tr(t.cart.badge3, lang)}</div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
