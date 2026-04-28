// frontend/src/pages/NotFoundPage.jsx
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const nav = useNavigate();
  return (
    <>
      <style>{`
        @keyframes bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes sway { 0%,100%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} }
        .cq-404-btn:hover { transform:translateY(-3px); filter:brightness(1.1); }
      `}</style>
      <div style={{
        minHeight:'100vh',
        background:'radial-gradient(ellipse at 50% 20%,#0D3B22 0%,#062213 55%,#041A0E 100%)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        fontFamily:"'Quicksand',sans-serif", textAlign:'center', padding:24, position:'relative',
      }}>
        {/* Leaves */}
        {['8%','88%','4%','92%'].map((l,i) => (
          <div key={i} style={{ position:'absolute', left:l, top:`${15+i*18}%`,
            fontSize:28+i*4, opacity:.35,
            animation:`sway ${3+i*.4}s ease-in-out infinite`, animationDelay:`${i*.35}s` }}>🍃</div>
        ))}

        <div style={{ fontSize:96, animation:'bob 2s ease-in-out infinite', display:'inline-block' }}>🗺️</div>

        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:80, color:'#FF6B35',
          margin:'8px 0 4px', textShadow:'4px 4px 0 rgba(255,107,53,.25)', lineHeight:1 }}>
          404
        </div>

        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:28, color:'#E8FFF5', marginBottom:12 }}>
          Oops! Wrong turn!
        </div>

        <p style={{ color:'rgba(232,255,245,.72)', fontSize:16, marginBottom:36,
          maxWidth:340, fontWeight:600, lineHeight:1.6 }}>
          Looks like this page ran away into the jungle. Let's get you back on the right track!
        </p>

        <button onClick={() => nav('/')} className="cq-404-btn" style={{
          background:'linear-gradient(180deg,#FF6B35,#E8501A)',
          border:'3px solid #FF6B35', borderRadius:16, color:'#fff',
          cursor:'pointer', fontFamily:"'Fredoka One',cursive", fontSize:20,
          padding:'14px 44px', boxShadow:'0 6px 0 #C04A1A',
          transition:'transform .15s, filter .15s',
        }}>🐸 Go Home!</button>

        {/* Bottom leaves */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 8px', pointerEvents:'none' }}>
          {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿'].map((e,i)=>(
            <span key={i} style={{ fontSize:18+((i*6)%14), opacity:.35,
              animation:`sway ${3+i*.3}s ease-in-out infinite`, animationDelay:`${i*.22}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </>
  );
}
