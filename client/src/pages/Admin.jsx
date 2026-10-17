import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function Admin() {
  const { userInfo } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (userInfo?.isAdmin) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [userInfo]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${userInfo?.token || ''}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      // Fallback to locally stored orders if backend/MongoDB is down
      try {
        const local = JSON.parse(localStorage.getItem('kaldi_orders') || '[]');
        setOrders(
          local.map((o) => ({
            _id: o._id || o.orderId,
            orderRef: o.orderId || o.orderRef,
            createdAt: o.createdAt || new Date().toISOString(),
            totalPrice: o.total || 0,
            isDelivered: o.isDelivered || false,
            isPaid: o.isPaid || false,
            paymentStatus: o.paymentStatus || (o.isPaid ? 'Paid & Verified' : 'Pending Verification'),
            transactionId: o.transactionId || '',
            paymentMethod: o.paymentMethod || 'Cash on Delivery',
            shippingAddress: {
              fullName: o.customerName || 'Walk-in',
              city: o.subcity || 'Addis Ababa',
              phone: o.phone || 'N/A',
            },
            orderItems: Array(o.itemsCount || 1).fill({ name: 'Specialty Coffee Order', qty: 1 }),
          }))
        );
      } catch (e) {
        setOrders([]);
      }
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}/verify-payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userInfo?.token || ''}`,
        },
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) => prev.map((o) => (o._id === id ? updatedOrder : o)));
      }
    } catch (err) {
      console.warn('Backend payment verification failed, applying local update:', err);
    }

    // Synchronize local order records
    try {
      const local = JSON.parse(localStorage.getItem('kaldi_orders') || '[]');
      const updatedLocal = local.map((o) =>
        o._id === id || o.orderId === id
          ? { ...o, isPaid: true, paymentStatus: 'Paid & Verified', paidAt: new Date().toISOString() }
          : o
      );
      localStorage.setItem('kaldi_orders', JSON.stringify(updatedLocal));
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? { ...o, isPaid: true, paymentStatus: 'Paid & Verified', paidAt: new Date().toISOString() }
            : o
        )
      );
    } catch (e) {}
  };

  const handleDeliver = async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}/deliver`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userInfo?.token || ''}`,
        },
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) => prev.map((o) => (o._id === id ? updatedOrder : o)));
      }
    } catch (err) {
      console.warn('Backend update failed, applying local update:', err);
    }

    // Synchronize local order records so the customer's My Orders page updates immediately
    try {
      const local = JSON.parse(localStorage.getItem('kaldi_orders') || '[]');
      const updatedLocal = local.map((o) =>
        o._id === id || o.orderId === id
          ? { ...o, isDelivered: true, deliveredAt: new Date().toISOString() }
          : o
      );
      localStorage.setItem('kaldi_orders', JSON.stringify(updatedLocal));
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? { ...o, isDelivered: true, deliveredAt: new Date().toISOString() }
            : o
        )
      );
    } catch (e) {}
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => !o.isDelivered).length;
  const unverifiedPayments = orders.filter(
    (o) => !o.isPaid && o.paymentMethod !== 'cod'
  ).length;

  if (!userInfo || !userInfo.isAdmin) {
    return (
      <main className="admin-page">
        <div className="container" style={{ maxWidth: '560px', textAlign: 'center', padding: '6rem 1rem' }}>
          <div style={{ background: '#fff', padding: '3.5rem 2.5rem', borderRadius: '12px', border: '1px solid var(--color-border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)', marginBottom: '0.75rem', fontSize: '2rem' }}>
              Admin Access Required
            </h1>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '2rem', fontSize: '0.95rem' }}>
              This portal is restricted to authorized managers. Please log in with your administrator account.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.85rem 2rem', display: 'inline-block' }}>
              Log In as Admin
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="container">
        <header className="admin-header">
          <div>
            <span className="section-label">Management Portal</span>
            <h1>Roastery Orders & Payment Verification</h1>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading dashboard...</div>
        ) : error ? (
          <div style={{ color: 'red', textAlign: 'center', padding: '3rem' }}>{error}</div>
        ) : (
          <>
            <div className="admin-stats">
              <div className="stat-card">
                <span className="stat-card__label">Total Orders</span>
                <span className="stat-card__value">{totalOrders}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Pending Payment Verification</span>
                <span className="stat-card__value" style={{ color: unverifiedPayments > 0 ? '#d97706' : '#059669' }}>
                  {unverifiedPayments}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Pending Deliveries</span>
                <span className="stat-card__value" style={{ color: pendingOrders > 0 ? '#d9534f' : 'inherit' }}>
                  {pendingOrders}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Total Revenue</span>
                <span className="stat-card__value">ETB {totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment Method & TxID</th>
                    <th>Payment Verification</th>
                    <th>Delivery Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>No orders found.</td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const displayId = (order.orderRef || order._id || '').substring(0, 10).toUpperCase();
                      const isPaid = order.isPaid;
                      const hasTx = !!order.transactionId;

                      return (
                        <tr key={order._id}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {displayId}
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{order.shippingAddress.fullName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.shippingAddress.phone}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.shippingAddress.city}</div>
                          </td>
                          <td style={{ fontWeight: 700 }}>ETB {order.totalPrice.toLocaleString()}</td>
                          <td>
                            <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>
                              {order.paymentMethod}
                            </div>
                            {hasTx ? (
                              <div style={{ marginTop: '4px' }}>
                                <code
                                  style={{
                                    background: '#fef3c7',
                                    padding: '2px 6px',
                                    borderRadius: '3px',
                                    fontSize: '0.8rem',
                                    color: '#92400e',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                  title="Click to copy Transaction ID"
                                  onClick={() => copyToClipboard(order.transactionId, order._id)}
                                >
                                  {order.transactionId}
                                </code>
                                <span style={{ fontSize: '0.72rem', color: '#b45309', marginLeft: '6px' }}>
                                  {copiedId === order._id ? '✓ Copied!' : '(Copy)'}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {order.paymentMethod === 'cod' ? 'Pay upon delivery' : 'No TxID submitted'}
                              </span>
                            )}
                          </td>
                          <td>
                            {isPaid ? (
                              <span className="status-badge delivered" style={{ background: '#dcfce7', color: '#15803d' }}>
                                ✓ Verified & Paid
                              </span>
                            ) : order.paymentMethod === 'cod' ? (
                              <span className="status-badge pending" style={{ background: '#f3f4f6', color: '#4b5563' }}>
                                Cash on Delivery
                              </span>
                            ) : (
                              <span className="status-badge pending" style={{ background: '#fef3c7', color: '#b45309' }}>
                                ⏳ Pending Check
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${order.isDelivered ? 'delivered' : 'pending'}`}>
                              {order.isDelivered ? 'Delivered' : 'In Transit'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {!isPaid && order.paymentMethod !== 'cod' && (
                                <button
                                  className="btn btn-primary"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', background: '#059669', borderColor: '#059669' }}
                                  onClick={() => handleVerifyPayment(order._id)}
                                >
                                  ✓ Confirm Paid
                                </button>
                              )}
                              {!order.isDelivered ? (
                                <button
                                  className="btn btn-outline-dark"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                  onClick={() => handleDeliver(order._id)}
                                >
                                  Mark Delivered
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                  Completed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
