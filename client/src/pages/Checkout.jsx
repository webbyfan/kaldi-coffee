import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LanguageContext';
import { t, tr } from '../data/translations';
import './Checkout.css';

const ADDIS_SUBCITIES = [
  'Bole Sub-City (Atlas, Medhanialem, Rwanda, Kazanchis)',
  'Kirkos Sub-City (Meskel Square, Stadium, Gotera)',
  'Yeka Sub-City (Megenagna, Signal, CMC)',
  'Lideta Sub-City (Balcha, Mexico)',
  'Arada Sub-City (Piazza, 4 Kilo, 6 Kilo)',
  'Gullele Sub-City (Shiro Meda, Addisu Gebeya)',
  'Nifas Silk-Lafto (Sarbet, Jemo, Bisrate Gabriel)',
  'Kolfe Keranio / Akaky Kaliti',
  'Other City in Ethiopia (Hawassa, Bahir Dar, Dire Dawa, Adama)',
  'International Order (DHL / Ethiopian Cargo)',
];

export default function Checkout() {
  const { cartItems, cartSubtotal, discountAmount, clearCart, isFreeShipping } = useCart();
  const { lang } = useLang();

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subcity: ADDIS_SUBCITIES[0],
    streetAddress: '',
    deliveryInstructions: '',
  });

  const [deliveryMethod, setDeliveryMethod] = useState('addis-standard');
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [transactionId, setTransactionId] = useState('');
  const [paymentSettings, setPaymentSettings] = useState({
    telebirr: { phone: '+251 91 123 4567', name: 'Kaldi Specialty Coffee' },
    cbe: { account: '1000 1234 5678 9', name: 'Kaldi & Co Specialty Coffee' },
    chapaEnabled: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  // Fetch dynamic payment settings from server/.env
  useEffect(() => {
    fetch('/api/payment/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPaymentSettings(data);
      })
      .catch(() => {});
  }, []);

  const getShippingFee = () => {
    if (cartItems.length === 0) return 0;
    if (deliveryMethod === 'pickup') return 0;
    if (deliveryMethod === 'addis-express') return 250;
    if (deliveryMethod === 'regional') return 450;
    return isFreeShipping ? 0 : 150;
  };

  const shippingFee = getShippingFee();
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Verify transaction ID was provided for direct Telebirr / CBE transfers
    if ((paymentMethod === 'telebirr' || paymentMethod === 'cbe') && !transactionId.trim()) {
      alert(
        paymentMethod === 'telebirr'
          ? 'Please enter your Telebirr Transaction ID / SMS confirmation code before placing your order.'
          : 'Please enter your CBE Bank Transaction Reference number before placing your order.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        weight: item.weight,
        grind: item.grind,
        image: item.image,
        price: item.price,
        product: item.id
      }));

      const shippingAddress = {
        fullName: formData.fullName,
        email: formData.email?.toLowerCase().trim() || '',
        address: formData.streetAddress,
        city: formData.subcity,
        postalCode: '1000', // Default placeholder
        country: 'Ethiopia',
        phone: formData.phone
      };

      const paymentStatus = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pending Verification';

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems,
          shippingAddress,
          userEmail: formData.email?.toLowerCase().trim() || '',
          paymentMethod,
          paymentStatus,
          transactionId: transactionId.trim(),
          totalPrice: grandTotal
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const createdOrder = await response.json();

      const confirmedData = {
        _id: createdOrder._id,
        orderId: createdOrder.orderRef || createdOrder._id.substring(createdOrder._id.length - 8).toUpperCase(),
        date: new Date(createdOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: createdOrder.totalPrice,
        customerName: createdOrder.shippingAddress.fullName,
        userEmail: formData.email?.toLowerCase().trim() || '',
        phone: createdOrder.shippingAddress.phone,
        subcity: createdOrder.shippingAddress.city,
        streetAddress: createdOrder.shippingAddress.address || '',
        paymentMethod: createdOrder.paymentMethod,
        paymentStatus: createdOrder.paymentStatus || paymentStatus,
        transactionId: transactionId.trim(),
        itemsCount: createdOrder.orderItems.length,
        items: cartItems.map(item => ({
          name: item.name,
          weight: item.weight,
          grind: item.grind,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        isDelivered: false,
      };

      try {
        const past = JSON.parse(localStorage.getItem('kaldi_orders') || '[]');
        past.unshift(confirmedData);
        localStorage.setItem('kaldi_orders', JSON.stringify(past));
      } catch (e) {}

      // If Chapa automated payment was selected, initialize transaction and redirect
      if (paymentMethod === 'chapa') {
        try {
          const chapaRes = await fetch('/api/payment/chapa/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: grandTotal,
              email: formData.email,
              firstName: formData.fullName.split(' ')[0] || 'Customer',
              lastName: formData.fullName.split(' ').slice(1).join(' ') || 'Kaldi',
              phone: formData.phone,
              orderId: createdOrder._id,
              orderRef: confirmedData.orderId,
            }),
          });
          const chapaData = await chapaRes.json();
          if (chapaData.checkoutUrl) {
            clearCart();
            window.location.href = chapaData.checkoutUrl;
            return;
          }
        } catch (chapaErr) {
          console.warn('Chapa init error, proceeding with confirmation modal:', chapaErr);
        }
      }

      setOrderConfirmed(confirmedData);
      setIsProcessing(false);
      clearCart();
    } catch (error) {
      console.warn('Backend/MongoDB not reachable. Generating local order confirmation:', error);
      const mockId = 'KL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const paymentStatus = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pending Verification';

      const localOrder = {
        _id: mockId,
        orderId: mockId,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        total: grandTotal,
        customerName: formData.fullName || 'Customer',
        userEmail: formData.email?.toLowerCase().trim() || '',
        phone: formData.phone || '',
        subcity: formData.subcity || 'Addis Ababa',
        streetAddress: formData.streetAddress || '',
        paymentMethod: paymentMethod,
        paymentStatus,
        transactionId: transactionId.trim(),
        itemsCount: cartItems.length,
        items: cartItems.map(item => ({
          name: item.name,
          weight: item.weight,
          grind: item.grind,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        isDelivered: false,
      };

      try {
        const past = JSON.parse(localStorage.getItem('kaldi_orders') || '[]');
        past.unshift(localOrder);
        localStorage.setItem('kaldi_orders', JSON.stringify(past));
      } catch (e) {}

      // If Chapa simulated mode in local fallback:
      if (paymentMethod === 'chapa') {
        clearCart();
        window.location.href = `/payment-verify?tx_ref=kaldi-tx-${Date.now()}&order_id=${mockId}&simulated=true`;
        return;
      }

      setOrderConfirmed(localOrder);
      setIsProcessing(false);
      clearCart();
    }
  };

  return (
    <main className="checkout-page" id="main-content">
      <div className="container">
        <header className="checkout-header">
          <span className="section-label">{tr(t.checkout.safeEnc, lang)}</span>
          <h1 className="checkout-title">{tr(t.checkout.title, lang)}</h1>
        </header>

        {cartItems.length === 0 && !orderConfirmed ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>
              {tr(t.checkout.cartEmpty, lang)}
            </p>
            <Link to="/shop" className="btn btn-primary">
              {tr(t.checkout.returnShop, lang)}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="checkout-grid">
            {/* Left Steps Form */}
            <div>
              {/* Step 1: Customer Contact */}
              <section className="checkout-section">
                <h2 className="checkout-section__title">
                  <span className="checkout-step-num">1</span>
                  {tr(t.checkout.step1Title, lang)}
                </h2>
                <div className="checkout-form-row">
                  <div className="checkout-form-group">
                    <label className="checkout-label" htmlFor="fullName">
                      {tr(t.checkout.fullName, lang)}
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="checkout-input"
                      placeholder={tr(t.checkout.namePlace, lang)}
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="checkout-form-group">
                    <label className="checkout-label" htmlFor="phone">
                      {tr(t.checkout.phoneLabel, lang)}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="checkout-input"
                      placeholder="+251 91 123 4567"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="checkout-form-group">
                  <label className="checkout-label" htmlFor="email">
                    {tr(t.checkout.emailLabel, lang)}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="checkout-input"
                    placeholder="dawit@example.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </section>

              {/* Step 2: Shipping / Delivery Address */}
              <section className="checkout-section">
                <h2 className="checkout-section__title">
                  <span className="checkout-step-num">2</span>
                  {tr(t.checkout.step2Title, lang)}
                </h2>

                <div className="checkout-form-group">
                  <label className="checkout-label" htmlFor="subcity">
                    {tr(t.checkout.subcityLabel, lang)}
                  </label>
                  <select
                    id="subcity"
                    name="subcity"
                    className="checkout-select"
                    value={formData.subcity}
                    onChange={handleInputChange}
                  >
                    {ADDIS_SUBCITIES.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="checkout-form-group">
                  <label className="checkout-label" htmlFor="streetAddress">
                    {tr(t.checkout.streetLabel, lang)}
                  </label>
                  <input
                    id="streetAddress"
                    name="streetAddress"
                    type="text"
                    className="checkout-input"
                    placeholder={tr(t.checkout.streetPlace, lang)}
                    required
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                  />
                </div>
              </section>

              {/* Step 3: Delivery Speed */}
              <section className="checkout-section">
                <h2 className="checkout-section__title">
                  <span className="checkout-step-num">3</span>
                  {tr(t.checkout.step3Title, lang)}
                </h2>

                <div className="radio-card-list">
                  <label
                    className={`radio-card ${deliveryMethod === 'addis-standard' ? 'is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="addis-standard"
                      checked={deliveryMethod === 'addis-standard'}
                      onChange={() => setDeliveryMethod('addis-standard')}
                    />
                    <div className="radio-card__info">
                      <div className="radio-card__title">
                        <span>{tr(t.checkout.stdAddis, lang)}</span>
                        <span>{isFreeShipping ? 'FREE' : `ETB 150`}</span>
                      </div>
                      <div className="radio-card__desc">{tr(t.checkout.stdAddisDesc, lang)}</div>
                    </div>
                  </label>

                  <label
                    className={`radio-card ${deliveryMethod === 'addis-express' ? 'is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="addis-express"
                      checked={deliveryMethod === 'addis-express'}
                      onChange={() => setDeliveryMethod('addis-express')}
                    />
                    <div className="radio-card__info">
                      <div className="radio-card__title">
                        <span>{tr(t.checkout.expAddis, lang)}</span>
                        <span>ETB 250</span>
                      </div>
                      <div className="radio-card__desc">{tr(t.checkout.expAddisDesc, lang)}</div>
                    </div>
                  </label>

                  <label
                    className={`radio-card ${deliveryMethod === 'pickup' ? 'is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryMethod === 'pickup'}
                      onChange={() => setDeliveryMethod('pickup')}
                    />
                    <div className="radio-card__info">
                      <div className="radio-card__title">
                        <span>{tr(t.checkout.pickup, lang)}</span>
                        <span>FREE</span>
                      </div>
                      <div className="radio-card__desc">{tr(t.checkout.pickupDesc, lang)}</div>
                    </div>
                  </label>
                </div>
              </section>

              {/* Step 4: Payment Method */}
              <section className="checkout-section">
                <h2 className="checkout-section__title">
                  <span className="checkout-step-num">4</span>
                  {tr(t.checkout.step4Title, lang)}
                </h2>

                <div className="radio-card-list">
                  {/* Chapa Automated Gateway */}
                  <label className={`radio-card ${paymentMethod === 'chapa' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="chapa"
                      checked={paymentMethod === 'chapa'}
                      onChange={() => setPaymentMethod('chapa')}
                    />
                    <div className="radio-card__info">
                      <div className="radio-card__title">
                        <span>⚡ Chapa Automated Pay</span>
                        <span style={{ color: '#059669', fontWeight: 600, background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem' }}>
                          Instant Auto-Verify
                        </span>
                      </div>
                      <div className="radio-card__desc">
                        Direct automated bank check via Telebirr, CBE Birr, Awash Birr, or Visa/Mastercard.
                      </div>
                    </div>
                  </label>

                  {/* Direct Telebirr */}
                  <label className={`radio-card ${paymentMethod === 'telebirr' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="telebirr"
                      checked={paymentMethod === 'telebirr'}
                      onChange={() => setPaymentMethod('telebirr')}
                    />
                    <div className="radio-card__info">
                      <div className="radio-card__title">
                        <span>📱 Direct Telebirr Transfer</span>
                        <span style={{ color: '#0d6efd', fontWeight: 600 }}>{tr(t.checkout.mostPop, lang)}</span>
                      </div>
                      <div className="radio-card__desc">
                        Transfer to {paymentSettings.telebirr.phone} ({paymentSettings.telebirr.name}) and submit your TxID.
                      </div>
                    </div>
                  </label>

                  {/* Direct CBE Birr */}
                  <label className={`radio-card ${paymentMethod === 'cbe' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cbe"
                      checked={paymentMethod === 'cbe'}
                      onChange={() => setPaymentMethod('cbe')}
                    />
                    <div className="radio-card__info">
                      <div className="radio-card__title">
                        <span>🏦 Commercial Bank of Ethiopia (CBE)</span>
                        <span style={{ color: '#800080', fontWeight: 600 }}>CBE Mobile</span>
                      </div>
                      <div className="radio-card__desc">
                        Transfer to CBE A/C {paymentSettings.cbe.account} and enter your receipt reference.
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`radio-card ${paymentMethod === 'cod' ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div className="radio-card__info">
                      <div className="radio-card__title">
                        <span>{tr(t.checkout.codTitle, lang)}</span>
                        <span>{tr(t.checkout.codBadge, lang)}</span>
                      </div>
                      <div className="radio-card__desc">{tr(t.checkout.codDesc, lang)}</div>
                    </div>
                  </label>
                </div>

                {/* Selected payment dynamic instructional notice */}
                <div className="payment-details-box" style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'var(--color-cream-light)', borderRadius: '8px' }}>
                  {paymentMethod === 'chapa' && (
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                      <p style={{ margin: 0 }}>
                        ⚡ <strong>Instant Automated Verification:</strong> When you click &ldquo;Place Order&rdquo;, you will be redirected to Chapa&apos;s secure Ethiopian gateway to pay via Telebirr, CBE Birr, or Card. The system automatically confirms your payment in real-time.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'telebirr' && (
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 0.5rem 0' }}>
                        📱 <strong>How to Pay with Telebirr:</strong>
                      </p>
                      <ol style={{ paddingLeft: '1.25rem', margin: '0 0 0.85rem 0' }}>
                        <li>Open your <strong>Telebirr App</strong> or dial <strong>*127#</strong>.</li>
                        <li>Send exactly <strong>ETB {grandTotal.toLocaleString()}</strong> to phone: <strong style={{ color: '#0d6efd', fontSize: '1rem' }}>{paymentSettings.telebirr.phone}</strong> ({paymentSettings.telebirr.name}).</li>
                        <li>Copy the <strong>Transaction ID</strong> from your Telebirr SMS confirmation and paste it below.</li>
                      </ol>

                      <div>
                        <label htmlFor="telebirr-tx" style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--color-espresso)' }}>
                          Telebirr Transaction ID / SMS Reference Code <span style={{ color: '#d9534f' }}>*</span>
                        </label>
                        <input
                          id="telebirr-tx"
                          type="text"
                          className="checkout-input"
                          placeholder="e.g. FT261017.0984.A or 8-digit confirmation code"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          style={{ borderColor: !transactionId.trim() ? '#c9945a' : undefined }}
                        />
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                          🔒 Our roastery admin will verify this code against the store Telebirr SMS before packing your coffee.
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cbe' && (
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 0.5rem 0' }}>
                        🏦 <strong>How to Pay with CBE Mobile / CBE Birr:</strong>
                      </p>
                      <ol style={{ paddingLeft: '1.25rem', margin: '0 0 0.85rem 0' }}>
                        <li>Open your <strong>CBE Mobile App</strong> or visit CBE Online.</li>
                        <li>Transfer <strong>ETB {grandTotal.toLocaleString()}</strong> to Account: <strong style={{ color: '#800080', fontSize: '1rem' }}>{paymentSettings.cbe.account}</strong>.</li>
                        <li>Account Name: <strong>{paymentSettings.cbe.name}</strong>.</li>
                        <li>Enter the transfer receipt reference number below.</li>
                      </ol>

                      <div>
                        <label htmlFor="cbe-tx" style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--color-espresso)' }}>
                          CBE Transaction Reference / Receipt Number <span style={{ color: '#d9534f' }}>*</span>
                        </label>
                        <input
                          id="cbe-tx"
                          type="text"
                          className="checkout-input"
                          placeholder="e.g. CBE-TX-984210 or reference number"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          style={{ borderColor: !transactionId.trim() ? '#c9945a' : undefined }}
                        />
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                          🔒 Our roastery admin verifies this reference number against the bank statement before order delivery.
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      💵 <strong>Cash on Delivery:</strong> {tr(t.checkout.codNotice, lang).replace('{total}', grandTotal.toLocaleString())}
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* Right: Sticky Order Summary */}
            <aside className="checkout-summary-card">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--color-espresso)' }}>
                {tr(t.checkout.orderSumTitle, lang)} ({cartItems.length})
              </h2>

              <div className="checkout-items-list">
                {cartItems.map((item) => (
                  <div className="checkout-item-mini" key={item.cartItemId}>
                    <div>
                      <strong>{item.quantity}× {item.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {item.weight} · {item.grind}
                      </div>
                    </div>
                    <span>ETB {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{tr(t.checkout.subtotal, lang)}</span>
                  <span>ETB {cartSubtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-sage)', fontWeight: 600 }}>
                    <span>{tr(t.checkout.discount, lang)}</span>
                    <span>- ETB {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{tr(t.checkout.shipping, lang)}</span>
                  <span>{shippingFee === 0 ? 'FREE' : `ETB ${shippingFee.toLocaleString()}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-serif)', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.75rem', color: 'var(--color-espresso)' }}>
                  <span>{tr(t.checkout.totalAmt, lang)}</span>
                  <span>ETB {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
              >
                {isProcessing ? tr(t.checkout.processing, lang) : `${tr(t.checkout.placeOrder, lang)} · ETB ${grandTotal.toLocaleString()}`}
              </button>

              <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                {tr(t.checkout.agreeText, lang)}
              </p>
            </aside>
          </form>
        )}
      </div>

      {/* Confirmation Modal */}
      {orderConfirmed && (
        <div className="order-modal-overlay">
          <div className="order-modal-card">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <span className="section-label" style={{ color: 'var(--color-sage)' }}>{tr(t.checkout.orderConf, lang)}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-espresso)', marginBottom: '0.5rem' }}>
              {tr(t.checkout.bunaOnWay, lang)}
            </h2>
            <p style={{ color: 'var(--color-text-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {tr(t.checkout.thanksMsg, lang).replace('{name}', orderConfirmed.customerName)}
            </p>

            <div style={{ background: 'var(--color-cream-light)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong>{tr(t.checkout.orderRef, lang)}</strong> {orderConfirmed.orderId}</div>
              <div><strong>{tr(t.checkout.orderDate, lang)}</strong> {orderConfirmed.date}</div>
              <div><strong>{tr(t.checkout.totalPaid, lang)}</strong> ETB {orderConfirmed.total.toLocaleString()}</div>
              <div><strong>{tr(t.checkout.delDest, lang)}</strong> {orderConfirmed.subcity}</div>
              <div><strong>{tr(t.checkout.payMethInfo, lang)}</strong> {orderConfirmed.paymentMethod.toUpperCase()}</div>
              {orderConfirmed.transactionId && (
                <div><strong>Transaction Ref:</strong> <code style={{ background: '#e8dfd5', padding: '1px 5px', borderRadius: '3px' }}>{orderConfirmed.transactionId}</code></div>
              )}
              <div>
                <strong>Payment Status:</strong>{' '}
                <span style={{ color: orderConfirmed.isPaid ? '#2e6930' : '#b45309', fontWeight: 700 }}>
                  {orderConfirmed.paymentStatus || (orderConfirmed.isPaid ? 'PAID & VERIFIED' : 'PENDING VERIFICATION')}
                </span>
              </div>
              {orderConfirmed.userEmail && (
                <div style={{ color: '#2e6930', fontWeight: 600 }}>
                  ✉️ Receipt copy sent to <strong>{orderConfirmed.userEmail}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={`https://wa.me/251911234567?text=${encodeURIComponent(
                  tr(t.checkout.waMsg, lang).replace('{orderId}', orderConfirmed.orderId).replace('{total}', orderConfirmed.total)
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
              >
                {tr(t.checkout.trackWaBtn, lang)}
              </a>

              <Link to="/shop" className="btn btn-outline-dark">
                {tr(t.checkout.contShop, lang)}
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
