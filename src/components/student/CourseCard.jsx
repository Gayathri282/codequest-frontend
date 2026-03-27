// frontend/src/components/student/CourseCard.jsx
import XpBar from '../shared/XpBar';

export default function CourseCard({ course, onClick }) {
  const completed  = course.completedCount || 0;
  const total      = course.sessions?.length || course.levels || 1;
  const pct        = Math.round((completed / total) * 100);
  const color      = course.color || '#00C8E8';

  return (
    <div
      onClick={() => !course.isLocked && onClick?.(course)}
      onMouseEnter={e => { if (!course.isLocked) { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 14px 36px ${color}44`; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      style={{
        background: course.isLocked ? '#F0F8FF' : `linear-gradient(135deg,${color}22,#fff)`,
        border: `3px solid ${course.isLocked ? '#C8EEFF' : color}`,
        borderRadius: 20, padding: 20,
        boxShadow: `0 6px 0 ${course.isLocked ? '#C8EEFF' : color}66`,
        opacity: course.isLocked ? .65 : 1,
        cursor: course.isLocked ? 'not-allowed' : 'pointer',
        transition: 'transform .2s, box-shadow .2s',
        position: 'relative', fontFamily: "'Nunito',sans-serif",
      }}>
      {course.isLocked && <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 22 }}>🔒</div>}

      <div style={{ fontSize: 42, marginBottom: 8 }}>{course.emoji}</div>
      <div style={{ fontFamily: "'Boogaloo',cursive", fontSize: 19, color: course.isLocked ? '#6B82A8' : '#1A2340' }}>
        {course.title}
      </div>
      <div style={{ color: '#6B82A8', fontSize: 12, margin: '2px 0 12px' }}>{course.subject || course.sub}</div>

      {/* Level dots */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {Array.from({ length: Math.min(total, 16) }).map((_, i) => (
          <div key={i} style={{
            width: 11, height: 11, borderRadius: '50%',
            background: i < completed ? color : '#D8ECF8',
            border: `1.5px solid ${i < completed ? color : '#B8D8EC'}`,
            boxShadow: i < completed ? `0 0 6px ${color}88` : 'none',
          }} />
        ))}
        {total > 16 && <span style={{ color: '#6B82A8', fontSize: 11 }}>+{total - 16} more</span>}
      </div>

      <XpBar pct={pct} color={color} h={10} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#6B82A8' }}>
        <span>{completed}/{total} levels</span>
        <span style={{ color: color, fontWeight: 700 }}>{pct}%</span>
      </div>
    </div>
  );
}
