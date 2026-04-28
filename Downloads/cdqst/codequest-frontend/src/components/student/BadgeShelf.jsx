// frontend/src/components/student/BadgeShelf.jsx
export default function BadgeShelf({ badges = [], earned = [] }) {
  const earnedIds = new Set(earned.map(b => b.id || b.badgeId));

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {badges.map(b => {
        const isEarned = earnedIds.has(b.id);
        return (
          <div key={b.id} title={b.description} style={{
            background: isEarned ? 'linear-gradient(135deg,#FFF9E0,#FFF0C0)' : '#F0F8FF',
            border: `3px solid ${isEarned ? '#FFD700' : '#C8EEFF'}`,
            borderRadius: 18, padding: '13px 16px', textAlign: 'center',
            opacity: isEarned ? 1 : .45, minWidth: 86,
            boxShadow: isEarned ? '0 6px 0 #FFD70066' : 'none',
            transition: 'transform .2s',
            cursor: 'default',
            fontFamily: "'Nunito',sans-serif",
          }}
            onMouseEnter={e => { if (isEarned) e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            <div style={{ fontSize: 30 }}>{b.emoji}</div>
            <div style={{ fontFamily: "'Boogaloo',cursive", color: isEarned ? '#FF6B35' : '#6B82A8', fontSize: 12, marginTop: 4 }}>
              {b.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
