import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const INP_STYLE = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: '2.5px solid #E8D8CC', fontSize: 14,
  fontFamily: "'Quicksand', sans-serif", fontWeight: 600,
  background: '#FFF', color: '#1A0A00', boxSizing: 'border-box',
  transition: 'border-color 0.15s, background 0.15s',
};
const LBL_STYLE = {
  fontSize: 12, fontWeight: 800, color: '#5A3A20',
  display: 'block', marginBottom: 6, letterSpacing: 0.5,
};

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form,  setForm]  = useState({ email:'', password:'', username:'', displayName:'', age:'' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await register(form);
      nav('/dashboard');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('ALREADY_EXISTS');
      } else {
        setError(err.response?.data?.error || 'Registration failed');
      }
    } finally { setBusy(false); }
  }

  return (
    <>
      <style>{`
        @keyframes cq-bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes cq-rise { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        .cq-ri:focus { border-color:#00C8A0 !important; background:#F0FFF9 !important; outline:none; }
        .cq-reg-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.08); }
        .cq-reg-btn:active:not(:disabled) { transform:translateY(1px); box-shadow:0 2px 0 #006E55 !important; }
        .cq-rsplit { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
        @media(max-width:680px){ .cq-rsplit{ grid-template-columns:1fr; } .cq-rleft{ display:none; } }
      `}</style>

      <div className="cq-rsplit" style={{ fontFamily: "'Quicksand', sans-serif" }}>

        {/* ── Left panel ── */}
        <div className="cq-rleft" style={{
          background: 'linear-gradient(145deg, #0D3B22 0%, #1A6B3C 50%, #00C8A0 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 48, position: 'relative', overflow: 'hidden',
        }}>
          {[200, 310, 420].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', width: s, height: s, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.12)',
              top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            }} />
          ))}

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div style={{ fontSize: 96, animation: 'cq-bob 2s ease-in-out infinite', display: 'inline-block' }}>🐸</div>

            <div style={{
              background: 'rgba(0,0,0,0.2)', borderRadius: 20,
              padding: '24px 32px', marginTop: 20,
              border: '2px solid rgba(255,255,255,0.2)',
            }}>
              <h2 style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 30, color: '#fff', margin: '0 0 10px',
              }}>Join the Jungle!</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, margin: 0, fontWeight: 600 }}>
                Build real websites · Earn XP<br/>Collect coins · Unlock badges
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              {['🪙 Free to start', '🎯 Real projects', '🏅 Earn badges'].map(t => (
                <span key={t} style={{
                  background: 'rgba(255,255,255,0.18)', borderRadius: 50,
                  padding: '5px 12px', color: '#fff', fontSize: 12, fontWeight: 700,
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div style={{
          background: '#FFFAF8',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 56px',
          animation: 'cq-rise 0.4s ease both',
        }}>
          <div style={{ width: '100%', maxWidth: 360 }}>

            <div style={{ marginBottom: 28 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#E8FFF5', borderRadius: 50,
                padding: '6px 14px', marginBottom: 14,
                border: '1.5px solid #A8EED4',
              }}>
                <span style={{ fontSize: 14 }}>🌿</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#00956F' }}>NEW ADVENTURER</span>
              </div>
              <h1 style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: 30, color: '#1A0A00', margin: '0 0 6px',
              }}>Create your account</h1>
              <p style={{ color: '#8A7060', fontSize: 13, margin: 0, fontWeight: 600 }}>
                Earn your first coin when you register 🪙
              </p>
            </div>

            {error && (
              <div style={{
                background: '#FFF0F0', border: '2px solid #FF4757',
                borderRadius: 10, padding: '10px 14px',
                color: '#C0392B', fontSize: 13, fontWeight: 700, marginBottom: 16,
              }}>
                {error === 'ALREADY_EXISTS' ? (
                  <>This email is already registered.{' '}
                    <Link to="/login" style={{ color:'#C0392B', fontWeight:800 }}>Log in instead →</Link>
                  </>
                ) : error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LBL_STYLE}>DISPLAY NAME</label>
                  <input className="cq-ri" style={INP_STYLE} type="text" placeholder="e.g. Alex"
                    value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} />
                </div>
                <div>
                  <label style={LBL_STYLE}>USERNAME</label>
                  <input className="cq-ri" style={INP_STYLE} type="text" placeholder="jungle_alex"
                    value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
                </div>
                <div>
                  <label style={LBL_STYLE}>AGE</label>
                  <input className="cq-ri" style={INP_STYLE} type="number" placeholder="e.g. 10"
                    value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={LBL_STYLE}>EMAIL</label>
                <input className="cq-ri" style={INP_STYLE} type="email" required
                  placeholder="parent@email.com (under 13)"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>

              <div>
                <label style={LBL_STYLE}>PASSWORD</label>
                <input className="cq-ri" style={INP_STYLE} type="password" required minLength={8}
                  placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="cq-reg-btn"
                style={{
                  marginTop: 6,
                  background: busy ? '#CDB8AC' : 'linear-gradient(180deg, #00C8A0, #009E7A)',
                  border: 'none', borderRadius: 14,
                  color: '#fff', padding: '14px',
                  fontFamily: "'Fredoka One', cursive", fontSize: 18,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  boxShadow: busy ? 'none' : '0 4px 0 #006E55',
                  transition: 'transform 0.12s, filter 0.12s, box-shadow 0.12s',
                }}
              >
                {busy ? '⏳ Creating account...' : '🌿 Start Adventure!'}
              </button>
            </form>

            <div style={{
              marginTop: 24, paddingTop: 20,
              borderTop: '2px solid #F0E4DC',
              textAlign: 'center',
            }}>
              <span style={{ color: '#8A7060', fontSize: 14, fontWeight: 600 }}>Already a coder? </span>
              <Link to="/login" style={{ color: '#00956F', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                Log in →
              </Link>
            </div>
            <p style={{ textAlign: 'center', color: '#C4A898', fontSize: 11, marginTop: 10 }}>
              By registering you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
