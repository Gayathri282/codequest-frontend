import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const nav = useNavigate();
  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    // Show "waking up" hint after 5s (Render free tier cold start)
    const slowTimer = setTimeout(() => {
      setBusy('slow');
    }, 5000);
    try {
      const user = await login(form.email, form.password);
      nav(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is waking up — please try again in a few seconds.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      clearTimeout(slowTimer);
      setBusy(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes cq-bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes cq-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .cq-input:focus { border-color:#FF6B35 !important; background:#FFF8F5 !important; outline:none; }
        .cq-btn-main:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.08); }
        .cq-btn-main:active:not(:disabled) { transform:translateY(1px); box-shadow:0 2px 0 #C04A1A !important; }
        .cq-split { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
        .cq-form-panel { animation:cq-rise 0.35s ease both; }
        @media(max-width:680px){ .cq-split{grid-template-columns:1fr;} .cq-split-left{display:none;} }
      `}</style>

      <div className="cq-split" style={{
        minHeight: '100vh',
        fontFamily: "'Quicksand', sans-serif",
      }}>

        {/* ── Left panel — decorative ── */}
        <div className="cq-split-left" style={{
          background: 'linear-gradient(145deg, #FF6B35 0%, #FF8C42 40%, #FFB347 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 48, position: 'relative', overflow: 'hidden',
        }}>
          {/* Background rings */}
          {[220, 320, 420].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', width: s, height: s, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.15)',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
            }} />
          ))}

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div style={{ fontSize: 100, animation: 'cq-bob 2s ease-in-out infinite', display:'inline-block' }}>🐸</div>

            <div style={{
              background: 'rgba(0,0,0,0.18)', borderRadius: 20,
              padding: '28px 36px', marginTop: 20,
              border: '2px solid rgba(255,255,255,0.25)',
            }}>
              <h2 style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 36, color: '#fff',
                margin: '0 0 10px', textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>CodeQuest</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, margin: 0, fontWeight: 600 }}>
                Learn to code on an<br/>epic jungle adventure
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              {['🏆 Earn badges', '⚡ Level up', '💻 Write real code'].map(t => (
                <span key={t} style={{
                  background: 'rgba(255,255,255,0.2)', borderRadius: 50,
                  padding: '6px 14px', color: '#fff', fontSize: 12, fontWeight: 700,
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="cq-form-panel" style={{
          background: '#FFFAF8',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 56px',
        }}>

          <div style={{ width: '100%', maxWidth: 360 }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#FFF0E8', borderRadius: 50,
                padding: '6px 14px', marginBottom: 16,
                border: '1.5px solid #FFD4BA',
              }}>
                <span style={{ fontSize: 14 }}>🌿</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#FF6B35' }}>JUNGLE PORTAL</span>
              </div>
              <h1 style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 32, color: '#1A0A00',
                margin: '0 0 6px',
              }}>Welcome back!</h1>
              <p style={{ color: '#8A7060', fontSize: 14, margin: 0, fontWeight: 600 }}>
                Continue your coding adventure
              </p>
            </div>

            {/* Error — always rendered to avoid layout shift */}
            <div style={{
              background: error ? '#FFF0F0' : 'transparent',
              border: `2px solid ${error ? '#FF4757' : 'transparent'}`,
              borderRadius: 10, padding: error ? '10px 14px' : '0 14px',
              color: '#C0392B', fontSize: 13, fontWeight: 700,
              marginBottom: 16, minHeight: 40,
              transition: 'all 0.2s ease',
              overflow: 'hidden',
            }}>
              {error}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#5A3A20', display: 'block', marginBottom: 6, letterSpacing: 0.5 }}>
                  EMAIL ADDRESS
                </label>
                <input
                  className="cq-input"
                  type="email" required
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px 16px',
                    borderRadius: 12, border: '2.5px solid #E8D8CC',
                    fontSize: 14, fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 600, background: '#FFF',
                    color: '#1A0A00', boxSizing: 'border-box',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#5A3A20', display: 'block', marginBottom: 6, letterSpacing: 0.5 }}>
                  PASSWORD
                </label>
                <input
                  className="cq-input"
                  type="password" required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px 16px',
                    borderRadius: 12, border: '2.5px solid #E8D8CC',
                    fontSize: 14, fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 600, background: '#FFF',
                    color: '#1A0A00', boxSizing: 'border-box',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="cq-btn-main"
                style={{
                  marginTop: 8,
                  background: busy ? '#CDB8AC' : 'linear-gradient(180deg, #FF6B35, #E8501A)',
                  border: 'none',
                  borderRadius: 14,
                  color: '#fff',
                  padding: '14px',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: 18,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  boxShadow: busy ? 'none' : '0 4px 0 #C04A1A',
                  transition: 'transform 0.12s, filter 0.12s, box-shadow 0.12s',
                  letterSpacing: 0.5,
                }}
              >
                {busy === 'slow' ? '⏳ Waking server up…' : busy ? '⏳ Logging in...' : '🐸 Let\'s Go!'}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Link to="/forgot-password" style={{ color: '#FF6B35', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            {/* Google Sign-In */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: '#F0E4DC' }} />
                <span style={{ color: '#8A7060', fontSize: 12, fontWeight: 700 }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#F0E4DC' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={async ({ credential }) => {
                    try {
                      const user = await googleLogin(credential);
                      if (user.role === 'ADMIN') nav('/admin');
                      else if (user.isNew) nav('/onboarding');
                      else nav('/dashboard');
                    } catch (e) {
                      setError(e.response?.data?.error || 'Google sign-in failed');
                    }
                  }}
                  onError={() => setError('Google sign-in failed')}
                  useOneTap
                  shape="pill"
                  text="signin_with"
                />
              </div>
            </div>

            <div style={{
              marginTop: 24, paddingTop: 24,
              borderTop: '2px solid #F0E4DC',
              textAlign: 'center',
            }}>
              <span style={{ color: '#8A7060', fontSize: 14, fontWeight: 600 }}>New here? </span>
              <Link to="/register" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                Join the jungle →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
