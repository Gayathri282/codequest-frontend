// frontend/src/components/lesson/CodeEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { getEditorDraft, setEditorDraft } from '../../utils/storage';

const C = { lime:'#7ED957', cyan:'#00C8E8', orange:'#FF6B35', muted:'#6B82A8', red:'#FF4757' };
const F  = { head:"'Fredoka One',cursive", body:"'Quicksand',sans-serif" };

function extColor(name = '') {
  if (/\.css$/i.test(name))   return '#7ED957';
  if (/\.js$/i.test(name))    return '#FFD700';
  if (/\.html?$/i.test(name)) return '#FF6B35';
  return '#00C8E8';
}
function extIcon(name = '') {
  if (/\.css$/i.test(name))   return '🎨';
  if (/\.js$/i.test(name))    return '⚡';
  if (/\.html?$/i.test(name)) return '🌐';
  return '📄';
}

/*  Combine all open files into one runnable HTML document.
    Rules:
    • active file if it's .html → the base page
    • if active is .css/.js → use index.html or the first .html as base
    • all OTHER .css files → injected as <style> into the base
    • all OTHER .js  files → injected as <script> into the base
    • other .html files are NOT touched (they're separate pages)           */
function buildDoc(files, activeIdx) {
  const active = files[activeIdx];
  const css    = files.filter(f => /\.css$/i.test(f.name));
  const js     = files.filter(f => /\.js$/i.test(f.name));

  // Pick the HTML base
  let base;
  if (active && /\.html?$/i.test(active.name)) {
    base = active;
  } else {
    base = files.find(f => /^index\.html?$/i.test(f.name))
        || files.find(f => /\.html?$/i.test(f.name));
  }

  if (!base) {
    // No HTML file at all — wrap everything in a minimal shell
    return [
      '<!DOCTYPE html><html><head><meta charset="utf-8"><style>',
      css.map(f => f.content).join('\n'),
      '</style></head><body>',
      active?.content || '',
      '<script>', js.map(f => f.content).join('\n'), '</script>',
      '</body></html>',
    ].join('');
  }

  let doc = base.content;

  if (css.length) {
    const block = `<style>\n${css.map(f => f.content).join('\n')}\n</style>`;
    doc = /<\/head>/i.test(doc)
      ? doc.replace(/<\/head>/i, block + '\n</head>')
      : block + '\n' + doc;
  }

  if (js.length) {
    const block = `<script>\n${js.map(f => f.content).join('\n')}\n</script>`;
    doc = /<\/body>/i.test(doc)
      ? doc.replace(/<\/body>/i, block + '\n</body>')
      : doc + '\n' + block;
  }

  return doc;
}

function loadSaved(sessionId, starterCode) {
  if (!sessionId) return [{ name:'index.html', content: starterCode || '' }];
  const raw = getEditorDraft(sessionId);
  if (Array.isArray(raw) && raw.length) return raw;
  // legacy string draft
  if (typeof raw === 'string' && raw) return [{ name:'index.html', content: raw }];
  // legacy {html,css,js} draft
  if (raw && typeof raw === 'object') {
    const out = [];
    if (raw.html) out.push({ name:'index.html',  content: raw.html });
    if (raw.css)  out.push({ name:'styles.css',  content: raw.css  });
    if (raw.js)   out.push({ name:'script.js',   content: raw.js   });
    if (out.length) return out;
  }
  return [{ name:'index.html', content: starterCode || '' }];
}

export default function CodeEditor({ starterCode = '', sessionId }) {
  const initial = () => loadSaved(sessionId, starterCode);

  const [files,     setFiles]     = useState(initial);
  const [activeIdx, setActiveIdx] = useState(0);
  const [preview,   setPreview]   = useState(() => { const f = initial(); return buildDoc(f, 0); });
  const [saved,     setSaved]     = useState(false);
  const [adding,    setAdding]    = useState(false);
  const [newName,   setNewName]   = useState('');
  const [renameIdx, setRenameIdx] = useState(null);
  const [previewFs, setPreviewFs] = useState(false);
  const newNameRef    = useRef(null);
  const previewWrap   = useRef(null);

  /* auto-save */
  useEffect(() => {
    if (!sessionId) return;
    const t = setTimeout(() => {
      setEditorDraft(sessionId, files);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 2000);
    return () => clearTimeout(t);
  }, [files, sessionId]);

  /* fullscreen sync */
  useEffect(() => {
    const h = () => setPreviewFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  /* focus new-file input */
  useEffect(() => { if (adding) newNameRef.current?.focus(); }, [adding]);

  function run() { setPreview(buildDoc(files, activeIdx)); }

  function reset() {
    const next = [{ name:'index.html', content: starterCode }];
    setFiles(next); setActiveIdx(0);
    setPreview(buildDoc(next, 0));
    if (sessionId) setEditorDraft(sessionId, next);
  }

  function updateContent(val) {
    setFiles(prev => prev.map((f, i) => i === activeIdx ? { ...f, content: val } : f));
  }

  function addFile() {
    let name = newName.trim();
    if (!name) { setAdding(false); setNewName(''); return; }
    if (!/\.\w+$/.test(name)) name += '.html';
    const exists = files.findIndex(f => f.name === name);
    if (exists >= 0) { setActiveIdx(exists); }
    else {
      const next = [...files, { name, content: '' }];
      setFiles(next);
      setActiveIdx(next.length - 1);
    }
    setAdding(false); setNewName('');
  }

  function closeFile(idx, e) {
    e.stopPropagation();
    if (files.length === 1) return;
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    setActiveIdx(Math.min(activeIdx, next.length - 1));
  }

  function commitRename(idx, val) {
    const name = val.trim();
    if (name && !files.some((f, i) => i !== idx && f.name === name)) {
      setFiles(prev => prev.map((f, i) => i === idx ? { ...f, name } : f));
    }
    setRenameIdx(null);
  }

  function togglePreviewFs() {
    if (document.fullscreenElement) document.exitFullscreen();
    else previewWrap.current?.requestFullscreen?.();
  }

  const active    = files[activeIdx] ?? files[0];
  const fileColor = extColor(active?.name);

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
      background:'#F6FEFF', fontFamily:F.body }}>

      {/* ── Tab bar ── */}
      <div style={{ background:'#fff', borderBottom:'2px solid #D8EEFF', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'flex-end', overflowX:'auto',
          padding:'6px 8px 0', gap:2 }}>

          {files.map((file, idx) => {
            const fc  = extColor(file.name);
            const act = idx === activeIdx;
            return (
              <div key={idx}
                onClick={() => { setActiveIdx(idx); setRenameIdx(null); }}
                onDoubleClick={() => setRenameIdx(idx)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px',
                  cursor:'pointer', borderRadius:'8px 8px 0 0', whiteSpace:'nowrap',
                  background: act ? `${fc}18` : 'transparent',
                  border:`2px solid ${act ? fc : '#D8EEFF'}`,
                  borderBottom: act ? '2px solid #fff' : `2px solid #D8EEFF`,
                  marginBottom: act ? -2 : 0,
                  fontSize:12, fontWeight:700, color: act ? fc : C.muted,
                }}>
                <span style={{ fontSize:13 }}>{extIcon(file.name)}</span>
                {renameIdx === idx ? (
                  <input autoFocus defaultValue={file.name}
                    style={{ border:'none', outline:'none', background:'transparent',
                      fontFamily:F.body, fontSize:12, fontWeight:700, color:fc,
                      width: Math.max(60, file.name.length * 8) }}
                    onClick={e => e.stopPropagation()}
                    onBlur={e  => commitRename(idx, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  commitRename(idx, e.target.value);
                      if (e.key === 'Escape') setRenameIdx(null);
                    }} />
                ) : <span>{file.name}</span>}
                {files.length > 1 && (
                  <span onClick={e => closeFile(idx, e)}
                    style={{ fontSize:11, color:'#bbb', lineHeight:1,
                      padding:'0 2px', cursor:'pointer' }}>×</span>
                )}
              </div>
            );
          })}

          {/* + new file */}
          {adding ? (
            <div style={{ display:'flex', alignItems:'center', padding:'5px 8px',
              border:`2px dashed ${C.cyan}`, borderRadius:'8px 8px 0 0',
              background:`${C.cyan}10`, gap:4, marginBottom:-2 }}>
              <input ref={newNameRef} value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="name.html"
                style={{ border:'none', outline:'none', background:'transparent',
                  fontFamily:F.body, fontSize:12, fontWeight:700, color:C.cyan, width:100 }}
                onBlur={addFile}
                onKeyDown={e => {
                  if (e.key === 'Enter') addFile();
                  if (e.key === 'Escape') { setAdding(false); setNewName(''); }
                }} />
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              title="Add file"
              style={{ background:'transparent', border:`2px dashed #C8EEFF`,
                borderRadius:'8px 8px 0 0', padding:'5px 12px',
                cursor:'pointer', fontSize:16, color:C.cyan,
                fontFamily:F.body, fontWeight:700, alignSelf:'flex-end' }}>+</button>
          )}

          <div style={{ flex:1 }} />
          {saved && <span style={{ color:C.lime, fontSize:11, fontWeight:700,
            alignSelf:'center', marginRight:8 }}>✓ Saved</span>}
        </div>

        {/* action row */}
        <div style={{ display:'flex', alignItems:'center', gap:8,
          padding:'4px 12px 6px', borderTop:'1px solid #E8F4FF' }}>
          <span style={{ color:'#B0C8E0', fontSize:11, fontWeight:600, flex:1 }}>
            Ctrl+Enter = Run &nbsp;·&nbsp; Double-click tab to rename
          </span>
          <button onClick={reset}
            style={{ background:'#F0F8FF', border:'2px solid #C8EEFF', borderRadius:10,
              color:C.muted, cursor:'pointer', padding:'4px 12px',
              fontFamily:F.body, fontSize:12, fontWeight:700 }}>↺ Reset</button>
          <button onClick={run}
            style={{ background:C.lime, border:'2px solid #5CB833', borderRadius:12,
              color:'#1A3020', cursor:'pointer', fontFamily:F.head,
              fontSize:15, padding:'4px 20px', boxShadow:'0 4px 0 #5CB83366' }}>
            ▶ Run!
          </button>
        </div>
      </div>

      {/* ── Editor ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
        <div style={{ background:`${fileColor}18`, padding:'3px 16px', fontSize:11,
          color:fileColor, fontFamily:F.body, fontWeight:700, letterSpacing:.6,
          flexShrink:0, borderBottom:`1px solid ${fileColor}33` }}>
          {extIcon(active?.name)} EDITOR — {active?.name}
        </div>
        <textarea
          key={activeIdx}
          value={active?.content ?? ''}
          onChange={e => updateContent(e.target.value)}
          onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); run(); } }}
          spellCheck={false}
          style={{ flex:1, background:'#0D1117', color:'#E6EDF3', border:'none',
            padding:'14px 18px', fontFamily:"'Courier New',Courier,monospace",
            fontSize:13, lineHeight:1.8, outline:'none', resize:'none', minHeight:0 }} />
      </div>

      {/* ── Preview ── */}
      <div ref={previewWrap}
        style={{ height:'36%', minHeight:160, display:'flex', flexDirection:'column',
          borderTop:`3px solid ${C.cyan}`, flexShrink:0, background:'#fff',
          ...(previewFs ? { position:'fixed', inset:0, zIndex:9999, height:'100vh' } : {}) }}>
        <div style={{ background:`linear-gradient(90deg,${C.cyan}20,#EBF8FF)`,
          padding:'5px 12px', fontSize:11, color:C.cyan, fontFamily:F.body,
          fontWeight:700, letterSpacing:.6, flexShrink:0,
          borderBottom:`1px solid ${C.cyan}33`,
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>👁 LIVE PREVIEW</span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ color:'#B0C8E0', fontSize:10, fontWeight:600 }}>▶ Run to update</span>
            <button onClick={togglePreviewFs}
              style={{ background: previewFs ? `${C.orange}22` : 'transparent',
                border:`1.5px solid ${previewFs ? C.orange : C.cyan}`,
                borderRadius:6, padding:'2px 8px', cursor:'pointer',
                fontSize:11, color: previewFs ? C.orange : C.cyan,
                fontFamily:F.body, fontWeight:700 }}>
              {previewFs ? '✕ Exit' : '⛶ Fullscreen'}
            </button>
          </div>
        </div>
        <iframe srcDoc={preview} style={{ flex:1, border:'none' }}
          sandbox="allow-scripts" title="Preview" />
      </div>
    </div>
  );
}
