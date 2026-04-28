// frontend/src/components/student/OnboardingFlow.jsx
// Game-style intro for first-time kids — one screen at a time, tap to advance
import { useState, useEffect } from 'react';

const T = {
  deep:  '#041A0E',
  dark:  '#062213',
  mid:   '#0D3B22',
  lime:  '#7ED957',
  teal:  '#00C8A0',
  cyan:  '#00C8E8',
  gold:  '#FFD700',
  white: '#E8FFF5',
};

/* ── Firefly dot ── */
function Firefly({ style }) {
  return <div style={{ position:'absolute', width:5, height:5, borderRadius:'50%',
    background:T.lime, boxShadow:`0 0 8px ${T.lime}`, ...style }} />;
}

/* ── Big tap button ── */
function TapBtn({ onClick, children, color = T.lime, dark = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(180deg,${color},${color}CC)`,
        border: `3px solid ${color}`,
        borderRadius: 20, color: dark ? T.dark : '#fff',
        cursor: 'pointer',
        fontFamily: "'Fredoka One',cursive",
        fontSize: 22, padding: '18px 56px',
        boxShadow: `0 7px 0 ${color}66`,
        transition: 'transform .1s',
        width: '100%', maxWidth: 340,
        letterSpacing: .5,
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'}
      onMouseUp  ={e => e.currentTarget.style.transform = ''}
      onTouchStart={e => e.currentTarget.style.transform = 'translateY(4px)'}
      onTouchEnd  ={e => e.currentTarget.style.transform = ''}
    >
      {children}
    </button>
  );
}

/* ── Step dots ── */
function Dots({ total, current }) {
  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 22 : 8,
          height: 8, borderRadius: 4,
          background: i === current ? T.lime : 'rgba(126,217,87,.3)',
          transition: 'width .3s, background .3s',
        }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCREEN 1 — Welcome
══════════════════════════════════════════════ */
function ScreenWelcome({ name, onNext }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', textAlign:'center', padding:'0 24px', gap:0 }}>

      {/* Parrot */}
      <div style={{ fontSize:110, lineHeight:1, animation:'bob 1.6s ease-in-out infinite',
        filter:`drop-shadow(0 0 28px ${T.lime}88)`, marginBottom:16 }}>
        🐸
      </div>

      <div style={{ fontFamily:"'Fredoka One',cursive",
        fontSize:'clamp(32px,8vw,52px)', color:T.lime, lineHeight:1.1, marginBottom:10 }}>
        Hi {name || 'there'}! 👋
      </div>

      <div style={{ fontFamily:"'Fredoka One',cursive",
        fontSize:'clamp(18px,4vw,24px)', color:T.white, marginBottom:8 }}>
        I'm <span style={{ color:T.teal }}>Pip</span> — your jungle guide!
      </div>

      <div style={{ color:'rgba(232,255,245,.55)', fontSize:15, fontWeight:600,
        marginBottom:40, maxWidth:300 }}>
        Together we'll go on a coding adventure 🌿
      </div>

      <TapBtn onClick={onNext} color={T.lime} dark>Let's go! →</TapBtn>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCREEN 2 — The adventure
══════════════════════════════════════════════ */
function ScreenAdventure({ onNext }) {
  const items = [
    { emoji:'🎬', title:'Watch',  sub:'Short videos that explain everything' },
    { emoji:'💻', title:'Code',   sub:'Write real code right in your browser' },
    { emoji:'🏆', title:'Level up!', sub:'Collect XP, coins and cool medals' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      textAlign:'center', padding:'0 20px', gap:0 }}>

      <div style={{ fontFamily:"'Fredoka One',cursive",
        fontSize:'clamp(24px,6vw,38px)', color:T.white, marginBottom:8 }}>
        Here's how it works
      </div>
      <div style={{ color:'rgba(232,255,245,.5)', fontSize:14, fontWeight:600, marginBottom:32 }}>
        Three simple steps — that's it!
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:14,
        width:'100%', maxWidth:340, marginBottom:40 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: 'rgba(13,59,34,.8)',
            border: `2px solid rgba(126,217,87,.25)`,
            borderRadius: 18, padding:'16px 20px',
            display:'flex', alignItems:'center', gap:16,
            animation: `pop .4s ${i*0.1}s ease both`,
            boxShadow: '0 4px 20px rgba(0,0,0,.3)',
          }}>
            <div style={{ fontSize:44, flexShrink:0, animation:`bob ${2+i*.3}s ease-in-out infinite`,
              animationDelay:`${i*.4}s` }}>{item.emoji}</div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:"'Fredoka One',cursive",
                fontSize:20, color:T.lime, marginBottom:2 }}>{item.title}</div>
              <div style={{ color:'rgba(232,255,245,.6)', fontSize:13, fontWeight:600 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <TapBtn onClick={onNext} color={T.teal}>I'm ready! 🌿</TapBtn>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCREEN 3 — First quest
══════════════════════════════════════════════ */
function ScreenQuest({ courses, onBegin }) {
  const firstCourse = courses.find(c => !c.isLocked);
  const firstSession = firstCourse?.sessions?.[0];

  if (!firstCourse) return (
    <div style={{ textAlign:'center', padding:'0 24px' }}>
      <div style={{ fontSize:64 }}>🚧</div>
      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:T.white, margin:'16px 0 8px' }}>
        No quests yet!
      </div>
      <div style={{ color:'rgba(232,255,245,.5)', marginBottom:32, fontSize:14 }}>
        The admin is preparing your first adventure — check back soon!
      </div>
      <TapBtn onClick={() => onBegin(null)} color={T.lime} dark>Go to Dashboard</TapBtn>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      textAlign:'center', padding:'0 20px', gap:0 }}>

      <div style={{ fontSize:22, color:`rgba(232,255,245,.55)`, fontWeight:700,
        marginBottom:10, fontFamily:"'Fredoka One',cursive" }}>
        Your first quest awaits!
      </div>

      {/* Course card */}
      <div style={{
        background: `linear-gradient(160deg,${firstCourse.color || T.teal}22,rgba(13,59,34,.9))`,
        border: `3px solid ${firstCourse.color || T.teal}`,
        borderRadius: 28, padding:'32px 28px',
        width:'100%', maxWidth:340, marginBottom:32,
        boxShadow: `0 10px 0 ${firstCourse.color || T.teal}44, 0 20px 40px rgba(0,0,0,.4)`,
        animation: 'pop .5s ease both',
      }}>
        <div style={{ fontSize:72, marginBottom:12, animation:'bob 2s ease-in-out infinite' }}>
          {firstCourse.emoji || '🌿'}
        </div>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:26,
          color:T.white, marginBottom:6 }}>{firstCourse.title}</div>
        {firstCourse.description && (
          <div style={{ color:'rgba(232,255,245,.55)', fontSize:13,
            fontWeight:600, marginBottom:12 }}>{firstCourse.description}</div>
        )}
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          {firstSession && (
            <span style={{ background:`${T.lime}22`, border:`1.5px solid ${T.lime}44`,
              borderRadius:50, padding:'3px 12px', color:T.lime,
              fontSize:12, fontWeight:700 }}>
              +{firstSession.xpReward} XP to start
            </span>
          )}
          <span style={{ background:`rgba(0,200,160,.15)`, border:`1.5px solid ${T.teal}44`,
            borderRadius:50, padding:'3px 12px', color:T.teal,
            fontSize:12, fontWeight:700 }}>
            {firstCourse.sessions?.length || '?'} sessions
          </span>
        </div>
      </div>

      <TapBtn onClick={() => onBegin(firstSession?.id)} color={T.lime} dark>
        Begin Quest! 🌿
      </TapBtn>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN ONBOARDING FLOW
══════════════════════════════════════════════ */
const TOTAL_STEPS = 3;

export default function OnboardingFlow({ user, courses, onDone }) {
  const [step,    setStep]    = useState(0);
  const [leaving, setLeaving] = useState(false); // triggers exit animation

  function advance() {
    setLeaving(true);
    setTimeout(() => {
      setStep(s => s + 1);
      setLeaving(false);
    }, 280);
  }

  function begin(sessionId) {
    // Mark onboarded so we never show this again
    localStorage.setItem('codequest_onboarded', '1');
    onDone(sessionId);
  }

  const screens = [
    <ScreenWelcome   name={user?.displayName || user?.username} onNext={advance} />,
    <ScreenAdventure onNext={advance} />,
    <ScreenQuest     courses={courses} onBegin={begin} />,
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes rise-in { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 50% 30%, #0D3B22 0%, #062213 60%, ${T.deep} 100%)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Quicksand',sans-serif",
        overflow: 'hidden', position: 'relative',
      }}>

        {/* Fireflies */}
        {[
          { left:'8%',  top:'12%', delay:'0s'   },
          { left:'88%', top:'18%', delay:'.6s'  },
          { left:'15%', top:'68%', delay:'1.1s' },
          { left:'82%', top:'72%', delay:'.3s'  },
          { left:'50%', top:'8%',  delay:'.9s'  },
          { left:'35%', top:'85%', delay:'1.5s' },
          { left:'70%', top:'55%', delay:'.5s'  },
        ].map((f,i) => (
          <Firefly key={i} style={{ left:f.left, top:f.top,
            animation:`shimmer ${1.4+i*.3}s ease-in-out infinite`,
            animationDelay: f.delay }} />
        ))}

        {/* Jungle silhouette leaves at bottom */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 8px', pointerEvents:'none', zIndex:0 }}>
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿'].map((e,i)=>(
            <span key={i} style={{ fontSize:22+((i*7)%14), opacity:.3,
              animation:`sway ${3+i*.35}s ease-in-out infinite`,
              animationDelay:`${i*.22}s` }}>{e}</span>
          ))}
        </div>

        {/* Step content */}
        <div style={{
          position: 'relative', zIndex:2,
          width: '100%', maxWidth: 480,
          padding: '0 0 24px',
          animation: leaving ? 'none' : 'rise-in .32s ease both',
          opacity: leaving ? 0 : 1,
          transform: leaving ? 'translateY(-20px)' : 'none',
          transition: leaving ? 'opacity .28s, transform .28s' : 'none',
        }}>
          {screens[step]}
          <Dots total={TOTAL_STEPS} current={step} />
        </div>
      </div>
    </>
  );
}
