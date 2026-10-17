import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  
  const { login, register, userInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <h1 className="login-title">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="login-subtitle">
          {isRegistering
            ? 'Sign up to track your specialty coffee orders.'
            : 'Log in to access your Kaldi & Co account.'}
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password">Password</label>
              {!isRegistering && (
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              )}
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            {isRegistering ? 'Register' : 'Log In'}
          </button>
        </form>

        <div className="login-toggle">
          {isRegistering ? (
            <p>
              Already have an account?{' '}
              <button className="btn-link" onClick={() => setIsRegistering(false)}>
                Log in here
              </button>
            </p>
          ) : (
            <p>
              New to Kaldi & Co?{' '}
              <button className="btn-link" onClick={() => setIsRegistering(true)}>
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
