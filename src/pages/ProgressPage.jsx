// frontend/src/pages/ProgressPage.jsx
import { useEffect, useState } from 'react';
import { useAuth }             from '../context/AuthContext';
import api                     from '../utils/api';
import { formatXpProgress, timeAgo, SESSION_META } from '../utils/formatters';
import LoadingScreen from '../components/shared/LoadingScreen';
import { useNavigate } from 'react-router-dom';

const T = {
  deep:  '#041A0E', dark:  '#062213', mid: '#0D3B22',
  lime:  '#7ED957', teal:  '#00C8A0', cyan: '#00C8E8',
  gold:  '#FFD700', white: '#E8FFF5', muted: 'rgba(232,255,245,.5)',
};

// Cute character options
const AVATARS = [
  '🐸','🦊','🐱','🐻','🐼','🐨','🐯','🦁','🐰','🐮',
  '🐙','🦄','🐧','🦋','🦔','🐺','🦝','🐵','🦉','🐊',
];

function StatBox({ icon, value, label, color }) {
  return (
    <div style={{ background:`rgba(255,255,255,.06)`,
      border:`2px solid ${color}44`, borderRadius:16,
      padding:'14px 18px', textAlign:'center', flex:'1 1 100px' }}>
      <div style={{ fontSize:28 }}>{icon}</div>
      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:24, color, marginTop:4 }}>{value}</div>
      <div style={{ color:T.muted, fontSize:11, marginTop:2, fontWeight:700 }}>{label}</div>
    </div>
  );
}

export default function ProgressPage() {
  const { user, refreshUser } = useAuth();
  const nav                   = useNavigate();
  const [report,    setReport]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/progress/report/${user.id}`)
      .then(r  => setReport(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load progress'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  async function pickAvatar(emoji) {
    setSavingAvatar(true);
    try {
      await api.patch('/users/me', { avatarEmoji: emoji });
      await refreshUser();
    } catch (_) {}
    setSavingAvatar(false);
    setShowPicker(false);
  }

  if (loading) return <LoadingScreen />;

  const { student, courses, badges, totalCompleted, weeklyXp } = report || {};
  const { level, xpInLevel, xpNeeded, pct } = formatXpProgress(student?.xp || user?.xp || 0);

  return (
    <>
      <style>{`
        @keyframes bob     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes sway    { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        @keyframes shimmer { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes pop     { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
        @keyframes rise    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes wobble  { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
      `}</style>

      <div style={{ minHeight:'100vh',
        background:`radial-gradient(ellipse at 50% 15%,#0D3B22 0%,#062213 55%,#041A0E 100%)`,
        fontFamily:"'Quicksand',sans-serif", position:'relative', overflow:'hidden' }}>

        {/* Fireflies */}
        {[{l:'7%',t:'12%',d:'0s'},{l:'88%',t:'18%',d:'.6s'},{l:'14%',t:'68%',d:'1.2s'},
          {l:'82%',t:'72%',d:'.3s'},{l:'50%',t:'7%',d:'.9s'}].map((f,i) => (
          <div key={i} style={{ position:'absolute', left:f.l, top:f.t, width:5, height:5,
            borderRadius:'50%', background:T.lime, boxShadow:`0 0 8px ${T.lime}`,
            animation:`shimmer ${1.4+i*.3}s ease-in-out infinite`,
            animationDelay:f.d, pointerEvents:'none' }} />
        ))}

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 24px', flexWrap:'wrap', gap:10,
          borderBottom:`1px solid rgba(126,217,87,.1)`,
          background:'rgba(4,26,14,.8)', backdropFilter:'blur(10px)',
          position:'sticky', top:0, zIndex:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}
            onClick={() => nav('/dashboard')}>
            <span style={{ fontSize:22, animation:'sway 3s ease-in-out infinite' }}>🐸</span>
            <span style={{ fontFamily:"'Fredoka One',cursive", color:T.lime, fontSize:18 }}>CodeQuest</span>
          </div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:T.white }}>
            📊 My Progress
          </div>
          <button onClick={() => nav('/dashboard')} style={{
            background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.15)',
            borderRadius:12, padding:'6px 16px', cursor:'pointer',
            fontFamily:"'Fredoka One',cursive", color:'rgba(232,255,245,.7)', fontSize:13,
          }}>← Map</button>
        </div>

        <div style={{ maxWidth:840, margin:'0 auto', padding:'28px 20px 80px' }}>

          {error && (
            <div style={{ background:'rgba(255,71,87,.15)', border:'2px solid #FF475766',
              borderRadius:14, padding:'12px 20px', color:'#FF8888', marginBottom:20,
              fontWeight:700, fontSize:14 }}>
              {error}
            </div>
          )}

          {student && (
            <>
              {/* ── Hero card ── */}
              <div style={{ background:'rgba(13,59,34,.7)',
                border:`3px solid ${T.teal}`, borderRadius:24, padding:24, marginBottom:20,
                boxShadow:`0 8px 0 ${T.teal}44`, animation:'rise .4s ease both' }}>
                <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', marginBottom:16 }}>
                  {/* Avatar + change button */}
                  <div style={{ position:'relative' }}>
                    <div style={{ fontSize:64, animation:'wobble 2s ease-in-out infinite',
                      cursor:'pointer', filter:`drop-shadow(0 0 16px ${T.teal}88)` }}
                      onClick={() => setShowPicker(true)}
                      title="Click to change character">
                      {student.avatarEmoji || user?.avatarEmoji || '🐸'}
                    </div>
                    <div onClick={() => setShowPicker(true)} style={{
                      position:'absolute', bottom:-4, right:-4,
                      background:T.teal, borderRadius:10, padding:'2px 6px',
                      fontSize:10, fontWeight:800, color:T.dark,
                      cursor:'pointer', fontFamily:"'Fredoka One',cursive",
                    }}>✏️</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:26, color:T.white }}>
                      {student.displayName || student.username}
                    </div>
                    <div style={{ color:T.muted, fontSize:13, margin:'2px 0 10px' }}>
                      ⚡ Level {level} · {student.xp} total XP
                    </div>
                    {/* XP bar */}
                    <div style={{ height:14, background:'rgba(255,255,255,.1)',
                      borderRadius:10, overflow:'hidden', border:`2px solid ${T.cyan}44` }}>
                      <div style={{ width:`${pct}%`, height:'100%',
                        background:`linear-gradient(90deg,${T.lime},${T.teal})`,
                        borderRadius:10, transition:'width .8s' }} />
                    </div>
                    <div style={{ color:T.muted, fontSize:11, marginTop:4, fontWeight:700 }}>
                      {xpInLevel} / {xpNeeded} XP → Level {level+1}
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <StatBox icon="🪙" value={student.coins}           label="Coins"      color={T.gold} />
                  <StatBox icon="🔥" value={`${student.streakDays}d`} label="Streak"   color='#FF8C42' />
                  <StatBox icon="✅" value={totalCompleted}            label="Completed" color={T.lime} />
                  <StatBox icon="⭐" value={`${weeklyXp||0} XP`}      label="This Week" color={T.cyan} />
                </div>
              </div>

              {/* ── Character picker modal ── */}
              {showPicker && (
                <div style={{ position:'fixed', inset:0,
                  background:'rgba(4,26,14,.9)', backdropFilter:'blur(8px)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  zIndex:100, padding:20 }}>
                  <div style={{ background:'rgba(13,59,34,.95)',
                    border:`3px solid ${T.lime}`, borderRadius:28,
                    padding:'32px 28px', maxWidth:400, width:'100%', textAlign:'center',
                    animation:'pop .4s cubic-bezier(.4,2,.4,1)', boxShadow:`0 0 60px ${T.lime}33` }}>
                    <div style={{ fontFamily:"'Fredoka One',cursive", color:T.white,
                      fontSize:22, marginBottom:6 }}>Pick Your Character!</div>
                    <div style={{ color:T.muted, fontSize:13, marginBottom:20, fontWeight:700 }}>
                      Choose your jungle buddy 🌿
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:24 }}>
                      {AVATARS.map(emoji => (
                        <button key={emoji} onClick={() => pickAvatar(emoji)}
                          disabled={savingAvatar}
                          style={{
                            background: (student.avatarEmoji||user?.avatarEmoji) === emoji
                              ? `${T.lime}33` : 'rgba(255,255,255,.06)',
                            border: `2px solid ${(student.avatarEmoji||user?.avatarEmoji) === emoji
                              ? T.lime : 'rgba(255,255,255,.12)'}`,
                            borderRadius:14, padding:10, fontSize:30,
                            cursor:'pointer',
                            transition:'transform .15s, background .15s',
                            animation:'none',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform=''; }}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setShowPicker(false)} style={{
                      background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(255,255,255,.15)',
                      borderRadius:12, padding:'8px 24px', cursor:'pointer',
                      fontFamily:"'Fredoka One',cursive", color:'rgba(232,255,245,.6)', fontSize:14,
                    }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* ── Badges ── */}
              {badges?.length > 0 && (
                <div style={{ background:'rgba(13,59,34,.7)',
                  border:`3px solid ${T.gold}`, borderRadius:24, padding:24, marginBottom:20,
                  boxShadow:`0 8px 0 ${T.gold}44`, animation:'rise .4s .1s ease both' }}>
                  <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:T.gold, marginBottom:14 }}>
                    🏅 Badges Earned
                  </div>
                  <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                    {badges.map((b, i) => (
                      <div key={i} title={b.name} style={{ textAlign:'center', minWidth:60 }}>
                        <div style={{ fontSize:40, animation:`wobble ${2+i*.2}s ease-in-out infinite`,
                          animationDelay:`${i*.2}s`,
                          filter:`drop-shadow(0 0 8px ${T.gold}88)` }}>
                          {b.emoji || '🏅'}
                        </div>
                        <div style={{ color:T.muted, fontSize:10, marginTop:4, fontWeight:700 }}>
                          {b.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Course breakdown ── */}
              {courses?.length > 0 ? courses.map(({ course, sessions }, ci) => (
                <div key={course.title} style={{
                  background:'rgba(13,59,34,.6)',
                  border:`2px solid rgba(126,217,87,.15)`,
                  borderRadius:20, padding:20, marginBottom:14,
                  animation:`rise .4s ${ci*0.08}s ease both`,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <span style={{ fontSize:32 }}>{course.emoji}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:T.white }}>
                        {course.title}
                      </div>
                      <div style={{ color:T.muted, fontSize:12, fontWeight:700 }}>
                        {sessions.length} sessions completed
                      </div>
                    </div>
                    <div style={{ fontFamily:"'Fredoka One',cursive", color:T.lime, fontSize:16 }}>
                      +{sessions.reduce((s,p)=>s+p.xpEarned,0)} XP
                    </div>
                  </div>
                  {sessions.slice(0,5).map((p, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', padding:'7px 0',
                      borderBottom: i < Math.min(sessions.length,5)-1
                        ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:16 }}>{SESSION_META[p.type]?.emoji||'📚'}</span>
                        <span style={{ color:T.white, fontSize:13, fontWeight:600 }}>{p.title}</span>
                      </div>
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ display:'flex', gap:2 }}>
                          {[...Array(3)].map((_,s) => (
                            <span key={s} style={{ fontSize:12,
                              opacity: s < (p.stars||0) ? 1 : 0.15 }}>⭐</span>
                          ))}
                        </div>
                        <span style={{ color:T.lime, fontSize:12, fontWeight:700 }}>+{p.xpEarned} XP</span>
                        <span style={{ color:T.muted, fontSize:11 }}>{timeAgo(p.completedAt)}</span>
                      </div>
                    </div>
                  ))}
                  {sessions.length > 5 && (
                    <div style={{ color:T.muted, fontSize:12, textAlign:'center', paddingTop:8, fontWeight:700 }}>
                      +{sessions.length-5} more completed
                    </div>
                  )}
                </div>
              )) : (
                <div style={{ textAlign:'center', padding:'40px 20px',
                  background:'rgba(13,59,34,.5)', borderRadius:20,
                  border:'2px solid rgba(126,217,87,.15)' }}>
                  <div style={{ fontSize:56 }}>🐸</div>
                  <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22,
                    color:T.muted, marginTop:12 }}>No sessions completed yet</div>
                  <div style={{ color:T.muted, fontSize:14, marginTop:6 }}>
                    Start your first lesson to see progress here!
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom leaves */}
        <div style={{ position:'fixed', bottom:0, left:0, right:0, height:55,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 8px', pointerEvents:'none', zIndex:0 }}>
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿'].map((e,i)=>(
            <span key={i} style={{ fontSize:18+((i*6)%14), opacity:.2,
              animation:`sway ${3+i*.3}s ease-in-out infinite`,
              animationDelay:`${i*.22}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </>
  );
}
