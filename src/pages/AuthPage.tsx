import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (!businessName.trim()) {
        setError('Business name is required');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password, businessName.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError('');
    setPassword('');
    setConfirmPassword('');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Logo / Brand */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'var(--amber)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 12px',
          boxShadow: '0 4px 20px rgba(245,166,35,0.4)',
        }}>💬</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--white)', letterSpacing: -0.5 }}>
          SocialsUnited
        </h1>
        <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>
          Unified messaging for tradespeople
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'var(--navy-light)',
        borderRadius: 20, border: '1px solid var(--border)',
        padding: '28px 24px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}>
        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'var(--surface)',
          borderRadius: 12, padding: 4, marginBottom: 24,
        }}>
          {(['login', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: '8px', borderRadius: 9, fontSize: 14, fontWeight: 600,
                background: mode === m ? 'var(--amber)' : 'transparent',
                color: mode === m ? 'var(--navy)' : 'var(--slate)',
                transition: 'all 0.15s',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                BUSINESS NAME
              </label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Smith Electrical Services"
                required
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: mode === 'signup' ? 14 : 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ ...inputStyle, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)', fontSize: 14 }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                CONFIRM PASSWORD
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                style={inputStyle}
              />
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#F87171', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: loading ? 'var(--surface)' : 'var(--amber)',
              color: loading ? 'var(--slate)' : 'var(--navy)',
              fontSize: 15, fontWeight: 700,
              transition: 'background 0.15s',
            }}
          >
            {loading
              ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
              : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate)', marginTop: 16 }}>
            Don't have an account?{' '}
            <button
              onClick={() => switchMode('signup')}
              style={{ color: 'var(--amber)', fontWeight: 600 }}
            >
              Sign up free
            </button>
          </p>
        )}
        {mode === 'signup' && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--slate)', marginTop: 16, lineHeight: 1.6 }}>
            By creating an account you agree to our{' '}
            <span style={{ color: 'var(--amber)' }}>Terms of Service</span>{' '}
            and{' '}
            <span style={{ color: 'var(--amber)' }}>Privacy Policy</span>.
          </p>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 24, opacity: 0.6 }}>
        © {new Date().getFullYear()} SocialsUnited · Procimate UK Ltd
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--white)',
  fontSize: 14,
};
