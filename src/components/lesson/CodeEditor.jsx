// frontend/src/components/lesson/CodeEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { getEditorDraft, setEditorDraft } from '../../utils/storage';
import api from '../../utils/api';

const C = { lime:'#7ED957', cyan:'#00C8E8', orange:'#FF6B35', muted:'#6B82A8', red:'#FF4757' };
const F  = { head:"'Fredoka One',cursive", body:"'Quicksand',sans-serif" };

function isImage(name = '') {
  return /\.(png|jpe?g|gif|svg|webp|bmp|ico)$/i.test(name);
}
function extColor(name = '') {
  if (/\.css$/i.test(name))   return '#7ED957';
  if (/\.js$/i.test(name))    return '#FFD700';
  if (/\.html?$/i.test(name)) return '#FF6B35';
  if (isImage(name))          return '#FF61D2';
  return '#00C8E8';
}
function extIcon(name = '') {
  if (/\.css$/i.test(name))   return '🎨';
  if (/\.js$/i.test(name))    return '⚡';
  if (/\.html?$/i.test(name)) return '🌐';
  if (isImage(name))          return '🖼️';
  return '📄';
}

// Injected into every preview — intercepts link clicks and routes via postMessage
const LINK_INTERCEPTOR = [
  '<script>',
  '(function(){',
  '  document.addEventListener("click",function(e){',
  '    var a=e.target.closest("a");',
  '    if(!a)return;',
  '    var h=a.getAttribute("href");',
  '    if(!h||h[0]==="#"||h.indexOf("javascript:")===0)return;',
  '    e.preventDefault();',
  '    window.parent.postMessage({type:/^(https?:)?\\/\\//.test(h)?"cq-ext":"cq-int",href:h},"*");',
  '  },true);',
  '})();',
  '<\/script>',   // eslint-disable-line
].join('\n');

// ── Autocomplete data ────────────────────────────────────────────────────
const HTML_TAGS = [
  'a','address','article','aside','audio','b','blockquote','body','br','button',
  'canvas','caption','code','datalist','dd','details','dialog','div','dl','dt',
  'em','fieldset','figcaption','figure','footer','form',
  'h1','h2','h3','h4','h5','h6','head','header','hr','html',
  'i','iframe','img','input','label','legend','li','link',
  'main','meta','nav','ol','option','p','picture','pre','progress',
  'script','section','select','small','span','strong','style','summary',
  'table','tbody','td','textarea','tfoot','th','thead','title','tr','ul','video',
];
const SELF_CLOSE = new Set(['area','base','br','col','embed','hr','img','input',
  'link','meta','param','source','track','wbr']);
const HTML_SNIPS = {
  a:       'a href="">$C</a>',        audio:   'audio src="$C" controls></audio>',
  button:  'button>$C</button>',      canvas:  'canvas id="c" width="300" height="150">$C</canvas>',
  details: 'details>\n  <summary>$C</summary>\n</details>',
  div:     'div>$C</div>',            em:      'em>$C</em>',
  figure:  'figure>\n  <img src="$C" alt="">\n  <figcaption></figcaption>\n</figure>',
  footer:  'footer>\n  $C\n</footer>',
  form:    'form action="$C" method="post">\n</form>',
  h1:'h1>$C</h1>', h2:'h2>$C</h2>', h3:'h3>$C</h3>',
  h4:'h4>$C</h4>', h5:'h5>$C</h5>', h6:'h6>$C</h6>',
  header:  'header>\n  $C\n</header>',
  iframe:  'iframe src="$C" title="" width="600" height="400"></iframe>',
  img:     'img src="$C" alt="">',
  input:   'input type="text" placeholder="$C">',
  label:   'label for="$C"></label>',
  li:      'li>$C</li>',             link:    'link rel="stylesheet" href="$C">',
  main:    'main>\n  $C\n</main>',   meta:    'meta name="$C" content="">',
  nav:     'nav>\n  $C\n</nav>',     ol:      'ol>\n  <li>$C</li>\n</ol>',
  option:  'option value="$C"></option>',
  p:       'p>$C</p>',              pre:     'pre>$C</pre>',
  script:  'script>\n  $C\n</script>',
  section: 'section>\n  $C\n</section>',
  select:  'select name="$C">\n  <option value=""></option>\n</select>',
  span:    'span>$C</span>',         strong:  'strong>$C</strong>',
  style:   'style>\n  $C\n</style>',
  summary: 'summary>$C</summary>',
  table:   'table>\n  <thead><tr><th>$C</th></tr></thead>\n  <tbody><tr><td></td></tr></tbody>\n</table>',
  textarea:'textarea name="$C" rows="4"></textarea>',
  title:   'title>$C</title>',
  ul:      'ul>\n  <li>$C</li>\n</ul>',
  video:   'video src="$C" controls></video>',
};
const COMMON_ATTRS = ['class','id','style','title','hidden','tabindex','data-','aria-label'];
const HTML_ATTRS = {
  a:       ['href','target','rel','download','title','class','id'],
  img:     ['src','alt','width','height','loading','class','id'],
  input:   ['type','name','value','placeholder','required','disabled','readonly',
            'checked','min','max','step','pattern','class','id'],
  button:  ['type','disabled','class','id','onclick'],
  form:    ['action','method','enctype','novalidate','class','id'],
  link:    ['rel','href','type','media'],
  meta:    ['name','content','charset','http-equiv'],
  script:  ['src','type','defer','async'],
  iframe:  ['src','title','width','height','allowfullscreen'],
  video:   ['src','controls','autoplay','loop','muted','width','height','poster'],
  audio:   ['src','controls','autoplay','loop','muted'],
  select:  ['name','id','multiple','disabled','required','class'],
  textarea:['name','rows','cols','placeholder','disabled','readonly','required','class','id'],
  label:   ['for','class','id'],
  td:      ['colspan','rowspan','class'], th:['colspan','rowspan','scope','class'],
};
const CSS_PROPS = [
  'align-items','align-self','animation','animation-duration','animation-name',
  'animation-timing-function','animation-iteration-count',
  'background','background-color','background-image','background-position',
  'background-repeat','background-size',
  'border','border-bottom','border-color','border-left','border-radius',
  'border-right','border-style','border-top','border-width',
  'bottom','box-shadow','box-sizing',
  'color','content','cursor',
  'display',
  'filter','flex','flex-direction','flex-grow','flex-shrink','flex-wrap',
  'float','font','font-family','font-size','font-style','font-weight',
  'gap','grid','grid-template-columns','grid-template-rows',
  'height',
  'justify-content',
  'left','letter-spacing','line-height','list-style',
  'margin','margin-bottom','margin-left','margin-right','margin-top',
  'max-height','max-width','min-height','min-width',
  'object-fit','opacity','outline','overflow','overflow-x','overflow-y',
  'padding','padding-bottom','padding-left','padding-right','padding-top',
  'pointer-events','position',
  'right','row-gap',
  'text-align','text-decoration','text-shadow','text-transform',
  'top','transform','transition',
  'user-select','vertical-align','visibility',
  'white-space','width','word-wrap','z-index',
];
const CSS_VALUES = {
  display:           ['block','inline','inline-block','flex','inline-flex','grid','inline-grid','none','table'],
  position:          ['static','relative','absolute','fixed','sticky'],
  'flex-direction':  ['row','column','row-reverse','column-reverse'],
  'flex-wrap':       ['wrap','nowrap','wrap-reverse'],
  'justify-content': ['center','flex-start','flex-end','space-between','space-around','space-evenly'],
  'align-items':     ['center','flex-start','flex-end','stretch','baseline'],
  overflow:          ['auto','hidden','scroll','visible'],
  'overflow-x':      ['auto','hidden','scroll','visible'],
  'overflow-y':      ['auto','hidden','scroll','visible'],
  'text-align':      ['left','center','right','justify'],
  'text-decoration': ['none','underline','line-through'],
  'text-transform':  ['none','uppercase','lowercase','capitalize'],
  'font-weight':     ['bold','normal','100','200','300','400','500','600','700','800','900'],
  'font-style':      ['normal','italic'],
  'border-style':    ['solid','dashed','dotted','none','double'],
  cursor:            ['pointer','default','text','not-allowed','grab','wait','crosshair','zoom-in'],
  'box-sizing':      ['border-box','content-box'],
  'object-fit':      ['cover','contain','fill','none','scale-down'],
  visibility:        ['visible','hidden'],
  float:             ['left','right','none'],
  'white-space':     ['nowrap','normal','pre','pre-wrap'],
  'user-select':     ['none','auto','text'],
  'list-style':      ['none','disc','circle','square','decimal'],
  'background-repeat':['no-repeat','repeat','repeat-x','repeat-y'],
  'background-size':  ['cover','contain','auto'],
  'animation-timing-function':['ease','linear','ease-in','ease-out','ease-in-out'],
  'animation-iteration-count':['infinite','1','2','3'],
};
const JS_COMPLETIONS = [
  'async','await','break','case','catch','class','const','continue','debugger',
  'default','delete','do','else','export','extends','false','finally','for',
  'function','if','import','in','instanceof','let','new','null','of','return',
  'static','super','switch','this','throw','true','try','typeof','undefined',
  'var','void','while',
  'console','console.log','console.error','console.warn','console.table',
  'document','document.getElementById','document.querySelector','document.querySelectorAll',
  'document.createElement','document.addEventListener','document.body','document.head',
  'window','window.addEventListener','window.innerWidth','window.innerHeight',
  'Math','Math.random','Math.floor','Math.ceil','Math.round',
  'Math.max','Math.min','Math.abs','Math.PI','Math.sqrt','Math.pow',
  'Array','Array.from','Array.isArray','Object','Object.keys','Object.values','Object.entries',
  'String','Number','Boolean','parseInt','parseFloat','isNaN','isFinite',
  'setTimeout','setInterval','clearTimeout','clearInterval',
  'fetch','Promise','JSON','JSON.stringify','JSON.parse',
  'localStorage','localStorage.getItem','localStorage.setItem','localStorage.removeItem',
  'sessionStorage','alert','confirm','prompt',
  'addEventListener','removeEventListener','querySelector','querySelectorAll',
  'getElementById','getElementsByClassName',
  'innerHTML','textContent','innerText','value','checked','disabled',
  'className','classList','classList.add','classList.remove','classList.toggle','classList.contains',
  'id','style','parentElement','children','firstElementChild','lastElementChild',
  'appendChild','removeChild','insertBefore','remove','createElement','cloneNode',
  'setAttribute','getAttribute','removeAttribute','hasAttribute',
  'preventDefault','stopPropagation','target','currentTarget',
  'forEach','map','filter','reduce','find','findIndex','some','every',
  'push','pop','shift','unshift','splice','slice','indexOf','includes',
  'join','split','reverse','sort','length',
  'trim','replace','toUpperCase','toLowerCase','substring','startsWith','endsWith',
];

// Returns the kind's label color for the dropdown badge
function kindColor(kind) {
  if (kind === 'tag')   return '#7ED957';
  if (kind === 'attr')  return '#00C8E8';
  if (kind === 'prop')  return '#FF6B35';
  if (kind === 'value') return '#FFD700';
  if (kind === 'js')    return '#FF61D2';
  return '#B0C8E0';
}

// Approximate caret position in viewport coords (fixed dropdown placement)
function getCaretPos(ta) {
  const rect  = ta.getBoundingClientRect();
  const text  = ta.value.substring(0, ta.selectionStart);
  const lines = text.split('\n');
  const row   = lines.length - 1;
  const col   = lines[row].length;
  const LINE_H = 24;   // fontSize:13 * lineHeight:1.8 ≈ 23.4
  const CHAR_W = 7.8;  // Courier New 13px
  const PAD_T  = 14;
  const PAD_L  = 18;
  return {
    top:  Math.min(rect.top  + PAD_T + (row + 1) * LINE_H - ta.scrollTop, window.innerHeight - 250),
    left: Math.min(rect.left + PAD_L + col * CHAR_W,                      window.innerWidth  - 230),
  };
}

// Compute autocomplete suggestions based on text, cursor, and file type
function computeAC(text, pos, filename) {
  const before = text.substring(0, pos);
  const isHtml = /\.html?$/i.test(filename);
  const isCss  = /\.css$/i.test(filename);
  const isJs   = /\.js$/i.test(filename);

  // Context detection inside .html files
  let ctx = isHtml ? 'html' : isCss ? 'css' : isJs ? 'js' : 'html';
  if (isHtml) {
    const sO = before.lastIndexOf('<style'), sC = before.lastIndexOf('</style');
    const jO = before.lastIndexOf('<script'),jC = before.lastIndexOf('</script');
    if (sO > sC && sO > jO) ctx = 'css';
    else if (jO > jC)        ctx = 'js';
  }

  if (ctx === 'html') {
    // Tag name after <
    const tagM = before.match(/<([a-zA-Z]*)$/);
    if (tagM && tagM[1].length > 0) {
      const p = tagM[1].toLowerCase();
      return HTML_TAGS.filter(t => t.startsWith(p) && t !== p).slice(0, 9).map(t => ({
        label: `<${t}>`, replace: p, kind: 'tag',
        insert: HTML_SNIPS[t] || (SELF_CLOSE.has(t) ? `${t}>` : `${t}>$C</${t}>`),
      }));
    }
    // Attribute name after <tagname ...attr
    const attrM = before.match(/<(\w+)(?:\s[\w-]*(?:=(?:"[^"]*"|'[^']*'|\S*))?)*\s([\w-]*)$/);
    if (attrM) {
      const tag = attrM[1].toLowerCase();
      const p   = attrM[2].toLowerCase();
      const list = HTML_ATTRS[tag] || COMMON_ATTRS;
      return list.filter(a => a.startsWith(p) && a !== p).slice(0, 8).map(a => ({
        label: a, replace: p, kind: 'attr',
        insert: a.endsWith('-') ? a : `${a}="$C"`,
      }));
    }
  }

  if (ctx === 'css') {
    // Property name after { ; or newline
    const propM = before.match(/(?:[{;,\n]|^)\s*([\w-]+)$/);
    if (propM && propM[1].length >= 1) {
      const p = propM[1];
      return CSS_PROPS.filter(x => x.startsWith(p) && x !== p).slice(0, 9).map(x => ({
        label: x, replace: p, insert: x + ': ', kind: 'prop',
      }));
    }
    // Value after property:
    const valM = before.match(/([\w-]+)\s*:\s*([\w#%.-]*)$/);
    if (valM) {
      const vals = CSS_VALUES[valM[1]] || [];
      const p    = valM[2];
      return vals.filter(v => v.startsWith(p) && v !== p).slice(0, 8).map(v => ({
        label: v, replace: p, insert: v, kind: 'value',
      }));
    }
  }

  if (ctx === 'js') {
    const wm = before.match(/[\w$.]+$/);
    const p  = wm ? wm[0] : '';
    if (p.length < 2) return [];
    return JS_COMPLETIONS.filter(k => k.startsWith(p) && k !== p).slice(0, 9).map(k => ({
      label: k, replace: p, insert: k, kind: 'js',
    }));
  }

  return [];
}

export function buildDoc(files, activeIdx) {
  const active = files[activeIdx];
  const css    = files.filter(f => /\.css$/i.test(f.name));
  const js     = files.filter(f => /\.js$/i.test(f.name));
  const imgs   = files.filter(f => isImage(f.name) && f.content);

  let base;
  if (active && /\.html?$/i.test(active.name)) {
    base = active;
  } else {
    base = files.find(f => /^index\.html?$/i.test(f.name))
        || files.find(f => /\.html?$/i.test(f.name));
  }

  if (!base) {
    return [
      '<!DOCTYPE html><html><head><meta charset="utf-8"><style>',
      css.map(f => f.content).join('\n'),
      '</style></head><body>',
      active?.content || '',
      '<script>', js.map(f => f.content).join('\n'), '<\/script>', // eslint-disable-line
      LINK_INTERCEPTOR,
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
    const jsContent = js.map(f => f.content).join('\n');
    const block = '<script>\n' + jsContent + '\n<\/script>'; // eslint-disable-line
    doc = /<\/body>/i.test(doc)
      ? doc.replace(/<\/body>/i, block + '\n</body>')
      : doc + '\n' + block;
  }

  // Replace image src references with base64 data URLs
  for (const img of imgs) {
    const esc = img.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    doc = doc.replace(new RegExp(`(src=["'])${esc}(["'])`, 'gi'), `$1${img.content}$2`);
  }

  // Inject link interceptor
  doc = /<\/body>/i.test(doc)
    ? doc.replace(/<\/body>/i, LINK_INTERCEPTOR + '\n</body>')
    : doc + '\n' + LINK_INTERCEPTOR;

  return doc;
}

export function extractTitle(html) {
  if (!html) return null;
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : null;
}

function loadSaved(sessionId, starterCode, inheritFromSessionId) {
  if (!sessionId) return [{ name:'index.html', content: starterCode || '' }];
  let raw = getEditorDraft(sessionId);
  if (!raw && inheritFromSessionId) raw = getEditorDraft(inheritFromSessionId);
  if (Array.isArray(raw) && raw.length) return raw;
  if (typeof raw === 'string' && raw) return [{ name:'index.html', content: raw }];
  if (raw && typeof raw === 'object') {
    const out = [];
    if (raw.html) out.push({ name:'index.html', content: raw.html });
    if (raw.css)  out.push({ name:'styles.css', content: raw.css });
    if (raw.js)   out.push({ name:'script.js',  content: raw.js });
    if (out.length) return out;
  }
  return [{ name:'index.html', content: starterCode || '' }];
}

export default function CodeEditor({
  starterCode = '',
  sessionId,
  inheritFromSessionId = null,
  hidePreview = false,
  onRun = null
}) {
  const initial = () => loadSaved(sessionId, starterCode, inheritFromSessionId);

  const [files,     setFiles]     = useState(initial);
  const [activeIdx, setActiveIdx] = useState(0);
  const [preview,   setPreview]   = useState(() => { const f = initial(); return buildDoc(f, 0); });
  const [saved,     setSaved]     = useState(false);
  const [adding,    setAdding]    = useState(false);
  const [newName,   setNewName]   = useState('');
  const [renameIdx, setRenameIdx] = useState(null);
  const [previewFs, setPreviewFs] = useState(false);
  const [previewH,  setPreviewH]  = useState(36);   // % of container height
  const [previewW,  setPreviewW]  = useState(null);  // px, null = full width
  const [isDragging, setIsDragging] = useState(null); // null | 'v' | 'h'
  // Autocomplete
  const [acList, setAcList] = useState([]);
  const [acIdx,  setAcIdx]  = useState(0);
  const [acPos,  setAcPos]  = useState({ top: 0, left: 0 });

  const newNameRef    = useRef(null);
  const containerRef  = useRef(null);
  const previewWrap   = useRef(null);
  const previewArea   = useRef(null);
  const textareaRef   = useRef(null);
  const pendingCursor = useRef(null); // cursor position to restore after AC insertion
  const remoteLoaded  = useRef(false);

  // Reset state when switching sessions
  useEffect(() => {
    remoteLoaded.current = false;
    const next = loadSaved(sessionId, starterCode, inheritFromSessionId);
    setFiles(next);
    setActiveIdx(0);
    const doc = buildDoc(next, 0);
    setPreview(doc);
    if (onRun) onRun(doc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

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

  // Remote load (cross-device) — only if this session has no local draft yet.
  useEffect(() => {
    if (!sessionId) return;
    if (remoteLoaded.current) return;
    if (getEditorDraft(sessionId)) { remoteLoaded.current = true; return; }

    let cancelled = false;
    api.get(`/editor/draft/${sessionId}`, { params: { inherit: 1 } })
      .then(res => {
        const remoteFiles = res.data?.files;
        if (cancelled) return;
        if (Array.isArray(remoteFiles) && remoteFiles.length) {
          setFiles(remoteFiles);
          setActiveIdx(0);
          const doc = buildDoc(remoteFiles, 0);
          setPreview(doc);
          if (onRun) onRun(doc);
          setEditorDraft(sessionId, remoteFiles);
        }
      })
      .catch(() => {})
      .finally(() => { remoteLoaded.current = true; });

    return () => { cancelled = true; };
  }, [sessionId, onRun]);

  // Remote save (cross-device) — debounced
  // In CodeEditor.jsx, change the remote save effect:
useEffect(() => {
  if (!sessionId) return;
  const t = setTimeout(() => {
    api.put(`/editor/draft/${sessionId}`, { files })
      .catch(err => console.log('Draft save error:', err.response?.data));
  }, 6000);
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

  /* fire initial preview to parent on mount */
  useEffect(() => {
  const t = setTimeout(() => {
    if (onRun) onRun(buildDoc(initial(), 0));
  }, 100);
  return () => clearTimeout(t);
}, []);

  /* link interception from preview iframe — handles both inline and split preview */
  useEffect(() => {
    function onMsg(e) {
      if (e.data?.type === 'cq-ext') {
        window.open(e.data.href, '_blank', 'noopener,noreferrer');
      } else if (e.data?.type === 'cq-int') {
        const fname = (e.data.href || '').split('?')[0].split('#')[0];
        const idx = files.findIndex(f => f.name === fname);
        if (idx >= 0) {
          setActiveIdx(idx);
          const doc = buildDoc(files, idx);
          setPreview(doc);
          if (onRun) onRun(doc);
        }
      }
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [files, onRun]);

  function run() {
    const doc = buildDoc(files, activeIdx);
    setPreview(doc);
    if (onRun) onRun(doc);
  }

  function reset() {
    const next = [{ name:'index.html', content: starterCode }];
    setFiles(next); setActiveIdx(0);
    const doc = buildDoc(next, 0);
    setPreview(doc);
    if (sessionId) setEditorDraft(sessionId, next);
    if (onRun) onRun(doc);
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

  function openInNewTab() {
    const blob = new Blob([preview], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /* Vertical drag: resize editor vs preview height.
     A fixed full-screen overlay is mounted while dragging so the iframe
     cannot steal mouse events (which would make the drag appear to trigger on hover). */
  function onVDragStart(e) {
    e.preventDefault();
    setIsDragging('v');
    const totalH = containerRef.current?.getBoundingClientRect().height || 1;
    const startY = e.clientY;
    const startH = previewH;
    function onMove(ev) {
      const delta = startY - ev.clientY;
      setPreviewH(Math.max(15, Math.min(75, startH + (delta / totalH) * 100)));
    }
    function onUp() {
      setIsDragging(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  /* Horizontal drag: simulate different viewport widths for responsivity testing. */
  function onHDragStart(e) {
    e.preventDefault();
    setIsDragging('h');
    const areaW  = previewArea.current?.getBoundingClientRect().width || 1;
    const startX = e.clientX;
    const startW = previewW !== null ? previewW : areaW;
    function onMove(ev) {
      const newW = Math.max(280, Math.min(areaW - 12, startW + (ev.clientX - startX)));
      setPreviewW(Math.round(newW));
    }
    function onUp() {
      setIsDragging(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setFiles(prev => prev.map((f, i) =>
        i === activeIdx ? { ...f, content: ev.target.result } : f
      ));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  // Restore cursor position after AC text insertion (runs after every render)
  useEffect(() => {
    if (pendingCursor.current !== null && textareaRef.current) {
      textareaRef.current.selectionStart = pendingCursor.current;
      textareaRef.current.selectionEnd   = pendingCursor.current;
      pendingCursor.current = null;
    }
  });

  // Apply an autocomplete suggestion: replace partial word and set cursor at $C marker
  function applyAC(sug) {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos    = ta.selectionStart;
    const val    = ta.value;
    const before = val.substring(0, pos - sug.replace.length);
    const after  = val.substring(pos);
    let ins      = sug.insert;
    const cursorOff = ins.indexOf('$C');
    ins = ins.replace('$C', '');
    updateContent(before + ins + after);
    setAcList([]);
    setAcIdx(0);
    pendingCursor.current = before.length + (cursorOff >= 0 ? cursorOff : ins.length);
  }

  // Textarea onChange: update file content + recompute autocomplete
  function handleEditorChange(e) {
    const val = e.target.value;
    updateContent(val);
    const pos  = e.target.selectionStart;
    const list = computeAC(val, pos, active?.name || '');
    setAcList(list);
    setAcIdx(0);
    if (list.length > 0) setAcPos(getCaretPos(e.target));
  }

  // Textarea onKeyDown: AC navigation + existing shortcuts
  function handleEditorKeyDown(e) {
    if (acList.length > 0) {
      if (e.key === 'ArrowDown')  { e.preventDefault(); setAcIdx(i => (i + 1) % acList.length); return; }
      if (e.key === 'ArrowUp')    { e.preventDefault(); setAcIdx(i => (i - 1 + acList.length) % acList.length); return; }
      if (e.key === 'Tab')        { e.preventDefault(); applyAC(acList[acIdx]); return; }
      if (e.key === 'Enter')      { e.preventDefault(); applyAC(acList[acIdx]); return; }
      if (e.key === 'Escape')     { setAcList([]); return; }
    }
    // Tab with no AC → soft indent (2 spaces)
    if (e.key === 'Tab' && acList.length === 0) {
      e.preventDefault();
      const ta = e.target;
      const s  = ta.selectionStart;
      const newVal = ta.value.substring(0, s) + '  ' + ta.value.substring(ta.selectionEnd);
      updateContent(newVal);
      pendingCursor.current = s + 2;
      return;
    }
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); run(); }
  }

  const active       = files[activeIdx] ?? files[0];
  const fileColor    = extColor(active?.name);
  const activeIsImg  = isImage(active?.name);
  const pageTitle    = extractTitle(preview);

  return (
    <div ref={containerRef} style={{ flex:1, display:'flex', flexDirection:'column',
      overflow:'hidden', background:'#F6FEFF', fontFamily:F.body }}>

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
                placeholder="styles.css / app.js / photo.png"
                style={{ border:'none', outline:'none', background:'transparent',
                  fontFamily:F.body, fontSize:12, fontWeight:700, color:C.cyan, width:180 }}
                onBlur={addFile}
                onKeyDown={e => {
                  if (e.key === 'Enter') addFile();
                  if (e.key === 'Escape') { setAdding(false); setNewName(''); }
                }} />
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              title="Add file — HTML, CSS, JS, or image"
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
            Ctrl+Enter = Run &nbsp;·&nbsp; Tab = autocomplete &nbsp;·&nbsp; Double-click tab to rename
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

        {activeIsImg ? (
          /* Image file: upload area + preview */
          <div style={{ flex:1, background:'#0D1117', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:16, padding:24, minHeight:0 }}>
            {active?.content
              ? <img src={active.content} alt={active.name}
                  style={{ maxWidth:'80%', maxHeight:'55%', borderRadius:8,
                    border:'2px solid #30363D', objectFit:'contain' }} />
              : <div style={{ fontSize:64, opacity:.4 }}>🖼️</div>
            }
            <label style={{
              display:'inline-block',
              background: active?.content ? '#21262D' : C.cyan,
              border:`2px solid ${active?.content ? '#30363D' : '#5BB833'}`,
              borderRadius:10, padding:'8px 22px', cursor:'pointer',
              fontFamily:F.head, fontSize:14,
              color: active?.content ? '#E6EDF3' : '#041A0E',
            }}>
              {active?.content ? '🔄 Replace Image' : '📁 Upload Image'}
              <input type="file" accept="image/*" style={{ display:'none' }}
                onChange={handleImageUpload} />
            </label>
            {active?.content && (
              <span style={{ color:'#6B82A8', fontSize:11 }}>
                {active.name} · reference this filename in your HTML src attribute
              </span>
            )}
          </div>
        ) : (
          /* Code editor: textarea + floating autocomplete dropdown */
          <div style={{ flex:1, position:'relative', minHeight:0 }}>
            <textarea
              ref={textareaRef}
              key={activeIdx}
              value={active?.content ?? ''}
              onChange={handleEditorChange}
              onKeyDown={handleEditorKeyDown}
              onBlur={() => setTimeout(() => setAcList([]), 120)}
              spellCheck={false}
              style={{ width:'100%', height:'100%', background:'#0D1117', color:'#E6EDF3',
                border:'none', padding:'14px 18px',
                fontFamily:"'Courier New',Courier,monospace",
                fontSize:13, lineHeight:1.8, outline:'none', resize:'none',
                boxSizing:'border-box' }} />

            {/* ── Autocomplete dropdown ── */}
            {acList.length > 0 && (
              <div
                onMouseDown={e => e.preventDefault()}
                style={{ position:'fixed', top:acPos.top, left:acPos.left,
                  zIndex:10001, background:'#161B22',
                  border:'1.5px solid #388BFD', borderRadius:8,
                  boxShadow:'0 8px 32px rgba(0,0,0,0.7)',
                  minWidth:200, maxWidth:340, maxHeight:228, overflowY:'auto',
                  fontFamily:"'Courier New',Courier,monospace",
                }}>
                {/* Header hint */}
                <div style={{ padding:'3px 10px', fontSize:9, color:'#6A8A9A',
                  borderBottom:'1px solid #21262D', fontFamily:F.body, letterSpacing:.5 }}>
                  ↑↓ navigate &nbsp;·&nbsp; Tab / Enter = accept &nbsp;·&nbsp; Esc = dismiss
                </div>
                {acList.map((s, i) => (
                  <div key={i}
                    onClick={() => applyAC(s)}
                    onMouseEnter={() => setAcIdx(i)}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px',
                      background: i === acIdx ? '#1F4070' : 'transparent',
                      cursor:'pointer', fontSize:12,
                      color: i === acIdx ? '#E6EDF3' : '#B0C8D0',
                      borderBottom:'1px solid rgba(255,255,255,0.04)',
                    }}>
                    <span style={{ fontSize:9, fontFamily:F.body, fontWeight:700,
                      color: kindColor(s.kind),
                      background:`${kindColor(s.kind)}22`,
                      borderRadius:3, padding:'1px 5px',
                      minWidth:32, textAlign:'center', flexShrink:0,
                    }}>{s.kind}</span>
                    <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis',
                      whiteSpace:'nowrap' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-screen drag overlay — covers iframes so they cannot steal mouse events
          during an active drag. Mounted only while the user holds the mouse button. */}
      {isDragging && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          cursor: isDragging === 'v' ? 'ns-resize' : 'ew-resize',
        }} />
      )}

      {/* ── Inline Preview (hidden when parent controls it) ── */}
      {!hidePreview && (
        <>
          {/* Vertical drag handle — drag up to grow preview, down to shrink */}
          <div
            onMouseDown={onVDragStart}
            title="Drag to resize preview height"
            style={{ height:8, cursor:'ns-resize', flexShrink:0, userSelect:'none',
              background:`${C.cyan}18`, borderTop:`2px solid ${C.cyan}55`,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:48, height:3, borderRadius:2, background:`${C.cyan}66` }} />
          </div>

          <div ref={previewWrap}
            style={{ height:`${previewH}%`, display:'flex', flexDirection:'column',
              flexShrink:0, background:'#fff',
              ...(previewFs ? { position:'fixed', inset:0, zIndex:9999, height:'100vh' } : {}) }}>

            {/* Preview toolbar */}
            <div style={{ background:`linear-gradient(90deg,${C.cyan}20,#EBF8FF)`,
              padding:'5px 10px', fontSize:11, color:C.cyan, fontFamily:F.body,
              fontWeight:700, letterSpacing:.5, flexShrink:0,
              borderBottom:`1px solid ${C.cyan}33`,
              display:'flex', alignItems:'center', gap:6, overflow:'hidden' }}>
              <span style={{ whiteSpace:'nowrap' }}>👁 PREVIEW</span>
              {pageTitle
                ? <span style={{ color:'#3A7A8A', fontSize:10, fontWeight:600,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                    — {pageTitle}
                  </span>
                : <div style={{ flex:1 }} />
              }
              {previewW !== null && <>
                <span style={{ color:'#B0C8E0', fontSize:10, fontWeight:700, whiteSpace:'nowrap' }}>
                  📐 {previewW}px
                </span>
                <button onClick={() => setPreviewW(null)}
                  style={{ background:'transparent', border:`1px solid #B0C8E0`,
                    borderRadius:4, padding:'1px 5px', cursor:'pointer',
                    fontSize:9, color:'#B0C8E0', fontFamily:F.body }}>Full</button>
              </>}
              <span style={{ color:'#B0C8E0', fontSize:10, whiteSpace:'nowrap' }}>▶ Run to update</span>
              <button onClick={openInNewTab} title="Open preview in new browser tab"
                style={{ background:'transparent', border:`1.5px solid ${C.orange}`,
                  borderRadius:6, padding:'2px 7px', cursor:'pointer',
                  fontSize:10, color:C.orange, fontFamily:F.body, fontWeight:700,
                  whiteSpace:'nowrap' }}>↗ New Tab</button>
              <button
                onClick={() => {
                  if (document.fullscreenElement) document.exitFullscreen();
                  else previewWrap.current?.requestFullscreen?.();
                }}
                style={{ background: previewFs ? `${C.orange}22` : 'transparent',
                  border:`1.5px solid ${previewFs ? C.orange : C.cyan}`,
                  borderRadius:6, padding:'2px 7px', cursor:'pointer',
                  fontSize:10, color: previewFs ? C.orange : C.cyan,
                  fontFamily:F.body, fontWeight:700, whiteSpace:'nowrap' }}>
                {previewFs ? '✕ Exit' : '⛶ Full'}
              </button>
            </div>

            {/* Preview content area with horizontal viewport-width drag */}
            <div ref={previewArea}
              style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
              <iframe srcDoc={preview}
                style={{ height:'100%', border:'none',
                  ...(previewW !== null
                    ? { width:previewW, flex:'none' }
                    : { flex:1 }) }}
                sandbox="allow-scripts allow-forms allow-modals"
                title="Preview" />

              {/* Horizontal drag handle — always on the right edge of the iframe */}
              <div
                onMouseDown={onHDragStart}
                title="Drag left/right to simulate different screen widths"
                style={{ width:8, flexShrink:0, cursor:'ew-resize', userSelect:'none',
                  background: previewW !== null ? `${C.cyan}44` : `${C.cyan}18`,
                  borderLeft:`2px solid ${C.cyan}44`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  ...(previewW === null
                    ? { position:'absolute', right:0, top:0, bottom:0 }
                    : {}) }}>
                <div style={{ width:3, height:32, borderRadius:2, background:`${C.cyan}99` }} />
              </div>

              {/* Dead zone — hatched area representing outside the simulated viewport */}
              {previewW !== null && (
                <div style={{ flex:1, minWidth:0,
                  backgroundImage:'repeating-linear-gradient(45deg,#e8eef4 0,#e8eef4 10px,#f0f4f8 10px,#f0f4f8 20px)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#B0C8E0', fontSize:9, fontWeight:700, letterSpacing:.5,
                    writingMode:'vertical-lr', transform:'rotate(180deg)' }}>
                    OUTSIDE VIEWPORT
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
