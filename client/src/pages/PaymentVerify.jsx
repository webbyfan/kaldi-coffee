import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Checkout.css';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get('tx_ref');
  const orderId = searchParams.get('order_id');
  const isSimulated = searchParams.get('simulated') === 'true';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!txRef) {
      setLoading(false);
      setMessage('No transaction reference found in return URL.');
      return;
    }

    const verifyTransaction = async () => {
      try {
        const res = await fetch(`/api/payment/chapa/verify/${txRef}?orderId=${orderId || ''}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setSuccess(true);
          setMessage(data.message || 'Payment verified successfully!');

          // Update local orders if matching
          try {
            const local = JSON.parse(localStorage.getItem('kaldi_orders') || '[]');
            const updated = local.map((o) => {
              if (o._id === orderId || o.orderId === orderId || o.chapaTxRef === txRef) {
                return {
                  ...o,
                  isPaid: true,
                  paymentStatus: 'Paid & Verified (Chapa)',
                  chapaTxRef: txRef,
                };
              }
              return o;
            });
            localStorage.setItem('kaldi_orders', JSON.stringify(updated));
          } catch (e) {}
        } else {
          setSuccess(false);
          setMessage(data.message || 'Transaction could not be verified.');
        }
      } catch (err) {
        // Fallback for simulated/offline mode
        if (isSimulated) {
          setSuccess(true);
          setMessage('Sandbox test payment confirmed successfully!');
          try {
            const local = JSON.parse(localStorage.getItem('kaldi_orders') || '[]');
            const updated = local.map((o) =>
              o._id === orderId || o.orderId === orderId
                ? { ...o, isPaid: true, paymentStatus: 'Paid & Verified (Chapa)' }
                : o
            );
            localStorage.setItem('kaldi_orders', JSON.stringify(updated));
          } catch (e) {}
        } else {
          setSuccess(false);
          setMessage('Network error connecting to payment verification server.');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [txRef, orderId, isSimulated]);

  return (
    <main className="checkout-page" id="main-content" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ background: '#fff', padding: '3.5rem 2rem', borderRadius: '12px', border: '1px solid var(--color-border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1.5s infinite linear' }}>⏳</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)' }}>
                Verifying Payment with Bank Gateway...
              </h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Please wait while we confirm your transaction with Chapa / Telebirr.
              </p>
            </div>
          ) : success ? (
            <div>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <span className="section-label" style={{ color: '#2e6930' }}>Payment Confirmed</span>
              <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)', fontSize: '2.2rem', marginBottom: '0.75rem' }}>
                Payment Received & Verified!
              </h1>
              <p style={{ color: 'var(--color-text-body)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                {message} Your specialty coffee order is now confirmed and queued for roasting and dispatch.
              </p>

              <div style={{ background: 'var(--color-cream-light)', padding: '1.25rem', borderRadius: '8px', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div><strong>Transaction Ref:</strong> <code style={{ fontFamily: 'monospace' }}>{txRef}</code></div>
                {orderId && <div><strong>Order Reference:</strong> {orderId}</div>}
                <div><strong>Status:</strong> <span style={{ color: '#2e6930', fontWeight: 700 }}>PAID & VERIFIED</span></div>
                {isSimulated && <div style={{ fontSize: '0.8rem', color: '#854d0e' }}>⚡ Test Sandbox Mode</div>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/my-orders" className="btn btn-primary">
                  View My Orders
                </Link>
                <Link to="/shop" className="btn btn-outline-dark">
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <span className="section-label" style={{ color: '#dc2626' }}>Payment Issue</span>
              <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)', fontSize: '2rem', marginBottom: '0.75rem' }}>
                Payment Not Confirmed
              </h1>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
                {message}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/checkout" className="btn btn-primary">
                  Try Again
                </Link>
                <Link to="/contact" className="btn btn-outline-dark">
                  Contact Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
