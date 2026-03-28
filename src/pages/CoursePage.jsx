// frontend/src/pages/CoursePage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth }          from '../context/AuthContext';
import { useCourseContext } from '../context/CourseContext';
import LoadingScreen        from '../components/shared/LoadingScreen';

const T = {
  deep:'#041A0E', dark:'#062213', mid:'#0D3B22',
  lime:'#7ED957', teal:'#00C8A0', cyan:'#00C8E8',
  orange:'#FF6B35', gold:'#FFD700', white:'#E8FFF5',
};

const TYPE_ICON = { VIDEO:'🎬', DOCUMENT:'📄', QUIZ:'🎯', CODE:'💻', BOSS:'👑' };

export default function CoursePage() {
  const { id }               = useParams();
  const nav                  = useNavigate();
  const { user }             = useAuth();
  const { courses, loading } = useCourseContext();

  if (loading) return <LoadingScreen />;

  const course = courses.find(c => c.id === id);
  if (!course) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16,
      background:`radial-gradient(ellipse at 50% 20%,#0D3B22,#041A0E)` }}>
      <div style={{ fontSize:72 }}>😕</div>
      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:T.white }}>Course not found</div>
      <button onClick={() => nav('/dashboard')} style={backBtnStyle}>← Back</button>
    </div>
  );

  const color    = course.color || T.teal;
  const sessions = [...(course.sessions || [])].sort((a, b) => a.order - b.order);
  const nextIdx  = sessions.findIndex(s => !s.completed);
  const completed = sessions.filter(s => s.completed).length;
  const total     = sessions.length || 1;
  const pct       = Math.round((completed / total) * 100);

  const isPremium = user?.plan === 'PREMIUM' || user?.plan === 'BASIC' || user?.role === 'ADMIN';

  const freeLimit = course.freeSessionCount ?? 4;

  function goSession(session) {
    if (!isPremium && session.order > freeLimit) { nav('/pricing'); return; }
    if (session.type === 'QUIZ') nav(`/quiz/${session.id}`);
    else nav(`/lesson/${session.id}`);
  }

  return (
    <>
      <style>{`
        @keyframes bob     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes sway    { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        @keyframes pulse   { 0%,100%{box-shadow:0 6px 0 ${T.orange}88,0 0 0 0 ${T.orange}66} 50%{box-shadow:0 6px 0 ${T.orange}88,0 0 0 14px ${T.orange}00} }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes pop     { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 50% 15%, #0D3B22 0%, #062213 55%, #041A0E 100%)`,
        fontFamily: "'Quicksand',sans-serif",
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Fireflies */}
        {[
          {left:'5%',top:'10%',d:'0s',c:T.lime},{left:'92%',top:'14%',d:'.6s',c:T.orange},
          {left:'10%',top:'65%',d:'1.1s',c:T.teal},{left:'87%',top:'70%',d:'.3s',c:T.lime},
          {left:'48%',top:'5%',d:'.9s',c:T.orange},
        ].map((f,i) => (
          <div key={i} style={{
            position:'absolute', left:f.left, top:f.top,
            width:6, height:6, borderRadius:'50%',
            background:f.c, boxShadow:`0 0 10px ${f.c}`,
            animation:`shimmer ${1.5+i*.35}s ease-in-out infinite`,
            animationDelay:f.d, pointerEvents:'none',
          }} />
        ))}

        {/* ── Header ── */}
        <div style={{
          display:'flex', alignItems:'center', gap:14,
          padding:'14px 20px', flexWrap:'wrap',
          borderBottom:`2px solid rgba(255,107,53,.3)`,
          position:'sticky', top:0, zIndex:20,
          background:'rgba(4,26,14,.92)', backdropFilter:'blur(10px)',
        }}>
          <button onClick={() => nav('/dashboard')} style={backBtnStyle}>← Map</button>

          <div style={{ fontSize:38, animation:'bob 2s ease-in-out infinite' }}>
            {course.emoji || '🌿'}
          </div>

          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", color:T.white, fontSize:20, lineHeight:1.1 }}>
              {course.title}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
              <div style={{ flex:1, height:8, background:'rgba(255,255,255,.2)',
                borderRadius:8, overflow:'hidden', maxWidth:200 }}>
                <div style={{ width:`${pct}%`, height:'100%',
                  background:`linear-gradient(90deg,${T.orange},${T.lime})`,
                  borderRadius:8, transition:'width .6s' }} />
              </div>
              <span style={{ fontFamily:"'Fredoka One',cursive", color:T.orange, fontSize:13 }}>
                {completed}/{total}
              </span>
            </div>
          </div>

          <div style={{
            background:'rgba(255,215,0,.15)', border:`1.5px solid rgba(255,215,0,.5)`,
            borderRadius:12, padding:'5px 12px',
            fontFamily:"'Fredoka One',cursive", color:T.gold, fontSize:14,
          }}>
            🪙 {user?.coins ?? 0}
          </div>
        </div>

        {/* ── Free plan banner ── */}
        {!isPremium && (
          <div onClick={() => nav('/pricing')} style={{
            cursor:'pointer',
            margin:'12px 16px 0',
            background:'linear-gradient(90deg,rgba(255,215,0,.15),rgba(255,107,53,.15))',
            border:`2px solid ${T.gold}88`,
            borderRadius:16, padding:'10px 18px',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
            flexWrap:'wrap',
          }}>
            <div>
              <div style={{ fontFamily:"'Fredoka One',cursive", color:T.gold, fontSize:15 }}>
                👑 Sessions 5+ require Premium
              </div>
              <div style={{ color:'rgba(232,255,245,.65)', fontSize:12, marginTop:2 }}>
                Unlock all sessions, IDE & quizzes for ₹1,499 / month
              </div>
            </div>
            <div style={{
              background:`linear-gradient(135deg,${T.gold},#E8A800)`,
              color:'#1A0E00', borderRadius:12, padding:'7px 18px',
              fontFamily:"'Fredoka One',cursive", fontSize:14, flexShrink:0,
            }}>
              Upgrade Now →
            </div>
          </div>
        )}

        {/* ── Roadmap ── */}
        <div style={{ maxWidth:480, margin:'0 auto', padding:'32px 24px 100px', position:'relative' }}>

          {sessions.length === 0 && (
            <div style={{ textAlign:'center', padding:60,
              color:'rgba(232,255,245,.7)',
              fontFamily:"'Fredoka One',cursive", fontSize:18 }}>
              No sessions yet — check back soon! 🚧
            </div>
          )}

          {sessions.map((session, idx) => {
            const isDone         = !!session.completed;
            const isFreeSession  = session.order <= freeLimit;
            const isPremiumGated = !isPremium && !isFreeSession;
            // Free sessions (1–4) are always accessible — no sequential lock
            const isCurrent      = !isDone && !isPremiumGated && idx === nextIdx;
            const isLocked       = !isDone && !isCurrent && !isFreeSession && !isPremiumGated;
            const onRight        = idx % 2 === 1;

            const nodeColor = isDone ? T.lime : isPremiumGated ? T.gold : isCurrent ? T.orange : 'rgba(255,255,255,.25)';
            const icon      = TYPE_ICON[session.type] || '📘';

            return (
              <div key={session.id} style={{ position:'relative', marginBottom:0 }}>

                {idx < sessions.length - 1 && (
                  <div style={{
                    position:'absolute', left: onRight ? '30%' : '70%', top:'100%',
                    width:3, height:48,
                    background: isDone
                      ? `linear-gradient(180deg,${T.lime},${T.lime}55)`
                      : 'rgba(255,255,255,.15)',
                    borderRadius:2, zIndex:0, transform:'translateX(-50%)',
                  }} />
                )}

                <div style={{
                  display:'flex',
                  justifyContent: onRight ? 'flex-end' : 'flex-start',
                  paddingBottom:48,
                  paddingLeft: onRight ? 0 : 12,
                  paddingRight: onRight ? 12 : 0,
                }}>
                  <div onClick={() => !isLocked && goSession(session)} style={{
                    display:'flex',
                    flexDirection: onRight ? 'row-reverse' : 'row',
                    alignItems:'center', gap:12,
                    cursor: isLocked ? 'default' : 'pointer',
                    animation:`pop .35s ${idx * 0.06}s ease both`,
                  }}>
                    {/* Circle node */}
                    <div style={{
                      width: isCurrent ? 76 : 64, height: isCurrent ? 76 : 64,
                      borderRadius:'50%',
                      background: isDone
                        ? `linear-gradient(135deg,${T.lime},#5BB832)`
                        : isPremiumGated
                          ? `linear-gradient(135deg,#7B5800,#4A3300)`
                          : isCurrent
                            ? `linear-gradient(135deg,${T.orange},#E8501A)`
                            : 'rgba(255,255,255,.1)',
                      border:`3px solid ${nodeColor}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0,
                      fontSize: isDone ? 28 : 22,
                      boxShadow: isDone
                        ? `0 6px 0 #3A8A1A, 0 0 20px ${T.lime}55`
                        : isPremiumGated
                          ? `0 6px 0 #3A2800, 0 0 18px ${T.gold}44`
                          : isCurrent
                            ? `0 6px 0 #C04A1A, 0 0 28px ${T.orange}66`
                            : '0 4px 0 rgba(0,0,0,.4)',
                      animation: isCurrent ? 'pulse 1.8s ease-in-out infinite' : 'none',
                      transition:'transform .15s',
                      opacity: isLocked ? 0.55 : 1,
                      position:'relative',
                    }}
                      onMouseEnter={e => { if (!isLocked) e.currentTarget.style.transform='scale(1.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform=''; }}
                    >
                      {isCurrent && (
                        <div style={{
                          position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)',
                          fontSize:22, animation:'bob 1.4s ease-in-out infinite',
                        }}>🐸</div>
                      )}
                      {isDone ? '⭐' : isPremiumGated ? '👑' : isLocked ? '🔒' : icon}
                    </div>

                    {/* Label card */}
                    <div style={{
                      background: isDone
                        ? 'rgba(126,217,87,.2)'
                        : isPremiumGated
                          ? 'rgba(255,215,0,.1)'
                          : isCurrent
                            ? 'rgba(255,107,53,.18)'
                            : 'rgba(255,255,255,.08)',
                      border:`1.5px solid ${isDone ? T.lime+'66' : isPremiumGated ? T.gold+'88' : isCurrent ? T.orange+'66' : 'rgba(255,255,255,.2)'}`,
                      borderRadius:16, padding:'10px 14px', maxWidth:180,
                      textAlign: onRight ? 'right' : 'left',
                      opacity: isLocked ? 0.6 : 1,
                    }}>
                      <div style={{
                        fontFamily:"'Fredoka One',cursive",
                        color: isDone ? T.lime : isPremiumGated ? T.gold : isCurrent ? T.white : 'rgba(232,255,245,.65)',
                        fontSize:14, lineHeight:1.2, marginBottom:4,
                      }}>
                        {session.title}
                      </div>
                      {isPremiumGated ? (
                        <div style={{ background:`${T.gold}22`, border:`1px solid ${T.gold}66`,
                          borderRadius:8, padding:'2px 8px', fontSize:10, fontWeight:800,
                          color:T.gold, display:'inline-block' }}>
                          👑 PREMIUM
                        </div>
                      ) : (
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap',
                          justifyContent: onRight ? 'flex-end' : 'flex-start' }}>
                          {isFreeSession && (
                            <span style={{ background:'rgba(0,200,168,.2)', color:T.teal,
                              borderRadius:6, padding:'1px 7px', fontSize:10, fontWeight:800 }}>
                              FREE
                            </span>
                          )}
                          <span style={{ background:`${T.orange}22`, color:T.orange,
                            borderRadius:6, padding:'1px 7px', fontSize:10, fontWeight:700 }}>
                            +{session.xpReward} XP
                          </span>
                          <span style={{ background:'rgba(255,215,0,.15)', color:T.gold,
                            borderRadius:6, padding:'1px 7px', fontSize:10, fontWeight:700 }}>
                            🪙{session.coinsReward}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Badges */}
          {(() => {
            const courseBadges = (user?.earnedBadges || []).map(ub => ub.badge || ub).filter(b => b?.emoji);
            if (!courseBadges.length) return null;
            return (
              <div style={{
                marginTop:8, marginBottom:16,
                background:'rgba(255,215,0,.12)', border:`2px solid ${T.gold}55`,
                borderRadius:20, padding:'16px 20px', textAlign:'center',
                animation:'pop .5s ease both',
              }}>
                <div style={{ fontFamily:"'Fredoka One',cursive", color:T.gold, fontSize:14, marginBottom:12 }}>
                  🏅 Your Badges
                </div>
                <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
                  {courseBadges.map((b, i) => (
                    <div key={i} title={b.name} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:38, filter:`drop-shadow(0 0 10px ${T.gold}AA)`,
                        animation:`bob ${2+i*.25}s ease-in-out infinite`, animationDelay:`${i*.3}s` }}>
                        {b.emoji}
                      </div>
                      <div style={{ color:'rgba(255,215,0,.8)', fontSize:10, fontWeight:800, marginTop:4,
                        maxWidth:60, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {b.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* All done trophy */}
          {completed === total && total > 0 && (
            <div style={{
              textAlign:'center', marginTop:8,
              background:'rgba(255,215,0,.12)', border:`3px solid ${T.gold}`,
              borderRadius:24, padding:28, boxShadow:`0 8px 0 ${T.gold}44`,
              animation:'pop .5s ease both',
            }}>
              <div style={{ fontSize:64, animation:'bob 2s ease-in-out infinite' }}>🏆</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:T.gold, marginTop:8 }}>
                Course Complete!
              </div>
              <div style={{ color:'rgba(232,255,245,.75)', marginTop:4, fontSize:14 }}>
                You've finished every session. Amazing work!
              </div>
            </div>
          )}
        </div>

        {/* Bottom leaves */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 8px', pointerEvents:'none', zIndex:0 }}>
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿'].map((e,i)=>(
            <span key={i} style={{ fontSize:20+((i*6)%14), opacity:.35,
              animation:`sway ${3+i*.3}s ease-in-out infinite`, animationDelay:`${i*.22}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

const backBtnStyle = {
  background:'rgba(255,107,53,.18)', border:'1.5px solid rgba(255,107,53,.5)',
  borderRadius:12, padding:'6px 14px', cursor:'pointer',
  fontFamily:"'Fredoka One',cursive", color:'#FF8C60', fontSize:13, flexShrink:0,
};
