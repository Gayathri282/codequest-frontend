// frontend/src/pages/DashboardPage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../context/AuthContext';
import { useCourseContext } from '../context/CourseContext';
import LoadingScreen   from '../components/shared/LoadingScreen';

const T = {
  deep:'#041A0E', dark:'#062213', mid:'#0D3B22',
  lime:'#7ED957', teal:'#00C8A0', cyan:'#00C8E8',
  orange:'#FF6B35', gold:'#FFD700', white:'#E8FFF5',
};

export default function DashboardPage() {
  const { user, logout }     = useAuth();
  const { courses, loading } = useCourseContext();
  const nav                  = useNavigate();

  if (loading) return <LoadingScreen />;

  function handlePlay() {
    nav('/courses');
  }

  return (
    <>
      <style>{`
        @keyframes bob     { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-18px)} }
        @keyframes sway    { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        @keyframes pulse   { 0%,100%{transform:scale(1);box-shadow:0 10px 0 #C04A1A,0 0 0 0 ${T.orange}88} 50%{transform:scale(1.04);box-shadow:0 10px 0 #C04A1A,0 0 0 22px ${T.orange}00} }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes rain    { 0%{transform:translateY(-100vh)} 100%{transform:translateY(110vh)} }
        @keyframes glow    { 0%,100%{opacity:.6} 50%{opacity:1} }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 50% 20%, #0D3B22 0%, #062213 55%, #041A0E 100%)`,
        fontFamily: "'Quicksand',sans-serif",
        overflow: 'hidden', position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Rain drops */}
        {[...Array(14)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${(i * 7.3) % 100}%`, top: '-10%',
            width: 2, height: `${40 + (i * 13) % 50}px`,
            background: `linear-gradient(180deg,transparent,${T.teal}55)`,
            borderRadius: 2,
            animation: `rain ${2.2 + (i * 0.4) % 2}s linear infinite`,
            animationDelay: `${(i * 0.35) % 2.5}s`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Fireflies */}
        {[
          { left:'6%',  top:'15%', d:'0s',   c:T.lime   },
          { left:'90%', top:'12%', d:'.7s',  c:T.teal   },
          { left:'12%', top:'70%', d:'1.2s', c:T.orange },
          { left:'85%', top:'75%', d:'.4s',  c:T.lime   },
          { left:'50%', top:'6%',  d:'1s',   c:T.teal   },
          { left:'30%', top:'88%', d:'1.6s', c:T.orange },
          { left:'72%', top:'52%', d:'.5s',  c:T.lime   },
        ].map((f, i) => (
          <div key={i} style={{
            position: 'absolute', left: f.left, top: f.top,
            width: 7, height: 7, borderRadius: '50%',
            background: f.c, boxShadow: `0 0 14px ${f.c}`,
            animation: `shimmer ${1.4 + i * 0.3}s ease-in-out infinite`,
            animationDelay: f.d, pointerEvents: 'none',
          }} />
        ))}

        {/* Top bar — minimal */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px',
          position: 'relative', zIndex: 10,
          background: 'rgba(4,26,14,.7)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:22, animation:'sway 3s ease-in-out infinite', display:'inline-block' }}>🐸</span>
            <span style={{ fontFamily:"'Fredoka One',cursive", color:T.lime, fontSize:20, letterSpacing:.5 }}>
              CodeQuest
            </span>
          </div>
          <button onClick={() => { logout(); nav('/'); }} style={{
            background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.2)',
            borderRadius:12, padding:'6px 14px', cursor:'pointer',
            fontFamily:"'Fredoka One',cursive", color:'rgba(232,255,245,.5)', fontSize:12,
          }}>Exit</button>
        </div>

        {/* Center content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px 80px', position: 'relative', zIndex: 2,
          gap: 0,
        }}>

          {/* Avatar */}
          <div style={{
            fontSize: 130, lineHeight: 1,
            animation: 'bob 2.2s ease-in-out infinite',
            filter: `drop-shadow(0 0 50px ${T.lime}99)`,
            marginBottom: 32, userSelect: 'none',
          }}>
            {user?.avatarEmoji || '🐸'}
          </div>

          {/* PLAY button */}
          <button
            onClick={handlePlay}
            style={{
              fontFamily: "'Fredoka One',cursive",
              fontSize: 42, color: '#fff',
              background: `linear-gradient(180deg,${T.orange},#E8501A)`,
              border: `4px solid ${T.orange}`, borderRadius: 32, padding: '24px 100px',
              cursor: 'pointer',
              boxShadow: `0 12px 0 #C04A1A, 0 24px 70px ${T.orange}55`,
              animation: 'pulse 2s ease-in-out infinite',
              letterSpacing: 3,
            }}
            onMouseDown={e => { e.currentTarget.style.transform='translateY(8px)'; e.currentTarget.style.boxShadow=`0 4px 0 #C04A1A`; }}
            onMouseUp={e   => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`0 12px 0 #C04A1A, 0 24px 70px ${T.orange}55`; }}
            onTouchStart={e => { e.currentTarget.style.transform='translateY(8px)'; }}
            onTouchEnd={e   => { e.currentTarget.style.transform=''; }}
          >
            ▶ PLAY
          </button>

        </div>

        {/* Bottom leaves */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:70,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 8px', pointerEvents:'none', zIndex:1 }}>
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱'].map((e,i) => (
            <span key={i} style={{ fontSize:20+(i*5)%16, opacity:.4,
              animation:`sway ${3+i*.3}s ease-in-out infinite`,
              animationDelay:`${i*.2}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </>
  );
}
