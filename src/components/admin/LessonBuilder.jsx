// frontend/src/components/admin/LessonBuilder.jsx
// Full lesson/session builder for any course
// Supports: VIDEO | DOCUMENT | QUIZ | CODE | BOSS

import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import Btn from '../shared/Btn';
import XpBar from '../shared/XpBar';
import CodeEditor from '../lesson/CodeEditor';

const C = {
  orange: '#FF6B35', cyan: '#00C8E8', pink: '#FF4FCB',
  lime: '#7ED957',   purple: '#9B59B6', red: '#FF4757',
  yellow: '#FFD700', muted: '#6B82A8', txt: '#1A2340',
};

const SESSION_TYPES = [
  { id: 'VIDEO',    label: '🎬 Video Lesson',   color: C.cyan,   desc: 'Video + optional live code IDE' },
  { id: 'DOCUMENT', label: '📄 Reading / Notes', color: C.purple, desc: 'Text, markdown, diagrams' },
  { id: 'QUIZ',     label: '🎯 Quiz',            color: C.orange, desc: 'Multiple-choice questions' },
  { id: 'CODE',     label: '💻 Code Challenge',  color: C.lime,   desc: 'Code editor only, no video' },
  { id: 'BOSS',     label: '👑 Boss Level',      color: C.pink,   desc: 'Final challenge — unlocks next course' },
];

const EMPTY_FORM = {
  title: '', type: 'VIDEO', durationMins: 5, xpReward: 50, coinsReward: 5,
  videoUrl: '', videoThumb: '', hasIde: true, missionText: '',
  docContent: '', starterCode: '', starterFiles: null, solutionCode: '',
};

const inp = {
  width: '100%', padding: '11px 16px', borderRadius: 16,
  border: '3px solid #C8EEFF', fontSize: 13,
  fontFamily: "'Nunito', sans-serif", background: '#fff',
  outline: 'none', boxSizing: 'border-box', color: C.txt,
  boxShadow: '0 4px 0 #C8EEFF',
};
const lbl = {
  fontSize: 12, color: C.orange, fontWeight: 800,
  display: 'block', marginBottom: 5, letterSpacing: .4,
};

/* ── Video upload + URL field ── */
function VideoUploadField({ videoUrl, onChange }) {
  const fileRef   = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [uploadErr, setUploadErr] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadErr(''); setProgress(0);
    try {
      const fd = new FormData();
      fd.append('video', file);
      fd.append('title', file.name.replace(/\.[^.]+$/, ''));

      // Use XMLHttpRequest so we can show real upload progress
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${import.meta.env.VITE_API_URL || ''}/video/upload`);
        const token = localStorage.getItem('cq_token');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.upload.onprogress = ev => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (_) { reject(new Error('Upload failed')); }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
      });

      if (result.embedUrl) {
        onChange(result.embedUrl);
      } else {
        setUploadErr(result.error || 'Upload failed — no embed URL returned');
      }
    } catch (err) {
      setUploadErr(err.message || 'Upload failed');
    } finally {
      setUploading(false); setProgress(0);
      e.target.value = '';
    }
  }

  const hasBunny = videoUrl && videoUrl.includes('mediadelivery.net');

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>Video</label>

      {/* Upload button */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            background: uploading ? '#f0f0f0' : `${C.cyan}22`,
            border: `2px solid ${uploading ? '#ccc' : C.cyan}`,
            borderRadius: 12, padding: '8px 18px', cursor: uploading ? 'wait' : 'pointer',
            fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 700,
            color: uploading ? C.muted : C.cyan, whiteSpace: 'nowrap',
          }}>
          {uploading ? `⏳ Uploading ${progress}%…` : '📤 Upload Video File'}
        </button>
        <span style={{ color: C.muted, fontSize: 12, fontWeight: 600 }}>
          mp4 / mov / webm up to 2 GB
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/avi,video/x-matroska"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>

      {/* Progress bar */}
      {uploading && (
        <div style={{ height: 8, background: '#E0F4FF', borderRadius: 6, marginBottom: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 6,
            background: `linear-gradient(90deg,${C.cyan},${C.lime})`,
            width: `${progress}%`, transition: 'width .3s',
          }} />
        </div>
      )}

      {uploadErr && (
        <div style={{ color: C.red, fontSize: 12, marginBottom: 8, fontWeight: 700 }}>
          ⚠️ {uploadErr}
        </div>
      )}

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, height: 1, background: '#D8EEFF' }} />
        <span style={{ color: C.muted, fontSize: 11, fontWeight: 700 }}>OR PASTE URL</span>
        <div style={{ flex: 1, height: 1, background: '#D8EEFF' }} />
      </div>

      {/* URL input */}
      <input
        style={inp}
        placeholder="https://www.youtube.com/watch?v=...  or  https://iframe.mediadelivery.net/embed/..."
        value={videoUrl}
        onChange={e => onChange(e.target.value)}
      />

      {/* Preview / status */}
      {videoUrl && (
        <div style={{
          marginTop: 8, padding: '6px 12px', borderRadius: 10,
          background: hasBunny ? `${C.lime}18` : `${C.cyan}18`,
          border: `1.5px solid ${hasBunny ? C.lime : C.cyan}44`,
          fontSize: 11, color: hasBunny ? '#2a6a2a' : '#1a4a6a',
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {hasBunny ? '🐰 Bunny.net video ready' : '🔗 External URL set'}
          <span style={{ fontWeight: 400, wordBreak: 'break-all' }}>{videoUrl}</span>
        </div>
      )}
    </div>
  );
}

export default function LessonBuilder({ courseId, courseTitle = "Course", courseName, onEditQuiz }) {
  const [sessions, setSessions]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [showAdd,  setShowAdd]    = useState(false);
  const [editId,   setEditId]     = useState(null);
  const [form,     setForm]       = useState(EMPTY_FORM);
  const [saving,   setSaving]     = useState(false);
  const [error,    setError]      = useState('');

  const useStarterFiles = Array.isArray(form.starterFiles) && form.starterFiles.length > 0;

  useEffect(() => {
    if (!courseId) {
      setSessions([]);
      setLoading(false);
      setError('No course selected (missing courseId). Go back and pick a course.');
      return;
    }
    setError('');
    loadSessions();
  }, [courseId]);

  async function loadSessions() {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await api.get(`/courses/${courseId}`);
      setSessions((res.data.sessions || []).sort((a, b) => a.order - b.order));
    } catch { setError('Failed to load sessions'); }
    finally { setLoading(false); }
  }

  function startEdit(session) {
    setEditId(session._id || session.id);
    setForm({
      title:        session.title       || '',
      type:         session.type        || 'VIDEO',
      durationMins: session.durationMins|| 5,
      xpReward:     session.xpReward    || 50,
      coinsReward:  session.coinsReward || 5,
      videoUrl:     session.videoUrl    || '',
      videoThumb:   session.videoThumb  || '',
      hasIde:       session.hasIde      ?? true,
      missionText:  session.missionText || '',
      docContent:   session.docContent  || '',
      starterCode:  session.starterCode || '',
      starterFiles: session.starterFiles || null,
      solutionCode: session.solutionCode|| '',
    });
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelForm() {
    setShowAdd(false); setEditId(null);
    setForm(EMPTY_FORM); setError('');
  }

  async function saveSession() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!courseId) { setError('Missing courseId. Go back and select a course first.'); return; }
    console.log('courseId:', courseId);  // ← add this line
    console.log('form:', form);
    setSaving(true); setError('');
    try {
      if (editId) {
        const res = await api.patch(`/sessions/${editId}`, form);
        setSessions(s => s.map(x => ((x._id || x.id) === editId ? res.data : x)));
      } else {
        const nextOrder = sessions.length + 1;
        const res = await api.post('/sessions', { ...form, courseId, order: nextOrder, isPublished: false });
        setSessions(s => [...s, res.data]);
      }
      cancelForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  }

  async function deleteSession(id) {
    if (!confirm('Delete this session?')) return;
    try {
      await api.delete(`/sessions/${id}`);
      setSessions(s => s.filter(x => ((x._id || x.id) !== id)));
    } catch { setError('Delete failed'); }
  }

  async function togglePublish(session) {
    try {
      const id = session._id || session.id;
      const res = await api.patch(`/sessions/${id}`, { isPublished: !session.isPublished });
      setSessions(s => s.map(x => ((x._id || x.id) === id ? res.data : x)));
    } catch { setError('Update failed'); }
  }

  async function moveSession(idx, dir) {
    const arr = [...sessions];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    const reordered = arr.map((s, i) => ({ ...s, order: i + 1 }));
    setSessions(reordered);
    try {
      await api.patch('/sessions/reorder/bulk', reordered.map(s => ({ id: s._id || s.id, order: s.order })));
    } catch { setError('Reorder failed — refresh to sync'); }
  }

  const typeConf = t => SESSION_TYPES.find(x => x.id === t) || SESSION_TYPES[0];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, fontSize: 40, color: C.muted }}>⏳ Loading sessions…</div>
  );

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: 30, color: C.orange,
            textShadow: `2px 3px 0 ${C.orange}33` }}>
            📚 Session Builder
          </div>
          <div style={{ color: C.muted, fontSize: 13 }}>
            {courseName} · {sessions.length} sessions ·{' '}
            {sessions.filter(s => s.isPublished).length} published
          </div>
        </div>
        <Btn onClick={() => { cancelForm(); setShowAdd(v => !v); }} color={C.cyan} sm>
          {showAdd ? '✕ Cancel' : '+ Add Session'}
        </Btn>
      </div>

      {error && (
        <div style={{ background: '#FFEEEE', border: `2px solid ${C.red}`, borderRadius: 10,
          padding: '10px 14px', color: C.red, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}

      {/* ── ADD / EDIT FORM ── */}
      {showAdd && (
        <div style={{ background: `linear-gradient(135deg,${C.cyan}14,#FAFFFF)`, border: `4px solid ${C.cyan}`, borderRadius: 26,
          padding: 26, marginBottom: 24, boxShadow: `0 10px 0 ${C.cyan}55` }}>

          <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: 24, color: C.cyan, marginBottom: 20,
            textShadow: `2px 2px 0 ${C.cyan}33` }}>
            {editId ? '✏️ Edit Session' : '➕ New Session'}
          </div>

          {/* Session type picker */}
          <div style={{ marginBottom: 18 }}>
            <span style={lbl}>Session Type</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SESSION_TYPES.map(t => (
                <div key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))} style={{
                  background: form.type === t.id ? `${t.color}22` : '#fff',
                  border: `3px solid ${form.type === t.id ? t.color : '#C8EEFF'}`,
                  borderRadius: 14, padding: '10px 16px', cursor: 'pointer',
                  boxShadow: form.type === t.id ? `0 4px 0 ${t.color}66` : '0 2px 0 #D8EEF8',
                  transition: 'all .15s', flex: '1 1 auto', minWidth: 110,
                }}>
                  <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: 14,
                    color: form.type === t.id ? t.color : C.txt }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Common fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Session Title *</label>
              <input style={inp} placeholder="e.g. Colors & Backgrounds"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Duration (min)</label>
              <input style={inp} type="number" min={1} max={60}
                value={form.durationMins} onChange={e => setForm(f => ({ ...f, durationMins: +e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>XP Reward</label>
              <input style={inp} type="number" min={0}
                value={form.xpReward} onChange={e => setForm(f => ({ ...f, xpReward: +e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Coins Reward</label>
              <input style={inp} type="number" min={0}
                value={form.coinsReward} onChange={e => setForm(f => ({ ...f, coinsReward: +e.target.value }))} />
            </div>
          </div>

          {/* VIDEO fields */}
          {(form.type === 'VIDEO' || form.type === 'BOSS') && (
            <>
              <VideoUploadField
                videoUrl={form.videoUrl}
                onChange={url => setForm(f => ({ ...f, videoUrl: url }))}
              />
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Thumbnail Image URL (optional)</label>
                <input style={inp} placeholder="https://your-cdn.com/thumb.jpg"
                  value={form.videoThumb} onChange={e => setForm(f => ({ ...f, videoThumb: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Mission / Instructions (shown next to the video)</label>
                <textarea style={{ ...inp, height: 90 }}
                  placeholder="e.g. 1. Watch the video&#10;2. Change the background color in the editor&#10;3. Try color: tomato; on the h1 tag"
                  value={form.missionText} onChange={e => setForm(f => ({ ...f, missionText: e.target.value }))} />
              </div>
              {/* IDE toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div onClick={() => setForm(f => ({ ...f, hasIde: !f.hasIde }))} style={{
                  width: 50, height: 28, borderRadius: 14,
                  background: form.hasIde ? C.lime : '#D0E4F0',
                  border: `2px solid ${form.hasIde ? C.lime : '#C8EEFF'}`,
                  position: 'relative', cursor: 'pointer', transition: 'all .2s'
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2,
                    left: form.hasIde ? 26 : 4, transition: 'left .2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,.2)'
                  }} />
                </div>
                <span style={{ color: C.txt, fontWeight: 700, fontSize: 14 }}>
                  💻 Show live Code IDE alongside this video
                </span>
              </div>
              {form.hasIde && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>Starter (for IDE)</label>
                    <Btn
                      sm
                      color={useStarterFiles ? C.lime : '#EEF4FF'}
                      textColor={useStarterFiles ? C.txt : C.purple}
                      onClick={() => setForm(f => ({
                        ...f,
                        starterFiles: useStarterFiles
                          ? null
                          : (Array.isArray(f.starterFiles) && f.starterFiles.length
                            ? f.starterFiles
                            : [{ name: 'index.html', content: f.starterCode || '' }]),
                      }))}
                    >
                      {useStarterFiles ? 'Multi-file: ON' : 'Multi-file: OFF'}
                    </Btn>
                  </div>

                  {useStarterFiles ? (
                    <div style={{ marginBottom: 12, border: `2px solid ${C.cyan}33`, borderRadius: 16, overflow: 'hidden' }}>
                      <CodeEditor
                        key={`starter-${editId || 'new'}`}
                        starterCode={form.starterCode || ''}
                        starterFiles={form.starterFiles}
                        sessionId={null}
                        onFilesChange={files => setForm(f => ({ ...f, starterFiles: files }))}
                      />
                      <div style={{ padding: '8px 12px', fontSize: 11, color: C.muted, background: '#F7FCFF' }}>
                        Tip: add `styles.css`, `script.js`, and images like `cat.jpg` (upload as Data URL).
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>Starter Code (single file)</label>
                      <textarea style={{ ...inp, height: 140, fontFamily: 'monospace', fontSize: 12, background: '#0D1117', color: '#C9D1D9', lineHeight: 1.6 }}
                        placeholder="<!DOCTYPE html>&#10;<html>&#10;  <body>&#10;    <!-- Student codes along here -->&#10;  </body>&#10;</html>"
                        value={form.starterCode} onChange={e => setForm(f => ({ ...f, starterCode: e.target.value }))} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* DOCUMENT fields */}
          {form.type === 'DOCUMENT' && (
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Content (supports Markdown)</label>
              <textarea style={{ ...inp, height: 160, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }}
                placeholder="# Heading&#10;&#10;Write your lesson content here...&#10;&#10;## HTML Tags&#10;```html&#10;<h1>Hello</h1>&#10;```"
                value={form.docContent} onChange={e => setForm(f => ({ ...f, docContent: e.target.value }))} />
            </div>
          )}

          {/* CODE / BOSS starter code */}
          {(form.type === 'CODE' || form.type === 'BOSS') && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Mission / Instructions for the student</label>
                <textarea style={{ ...inp, height: 80 }}
                  placeholder="Describe the challenge..."
                  value={form.missionText} onChange={e => setForm(f => ({ ...f, missionText: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                <label style={{ ...lbl, marginBottom: 0 }}>Starter</label>
                <Btn
                  sm
                  color={useStarterFiles ? C.lime : '#EEF4FF'}
                  textColor={useStarterFiles ? C.txt : C.purple}
                  onClick={() => setForm(f => ({
                    ...f,
                    starterFiles: useStarterFiles
                      ? null
                      : (Array.isArray(f.starterFiles) && f.starterFiles.length
                        ? f.starterFiles
                        : [{ name: 'index.html', content: f.starterCode || '' }]),
                  }))}
                >
                  {useStarterFiles ? 'Multi-file: ON' : 'Multi-file: OFF'}
                </Btn>
              </div>

              {useStarterFiles ? (
                <div style={{ marginBottom: 12, border: `2px solid ${C.cyan}33`, borderRadius: 16, overflow: 'hidden' }}>
                  <CodeEditor
                    key={`starter-${editId || 'new'}`}
                    starterCode={form.starterCode || ''}
                    starterFiles={form.starterFiles}
                    sessionId={null}
                    onFilesChange={files => setForm(f => ({ ...f, starterFiles: files }))}
                  />
                  <div style={{ padding: '8px 12px', fontSize: 11, color: C.muted, background: '#F7FCFF' }}>
                    Tip: use `index.html`, `styles.css`, `script.js`, and images; the preview auto-inlines CSS/JS and replaces `src=&quot;file.png&quot;` with the image Data URL.
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>Starter Code (single file)</label>
                  <textarea style={{ ...inp, height: 140, fontFamily: 'monospace', fontSize: 12, background: '#0D1117', color: '#C9D1D9', lineHeight: 1.6 }}
                    placeholder="<!DOCTYPE html>&#10;<html>&#10;  <body>&#10;    <!-- Student completes this -->&#10;  </body>&#10;</html>"
                    value={form.starterCode} onChange={e => setForm(f => ({ ...f, starterCode: e.target.value }))} />
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Solution Code (admin reference only — never shown to student)</label>
                <textarea style={{ ...inp, height: 100, fontFamily: 'monospace', fontSize: 12, background: '#0D1117', color: '#C9D1D9', lineHeight: 1.6 }}
                  placeholder="The correct solution..."
                  value={form.solutionCode} onChange={e => setForm(f => ({ ...f, solutionCode: e.target.value }))} />
              </div>
            </>
          )}

          {/* QUIZ hint */}
          {form.type === 'QUIZ' && (
            <div style={{ background: `${C.orange}18`, border: `2px solid ${C.orange}44`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 14,
              color: C.muted, fontSize: 13 }}>
              💡 Save this session first — then click "🎯 Questions" on the session card to add questions.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={cancelForm} color="#EEE" textColor={C.muted} sm>Cancel</Btn>
            <Btn onClick={saveSession} color={C.cyan} sm disabled={saving || !form.title.trim()}>
              {saving ? '⏳ Saving…' : editId ? '✓ Update Session' : '✓ Add to Course'}
            </Btn>
          </div>
        </div>
      )}

      {/* ── SESSION LIST ── */}
      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16 }}>No sessions yet. Click <strong>+ Add Session</strong> to start!</div>
        </div>
      ) : (
        sessions.map((s, idx) => {
          const tc = typeConf(s.type);
          return (
            <div key={s._id || s.id} style={{
              background: `linear-gradient(135deg,${tc.color}14,#fff)`,
              border: `4px solid ${tc.color}`,
              borderRadius: 22, padding: '16px 20px', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              boxShadow: `0 7px 0 ${tc.color}44`,
            }}>
              {/* Order badge */}
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: tc.color, border: `3px solid ${tc.color}`,
                boxShadow: `0 5px 0 ${tc.color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Boogaloo', cursive", color: '#fff', fontSize: 20,
              }}>{idx + 1}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontWeight: 700, color: C.txt, fontSize: 15 }}>{s.title}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                  {[
                    { label: tc.label,              color: tc.color  },
                    { label: `${s.durationMins}m`,  color: C.muted   },
                    { label: `⭐ ${s.xpReward} XP`, color: C.orange  },
                    { label: `🪙 ${s.coinsReward}`, color: C.yellow  },
                    s.hasIde && { label: '💻 IDE',  color: C.cyan    },
                    { label: s.isPublished ? '✅ Live' : '📝 Draft',
                      color: s.isPublished ? C.lime : C.muted },
                  ].filter(Boolean).map((badge, i) => (
                    <span key={i} style={{
                      background: `${badge.color}18`, border: `1.5px solid ${badge.color}44`,
                      borderRadius: 50, padding: '2px 10px',
                      color: badge.color, fontSize: 11, fontWeight: 700,
                    }}>{badge.label}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                <Btn onClick={() => moveSession(idx, -1)} color="#EEF8FF" textColor={C.cyan} sm disabled={idx === 0}>↑</Btn>
                <Btn onClick={() => moveSession(idx, +1)} color="#EEF8FF" textColor={C.cyan} sm disabled={idx === sessions.length - 1}>↓</Btn>
                <Btn onClick={() => startEdit(s)} color="#EEF4FF" textColor={C.purple} sm>✏️ Edit</Btn>
                <Btn onClick={() => togglePublish(s)} color={s.isPublished ? '#EEE' : C.lime}
                  textColor={s.isPublished ? C.muted : C.txt} sm>
                  {s.isPublished ? '🔒 Unpublish' : '🚀 Publish'}
                </Btn>
                {s.type === 'QUIZ' && onEditQuiz && (
                  <Btn onClick={() => onEditQuiz(s)} color="#FFF0E8" textColor={C.orange} sm>🎯 Questions</Btn>
                )}
                <Btn onClick={() => deleteSession(s._id || s.id)} color="#FFEEEE" textColor={C.red} sm>🗑️</Btn>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
