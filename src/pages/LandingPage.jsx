// frontend/src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom';

/* ─── Rainforest colour tokens ─────────────────────────────────── */
const T = {
  deepJungle:  '#062213',
  jungle:      '#0D3B22',
  midGreen:    '#1A6B3C',
  lime:        '#7ED957',
  teal:        '#00C8A0',
  cyan:        '#00C8E8',
  gold:        '#FFD700',
  white:       '#E8FFF5',
};

/* ─── Leaf component (reusable floating leaf) ────────────────────*/
function Leaf({ style }) {
  return (
    <div style={{ fontSize: 28, position:'absolute', opacity:.7,
      animation:'sway 4s ease-in-out infinite', ...style }}>🍃</div>
  );
}

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <>
      {/* ── Global keyframes injected once ── */}
      <style>{`
        @keyframes bob     { 0%,100%{transform:translateY(0)}     50%{transform:translateY(-14px)} }
        @keyframes sway    { 0%,100%{transform:rotate(-8deg)}     50%{transform:rotate(8deg)} }
        @keyframes float   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(8deg)} }
        @keyframes rain    { 0%{transform:translateY(-60px);opacity:0} 10%{opacity:.5} 100%{transform:translateY(110vh);opacity:0} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 18px #00C8A066} 50%{box-shadow:0 0 40px #00C8A0CC} }
        @keyframes shimmer { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes rise    { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:none} }
        @keyframes wink    { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(.1)} }
        .land-btn:hover    { filter:brightness(1.12); transform:translateY(-3px) !important; }
        .feat-chip:hover   { transform:scale(1.06); background:rgba(0,200,160,.25) !important; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(175deg, ${T.deepJungle} 0%, ${T.jungle} 45%, ${T.midGreen} 100%)`,
        /*
         * ── BACKGROUND IMAGE SLOT ──────────────────────────────────────
         * Drop your rainforest JPG into:  frontend/public/rainforest-bg.jpg
         * Then uncomment the two lines below:
         *
         * backgroundImage: "url('/rainforest-bg.jpg')",
         * backgroundSize: 'cover', backgroundPosition: 'center',
         *
         * The gradient above will sit on top as a dark tint (keep it, it ensures text readability).
         * Wrap the gradient in a semi-transparent overlay instead:
         *   change the gradient alpha values: e.g. #062213CC → #062213CC
         * ────────────────────────────────────────────────────────────── */
        fontFamily: "'Quicksand','Nunito',sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* ── Rain drops ── */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 5.8 + 1) % 100}%`,
            top: 0,
            width: 2,
            height: `${24 + (i % 4) * 10}px`,
            background: `linear-gradient(180deg, transparent, ${T.cyan}88)`,
            borderRadius: 2,
            animation: `rain ${2.4 + (i % 5) * 0.4}s linear infinite`,
            animationDelay: `${(i * 0.31) % 3}s`,
            zIndex: 1,
          }} />
        ))}

        {/* ── Floating leaves ── */}
        <Leaf style={{ top:'8%',  left:'5%',  animationDelay:'0s',   fontSize:40 }} />
        <Leaf style={{ top:'15%', right:'6%', animationDelay:'.9s',  fontSize:32 }} />
        <Leaf style={{ top:'55%', left:'3%',  animationDelay:'1.6s', fontSize:36 }} />
        <Leaf style={{ top:'60%', right:'4%', animationDelay:'.4s',  fontSize:44 }} />
        <Leaf style={{ top:'30%', left:'18%', animationDelay:'2s',   fontSize:24 }} />
        <Leaf style={{ top:'25%', right:'16%',animationDelay:'1.2s', fontSize:26 }} />

        {/* ── Jungle foliage strip (bottom) ── */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:90,
          display:'flex', alignItems:'flex-end', justifyContent:'space-around',
          padding:'0 12px', zIndex:5, pointerEvents:'none' }}>
          {['🌿','🌱','🍀','🌿','🌱','🍀','🌿','🌱','🍀','🌿','🌱','🍀','🌿','🌱'].map((e,i)=>(
            <div key={i} style={{ fontSize: 28+((i*7)%20),
              animation:`sway ${3+i*.3}s ease-in-out infinite`,
              animationDelay:`${i*.22}s`, opacity:.85 }}>{e}</div>
          ))}
        </div>

        {/* ── Fireflies ── */}
        {[14,29,45,62,78,91].map((l,i)=>(
          <div key={i} style={{
            position:'absolute', left:`${l}%`, top:`${20+(i*11)%50}%`,
            width:6, height:6, borderRadius:'50%',
            background: i%2===0 ? T.lime : T.teal,
            animation:`shimmer ${1.2+i*.3}s ease-in-out infinite`,
            animationDelay:`${i*.4}s`, zIndex:2,
            boxShadow: `0 0 8px ${i%2===0 ? T.lime : T.teal}`,
          }} />
        ))}

        {/* ══════════════════════════════════════════════════
            NAV BAR
        ══════════════════════════════════════════════════ */}
        <nav style={{ position:'relative', zIndex:20,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'18px 36px', flexWrap:'wrap', gap:12 }}>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:32, animation:'bob 2s ease-in-out infinite' }}>🐸</div>
            <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:22,
              color:T.lime, letterSpacing:.5 }}>CodeQuest</span>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <NavBtn onClick={()=>nav('/login')}    color={T.teal}>Log In</NavBtn>
            <NavBtn onClick={()=>nav('/register')} color={T.lime} dark>Join Free 🚀</NavBtn>
          </div>
        </nav>

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <div style={{ position:'relative', zIndex:10,
          display:'flex', flexDirection:'column', alignItems:'center',
          textAlign:'center', padding:'10px 24px 140px', gap:0 }}>

          {/* Character */}
          <div style={{ animation:'bob 1.8s ease-in-out infinite',
            filter:'drop-shadow(0 12px 28px rgba(0,200,160,.4))',
            fontSize: 110, lineHeight:1, marginBottom:4, animation:'wink 5s ease-in-out infinite' }}>
            🐸
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:20, animation:'rise .6s ease both' }}>
            {['🍃','🌺','🌿','🌺','🍃'].map((e,i)=>(
              <span key={i} style={{ fontSize:22,
                animation:`float ${2+i*.4}s ease-in-out infinite`,
                animationDelay:`${i*.25}s` }}>{e}</span>
            ))}
          </div>

          {/* Title card */}
          <div style={{
            background: 'rgba(6,34,19,.75)',
            backdropFilter: 'blur(14px)',
            border: `2px solid ${T.teal}55`,
            borderRadius: 28,
            padding: '32px 48px 28px',
            maxWidth: 620,
            boxShadow: `0 20px 60px rgba(0,0,0,.4), inset 0 1px 0 ${T.teal}44`,
            animation: 'glow 3s ease-in-out infinite',
            marginBottom: 24,
          }}>
            <h1 style={{
              fontFamily:"'Fredoka One',cursive",
              fontSize: 'clamp(42px,9vw,84px)',
              lineHeight: 1.05,
              background: `linear-gradient(135deg, ${T.lime}, ${T.teal}, ${T.cyan})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 10px',
            }}>
              CodeQuest
            </h1>

            <p style={{ color:T.white, fontSize:'clamp(14px,2.2vw,18px)',
              fontWeight:600, lineHeight:1.7, margin:'0 0 26px' }}>
              Learn to code on an <span style={{ color:T.lime }}>epic jungle adventure</span>.<br/>
              Build real websites, earn XP, collect coins —<br/>
              <span style={{ color:T.cyan }}>no boring textbooks, just quests!</span>
            </p>

            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <HeroBtn onClick={()=>nav('/register')} bg={T.lime}  dark>
                🌿 Start Adventure!
              </HeroBtn>
              <HeroBtn onClick={()=>nav('/login')}   bg={T.teal}>
                🔑 Already a Coder?
              </HeroBtn>
            </div>
          </div>

          {/* Feature chips */}
          <div style={{ display:'flex', gap:9, flexWrap:'wrap', justifyContent:'center',
            maxWidth:640, animation:'rise .8s .2s ease both' }}>
            {[
              '🪙 Earn Coins',
              '⚡ Level Up',
              '🎯 Quiz Battles',
              '💻 Live Code Editor',
              '🏅 Unlock Badges',
              '🌐 Build Real Websites',
              '📊 Track Progress',
              '🐸 Guided by Ribbit',
            ].map(f => (
              <div key={f} className="feat-chip" style={{
                background: 'rgba(0,200,160,.15)',
                border: `1.5px solid ${T.teal}55`,
                borderRadius: 50,
                padding: '7px 16px',
                color: T.white,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'default',
                transition: 'transform .2s, background .2s',
              }}>{f}</div>
            ))}
          </div>

          {/* Courses teaser — scales with actual course count */}
          <div style={{ marginTop:32, color:`${T.white}88`, fontSize:13, fontWeight:600,
            animation:'rise 1s .4s ease both' }}>
            🗺️ Explore courses in HTML · CSS · Python · JavaScript · and more
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Small nav button ── */
function NavBtn({ children, onClick, color, dark }) {
  return (
    <button
      className="land-btn"
      onClick={onClick}
      style={{
        background: dark ? color : 'transparent',
        border: `2px solid ${color}`,
        borderRadius: 10,
        color: dark ? T.deepJungle : color,
        cursor: 'pointer',
        fontFamily: "'Fredoka One',cursive",
        fontSize: 15,
        padding: '8px 20px',
        transition: 'transform .15s, filter .15s',
        fontWeight: 700,
      }}>
      {children}
    </button>
  );
}

/* ── Big hero CTA button ── */
function HeroBtn({ children, onClick, bg, dark }) {
  return (
    <button
      className="land-btn"
      onClick={onClick}
      style={{
        background: `linear-gradient(180deg, ${bg}, ${bg}CC)`,
        border: `3px solid ${bg}`,
        borderRadius: 16,
        color: dark ? T.deepJungle : '#fff',
        cursor: 'pointer',
        fontFamily: "'Fredoka One',cursive",
        fontSize: 20,
        padding: '15px 44px',
        boxShadow: `0 6px 0 ${bg}66`,
        transition: 'transform .15s, filter .15s',
        fontWeight: 700,
      }}>
      {children}
    </button>
  );
}
