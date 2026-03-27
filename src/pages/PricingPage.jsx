// frontend/src/pages/PricingPage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startPayment } from '../utils/razorpay';
import { useState } from 'react';

const PLANS = [
  { id:'FREE',    label:'Free',    price:'₹0',      per:'forever', color:'#6B82A8',
    features:['1 course (HTML basics)', '2 lessons preview only', 'No IDE', 'No certificates'] },
  { id:'BASIC',   label:'Basic',   price:'₹299',    per:'/ month', color:'#00C8E8',
    features:['All 4 courses', 'Full live code IDE', 'Quiz battles', 'Progress reports', 'Parent dashboard'] },
  { id:'PREMIUM', label:'Premium', price:'₹799',    per:'/ month', color:'#FF4FCB',
    features:['Everything in Basic', 'Live doubt sessions (2/month)', 'Certificates', 'Priority support', 'Early access to new courses'], highlight:true },
];

export default function PricingPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState('');
  const [msg,  setMsg]  = useState('');

  async function handleUpgrade(plan) {
    if (!user) return nav('/register');
    if (plan === 'FREE') return;
    setBusy(plan); setMsg('');
    try {
      await startPayment({
        plan, user,
        onSuccess: () => { setMsg('🎉 Payment successful! Your plan is now active.'); setBusy(''); nav('/dashboard'); },
        onError:   (e)  => { setMsg(e); setBusy(''); }
      });
    } finally { setBusy(''); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#E0F7FF,#B3ECFF)',
      padding:'40px 24px', fontFamily:"'Nunito',sans-serif" }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h1 style={{ fontFamily:"'Boogaloo',cursive", fontSize:48, color:'#FF6B35' }}>Choose Your Plan 🚀</h1>
          <p style={{ color:'#6B82A8', fontSize:18 }}>Start free. Upgrade anytime. Cancel whenever you want.</p>
        </div>

        {msg && <div style={{ background:'#EDFFF3', border:'2px solid #7ED957', borderRadius:14,
          padding:'12px 20px', color:'#1A7A30', marginBottom:24, textAlign:'center', fontSize:15 }}>{msg}</div>}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.highlight ? `linear-gradient(135deg,${plan.color}22,#fff)` : '#fff',
              border:`3px solid ${plan.color}`,
              borderRadius:24, padding:32,
              boxShadow: plan.highlight ? `0 8px 0 ${plan.color}66, 0 16px 40px ${plan.color}33` : `0 6px 0 ${plan.color}44`,
              position:'relative'
            }}>
              {plan.highlight && (
                <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)',
                  background:plan.color, color:'#fff', borderRadius:50, padding:'4px 18px',
                  fontFamily:"'Boogaloo',cursive", fontSize:14 }}>⭐ MOST POPULAR</div>
              )}
              <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:24, color:plan.color }}>{plan.label}</div>
              <div style={{ margin:'12px 0' }}>
                <span style={{ fontFamily:"'Boogaloo',cursive", fontSize:40, color:'#1A2340' }}>{plan.price}</span>
                <span style={{ color:'#6B82A8', fontSize:14 }}> {plan.per}</span>
              </div>
              <ul style={{ listStyle:'none', padding:0, margin:'0 0 24px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ color:'#1A2340', fontSize:14, padding:'5px 0',
                    borderBottom:'1px solid #EAF6FF' }}>✅ {f}</li>
                ))}
              </ul>
              <button onClick={() => handleUpgrade(plan.id)} disabled={busy===plan.id || (user?.plan===plan.id)}
                style={{
                  width:'100%', background: user?.plan===plan.id ? '#D0E4F0' : `linear-gradient(180deg,${plan.color},${plan.color}bb)`,
                  border:`3px solid ${plan.color}`, borderRadius:14, color: user?.plan===plan.id ? '#6B82A8' : '#fff',
                  padding:'12px', fontFamily:"'Boogaloo',cursive", fontSize:17,
                  cursor: user?.plan===plan.id ? 'default' : 'pointer',
                  boxShadow: user?.plan===plan.id ? 'none' : `0 5px 0 ${plan.color}88`
                }}>
                {user?.plan===plan.id ? '✓ Current Plan' : plan.id==='FREE' ? 'Get Started Free' : `Upgrade to ${plan.label}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
