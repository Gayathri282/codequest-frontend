// frontend/src/pages/LessonPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession }       from '../hooks/useSession';
import { useProgress }      from '../hooks/useProgress';
import { useCourseContext } from '../context/CourseContext';
import { useAuth }          from '../context/AuthContext';
import { setLastLesson }    from '../utils/storage';
import Hud                  from '../components/shared/Hud';
import Btn                  from '../components/shared/Btn';
import LoadingScreen        from '../components/shared/LoadingScreen';
import VideoPlayer          from '../components/lesson/VideoPlayer';
import CodeEditor           from '../components/lesson/CodeEditor';
import DocumentViewer       from '../components/lesson/DocumentViewer';

const C = { orange:'#FF6B35', cyan:'#00C8E8', lime:'#7ED957', yellow:'#FFD700', red:'#FF4757', teal:'#00C8A0' };

export default function LessonPage() {
  const { id } = useParams();
  const nav    = useNavigate();

  const { session, loading, error }                        = useSession(id);
  const { completeSession, completing, reward, clearReward } = useProgress();
  const { markSessionDone, courses }                         = useCourseContext();
  const { user }                                             = useAuth();
  const isPremium = user?.plan === 'PREMIUM' || user?.plan === 'BASIC' || user?.role === 'ADMIN';
  const currentCourse = courses.find(c => c.sessions?.some(s => s.id === id));
  const freeLimit = currentCourse?.freeSessionCount ?? 4;
  const [doneError,    setDoneError]    = useState(null);
  const [nextSession,  setNextSession]  = useState(null);
  const [canComplete,  setCanComplete]  = useState(true);   // false until 75% watched/read
  const [earlyMsg,     setEarlyMsg]     = useState('');
  const earlyMsgTimer = useRef(null);

  // Remember last visited lesson (in effect, not render body)
  useEffect(() => { if (id) setLastLesson(id); }, [id]);

  // Gate the Done button for video and document sessions
  useEffect(() => {
    if (!session) return;
    const needsGate = Boolean(session.videoUrl) ||
      session.type === 'VIDEO' || session.type === 'BOSS' || session.type === 'DOCUMENT';
    setCanComplete(!needsGate);
    setEarlyMsg('');
  }, [session?.id]);

  // Redirect quiz sessions to the dedicated quiz page
  useEffect(() => {
    if (session?.type === 'QUIZ') nav(`/quiz/${id}`, { replace: true });
  }, [session?.type]);

  async function handleMarkDone() {
    setDoneError(null);
    try {
      const result = await completeSession(id, 3);
      markSessionDone(id);

      // Find next session and navigate directly
      const course = courses.find(c => c.sessions?.some(s => s.id === id));
      let next = null;
      if (course) {
        const sorted = [...(course.sessions || [])].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex(s => s.id === id);
        next = sorted[idx + 1] ?? null;
      }

      if (!next) { nav('/dashboard'); return; }
      if (!isPremium && next.order > freeLimit) { nav('/pricing'); return; }
      nav(next.type === 'QUIZ' ? `/quiz/${next.id}` : `/lesson/${next.id}`);
    } catch (err) {
      const msg = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
        ? '⏱ Server took too long — is the backend running?'
        : err.response?.data?.error || '❌ Could not save progress. Try again.';
      setDoneError(msg);
    }
  }

  function handleMarkDoneGuarded() {
    if (!canComplete) {
      const isDoc = session?.type === 'DOCUMENT';
      setEarlyMsg(isDoc
        ? '📖 Tip: scroll through the content for the full lesson — but you can still mark done!'
        : '🎬 Tip: finish watching the video for the full lesson — but you can still mark done!');
      clearTimeout(earlyMsgTimer.current);
      earlyMsgTimer.current = setTimeout(() => setEarlyMsg(''), 4000);
    }
    // Always proceed regardless
    handleMarkDone();
  }

  function goNext() {
    clearReward();
    setNextSession(null);
    if (!nextSession) { nav('/dashboard'); return; }
    if (!isPremium && nextSession.order > freeLimit) { nav('/pricing'); return; }
    nav(nextSession.type === 'QUIZ' ? `/quiz/${nextSession.id}` : `/lesson/${nextSession.id}`);
  }

  function handleUpgrade() {
    nav('/pricing');
  }

  if (loading) return <LoadingScreen />;

  if (error) {
    const isPlanError = error.includes('Upgrade') || error.includes('Premium') || error.includes('premium');
    return (
      <div style={{ minHeight:'100vh',
        background:'radial-gradient(ellipse at 50% 20%,#0D3B22,#041A0E)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:20, padding:24, fontFamily:"'Quicksand',sans-serif" }}>
        {isPlanError ? (
          <>
            <div style={{ fontSize:80 }}>👑</div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:30, color:'#FFD700',
              textAlign:'center', maxWidth:380 }}>
              This lesson is Premium only
            </div>
            <div style={{ color:'rgba(232,255,245,.7)', fontSize:15, textAlign:'center', maxWidth:340, fontWeight:600 }}>
              Unlock all sessions, live IDE, quizzes and more for just ₹1,499 / month
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
              {['All sessions unlocked','Live code IDE','Quizzes & boss levels','Certificates'].map(f => (
                <span key={f} style={{ background:'rgba(255,215,0,.12)', border:'1px solid rgba(255,215,0,.4)',
                  borderRadius:50, padding:'4px 14px', color:'#FFD700', fontSize:13, fontWeight:700 }}>
                  ✓ {f}
                </span>
              ))}
            </div>
            <button onClick={handleUpgrade}
              style={{ background:'linear-gradient(135deg,#FFD700,#E8A800)',
                border:'3px solid #FFD700', borderRadius:16, color:'#1A0E00',
                fontFamily:"'Fredoka One',cursive", fontSize:20, padding:'14px 36px',
                cursor:'pointer', boxShadow:'0 6px 0 #A07800', marginTop:8 }}>
              👑 Upgrade to Premium →
            </button>
            <Btn onClick={() => nav(-1)} color={C.cyan} textColor='#041A0E' sm>
              ← Go Back
            </Btn>
          </>
        ) : (
          <>
            <div style={{ fontSize:72 }}>🔒</div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:C.orange,
              textAlign:'center' }}>{error}</div>
            <Btn onClick={() => nav('/dashboard')} color={C.cyan} sm>← Back to Dashboard</Btn>
          </>
        )}
      </div>
    );
  }

  const hasVideo = Boolean(session?.videoUrl) || session?.type === 'VIDEO' || session?.type === 'BOSS';
  const hasIDE   = Boolean(session?.hasIde)   || session?.type === 'CODE'  || session?.type === 'BOSS';

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column',
      background:'#F0FFF8', fontFamily:"'Quicksand',sans-serif", overflow:'hidden' }}>

      {/* ── Completion celebration overlay ── */}
      {reward && !reward.alreadyDone && (
        <div style={{ position:'fixed', inset:0,
          background:'rgba(4,26,14,.85)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}>

          {/* Confetti */}
          {[...Array(28)].map((_,i) => (
            <div key={i} style={{
              position:'fixed',
              left:`${(i*3.7)%100}%`, top:`-${(i*5)%15}%`,
              width:8+(i%4)*4, height:8+(i%3)*3,
              borderRadius:i%3===0?'50%':4,
              background:['#7ED957','#00C8E8','#FFD700','#FF4FCB','#00C8A0','#fff'][i%6],
              animation:`confetti-fall ${2+(i%4)*0.5}s linear infinite`,
              animationDelay:`${(i*0.18)%2.5}s`,
              pointerEvents:'none', zIndex:201,
            }} />
          ))}
          <style>{`
            @keyframes confetti-fall {
              0%   { transform:translateY(-20px) rotate(0deg); opacity:1; }
              100% { transform:translateY(100vh) rotate(720deg); opacity:0; }
            }
            @keyframes medal-bounce {
              0%   { transform:scale(0) rotate(-15deg); opacity:0; }
              60%  { transform:scale(1.25) rotate(5deg); opacity:1; }
              100% { transform:scale(1) rotate(0deg); }
            }
          `}</style>

          <div style={{ background:'rgba(13,59,34,.95)', backdropFilter:'blur(16px)',
            borderRadius:32, border:`4px solid ${reward.leveledUp ? C.gold : C.lime}`,
            boxShadow:`0 0 100px ${reward.leveledUp ? C.gold : C.lime}55, 0 12px 0 ${reward.leveledUp ? C.gold : C.lime}66`,
            padding:'44px 36px', textAlign:'center', maxWidth:440,
            animation:'pop .5s cubic-bezier(.4,2,.4,1)', position:'relative', zIndex:202 }}>

            <div style={{ fontSize:96, lineHeight:1,
              animation:'medal-bounce .7s cubic-bezier(.4,2,.4,1) both',
              filter:`drop-shadow(0 0 28px ${reward.leveledUp ? C.gold : C.lime}BB)` }}>
              {reward.leveledUp ? '🎊' : '🎉'}
            </div>

            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:34, margin:'14px 0 6px',
              background: reward.leveledUp
                ? `linear-gradient(135deg,${C.gold},#fff,${C.gold})`
                : `linear-gradient(135deg,${C.lime},${C.teal})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              {reward.leveledUp ? `LEVEL UP! Now Lv.${reward.newLevel} 🚀` : 'Session Complete! ⭐'}
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:12, flexWrap:'wrap' }}>
              <span style={{ background:'rgba(126,217,87,.15)', border:'2px solid #7ED95766',
                borderRadius:50, padding:'6px 18px',
                fontFamily:"'Fredoka One',cursive", color:C.lime, fontSize:18 }}>
                ⭐ +{reward.xpEarned} XP
              </span>
              <span style={{ background:'rgba(255,215,0,.15)', border:'2px solid #FFD70066',
                borderRadius:50, padding:'6px 18px',
                fontFamily:"'Fredoka One',cursive", color:C.yellow, fontSize:18 }}>
                🪙 +{reward.coinsEarned}
              </span>
            </div>

            {reward.cappedByDaily && (
              <div style={{ color:'rgba(232,255,245,.5)', fontSize:12, marginBottom:8 }}>
                Daily XP cap reached — full XP again tomorrow!
              </div>
            )}

            {reward.newBadges?.length > 0 && reward.newBadges.map(b => (
              <div key={b.id} style={{
                background:'rgba(255,215,0,.12)', border:`2px solid ${C.yellow}`,
                borderRadius:14, padding:'10px 18px', margin:'8px 0',
                animation:'pop .5s cubic-bezier(.4,2,.4,1)',
              }}>
                <div style={{ fontSize:40 }}>{b.emoji}</div>
                <div style={{ fontFamily:"'Fredoka One',cursive", color:C.yellow, fontSize:18 }}>
                  🏅 New Badge: {b.name}!
                </div>
              </div>
            ))}

            <div style={{ marginTop:22, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => { clearReward(); setNextSession(null); nav('/dashboard'); }}
                style={{ background:'rgba(255,255,255,.08)', border:'2px solid rgba(255,255,255,.2)',
                  borderRadius:14, color:'rgba(232,255,245,.8)',
                  fontFamily:"'Fredoka One',cursive", fontSize:15, padding:'10px 20px', cursor:'pointer' }}>
                🗺️ Map
              </button>
              {(() => {
                const needsUpgrade = nextSession && !isPremium && nextSession.order > freeLimit;
                const bg = needsUpgrade ? `linear-gradient(180deg,#FFD700,#E8A800)`
                  : nextSession ? `linear-gradient(180deg,${C.lime},#5BB832)`
                  : `linear-gradient(180deg,${C.teal},#008B6E)`;
                const border = needsUpgrade ? '#FFD700' : nextSession ? C.lime : C.teal;
                const color  = needsUpgrade ? '#1A0E00' : nextSession ? '#1A3020' : '#fff';
                const shadow = needsUpgrade ? '#A07800' : nextSession ? '#3A8A1A' : '#006B52';
                return (
                  <button onClick={goNext} style={{
                    background:bg, border:`3px solid ${border}`, borderRadius:16, color,
                    fontFamily:"'Fredoka One',cursive", fontSize:17, padding:'12px 26px',
                    cursor:'pointer', boxShadow:`0 6px 0 ${shadow}`,
                  }}>
                    {needsUpgrade ? '👑 Upgrade to Continue'
                      : nextSession ? `▶ Next: ${nextSession.title}`
                      : '🏁 Finish Course!'}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <Hud />

      {/* ── Toolbar ── */}
      <div style={{ background:'#fff', borderBottom:`3px solid ${C.cyan}`,
        padding:'10px 16px', display:'flex', alignItems:'center', gap:12,
        flexShrink:0, flexWrap:'wrap', boxShadow:`0 3px 0 ${C.cyan}22` }}>

        <Btn onClick={() => nav('/dashboard')} color='#E8F8FF' sm
          style={{ border:`2px solid ${C.cyan}`, color:C.cyan, fontWeight:700 }}>← Back</Btn>

        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:'#1A2340',
          flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {session?.title}
          {session?.type && (
            <span style={{ fontSize:12, marginLeft:10, color:C.cyan,
              fontFamily:"'Quicksand',sans-serif", fontWeight:600 }}>
              · {session.type.toLowerCase()}
            </span>
          )}
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          <span style={{ background:`${C.orange}18`, border:`2px solid ${C.orange}44`,
            borderRadius:50, padding:'3px 12px',
            fontFamily:"'Fredoka One',cursive", color:C.orange, fontSize:14 }}>
            ⭐ {session?.xpReward} XP
          </span>
          <span style={{ background:'#FFD70018', border:'2px solid #FFD70066',
            borderRadius:50, padding:'3px 12px',
            fontFamily:"'Fredoka One',cursive", color:'#B8960A', fontSize:14 }}>
            🪙 {session?.coinsReward}
          </span>
          <Btn
            onClick={handleMarkDoneGuarded}
            disabled={completing}
            color={C.lime}
            textColor='#1A3020'
            sm
            style={{ fontWeight:700 }}
          >
            {completing ? '⏳' : '✓ Done'}
          </Btn>
        </div>
        {earlyMsg && (
          <div style={{ width:'100%', background:'rgba(255,215,0,.12)', border:'2px solid rgba(255,215,0,.5)',
            borderRadius:10, padding:'6px 14px', color:'#B8960A', fontSize:12, fontWeight:700,
            marginTop:6, flexShrink:0 }}>
            {earlyMsg}
          </div>
        )}
        {doneError && (
          <div style={{ width:'100%', background:`${C.red}18`, border:`2px solid ${C.red}55`,
            borderRadius:10, padding:'6px 14px', color:C.red, fontSize:12, fontWeight:700,
            marginTop:6, flexShrink:0 }}>
            {doneError}
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>

        {/* DOCUMENT */}
        {session?.type === 'DOCUMENT' && (
          <DocumentViewer title={session.title} content={session.docContent} onCanComplete={() => setCanComplete(true)} />
        )}

        {/* VIDEO or BOSS — left side video, optional right side IDE */}
        {hasVideo && (
          <>
            <div style={{
              flex: hasIDE ? '0 0 45%' : '1',
              display:'flex', flexDirection:'column',
              overflow:'hidden', minHeight:0,
              borderRight: hasIDE ? `3px solid #C8EEFF` : 'none',
            }}>
              <VideoPlayer
                videoUrl={session?.videoUrl}
                missionText={session?.missionText}
                docContent={session?.docContent}
                fullView={!hasIDE}
                onCanComplete={() => setCanComplete(true)}
              />
            </div>
            {hasIDE && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
                <CodeEditor
                  starterCode={session?.starterCode || defaultStarterCode}
                  sessionId={id}
                />
              </div>
            )}
          </>
        )}

        {/* CODE only (no video) */}
        {session?.type === 'CODE' && !hasVideo && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
            <CodeEditor
              starterCode={session?.starterCode || defaultStarterCode}
              sessionId={id}
            />
          </div>
        )}

        {/* Fallback for any unhandled type */}
        {session && !hasVideo && session.type !== 'DOCUMENT' && session.type !== 'CODE' && session.type !== 'QUIZ' && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
            flexDirection:'column', gap:16, color:'#6B82A8', fontFamily:"'Fredoka One',cursive" }}>
            <div style={{ fontSize:64 }}>📭</div>
            <div style={{ fontSize:22 }}>No content yet for this session</div>
          </div>
        )}
      </div>
    </div>
  );
}

const defaultStarterCode = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background:#E0F7FF; font-family:Arial,sans-serif; text-align:center; padding:40px; }
    h1   { color:#FF6B35; }
  </style>
</head>
<body>
  <h1>Hello, Coder! 🚀</h1>
  <p>Edit this code and click Run!</p>
</body>
</html>`;
