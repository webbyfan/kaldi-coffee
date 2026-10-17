import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './CartDrawer.css';

export default function CartDrawer() {
  const { lang } = useLang();
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    isFreeShipping,
    amountForFreeShipping,
    FREE_SHIPPING_THRESHOLD,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    toastMessage,
  } = useCart();

  const progressPct = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <>
      {/* Background Overlay */}
      <div
        className={`cart-overlay ${isDrawerOpen ? 'is-active' : ''}`}
        onClick={closeDrawer}
        aria-hidden={!isDrawerOpen}
      />

      {/* Slide-out Drawer */}
      <aside
        className={`cart-drawer ${isDrawerOpen ? 'is-active' : ''}`}
        aria-label="Shopping Cart Drawer"
        aria-hidden={!isDrawerOpen}
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title">
            <span>{tr(t.cart.title, lang)}</span>
            {cartCount > 0 && <span className="cart-drawer__count-badge">{cartCount}</span>}
          </div>
          <button
            className="cart-drawer__close"
            onClick={closeDrawer}
            aria-label="Close cart drawer"
          >
            &times;
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="cart-drawer__shipping-bar">
          <div className="cart-drawer__shipping-text">
            <span>
              {isFreeShipping
                ? tr(t.cart.freeUnlock, lang)
                : tr(t.cart.addMore, lang).replace('{amount}', amountForFreeShipping.toLocaleString())}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="cart-drawer__progress-track">
            <div className="cart-drawer__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Body */}
        <div className="cart-drawer__body">
          {cartItems.length === 0 ? (
            <div className="cart-drawer__empty">
              <svg
                className="cart-drawer__empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)' }}>
                {tr(t.cart.empty, lang)}
              </h3>
              <p style={{ fontSize: '0.88rem' }}>
                {tr(t.cart.emptyDesc, lang)}
              </p>
              <Link
                to="/shop"
                className="btn btn-primary"
                onClick={closeDrawer}
                style={{ marginTop: '0.5rem' }}
              >
                {tr(t.cart.shopBtn, lang)}
              </Link>
            </div>
          ) : (
            <div className="cart-drawer__items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.cartItemId}>
                  {/* Thumbnail */}
                  <div
                    className="cart-item__img-box"
                    style={{ backgroundColor: item.colorAccent || '#2c1810' }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <span style={{ position: 'absolute', pointerEvents: 'none' }}>☕</span>
                  </div>

                  {/* Details */}
                  <div className="cart-item__details">
                    <Link
                      to={`/product/${item.productId}`}
                      className="cart-item__name"
                      onClick={closeDrawer}
                    >
                      {item.name}
                    </Link>
                    <div className="cart-item__meta">
                      {item.weight} · {item.grind}
                    </div>
                    <div className="cart-item__price">
                      {tr(t.general.etb, lang)} {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="cart-item__actions">
                    <div className="cart-item__qty">
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="cart-item__qty-val">{item.quantity}</span>
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-item__remove"
                      onClick={() => removeFromCart(item.cartItemId)}
                    >
                      {tr(t.cart.remove, lang)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__subtotal-row">
              <span className="cart-drawer__subtotal-label">{tr(t.cart.subtotal, lang)}</span>
              <span className="cart-drawer__subtotal-val">{tr(t.general.etb, lang)} {cartSubtotal.toLocaleString()}</span>
            </div>
            <p className="cart-drawer__shipping-note">
              {tr(t.cart.shippingNote, lang)}
            </p>
            <div className="cart-drawer__buttons">
              <Link
                to="/checkout"
                className="btn btn-primary"
                onClick={closeDrawer}
                style={{ width: '100%' }}
              >
                {tr(t.cart.checkout, lang)}
              </Link>
              <Link
                to="/cart"
                className="btn btn-outline-dark"
                onClick={closeDrawer}
                style={{ width: '100%' }}
              >
                {tr(t.cart.viewCart, lang)}
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="cart-toast" role="status" aria-live="polite">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
