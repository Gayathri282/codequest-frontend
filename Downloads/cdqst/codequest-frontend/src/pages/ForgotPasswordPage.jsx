import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState(''); // 'sent' | ''
  const [error,   setError]   = useState('');
  const [busy,    setBusy]    = useState(false);
  const errorTimer = useRef(null);

  function showError(msg) {
    setError(msg);
    clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setError(''), 120000);
  }

  useEffect(() => () => clearTimeout(errorTimer.current), []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('sent');
    } catch (err) {
      showError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  }

  return (
    <>
      <style>{`
        @keyframes cq-bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes cq-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .cq-fp-input:focus { border-color:#FF6B35 !important; background:#FFF8F5 !important; outline:none; }
        .cq-fp-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.08); }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#FFFAF8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Quicksand', sans-serif", padding: 24,
      }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'cq-rise 0.35s ease both' }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 72, animation: 'cq-bob 2s ease-in-out infinite', display: 'inline-block' }}>🐸</div>
            <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: '#1A0A00', margin: '10px 0 6px' }}>
              Forgot Password?
            </h1>
            <p style={{ color: '#8A7060', fontSize: 14, margin: 0, fontWeight: 600 }}>
              Enter your email and we'll send a reset link
            </p>
          </div>

          {status === 'sent' ? (
            <div style={{
              background: '#F0FFF5', border: '2px solid #00C8A0',
              borderRadius: 14, padding: '20px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📬</div>
              <p style={{ color: '#00956F', fontWeight: 700, fontSize: 15, margin: '0 0 8px' }}>
                Reset link sent!
              </p>
              <p style={{ color: '#5A7A6A', fontSize: 13, margin: 0 }}>
                Check your inbox — the link expires in 1 hour.
              </p>
            </div>
          ) : (
            <>
              <div style={{
                background: error ? '#FFF0F0' : 'transparent',
                border: `2px solid ${error ? '#FF4757' : 'transparent'}`,
                borderRadius: 10, padding: error ? '10px 14px' : '0 14px',
                color: '#C0392B', fontSize: 13, fontWeight: 700,
                marginBottom: 16, minHeight: 40,
                transition: 'all 0.2s ease',
              }}>{error}</div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: '#5A3A20', display: 'block', marginBottom: 6, letterSpacing: 0.5 }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    className="cq-fp-input"
                    type="email" required
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '2.5px solid #E8D8CC', fontSize: 14,
                      fontFamily: "'Quicksand', sans-serif", fontWeight: 600,
                      background: '#FFF', color: '#1A0A00', boxSizing: 'border-box',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="cq-fp-btn"
                  style={{
                    background: busy ? '#CDB8AC' : 'linear-gradient(180deg, #FF6B35, #E8501A)',
                    border: 'none', borderRadius: 14, color: '#fff', padding: '14px',
                    fontFamily: "'Fredoka One', cursive", fontSize: 18,
                    cursor: busy ? 'not-allowed' : 'pointer',
                    boxShadow: busy ? 'none' : '0 4px 0 #C04A1A',
                    transition: 'transform 0.12s, filter 0.12s',
                  }}
                >
                  {busy ? '⏳ Sending...' : '📬 Send Reset Link'}
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
