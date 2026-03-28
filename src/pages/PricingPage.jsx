// frontend/src/pages/PricingPage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startPayment } from '../utils/razorpay';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const T = {
  dark:'#062213', mid:'#0D3B22',
  lime:'#7ED957', teal:'#00C8A0',
  orange:'#FF6B35', gold:'#FFD700', white:'#E8FFF5',
  muted:'rgba(232,255,245,.72)',
};

const BASE_PLANS = [
  { id:'FREE', label:'Free', price:'₹0', per:'forever', color:'#00C8A0',
    features:[
      'Sessions 1–4 unlocked',
      'Watch & learn for free',
      '✗ IDE / code challenges locked',
      '✗ Quizzes & boss levels locked',
      '✗ No certificates',
    ]},
  { id:'PREMIUM', label:'Premium', price:'₹1,499', per:'/ month', color:'#FF6B35', highlight:true,
    features:[
      'All sessions unlocked',
      'Full live code IDE',
      'Quiz battles & boss levels',
      'Progress reports & badges',
      'Parent dashboard',
      'Completion certificates',
      'Priority support',
    ]},
];

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const nav      = useNavigate();
  const [busy, setBusy] = useState('');
  const [msg,  setMsg]  = useState('');
  const [plans, setPlans] = useState(BASE_PLANS);

  useEffect(() => {
    api.get('/payments/pricing').then(r => {
      if (r.data?.PREMIUM_RUPEES > 0) {
        const rupees = r.data.PREMIUM_RUPEES.toLocaleString('en-IN');
        setPlans(prev => prev.map(p =>
          p.id === 'PREMIUM' ? { ...p, price: `₹${rupees}` } : p
        ));
      }
    }).catch(() => {}); // graceful fallback to BASE_PLANS default
  }, []);

  async function handleUpgrade(plan) {
    if (!user) return nav('/register');
    if (plan === 'FREE') return;
    setBusy(plan); setMsg('');
    try {
      await startPayment({
        plan, user,
        onSuccess: async () => {
          await refreshUser();
          setMsg('🎉 Payment successful! Your plan is now active.');
          setBusy('');
          nav('/dashboard');
        },
        onError: (e) => { setMsg(e); setBusy(''); }
      });
    } finally { setBusy(''); }
  }

  return (
    <>
      <style>{`
        @keyframes sway { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        @keyframes bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .cq-plan-card:hover { transform:translateY(-6px) !important; }
      `}</style>

      <div style={{
        minHeight:'100vh',
        background:`radial-gradient(ellipse at 50% 15%,#0D3B22 0%,#062213 55%,#041A0E 100%)`,
        padding:'0 0 60px', fontFamily:"'Quicksand',sans-serif",
      }}>

        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 24px', borderBottom:`2px solid rgba(255,107,53,.3)`,
          background:'rgba(4,26,14,.92)', backdropFilter:'blur(10px)',
          position:'sticky', top:0, zIndex:20,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}
            onClick={() => nav(user ? '/dashboard' : '/')}>
            <span style={{ fontSize:22, animation:'sway 3s ease-in-out infinite' }}>🐸</span>
            <span style={{ fontFamily:"'Fredoka One',cursive", color:T.lime, fontSize:18 }}>CodeQuest</span>
          </div>
          <button onClick={() => nav(user ? '/dashboard' : '/')} style={backBtn}>← Back</button>
        </div>

        <div style={{ maxWidth:960, margin:'0 auto', padding:'40px 24px' }}>

          {/* Hero */}
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:56, animation:'bob 2s ease-in-out infinite', display:'inline-block', marginBottom:16 }}>🚀</div>
            <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:48, color:T.orange, margin:'0 0 10px' }}>
              Choose Your Plan
            </h1>
            <p style={{ color:T.muted, fontSize:18, margin:0, fontWeight:600 }}>
              Start free. Upgrade anytime. Cancel whenever you want.
            </p>
          </div>

          {msg && (
            <div style={{
              background: msg.startsWith('🎉') ? 'rgba(126,217,87,.15)' : 'rgba(255,71,87,.15)',
              border: `2px solid ${msg.startsWith('🎉') ? T.lime : '#FF4757'}`,
              borderRadius:14, padding:'12px 20px',
              color: msg.startsWith('🎉') ? T.lime : '#FF4757',
              marginBottom:28, textAlign:'center', fontSize:15, fontWeight:700 }}>
              {msg}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:28, maxWidth:720, margin:'0 auto' }}>
            {plans.map(plan => (
              <div key={plan.id} className="cq-plan-card" style={{
                background: plan.highlight
                  ? `linear-gradient(160deg,rgba(255,107,53,.18),rgba(13,59,34,.95))`
                  : 'rgba(13,59,34,.9)',
                border:`3px solid ${plan.color}${plan.highlight ? '' : '99'}`,
                borderRadius:24, padding:32,
                boxShadow: plan.highlight
                  ? `0 10px 0 rgba(200,74,26,.4), 0 20px 50px rgba(255,107,53,.2)`
                  : `0 6px 0 rgba(0,0,0,.4)`,
                position:'relative', transition:'transform .2s',
              }}>
                {plan.highlight && (
                  <div style={{
                    position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)',
                    background:`linear-gradient(90deg,${T.orange},#E8501A)`,
                    color:'#fff', borderRadius:50, padding:'5px 20px',
                    fontFamily:"'Fredoka One',cursive", fontSize:13,
                    boxShadow:'0 4px 0 #C04A1A',
                  }}>⭐ MOST POPULAR</div>
                )}

                <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:plan.color, marginBottom:4 }}>
                  {plan.label}
                </div>
                <div style={{ margin:'12px 0 20px' }}>
                  <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:44, color:T.white }}>
                    {plan.price}
                  </span>
                  <span style={{ color:T.muted, fontSize:14, marginLeft:4 }}>{plan.per}</span>
                </div>

                <ul style={{ listStyle:'none', padding:0, margin:'0 0 28px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{
                      color:T.white, fontSize:14, padding:'7px 0',
                      borderBottom:`1px solid rgba(255,255,255,.1)`,
                      display:'flex', alignItems:'center', gap:8, fontWeight:600,
                    }}>
                      <span style={{ color:plan.color, fontSize:16 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={busy===plan.id || (user?.plan===plan.id)}
                  style={{
                    width:'100%',
                    background: user?.plan===plan.id
                      ? 'rgba(255,255,255,.1)'
                      : `linear-gradient(180deg,${plan.color},${plan.color}CC)`,
                    border:`3px solid ${plan.color}`,
                    borderRadius:14, color: user?.plan===plan.id ? T.muted : '#fff',
                    padding:'13px',
                    fontFamily:"'Fredoka One',cursive", fontSize:17,
                    cursor: user?.plan===plan.id ? 'default' : 'pointer',
                    boxShadow: user?.plan===plan.id ? 'none' : `0 5px 0 ${plan.color}88`,
                  }}>
                  {user?.plan===plan.id ? '✓ Current Plan'
                    : plan.id==='FREE' ? 'Get Started Free'
                    : `Upgrade to ${plan.label}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const backBtn = {
  background:'rgba(255,107,53,.18)', border:'1.5px solid rgba(255,107,53,.5)',
  borderRadius:12, padding:'6px 16px', cursor:'pointer',
  fontFamily:"'Fredoka One',cursive", color:'#FF8C60', fontSize:13,
};
