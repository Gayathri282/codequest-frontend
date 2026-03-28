import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const T = {
  deep:'#041A0E', dark:'#062213', mid:'#0D3B22',
  lime:'#7ED957', teal:'#00C8A0',
  orange:'#FF6B35', gold:'#FFD700', white:'#E8FFF5',
};

const AVATARS = [
  '🐸','🦊','🐱','🐻','🐼','🐨','🐯','🦁','🐰','🐮',
  '🐙','🦄','🐧','🦋','🦔','🐺','🦝','🐵','🦉','🐊',
];

// Pip's dialogue for each step
const PIP_LINES = [
  [
    "Hi there, brave coder! 👋",
    "I'm Pip, your jungle guide!",
    "I'll help you learn to code through epic adventures.",
    "Ready to start your quest? 🌿",
  ],
  [
    "Every hero needs a buddy!",
    "Pick the one that speaks to your soul. 🔥",
  ],
  [
    "AMAZING choice!",
    "Your quest begins NOW.",
    "Let's go earn some XP! ⚡",
  ],
];

function TypingText({ lines, onDone }) {
  const [lineIdx, setLineIdx]   = useState(0);
  const [charIdx, setCharIdx]   = useState(0);
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setLineIdx(0); setCharIdx(0); setDisplayed('');
  }, [lines]);

  useEffect(() => {
    if (lineIdx >= lines.length) { onDone?.(); return; }
    const line = lines[lineIdx];
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setDisplayed(prev => prev + line[charIdx]);
        setCharIdx(c => c + 1);
      }, 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDisplayed('');
        setCharIdx(0);
        setLineIdx(l => l + 1);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [lineIdx, charIdx, lines]); // eslint-disable-line

  return (
    <div style={{
      minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        fontFamily: "'Quicksand', sans-serif", fontWeight: 700,
        fontSize: 17, color: T.white, textAlign: 'center', lineHeight: 1.5,
      }}>
        {displayed}
        <span style={{
          display: 'inline-block', width: 2, height: '1.1em',
          background: T.lime, marginLeft: 2, verticalAlign: 'text-bottom',
          animation: 'cq-blink .7s step-end infinite',
        }} />
      </span>
    </div>
  );
}

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const nav = useNavigate();
  const [step, setStep]         = useState(0);   // 0 = welcome, 1 = avatar, 2 = ready
  const [avatar, setAvatar]     = useState(user?.avatarEmoji || '🐸');
  const [canNext, setCanNext]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [pipBounce, setPipBounce] = useState(false);

  // Admins should never see onboarding
  useEffect(() => {
    if (user?.role === 'ADMIN') nav('/admin', { replace: true });
  }, [user, nav]);

  // Bounce Pip when step changes
  useEffect(() => {
    setPipBounce(false);
    const t = setTimeout(() => setPipBounce(true), 50);
    return () => clearTimeout(t);
  }, [step]);

  function handleTypingDone() {
    setCanNext(true);
  }

  async function handleNext() {
    if (step === 1) {
      // Save avatar immediately so it's set as their default
      setSaving(true);
      try {
        await api.patch('/users/me', { avatarEmoji: avatar });
        await refreshUser();
      } catch (_) {}
      setSaving(false);
    }
    setStep(s => s + 1);
    setCanNext(false);
  }

  function handleFinish() {
    nav('/dashboard');
  }

  const pipSize   = step === 2 ? 120 : 96;
  const stepLabel = ['Meet Pip', 'Your Buddy', 'Let\'s Go!'][step];

  return (
    <>
      <style>{`
        @keyframes cq-bob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes cq-rise  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes cq-pop   { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
        @keyframes cq-blink { 50%{opacity:0} }
        @keyframes cq-shimmer { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes cq-sway  { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
        @keyframes cq-burst {
          0%  { transform:scale(0) rotate(0deg);   opacity:1; }
          80% { transform:scale(1.4) rotate(200deg); opacity:.8; }
          100%{ transform:scale(1.6) rotate(220deg); opacity:0; }
        }
        .cq-av-pick:hover { transform:scale(1.25) !important; }
        .cq-next-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.1); }
        .cq-next-btn:active:not(:disabled) { transform:translateY(1px); }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 20%,#0D3B22 0%,#062213 55%,#041A0E 100%)',
        fontFamily: "'Quicksand', sans-serif",
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', position: 'relative', overflow: 'hidden',
      }}>

        {/* Fireflies */}
        {[{l:'5%',t:'8%',d:'0s',c:T.lime},{l:'91%',t:'12%',d:'.5s',c:T.orange},
          {l:'12%',t:'68%',d:'1s',c:T.teal},{l:'85%',t:'72%',d:'.3s',c:T.lime},
          {l:'50%',t:'4%',d:'.8s',c:T.orange}].map((f,i) => (
          <div key={i} style={{
            position:'absolute', left:f.l, top:f.t, width:7, height:7, borderRadius:'50%',
            background:f.c, boxShadow:`0 0 12px ${f.c}`,
            animation:`cq-shimmer ${1.6+i*.35}s ease-in-out infinite`,
            animationDelay:f.d, pointerEvents:'none',
          }} />
        ))}

        {/* Bottom leaves */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:56,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 8px', pointerEvents:'none' }}>
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃'].map((e,i) => (
            <span key={i} style={{ fontSize:18+((i*5)%12), opacity:.3,
              animation:`cq-sway ${2.8+i*.3}s ease-in-out infinite`, animationDelay:`${i*.2}s` }}>
              {e}
            </span>
          ))}
        </div>

        {/* Step pills */}
        <div style={{ display:'flex', gap:8, marginBottom:32, animation:'cq-rise .4s ease both' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: i === step ? 28 : 10, height:10, borderRadius:6,
              background: i <= step ? T.lime : 'rgba(255,255,255,.2)',
              transition: 'all .35s cubic-bezier(.34,1.56,.64,1)',
            }} />
          ))}
        </div>

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(13,59,34,.85)', backdropFilter: 'blur(12px)',
          border: `2px solid rgba(126,217,87,.25)`,
          borderRadius: 28, padding: '36px 32px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,.5)',
          animation: 'cq-rise .45s ease both',
        }}>

          {/* Step label */}
          <div style={{
            textAlign:'center', marginBottom:4,
            fontFamily:"'Fredoka One',cursive", fontSize:12,
            color:'rgba(126,217,87,.6)', letterSpacing:2, textTransform:'uppercase',
          }}>
            {stepLabel}
          </div>

          {/* Pip */}
          <div style={{ textAlign:'center', marginBottom:8 }}>
            <div style={{
              display:'inline-block', fontSize:pipSize,
              animation: pipBounce ? 'cq-bob 2s ease-in-out infinite' : 'none',
              transition: 'font-size .3s',
              filter:'drop-shadow(0 0 18px rgba(126,217,87,.5))',
            }}>
              🐸
            </div>
          </div>

          {/* Speech bubble */}
          <div style={{
            position:'relative', background:'rgba(0,0,0,.35)',
            border:'2px solid rgba(126,217,87,.3)', borderRadius:18,
            padding:'16px 20px', marginBottom:24, minHeight:88,
          }}>
            {/* Bubble tail pointing up to Pip */}
            <div style={{
              position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)',
              width:0, height:0,
              borderLeft:'10px solid transparent', borderRight:'10px solid transparent',
              borderBottom:'10px solid rgba(126,217,87,.3)',
            }} />
            <TypingText
              key={step}
              lines={PIP_LINES[step]}
              onDone={handleTypingDone}
            />
          </div>

          {/* ── Step 1: Avatar picker ── */}
          {step === 1 && (
            <div style={{ marginBottom:24, animation:'cq-pop .4s ease both' }}>
              <div style={{ fontFamily:"'Fredoka One',cursive", color:T.gold,
                fontSize:15, textAlign:'center', marginBottom:14 }}>
                Pick your adventure buddy
              </div>
              <div style={{
                display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10,
                maxHeight:180, overflowY:'auto', paddingRight:4,
              }}>
                {AVATARS.map(em => (
                  <div
                    key={em}
                    className="cq-av-pick"
                    onClick={() => setAvatar(em)}
                    style={{
                      fontSize:34, cursor:'pointer', textAlign:'center',
                      padding:'8px 4px', borderRadius:14,
                      background: avatar === em
                        ? `linear-gradient(135deg,${T.lime}33,${T.teal}22)`
                        : 'rgba(255,255,255,.06)',
                      border: `2px solid ${avatar === em ? T.lime : 'transparent'}`,
                      boxShadow: avatar === em ? `0 0 14px ${T.lime}66` : 'none',
                      transition: 'all .15s, transform .12s',
                    }}
                  >
                    {em}
                  </div>
                ))}
              </div>
              {/* Preview */}
              <div style={{ textAlign:'center', marginTop:16 }}>
                <span style={{
                  fontSize:12, fontWeight:700, color:'rgba(232,255,245,.5)',
                  letterSpacing:1, textTransform:'uppercase',
                }}>Your buddy: </span>
                <span style={{ fontSize:28, animation:'cq-bob 2s ease-in-out infinite',
                  display:'inline-block', filter:'drop-shadow(0 0 8px rgba(255,215,0,.6))' }}>
                  {avatar}
                </span>
              </div>
            </div>
          )}

          {/* ── Step 2: Confetti burst ── */}
          {step === 2 && (
            <div style={{ textAlign:'center', marginBottom:24, animation:'cq-pop .4s ease both' }}>
              {['🎉','⭐','🌟','✨','🏆','🎊','💫'].map((e,i) => (
                <span key={i} style={{
                  fontSize:22+((i*4)%12), display:'inline-block',
                  margin:'0 3px',
                  animation:`cq-bob ${1.4+i*.2}s ease-in-out infinite`,
                  animationDelay:`${i*.12}s`,
                }}>{e}</span>
              ))}
              <div style={{
                marginTop:16, fontFamily:"'Fredoka One',cursive",
                fontSize:22, color:T.gold,
              }}>
                {user?.displayName || user?.username || 'Explorer'}, you're ready!
              </div>
              <div style={{ fontSize:36, marginTop:8, animation:'cq-bob 1.8s ease-in-out infinite' }}>
                {avatar}
              </div>
            </div>
          )}

          {/* CTA button */}
          {step < 2 ? (
            <button
              className="cq-next-btn"
              onClick={handleNext}
              disabled={!canNext || saving}
              style={{
                width:'100%', padding:'15px',
                background: canNext
                  ? `linear-gradient(180deg,${T.lime},#5BB832)`
                  : 'rgba(255,255,255,.15)',
                border:'none', borderRadius:16,
                fontFamily:"'Fredoka One',cursive", fontSize:18,
                color: canNext ? T.deep : 'rgba(255,255,255,.4)',
                cursor: canNext ? 'pointer' : 'default',
                boxShadow: canNext ? `0 5px 0 #3A8A1A` : 'none',
                transition: 'all .2s, transform .12s',
              }}
            >
              {step === 0 ? "Meet the Jungle! 🌿" : saving ? '⏳ Saving...' : `Choose ${avatar}! →`}
            </button>
          ) : (
            <button
              className="cq-next-btn"
              onClick={handleFinish}
              disabled={saving || !canNext}
              style={{
                width:'100%', padding:'15px',
                background: (saving || !canNext)
                  ? 'rgba(255,255,255,.15)'
                  : `linear-gradient(180deg,${T.orange},#E8501A)`,
                border:'none', borderRadius:16,
                fontFamily:"'Fredoka One',cursive", fontSize:20,
                color: (saving || !canNext) ? 'rgba(255,255,255,.4)' : '#fff',
                cursor: (saving || !canNext) ? 'default' : 'pointer',
                boxShadow: (saving || !canNext) ? 'none' : '0 5px 0 #C04A1A',
                transition: 'all .2s, transform .12s',
              }}
            >
              {saving ? '⏳ Setting up...' : '🐸 Start My Quest!'}
            </button>
          )}

          {/* Skip link */}
          {step === 0 && (
            <div style={{ textAlign:'center', marginTop:16 }}>
              <button onClick={() => nav('/dashboard')} style={{
                background:'none', border:'none', cursor:'pointer',
                color:'rgba(232,255,245,.35)', fontSize:12, fontWeight:600,
              }}>
                Skip intro →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
