// frontend/src/components/lesson/CodeEditor.jsx
// IDE: editor top, live preview bottom. srcDoc updated only on Run — no cross-origin issues.
import { useState, useCallback, useEffect } from 'react';
import { getEditorDraft, setEditorDraft } from '../../utils/storage';

const C = { lime:'#7ED957', cyan:'#00C8E8', orange:'#FF6B35', muted:'#6B82A8' };
const FONT_HEAD = "'Fredoka One', cursive";
const FONT_BODY = "'Quicksand', sans-serif";

export default function CodeEditor({ starterCode = '', sessionId }) {
  const draft        = sessionId ? getEditorDraft(sessionId) : '';
  const initial      = draft || starterCode;

  const [code,       setCode]       = useState(initial);
  const [previewSrc, setPreviewSrc] = useState(initial); // only changes on Run
  const [saved,      setSaved]      = useState(false);

  // Auto-save draft after 2s of inactivity
  useEffect(() => {
    if (!sessionId) return;
    const t = setTimeout(() => {
      setEditorDraft(sessionId, code);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 2000);
    return () => clearTimeout(t);
  }, [code, sessionId]);

  const runCode = useCallback(() => {
    setPreviewSrc(code);
  }, [code]);

  function resetCode() {
    setCode(starterCode);
    setPreviewSrc(starterCode);
    if (sessionId) setEditorDraft(sessionId, starterCode);
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
      background:'#F6FEFF', fontFamily:FONT_BODY }}>

      {/* ── Toolbar ── */}
      <div style={{ background:'#fff', borderBottom:`2px solid #D8EEFF`,
        padding:'8px 16px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <span style={{ fontSize:13, color:C.muted, flex:1, fontWeight:700 }}>
          📄 index.html
          {saved && <span style={{ color:C.lime, marginLeft:10, fontSize:11 }}>✓ Saved</span>}
        </span>
        <span style={{ color:'#B0C8E0', fontSize:11, fontWeight:600 }}>Ctrl+Enter = Run</span>
        <button onClick={resetCode} style={{
          background:'#F0F8FF', border:`2px solid #C8EEFF`, borderRadius:10,
          color:C.muted, cursor:'pointer', padding:'5px 14px',
          fontFamily:FONT_BODY, fontSize:12, fontWeight:700 }}>↺ Reset</button>
        <button onClick={runCode} style={{
          background:C.lime, border:`2px solid #5CB833`,
          borderRadius:12, color:'#1A3020', cursor:'pointer',
          fontFamily:FONT_HEAD, fontSize:16, padding:'5px 22px',
          boxShadow:'0 4px 0 #5CB83366' }}>
          ▶ Run!
        </button>
      </div>

      {/* ── Editor (fills top) ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0 }}>
        <div style={{ background:'#E4F2FF', padding:'4px 16px', fontSize:11, color:C.cyan,
          fontFamily:FONT_BODY, fontWeight:700, letterSpacing:.6, flexShrink:0,
          borderBottom:`1px solid #C8EEFF` }}>EDITOR</div>
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); runCode(); } }}
          spellCheck={false}
          style={{ flex:1, background:'#0D1117', color:'#E6EDF3', border:'none',
            padding:'14px 18px', fontFamily:"'Courier New', Courier, monospace",
            fontSize:13, lineHeight:1.8, outline:'none', overflow:'auto', resize:'none',
            minHeight:0 }} />
      </div>

      {/* ── Live Preview (pinned to bottom) ── */}
      <div style={{ height:'36%', minHeight:160, display:'flex', flexDirection:'column',
        borderTop:`3px solid ${C.cyan}`, flexShrink:0, background:'#fff' }}>
        <div style={{ background:`linear-gradient(90deg,${C.cyan}20,#EBF8FF)`,
          padding:'5px 16px', fontSize:11, color:C.cyan, fontFamily:FONT_BODY,
          fontWeight:700, letterSpacing:.6, flexShrink:0,
          borderBottom:`1px solid ${C.cyan}33`,
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>👁 LIVE PREVIEW</span>
          <span style={{ color:'#B0C8E0', fontWeight:600 }}>click ▶ Run to update</span>
        </div>
        <iframe
          srcDoc={previewSrc}
          style={{ flex:1, border:'none', background:'#fff' }}
          sandbox="allow-scripts"
          title="Live preview" />
      </div>
    </div>
  );
}
