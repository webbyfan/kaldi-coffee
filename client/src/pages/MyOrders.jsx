import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import './MyOrders.css';

export default function MyOrders() {
  const { userInfo, logout } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DELIVERED'

  useEffect(() => {
    if (!userInfo) {
      setLoading(false);
      return;
    }

    const fetchUserOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const allOrders = await res.json();
          // Filter by logged-in user email or ID
          const userOrders = allOrders.filter(
            (o) =>
              (o.userEmail && o.userEmail.toLowerCase() === userInfo.email.toLowerCase()) ||
              (o.shippingAddress && o.shippingAddress.fullName === userInfo.name)
          );

          if (userOrders.length > 0) {
            setOrders(userOrders);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // Fallback to local storage
      }

      // Read from localStorage
      try {
        const local = JSON.parse(localStorage.getItem('kaldi_orders') || '[]');
        const filteredLocal = local.filter(
          (o) =>
            !o.userEmail ||
            o.userEmail.toLowerCase() === userInfo.email.toLowerCase() ||
            userInfo.isAdmin
        );
        setOrders(filteredLocal);
      } catch (e) {
        setOrders([]);
      }

      setLoading(false);
    };

    fetchUserOrders();
  }, [userInfo]);

  const filteredOrders = useMemo(() => {
    if (filter === 'ACTIVE') return orders.filter((o) => !o.isDelivered);
    if (filter === 'DELIVERED') return orders.filter((o) => o.isDelivered);
    return orders;
  }, [orders, filter]);

  if (!userInfo) {
    return (
      <main className="my-orders-page">
        <div className="container" style={{ maxWidth: '540px', padding: '6rem 1rem', textAlign: 'center' }}>
          <div style={{ background: '#fff', padding: '3.5rem 2rem', borderRadius: '12px', border: '1px solid var(--color-border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)', marginBottom: '0.75rem', fontSize: '2rem' }}>
              Sign In to View Orders
            </h1>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
              Access your personalized order history, delivery tracking, and roasting batch details.
            </p>
            <Link to="/login?redirect=/my-orders" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const initialLetter = userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'K';

  return (
    <main className="my-orders-page" id="main-content">
      <div className="container">
        {/* Profile Card */}
        <div className="orders-profile-card">
          <div className="profile-avatar-row">
            <div className="profile-avatar">{initialLetter}</div>
            <div>
              <h1 className="profile-name">{userInfo.name}</h1>
              <p className="profile-email">{userInfo.email}</p>
              <span className="profile-badge">
                {userInfo.isAdmin ? '👑 Kaldi Master Admin' : '✨ Specialty Coffee Member'}
              </span>
            </div>
          </div>

          <div className="profile-actions">
            {userInfo.isAdmin && (
              <Link to="/admin" className="btn btn-outline-dark" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
                Admin Portal
              </Link>
            )}
            <Link to="/shop" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
              Browse Catalog
            </Link>
            <button
              type="button"
              className="btn btn-outline-dark"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
              onClick={logout}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Orders Header & Filter Tabs */}
        <div className="orders-header-row">
          <div>
            <span className="section-label" style={{ marginBottom: '0.25rem', display: 'block' }}>Account History</span>
            <h2 className="orders-title">Your Orders ({orders.length})</h2>
          </div>

          {orders.length > 0 && (
            <div className="orders-tabs" role="tablist">
              <button
                type="button"
                className={`orders-tab-btn ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All ({orders.length})
              </button>
              <button
                type="button"
                className={`orders-tab-btn ${filter === 'ACTIVE' ? 'active' : ''}`}
                onClick={() => setFilter('ACTIVE')}
              >
                In Transit ({orders.filter((o) => !o.isDelivered).length})
              </button>
              <button
                type="button"
                className={`orders-tab-btn ${filter === 'DELIVERED' ? 'active' : ''}`}
                onClick={() => setFilter('DELIVERED')}
              >
                Delivered ({orders.filter((o) => o.isDelivered).length})
              </button>
            </div>
          )}
        </div>

        {/* Orders Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            Loading your order history...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h3 className="empty-title">
              {filter === 'ALL' ? 'No Orders Placed Yet' : 'No Orders In This Category'}
            </h3>
            <p className="empty-text">
              {filter === 'ALL'
                ? 'You have not placed any orders yet. Discover our fresh seasonal harvests from Yirgacheffe, Sidama, and Guji.'
                : 'You have no orders currently in this status.'}
            </p>
            <Link to="/shop" className="btn btn-primary" style={{ padding: '0.85rem 2rem' }}>
              Explore Coffee Menu
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order, idx) => {
              const displayId = order.orderId || (order._id ? order._id.slice(-8).toUpperCase() : `#KL-${1000 + idx}`);
              const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent');

              const items = order.items || order.orderItems || [];

              return (
                <article key={order._id || idx} className="order-card">
                  <header className="order-card__header">
                    <div className="order-id-date">
                      <span className="order-num">#{displayId}</span>
                      <span className="order-date">Placed on {orderDate}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {order.isPaid ? (
                        <span className="order-status-badge delivered" style={{ background: '#dcfce7', color: '#166534' }}>
                          ✓ Payment Verified
                        </span>
                      ) : order.paymentMethod === 'cod' ? (
                        <span className="order-status-badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>
                          💵 Cash on Delivery
                        </span>
                      ) : (
                        <span className="order-status-badge processing" style={{ background: '#fef3c7', color: '#b45309' }}>
                          ⏳ Payment Pending Verification
                        </span>
                      )}

                      {order.isDelivered ? (
                        <span className="order-status-badge delivered">
                          ✓ Delivered
                        </span>
                      ) : (
                        <span className="order-status-badge processing">
                          🚚 Out for Delivery
                        </span>
                      )}
                    </div>
                  </header>

                  <div className="order-card__body">
                    <div className="order-items-list">
                      {items.length > 0 ? (
                        items.map((item, i) => (
                          <div key={i} className="order-item-row">
                            <div className="order-item-info">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="order-item-img"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="order-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>
                                  ☕
                                </div>
                              )}
                              <div>
                                <h4 className="order-item-name">{item.name}</h4>
                                <p className="order-item-sub">
                                  {item.weight || '250g'} · {item.grind || 'Whole Bean'} · Qty: {item.quantity || 1}
                                </p>
                              </div>
                            </div>

                            <span className="order-item-price">
                              ETB {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="order-item-row">
                          <div className="order-item-info">
                            <div className="order-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>
                              ☕
                            </div>
                            <div>
                              <h4 className="order-item-name">Specialty Coffee Batch</h4>
                              <p className="order-item-sub">{order.itemsCount || 1} package(s)</p>
                            </div>
                          </div>
                          <span className="order-item-price">
                            ETB {(order.total || order.totalPrice || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <footer className="order-card__footer">
                    <div className="order-shipping-meta">
                      <span>
                        📍 Delivery: <strong>{order.subcity || order.shippingAddress?.city || 'Addis Ababa'}</strong>
                        {order.streetAddress ? ` (${order.streetAddress})` : ''}
                      </span>
                      <span style={{ margin: '0 0.5rem' }}>·</span>
                      <span>
                        Payment: <strong>{order.paymentMethod || 'Cash on Delivery'}</strong>
                      </span>
                    </div>

                    <div className="order-total-block">
                      <span className="order-total-label">Total Amount</span>
                      <span className="order-total-amount">
                        ETB {(order.total || order.totalPrice || 0).toLocaleString()}
                      </span>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
