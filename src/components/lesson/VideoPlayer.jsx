// frontend/src/components/lesson/VideoPlayer.jsx
import { useEffect, useRef, useState } from 'react';

const C = { orange:'#FF6B35', cyan:'#00C8E8', lime:'#7ED957' };
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function buildEmbedUrl(url) {
  if (!url) return null;
  const params = new URLSearchParams({
    rel:            '0',
    modestbranding: '1',
    showinfo:       '0',
    iv_load_policy: '3',
    enablejsapi:    '1',   // required for postMessage control
    cc_load_policy: '0',   // captions off by default (user toggles)
    fs:             '0',   // disable YouTube's native fullscreen
    origin: window.location.origin,
  });
  try {
    const u = new URL(url);
    let id = null;
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
    else if (/youtube\.com/.test(u.hostname) && u.pathname === '/watch') id = u.searchParams.get('v');
    else if (/youtube\.com/.test(u.hostname) && u.pathname.startsWith('/embed/'))
      id = u.pathname.split('/embed/')[1]?.split('?')[0];
    if (id) return `https://www.youtube.com/embed/${id}?${params}`;
  } catch (_) {}
  return url; // non-YouTube URL — pass through as-is
}

export default function VideoPlayer({ videoUrl, missionText, docContent }) {
  const iframeRef  = useRef(null);
  const wrapperRef = useRef(null);

  const [speed,    setSpeed]    = useState(1);
  const [ccOn,     setCcOn]     = useState(false);
  const [playing,  setPlaying]  = useState(false);
  const [fsActive, setFsActive] = useState(false);
  const playerReady = useRef(false);
  const cmdQueue    = useRef([]);

  const embedUrl = buildEmbedUrl(videoUrl);

  /* Send a command — queues it if the player isn't ready yet */
  function yt(func, args = '') {
    const msg = JSON.stringify({ event: 'command', func, args });
    if (!playerReady.current) {
      cmdQueue.current.push(msg);
      return;
    }
    iframeRef.current?.contentWindow?.postMessage(msg, 'https://www.youtube.com');
  }

  /* Listen for events coming back FROM the YouTube iframe */
  useEffect(() => {
    function onMsg(e) {
      if (e.origin !== 'https://www.youtube.com') return;
      try {
        const d = JSON.parse(typeof e.data === 'string' ? e.data : JSON.stringify(e.data));
        if (d.event === 'onReady') {
          // Player is ready — flush any queued commands
          playerReady.current = true;
          cmdQueue.current.forEach(msg =>
            iframeRef.current?.contentWindow?.postMessage(msg, 'https://www.youtube.com')
          );
          cmdQueue.current = [];
        }
        if (d.event === 'onStateChange') {
          // 1=playing, 3=buffering → show Pause; everything else → show Play
          setPlaying(d.info === 1 || d.info === 3);
        }
      } catch (_) {}
    }
    window.addEventListener('message', onMsg);
    return () => {
      window.removeEventListener('message', onMsg);
      playerReady.current = false;
      cmdQueue.current = [];
    };
  }, []);

  /* Track browser fullscreen */
  useEffect(() => {
    const h = () => setFsActive(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  /* Controls */
  function togglePlay() {
    if (playing) { yt('pauseVideo'); setPlaying(false); }
    else         { yt('playVideo');  setPlaying(true);  }
  }
  function changeSpeed(s) {
    setSpeed(s);
    yt('setPlaybackRate', [s]);
  }
  function toggleCC() {
    const next = !ccOn;
    setCcOn(next);
    yt(next ? 'loadModule' : 'unloadModule', 'captions');
  }
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapperRef.current?.requestFullscreen?.();
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0, background:'#fff' }}>

      {/* Wrapper — fullscreen target so controls stay visible */}
      <div
        ref={wrapperRef}
        style={{
          background:'#000', flexShrink:0, display:'flex', flexDirection:'column',
          ...(fsActive
            ? { position:'fixed', inset:0, zIndex:9999 }
            : { aspectRatio:'16/9' }),
        }}
      >
        {/* Video area */}
        <div
          style={{ flex:1, position:'relative', minHeight:0 }}
          onContextMenu={e => e.preventDefault()}
        >
          {embedUrl ? (
            <>
              <iframe
                ref={iframeRef}
                src={embedUrl}
                style={{ width:'100%', height:'100%', border:'none', display:'block' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Lesson video"
              />
              {/* Overlay: blocks right-click + double-click; routes clicks to togglePlay */}
              <div
                style={{ position:'absolute', inset:0, zIndex:2, cursor:'pointer' }}
                onClick={togglePlay}
                onDoubleClick={e => { e.stopPropagation(); e.preventDefault(); }}
                onContextMenu={e => { e.stopPropagation(); e.preventDefault(); }}
              />
            </>
          ) : (
            <div style={{
              position:'absolute', inset:0,
              background:`linear-gradient(135deg,${C.cyan}33,#FF4FCB22)`,
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:12,
            }}>
              <div style={{ fontSize:64 }}>🎬</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:'#1A2340',
                textAlign:'center', padding:'0 20px' }}>
                Video coming soon!<br/>
                <span style={{ fontSize:13, color:'#6B82A8', fontFamily:"'Quicksand',sans-serif" }}>
                  Upload via Admin → Sessions
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Control bar */}
        {embedUrl && (
          <div style={{
            background:'#0D1117', padding:'7px 14px', display:'flex',
            alignItems:'center', gap:6, flexShrink:0, flexWrap:'wrap', zIndex:3,
          }}>

            {/* Play / Pause */}
            <button onClick={togglePlay} style={btnStyle(C.lime, '#1A3020')}>
              {playing ? '⏸ Pause' : '▶ Play'}
            </button>

            <Div />

            {/* Speed */}
            <span style={{ color:'#5A7090', fontSize:10, fontWeight:700, letterSpacing:.6 }}>SPEED</span>
            {SPEEDS.map(s => (
              <button key={s} onClick={() => changeSpeed(s)} style={pillStyle(speed === s, C.cyan)}>
                {s}×
              </button>
            ))}

            <Div />

            {/* Captions */}
            <button onClick={toggleCC} style={pillStyle(ccOn, C.cyan)}>
              CC {ccOn ? 'ON' : 'OFF'}
            </button>

            <div style={{ flex:1 }} />

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} style={pillStyle(fsActive, C.orange)}>
              {fsActive ? '✕ Exit' : '⛶ Full'}
            </button>
          </div>
        )}
      </div>

      {/* Mission + doc */}
      <div style={{ flex:1, overflow:'auto', padding:16 }}>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:C.orange, marginBottom:10 }}>
          📋 Your Mission
        </div>
        <div style={{
          background:`linear-gradient(135deg,#E0F7FF,#B3ECFF)`,
          border:`2px solid ${C.cyan}`, borderRadius:14,
          padding:16, fontSize:14, color:'#1A2340',
          lineHeight:1.8, whiteSpace:'pre-line', fontWeight:600,
        }}>
          {missionText || 'Watch the video and try coding along in the editor! 🚀'}
        </div>
        {docContent && (
          <div style={{
            marginTop:14, fontSize:14, color:'#1A2340', lineHeight:1.8,
            background:'#F0FAFF', borderRadius:12, padding:14,
            border:`2px solid ${C.cyan}44`, whiteSpace:'pre-line',
          }}>
            {docContent}
          </div>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    background:bg, border:'none', borderRadius:8, color,
    cursor:'pointer', padding:'5px 14px',
    fontFamily:"'Quicksand',sans-serif", fontSize:12, fontWeight:700,
  };
}
function pillStyle(active, activeColor) {
  return {
    background: active ? activeColor  : 'transparent',
    color:      active ? '#1A2340'    : '#5A7090',
    border:     `1.5px solid ${active ? activeColor : '#2D3561'}`,
    borderRadius:6, padding:'3px 9px', fontSize:11, fontWeight:700,
    cursor:'pointer', fontFamily:"'Quicksand',sans-serif",
  };
}
function Div() {
  return <div style={{ width:1, height:18, background:'#2D3561', margin:'0 2px' }} />;
}
