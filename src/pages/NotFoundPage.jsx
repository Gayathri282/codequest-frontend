// frontend/src/pages/NotFoundPage.jsx
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const nav = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#E0F7FF,#B3ECFF)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      fontFamily:"'Nunito',sans-serif", textAlign:'center', padding:24 }}>
      <div style={{ fontSize:96, animation:'bob .6s ease-in-out infinite' }}>🗺️</div>
      <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:64, color:'#FF6B35', margin:'16px 0 8px',
        textShadow:'3px 3px 0 #FF6B3544' }}>404</div>
      <div style={{ fontFamily:"'Boogaloo',cursive", fontSize:28, color:'#1A2340', marginBottom:8 }}>
        Oops! Wrong turn!
      </div>
      <p style={{ color:'#6B82A8', fontSize:16, marginBottom:32, maxWidth:340 }}>
        Looks like this page ran away. Let's get you back on the right track!
      </p>
      <button onClick={() => nav('/')} style={{
        background:'linear-gradient(180deg,#FF6B35,#E85A20)',
        border:'3px solid #FF6B35', borderRadius:14, color:'#fff',
        cursor:'pointer', fontFamily:"'Boogaloo',cursive", fontSize:20,
        padding:'13px 40px', boxShadow:'0 5px 0 #FF6B3588',
      }}>🏃 Run Home!</button>
    </div>
  );
}
