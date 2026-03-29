// frontend/src/pages/CoursesListPage.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../context/AuthContext';
import { useCourseContext } from '../context/CourseContext';
import LoadingScreen   from '../components/shared/LoadingScreen';
import Hud             from '../components/shared/Hud';

const T = {
  deep:'#041A0E', dark:'#062213', mid:'#0D3B22',
  lime:'#7ED957', teal:'#00C8A0', cyan:'#00C8E8',
  orange:'#FF6B35', gold:'#FFD700', white:'#E8FFF5',
};

export default function CoursesListPage() {
  const { user }             = useAuth();
  const { courses, loading } = useCourseContext();
  const nav                  = useNavigate();

  if (loading) return <LoadingScreen />;

  return (
    <>
      <style>{`
        @keyframes sway    { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes rise    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes bob     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .cq-course-card:hover { transform:translateY(-6px) scale(1.02) !important; }
      `}</style>

      <div style={{
        minHeight:'100vh',
        background:`radial-gradient(ellipse at 50% 20%,#0D3B22 0%,#062213 55%,#041A0E 100%)`,
        fontFamily:"'Quicksand',sans-serif", position:'relative', overflow:'hidden',
      }}>

        {/* Fireflies */}
        {[{l:'6%',t:'15%',d:'0s',c:T.lime},{l:'90%',t:'12%',d:'.7s',c:T.teal},
          {l:'12%',t:'70%',d:'1.2s',c:T.orange},{l:'85%',t:'75%',d:'.4s',c:T.lime},
          {l:'50%',t:'6%',d:'1s',c:T.teal},{l:'30%',t:'88%',d:'1.6s',c:T.orange}].map((f,i)=>(
          <div key={i} style={{ position:'absolute', left:f.l, top:f.t, width:6, height:6,
            borderRadius:'50%', background:f.c, boxShadow:`0 0 10px ${f.c}`,
            animation:`shimmer ${1.4+i*.3}s ease-in-out infinite`,
            animationDelay:f.d, pointerEvents:'none' }} />
        ))}

        <Hud />

        {/* Content */}
        <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 20px 80px', position:'relative', zIndex:2 }}>

          <div style={{ textAlign:'center', marginBottom:40, animation:'rise .4s ease both' }}>
            <div style={{ fontSize:52, animation:'bob 2s ease-in-out infinite', display:'inline-block',
              filter:`drop-shadow(0 0 20px ${T.lime}88)` }}>
              {user?.avatarEmoji || '🐸'}
            </div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:28, color:T.white, marginTop:12 }}>
              Pick a Course, {user?.displayName || user?.username || 'Explorer'}!
            </div>
            <div style={{ color:'rgba(232,255,245,.55)', fontSize:14, fontWeight:600, marginTop:6 }}>
              Each course is a new jungle adventure 🌿
            </div>
          </div>

          {courses.length === 0 && (
            <div style={{ textAlign:'center', marginTop:60, color:'rgba(232,255,245,.45)' }}>
              <div style={{ fontSize:60, marginBottom:16 }}>🌱</div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:'rgba(232,255,245,.6)', marginBottom:8 }}>
                No courses yet!
              </div>
              <div style={{ fontSize:14, fontWeight:600 }}>
                Ask your admin to add courses, or run the seed script in the backend.
              </div>
              {user?.role === 'ADMIN' && (
                <button onClick={() => nav('/admin')} style={{
                  marginTop:20, background:T.teal, border:'none', borderRadius:12,
                  padding:'10px 24px', cursor:'pointer', fontFamily:"'Fredoka One',cursive",
                  color:'#041A0E', fontSize:16,
                }}>Go to Admin Panel →</button>
              )}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:20 }}>
            {courses.map((course, i) => {
              const done = (course.sessions||[]).filter(s=>s.completed).length;
              const tot  = (course.sessions||[]).length || 1;
              const pct  = Math.round((done/tot)*100);
              const color = course.color || T.teal;
              const isLocked = course.isLocked;

              return (
                <div
                  key={course.id}
                  className="cq-course-card"
                  onClick={() => !isLocked && nav(`/course/${course.id}`)}
                  style={{
                    background: isLocked
                      ? 'rgba(13,59,34,.5)'
                      : `linear-gradient(160deg,${color}22,rgba(13,59,34,.95))`,
                    border:`3px solid ${isLocked ? 'rgba(255,255,255,.12)' : color+'66'}`,
                    borderRadius:24, padding:'24px 22px',
                    cursor: isLocked ? 'default' : 'pointer',
                    opacity: isLocked ? 0.6 : 1,
                    transition:'transform .2s, box-shadow .2s',
                    boxShadow: isLocked ? 'none' : `0 8px 0 ${color}33`,
                    position:'relative', overflow:'hidden',
                    animation:`rise .4s ${i*0.07}s ease both`,
                  }}
                >
                  {isLocked && (
                    <div style={{ position:'absolute', top:14, right:14, fontSize:22, opacity:.7 }}>🔒</div>
                  )}
                  {!isLocked && pct === 100 && (
                    <div style={{ position:'absolute', top:14, right:14, fontSize:20 }}>✅</div>
                  )}

                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
                    <div style={{ fontSize:52, animation:`bob ${2+i*.2}s ease-in-out infinite`,
                      animationDelay:`${i*.3}s`, filter:`drop-shadow(0 0 12px ${color}88)` }}>
                      {course.emoji || '🌿'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:T.white, lineHeight:1.2 }}>
                        {course.title}
                      </div>
                      {course.description && (
                        <div style={{ color:'rgba(232,255,245,.6)', fontSize:12, fontWeight:600,
                          marginTop:4, lineHeight:1.5,
                          display:'-webkit-box', WebkitLineClamp:2,
                          WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {course.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Session count + type chips */}
                  <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                    <span style={{ background:`${color}22`, border:`1.5px solid ${color}55`,
                      borderRadius:50, padding:'3px 12px', fontSize:12, fontWeight:700, color }}>
                      📚 {tot} sessions
                    </span>
                    {isLocked && (
                      <span style={{ background:'rgba(255,215,0,.15)', border:'1.5px solid rgba(255,215,0,.4)',
                        borderRadius:50, padding:'3px 12px', fontSize:12, fontWeight:700, color:T.gold }}>
                        👑 Premium
                      </span>
                    )}
                    {!isLocked && (
                      <span style={{ background:'rgba(126,217,87,.15)', border:`1.5px solid ${T.lime}44`,
                        borderRadius:50, padding:'3px 12px', fontSize:12, fontWeight:700, color:T.lime }}>
                        🆓 Free
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ color:'rgba(232,255,245,.55)', fontSize:11, fontWeight:700 }}>
                        {done}/{tot} completed
                      </span>
                      <span style={{ color, fontSize:11, fontWeight:700 }}>{pct}%</span>
                    </div>
                    <div style={{ height:8, background:'rgba(255,255,255,.12)', borderRadius:8, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:color,
                        borderRadius:8, transition:'width .6s' }} />
                    </div>
                  </div>

                  {!isLocked && (
                    <div style={{ marginTop:14, textAlign:'right' }}>
                      <span style={{ fontFamily:"'Fredoka One',cursive", color,
                        fontSize:14, display:'inline-flex', alignItems:'center', gap:4 }}>
                        {pct > 0 ? 'Continue' : 'Start'} →
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom leaves */}
        <div style={{ position:'fixed', bottom:0, left:0, right:0, height:55,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 8px', pointerEvents:'none', zIndex:0 }}>
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿'].map((e,i)=>(
            <span key={i} style={{ fontSize:18+((i*6)%14), opacity:.35,
              animation:`sway ${3+i*.3}s ease-in-out infinite`,
              animationDelay:`${i*.22}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </>
  );
}
