import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiLogin } from '../utils/api';
import { saveAuth } from '../utils/auth';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await apiLogin(email, password);
      saveAuth(token, user);
      if (onLogin) onLogin();
      navigate('/projects');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav">
        <Link to="/" className="brand">ppt-gen <span>/ studio</span></Link>
        <div className="nav-links">
          <Link to="/signup" className="btn-outline">Sign Up</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 24px' }}>
        <div style={{
          width: '100%', maxWidth: 420, background: '#fff',
          borderRadius: 20, border: '1px solid #eaeaea',
          boxShadow: '0 12px 40px rgba(0,0,0,0.06)', padding: '40px 36px'
        }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>
            Welcome back
          </h1>
          <p style={{ color: '#666', fontSize: '0.92rem', marginBottom: 28 }}>
            Sign in to your ppt-gen account
          </p>

          {error && (
            <div className="export-error-banner" style={{ marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#333', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid #e5e5e5',
                  borderRadius: 12, fontSize: '0.95rem', fontFamily: 'inherit',
                  outline: 'none', transition: 'border-color 0.15s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#000'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#333', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid #e5e5e5',
                  borderRadius: 12, fontSize: '0.95rem', fontFamily: 'inherit',
                  outline: 'none', transition: 'border-color 0.15s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#000'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
            </div>

            <button
              type="submit"
              className="btn-black"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', borderRadius: 12 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#000', fontWeight: 600, textDecoration: 'underline' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
