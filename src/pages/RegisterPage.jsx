// frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setBusy(false); }
  }

  const inp = {
    width:'100%', padding:'11px 14px', borderRadius:12,
    border:'2.5px solid #A8EED4', fontSize:14,
    fontFamily:"'Quicksand',sans-serif", fontWeight:600,
    background:'#F0FFF8', outline:'none', boxSizing:'border-box', color:'#062213',
  };
  const lbl = { fontSize:12, color:'#7ED957', fontWeight:700, display:'block', marginBottom:4 };

  return (
    <div style={{ minHeight:'100vh',
      background:'linear-gradient(160deg,#062213,#0D3B22,#1A6B3C)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, fontFamily:"'Quicksand',sans-serif", position:'relative', overflow:'hidden' }}>

      {/* Leaf decorations */}
      {['8%','88%','3%','94%','50%'].map((l,i)=>(
        <div key={i} style={{ position:'absolute', left:l, top:`${10+i*16}%`,
          fontSize:28+i*4, opacity:.15, animation:`sway ${3+i*.4}s ease-in-out infinite`,
          animationDelay:`${i*.35}s` }}>🍃</div>
      ))}

      <div style={{ background:'rgba(6,34,19,.85)', backdropFilter:'blur(12px)',
        borderRadius:26, border:'2px solid rgba(0,200,160,.3)',
        boxShadow:'0 20px 60px rgba(0,0,0,.5)',
        padding:'36px 34px', maxWidth:440, width:'100%', position:'relative', zIndex:2 }}>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:56, animation:'bob 2s ease-in-out infinite', display:'inline-block' }}>🐸</div>
          <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:28,
            color:'#00C8A0', margin:'8px 0 4px' }}>Join the Jungle!</h1>
          <p style={{ color:'rgba(232,255,245,.55)', fontSize:13 }}>
            Create your account and earn your first coin 🪙
          </p>
        </div>

        {error && (
          <div style={{ background:'rgba(255,71,87,.15)', border:'2px solid #FF4757',
            borderRadius:10, padding:'10px 14px', color:'#FF7F8E',
            marginBottom:16, fontSize:13, fontWeight:600 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11, marginBottom:11 }}>
            {[
              { label:'Display Name', field:'displayName', type:'text',   placeholder:'e.g. Alex', full:true },
              { label:'Username',     field:'username',    type:'text',   placeholder:'e.g. jungle_alex' },
              { label:'Age',          field:'age',         type:'number', placeholder:'e.g. 10' },
            ].map(f => (
              <div key={f.field} style={{ gridColumn: f.full ? '1 / -1' : undefined }}>
                <label style={lbl}>{f.label}</label>
                <input style={inp} type={f.type} placeholder={f.placeholder}
                  value={form[f.field]} onChange={e => setForm(p=>({...p,[f.field]:e.target.value}))} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom:11 }}>
            <label style={lbl}>Email (parent's email for kids under 13)</label>
            <input style={inp} type="email" required placeholder="parent@email.com"
              value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={lbl}>Password</label>
            <input style={inp} type="password" required minLength={8} placeholder="Min. 8 characters"
              value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} />
          </div>
          <button type="submit" disabled={busy} style={{
            width:'100%',
            background: busy ? '#1A3D2A' : 'linear-gradient(180deg,#00C8A0,#009E7A)',
            border:'3px solid #00C8A0', borderRadius:14,
            color:'#fff', padding:'13px',
            fontFamily:"'Fredoka One',cursive", fontSize:18,
            cursor: busy ? 'not-allowed' : 'pointer',
            boxShadow:'0 5px 0 #006E55',
          }}>{busy ? '⏳ Creating account...' : '🌿 Start Adventure!'}</button>
        </form>

        <p style={{ textAlign:'center', marginTop:18, color:'rgba(232,255,245,.5)', fontSize:13 }}>
          Already a coder?{' '}
          <Link to="/login" style={{ color:'#7ED957', fontWeight:700 }}>Log in →</Link>
        </p>
        <p style={{ textAlign:'center', color:'rgba(232,255,245,.3)', fontSize:11, marginTop:8 }}>
          By registering you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
