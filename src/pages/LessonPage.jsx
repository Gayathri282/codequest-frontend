// frontend/src/pages/LessonPage.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession }       from '../hooks/useSession';
import { useProgress }      from '../hooks/useProgress';
import { useCourseContext } from '../context/CourseContext';
import { useAuth }          from '../context/AuthContext';
import { setLastLesson }    from '../utils/storage';
import api                  from '../utils/api';
import Hud                  from '../components/shared/Hud';
import Btn                  from '../components/shared/Btn';
import LoadingScreen        from '../components/shared/LoadingScreen';
import VideoPlayer          from '../components/lesson/VideoPlayer';
import CodeEditor, { extractTitle } from '../components/lesson/CodeEditor';
import DocumentViewer       from '../components/lesson/DocumentViewer';
import PlatformIntro        from '../components/lesson/PlatformIntro';

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
  const prevSessionId = currentCourse ? getPrevSessionId(currentCourse, id) : null;
  const freeLimit = currentCourse?.freeSessionCount ?? 4;
  const [doneError,    setDoneError]    = useState(null);
  const [nextSession,  setNextSession]  = useState(null);
  const [canComplete,  setCanComplete]  = useState(true);
  const [earlyMsg,     setEarlyMsg]     = useState('');
  const [earlyConfirm, setEarlyConfirm] = useState(false);
  const earlyMsgTimer = useRef(null);

  const [showIntro,   setShowIntro]   = useState(false);
  const [missionOpen, setMissionOpen] = useState(false);

  // FIX: start as null, not ''.
  // CodeEditor calls onRun(buildDoc(...)) on mount with the fully-assembled doc
  // (CSS + JS merged in). The old seeding effect set this to raw session.starterCode
  // (no CSS/JS), which raced with onRun and produced a blank/unstyled preview.
  // Initialising to null means the iframe doesn't render until CodeEditor fires onRun.
  const [splitPreview,    setSplitPreview]    = useState(null);
  const [splitFrac,       setSplitFrac]       = useState(50);
  const [isSplitDragging, setIsSplitDragging] = useState(false);
  const splitContainerRef = useRef(null);

  function openSplitInNewTab() {
    if (!splitPreview) return;
    const blob = new Blob([splitPreview], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function onSplitDragStart(e) {
    e.preventDefault();
    setIsSplitDragging(true);
    const totalW = splitContainerRef.current?.getBoundingClientRect().width || 1;
    const startX = e.clientX;
    const startF = splitFrac;
    function onMove(ev) {
      setSplitFrac(Math.max(25, Math.min(75, startF + ((ev.clientX - startX) / totalW) * 100)));
    }
    function onUp() {
      setIsSplitDragging(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  useEffect(() => {
    if (!session) return;
    if (session.order === 1 && !localStorage.getItem('cq_platform_intro_done')) {
      setShowIntro(true);
    }
  }, [session?.id]); // eslint-disable-line

  function handleIntroDone() {
    localStorage.setItem('cq_platform_intro_done', '1');
    setShowIntro(false);
  }

  useEffect(() => { if (id) setLastLesson(id); }, [id]);

  useEffect(() => {
    if (!session) return;
    const needsGate = Boolean(session.videoUrl) ||
      session.type === 'VIDEO' || session.type === 'BOSS' || session.type === 'DOCUMENT';
    setCanComplete(!needsGate);
    setEarlyMsg('');
    setEarlyConfirm(false);
  }, [session?.id]);

  // FIX: removed the broken seeding effect that used to live here:
  //
  //   useEffect(() => {
  //     if (session?.starterCode && !splitPreview) {
  //       setSplitPreview(session.starterCode);   // ← raw HTML only, no CSS/JS assembled
  //     }
  //   }, [session?.id]);
  //
  // It was setting splitPreview to the raw starterCode string before CodeEditor had a
  // chance to call onRun(buildDoc(...)), meaning CSS and JS from separate files were
  // never merged in and the preview appeared blank or unstyled.

  useEffect(() => {
    if (session?.type === 'QUIZ') nav(`/quiz/${id}`, { replace: true });
  }, [session?.type]);

  async function handleMarkDone() {
    setDoneError(null);
    try {
      const result = await completeSession(id, 3);
      markSessionDone(id);

      const course = courses.find(c => c.sessions?.some(s => s.id === id));
      let next = null;
      if (course) {
        const sorted = [...(course.sessions || [])].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex(s => s.id === id);
        next = sorted[idx + 1] ?? null;
      }
      setNextSession(next);

      if (result.alreadyDone) {
        const courseId = course?.id;
        if (next && (isPremium || next.order <= freeLimit)) {
          nav(next.type === 'QUIZ' ? `/quiz/${next.id}` : `/lesson/${next.id}`);
        } else {
          nav(courseId ? `/course/${courseId}` : '/courses');
        }
      }
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
      if (isDoc) {
        setEarlyMsg('📖 Tip: scroll through the content for the full lesson!');
        clearTimeout(earlyMsgTimer.current);
        earlyMsgTimer.current = setTimeout(() => setEarlyMsg(''), 4000);
        handleMarkDone();
      } else {
        setEarlyConfirm(true);
      }
      return;
    }
    handleMarkDone();
  }

  const handleVideoProgress = useCallback((exitSeconds, duration, maxSeconds) => {
    if (!session?.id || !currentCourse?.id) return;
    api.patch('/progress/video-watch', {
      sessionId:    session.id,
      courseId:     currentCourse.id,
      exitSeconds,
      maxSeconds,
      duration,
    }).catch(() => {});
  }, [session?.id, currentCourse?.id]); // eslint-disable-line

  function goNext() {
    clearReward();
    const ns = nextSession;
    setNextSession(null);
    if (!ns) {
      nav(currentCourse?.id ? `/course/${currentCourse.id}` : '/courses');
      return;
    }
    if (!isPremium && ns.order > freeLimit) { nav('/pricing'); return; }
    nav(ns.type === 'QUIZ' ? `/quiz/${ns.id}` : `/lesson/${ns.id}`);
  }

  function handleUpgrade() { nav('/pricing'); }

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
              textAlign:'center', maxWidth:380 }}>This lesson is Premium only</div>
            <button onClick={handleUpgrade}
              style={{ background:'linear-gradient(135deg,#FFD700,#E8A800)',
                border:'3px solid #FFD700', borderRadius:16, color:'#1A0E00',
                fontFamily:"'Fredoka One',cursive", fontSize:20, padding:'14px 36px',
                cursor:'pointer', boxShadow:'0 6px 0 #A07800', marginTop:8 }}>
              👑 Upgrade to Premium →
            </button>
            <Btn onClick={() => nav(-1)} color={C.cyan} textColor='#041A0E' sm>← Go Back</Btn>
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

  // Don't render editor until session data matches the URL id.
  // Without this, CodeEditor mounts with the previous session's starterFiles
  // for a brief moment when navigating manually, loading the wrong starter code.
  const sessionReady = session && (session.id === id || session._id === id);

  const hasVideo = Boolean(session?.videoUrl) || session?.type === 'VIDEO' || session?.type === 'BOSS';
  const hasIDE   = Boolean(session?.hasIde)   || session?.type === 'CODE'  || session?.type === 'BOSS';

  // ── Build starterFiles array from the session's separate fields ──
  // This merges starterCode/starterCss/starterJs + imageAssets into the
  // multi-file format CodeEditor already understands.
  function buildStarterFiles(s) {
    if (!s) return null;

    const base = [];

    const html = s.starterCode?.trim();
    const css  = s.starterCss?.trim();
    const js   = s.starterJs?.trim();

    if (html) base.push({ name: 'index.html', content: html });
    if (css)  base.push({ name: 'style.css',  content: css  });
    if (js)   base.push({ name: 'script.js',  content: js   });

    // Add image assets — content is the CDN URL, buildDoc will
    // replace src="filename" with the real URL in the preview
    const imgs = (s.imageAssets || []).map(img => ({
      name:    img.name,   // e.g. "cat.png"
      content: img.url,    // CDN URL — treated as src replacement
      isAsset: true,       // flag so CodeEditor shows it read-only
    }));

    const all = [...base, ...imgs];

    // Fall back to legacy starterFiles if we have nothing from new fields
    if (all.length === 0 && Array.isArray(s.starterFiles) && s.starterFiles.length) {
      return s.starterFiles;
    }

    return all.length ? all : null;
  }

  const starterFiles = buildStarterFiles(session);

  return (
    <div
      onContextMenu={e => e.preventDefault()}
      style={{ height:'100vh', display:'flex', flexDirection:'column',
        background:'#F0FFF8', fontFamily:"'Quicksand',sans-serif", overflow:'hidden' }}
    >

      {/* ── Completion celebration overlay ── */}
      {reward && !reward.alreadyDone && (
        <div style={{ position:'fixed', inset:0,
          background:'rgba(4,26,14,.85)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}>

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
            borderRadius:32, border:`4px solid ${reward.leveledUp ? '#FFD700' : C.lime}`,
            boxShadow:`0 0 100px ${reward.leveledUp ? '#FFD700' : C.lime}55, 0 12px 0 ${reward.leveledUp ? '#FFD700' : C.lime}66`,
            padding:'44px 36px', textAlign:'center', maxWidth:440,
            animation:'pop .5s cubic-bezier(.4,2,.4,1)', position:'relative', zIndex:202 }}>

            <div style={{ fontSize:96, lineHeight:1,
              animation:'medal-bounce .7s cubic-bezier(.4,2,.4,1) both' }}>
              {reward.leveledUp ? '🎊' : '🎉'}
            </div>

            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:34, margin:'14px 0 6px',
              background: reward.leveledUp
                ? `linear-gradient(135deg,#FFD700,#fff,#FFD700)`
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
                background:'rgba(255,215,0,.12)', border:`2px solid #FFD700`,
                borderRadius:14, padding:'10px 18px', margin:'8px 0' }}>
                <div style={{ fontSize:40 }}>{b.emoji}</div>
                <div style={{ fontFamily:"'Fredoka One',cursive", color:'#FFD700', fontSize:18 }}>
                  🏅 New Badge: {b.name}!
                </div>
              </div>
            ))}

            <div style={{ marginTop:22, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => { clearReward(); setNextSession(null); nav(currentCourse?.id ? `/course/${currentCourse.id}` : '/courses'); }}
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
                      : '🗺️ Back to Map'}
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
          <Btn onClick={handleMarkDoneGuarded} disabled={completing}
            color={C.lime} textColor='#1A3020' sm style={{ fontWeight:700 }}>
            {completing ? '⏳' : '✓ Done'}
          </Btn>
        </div>

        {earlyMsg && (
          <div style={{ width:'100%', background:'rgba(255,215,0,.12)', border:'2px solid rgba(255,215,0,.5)',
            borderRadius:10, padding:'6px 14px', color:'#B8960A', fontSize:12, fontWeight:700,
            marginTop:6, flexShrink:0 }}>{earlyMsg}</div>
        )}
        {earlyConfirm && (
          <div style={{ width:'100%', background:'rgba(255,107,53,.1)', border:'2px solid rgba(255,107,53,.5)',
            borderRadius:10, padding:'10px 14px', marginTop:6, flexShrink:0,
            display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <span style={{ flex:1, color:'#C84A1A', fontSize:12, fontWeight:700 }}>
              🎬 You haven't finished the video yet. You can still complete it — but your progress won't be fully counted.
            </span>
            <button onClick={() => { setEarlyConfirm(false); handleMarkDone(); }}
              style={{ background:'linear-gradient(180deg,#FF6B35,#E8501A)', border:'none',
                borderRadius:10, padding:'7px 18px', cursor:'pointer',
                fontFamily:"'Fredoka One',cursive", fontSize:13, color:'#fff',
                boxShadow:'0 3px 0 #C04A1A', flexShrink:0 }}>
              Complete Anyway ✓
            </button>
            <button onClick={() => setEarlyConfirm(false)}
              style={{ background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.2)',
                borderRadius:10, padding:'7px 14px', cursor:'pointer',
                fontFamily:"'Fredoka One',cursive", fontSize:13, color:'rgba(232,255,245,.6)',
                flexShrink:0 }}>Keep Watching</button>
          </div>
        )}
        {doneError && (
          <div style={{ width:'100%', background:`${C.red}18`, border:`2px solid ${C.red}55`,
            borderRadius:10, padding:'6px 14px', color:C.red, fontSize:12, fontWeight:700,
            marginTop:6, flexShrink:0 }}>{doneError}</div>
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>

        {session?.type === 'DOCUMENT' && (
          <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>
            <DocumentViewer title={session.title} content={session.docContent} onCanComplete={() => setCanComplete(true)} />
          </div>
        )}

        {isSplitDragging && (
          <div style={{ position:'fixed', inset:0, zIndex:99999, cursor:'ew-resize' }} />
        )}

        {/* VIDEO + IDE */}
        {hasVideo && hasIDE && (
          <div ref={splitContainerRef} style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>
            <div style={{ flex:`0 0 ${splitFrac}%`, display:'flex', flexDirection:'column',
              overflow:'hidden', minWidth:0 }}>
              <div style={{ flex:'0 0 42%', overflow:'hidden', minHeight:0,
                borderBottom:`3px solid #C8EEFF` }}>
                {!showIntro && (
                  <VideoPlayer
                    videoUrl={session?.videoUrl}
                    docContent={session?.docContent}
                    fullView={false}
                    onCanComplete={() => setCanComplete(true)}
                    onProgress={handleVideoProgress}
                  />
                )}
              </div>
              <div style={{ flex:1, overflow:'hidden', minHeight:0, display:'flex', flexDirection:'column' }}>
                {sessionReady && (
                  <CodeEditor
                    key={session.id}
                    starterCode={starterFiles?.filter(f => !f.isAsset).length > 1 ? undefined : (session.starterCode || defaultStarterCode)}
                    starterFiles={starterFiles}
                    sessionId={session.id}
                    inheritFromSessionId={prevSessionId}
                    hidePreview
                    onRun={setSplitPreview}
                  />
                )}
              </div>
            </div>

            <div onMouseDown={onSplitDragStart} title="Drag to resize panels"
              style={{ width:8, flexShrink:0, cursor:'ew-resize', userSelect:'none',
                background:`${C.cyan}22`,
                borderLeft:`2px solid ${C.cyan}55`, borderRight:`2px solid ${C.cyan}55`,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:3, height:48, borderRadius:2, background:`${C.cyan}88` }} />
            </div>

            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
              <div style={{ background:`linear-gradient(90deg,${C.cyan}20,#EBF8FF)`,
                padding:'5px 12px', fontSize:11, color:C.cyan,
                fontFamily:"'Quicksand',sans-serif", fontWeight:700, letterSpacing:.5,
                flexShrink:0, borderBottom:`1px solid ${C.cyan}33`,
                display:'flex', alignItems:'center', gap:8, overflow:'hidden' }}>
                <span style={{ whiteSpace:'nowrap' }}>👁 PREVIEW</span>
                {extractTitle(splitPreview)
                  ? <span style={{ color:'#3A7A8A', fontSize:10, fontWeight:600,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                      — {extractTitle(splitPreview)}
                    </span>
                  : <span style={{ flex:1, color:'#B0C8E0', fontSize:10 }}>▶ Run to update</span>
                }
                <button onClick={openSplitInNewTab}
                  style={{ background:'transparent', border:`1.5px solid ${C.orange}`,
                    borderRadius:6, padding:'2px 8px', cursor:'pointer',
                    fontSize:10, color:C.orange, fontFamily:"'Quicksand',sans-serif",
                    fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>↗ New Tab</button>
              </div>

              {/* FIX: only render the iframe once CodeEditor has fired onRun with a real
                  buildDoc result (splitPreview !== null). Previously the iframe rendered
                  immediately with srcDoc="" which showed a blank white box, and the
                  broken seeding effect could overwrite it with unstyled raw HTML. */}
              {splitPreview
                ? <iframe srcDoc={splitPreview}
                    style={{ flex:1, border:'none', width:'100%' }}
                    sandbox="allow-scripts allow-forms allow-modals"
                    title="Preview"
                    onContextMenu={e => e.preventDefault()} />
                : <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                    flexDirection:'column', gap:10, color:'#B0C8E0',
                    fontFamily:"'Fredoka One',cursive", fontSize:14,
                    background:'#F6FEFF' }}>
                    <span style={{ fontSize:40, opacity:.5 }}>▶</span>
                    <span>Click Run to see your preview</span>
                  </div>
              }
            </div>
          </div>
        )}

        {/* VIDEO only */}
        {hasVideo && !hasIDE && (
          <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>
            {!showIntro && (
              <VideoPlayer
                videoUrl={session?.videoUrl}
                docContent={session?.docContent}
                fullView
                onCanComplete={() => setCanComplete(true)}
                onProgress={handleVideoProgress}
              />
            )}
          </div>
        )}

        {/* CODE only */}
        {session?.type === 'CODE' && !hasVideo && (
          <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>
            {sessionReady && (
              <CodeEditor
                key={session.id}
                starterCode={session.starterCode || defaultStarterCode}
                starterFiles={starterFiles}
                sessionId={session.id}
                inheritFromSessionId={prevSessionId}
              />
            )}
          </div>
        )}

        {session && !hasVideo && session.type !== 'DOCUMENT' && session.type !== 'CODE' && session.type !== 'QUIZ' && (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
            flexDirection:'column', gap:16, color:'#6B82A8', fontFamily:"'Fredoka One',cursive" }}>
            <div style={{ fontSize:64 }}>📭</div>
            <div style={{ fontSize:22 }}>No content yet for this session</div>
          </div>
        )}
      </div>

      {/* ── Floating Missions button ── */}
      {session?.missionText && (
        <button onClick={() => setMissionOpen(true)}
          style={{ position:'fixed', bottom:24, right:24, zIndex:80,
            background:`linear-gradient(135deg,${C.lime},#5BB832)`,
            border:'none', borderRadius:50, padding:'11px 20px', cursor:'pointer',
            fontFamily:"'Fredoka One',cursive", fontSize:15,
            color:'#1A3020', boxShadow:`0 4px 0 #3A8A1A, 0 0 20px ${C.lime}55`,
            display:'flex', alignItems:'center', gap:8, transition:'transform .12s' }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
          📋 Missions
        </button>
      )}

      {/* ── Missions popup ── */}
      {missionOpen && (
        <div onClick={() => setMissionOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(4,26,14,.75)',
            backdropFilter:'blur(6px)', zIndex:150,
            display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#0D2B1A', border:`3px solid ${C.lime}`,
              borderRadius:24, padding:'28px 28px 24px', maxWidth:460, width:'100%',
              boxShadow:`0 0 60px ${C.lime}33`, fontFamily:"'Quicksand',sans-serif" }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:C.lime }}>
                📋 Your Mission
              </div>
              <button onClick={() => setMissionOpen(false)}
                style={{ background:'rgba(255,255,255,.1)', border:'none', borderRadius:8,
                  color:'rgba(232,255,245,.7)', fontSize:18, cursor:'pointer',
                  width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ background:'linear-gradient(135deg,#0A3D1F,#0D2B1A)',
              border:`2px solid ${C.lime}44`, borderRadius:16,
              padding:18, fontSize:14, color:'#E8FFF5',
              lineHeight:1.8, whiteSpace:'pre-line', fontWeight:600 }}>
              {session.missionText}
            </div>
            {session.docContent && (
              <div style={{ marginTop:14, fontSize:13, color:'rgba(232,255,245,.75)',
                lineHeight:1.8, background:'rgba(0,0,0,.25)', borderRadius:12,
                padding:14, border:`1px solid rgba(126,217,87,.2)`, whiteSpace:'pre-line' }}>
                {session.docContent}
              </div>
            )}
            <button onClick={() => setMissionOpen(false)}
              style={{ marginTop:18, width:'100%', padding:'12px',
                background:`linear-gradient(180deg,${C.lime},#5BB832)`,
                border:'none', borderRadius:14,
                fontFamily:"'Fredoka One',cursive", fontSize:16,
                color:'#1A3020', cursor:'pointer', boxShadow:`0 4px 0 #3A8A1A` }}>
              Got it! Let's code 💻
            </button>
          </div>
        </div>
      )}

      {showIntro && (
        <PlatformIntro avatar={user?.avatarEmoji} onDone={handleIntroDone} />
      )}
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

function getPrevSessionId(course, sessionId) {
  const list = (course?.sessions || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const idx = list.findIndex(s => s.id === sessionId);
  if (idx <= 0) return null;
  return list[idx - 1]?.id || null;
}