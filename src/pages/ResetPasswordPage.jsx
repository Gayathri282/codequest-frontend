import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const [params]    = useSearchParams();
  const nav         = useNavigate();
  const token       = params.get('token');

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);
  const [busy,      setBusy]      = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 8)  return setError('Password must be at least 8 characters.');
    setError(''); setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => nav('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
    } finally { setBusy(false); }
  }

  const INP = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '2.5px solid #E8D8CC', fontSize: 14,
    fontFamily: "'Quicksand', sans-serif", fontWeight: 600,
    background: '#FFF', color: '#1A0A00', boxSizing: 'border-box',
    transition: 'border-color 0.15s, background 0.15s',
  };

  return (
    <>
      <style>{`
        @keyframes cq-bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes cq-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .cq-rp-input:focus { border-color:#FF6B35 !important; background:#FFF8F5 !important; outline:none; }
        .cq-rp-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.08); }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#FFFAF8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Quicksand', sans-serif", padding: 24,
      }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'cq-rise 0.35s ease both' }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 72, animation: 'cq-bob 2s ease-in-out infinite', display: 'inline-block' }}>🔑</div>
            <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: '#1A0A00', margin: '10px 0 6px' }}>
              Set New Password
            </h1>
            <p style={{ color: '#8A7060', fontSize: 14, margin: 0, fontWeight: 600 }}>
              Choose a strong password for your account
            </p>
          </div>

          {!token ? (
            <div style={{ background: '#FFF0F0', border: '2px solid #FF4757', borderRadius: 14, padding: '20px 24px', textAlign: 'center' }}>
              <p style={{ color: '#C0392B', fontWeight: 700, fontSize: 14, margin: 0 }}>
                Invalid reset link. Please request a new one.
              </p>
            </div>
          ) : done ? (
            <div style={{ background: '#F0FFF5', border: '2px solid #00C8A0', borderRadius: 14, padding: '20px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <p style={{ color: '#00956F', fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>Password updated!</p>
              <p style={{ color: '#5A7A6A', fontSize: 13, margin: 0 }}>Redirecting to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  background: '#FFF0F0', border: '2px solid #FF4757',
                  borderRadius: 10, padding: '10px 14px',
                  color: '#C0392B', fontSize: 13, fontWeight: 700, marginBottom: 16,
                }}>{error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: '#5A3A20', display: 'block', marginBottom: 6, letterSpacing: 0.5 }}>
                    NEW PASSWORD
                  </label>
                  <input className="cq-rp-input" style={INP} type="password" required
                    placeholder="Min. 8 characters" value={password}
                    onChange={e => setPassword(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: '#5A3A20', display: 'block', marginBottom: 6, letterSpacing: 0.5 }}>
                    CONFIRM PASSWORD
                  </label>
                  <input className="cq-rp-input" style={INP} type="password" required
                    placeholder="Repeat your password" value={confirm}
                    onChange={e => setConfirm(e.target.value)} />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="cq-rp-btn"
                  style={{
                    background: busy ? '#CDB8AC' : 'linear-gradient(180deg, #FF6B35, #E8501A)',
                    border: 'none', borderRadius: 14, color: '#fff', padding: '14px',
                    fontFamily: "'Fredoka One', cursive", fontSize: 18,
                    cursor: busy ? 'not-allowed' : 'pointer',
                    boxShadow: busy ? 'none' : '0 4px 0 #C04A1A',
                    transition: 'transform 0.12s, filter 0.12s',
                  }}
                >
                  {busy ? '⏳ Updating...' : '🔑 Update Password'}
                </button>
              </form>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/login" style={{ color: '#FF6B35', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
