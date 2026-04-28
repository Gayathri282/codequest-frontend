// frontend/src/pages/StudentSettingsPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const T = {
  deep:'#041A0E', dark:'#062213', mid:'#0D3B22',
  lime:'#7ED957', teal:'#00C8A0', cyan:'#00C8E8',
  orange:'#FF6B35', gold:'#FFD700', white:'#E8FFF5',
  muted:'rgba(232,255,245,.72)',
};

const AVATARS = [
  '🐸','🦊','🐱','🐻','🐼','🐨','🐯','🦁','🐰','🐮',
  '🐙','🦄','🐧','🦋','🦔','🐺','🦝','🐵','🦉','🐊',
];

export default function StudentSettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const nav = useNavigate();

  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selected,    setSelected]    = useState(user?.avatarEmoji || '🐸');

  async function save() {
    setSaving(true); setSaved(false);
    try {
      await api.patch('/users/me', { avatarEmoji: selected, displayName: displayName.trim() || undefined });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  }

  return (
    <>
      <style>{`
        @keyframes sway    { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes pop     { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
        @keyframes fall    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes bob     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .cq-av:hover { transform:scale(1.2) !important; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background:`radial-gradient(ellipse at 50% 15%,#0D3B22 0%,#062213 55%,#041A0E 100%)`,
        fontFamily:"'Quicksand',sans-serif", position:'relative', overflow:'hidden',
      }}>

        {/* Fireflies */}
        {[{l:'7%',t:'12%',d:'0s',c:T.lime},{l:'88%',t:'18%',d:'.6s',c:T.orange},
          {l:'50%',t:'6%',d:'.9s',c:T.teal},{l:'14%',t:'70%',d:'1.2s',c:T.lime},
          {l:'82%',t:'72%',d:'.3s',c:T.orange}].map((f,i) => (
          <div key={i} style={{ position:'absolute', left:f.l, top:f.t, width:6, height:6,
            borderRadius:'50%', background:f.c, boxShadow:`0 0 10px ${f.c}`,
            animation:`shimmer ${1.4+i*.3}s ease-in-out infinite`,
            animationDelay:f.d, pointerEvents:'none' }} />
        ))}

        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 24px', flexWrap:'wrap', gap:10,
          borderBottom:`2px solid rgba(255,107,53,.3)`,
          background:'rgba(4,26,14,.92)', backdropFilter:'blur(10px)',
          position:'sticky', top:0, zIndex:20,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}
            onClick={() => nav('/dashboard')}>
            <span style={{ fontSize:22, animation:'sway 3s ease-in-out infinite' }}>🐸</span>
            <span style={{ fontFamily:"'Fredoka One',cursive", color:T.lime, fontSize:18 }}>CodeQuest</span>
          </div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:T.orange }}>
            ⚙️ Settings
          </div>
          <button onClick={() => nav('/dashboard')} style={backBtn}>← Back</button>
        </div>

        <div style={{ maxWidth:500, margin:'0 auto', padding:'36px 24px 80px' }}>

          {/* Character preview */}
          <div style={{ textAlign:'center', marginBottom:32, animation:'fall .4s ease both' }}>
            <div style={{
              fontSize:96, lineHeight:1,
              filter:`drop-shadow(0 0 28px ${T.orange}88)`,
              animation:'bob 2s ease-in-out infinite', marginBottom:8,
            }}>
              {selected}
            </div>
            <div style={{ fontFamily:"'Fredoka One',cursive", color:T.muted, fontSize:14 }}>
              {user?.displayName || user?.username}
            </div>
          </div>

          {/* Display name */}
          <div style={{
            background:'rgba(13,59,34,.9)', border:`2px solid rgba(255,107,53,.35)`,
            borderRadius:20, padding:'20px 24px', marginBottom:16,
            animation:'fall .4s .05s ease both',
          }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", color:T.white, fontSize:16, marginBottom:12 }}>
              📝 Display Name
            </div>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={30}
              placeholder={user?.username}
              style={{
                width:'100%', background:'rgba(255,255,255,.1)',
                border:`2px solid rgba(255,107,53,.4)`, borderRadius:12,
                padding:'10px 14px', color:T.white,
                fontFamily:"'Quicksand',sans-serif", fontSize:15, fontWeight:700,
                outline:'none', boxSizing:'border-box',
              }}
            />
          </div>

          {/* Character picker */}
          <div style={{
            background:'rgba(13,59,34,.9)', border:`2px solid rgba(126,217,87,.3)`,
            borderRadius:20, padding:'20px 24px', marginBottom:28,
            animation:'fall .4s .1s ease both',
          }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", color:T.white, fontSize:16, marginBottom:4 }}>
              🌿 Pick Your Jungle Buddy
            </div>
            <div style={{ color:T.muted, fontSize:12, fontWeight:700, marginBottom:16 }}>
              Tap any character to choose it
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
              {AVATARS.map(emoji => (
                <button key={emoji} onClick={() => setSelected(emoji)} className="cq-av"
                  style={{
                    background: selected === emoji ? `${T.orange}33` : 'rgba(255,255,255,.08)',
                    border:`2.5px solid ${selected === emoji ? T.orange : 'rgba(255,255,255,.2)'}`,
                    borderRadius:14, padding:'10px 0', fontSize:34,
                    cursor:'pointer', transition:'transform .15s, border-color .15s',
                    boxShadow: selected === emoji ? `0 0 14px ${T.orange}55` : 'none',
                  }}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button onClick={save} disabled={saving} style={{
            width:'100%', padding:'16px',
            fontFamily:"'Fredoka One',cursive", fontSize:20,
            background: saved
              ? `linear-gradient(180deg,${T.teal},#007B62)`
              : `linear-gradient(180deg,${T.orange},#E8501A)`,
            border:`3px solid ${saved ? T.teal : T.orange}`,
            borderRadius:18, color:'#fff',
            cursor: saving ? 'wait' : 'pointer',
            boxShadow:`0 8px 0 ${saved ? '#005B46' : '#C04A1A'}`,
            transition:'background .3s, border-color .3s', letterSpacing:.5,
          }}>
            {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
          </button>

          {/* Danger zone */}
          <div style={{ marginTop:40, borderTop:`1px solid rgba(255,255,255,.12)`,
            paddingTop:24, animation:'fall .4s .2s ease both' }}>
            <div style={{ fontFamily:"'Fredoka One',cursive", color:'rgba(232,255,245,.5)',
              fontSize:13, marginBottom:14, letterSpacing:.5 }}>
              ACCOUNT
            </div>
            <button onClick={() => { logout(); nav('/'); }} style={{
              width:'100%', padding:'12px',
              fontFamily:"'Fredoka One',cursive", fontSize:16,
              background:'rgba(255,71,87,.15)', border:'2px solid rgba(255,71,87,.45)',
              borderRadius:14, color:'#FF9999', cursor:'pointer',
            }}>
              🚪 Log Out
            </button>
          </div>
        </div>

        {/* Bottom leaves */}
        <div style={{ position:'fixed', bottom:0, left:0, right:0, height:55,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 8px', pointerEvents:'none', zIndex:0 }}>
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿'].map((e,i)=>(
            <span key={i} style={{ fontSize:18+((i*6)%14), opacity:.35,
              animation:`sway ${3+i*.3}s ease-in-out infinite`, animationDelay:`${i*.22}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </>
  );
}

const backBtn = {
  background:'rgba(255,107,53,.18)', border:'1.5px solid rgba(255,107,53,.5)',
  borderRadius:12, padding:'6px 16px', cursor:'pointer',
  fontFamily:"'Fredoka One',cursive", color:'#FF8C60', fontSize:13,
};
