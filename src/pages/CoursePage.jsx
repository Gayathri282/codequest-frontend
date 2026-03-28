// frontend/src/pages/CoursePage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect }    from 'react';
import { useAuth }          from '../context/AuthContext';
import { useCourseContext } from '../context/CourseContext';
import LoadingScreen        from '../components/shared/LoadingScreen';

const T = {
  deep:'#041A0E', dark:'#062213', mid:'#0D3B22',
  lime:'#7ED957', teal:'#00C8A0', cyan:'#00C8E8',
  orange:'#FF6B35', gold:'#FFD700', white:'#E8FFF5',
};
const TYPE_ICON = { VIDEO:'🎬', DOCUMENT:'📄', QUIZ:'🎯', CODE:'💻', BOSS:'👑' };

// ── Road geometry (must match the CSS flex layout below) ──────────────
const CW     = 432;        // content width (480 maxWidth − 48px padding)
const L_X    = 44;         // left node centre X
const R_X    = CW - 44;   // right node centre X  (= 388)
const SY     = 32;         // first node centre Y from top of SVG
const ROW_H  = 112;        // row height = 64px node + 48px gap

function nxy(i) {
  return { x: i % 2 === 1 ? R_X : L_X, y: SY + i * ROW_H };
}

function buildRoad(count, doneCount) {
  if (count < 2) return { done: '', todo: '' };
  let done = '', todo = '';
  for (let i = 0; i < count - 1; i++) {
    const a = nxy(i), b = nxy(i + 1);
    // S-curve: control pts hug each endpoint vertically
    const seg = `M${a.x} ${a.y} C${a.x} ${a.y + ROW_H * .5} ${b.x} ${b.y - ROW_H * .5} ${b.x} ${b.y}`;
    if (i < doneCount) done += seg + ' ';
    else               todo += seg + ' ';
  }
  return { done: done.trim(), todo: todo.trim() };
}

export default function CoursePage() {
  const { id }               = useParams();
  const nav                  = useNavigate();
  const { user }             = useAuth();
  const { courses, loading } = useCourseContext();

  // ── Derive before hooks (hooks must precede conditional returns) ──
  const course   = courses.find(c => c.id === id);
  const sessions = course
    ? [...(course.sessions || [])].sort((a, b) => a.order - b.order)
    : [];
  const nextIdx  = sessions.findIndex(s => !s.completed);
  const curIdx   = nextIdx < 0 ? Math.max(0, sessions.length - 1) : nextIdx;

  // ── Avatar jump state ──────────────────────────────────────────────
  const [avatarIdx,    setAvatarIdx]    = useState(-1);   // -1 = not yet placed
  const [avatarBounce, setAvatarBounce] = useState(false);

  useEffect(() => {
    if (sessions.length === 0) return;
    const key    = `cq_av_${id}`;
    const stored = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);

    if (stored !== null) {
      const from = parseInt(stored, 10);
      if (!isNaN(from) && from !== curIdx && from >= 0 && from < sessions.length) {
        // Snap avatar to old pos, then animate to new pos
        setAvatarIdx(from);
        setAvatarBounce(false);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          setAvatarIdx(curIdx);
          setAvatarBounce(true);
          setTimeout(() => setAvatarBounce(false), 950);
        }));
        return;
      }
    }
    setAvatarIdx(curIdx);
  }, [id, sessions.length]); // eslint-disable-line

  // ── Conditional returns (after all hooks) ─────────────────────────
  if (loading) return <LoadingScreen />;

  if (!course) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16,
      background:'radial-gradient(ellipse at 50% 20%,#0D3B22,#041A0E)' }}>
      <div style={{ fontSize:72 }}>😕</div>
      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color:T.white }}>Course not found</div>
      <button onClick={() => nav('/dashboard')} style={backBtnStyle}>← Back</button>
    </div>
  );

  const color      = course.color || T.teal;
  const completed  = sessions.filter(s => s.completed).length;
  const total      = sessions.length || 1;
  const pct        = Math.round((completed / total) * 100);
  const isPremium  = user?.plan === 'PREMIUM' || user?.plan === 'BASIC' || user?.role === 'ADMIN';
  const freeLimit  = course.freeSessionCount ?? 4;

  // SVG dimensions
  const svgH = SY * 2 + Math.max(0, sessions.length - 1) * ROW_H;
  const { done: donePath, todo: todoPath } = buildRoad(sessions.length, completed);

  // Avatar position in SVG coords
  const safeIdx  = Math.max(0, Math.min(avatarIdx < 0 ? curIdx : avatarIdx, sessions.length - 1));
  const avatarPt = nxy(safeIdx);
  const avatar   = user?.avatarEmoji || '🐸';

  function goSession(session) {
    if (!isPremium && session.order > freeLimit) { nav('/pricing'); return; }
    sessionStorage.setItem(`cq_av_${id}`, String(curIdx));
    if (session.type === 'QUIZ') nav(`/quiz/${session.id}`);
    else nav(`/lesson/${session.id}`);
  }

  return (
    <>
      <style>{`
        @keyframes cq-bob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes cq-sway  { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        @keyframes cq-pulse {
          0%,100%{box-shadow:0 6px 0 ${T.orange}88,0 0 0 0 ${T.orange}66}
          50%    {box-shadow:0 6px 0 ${T.orange}88,0 0 0 14px ${T.orange}00}
        }
        @keyframes cq-shimmer { 0%,100%{opacity:.45} 50%{opacity:1} }
        @keyframes cq-pop   { from{opacity:0;transform:scale(.65)} to{opacity:1;transform:scale(1)} }
        @keyframes cq-dash  { to { stroke-dashoffset:-20; } }
        @keyframes cq-hop {
          0%   { transform: translateY(0)    scale(1)    rotate(0deg);   }
          22%  { transform: translateY(-62px) scale(1.45) rotate(-22deg); }
          52%  { transform: translateY(-28px) scale(1.2)  rotate(12deg);  }
          78%  { transform: translateY(-9px)  scale(1.06) rotate(-5deg);  }
          100% { transform: translateY(0)    scale(1)    rotate(0deg);   }
        }
        .cq-node:hover:not([data-locked="true"]) { transform:scale(1.12) !important; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 50% 15%,#0D3B22 0%,#062213 55%,#041A0E 100%)`,
        fontFamily: "'Quicksand',sans-serif",
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Fireflies */}
        {[{l:'5%',t:'10%',d:'0s',c:T.lime},{l:'92%',t:'14%',d:'.6s',c:T.orange},
          {l:'10%',t:'65%',d:'1.1s',c:T.teal},{l:'87%',t:'70%',d:'.3s',c:T.lime},
          {l:'48%',t:'5%',d:'.9s',c:T.orange}].map((f,i) => (
          <div key={i} style={{
            position:'absolute', left:f.l, top:f.t, width:6, height:6, borderRadius:'50%',
            background:f.c, boxShadow:`0 0 10px ${f.c}`,
            animation:`cq-shimmer ${1.5+i*.35}s ease-in-out infinite`,
            animationDelay:f.d, pointerEvents:'none',
          }} />
        ))}

        {/* ── Header ── */}
        <div style={{
          display:'flex', alignItems:'center', gap:14, padding:'14px 20px', flexWrap:'wrap',
          borderBottom:`2px solid rgba(255,107,53,.3)`, position:'sticky', top:0, zIndex:20,
          background:'rgba(4,26,14,.92)', backdropFilter:'blur(10px)',
        }}>
          <button onClick={() => nav('/dashboard')} style={backBtnStyle}>← Map</button>
          <div style={{ fontSize:38, animation:'cq-bob 2s ease-in-out infinite' }}>{course.emoji||'🌿'}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", color:T.white, fontSize:20, lineHeight:1.1 }}>
              {course.title}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
              <div style={{ flex:1, height:8, background:'rgba(255,255,255,.2)', borderRadius:8, overflow:'hidden', maxWidth:200 }}>
                <div style={{ width:`${pct}%`, height:'100%',
                  background:`linear-gradient(90deg,${T.orange},${T.lime})`,
                  borderRadius:8, transition:'width .6s' }} />
              </div>
              <span style={{ fontFamily:"'Fredoka One',cursive", color:T.orange, fontSize:13 }}>{completed}/{total}</span>
            </div>
          </div>
          <div style={{ background:'rgba(255,215,0,.15)', border:`1.5px solid rgba(255,215,0,.5)`,
            borderRadius:12, padding:'5px 12px',
            fontFamily:"'Fredoka One',cursive", color:T.gold, fontSize:14 }}>
            🪙 {user?.coins ?? 0}
          </div>
        </div>

        {/* ── Free plan banner ── */}
        {!isPremium && (
          <div onClick={() => nav('/pricing')} style={{
            cursor:'pointer', margin:'12px 16px 0',
            background:'linear-gradient(90deg,rgba(255,215,0,.15),rgba(255,107,53,.15))',
            border:`2px solid ${T.gold}88`, borderRadius:16, padding:'10px 18px',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap',
          }}>
            <div>
              <div style={{ fontFamily:"'Fredoka One',cursive", color:T.gold, fontSize:15 }}>
                👑 Sessions {freeLimit+1}+ require Premium
              </div>
              <div style={{ color:'rgba(232,255,245,.65)', fontSize:12, marginTop:2 }}>
                Unlock all sessions, IDE & quizzes for ₹1,499/mo
              </div>
            </div>
            <div style={{ background:`linear-gradient(135deg,${T.gold},#E8A800)`,
              color:'#1A0E00', borderRadius:12, padding:'7px 18px',
              fontFamily:"'Fredoka One',cursive", fontSize:14, flexShrink:0 }}>
              Upgrade Now →
            </div>
          </div>
        )}

        {/* ── Roadmap ── */}
        <div style={{ maxWidth:480, margin:'0 auto', padding:'32px 16px 80px' }}>

          {sessions.length === 0 && (
            <div style={{ textAlign:'center', padding:60, color:'rgba(232,255,245,.7)',
              fontFamily:"'Fredoka One',cursive", fontSize:18 }}>
              No sessions yet — check back soon! 🚧
            </div>
          )}

          {sessions.length > 0 && (
            <>
              {/*
                ── Coordinate container ──
                SVG and node rows share the same origin (top-left = 0,0).
                Each node row is position:absolute with a FIXED height:64 so the
                label card can never push subsequent nodes out of position.
                svgH already accounts for SY padding top + bottom (SY*2).
              */}
              <div style={{
                position: 'relative',
                width: CW,
                margin: '0 auto',
                height: svgH + 80,   // 80px breathing room below last node
                overflow: 'visible',
              }}>

                {/* ── SVG road layer (origin matches coordinate container) ── */}
                <svg
                  style={{ position:'absolute', top:0, left:0, pointerEvents:'none', zIndex:1, overflow:'visible' }}
                  width={CW} height={svgH}
                  viewBox={`0 0 ${CW} ${svgH}`}
                >
                  {/* Small deco foliage at each curve midpoint */}
                  {sessions.slice(0,-1).map((_, i) => {
                    const a = nxy(i), b = nxy(i+1);
                    const mx = (a.x + b.x) / 2 + (i % 2 === 0 ? 28 : -28);
                    const my = (a.y + b.y) / 2;
                    return (
                      <text key={i} x={mx} y={my} fontSize="20" textAnchor="middle"
                        dominantBaseline="middle" style={{ userSelect:'none', opacity:.55 }}>
                        {['🌿','🍃','🌱','🌿','🍃'][i % 5]}
                      </text>
                    );
                  })}

                  {/* Todo — marching dashes */}
                  {todoPath && (
                    <path d={todoPath} fill="none"
                      stroke="rgba(255,255,255,.2)" strokeWidth="9"
                      strokeDasharray="12 8" strokeLinecap="round"
                      style={{ animation:'cq-dash .55s linear infinite' }}
                    />
                  )}

                  {/* Done — glowing lime trail */}
                  {donePath && (
                    <>
                      <path d={donePath} fill="none" stroke={T.lime} strokeWidth="14"
                        strokeLinecap="round" style={{ filter:'blur(7px)', opacity:.35 }} />
                      <path d={donePath} fill="none" stroke={T.lime} strokeWidth="7"
                        strokeLinecap="round" />
                      <path d={donePath} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2"
                        strokeLinecap="round" />
                    </>
                  )}

                  {/* Sparkles above completed nodes */}
                  {completed > 0 && sessions.slice(0, completed).map((_, i) => {
                    const p = nxy(i);
                    return (
                      <text key={`star-${i}`} x={p.x} y={p.y - 38} fontSize="13" textAnchor="middle"
                        style={{ animation:`cq-shimmer ${1.2+i*.2}s ease-in-out infinite`, animationDelay:`${i*.15}s`, userSelect:'none' }}>
                        ✨
                      </text>
                    );
                  })}
                </svg>

                {/* ── Floating avatar ── */}
                {avatarIdx >= 0 && (
                  <div style={{
                    position:   'absolute',
                    left:       avatarPt.x - 18,
                    top:        avatarPt.y - 50,
                    fontSize:   32,
                    zIndex:     15,
                    transition: avatarBounce
                      ? 'left .75s cubic-bezier(.34,1.56,.64,1), top .75s cubic-bezier(.34,1.56,.64,1)'
                      : 'none',
                    animation:  avatarBounce
                      ? 'cq-hop .85s ease-out'
                      : 'cq-bob 2s ease-in-out infinite',
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 0 10px rgba(255,215,0,.75))',
                  }}>
                    {avatar}
                  </div>
                )}

                {/* ── Session nodes ── circle on path + compact label below ── */}
                {sessions.map((session, idx) => {
                  const pt             = nxy(idx);
                  const isDone         = !!session.completed;
                  const isFreeSession  = session.order <= freeLimit;
                  const isPremiumGated = !isPremium && !isFreeSession;
                  const isCurrent      = !isDone && !isPremiumGated && idx === nextIdx;
                  const isLocked       = !isDone && !isCurrent && !isFreeSession && !isPremiumGated;
                  const nodeColor      = isDone ? T.lime : isPremiumGated ? T.gold : isCurrent ? T.orange : 'rgba(255,255,255,.25)';
                  const icon           = TYPE_ICON[session.type] || '📘';
                  const labelColor     = isDone ? T.lime : isPremiumGated ? T.gold : isCurrent ? T.orange : 'rgba(232,255,245,.55)';

                  return (
                    <div
                      key={session.id}
                      onClick={() => !isLocked && goSession(session)}
                      style={{
                        position:  'absolute',
                        left:      pt.x - 32,
                        top:       pt.y - 32,
                        width:     64,
                        overflow:  'visible',
                        display:   'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor:    isLocked ? 'default' : 'pointer',
                        zIndex:    2,
                        animation: `cq-pop .35s ${idx * 0.06}s ease both`,
                      }}
                    >
                      {/* ── Circle ── */}
                      <div
                        className="cq-node"
                        data-locked={isLocked ? 'true' : 'false'}
                        style={{
                          width: 64, height: 64, borderRadius:'50%', flexShrink:0,
                          background: isDone
                            ? `linear-gradient(135deg,${T.lime},#5BB832)`
                            : isPremiumGated
                              ? `linear-gradient(135deg,#7B5800,#4A3300)`
                              : isCurrent
                                ? `linear-gradient(135deg,${T.orange},#E8501A)`
                                : 'rgba(255,255,255,.1)',
                          border: `3px solid ${nodeColor}`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize: isDone ? 28 : 22,
                          boxShadow: isDone
                            ? `0 6px 0 #3A8A1A,0 0 22px ${T.lime}55`
                            : isPremiumGated
                              ? `0 6px 0 #3A2800,0 0 18px ${T.gold}44`
                              : isCurrent
                                ? `0 6px 0 #C04A1A,0 0 30px ${T.orange}66`
                                : '0 4px 0 rgba(0,0,0,.4)',
                          animation: isCurrent ? 'cq-pulse 1.8s ease-in-out infinite' : 'none',
                          transition: 'transform .15s',
                          opacity: isLocked ? 0.55 : 1,
                        }}
                      >
                        {isDone ? '⭐' : isPremiumGated ? '👑' : isLocked ? '🔒' : icon}
                      </div>

                      {/* ── Label below circle ── */}
                      <div style={{
                        marginTop: 6,
                        width: 110,
                        textAlign: 'center',
                        pointerEvents: 'none',
                        opacity: isLocked ? 0.55 : 1,
                      }}>
                        <div style={{
                          fontFamily: "'Fredoka One',cursive",
                          fontSize: 12, lineHeight: 1.25,
                          color: labelColor,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {session.title}
                        </div>
                        <div style={{ marginTop: 3, display:'flex', gap:3, justifyContent:'center', flexWrap:'wrap' }}>
                          {isPremiumGated ? (
                            <span style={{ fontSize:9, fontWeight:800, color:T.gold,
                              background:`${T.gold}22`, borderRadius:4, padding:'1px 5px' }}>👑 PRO</span>
                          ) : (
                            <>
                              {isFreeSession && (
                                <span style={{ fontSize:9, fontWeight:800, color:T.teal,
                                  background:'rgba(0,200,168,.18)', borderRadius:4, padding:'1px 5px' }}>FREE</span>
                              )}
                              <span style={{ fontSize:9, fontWeight:700, color:T.orange,
                                background:`${T.orange}22`, borderRadius:4, padding:'1px 5px' }}>
                                +{session.xpReward}XP
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Badges ── */}
          {(() => {
            const badges = (user?.earnedBadges || []).map(ub => ub.badge || ub).filter(b => b?.emoji);
            if (!badges.length) return null;
            return (
              <div style={{ marginTop:24, marginBottom:16,
                background:'rgba(255,215,0,.12)', border:`2px solid ${T.gold}55`,
                borderRadius:20, padding:'16px 20px', textAlign:'center',
                animation:'cq-pop .5s ease both' }}>
                <div style={{ fontFamily:"'Fredoka One',cursive", color:T.gold, fontSize:14, marginBottom:12 }}>
                  🏅 Your Badges
                </div>
                <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
                  {badges.map((b, i) => (
                    <div key={i} title={b.name} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:38, filter:`drop-shadow(0 0 10px ${T.gold}AA)`,
                        animation:`cq-bob ${2+i*.25}s ease-in-out infinite`, animationDelay:`${i*.3}s` }}>
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

          {/* ── Course complete trophy ── */}
          {completed === total && total > 0 && (
            <div style={{ textAlign:'center', marginTop:24,
              background:'rgba(255,215,0,.12)', border:`3px solid ${T.gold}`,
              borderRadius:24, padding:28, boxShadow:`0 8px 0 ${T.gold}44`,
              animation:'cq-pop .5s ease both' }}>
              <div style={{ fontSize:64, animation:'cq-bob 2s ease-in-out infinite' }}>🏆</div>
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
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿'].map((e,i) => (
            <span key={i} style={{ fontSize:20+((i*6)%14), opacity:.35,
              animation:`cq-sway ${3+i*.3}s ease-in-out infinite`, animationDelay:`${i*.22}s` }}>
              {e}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

const backBtnStyle = {
  background:'rgba(255,107,53,.18)', border:'1.5px solid rgba(255,107,53,.5)',
  borderRadius:12, padding:'6px 14px', cursor:'pointer',
  fontFamily:"'Fredoka One',cursive", color:'#FF8C60', fontSize:13, flexShrink:0,
};
