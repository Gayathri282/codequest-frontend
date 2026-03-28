// frontend/src/pages/AdminPage.jsx
// Full admin panel — all tabs wired to live API + LessonBuilder + QuizBuilder
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import api                     from '../utils/api';
import { formatRupees, timeAgo } from '../utils/formatters';
import LessonBuilder           from '../components/admin/LessonBuilder';
import QuizBuilder             from '../components/admin/QuizBuilder';
import XpBar                   from '../components/shared/XpBar';
import Btn                     from '../components/shared/Btn';
import Modal                   from '../components/shared/Modal';
import LoadingScreen           from '../components/shared/LoadingScreen';
import ErrorBanner             from '../components/shared/ErrorBanner';

const C = {
  orange:'#7ED957', cyan:'#00C8E8', pink:'#00C8A0', lime:'#7ED957',
  yellow:'#FFD700', red:'#FF4757', purple:'#5B8AFF',
  muted:'#5A8A70', txt:'#062213', border:'#A8EED4', light:'#F0FFF8',
};
const FONT_HEAD = "'Fredoka One', cursive";
const FONT_BODY = "'Quicksand', sans-serif";

const TABS = [
  { id:'overview',   label:'📊 Overview',   color:'#7ED957' },
  { id:'courses',    label:'🎬 Courses',    color:'#00C8E8' },
  { id:'lectures',   label:'📖 Lectures',   color:'#00C8A0' },
  { id:'students',   label:'👨‍🎓 Students',   color:'#5B8AFF' },
  { id:'quizzes',    label:'🎯 Quizzes',    color:'#FFD700' },
  { id:'payments',   label:'💳 Payments',   color:'#FF9F43' },
  { id:'analytics',  label:'📈 Analytics',  color:'#FF4757' },
  { id:'settings',   label:'⚙️ Settings',   color:'#A29BFE' },
];

const inp = {
  width:'100%', padding:'11px 16px', borderRadius:16,
  border:`3px solid ${C.border}`, fontSize:13,
  fontFamily:FONT_BODY, background:'#fff',
  outline:'none', boxSizing:'border-box', color:C.txt,
  boxShadow:`0 4px 0 ${C.border}`,
};
const lbl = { fontSize:12, color:C.orange, fontWeight:800, display:'block', marginBottom:5, letterSpacing:.4 };

/* ─── Stat card ─── */
function StatCard({ icon, value, label, color, trend }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${color}28,#fff)`,
      border:`4px solid ${color}`, borderRadius:22, padding:22,
      boxShadow:`0 8px 0 ${color}66`, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', right:-8, top:-8, fontSize:64, opacity:.1, userSelect:'none' }}>{icon}</div>
      <div style={{ fontSize:36 }}>{icon}</div>
      <div style={{ fontFamily:FONT_HEAD, fontSize:28, color, marginTop:6 }}>{value ?? '—'}</div>
      <div style={{ color:C.muted, fontSize:12, marginTop:2, fontWeight:700 }}>{label}</div>
      {trend && <div style={{ color:C.lime, fontSize:12, marginTop:5, fontWeight:800 }}>▲ {trend}</div>}
    </div>
  );
}

/* ─── Section title ─── */
function STitle({ children, color = C.orange, emoji }) {
  return (
    <div style={{ fontFamily:FONT_HEAD, fontSize:28, color, marginBottom:20,
      display:'flex', alignItems:'center', gap:10,
      background:`linear-gradient(135deg,${color}18,transparent)`,
      borderLeft:`6px solid ${color}`, borderRadius:'0 16px 16px 0',
      padding:'10px 18px', boxShadow:`0 5px 0 ${color}25`,
      textShadow:`2px 2px 0 ${color}30` }}>
      {emoji && <span style={{ fontSize:30 }}>{emoji}</span>}{children}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   OVERVIEW TAB
══════════════════════════════════════════════════ */
function OverviewTab({ stats, courses }) {
  const statCards = [
    { icon:'👨‍🎓', value:stats?.totalStudents,       label:'Total Students',   color:C.cyan,   trend:'+12%' },
    { icon:'🔥', value:stats?.activeLast7Days,      label:'Active (7 days)',  color:C.orange, trend:'+8%'  },
    { icon:'💰', value:stats ? `₹${stats.totalRevenueRupees?.toLocaleString('en-IN')}` : '—',
                                                     label:'Total Revenue',    color:C.lime,   trend:'+23%' },
    { icon:'🎬', value:stats?.totalCourses,          label:'Courses Live',     color:C.purple, trend:'+1'   },
    { icon:'💳', value:stats?.totalPayments,         label:'Paid Subscriptions',color:C.pink,  trend:'+18%' },
  ];

  const pcts = [68, 22, 6, 4];

  return (
    <>
      <STitle emoji="📊" color={C.orange}>Platform Overview</STitle>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:14, marginBottom:32 }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Top students */}
        <div style={{ background:'linear-gradient(135deg,#E8FFFE,#fff)', border:`4px solid ${C.cyan}`, borderRadius:24, padding:24,
          boxShadow:`0 8px 0 ${C.cyan}44` }}>
          <STitle color={C.cyan} emoji="🏆">Top Runners</STitle>
          {[
            { name:'Rohan K.',  level:8, xp:1540, coins:156, streak:19 },
            { name:'Dev T.',    level:6, xp:990,  coins:101, streak:5  },
            { name:'Aarav S.',  level:5, xp:820,  coins:84,  streak:7  },
          ].map((s,i) => (
            <div key={s.name} style={{ display:'flex', alignItems:'center', gap:12,
              padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
                background:[C.yellow,'#C0C8D0','#CD8040'][i],
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:900, fontSize:13 }}>{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:C.txt }}>{s.name}</div>
                <div style={{ color:C.muted, fontSize:11 }}>Lv.{s.level} · {s.xp} XP · 🔥{s.streak}d</div>
              </div>
              <div style={{ fontFamily:FONT_HEAD, color:C.orange }}>🪙{s.coins}</div>
            </div>
          ))}
        </div>

        {/* Course popularity */}
        <div style={{ background:'linear-gradient(135deg,#FFF5E6,#fff)', border:`4px solid ${C.orange}`, borderRadius:24, padding:24,
          boxShadow:`0 8px 0 ${C.orange}44` }}>
          <STitle color={C.orange} emoji="📈">Course Popularity</STitle>
          {courses.slice(0,4).map((c,i) => (
            <div key={c.id} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:13, color:C.txt, fontWeight:600 }}>{c.emoji} {c.title}</span>
                <span style={{ fontFamily:FONT_HEAD, color:c.color||C.cyan, fontSize:14 }}>{pcts[i]}%</span>
              </div>
              <XpBar pct={pcts[i]} color={c.color||C.cyan} h={10} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   COURSES TAB  (opens LessonBuilder inline)
══════════════════════════════════════════════════ */
function CoursesTab({ courses, setCourses }) {
  const [showAdd,      setShowAdd]    = useState(false);
  const [editCourse,   setEditCourse] = useState(null); // course object being edited
  const [lessonCourse, setLessonCourse] = useState(null); // course whose sessions we're managing
  const [quizSession,  setQuizSession]  = useState(null); // {id, title} quiz session for QuizBuilder
  const [form, setForm] = useState({ title:'', emoji:'', description:'', subject:'', color:'#00C8E8', ageGroup:'5-13', freeSessionCount:4 });
  const [saving, setSaving] = useState(false);
  const f = v => e => setForm(p => ({ ...p, [v]: e.target.value }));

  // If managing lessons, show LessonBuilder full-screen
  if (lessonCourse) {
    return (
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <Btn onClick={() => { setLessonCourse(null); setQuizSession(null); }} color={C.cyan} sm>← Back to Courses</Btn>
          <div style={{ fontFamily:FONT_HEAD, fontSize:22, color:C.cyan }}>
            {lessonCourse.emoji} {lessonCourse.title} — Sessions
          </div>
        </div>
        {quizSession ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <Btn onClick={() => setQuizSession(null)} color={C.orange} sm>← Back to Sessions</Btn>
              <div style={{ fontFamily:FONT_HEAD, fontSize:20, color:C.orange }}>
                🎯 Quiz Builder — {quizSession.title}
              </div>
            </div>
            <QuizBuilder sessionId={quizSession.id} sessionTitle={quizSession.title} />
          </>
        ) : (
          <LessonBuilder
            courseId={lessonCourse.id}
            courseName={lessonCourse.title}
            onEditQuiz={s => setQuizSession(s)}
          />
        )}
      </div>
    );
  }

  async function saveCourse() {
    setSaving(true);
    try {
      if (editCourse) {
        const r = await api.patch(`/courses/${editCourse.id}`, form);
        setCourses(cs => cs.map(c => c.id === editCourse.id ? r.data : c));
      } else {
        const r = await api.post('/courses', { ...form, order: courses.length + 1 });
        setCourses(cs => [...cs, r.data]);
      }
      setShowAdd(false); setEditCourse(null);
      setForm({ title:'', emoji:'', description:'', subject:'', color:'#00C8E8', ageGroup:'5-13', freeSessionCount:4 });
    } catch(e) { alert(e.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  function startEdit(course) {
    setEditCourse(course);
    setForm({ title:course.title, emoji:course.emoji, description:course.description||'',
      subject:course.subject, color:course.color||'#00C8E8', ageGroup:course.ageGroup||'5-13',
      freeSessionCount: course.freeSessionCount ?? 4 });
    setShowAdd(true);
  }

  async function togglePublish(course) {
    try {
      const r = await api.patch(`/courses/${course.id}`, { isLocked: !course.isLocked });
      setCourses(cs => cs.map(c => c.id === course.id ? { ...c, isLocked: r.data.isLocked } : c));
    } catch(e) { alert('Failed to update'); }
  }

  async function deleteCourse(course) {
    if (!confirm(`Delete "${course.title}"? All sessions will be lost.`)) return;
    try {
      await api.delete(`/courses/${course.id}`);
      setCourses(cs => cs.filter(c => c.id !== course.id));
    } catch(e) { alert('Delete failed'); }
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <STitle emoji="🎬" color={C.orange}>Manage Courses</STitle>
        <Btn onClick={() => { setShowAdd(v=>!v); setEditCourse(null);
          setForm({ title:'', emoji:'', description:'', subject:'', color:'#00C8E8', ageGroup:'5-13' }); }}
          color={C.lime} textColor={C.txt} sm>
          {showAdd && !editCourse ? '✕ Cancel' : '+ New Course'}
        </Btn>
      </div>

      {/* Add / Edit form */}
      {showAdd && (
        <div style={{ background:`linear-gradient(135deg,${C.lime}22,#FFFEF0)`,
          border:`4px solid ${C.lime}`, borderRadius:24, padding:26, marginBottom:24,
          boxShadow:`0 10px 0 ${C.lime}55` }}>
          <div style={{ fontFamily:FONT_HEAD, fontSize:22, color:C.lime, marginBottom:18,
            textShadow:`2px 2px 0 ${C.lime}44` }}>
            {editCourse ? '✏️ Edit Course' : '➕ New Course'}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={lbl}>Course Title *</label>
              <input style={inp} value={form.title} onChange={f('title')} placeholder="e.g. Web Builder" />
            </div>
            <div>
              <label style={lbl}>Emoji Icon *</label>
              <input style={inp} value={form.emoji} onChange={f('emoji')} placeholder="e.g. 🌐" />
            </div>
            <div>
              <label style={lbl}>Subject *</label>
              <input style={inp} value={form.subject} onChange={f('subject')} placeholder="e.g. HTML/CSS" />
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={lbl}>Description</label>
              <input style={inp} value={form.description} onChange={f('description')} placeholder="Short description for students" />
            </div>
            <div>
              <label style={lbl}>Age Group</label>
              <select style={inp} value={form.ageGroup} onChange={f('ageGroup')}>
                <option value="5-7">5–7 (Kindergarten)</option>
                <option value="8-10">8–10 (Grade 3–5)</option>
                <option value="11-13">11–13 (Grade 6–8)</option>
                <option value="5-13">Mixed (All ages)</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Theme Color</label>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="color" value={form.color} onChange={f('color')}
                  style={{ width:44, height:40, border:`2px solid ${C.border}`, borderRadius:8, cursor:'pointer' }} />
                <input style={{ ...inp, flex:1 }} value={form.color} onChange={f('color')} placeholder="#00C8E8" />
              </div>
            </div>
            <div>
              <label style={lbl}>Free Sessions (before Premium required)</label>
              <input style={inp} type="number" min="0"
                value={form.freeSessionCount}
                onChange={e => setForm(p => ({ ...p, freeSessionCount: parseInt(e.target.value)||0 }))}
                placeholder="4" />
              <div style={{ color:C.muted, fontSize:11, marginTop:3 }}>Sessions 1–N are free; rest require Premium</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <Btn onClick={() => { setShowAdd(false); setEditCourse(null); }} color="#EEE" textColor={C.muted} sm>Cancel</Btn>
            <Btn onClick={saveCourse} disabled={saving || !form.title || !form.emoji} color={C.lime} textColor={C.txt} sm>
              {saving ? '⏳ Saving…' : editCourse ? '✓ Save Changes' : '✓ Create Course'}
            </Btn>
          </div>
        </div>
      )}

      {/* Course list */}
      {courses.map(course => (
        <div key={course.id} style={{ background:`linear-gradient(135deg,${course.color||C.cyan}12,#fff)`,
          border:`4px solid ${course.color||C.cyan}`, borderRadius:24,
          padding:20, marginBottom:14, display:'flex', alignItems:'center',
          gap:16, flexWrap:'wrap', boxShadow:`0 8px 0 ${course.color||C.cyan}55` }}>
          <div style={{ fontSize:40 }}>{course.emoji}</div>
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ fontFamily:FONT_HEAD, fontSize:20, color:course.color||C.cyan }}>{course.title}</div>
            <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>
              {course.subject} · {course.sessions?.length||0} sessions ·&nbsp;
              <span style={{ color:course.isLocked?C.red:C.lime, fontWeight:700 }}>
                {course.isLocked ? '🔒 Unpublished' : '✅ Live'}
              </span>
            </div>
            {(course.sessions?.length||0) > 0 && (
              <div style={{ marginTop:6 }}>
                <XpBar pct={Math.round(((course.sessions?.filter(s=>s.isPublished)?.length||0) / (course.sessions?.length||1))*100)}
                  color={course.color||C.cyan} h={8} />
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Btn onClick={() => setLessonCourse(course)} color={C.cyan} textColor="#fff" sm>📚 Sessions</Btn>
            <Btn onClick={() => startEdit(course)} color="#EEF4FF" textColor={C.purple} sm>✏️ Edit</Btn>
            <Btn onClick={() => togglePublish(course)}
              color={course.isLocked ? C.lime : '#EEE'}
              textColor={course.isLocked ? C.txt : C.muted} sm>
              {course.isLocked ? '🔓 Publish' : '🔒 Unpublish'}
            </Btn>
            <Btn onClick={() => deleteCourse(course)} color="#FFEEEE" textColor={C.red} sm>🗑️</Btn>
          </div>
        </div>
      ))}

      {courses.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
          <div style={{ fontSize:64 }}>📚</div>
          <div style={{ fontFamily:FONT_HEAD, fontSize:22, marginTop:12 }}>No courses yet</div>
          <div style={{ fontSize:14, marginTop:6 }}>Click "+ New Course" to get started</div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════
   LECTURES TAB  (direct lecture management per course)
══════════════════════════════════════════════════ */
function LecturesTab({ courses }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [quizSession,    setQuizSession]    = useState(null);

  if (selectedCourse) {
    return (
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          <Btn onClick={() => { setSelectedCourse(null); setQuizSession(null); }} color={C.cyan} sm>← All Courses</Btn>
          <div style={{ fontFamily:FONT_HEAD, fontSize:22, color:C.cyan }}>
            {selectedCourse.emoji} {selectedCourse.title} — Lectures
          </div>
        </div>
        {quizSession ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <Btn onClick={() => setQuizSession(null)} color={C.orange} sm>← Back to Lectures</Btn>
              <div style={{ fontFamily:FONT_HEAD, fontSize:20, color:C.orange }}>
                🎯 Quiz Builder — {quizSession.title}
              </div>
            </div>
            <QuizBuilder sessionId={quizSession.id} sessionTitle={quizSession.title} />
          </>
        ) : (
          <LessonBuilder
            courseId={selectedCourse.id}
            courseName={selectedCourse.title}
            onEditQuiz={s => setQuizSession(s)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <STitle emoji="📖" color={C.cyan}>Manage Lectures</STitle>
      <p style={{ color:C.muted, fontSize:14, marginBottom:24 }}>
        Select a course to add, edit, reorder, or publish its lectures.
      </p>

      {courses.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
          <div style={{ fontSize:64 }}>📚</div>
          <div style={{ fontFamily:FONT_HEAD, fontSize:22, marginTop:12 }}>No courses yet</div>
          <div style={{ fontSize:14, marginTop:6 }}>Create courses first in the Courses tab</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {courses.map(course => {
            const total     = course.sessions?.length || 0;
            const published = course.sessions?.filter(s => s.isPublished)?.length || 0;
            return (
              <div key={course.id} style={{
                background:'#fff', border:`3px solid ${course.color||C.cyan}`,
                borderRadius:20, padding:22, cursor:'pointer',
                boxShadow:`0 6px 0 ${course.color||C.cyan}55`,
                transition:'transform .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                onClick={() => setSelectedCourse(course)}
              >
                <div style={{ fontSize:44, marginBottom:8 }}>{course.emoji}</div>
                <div style={{ fontFamily:FONT_HEAD, fontSize:18, color:course.color||C.cyan }}>{course.title}</div>
                <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{course.subject} · {course.ageGroup}</div>

                <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                  <span style={{
                    background:`${course.color||C.cyan}18`, border:`1.5px solid ${course.color||C.cyan}44`,
                    borderRadius:50, padding:'2px 10px', color:course.color||C.cyan, fontSize:11, fontWeight:700,
                  }}>
                    📚 {total} lecture{total !== 1 ? 's' : ''}
                  </span>
                  <span style={{
                    background:`${C.lime}18`, border:`1.5px solid ${C.lime}44`,
                    borderRadius:50, padding:'2px 10px', color:C.lime, fontSize:11, fontWeight:700,
                  }}>
                    ✅ {published} live
                  </span>
                  <span style={{
                    background: course.isLocked ? '#FFEEEE' : `${C.lime}18`,
                    border:`1.5px solid ${course.isLocked ? C.red : C.lime}44`,
                    borderRadius:50, padding:'2px 10px',
                    color: course.isLocked ? C.red : C.lime, fontSize:11, fontWeight:700,
                  }}>
                    {course.isLocked ? '🔒 Course hidden' : '🌐 Course live'}
                  </span>
                </div>

                {total > 0 && (
                  <div style={{ marginTop:12 }}>
                    <XpBar pct={total > 0 ? Math.round((published/total)*100) : 0} color={course.color||C.cyan} h={8} />
                    <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{published}/{total} lectures published</div>
                  </div>
                )}

                <div style={{ marginTop:16 }}>
                  <Btn color={course.color||C.cyan} textColor="#fff" sm style={{ width:'100%', justifyContent:'center' }}>
                    ✏️ Manage Lectures →
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════
   STUDENTS TAB
══════════════════════════════════════════════════ */
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [selected, setSelected] = useState(null); // student for progress modal

  async function load(p = 1, q = search) {
    setLoading(true);
    try {
      const r = await api.get('/admin/students', { params:{ page:p, limit:20, search:q }});
      setStudents(r.data.students||[]);
      setTotal(r.data.total||0);
      setPages(r.data.pages||1);
      setPage(p);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function banStudent(id) {
    if (!confirm('Ban this student?')) return;
    await api.patch(`/admin/students/${id}/ban`);
    setStudents(ss => ss.filter(s => s.id !== id));
  }

  const PLAN_COLOR = { PREMIUM:C.pink, BASIC:C.cyan, FREE:C.muted };

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <STitle emoji="👨‍🎓" color={C.cyan}>Students ({total})</STitle>
        <div style={{ display:'flex', gap:10 }}>
          <input style={{ ...inp, width:220 }} value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key==='Enter' && load(1, search)}
            placeholder="🔍 Search name or email…" />
          <Btn onClick={() => load(1, search)} color={C.cyan} sm>Search</Btn>
        </div>
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)} maxWidth={600}>
          <div style={{ fontFamily:FONT_HEAD, fontSize:22, color:C.orange, marginBottom:16 }}>
            {selected.avatarEmoji||'🏃'} {selected.displayName||selected.username}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
            {[
              { label:'Email',    value:selected.email },
              { label:'Age',      value:`${selected.age||'—'} years` },
              { label:'Plan',     value:selected.plan },
              { label:'Level',    value:`Level ${selected.level}` },
              { label:'XP',       value:`${selected.xp} XP` },
              { label:'Coins',    value:`🪙 ${selected.coins}` },
              { label:'Streak',   value:`🔥 ${selected.streakDays} days` },
              { label:'Joined',   value:new Date(selected.createdAt).toLocaleDateString('en-IN') },
              { label:'Last seen',value:timeAgo(selected.lastActiveAt) },
            ].map(r => (
              <div key={r.label} style={{ background:C.light, borderRadius:10, padding:'10px 14px' }}>
                <div style={{ color:C.muted, fontSize:11 }}>{r.label}</div>
                <div style={{ fontWeight:700, color:C.txt, fontSize:14 }}>{r.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Btn onClick={() => setSelected(null)} color="#EEE" textColor={C.muted} sm>Close</Btn>
            <Btn onClick={() => { banStudent(selected.id); setSelected(null); }} color="#FFEEEE" textColor={C.red} sm>
              🚫 Ban Student
            </Btn>
          </div>
        </Modal>
      )}

      {loading ? <div style={{textAlign:'center',padding:60,fontSize:40}}>⏳</div> : (
        <>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:'0 8px', minWidth:700 }}>
              <thead>
                <tr>{['Student','Age','Level','XP','Streak','Plan','Last Seen','Actions'].map((h,hi)=>(
                  <th key={h} style={{ color:[C.cyan,C.purple,C.orange,C.lime,C.orange,C.pink,C.muted,C.red][hi]||C.muted,
                    fontSize:12, textAlign:'left', padding:'8px 14px', fontFamily:FONT_BODY, fontWeight:800 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    {[
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:20 }}>{s.avatarEmoji||'🏃'}</span>
                        <div>
                          <div style={{ fontWeight:700, color:C.txt, fontSize:14 }}>{s.displayName||s.username}</div>
                          <div style={{ color:C.muted, fontSize:11 }}>{s.email}</div>
                        </div>
                      </div>,
                      <span style={{ color:C.muted }}>{s.age||'—'}</span>,
                      <span style={{ fontFamily:FONT_HEAD, color:C.cyan }}>⚡{s.level}</span>,
                      <span style={{ fontFamily:FONT_HEAD, color:C.orange }}>⭐{s.xp}</span>,
                      <span style={{ fontFamily:FONT_HEAD, color:C.orange }}>🔥{s.streakDays}d</span>,
                      <span style={{ background:`${PLAN_COLOR[s.plan]}22`, border:`1.5px solid ${PLAN_COLOR[s.plan]}`,
                        borderRadius:50, padding:'2px 10px', color:PLAN_COLOR[s.plan], fontSize:12 }}>{s.plan}</span>,
                      <span style={{ color:C.muted, fontSize:12 }}>{timeAgo(s.lastActiveAt)}</span>,
                      <div style={{ display:'flex', gap:5 }}>
                        <Btn onClick={() => setSelected(s)} color="#EEF8FF" textColor={C.cyan} sm>👁</Btn>
                        <Btn onClick={() => banStudent(s.id)} color="#FFEEEE" textColor={C.red} sm>Ban</Btn>
                      </div>,
                    ].map((cell,i)=>(
                      <td key={i} style={{ background: i===0 ? 'linear-gradient(135deg,#EEF8FF,#fff)' : '#fff',
                        padding:'12px 14px',
                        borderTop:`3px solid ${C.border}`, borderBottom:`3px solid ${C.border}`,
                        borderLeft: i===0 ? `3px solid ${C.cyan}` : 'none',
                        borderRight: i===7 ? `3px solid ${C.border}` : 'none',
                        borderRadius: i===0 ? '16px 0 0 16px' : i===7 ? '0 16px 16px 0' : 0,
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:20 }}>
              <Btn onClick={() => load(page-1)} disabled={page<=1} color={C.cyan} sm>← Prev</Btn>
              <span style={{ padding:'8px 16px', color:C.muted, fontFamily:FONT_BODY }}>
                Page {page} of {pages}
              </span>
              <Btn onClick={() => load(page+1)} disabled={page>=pages} color={C.cyan} sm>Next →</Btn>
            </div>
          )}
        </>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════
   PAYMENTS TAB
══════════════════════════════════════════════════ */
function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/payments/history')
      .then(r => setPayments(r.data))
      .finally(() => setLoading(false));
  }, []);

  const STATUS_COLOR = { PAID:C.lime, PENDING:C.yellow, FAILED:C.red, REFUNDED:C.orange };

  const planRevenue = payments
    .filter(p => p.status==='PAID')
    .reduce((acc, p) => { acc[p.plan] = (acc[p.plan]||0) + p.amount; return acc; }, {});

  return (
    <>
      <STitle emoji="💳" color={C.lime}>Payments & Subscriptions</STitle>

      {/* Plan summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, marginBottom:28 }}>
        {[
          { plan:'FREE',    price:'₹0/mo',    color:C.muted },
          { plan:'BASIC',   price:'₹299/mo',  color:C.cyan  },
          { plan:'PREMIUM', price:'₹799/mo',  color:C.pink  },
        ].map(p => (
          <div key={p.plan} style={{ background:`linear-gradient(135deg,${p.color}28,#fff)`,
            border:`4px solid ${p.color}`, borderRadius:24, padding:24, textAlign:'center',
            boxShadow:`0 9px 0 ${p.color}55` }}>
            <div style={{ fontFamily:FONT_HEAD, fontSize:22, color:p.color }}>{p.plan}</div>
            <div style={{ fontFamily:FONT_HEAD, fontSize:28, color:C.txt, margin:'8px 0' }}>{p.price}</div>
            {planRevenue[p.plan] && (
              <div style={{ color:C.lime, fontSize:13, fontWeight:700 }}>
                ₹{(planRevenue[p.plan]/100).toLocaleString('en-IN')} total
              </div>
            )}
          </div>
        ))}
      </div>

      <STitle emoji="💸" color={C.orange}>Transactions</STitle>
      {loading ? <div style={{textAlign:'center',padding:40,fontSize:36}}>⏳</div> : (
        payments.map(p => (
          <div key={p.id} style={{
            background:`linear-gradient(135deg,${STATUS_COLOR[p.status]||C.border}12,#fff)`,
            border:`3px solid ${STATUS_COLOR[p.status]||C.border}`,
            borderRadius:18, padding:'14px 20px', marginBottom:10,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            flexWrap:'wrap', gap:10,
            boxShadow:`0 6px 0 ${STATUS_COLOR[p.status]||C.border}44` }}>
            <div>
              <span style={{ fontWeight:700, color:C.txt }}>{p.user?.username || p.user?.email || '—'}</span>
              <span style={{ color:C.muted, fontSize:12, marginLeft:12 }}>
                {p.plan} · {new Date(p.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <span style={{ fontFamily:FONT_HEAD, color:C.orange, fontSize:18 }}>
                ₹{(p.amount/100).toLocaleString('en-IN')}
              </span>
              <span style={{ background:`${STATUS_COLOR[p.status]||C.muted}22`,
                border:`1.5px solid ${STATUS_COLOR[p.status]||C.muted}`,
                borderRadius:8, padding:'3px 10px',
                color:STATUS_COLOR[p.status]||C.muted, fontSize:12 }}>{p.status}</span>
            </div>
          </div>
        ))
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════
   ANALYTICS TAB
══════════════════════════════════════════════════ */
function AnalyticsTab() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [days,    setDays]    = useState(30);

  useEffect(() => {
    api.get('/admin/analytics', { params:{ days } })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <STitle emoji="📈" color={C.cyan}>Analytics</STitle>
        <div style={{ display:'flex', gap:8 }}>
          {[7,30,90].map(d => (
            <Btn key={d} onClick={() => setDays(d)} sm
              color={days===d ? C.cyan : '#EEE'} textColor={days===d ? '#fff' : C.muted}>
              {d}d
            </Btn>
          ))}
        </div>
      </div>

      {loading ? <div style={{textAlign:'center',padding:60,fontSize:40}}>⏳</div> : (
        <>
          {/* Revenue by plan */}
          <div style={{ background:'linear-gradient(135deg,#FFF8E1,#fff)', border:`4px solid ${C.orange}`, borderRadius:24, padding:24, marginBottom:20,
            boxShadow:`0 8px 0 ${C.orange}44` }}>
            <div style={{ fontFamily:FONT_HEAD, fontSize:20, color:C.orange, marginBottom:16 }}>💰 Revenue by Plan</div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              {data?.revenueByPlan?.map(r => (
                <div key={r.plan} style={{ background:`${C.lime}18`, border:`2px solid ${C.lime}`,
                  borderRadius:14, padding:'12px 20px', flex:'1 1 140px' }}>
                  <div style={{ fontFamily:FONT_HEAD, color:C.lime, fontSize:16 }}>{r.plan}</div>
                  <div style={{ fontFamily:FONT_HEAD, color:C.txt, fontSize:22 }}>
                    ₹{((r.revenue||0)/100).toLocaleString('en-IN')}
                  </div>
                  <div style={{ color:C.muted, fontSize:12 }}>{r.count} payments</div>
                </div>
              ))}
            </div>
          </div>

          {/* Most popular sessions */}
          <div style={{ background:'linear-gradient(135deg,#E8FFFE,#fff)', border:`4px solid ${C.cyan}`, borderRadius:24, padding:24,
            boxShadow:`0 8px 0 ${C.cyan}44` }}>
            <div style={{ fontFamily:FONT_HEAD, fontSize:20, color:C.cyan, marginBottom:16 }}>🏆 Most Completed Sessions</div>
            {data?.popularSessions?.map((s,i) => (
              <div key={s.id||i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%',
                    background:[C.yellow,'#C0C8D0','#CD8040',C.cyan,C.orange][i]||C.muted,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:900, fontSize:13 }}>{i+1}</div>
                  <div>
                    <div style={{ fontWeight:700, color:C.txt }}>{s.title}</div>
                    <div style={{ color:C.muted, fontSize:12 }}>{s.type}</div>
                  </div>
                </div>
                <div style={{ fontFamily:FONT_HEAD, color:C.orange }}>{s.completions} completions</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════
   SETTINGS TAB
══════════════════════════════════════════════════ */
function SettingsTab() {
  const [saved,        setSaved]        = useState('');
  const [sending,      setSending]      = useState(false);
  const [premiumPrice, setPremiumPrice] = useState('');
  const [priceLoaded,  setPriceLoaded]  = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(r => {
      const paise = r.data?.PRICE_PREMIUM;
      if (paise) setPremiumPrice(String(Math.round(parseInt(paise, 10) / 100)));
      setPriceLoaded(true);
    }).catch(() => setPriceLoaded(true));
  }, []);

  const sections = [
    { key:'branding', title:'🌐 Branding',  color:C.cyan,   fields:['Platform Name','Tagline','Logo URL','Support Email'] },
    { key:'game',     title:'🎮 Game',      color:C.orange, fields:['XP per Lesson (default)','Coins per Lesson (default)','Streak Bonus XP','Max Daily XP'] },
    { key:'razorpay', title:'💳 Razorpay',  color:C.lime,   fields:['API Key','Secret Key','Webhook URL','Currency'] },
    { key:'email',    title:'📧 Email',     color:C.pink,   fields:['SMTP Host / Resend API Key','From Email','Welcome Template URL','Report Day (0=Sun)'] },
  ];

  async function savePremiumPrice() {
    const rupees = parseInt(premiumPrice, 10);
    if (!rupees || rupees < 1) return alert('Enter a valid amount in ₹');
    const paise = rupees * 100;
    await api.patch('/admin/settings', { PRICE_PREMIUM: paise });
    setSaved('pricing');
    setTimeout(() => setSaved(''), 2000);
  }

  async function saveSection(key) {
    await api.patch('/admin/settings', { [key]: true });
    setSaved(key);
    setTimeout(() => setSaved(''), 2000);
  }

  async function sendTestReports() {
    setSending(true);
    try {
      const r = await api.post('/admin/send-reports');
      alert(r.data.message);
    } catch(e) { alert('Failed: ' + (e.response?.data?.error||e.message)); }
    finally { setSending(false); }
  }

  return (
    <>
      <STitle emoji="⚙️" color={C.purple}>Platform Settings</STitle>

      {/* ── Pricing card ── */}
      <div style={{ background:`linear-gradient(135deg,${C.lime}22,#FFFEF0)`,
        border:`4px solid ${C.lime}`, borderRadius:24, padding:24, marginBottom:20,
        boxShadow:`0 9px 0 ${C.lime}55` }}>
        <div style={{ fontFamily:FONT_HEAD, fontSize:20, color:C.lime, marginBottom:6 }}>💰 Subscription Pricing</div>
        <div style={{ color:C.muted, fontSize:13, marginBottom:14 }}>
          Set the monthly subscription price shown on the Pricing page and charged via Razorpay.
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:160 }}>
            <label style={lbl}>PREMIUM Price (₹ per month)</label>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:FONT_HEAD, fontSize:20, color:C.lime }}>₹</span>
              <input
                style={{ ...inp, flex:1 }}
                type="number"
                min="1"
                value={priceLoaded ? premiumPrice : ''}
                onChange={e => setPremiumPrice(e.target.value)}
                placeholder={priceLoaded ? '1499' : 'Loading…'}
              />
            </div>
            <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>
              Default: ₹1,499 · Will be charged in paise (×100) via Razorpay
            </div>
          </div>
          <Btn onClick={savePremiumPrice} color={C.lime} textColor={C.txt} sm style={{ alignSelf:'flex-end', marginBottom:4 }}>
            {saved==='pricing' ? '✓ Saved!' : 'Save Price'}
          </Btn>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:20 }}>
        {sections.map(s => (
          <div key={s.key} style={{ background:`linear-gradient(135deg,${s.color}22,#fff)`,
            border:`4px solid ${s.color}`, borderRadius:24, padding:24,
            boxShadow:`0 9px 0 ${s.color}55` }}>
            <div style={{ fontFamily:FONT_HEAD, fontSize:20, color:s.color, marginBottom:14 }}>{s.title}</div>
            {s.fields.map(field => (
              <div key={field} style={{ marginBottom:12 }}>
                <label style={lbl}>{field}</label>
                <input style={inp} placeholder={`Enter ${field.toLowerCase()}…`} />
              </div>
            ))}
            <Btn onClick={() => saveSection(s.key)} color={s.color} sm style={{ marginTop:6 }}>
              {saved===s.key ? '✓ Saved!' : 'Save'}
            </Btn>
          </div>
        ))}
      </div>

      {/* Weekly reports */}
      <div style={{ background:`linear-gradient(135deg,${C.yellow}28,#FFFEF5)`,
        border:`4px solid ${C.yellow}`, borderRadius:24, padding:24, marginTop:20,
        boxShadow:`0 9px 0 ${C.yellow}66` }}>
        <div style={{ fontFamily:FONT_HEAD, fontSize:17, color:C.orange, marginBottom:8 }}>📧 Weekly Progress Emails</div>
        <p style={{ color:C.muted, fontSize:14, marginBottom:16 }}>
          Sends a progress report to every parent email on file. Auto-runs every Sunday,
          or trigger manually below.
        </p>
        <Btn onClick={sendTestReports} disabled={sending} color={C.orange}>
          {sending ? '⏳ Sending…' : '📤 Send Reports Now'}
        </Btn>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   MAIN AdminPage
══════════════════════════════════════════════════ */
export default function AdminPage() {
  const { logout } = useAuth();
  const nav        = useNavigate();

  const [tab,     setTab]     = useState('overview');
  const [stats,   setStats]   = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}),
      api.get('/courses').then(r => setCourses(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen message="Loading admin panel…" />;

  const activeTab = TABS.find(t => t.id === tab) || TABS[0];

  return (
    <div style={{ minHeight:'100vh',
      background:'linear-gradient(160deg,#FFF9E6 0%,#FFE8F5 30%,#E8F0FF 65%,#E8FFF0 100%)',
      fontFamily:FONT_BODY }}>

      {/* ── Admin nav bar ── */}
      <div style={{
        background:`linear-gradient(135deg,#062213 0%,#0D3B22 30%,#1A6B3C 65%,#00C8A0 100%)`,
        borderBottom:`6px solid #fff`,
        padding:'14px 22px',
        display:'flex', alignItems:'center', gap:12, flexWrap:'wrap',
        position:'sticky', top:0, zIndex:50,
        boxShadow:'0 8px 0 rgba(0,0,0,.12)',
      }}>
        <Btn onClick={() => { logout(); nav('/'); }} color='rgba(255,255,255,.25)' sm
          style={{ border:'3px solid rgba(255,255,255,.6)', color:'#fff', fontWeight:800, borderRadius:50 }}>← Exit</Btn>
        <div style={{ fontFamily:FONT_HEAD, fontSize:26, color:'#fff', marginRight:8,
          textShadow:'2px 3px 0 rgba(0,0,0,.18)', letterSpacing:1 }}>🐸 CodeQuest Admin</div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginLeft:'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background:  tab===t.id ? '#fff' : 'rgba(255,255,255,.22)',
              border:      `3px solid ${tab===t.id ? t.color : 'rgba(255,255,255,.5)'}`,
              borderRadius:50, padding:'6px 15px',
              color:       tab===t.id ? t.color : '#fff',
              cursor:'pointer', fontSize:12, fontWeight:800, fontFamily:FONT_BODY,
              boxShadow: tab===t.id ? `0 5px 0 ${t.color}88` : '0 3px 0 rgba(0,0,0,.1)',
              transition:'all .15s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Coloured tab accent strip ── */}
      <div style={{
        height:8, width:'100%',
        background:`linear-gradient(90deg,${activeTab.color},${activeTab.color}88,transparent)`,
        transition:'background .3s',
      }} />

      <div style={{ padding:28, maxWidth:1140, margin:'0 auto' }}>
        {error && <ErrorBanner message={error} onRetry={() => window.location.reload()} />}

        {tab==='overview'  && <OverviewTab  stats={stats} courses={courses} />}
        {tab==='courses'   && <CoursesTab   courses={courses} setCourses={setCourses} />}
        {tab==='lectures'  && <LecturesTab  courses={courses} />}
        {tab==='students'  && <StudentsTab  />}
        {tab==='quizzes'   && (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ fontSize:64 }}>🎯</div>
            <div style={{ fontFamily:FONT_HEAD, fontSize:24, color:C.orange, margin:'16px 0 8px' }}>
              Manage Quizzes via Courses
            </div>
            <p style={{ color:C.muted, marginBottom:20 }}>
              Go to the Courses tab → click "Sessions" on any course → click "Edit Quiz" on a Quiz session.
            </p>
            <Btn onClick={() => setTab('courses')} color={C.orange}>Go to Courses →</Btn>
          </div>
        )}
        {tab==='payments'  && <PaymentsTab  />}
        {tab==='analytics' && <AnalyticsTab />}
        {tab==='settings'  && <SettingsTab  />}
      </div>
    </div>
  );
}
