// frontend/src/components/student/ProgressCard.jsx
// Full progress report card — used on /progress page and parent dashboard
import XpBar        from '../shared/XpBar';
import BadgeShelf   from './BadgeShelf';
import { formatXpProgress, timeAgo, SESSION_META } from '../../utils/formatters';

const C = {
  orange:'#FF6B35', cyan:'#00C8E8', lime:'#7ED957',
  pink:'#FF4FCB', yellow:'#FFD700', muted:'#6B82A8', txt:'#1A2340',
};

function StatBox({ icon, value, label, color }) {
  return (
    <div style={{ background:`linear-gradient(135deg,${color}18,#fff)`,
      border:`2px solid ${color}44`, borderRadius:16,
      padding:'14px 18px', textAlign:'center', flex:'1 1 100px' }}>
      <div style={{ fontSize:28 }}>{icon}</div>
      <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:24, color, marginTop:4 }}>{value}</div>
      <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{label}</div>
    </div>
  );
}

export default function ProgressCard({ report }) {
  if (!report) return null;
  const { student, courses, badges, totalCompleted, weeklyXp } = report;
  const { level, xpInLevel, xpNeeded, pct } = formatXpProgress(student.xp);

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif" }}>

      {/* ── Student hero card ── */}
      <div style={{ background:`linear-gradient(135deg,${C.cyan}18,#fff)`,
        border:`3px solid ${C.cyan}`, borderRadius:20, padding:24, marginBottom:24,
        boxShadow:`0 6px 0 ${C.cyan}55` }}>
        <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', marginBottom:16 }}>
          <div style={{ fontSize:64, animation:'wobble 2s ease-in-out infinite' }}>
            {student.avatarEmoji||'🏃'}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:26, color:C.orange }}>
              {student.displayName||student.username}
            </div>
            <div style={{ color:C.muted, fontSize:13, margin:'2px 0 10px' }}>
              ⚡ Level {level} · {student.xp} total XP
            </div>
            <XpBar pct={pct} color={C.cyan} h={14} />
            <div style={{ color:C.muted, fontSize:11, marginTop:4 }}>
              {xpInLevel} / {xpNeeded} XP to Level {level+1}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <StatBox icon="🪙" value={student.coins}         label="Coins"        color={C.yellow} />
          <StatBox icon="🔥" value={`${student.streakDays}d`} label="Streak"   color={C.orange} />
          <StatBox icon="✅" value={totalCompleted}          label="Completed"   color={C.lime}   />
          <StatBox icon="⭐" value={`${weeklyXp||0} XP`}    label="This Week"   color={C.cyan}   />
        </div>
      </div>

      {/* ── Badges ── */}
      {badges?.length > 0 && (
        <div style={{ background:`linear-gradient(135deg,${C.yellow}18,#fff)`,
          border:`3px solid ${C.yellow}`, borderRadius:20, padding:24, marginBottom:24,
          boxShadow:`0 6px 0 ${C.yellow}44` }}>
          <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:22, color:C.orange, marginBottom:14 }}>
            🏅 Badges Earned
          </div>
          <BadgeShelf badges={badges} earned={badges} />
        </div>
      )}

      {/* ── Per-course breakdown ── */}
      {courses?.length > 0 ? (
        courses.map(({ course, sessions }) => {
          const typeCount = sessions.reduce((acc, s) => {
            acc[s.type] = (acc[s.type]||0) + 1; return acc;
          }, {});

          return (
            <div key={course.title} style={{ background:'#fff',
              border:`3px solid ${C.border||'#C8EEFF'}`,
              borderRadius:20, padding:20, marginBottom:16,
              boxShadow:`0 4px 0 #C8EEFF66` }}>
              {/* Course header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <span style={{ fontSize:32 }}>{course.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:20, color:C.orange }}>
                    {course.title}
                  </div>
                  <div style={{ color:C.muted, fontSize:12 }}>
                    {sessions.length} sessions completed
                    {Object.entries(typeCount).map(([t,n]) =>
                      ` · ${SESSION_META[t]?.emoji||'📚'} ${n} ${t.toLowerCase()}`
                    ).join('')}
                  </div>
                </div>
                <div style={{ fontFamily:"'Boogaloo',cursive", color:C.orange, fontSize:16 }}>
                  +{sessions.reduce((s,p)=>s+p.xpEarned,0)} XP
                </div>
              </div>

              {/* Recent sessions */}
              <div>
                {sessions.slice(0,5).map((p, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', padding:'7px 0',
                    borderBottom: i < Math.min(sessions.length,5)-1 ? `1px solid #EAF6FF` : 'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:16 }}>{SESSION_META[p.type]?.emoji||'📚'}</span>
                      <span style={{ color:C.txt, fontSize:13, fontWeight:600 }}>{p.title}</span>
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ display:'flex', gap:2 }}>
                        {[...Array(3)].map((_,s) => (
                          <span key={s} style={{ fontSize:12, opacity: s < (p.stars||0) ? 1 : 0.2 }}>⭐</span>
                        ))}
                      </div>
                      <span style={{ color:C.yellow, fontSize:12, fontWeight:700 }}>+{p.xpEarned} XP</span>
                      <span style={{ color:C.muted, fontSize:11 }}>{timeAgo(p.completedAt)}</span>
                    </div>
                  </div>
                ))}
                {sessions.length > 5 && (
                  <div style={{ color:C.muted, fontSize:12, textAlign:'center', paddingTop:8 }}>
                    +{sessions.length-5} more sessions completed
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ textAlign:'center', padding:'40px 20px', background:'#fff',
          borderRadius:20, border:`3px solid #C8EEFF` }}>
          <div style={{ fontSize:56 }}>🏃</div>
          <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:22, color:C.muted, marginTop:12 }}>
            No sessions completed yet
          </div>
          <div style={{ color:C.muted, fontSize:14, marginTop:6 }}>
            Start your first lesson to see progress here!
          </div>
        </div>
      )}
    </div>
  );
}
