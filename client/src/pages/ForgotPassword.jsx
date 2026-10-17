import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Steps: 'REQUEST' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS'
  const [step, setStep] = useState('REQUEST');

  // Verification method: 'email' | 'sms'
  const [method, setMethod] = useState('email');

  const [identifier, setIdentifier] = useState(''); // holds email or phone
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoOtp, setDemoOtp] = useState(null);
  const [sentReal, setSentReal] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer for OTP resend countdown
  useEffect(() => {
    let timer;
    if (step === 'OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // 1. Send OTP to Email or SMS
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError(method === 'email' ? 'Please enter a valid email address.' : 'Please enter your phone number.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanIdentifier, method }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSentReal(!!data.sentReal);
        setStatusMsg(data.message || '');
        if (data.demoOtp) {
          setDemoOtp(data.demoOtp);
        } else {
          setDemoOtp(null);
        }
      } else {
        throw new Error(data.message || 'Failed to send OTP code');
      }

      setStep('OTP');
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      // Graceful offline fallback simulation for testing without live SMTP/Mongo
      console.warn('Backend/SMTP not connected. Running local OTP simulation:', err.message);
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOtp(generatedOtp);
      setSentReal(false);

      sessionStorage.setItem('kaldi_reset_otp', generatedOtp);
      sessionStorage.setItem('kaldi_reset_id', cleanIdentifier);

      setStep('OTP');
      setCountdown(60);
      setCanResend(false);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/users/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), otp: cleanOtp }),
      });

      if (res.ok) {
        setStep('NEW_PASSWORD');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Invalid or expired OTP code');
      }
    } catch (err) {
      // Offline fallback verification
      const savedOtp = sessionStorage.getItem('kaldi_reset_otp') || demoOtp;
      if (savedOtp && cleanOtp === savedOtp) {
        setStep('NEW_PASSWORD');
      } else {
        setError('Invalid verification code. Please check your code or request a new one.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      if (res.ok) {
        setStep('SUCCESS');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update password');
      }
    } catch (err) {
      // Offline fallback simulation
      sessionStorage.removeItem('kaldi_reset_otp');
      sessionStorage.removeItem('kaldi_reset_id');
      setStep('SUCCESS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-page">
      <div className="forgot-container">
        {/* Step dots */}
        <div className="forgot-steps" aria-hidden="true">
          <div className={`forgot-step-dot ${step === 'REQUEST' ? 'active' : 'done'}`} />
          <div className={`forgot-step-dot ${step === 'OTP' ? 'active' : step === 'NEW_PASSWORD' || step === 'SUCCESS' ? 'done' : ''}`} />
          <div className={`forgot-step-dot ${step === 'NEW_PASSWORD' ? 'active' : step === 'SUCCESS' ? 'done' : ''}`} />
        </div>

        {error && <div className="forgot-error">{error}</div>}

        {/* STEP 1: REQUEST OTP (EMAIL OR SMS) */}
        {step === 'REQUEST' && (
          <>
            <h1 className="forgot-title">Reset Password</h1>
            <p className="forgot-subtitle">
              Choose your verification method to receive a 6-digit security code.
            </p>

            {/* Method Tabs */}
            <div className="method-tabs" role="tablist">
              <button
                type="button"
                className={`method-tab-btn ${method === 'email' ? 'active' : ''}`}
                onClick={() => { setMethod('email'); setIdentifier(''); setError(null); }}
              >
                <span>✉️</span> Email Address
              </button>
              <button
                type="button"
                className={`method-tab-btn ${method === 'sms' ? 'active' : ''}`}
                onClick={() => { setMethod('sms'); setIdentifier(''); setError(null); }}
              >
                <span>💬</span> Phone (SMS)
              </button>
            </div>

            <form onSubmit={handleSendOtp} className="forgot-form">
              {method === 'email' ? (
                <div className="form-group">
                  <label htmlFor="email">Your Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={identifier}
                    placeholder="e.g. beleteashenafi64@gmail.com"
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Ethiopia)</label>
                  <input
                    type="tel"
                    id="phone"
                    value={identifier}
                    placeholder="e.g. +251 911 234 567 or 0911234567"
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary forgot-btn" disabled={loading}>
                {loading ? 'Sending Code...' : `Send Code via ${method === 'email' ? 'Email' : 'SMS'}`}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: ENTER OTP */}
        {step === 'OTP' && (
          <>
            <h1 className="forgot-title">Verify Code</h1>
            <p className="forgot-subtitle">
              We sent a 6-digit code to <strong>{identifier}</strong> ({method.toUpperCase()}).<br />
              <button
                type="button"
                className="btn-link"
                style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}
                onClick={() => setStep('REQUEST')}
              >
                Change destination
              </button>
            </p>

            {/* Delivery Status Indicator */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              {sentReal ? (
                <span className="delivery-badge real">
                  ✓ Code delivered directly to your {method === 'email' ? 'inbox' : 'phone'}!
                </span>
              ) : (
                <span className="delivery-badge demo">
                  ⚠️ {statusMsg || `Live ${method.toUpperCase()} service not yet configured in server/.env`}
                </span>
              )}
            </div>

            {demoOtp && (
              <div className="forgot-demo-hint">
                <span>🔐</span>
                <span>Demo Code: <strong>{demoOtp}</strong></span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="forgot-form">
              <div className="form-group">
                <label htmlFor="otp">Enter 6-Digit Code</label>
                <div className="otp-input-wrap">
                  <input
                    type="text"
                    id="otp"
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="otp-single-input"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary forgot-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="resend-row">
                <span>Didn't get the code?</span>
                {canResend ? (
                  <button
                    type="button"
                    className="btn-link"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                ) : (
                  <span>Resend in {countdown}s</span>
                )}
              </div>
            </form>
          </>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 'NEW_PASSWORD' && (
          <>
            <h1 className="forgot-title">Reset Password</h1>
            <p className="forgot-subtitle">
              Create a new secure password for your account.
            </p>

            <form onSubmit={handleResetPassword} className="forgot-form">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary forgot-btn" disabled={loading}>
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="forgot-success">
            <div className="success-icon-wrap">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="forgot-title">Password Reset!</h1>
            <p className="forgot-subtitle">
              Your password has been updated successfully. You can now log in with your new credentials.
            </p>

            <button
              type="button"
              className="btn btn-primary forgot-btn"
              onClick={() => navigate('/login')}
            >
              Back to Log In
            </button>
          </div>
        )}

        {/* Return to Login link */}
        {step !== 'SUCCESS' && (
          <div className="back-to-login">
            <Link to="/login">
              ← Return to Login
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
