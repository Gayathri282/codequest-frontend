// frontend/src/pages/DashboardPage.jsx
import { useNavigate }      from 'react-router-dom';
import { useAuth }          from '../context/AuthContext';
import { useCourseContext } from '../context/CourseContext';
import { formatXpProgress } from '../utils/formatters';
import LoadingScreen        from '../components/shared/LoadingScreen';
import OnboardingFlow       from '../components/student/OnboardingFlow';

const T = {
  deep:   '#041A0E', dark:  '#062213', mid:  '#0D3B22',
  lime:   '#7ED957', teal:  '#00C8A0', cyan: '#00C8E8',
  orange: '#FF6B35', gold:  '#FFD700', white:'#E8FFF5',
};

export default function DashboardPage() {
  const { user, logout }     = useAuth();
  const { courses, loading } = useCourseContext();
  const nav                  = useNavigate();
  const { level, xpInLevel, xpNeeded, pct } = formatXpProgress(user?.xp || 0);

  if (loading) return <LoadingScreen />;

  const isNew = (user?.xp === 0) && !localStorage.getItem('codequest_onboarded');
  if (isNew) {
    return (
      <OnboardingFlow user={user} courses={courses}
        onDone={sessionId => {
          localStorage.setItem('codequest_onboarded', '1');
          if (sessionId) nav(`/lesson/${sessionId}`);
        }}
      />
    );
  }

  const nextSession = courses
    .filter(c => !c.isLocked)
    .flatMap(c => (c.sessions || []).map(s => ({ ...s, courseId: c.id })))
    .find(s => !s.completed);
  const firstCourse = courses.find(c => !c.isLocked);

  const isPremium = user?.plan === 'PREMIUM' || user?.plan === 'BASIC' || user?.role === 'ADMIN';

  function handlePlay() {
    if (nextSession) {
      if (!isPremium && nextSession.order > 4) { nav('/pricing'); return; }
      nav(nextSession.type === 'QUIZ' ? `/quiz/${nextSession.id}` : `/lesson/${nextSession.id}`);
    } else if (firstCourse) {
      nav(`/course/${firstCourse.id}`);
    }
  }

  const totalSessions = courses.flatMap(c => c.sessions || []).length;
  const doneSessions  = courses.flatMap(c => c.sessions || []).filter(s => s.completed).length;
  const overallPct    = totalSessions ? Math.round((doneSessions / totalSessions) * 100) : 0;

  return (
    <>
      <style>{`
        @keyframes bob     { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-14px)} }
        @keyframes sway    { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        @keyframes pulse   { 0%,100%{transform:scale(1);box-shadow:0 10px 0 #C04A1A,0 0 0 0 ${T.orange}88} 50%{transform:scale(1.04);box-shadow:0 10px 0 #C04A1A,0 0 0 18px ${T.orange}00} }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes fall    { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:none} }
        @keyframes rain    { 0%{transform:translateY(-100vh)} 100%{transform:translateY(110vh)} }
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
            width: 6, height: 6, borderRadius: '50%',
            background: f.c, boxShadow: `0 0 10px ${f.c}`,
            animation: `shimmer ${1.4 + i * 0.3}s ease-in-out infinite`,
            animationDelay: f.d, pointerEvents: 'none',
          }} />
        ))}

        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', flexWrap: 'wrap', gap: 10,
          position: 'relative', zIndex: 10,
          background: 'rgba(4,26,14,.9)', borderBottom: `2px solid rgba(126,217,87,.25)`,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:22, animation:'sway 3s ease-in-out infinite' }}>🐸</span>
            <span style={{ fontFamily:"'Fredoka One',cursive", color:T.lime, fontSize:20, letterSpacing:.5 }}>
              CodeQuest
            </span>
          </div>

          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            {[
              { icon:'⚡', val:`Lv ${level}`,              color:T.lime,   bg:'rgba(126,217,87,.15)',  border:'rgba(126,217,87,.4)'  },
              { icon:'🪙', val:user?.coins ?? 0,            color:T.gold,   bg:'rgba(255,215,0,.1)',    border:'rgba(255,215,0,.4)'   },
              { icon:'🔥', val:`${user?.streakDays ?? 0}d`, color:'#FF8C42',bg:'rgba(255,140,66,.12)',  border:'rgba(255,140,66,.4)'  },
            ].map(s => (
              <div key={s.icon} style={{
                background: s.bg, border: `1.5px solid ${s.border}`,
                borderRadius: 12, padding: '5px 12px',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ fontSize:14 }}>{s.icon}</span>
                <span style={{ fontFamily:"'Fredoka One',cursive", color:s.color, fontSize:14 }}>{s.val}</span>
              </div>
            ))}
            <button onClick={() => nav('/progress')} style={navBtn(T.teal)}>📊 Progress</button>
            <button onClick={() => nav('/settings')} style={navBtn(T.white)}>⚙️ Settings</button>
            <button onClick={() => { logout(); nav('/'); }} style={navBtn('#FF8888')}>Exit</button>
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px 80px', position: 'relative', zIndex: 2,
        }}>

          {/* Player card */}
          <div style={{
            background:'rgba(13,59,34,.9)', border:`2px solid rgba(126,217,87,.35)`,
            borderRadius:20, padding:'12px 32px', textAlign:'center',
            marginBottom:20, boxShadow:`0 4px 0 rgba(0,0,0,.4), inset 0 1px 0 rgba(126,217,87,.1)`,
            animation:'fall .4s ease both',
          }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", color:T.white, fontSize:18, marginBottom:6 }}>
              {user?.displayName || user?.username}
            </div>
            <div style={{ width:220, height:10, background:'rgba(255,255,255,.15)',
              borderRadius:10, overflow:'hidden', marginBottom:4 }}>
              <div style={{ width:`${pct}%`, height:'100%',
                background:`linear-gradient(90deg,${T.lime},${T.teal})`,
                borderRadius:10, transition:'width .6s' }} />
            </div>
            <div style={{ color:'rgba(232,255,245,.7)', fontSize:11, fontWeight:700 }}>
              {xpInLevel} / {xpNeeded} XP → Level {level + 1}
            </div>
          </div>

          {/* Character */}
          <div style={{
            fontSize:120, lineHeight:1,
            animation:'bob 2s ease-in-out infinite',
            filter:`drop-shadow(0 0 40px ${T.lime}88)`,
            marginBottom:12, userSelect:'none',
          }}>
            {user?.avatarEmoji || '🐸'}
          </div>

          {/* PLAY */}
          <button onClick={handlePlay} style={{
            fontFamily:"'Fredoka One',cursive",
            fontSize:36, color:'#fff',
            background:`linear-gradient(180deg,${T.orange},#E8501A)`,
            border:`4px solid ${T.orange}`, borderRadius:28, padding:'22px 80px',
            cursor:'pointer',
            boxShadow:`0 10px 0 #C04A1A, 0 20px 60px ${T.orange}55`,
            animation:'pulse 2s ease-in-out infinite',
            letterSpacing:2, marginBottom:24,
          }}
            onMouseDown={e => e.currentTarget.style.transform='translateY(6px)'}
            onMouseUp  ={e => e.currentTarget.style.transform=''}
            onTouchStart={e => e.currentTarget.style.transform='translateY(6px)'}
            onTouchEnd  ={e => e.currentTarget.style.transform=''}
          >
            ▶ PLAY
          </button>

          {/* Overall progress */}
          {totalSessions > 0 && (
            <div style={{
              display:'flex', alignItems:'center', gap:12,
              background:'rgba(13,59,34,.9)', border:`1.5px solid rgba(0,200,160,.35)`,
              borderRadius:16, padding:'10px 22px', marginBottom:22,
              animation:'fall .5s .1s ease both', opacity:0, animationFillMode:'forwards',
            }}>
              <span style={{ color:T.lime, fontSize:14, fontWeight:800 }}>{doneSessions}/{totalSessions}</span>
              <div style={{ width:120, height:8, background:'rgba(255,255,255,.15)',
                borderRadius:8, overflow:'hidden' }}>
                <div style={{ width:`${overallPct}%`, height:'100%',
                  background:`linear-gradient(90deg,${T.teal},${T.cyan})`, borderRadius:8 }} />
              </div>
              <span style={{ color:T.teal, fontSize:13, fontWeight:800 }}>{overallPct}%</span>
            </div>
          )}

          {/* Course world mini-cards */}
          <div style={{
            display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center',
            maxWidth:600, animation:'fall .5s .15s ease both', opacity:0, animationFillMode:'forwards',
          }}>
            {courses.map((course, i) => {
              const done = (course.sessions||[]).filter(s=>s.completed).length;
              const tot  = (course.sessions||[]).length || 1;
              const p    = Math.round((done/tot)*100);
              return (
                <div key={course.id} onClick={() => !course.isLocked && nav(`/course/${course.id}`)}
                  style={{
                    background: course.isLocked
                      ? 'rgba(13,59,34,.6)'
                      : `linear-gradient(160deg,${course.color||T.teal}33,rgba(13,59,34,.92))`,
                    border:`2px solid ${course.isLocked ? 'rgba(255,255,255,.15)' : (course.color||T.teal)+'88'}`,
                    borderRadius:18, padding:'14px 18px',
                    cursor: course.isLocked ? 'default' : 'pointer',
                    textAlign:'center', minWidth:110,
                    opacity: course.isLocked ? 0.55 : 1,
                    transition:'transform .15s', position:'relative',
                  }}
                  onMouseEnter={e => { if (!course.isLocked) e.currentTarget.style.transform='translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; }}
                >
                  {course.isLocked && (
                    <div style={{ position:'absolute', top:8, right:10, fontSize:14, opacity:.8 }}>🔒</div>
                  )}
                  <div style={{ fontSize:40, marginBottom:4,
                    animation:`bob ${2+i*.2}s ease-in-out infinite`,
                    animationDelay:`${i*.3}s` }}>
                    {course.emoji || '🌿'}
                  </div>
                  <div style={{ fontFamily:"'Fredoka One',cursive", color:T.white,
                    fontSize:13, marginBottom:6, lineHeight:1.2 }}>
                    {course.title}
                  </div>
                  <div style={{ width:'100%', height:5, background:'rgba(255,255,255,.15)',
                    borderRadius:5, overflow:'hidden' }}>
                    <div style={{ width:`${p}%`, height:'100%',
                      background:course.color||T.teal, borderRadius:5 }} />
                  </div>
                  <div style={{ color:'rgba(232,255,245,.65)', fontSize:10, marginTop:3, fontWeight:700 }}>
                    {done}/{tot}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom leaves */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:70,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 8px', pointerEvents:'none', zIndex:1 }}>
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱'].map((e,i) => (
            <span key={i} style={{ fontSize:20+(i*5)%16, opacity:.35,
              animation:`sway ${3+i*.3}s ease-in-out infinite`,
              animationDelay:`${i*.2}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </>
  );
}

function navBtn(color) {
  return {
    background:'rgba(255,255,255,.1)', border:`1.5px solid rgba(255,255,255,.25)`,
    borderRadius:12, padding:'6px 14px', cursor:'pointer',
    fontFamily:"'Fredoka One',cursive", color, fontSize:13,
  };
}
