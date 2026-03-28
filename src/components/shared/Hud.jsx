// frontend/src/components/shared/Hud.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../context/AuthContext';
import XpBar           from './XpBar';

export default function Hud() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;

  const xpPct = Math.round(((user.xp % 500) / 500) * 100);

  return (
    <div style={{
      background: 'linear-gradient(90deg,#041A0E,#062213,#0D3B22,#062213,#041A0E)',
      borderBottom: '3px solid rgba(255,107,53,.4)',
      padding: '9px 20px', display: 'flex', alignItems: 'center',
      gap: 12, flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 50,
    }}>

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer',
        padding:'4px 12px', background:'rgba(126,217,87,.15)', borderRadius:10,
        border:'1.5px solid rgba(126,217,87,.4)' }}
        onClick={() => nav('/dashboard')}>
        <span style={{ fontSize:20 }}>🐸</span>
        <span style={{ fontFamily:"'Fredoka One',cursive", color:'#7ED957',
          fontSize:17, letterSpacing:.5 }}>CodeQuest</span>
      </div>

      {/* Avatar */}
      <div style={{
        width:40, height:40, borderRadius:'50%',
        background:'linear-gradient(135deg,#FF6B35,#FF8C42)',
        border:'2.5px solid rgba(255,107,53,.6)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:20, flexShrink:0,
      }}>{user.avatarEmoji || '🐸'}</div>

      {/* Name + level + bar */}
      <div style={{ flex:1, minWidth:120 }}>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:14, color:'#E8FFF5', lineHeight:1.2 }}>
          {user.displayName || user.username}
        </div>
        <div style={{ color:'rgba(232,255,245,.72)', fontSize:10, marginBottom:2 }}>⚡ Level {user.level}</div>
        <XpBar pct={xpPct} color='#FF6B35' h={6} />
      </div>

      {/* Stats */}
      {[
        { icon:'🪙', val: user.coins,              color:'#FFD700',  bg:'rgba(255,215,0,.12)',   border:'rgba(255,215,0,.4)'  },
        { icon:'🔥', val: `${user.streakDays}d`,   color:'#FF8C42',  bg:'rgba(255,140,66,.12)',  border:'rgba(255,140,66,.4)' },
      ].map(s => (
        <div key={s.icon} style={{
          background: s.bg, border:`1.5px solid ${s.border}`,
          borderRadius:10, padding:'4px 10px', textAlign:'center', minWidth:46,
        }}>
          <div style={{ fontSize:15 }}>{s.icon}</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", color: s.color, fontSize:11 }}>{s.val}</div>
        </div>
      ))}

      <button onClick={() => nav('/progress')} style={navBtn('#00C8A0','rgba(0,200,160,.15)','rgba(0,200,160,.4)')}>
        📊 Progress
      </button>
      <button onClick={() => { logout(); nav('/'); }} style={navBtn('#FF9999','rgba(255,71,87,.12)','rgba(255,71,87,.35)')}>
        Exit
      </button>
    </div>
  );
}

function navBtn(color, bg, border) {
  return {
    background: bg, border: `1.5px solid ${border}`,
    borderRadius: 10, color, cursor: 'pointer',
    padding: '6px 14px', fontFamily: "'Fredoka One',cursive", fontSize: 13,
  };
}
