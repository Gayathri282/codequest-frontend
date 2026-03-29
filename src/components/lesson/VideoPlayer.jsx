// frontend/src/components/lesson/VideoPlayer.jsx
import { useEffect, useRef, useState } from 'react';

const C = { orange:'#FF6B35', cyan:'#00C8E8', lime:'#7ED957' };
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/* ─── helpers ─────────────────────────────────────────── */
function isYouTube(url) {
  if (!url) return false;
  try {
    const h = new URL(url).hostname;
    return h === 'youtu.be' || /youtube\.com/.test(h);
  } catch (_) { return false; }
}

function extractYTId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be')                 return u.pathname.slice(1).split('?')[0];
    if (u.pathname === '/watch')                    return u.searchParams.get('v');
    if (u.pathname.startsWith('/embed/'))           return u.pathname.split('/embed/')[1]?.split('?')[0];
  } catch (_) {}
  return null;
}

let ytApiLoading = false;
function loadYTApi(cb) {
  if (window.YT?.Player) { cb(); return; }
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { prev?.(); cb(); };
  if (!ytApiLoading) {
    ytApiLoading = true;
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
}

/* ─── root component ──────────────────────────────────── */
export default function VideoPlayer({ videoUrl, missionText, docContent, fullView = false, onCanComplete, onProgress }) {
  return isYouTube(videoUrl)
    ? <YTPlayer    url={videoUrl} missionText={missionText} docContent={docContent} fullView={fullView} onCanComplete={onCanComplete} onProgress={onProgress} />
    : <EmbedPlayer url={videoUrl} missionText={missionText} docContent={docContent} fullView={fullView} onCanComplete={onCanComplete} onProgress={onProgress} />;
}

/* ─── YouTube player ──────────────────────────────────── */
function YTPlayer({ url, missionText, docContent, fullView, onCanComplete, onProgress }) {
  const containerRef   = useRef(null);
  const playerRef      = useRef(null);
  const wrapperRef     = useRef(null);
  const firedRef       = useRef(false);
  const onCompleteRef  = useRef(onCanComplete);
  const onProgressRef  = useRef(onProgress);
  const maxSecondsRef  = useRef(0);  // highest position ever reached (never decreases)

  const [ready,    setReady]    = useState(false);
  const [playing,  setPlaying]  = useState(false);
  const [speed,    setSpeed]    = useState(1);
  const [ccOn,     setCcOn]     = useState(false);
  const [fsOn,     setFsOn]     = useState(false);
  const [watchPct, setWatchPct] = useState(0);

  const videoId = extractYTId(url);

  useEffect(() => { onCompleteRef.current = onCanComplete; }, [onCanComplete]);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  function reportProgress() {
    try {
      const dur = playerRef.current?.getDuration?.() ?? 0;
      const cur = playerRef.current?.getCurrentTime?.() ?? 0;
      if (dur > 0 && onProgressRef.current) {
        onProgressRef.current(Math.round(cur), Math.round(dur), Math.round(maxSecondsRef.current));
      }
    } catch (_) {}
  }

  // Build / rebuild player when videoId changes
  useEffect(() => {
    if (!videoId) return;
    firedRef.current = false;
    setReady(false); setPlaying(false); setSpeed(1); setCcOn(false); setWatchPct(0);

    function init() {
      if (!containerRef.current) return;
      try { playerRef.current?.destroy(); } catch (_) {}
      playerRef.current = null;
      containerRef.current.innerHTML = '';
      const div = document.createElement('div');
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(div, {
        videoId,
        width:  '100%',
        height: '100%',
        playerVars: { rel:0, modestbranding:1, iv_load_policy:3, cc_load_policy:0, fs:0, playsinline:1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            const isPaused = e.data === 2;
            const isEnded  = e.data === 0;
            setPlaying(e.data === 1 || e.data === 3);

            if (isEnded && !firedRef.current) {
              firedRef.current = true;
              setWatchPct(100);
              onCompleteRef.current?.();
            }
            try {
              const dur = playerRef.current?.getDuration?.() ?? 0;
              const cur = playerRef.current?.getCurrentTime?.() ?? 0;
              if (dur > 0) {
                maxSecondsRef.current = Math.max(maxSecondsRef.current, cur);
                const pct = cur / dur;
                setWatchPct(Math.min(100, Math.round(pct * 100)));
                if (pct >= 0.75 && !firedRef.current) {
                  firedRef.current = true;
                  onCompleteRef.current?.();
                }
                // Report progress on pause or end so admin sees last exit point
                if (isPaused || isEnded) reportProgress();
              }
            } catch (_) {}
          },
          onError: () => setReady(false),
        },
      });
    }

    loadYTApi(init);

    return () => {
      reportProgress(); // report where student was when they left
      try { playerRef.current?.destroy(); } catch (_) {}
      playerRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [videoId]); // eslint-disable-line

  // Poll seek-bar position every 500 ms
  useEffect(() => {
    if (!ready) return;
    function checkProgress() {
      try {
        const dur = playerRef.current?.getDuration?.() ?? 0;
        const cur = playerRef.current?.getCurrentTime?.() ?? 0;
        if (dur > 0) {
          maxSecondsRef.current = Math.max(maxSecondsRef.current, cur);
          const pct = cur / dur;
          setWatchPct(Math.min(100, Math.round(pct * 100)));
          if (pct >= 0.75 && !firedRef.current) {
            firedRef.current = true;
            onCompleteRef.current?.();
          }
        }
      } catch (_) {}
    }
    const id = setInterval(checkProgress, 500);
    return () => clearInterval(id);
  }, [ready]);

  useEffect(() => {
    const h = () => setFsOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  function togglePlay() {
    if (!ready) return;
    if (playing) { playerRef.current.pauseVideo(); setPlaying(false); }
    else         { playerRef.current.playVideo();  setPlaying(true);  }
  }
  function setRate(s) {
    if (!ready) return;
    setSpeed(s); playerRef.current.setPlaybackRate(s);
  }
  function toggleCC() {
    if (!ready) return;
    const next = !ccOn; setCcOn(next);
    if (next) { playerRef.current.loadModule('captions'); playerRef.current.setOption('captions','track',{languageCode:'en'}); }
    else        { playerRef.current.unloadModule('captions'); }
  }
  function toggleFs() {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapperRef.current?.requestFullscreen?.();
  }

  const unlocked = watchPct >= 75;

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
      <div
        ref={wrapperRef}
        onContextMenu={e => e.preventDefault()}
        style={{
          background:'#000', display:'flex', flexDirection:'column',
          userSelect:'none',
          ...(fsOn
            ? { position:'fixed', inset:0, zIndex:9999 }
            : fullView
              ? { flex:1, minHeight:0 }
              : { flexShrink:0, aspectRatio:'16/9' }),
        }}
      >
        <div style={{ flex:1, position:'relative', minHeight:0 }}>
          <div ref={containerRef} style={{ width:'100%', height:'100%' }} />
          {/* Right-click blocker — pointerEvents:auto blocks context menu on the video area.
              All playback controls are external (YT API buttons), so blocking clicks here is safe. */}
          <div
            style={{ position:'absolute', inset:0, zIndex:2, pointerEvents:'auto', cursor:'default' }}
            onContextMenu={e => e.preventDefault()}
          />
          {!ready && (
            <div style={{ position:'absolute', inset:0, zIndex:3, pointerEvents:'none',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ background:'rgba(0,0,0,.6)', color:'#aaa', borderRadius:8,
                padding:'6px 16px', fontSize:12, fontFamily:"'Quicksand',sans-serif", fontWeight:700 }}>
                Loading…
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ background:'#0D1117', padding:'7px 12px', display:'flex',
          alignItems:'center', gap:6, flexShrink:0, flexWrap:'wrap', zIndex:3 }}>
          <button onClick={togglePlay} disabled={!ready} style={btn(ready ? C.lime : '#333','#1A3020',!ready)}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <Sep />
          <span style={{ color:'#5A7090', fontSize:10, fontWeight:700 }}>SPEED</span>
          {SPEEDS.map(s => (
            <button key={s} onClick={() => setRate(s)} disabled={!ready} style={pill(speed===s, C.cyan, !ready)}>
              {s}×
            </button>
          ))}
          <Sep />
          <button onClick={toggleCC} disabled={!ready} style={pill(ccOn, C.cyan, !ready)}>
            CC {ccOn ? 'ON' : 'OFF'}
          </button>
          <div style={{ flex:1 }} />
          {/* Progress badge */}
          {ready && (
            <div style={{
              display:'flex', alignItems:'center', gap:5,
              background: unlocked ? 'rgba(126,217,87,.18)' : 'rgba(255,255,255,.08)',
              border: `1.5px solid ${unlocked ? C.lime : 'rgba(255,255,255,.2)'}`,
              borderRadius:8, padding:'3px 10px',
            }}>
              <div style={{ width:50, height:5, background:'rgba(255,255,255,.15)', borderRadius:5, overflow:'hidden' }}>
                <div style={{ width:`${watchPct}%`, height:'100%',
                  background: unlocked ? C.lime : C.cyan,
                  borderRadius:5, transition:'width .5s' }} />
              </div>
              <span style={{ fontSize:10, fontWeight:700, color: unlocked ? C.lime : '#5A7090' }}>
                {unlocked ? '✓ 75%' : `${watchPct}%`}
              </span>
            </div>
          )}
          <button onClick={toggleFs} style={pill(fsOn, C.orange, false)}>
            {fsOn ? '✕ Exit' : '⛶ Full'}
          </button>
        </div>
      </div>
      {missionText && <Mission text={missionText} doc={docContent} fullView={fullView} />}
    </div>
  );
}

/* ─── Generic iframe player (Bunny, Vimeo, etc.) ─────── */
function EmbedPlayer({ url, missionText, docContent, fullView, onCanComplete, onProgress }) {
  const wrapperRef    = useRef(null);
  const iframeRef     = useRef(null);
  const firedRef      = useRef(false);
  const onCompleteRef = useRef(onCanComplete);
  const onProgressRef = useRef(onProgress);
  const gotMsgRef     = useRef(false);
  const maxSecondsRef = useRef(0);
  const lastCurRef    = useRef(0);
  const lastDurRef    = useRef(0);
  const [fsOn,      setFsOn]      = useState(false);
  const [embedPct,  setEmbedPct]  = useState(0);
  const [fallbackPct, setFbPct]   = useState(0);

  useEffect(() => { onCompleteRef.current = onCanComplete; }, [onCanComplete]);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  // Report on unmount
  useEffect(() => {
    return () => {
      if (lastDurRef.current > 0 && onProgressRef.current) {
        onProgressRef.current(
          Math.round(lastCurRef.current),
          Math.round(lastDurRef.current),
          Math.round(maxSecondsRef.current),
        );
      }
    };
  }, []);

  function fire() {
    if (firedRef.current) return;
    firedRef.current = true;
    onCompleteRef.current?.();
  }

  // Listen for postMessage events from the embed iframe
  // Bunny Stream sends: { event:'timeupdate', seconds:X, duration:Y }
  // Vimeo sends:        { event:'timeupdate', data:{ seconds:X, duration:Y } }
  useEffect(() => {
    if (!url) return;
    firedRef.current = false;
    gotMsgRef.current = false;
    setEmbedPct(0); setFbPct(0);

    function onMessage(e) {
      try {
        const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        let cur = 0, dur = 0;

        // Bunny Stream format
        if (msg?.event === 'timeupdate' && typeof msg.seconds === 'number') {
          cur = msg.seconds; dur = msg.duration;
        }
        // Vimeo format
        else if (msg?.event === 'timeupdate' && typeof msg.data?.seconds === 'number') {
          cur = msg.data.seconds; dur = msg.data.duration;
        }
        // Generic: any object with currentTime / duration
        else if (typeof msg?.currentTime === 'number' && typeof msg?.duration === 'number') {
          cur = msg.currentTime; dur = msg.duration;
        }

        if (dur > 0) {
          gotMsgRef.current = true;
          lastCurRef.current = cur;
          lastDurRef.current = dur;
          maxSecondsRef.current = Math.max(maxSecondsRef.current, cur);
          const pct = cur / dur;
          setEmbedPct(Math.min(100, Math.round(pct * 100)));
          if (pct >= 0.75) fire();
        }
      } catch (_) {}
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [url]);

  // Fallback timer — only used if no postMessage events arrive after 3 s
  // Counts wall-clock seconds; assumes roughly 75% of the video = min watch time
  useEffect(() => {
    if (!url) return;
    let count = 0;
    const FALLBACK_SECS = 90; // unlock after 90 s of page time if no events received
    const id = setInterval(() => {
      if (gotMsgRef.current) return; // real events are flowing — skip timer
      count++;
      const pct = Math.min(100, Math.round((count / FALLBACK_SECS) * 100));
      setFbPct(pct);
      if (count >= FALLBACK_SECS) fire();
    }, 1000);
    return () => clearInterval(id);
  }, [url]);

  useEffect(() => {
    const h = () => setFsOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  function toggleFs() {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapperRef.current?.requestFullscreen?.();
  }

  // Show real pct if we have postMessage data, otherwise show fallback timer pct
  const pct      = gotMsgRef.current ? embedPct : fallbackPct;
  const unlocked = firedRef.current;

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
      <div
        ref={wrapperRef}
        onContextMenu={e => e.preventDefault()}
        style={{
          background:'#000', display:'flex', flexDirection:'column',
          userSelect:'none',
          ...(fsOn
            ? { position:'fixed', inset:0, zIndex:9999 }
            : fullView
              ? { flex:1, minHeight:0 }
              : { flexShrink:0, aspectRatio:'16/9' }),
        }}
      >
        <div style={{ flex:1, position:'relative', minHeight:0 }}
          onContextMenu={e => e.preventDefault()}>
          {url ? (
            <iframe
              ref={iframeRef}
              src={url}
              style={{ width:'100%', height:'100%', border:'none', display:'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              title="Lesson video"
              onContextMenu={e => e.preventDefault()}
            />
          ) : (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:12,
              background:`linear-gradient(135deg,${C.cyan}33,#FF4FCB22)` }}>
              <div style={{ fontSize:64 }}>🎬</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:'#1A2340', textAlign:'center' }}>
                Video coming soon!
                <br/><span style={{ fontSize:13, color:'#6B82A8', fontFamily:"'Quicksand',sans-serif" }}>
                  Add URL via Admin → Sessions
                </span>
              </div>
            </div>
          )}
          {url && <div style={{ position:'absolute', inset:0, zIndex:2, pointerEvents:'none' }} />}
        </div>
        {url && (
          <div style={{ background:'#0D1117', padding:'7px 12px', display:'flex',
            alignItems:'center', justifyContent:'flex-end', gap:8, zIndex:3, flexShrink:0 }}>
            {/* Progress badge */}
            <div style={{
              display:'flex', alignItems:'center', gap:5,
              background: unlocked ? 'rgba(126,217,87,.18)' : 'rgba(255,255,255,.08)',
              border: `1.5px solid ${unlocked ? C.lime : 'rgba(255,255,255,.2)'}`,
              borderRadius:8, padding:'3px 10px',
            }}>
              <div style={{ width:50, height:5, background:'rgba(255,255,255,.15)', borderRadius:5, overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%',
                  background: unlocked ? C.lime : C.cyan,
                  borderRadius:5, transition:'width .5s' }} />
              </div>
              <span style={{ fontSize:10, fontWeight:700, color: unlocked ? C.lime : '#5A7090' }}>
                {unlocked ? '✓ Ready' : `${pct}%`}
              </span>
            </div>
            <button onClick={toggleFs} style={pill(fsOn, C.orange, false)}>
              {fsOn ? '✕ Exit' : '⛶ Fullscreen'}
            </button>
          </div>
        )}
      </div>
      {missionText && <Mission text={missionText} doc={docContent} fullView={fullView} />}
    </div>
  );
}

/* ─── Shared ──────────────────────────────────────────── */
function Mission({ text, doc, fullView }) {
  return (
    <div style={fullView
      ? { flexShrink:0, maxHeight:200, overflow:'auto', padding:'10px 16px',
          borderTop:'2px solid #E0F0FF' }
      : { flex:1, overflow:'auto', padding:16 }}>
      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:C.orange, marginBottom:10 }}>
        📋 Your Mission
      </div>
      <div style={{ background:'linear-gradient(135deg,#E0F7FF,#B3ECFF)',
        border:`2px solid ${C.cyan}`, borderRadius:14,
        padding:16, fontSize:14, color:'#1A2340', lineHeight:1.8,
        whiteSpace:'pre-line', fontWeight:600 }}>
        {text || 'Watch the video and try coding along in the editor! 🚀'}
      </div>
      {doc && (
        <div style={{ marginTop:14, fontSize:14, color:'#1A2340', lineHeight:1.8,
          background:'#F0FAFF', borderRadius:12, padding:14,
          border:`2px solid ${C.cyan}44`, whiteSpace:'pre-line' }}>
          {doc}
        </div>
      )}
    </div>
  );
}

function btn(bg, color, disabled) {
  return { background:bg, border:'none', borderRadius:8, color,
    cursor:disabled?'not-allowed':'pointer', opacity:disabled?.45:1,
    padding:'5px 14px', fontFamily:"'Quicksand',sans-serif", fontSize:12, fontWeight:700 };
}
function pill(active, ac, disabled) {
  return { background:active?ac:'transparent', color:active?'#1A2340':'#5A7090',
    border:`1.5px solid ${active?ac:'#2D3561'}`, borderRadius:6, padding:'3px 9px',
    fontSize:11, fontWeight:700, cursor:disabled?'not-allowed':'pointer',
    opacity:disabled?.45:1, fontFamily:"'Quicksand',sans-serif" };
}
function Sep() {
  return <div style={{ width:1, height:18, background:'#2D3561', margin:'0 2px' }} />;
}
