// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form,  setForm]  = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await login(form.email, form.password);
      nav(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setBusy(false); }
  }

  const inp = {
    width:'100%', padding:'12px 16px', borderRadius:12,
    border:'2.5px solid #A8EED4', fontSize:15,
    fontFamily:"'Quicksand',sans-serif", fontWeight:600,
    background:'#F0FFF8', outline:'none', boxSizing:'border-box', color:'#062213',
  };

  return (
    <div style={{ minHeight:'100vh',
      background:'linear-gradient(160deg,#062213,#0D3B22,#1A6B3C)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, fontFamily:"'Quicksand',sans-serif", position:'relative', overflow:'hidden' }}>

      {/* Leaf decorations */}
      {['10%','85%','5%','92%'].map((l,i)=>(
        <div key={i} style={{ position:'absolute', left:l, top:`${20+i*20}%`,
          fontSize:32, opacity:.18, animation:`sway ${3+i*.5}s ease-in-out infinite`,
          animationDelay:`${i*.4}s` }}>🍃</div>
      ))}

      <div style={{ background:'rgba(6,34,19,.82)', backdropFilter:'blur(12px)',
        borderRadius:26, border:'2px solid rgba(126,217,87,.3)',
        boxShadow:'0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(0,200,160,.1)',
        padding:'40px 36px', maxWidth:420, width:'100%', position:'relative', zIndex:2 }}>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:60, animation:'sway 2s ease-in-out infinite', display:'inline-block' }}>🐸</div>
          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:30,
            color:'#7ED957', margin:'8px 0 4px' }}>Welcome Back!</h1>
          <p style={{ color:'rgba(232,255,245,.6)', fontSize:13 }}>
            Continue your coding adventure in the jungle
          </p>
        </div>

        {error && (
          <div style={{ background:'rgba(255,71,87,.15)', border:'2px solid #FF4757',
            borderRadius:10, padding:'10px 14px', color:'#FF7F8E',
            marginBottom:16, fontSize:13, fontWeight:600 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, color:'#7ED957', fontWeight:700,
              display:'block', marginBottom:5 }}>Email</label>
            <input style={inp} type="email" required placeholder="your@email.com"
              value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
          </div>
          <div style={{ marginBottom:26 }}>
            <label style={{ fontSize:12, color:'#7ED957', fontWeight:700,
              display:'block', marginBottom:5 }}>Password</label>
            <input style={inp} type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} />
          </div>
          <button type="submit" disabled={busy} style={{
            width:'100%',
            background: busy ? '#1A3D2A' : 'linear-gradient(180deg,#7ED957,#5CB833)',
            border:'3px solid #7ED957', borderRadius:14,
            color:'#062213', padding:'13px',
            fontFamily:"'Fredoka One',cursive", fontSize:18,
            cursor: busy ? 'not-allowed' : 'pointer',
            boxShadow:'0 5px 0 #3A8A1A',
            fontWeight:700,
          }}>{busy ? '⏳ Logging in...' : '🐸 Let\'s Go!'}</button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, color:'rgba(232,255,245,.5)', fontSize:14 }}>
          New here?{' '}
          <Link to="/register" style={{ color:'#00C8A0', fontWeight:700 }}>
            Join the jungle →
          </Link>
        </p>
      </div>
    </div>
  );
}
