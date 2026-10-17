import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import './Admin.css';

const PRESET_IMAGES = [
  { label: 'Yirgacheffe (Sage Green)', path: '/images/product-yirgacheffe.jpg' },
  { label: 'Sidama (Burgundy Berry)', path: '/images/product-sidamo.jpg' },
  { label: 'Guji (Golden Ochre)', path: '/images/product-guji.jpg' },
  { label: 'Harrar (Warm Terracotta)', path: '/images/product-harrar.jpg' },
  { label: 'Limu (Forest Amber)', path: '/images/product-limu.jpg' },
  { label: 'Kaffa (Deep Earth)', path: '/images/product-kaffa.jpg' },
  { label: 'Addis Roast (Dark Espresso)', path: '/images/product-addis.jpg' },
  { label: 'Tasting Flight (Gift Box)', path: '/images/product-flight.jpg' },
];

const INITIAL_PRODUCT_FORM = {
  name: '',
  subtitle: '',
  region: 'Yirgacheffe Zone',
  altitude: '1,950 – 2,200m',
  varietal: 'Indigenous Ethiopian Heirloom',
  process: 'Washed',
  roast: 'Light',
  roastLevel: 2,
  notes: '',
  tastingNotes: '',
  body: 'Silky & Delicate',
  acidity: 'Vibrant Citric',
  badge: '',
  image: '/images/product-yirgacheffe.jpg',
  colorAccent: '#607d57',
  description: '',
  price250g: 650,
  price500g: 1250,
  price1kg: 2400,
  inStock: true,
  featured: false,
};

export default function Admin() {
  const { userInfo } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Products Management
  const { products, refreshProducts } = useProducts();
  const [productSearch, setProductSearch] = useState('');
  const [productProcessFilter, setProductProcessFilter] = useState('All');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  useEffect(() => {
    if (userInfo?.isAdmin) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [userInfo]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
      showToast('✓ Payment confirmed and marked verified!');
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
      showToast('✓ Order marked as delivered!');
    } catch (e) {}
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // -------------------------------------------------------------
  // Product Management Handlers
  // -------------------------------------------------------------
  const openAddProductModal = () => {
    setEditingProductId(null);
    setProductForm(INITIAL_PRODUCT_FORM);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProductId(product.id || product._id);
    setProductForm({
      name: product.name || '',
      subtitle: product.subtitle || '',
      region: product.region || 'Ethiopia',
      altitude: product.altitude || '1,900 – 2,200m',
      varietal: product.varietal || 'Indigenous Ethiopian Heirloom',
      process: product.process || 'Washed',
      roast: product.roast || 'Medium',
      roastLevel: product.roastLevel || 2.5,
      notes: product.notes || (Array.isArray(product.tastingNotes) ? product.tastingNotes.join(' · ') : ''),
      tastingNotes: Array.isArray(product.tastingNotes)
        ? product.tastingNotes.join(', ')
        : (product.notes || ''),
      body: product.body || 'Silky & Balanced',
      acidity: product.acidity || 'Bright & Vibrant',
      badge: product.badge || '',
      image: product.image || '/images/product-yirgacheffe.jpg',
      colorAccent: product.colorAccent || '#607d57',
      description: product.description || '',
      price250g: product.prices?.['250g'] || 650,
      price500g: product.prices?.['500g'] || 1250,
      price1kg: product.prices?.['1kg'] || 2400,
      inStock: product.inStock !== false,
      featured: !!product.featured,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('Please provide a coffee name.');
      return;
    }

    setIsSubmittingProduct(true);

    const payload = {
      name: productForm.name.trim(),
      subtitle: productForm.subtitle.trim() || `${productForm.process} · Grade 1 Specialty`,
      region: productForm.region.trim(),
      altitude: productForm.altitude.trim(),
      varietal: productForm.varietal.trim(),
      process: productForm.process,
      roast: productForm.roast,
      roastLevel: Number(productForm.roastLevel) || 2.5,
      notes: productForm.notes.trim() || productForm.tastingNotes.trim(),
      tastingNotes: productForm.tastingNotes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      body: productForm.body.trim(),
      acidity: productForm.acidity.trim(),
      badge: productForm.badge.trim(),
      image: productForm.image,
      colorAccent: productForm.colorAccent,
      description: productForm.description.trim() || 'Sourced directly from Ethiopian high-altitude farms.',
      prices: {
        '250g': Number(productForm.price250g) || 650,
        '500g': Number(productForm.price500g) || 1250,
        '1kg': Number(productForm.price1kg) || 2400,
      },
      inStock: productForm.inStock,
      featured: productForm.featured,
    };

    let savedProduct = null;

    // 1. Attempt Backend API sync
    try {
      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token || ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        savedProduct = await res.json();
      }
    } catch (err) {
      console.warn('Backend product API offline, using local storage persistence:', err);
    }

    // 2. LocalStorage Persistence & Sync
    try {
      const localCustom = JSON.parse(localStorage.getItem('kaldi_custom_products') || '[]');
      const targetId = editingProductId || savedProduct?.id || savedProduct?._id || `custom-${Date.now()}`;
      
      const productObj = {
        ...(savedProduct || {}),
        ...payload,
        id: targetId,
        _id: targetId,
        slug: (savedProduct?.slug) || (productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + targetId),
      };

      let updatedList;
      if (editingProductId) {
        updatedList = localCustom.map((p) =>
          String(p.id) === String(editingProductId) || String(p._id) === String(editingProductId)
            ? productObj
            : p
        );
        // If not in localCustom yet (e.g. was one of default catalog items)
        if (!updatedList.some((p) => String(p.id) === String(editingProductId))) {
          updatedList.push(productObj);
        }
      } else {
        updatedList = [productObj, ...localCustom];
      }

      localStorage.setItem('kaldi_custom_products', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('kaldi_products_updated'));
      refreshProducts();
      showToast(editingProductId ? '✓ Coffee updated successfully!' : '✓ New coffee added to catalog!');
    } catch (e) {
      console.error('Local persistence error:', e);
    }

    setIsSubmittingProduct(false);
    setIsProductModalOpen(false);
  };

  const handleToggleStock = async (product) => {
    const pId = product.id || product._id;
    const newStock = !product.inStock;

    // Backend call
    try {
      await fetch(`/api/products/${pId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token || ''}`,
        },
        body: JSON.stringify({ inStock: newStock }),
      });
    } catch (err) {}

    // LocalStorage sync
    try {
      const localCustom = JSON.parse(localStorage.getItem('kaldi_custom_products') || '[]');
      const updatedList = localCustom.map((p) =>
        String(p.id) === String(pId) || String(p._id) === String(pId)
          ? { ...p, inStock: newStock }
          : p
      );
      if (!updatedList.some((p) => String(p.id) === String(pId))) {
        updatedList.push({ ...product, inStock: newStock });
      }
      localStorage.setItem('kaldi_custom_products', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('kaldi_products_updated'));
      refreshProducts();
      showToast(`Product set to ${newStock ? 'In Stock' : 'Out of Stock'}`);
    } catch (e) {}
  };

  const handleDeleteProduct = async (product) => {
    const pId = product.id || product._id;
    if (!window.confirm(`Are you sure you want to remove "${product.name}" from the catalog?`)) {
      return;
    }

    try {
      await fetch(`/api/products/${pId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userInfo?.token || ''}`,
        },
      });
    } catch (err) {}

    try {
      const localCustom = JSON.parse(localStorage.getItem('kaldi_custom_products') || '[]');
      // Mark as deleted or filter out
      const updatedList = localCustom.filter(
        (p) => String(p.id) !== String(pId) && String(p._id) !== String(pId)
      );
      // For base products, store tombstone
      updatedList.push({ id: pId, _id: pId, _deleted: true });
      localStorage.setItem('kaldi_custom_products', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('kaldi_products_updated'));
      refreshProducts();
      showToast('✓ Product deleted from catalog.');
    } catch (e) {}
  };

  const filteredProducts = products.filter((p) => {
    if (p._deleted) return false;
    const matchesSearch =
      (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.region || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.notes || '').toLowerCase().includes(productSearch.toLowerCase());
    const matchesProcess =
      productProcessFilter === 'All' ||
      (p.process || '').toLowerCase().includes(productProcessFilter.toLowerCase());
    return matchesSearch && matchesProcess;
  });

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
        {toastMessage && (
          <div className="admin-toast">
            {toastMessage}
          </div>
        )}

        {/* Dashboard Top Header */}
        <header className="admin-header">
          <div>
            <span className="section-label">Kaldi Roastery Management</span>
            <h1>Operations & Catalog Portal</h1>
          </div>
          <div className="admin-header__actions">
            {activeTab === 'products' && (
              <button
                className="btn btn-primary"
                onClick={openAddProductModal}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.4rem' }}
              >
                <span>➕</span> Add New Coffee
              </button>
            )}
          </div>
        </header>

        {/* Tab Navigation Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span>📦 Orders & Payments</span>
            <span className="tab-badge">{orders.length}</span>
            {unverifiedPayments > 0 && <span className="tab-dot" title="Pending payments require review" />}
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span>☕ Product Catalog & Inventory</span>
            <span className="tab-badge">{products.filter((p) => !p._deleted).length}</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ORDERS & PAYMENTS DASHBOARD                         */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>Loading orders...</div>
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
                                      Tx: {order.transactionId}
                                    </code>
                                    {copiedId === order._id && (
                                      <span style={{ fontSize: '0.7rem', color: '#059669', marginLeft: '6px' }}>✓ Copied</span>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No reference code</span>
                                )}
                              </td>
                              <td>
                                {isPaid ? (
                                  <span className="status-badge delivered" style={{ background: '#d1fae5', color: '#065f46' }}>
                                    ✓ Verified & Paid
                                  </span>
                                ) : (
                                  <span className="status-badge pending" style={{ background: '#fef3c7', color: '#92400e' }}>
                                    ⏳ Pending Verification
                                  </span>
                                )}
                              </td>
                              <td>
                                {order.isDelivered ? (
                                  <span className="status-badge delivered">Delivered</span>
                                ) : (
                                  <span className="status-badge pending">Pending</span>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {!order.isPaid && (
                                    <button
                                      className="btn btn-outline"
                                      onClick={() => handleVerifyPayment(order._id)}
                                      style={{
                                        fontSize: '0.75rem',
                                        padding: '0.35rem 0.6rem',
                                        borderColor: '#059669',
                                        color: '#059669',
                                        fontWeight: 600,
                                      }}
                                      title="Click after checking Telebirr or CBE SMS"
                                    >
                                      ✓ Confirm Paid
                                    </button>
                                  )}
                                  {!order.isDelivered && (
                                    <button
                                      className="btn btn-outline"
                                      onClick={() => handleDeliver(order._id)}
                                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                                    >
                                      Mark Delivered
                                    </button>
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
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCT CATALOG & INVENTORY MANAGEMENT             */}
        {/* ========================================================= */}
        {activeTab === 'products' && (
          <>
            <div className="admin-stats">
              <div className="stat-card">
                <span className="stat-card__label">Active Coffee Offerings</span>
                <span className="stat-card__value">{products.filter((p) => !p._deleted).length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">In Stock</span>
                <span className="stat-card__value" style={{ color: '#059669' }}>
                  {products.filter((p) => !p._deleted && p.inStock !== false).length}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Featured Coffees</span>
                <span className="stat-card__value" style={{ color: 'var(--color-terracotta)' }}>
                  {products.filter((p) => !p._deleted && p.featured).length}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Single Origins</span>
                <span className="stat-card__value">
                  {products.filter((p) => !p._deleted && !p.name.toLowerCase().includes('flight')).length}
                </span>
              </div>
            </div>

            {/* Catalog Filter Controls */}
            <div className="catalog-toolbar">
              <div className="catalog-toolbar__search">
                <input
                  type="text"
                  placeholder="Search by coffee name, region, or notes..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              <div className="catalog-toolbar__filters">
                <select
                  value={productProcessFilter}
                  onChange={(e) => setProductProcessFilter(e.target.value)}
                >
                  <option value="All">All Processes</option>
                  <option value="Washed">Washed</option>
                  <option value="Natural">Natural</option>
                  <option value="Honey">Honey</option>
                  <option value="Anaerobic">Anaerobic</option>
                </select>
                <button className="btn btn-primary" onClick={openAddProductModal}>
                  ➕ Add Coffee
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Coffee</th>
                    <th>Terroir & Roast</th>
                    <th>Process</th>
                    <th>Tasting Notes</th>
                    <th>Pricing (250g / 500g / 1kg)</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                        No coffee products match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const pId = p.id || p._id;
                      const p250 = p.prices?.['250g'] || 650;
                      const p500 = p.prices?.['500g'] || 1200;
                      const p1kg = p.prices?.['1kg'] || 2300;
                      const isInStock = p.inStock !== false;

                      return (
                        <tr key={pId}>
                          <td style={{ minWidth: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={p.image || '/images/product-yirgacheffe.jpg'}
                                alt={p.name}
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                  border: '1px solid var(--color-border-light)',
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--color-espresso)' }}>
                                  {p.name}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                  {p.subtitle || 'Specialty Grade 1'}
                                </div>
                                {p.badge && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      marginTop: '3px',
                                      fontSize: '0.68rem',
                                      background: '#fef3c7',
                                      color: '#92400e',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{p.region || 'Ethiopia'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                              Roast: <strong>{p.roast || 'Medium'}</strong>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                background: 'var(--color-cream-light)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                              }}
                            >
                              {p.process || 'Washed'}
                            </span>
                          </td>
                          <td style={{ maxWidth: '240px', fontSize: '0.82rem', color: 'var(--color-text-body)' }}>
                            {p.notes || (Array.isArray(p.tastingNotes) ? p.tastingNotes.join(' · ') : 'Specialty floral notes')}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                              <div>250g: ETB {p250.toLocaleString()}</div>
                              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                                500g: ETB {p500.toLocaleString()}
                              </div>
                              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                                1kg: ETB {p1kg.toLocaleString()}
                              </div>
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleStock(p)}
                              style={{
                                border: 'none',
                                background: isInStock ? '#d1fae5' : '#fee2e2',
                                color: isInStock ? '#065f46' : '#991b1b',
                                padding: '4px 10px',
                                borderRadius: '50px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Click to toggle In Stock / Out of Stock"
                            >
                              <span>{isInStock ? '● In Stock' : '✕ Out of Stock'}</span>
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-outline"
                                onClick={() => openEditProductModal(p)}
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-outline"
                                onClick={() => handleDeleteProduct(p)}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.35rem 0.65rem',
                                  borderColor: '#ef4444',
                                  color: '#dc2626',
                                }}
                                title="Remove coffee from catalog"
                              >
                                Delete
                              </button>
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

        {/* ========================================================= */}
        {/* MODAL: ADD / EDIT COFFEE OFFERING                          */}
        {/* ========================================================= */}
        {isProductModalOpen && (
          <div className="product-modal-backdrop" onClick={() => setIsProductModalOpen(false)}>
            <div className="product-modal" onClick={(e) => e.stopPropagation()}>
              <div className="product-modal__header">
                <div>
                  <span className="section-label">Catalog Management</span>
                  <h2>{editingProductId ? 'Edit Coffee Offering' : 'Add New Coffee Offering'}</h2>
                </div>
                <button
                  className="product-modal__close"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="product-modal__form">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Coffee Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Guji Hambela Reserve"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtitle / Grade</label>
                    <input
                      type="text"
                      placeholder="e.g. Natural Anaerobic · Grade 1"
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Region / Zone</label>
                    <input
                      type="text"
                      placeholder="e.g. Guji Zone, Shakiso"
                      value={productForm.region}
                      onChange={(e) => setProductForm({ ...productForm, region: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Altitude</label>
                    <input
                      type="text"
                      placeholder="e.g. 2,100 – 2,350m"
                      value={productForm.altitude}
                      onChange={(e) => setProductForm({ ...productForm, altitude: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Varietal</label>
                    <input
                      type="text"
                      placeholder="e.g. 74110 & 74112 Heirlooms"
                      value={productForm.varietal}
                      onChange={(e) => setProductForm({ ...productForm, varietal: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Processing Method</label>
                    <select
                      value={productForm.process}
                      onChange={(e) => setProductForm({ ...productForm, process: e.target.value })}
                    >
                      <option value="Washed">Washed (Slow Dried)</option>
                      <option value="Natural">Natural Sun-Dried</option>
                      <option value="Honey">Honey Process</option>
                      <option value="Anaerobic">Anaerobic Fermentation</option>
                      <option value="Specialty Blend">Specialty Blend</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Roast Profile</label>
                    <select
                      value={productForm.roast}
                      onChange={(e) => setProductForm({ ...productForm, roast: e.target.value })}
                    >
                      <option value="Light">Light (Filter & Pour Over)</option>
                      <option value="Medium-Light">Medium-Light</option>
                      <option value="Medium">Medium (Balanced)</option>
                      <option value="Medium-Dark">Medium-Dark (Espresso)</option>
                      <option value="Dark">Dark Roast</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Promotional Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. Best Seller, Micro-Lot, New"
                      value={productForm.badge}
                      onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tasting Notes (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Jasmine, Wild Strawberry, Cocoa, Honey"
                    value={productForm.tastingNotes}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        tastingNotes: e.target.value,
                        notes: e.target.value.split(',').map((s) => s.trim()).join(' · '),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Package Pricing (ETB) *</label>
                  <div className="prices-grid">
                    <div>
                      <span className="price-tag-label">250g Bag</span>
                      <input
                        type="number"
                        required
                        min="50"
                        value={productForm.price250g}
                        onChange={(e) => setProductForm({ ...productForm, price250g: e.target.value })}
                      />
                    </div>
                    <div>
                      <span className="price-tag-label">500g Bag</span>
                      <input
                        type="number"
                        required
                        min="100"
                        value={productForm.price500g}
                        onChange={(e) => setProductForm({ ...productForm, price500g: e.target.value })}
                      />
                    </div>
                    <div>
                      <span className="price-tag-label">1kg Bag</span>
                      <input
                        type="number"
                        required
                        min="200"
                        value={productForm.price1kg}
                        onChange={(e) => setProductForm({ ...productForm, price1kg: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Packaging Bag Visual Selector */}
                <div className="form-group">
                  <label>Packaging Artwork / Visual Preset</label>
                  <div className="image-preset-grid">
                    {PRESET_IMAGES.map((img) => (
                      <div
                        key={img.path}
                        className={`image-preset-card ${productForm.image === img.path ? 'selected' : ''}`}
                        onClick={() => setProductForm({ ...productForm, image: img.path })}
                      >
                        <img src={img.path} alt={img.label} />
                        <span>{img.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      placeholder="Or enter custom image URL"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Coffee Story & Roaster Description</label>
                  <textarea
                    rows="3"
                    placeholder="Describe terroir, grower community, and flavor cup profile..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={productForm.inStock}
                      onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    />
                    <span>Available In Stock</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    />
                    <span>Feature on Home Page</span>
                  </label>
                </div>

                <div className="product-modal__actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsProductModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmittingProduct}
                  >
                    {isSubmittingProduct ? 'Saving...' : editingProductId ? 'Update Coffee' : 'Publish to Catalog'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
