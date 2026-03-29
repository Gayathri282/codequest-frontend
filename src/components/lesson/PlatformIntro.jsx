// frontend/src/components/lesson/PlatformIntro.jsx
// Full-screen platform intro shown before session 1
import { useState } from 'react';

const C = {
  lime:'#7ED957', cyan:'#00C8E8', orange:'#FF6B35',
  teal:'#00C8A0', gold:'#FFD700', white:'#E8FFF5',
};

const STEPS = [
  {
    key: 'welcome',
    icon: '🐸', title: 'Welcome to Your Workspace!',
    desc: "I'm Pip! This is where you'll code. Let me walk you through every part — it'll only take a minute! 🌿",
    highlight: null,
    // callout centered
    callout: { top:'36%', left:'50%', transform:'translateX(-50%)' },
    arrow: null,
  },
  {
    key: 'video',
    icon: '🎬', title: 'Video Player',
    desc: "Watch the tutorial video here (top-left). I'll teach you step by step. Pause, rewind, rewatch anytime!",
    highlight: 'video',
    callout: { top:'8%', left:'52%' },
    arrow: { side:'left', calloutSide:{ left:-14, top:22,
      borderTop:'9px solid transparent', borderBottom:'9px solid transparent', borderRight:`14px solid #0F3020` } },
    arrowOutline: { left:-17, top:20,
      borderTop:'10px solid transparent', borderBottom:'10px solid transparent', borderRight:`15px solid ${C.lime}` },
  },
  {
    key: 'editor',
    icon: '💻', title: 'Code Editor',
    desc: "Type your HTML, CSS and JavaScript here (bottom-left). Your code auto-saves as you type!",
    highlight: 'editor',
    callout: { bottom:'12%', left:'52%' },
    arrow: { side:'left', calloutSide:{ left:-14, top:22,
      borderTop:'9px solid transparent', borderBottom:'9px solid transparent', borderRight:`14px solid #0F3020` } },
    arrowOutline: { left:-17, top:20,
      borderTop:'10px solid transparent', borderBottom:'10px solid transparent', borderRight:`15px solid ${C.lime}` },
  },
  {
    key: 'run',
    icon: '▶️', title: 'Run Button',
    desc: "See the Run button at the top of the editor? Click it (or press Ctrl+Enter) to execute your code!",
    highlight: 'run',
    callout: { top:'46%', left:'52%' },
    arrow: { side:'left', calloutSide:{ left:-14, top:18,
      borderTop:'9px solid transparent', borderBottom:'9px solid transparent', borderRight:`14px solid #0F3020` } },
    arrowOutline: { left:-17, top:16,
      borderTop:'10px solid transparent', borderBottom:'10px solid transparent', borderRight:`15px solid ${C.lime}` },
  },
  {
    key: 'preview',
    icon: '👁', title: 'Live Preview',
    desc: "Your code renders here on the right — full height! Every time you hit Run, it updates instantly.",
    highlight: 'preview',
    callout: { top:'28%', right:'52%' },
    arrow: { side:'right', calloutSide:{ right:-14, top:22,
      borderTop:'9px solid transparent', borderBottom:'9px solid transparent', borderLeft:`14px solid #0F3020` } },
    arrowOutline: { right:-17, top:20,
      borderTop:'10px solid transparent', borderBottom:'10px solid transparent', borderLeft:`15px solid ${C.cyan}` },
  },
  {
    key: 'missions',
    icon: '📋', title: 'Missions Button',
    desc: "Click the green Missions button (bottom-right) to see your coding challenge. Complete it for XP and coins! 🪙",
    highlight: 'missions',
    callout: { bottom:'18%', right:'5%' },
    arrow: { side:'down', calloutSide:{ bottom:-14, right:32,
      borderLeft:'9px solid transparent', borderRight:'9px solid transparent', borderTop:`14px solid #0F3020` } },
    arrowOutline: { bottom:-17, right:30,
      borderLeft:'10px solid transparent', borderRight:'10px solid transparent', borderTop:`15px solid ${C.lime}` },
  },
  {
    key: 'done',
    icon: '✅', title: 'Done Button',
    desc: "Finished? Click ✓ Done in the top toolbar to save your progress and unlock the next session!",
    highlight: 'done',
    callout: { top:'12%', right:'5%' },
    arrow: { side:'up', calloutSide:{ top:-14, right:32,
      borderLeft:'9px solid transparent', borderRight:'9px solid transparent', borderBottom:`14px solid #0F3020` } },
    arrowOutline: { top:-17, right:30,
      borderLeft:'10px solid transparent', borderRight:'10px solid transparent', borderBottom:`15px solid ${C.lime}` },
  },
];

function isHighlighted(stepKey, zone) {
  if (!stepKey) return false;
  return stepKey === zone;
}

function hlStyle(active, color = C.lime) {
  return active ? {
    border: `3px solid ${color}`,
    boxShadow: `0 0 0 3px ${color}44, inset 0 0 20px ${color}22`,
    zIndex: 2,
  } : {
    border: '2px solid rgba(255,255,255,.12)',
    opacity: 0.55,
  };
}

export default function PlatformIntro({ avatar, onDone }) {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function next() {
    if (isLast) {
      setExiting(true);
      setTimeout(onDone, 350);
    } else {
      setStep(t => t + 1);
    }
  }

  function skip() {
    setExiting(true);
    setTimeout(onDone, 350);
  }

  return (
    <>
      <style>{`
        @keyframes pi-bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pi-pop  { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes pi-fade { to{opacity:0;transform:scale(.96)} }
        @keyframes pi-glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        .pi-next:hover { filter:brightness(1.12); transform:translateY(-2px); }
        .pi-next:active { transform:translateY(1px); }
      `}</style>

      <div style={{
        position:'fixed', inset:0, zIndex:500,
        background:'linear-gradient(160deg,#041A0E 0%,#062213 60%,#041A0E 100%)',
        fontFamily:"'Quicksand',sans-serif",
        display:'flex', flexDirection:'column',
        animation: exiting ? 'pi-fade .35s ease forwards' : 'none',
      }}>

        {/* ── Header: Pip + step indicator ── */}
        <div style={{ background:'rgba(4,26,14,.95)', borderBottom:`2px solid rgba(126,217,87,.3)`,
          padding:'10px 20px', display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
          <div style={{ fontSize:44, animation:'pi-bob 2s ease-in-out infinite',
            filter:`drop-shadow(0 0 16px ${C.lime}88)` }}>
            {avatar || '🐸'}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", color:C.lime, fontSize:18 }}>
              Pip's Tour — Platform Walkthrough
            </div>
            <div style={{ color:'rgba(232,255,245,.5)', fontSize:12, fontWeight:600 }}>
              Step {step + 1} of {STEPS.length} · Click Next or tap anywhere on the mockup
            </div>
          </div>
          {/* Step dots */}
          <div style={{ display:'flex', gap:5 }}>
            {STEPS.map((_,i) => (
              <div key={i} style={{ height:7, borderRadius:4,
                width: i === step ? 22 : 7,
                background: i < step ? C.lime : i === step ? C.orange : 'rgba(255,255,255,.2)',
                transition:'all .3s' }} />
            ))}
          </div>
          <button onClick={skip} style={{
            background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.15)',
            borderRadius:10, padding:'5px 14px', cursor:'pointer',
            fontFamily:"'Fredoka One',cursive", color:'rgba(232,255,245,.4)', fontSize:12,
          }}>Skip →</button>
        </div>

        {/* ── Main area: Layout mockup + callout ── */}
        <div style={{ flex:1, padding:'16px 20px 8px', display:'flex', flexDirection:'column',
          gap:10, position:'relative', overflow:'hidden' }}>

          {/* Layout mockup container */}
          <div onClick={next} style={{ flex:1, position:'relative', cursor:'pointer',
            borderRadius:16, overflow:'hidden', border:`2px solid rgba(126,217,87,.18)` }}>

            {/* ── Toolbar mockup ── */}
            <div style={{ height:44, background:'rgba(255,255,255,.97)',
              borderBottom:`3px solid ${C.cyan}`,
              display:'flex', alignItems:'center', gap:10, padding:'0 12px',
              flexShrink:0, position:'relative', zIndex:3,
              ...hlStyle(isHighlighted(s.highlight, 'done'), C.lime),
            }}>
              <div style={{ background:'#E8F8FF', border:`2px solid ${C.cyan}`,
                borderRadius:8, padding:'3px 12px', fontSize:11,
                fontFamily:"'Fredoka One',cursive", color:C.cyan }}>← Back</div>
              <div style={{ flex:1, fontFamily:"'Fredoka One',cursive",
                fontSize:14, color:'#1A2340' }}>Session Title</div>
              <div style={{ background:'rgba(255,107,53,.12)', border:`2px solid rgba(255,107,53,.4)`,
                borderRadius:50, padding:'2px 10px',
                fontFamily:"'Fredoka One',cursive", color:C.orange, fontSize:12 }}>⭐ 50 XP</div>
              <div style={{
                background: isHighlighted(s.highlight, 'done')
                  ? `linear-gradient(180deg,${C.lime},#5BB832)` : `${C.lime}33`,
                border: `2px solid ${C.lime}`,
                borderRadius:8, padding:'4px 14px',
                fontFamily:"'Fredoka One',cursive", fontSize:13, color:'#1A3020',
                transition:'all .2s',
              }}>✓ Done</div>
            </div>

            {/* ── Three-zone content mockup ── */}
            <div style={{ display:'flex', height:'calc(100% - 44px)' }}>

              {/* Left column: Video (top) + Editor (bottom) */}
              <div style={{ flex:'0 0 50%', display:'flex', flexDirection:'column',
                borderRight:`3px solid #C8EEFF` }}>

                {/* Video zone */}
                <div style={{ flex:'0 0 43%', background:'#0A1A12',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  borderBottom:`3px solid #C8EEFF`, position:'relative', overflow:'hidden',
                  transition:'all .25s',
                  ...hlStyle(isHighlighted(s.highlight, 'video'), C.orange),
                }}>
                  <div style={{ fontSize:36, opacity:.8,
                    filter: isHighlighted(s.highlight, 'video') ? `drop-shadow(0 0 16px ${C.orange}99)` : 'none' }}>
                    🎬
                  </div>
                  <div style={{ fontFamily:"'Fredoka One',cursive",
                    color: isHighlighted(s.highlight, 'video') ? C.orange : 'rgba(232,255,245,.4)',
                    fontSize:13, marginTop:6, transition:'color .2s' }}>
                    Video Player
                  </div>
                  <div style={{ fontSize:10, color:'rgba(232,255,245,.25)',
                    fontWeight:600, marginTop:3 }}>
                    Watch · Learn · Rewatch
                  </div>
                  {/* Firefly dots decoration */}
                  {[{l:'8%',t:'15%'},{l:'88%',t:'22%'},{l:'15%',t:'78%'},{l:'82%',t:'75%'}].map((f,i)=>(
                    <div key={i} style={{ position:'absolute', left:f.l, top:f.t,
                      width:4, height:4, borderRadius:'50%',
                      background: isHighlighted(s.highlight, 'video') ? C.orange : C.lime,
                      opacity:.4, animation:`pi-glow ${1.5+i*.3}s ease-in-out infinite` }} />
                  ))}
                </div>

                {/* Editor zone */}
                <div style={{ flex:1, background:'#0D1117', display:'flex', flexDirection:'column',
                  position:'relative', overflow:'hidden', transition:'all .25s',
                  ...hlStyle(isHighlighted(s.highlight, 'editor') || isHighlighted(s.highlight, 'run'), C.lime),
                }}>
                  {/* Editor header with Run btn */}
                  <div style={{ background:'rgba(255,255,255,.06)', padding:'6px 10px',
                    display:'flex', alignItems:'center', gap:6, flexShrink:0,
                    borderBottom:'1px solid rgba(255,255,255,.08)' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      {['🌐 index.html','🎨 style.css'].map(t=>(
                        <div key={t} style={{ background:'rgba(255,255,255,.1)',
                          border:'1px solid rgba(255,255,255,.15)',
                          borderRadius:'5px 5px 0 0', padding:'2px 8px',
                          fontSize:9, color:'rgba(232,255,245,.6)', fontWeight:700 }}>{t}</div>
                      ))}
                    </div>
                    <div style={{ flex:1 }} />
                    {/* Run button */}
                    <div style={{
                      background: isHighlighted(s.highlight, 'run')
                        ? `linear-gradient(180deg,${C.lime},#5BB832)` : '#3A5A30',
                      border:`2px solid ${isHighlighted(s.highlight, 'run') ? C.lime : '#2A4A20'}`,
                      borderRadius:8, padding:'3px 12px',
                      fontFamily:"'Fredoka One',cursive", fontSize:11, color:'#E8FFF5',
                      transition:'all .2s',
                      boxShadow: isHighlighted(s.highlight, 'run') ? `0 0 12px ${C.lime}88` : 'none',
                    }}>▶ Run!</div>
                  </div>
                  {/* Fake code lines */}
                  <div style={{ flex:1, padding:'8px 12px', overflow:'hidden' }}>
                    {['#FF6B35','#7ED957','rgba(232,255,245,.4)','#00C8E8','rgba(232,255,245,.2)',
                      '#7ED957','rgba(232,255,245,.3)','#00C8A0'].map((c,i)=>(
                      <div key={i} style={{ display:'flex', gap:8, marginBottom:5, alignItems:'center' }}>
                        <span style={{ color:'rgba(255,255,255,.2)', fontSize:9, width:12, textAlign:'right',
                          fontFamily:"'Courier New',monospace" }}>{i+1}</span>
                        <div style={{ height:7, background:c, opacity:.5, borderRadius:4,
                          width:`${[70,55,40,65,30,50,45,60][i]}%` }} />
                      </div>
                    ))}
                  </div>
                  {isHighlighted(s.highlight, 'editor') && (
                    <div style={{ position:'absolute', bottom:8, right:8, fontSize:9,
                      color:C.lime, fontWeight:700, fontFamily:"'Fredoka One',cursive",
                      background:'rgba(0,0,0,.4)', borderRadius:5, padding:'2px 6px' }}>
                      ✓ auto-saving
                    </div>
                  )}
                </div>
              </div>

              {/* Right column: Live Preview (full height) */}
              <div style={{ flex:1, background:'#fff', display:'flex', flexDirection:'column',
                position:'relative', transition:'all .25s',
                ...hlStyle(isHighlighted(s.highlight, 'preview'), C.cyan),
              }}>
                <div style={{ background:`linear-gradient(90deg,${C.cyan}22,#EBF8FF)`,
                  padding:'5px 10px', borderBottom:`1px solid ${C.cyan}33`,
                  display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                  <span style={{ fontSize:10, color:C.cyan, fontWeight:700,
                    fontFamily:"'Fredoka One',cursive" }}>👁 LIVE PREVIEW</span>
                  <span style={{ fontSize:9, color:'#B0C8E0', fontWeight:600 }}>▶ Run to update</span>
                </div>
                {/* Mock website */}
                <div style={{ flex:1, display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:8, padding:12,
                  background:'linear-gradient(160deg,#E0F7FF,#fff)' }}>
                  <div style={{ width:'80%', height:18, background:'#FF6B35',
                    borderRadius:5, opacity: isHighlighted(s.highlight,'preview') ? .9 : .35 }} />
                  <div style={{ width:'60%', height:10, background:'#00C8A0',
                    borderRadius:4, opacity: isHighlighted(s.highlight,'preview') ? .7 : .25 }} />
                  <div style={{ display:'flex', gap:6 }}>
                    {[C.lime, C.cyan, C.orange].map((c,i)=>(
                      <div key={i} style={{ width:40, height:40, background:c, borderRadius:8,
                        opacity: isHighlighted(s.highlight,'preview') ? .7 : .2 }} />
                    ))}
                  </div>
                  {isHighlighted(s.highlight,'preview') && (
                    <div style={{ fontSize:10, color:C.cyan, fontWeight:700,
                      fontFamily:"'Fredoka One',cursive", marginTop:4 }}>
                      ✨ Your code renders here!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Missions button mockup */}
            <div style={{ position:'absolute', bottom:14, right:14, zIndex:4,
              background: isHighlighted(s.highlight, 'missions')
                ? `linear-gradient(135deg,${C.lime},#5BB832)` : 'rgba(126,217,87,.35)',
              border:`2px solid ${isHighlighted(s.highlight, 'missions') ? C.lime : 'rgba(126,217,87,.5)'}`,
              borderRadius:50, padding:'7px 16px',
              fontFamily:"'Fredoka One',cursive", fontSize:12, color:'#1A3020',
              boxShadow: isHighlighted(s.highlight, 'missions') ? `0 0 20px ${C.lime}88` : 'none',
              transition:'all .25s',
            }}>
              📋 Missions
            </div>

            {/* ── Callout bubble ── */}
            {s.callout && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position:'absolute', zIndex:10,
                  maxWidth:260, width:'calc(50% - 32px)',
                  ...s.callout,
                  animation:'pi-pop .35s cubic-bezier(.34,1.56,.64,1) both',
                }}
              >
                {/* Arrow outline */}
                {s.arrowOutline && (
                  <div style={{ position:'absolute', width:0, height:0, ...s.arrowOutline }} />
                )}
                {/* Arrow fill */}
                {s.arrow?.calloutSide && (
                  <div style={{ position:'absolute', width:0, height:0, ...s.arrow.calloutSide }} />
                )}
                <div style={{
                  background:'#0F3020', border:`3px solid ${s.highlight === 'preview' ? C.cyan : C.lime}`,
                  borderRadius:16, padding:'14px 16px',
                  boxShadow:`0 0 30px ${s.highlight === 'preview' ? C.cyan : C.lime}55, 0 6px 0 rgba(0,0,0,.5)`,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:24 }}>{s.icon}</span>
                    <span style={{ fontFamily:"'Fredoka One',cursive",
                      color: s.highlight === 'preview' ? C.cyan : C.lime,
                      fontSize:15, lineHeight:1.2 }}>
                      {s.title}
                    </span>
                  </div>
                  <div style={{ color:'rgba(232,255,245,.85)', fontSize:12,
                    fontWeight:600, lineHeight:1.6 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── Bottom: action buttons ── */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end',
            gap:10, flexShrink:0, paddingBottom:4 }}>
            <button onClick={skip} style={{
              background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.15)',
              borderRadius:10, padding:'10px 18px', cursor:'pointer',
              fontFamily:"'Fredoka One',cursive", color:'rgba(232,255,245,.45)', fontSize:13,
            }}>Skip</button>
            <button
              className="pi-next"
              onClick={next}
              style={{
                background: isLast
                  ? `linear-gradient(180deg,${C.orange},#E8501A)`
                  : `linear-gradient(180deg,${C.lime},#5BB832)`,
                border:'none', borderRadius:12, padding:'10px 28px',
                fontFamily:"'Fredoka One',cursive", fontSize:16,
                color: isLast ? '#fff' : '#1A3020', cursor:'pointer',
                boxShadow: isLast ? '0 5px 0 #C04A1A' : '0 5px 0 #3A8A1A',
                transition:'filter .15s, transform .12s',
              }}>
              {isLast ? "🚀 Let's Code!" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
