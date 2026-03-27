// frontend/src/components/shared/Hud.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../context/AuthContext';
import XpBar           from './XpBar';

const navBtn = {
  background: 'rgba(255,255,255,.13)', border: '2px solid rgba(255,255,255,.22)',
  borderRadius: 10, color: '#E8FFF5', cursor: 'pointer',
  padding: '6px 14px', fontFamily: "'Fredoka One',cursive", fontSize: 13,
};

export default function Hud() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;

  const xpPct = Math.round(((user.xp % 500) / 500) * 100);

  return (
    <div style={{
      background: 'linear-gradient(90deg,#062213,#0D3B22,#1A6B3C,#0D3B22,#062213)',
      borderBottom: '4px solid #041A0E',
      padding: '9px 20px', display: 'flex', alignItems: 'center',
      gap: 12, flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 50,
    }}>

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer',
        padding:'4px 12px', background:'rgba(126,217,87,.12)', borderRadius:10,
        border:'1.5px solid rgba(126,217,87,.3)' }}
        onClick={() => nav('/dashboard')}>
        <span style={{ fontSize:20, animation:'sway 3s ease-in-out infinite' }}>🐸</span>
        <span style={{ fontFamily:"'Fredoka One',cursive", color:'#7ED957',
          fontSize:17, letterSpacing:.5 }}>CodeQuest</span>
      </div>

      {/* Avatar */}
      <div style={{
        width:40, height:40, borderRadius:'50%',
        background:'linear-gradient(135deg,#7ED957,#00C8A0)',
        border:'2.5px solid rgba(255,255,255,.3)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:20, flexShrink:0, animation:'wobble 2s ease-in-out infinite',
      }}>{user.avatarEmoji || '🐸'}</div>

      {/* Name + level + bar */}
      <div style={{ flex:1, minWidth:120 }}>
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:14, color:'#E8FFF5', lineHeight:1.2 }}>
          {user.displayName || user.username}
        </div>
        <div style={{ color:'rgba(232,255,245,.6)', fontSize:10, marginBottom:2 }}>⚡ Level {user.level}</div>
        <XpBar pct={xpPct} color='#7ED957' h={6} />
      </div>

      {/* Stats */}
      {[
        { icon:'🪙', val: user.coins },
        { icon:'🔥', val: `${user.streakDays}d` },
      ].map(s => (
        <div key={s.icon} style={{
          background:'rgba(255,255,255,.1)', borderRadius:10,
          padding:'4px 10px', textAlign:'center', minWidth:46,
        }}>
          <div style={{ fontSize:15 }}>{s.icon}</div>
          <div style={{ fontFamily:"'Fredoka One',cursive", color:'#E8FFF5', fontSize:11 }}>{s.val}</div>
        </div>
      ))}

      <button onClick={() => nav('/progress')} style={navBtn}>📊 Progress</button>
      <button onClick={() => { logout(); nav('/'); }}
        style={{ ...navBtn, background:'rgba(0,0,0,.25)' }}>Exit</button>
    </div>
  );
}
