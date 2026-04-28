// frontend/src/pages/QuizPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useProgress }      from '../hooks/useProgress';
import { useAuth }          from '../context/AuthContext';
import { useCourseContext } from '../context/CourseContext';
import Hud from '../components/shared/Hud';
import Btn from '../components/shared/Btn';

const C = { orange:'#7ED957', cyan:'#00C8E8', pink:'#00C8A0', lime:'#7ED957', red:'#FF4757', yellow:'#FFD700', teal:'#00C8A0', gold:'#FFD700' };
const OPTS = ['A','B','C','D'];
const OPT_FIELDS = ['optionA','optionB','optionC','optionD'];

// Medal config: maps stars (0-3) to gold / silver / brass / none
const MEDALS = {
  3: { emoji:'🥇', label:'GOLD',   color:'#FFD700', bg:'#FFFBE6', border:'#F0C000', shadow:'#B8860B66', text:'Perfect Score!' },
  2: { emoji:'🥈', label:'SILVER', color:'#A8B8C8', bg:'#F0F4F8', border:'#9AAABB', shadow:'#7A909966', text:'Great Job!'     },
  1: { emoji:'🥉', label:'BRASS',  color:'#C9894C', bg:'#FFF5EC', border:'#B8743A', shadow:'#8B522066', text:'Keep Going!'    },
  0: { emoji:'😢', label:'',       color:'#6B82A8', bg:'#F4F8FF', border:'#C8EEFF', shadow:'#C8EEFF66', text:'Try Again!'     },
};

function getMedal(stars) { return MEDALS[stars] ?? MEDALS[0]; }

// ── Confetti dots ──────────────────────────────────────────────
function Confetti({ colors }) {
  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform:translateY(-20px) rotate(0deg); opacity:1; }
          100% { transform:translateY(100vh) rotate(720deg); opacity:0; }
        }
      `}</style>
      {[...Array(32)].map((_,i) => (
        <div key={i} style={{
          position:'fixed',
          left:`${(i*3.2)%100}%`,
          top: `-${(i*7)%20}%`,
          width: 8+(i%5)*4,
          height: 8+(i%3)*3,
          borderRadius: i%3===0 ? '50%' : 4,
          background: colors[i % colors.length],
          animation:`confetti-fall ${2+(i%4)*0.5}s linear infinite`,
          animationDelay:`${(i*0.18)%2.5}s`,
          pointerEvents:'none', zIndex:300,
        }} />
      ))}
    </>
  );
}

// ── Already completed screen ──────────────────────────────────
function AlreadyDoneScreen({ stars, onBack }) {
  const medal = getMedal(stars);
  return (
    <div style={{ minHeight:'100vh',
      background:`radial-gradient(ellipse at 50% 20%,#0D3B22,#062213 60%,#041A0E 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      fontFamily:"'Quicksand',sans-serif", position:'relative', overflow:'hidden' }}>

      {stars >= 2 && <Confetti colors={[medal.color, '#fff', '#7ED957', '#00C8E8', '#FFD700']} />}

      <div style={{ background:'rgba(13,59,34,.85)', backdropFilter:'blur(12px)',
        borderRadius:32, border:`4px solid ${medal.color}`,
        boxShadow:`0 0 80px ${medal.color}55, 0 12px 0 ${medal.color}55`,
        padding:'44px 40px', textAlign:'center', maxWidth:420, position:'relative', zIndex:10 }}>

        <div style={{ fontSize:14, color:'rgba(232,255,245,.5)', fontWeight:700, marginBottom:12 }}>
          🔒 Quiz Already Completed
        </div>

        <div style={{ fontSize:100, animation:'pop .5s cubic-bezier(.4,2,.4,1)', lineHeight:1, marginBottom:8 }}>
          {medal.emoji}
        </div>
        {medal.label && (
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:38, letterSpacing:3,
            background:`linear-gradient(135deg,${medal.color},#fff,${medal.color})`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            marginBottom:6 }}>
            {medal.label} MEDAL
          </div>
        )}
        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:'rgba(232,255,245,.6)', marginBottom:24 }}>
          {medal.text}
        </div>

        <div style={{ background:`rgba(255,255,255,.07)`, border:`2px solid ${medal.color}44`,
          borderRadius:16, padding:'12px 20px', marginBottom:28, color:'rgba(232,255,245,.55)',
          fontSize:14, fontWeight:600 }}>
          Your medal is saved forever! 🏅
        </div>

        <button onClick={onBack} style={{
          background:`linear-gradient(180deg,${medal.color},${medal.color}BB)`,
          border:`3px solid ${medal.color}`, borderRadius:16,
          color: stars === 2 ? '#1A2340' : '#fff',
          fontFamily:"'Fredoka One',cursive", fontSize:18, padding:'13px 32px',
          cursor:'pointer', boxShadow:`0 7px 0 ${medal.color}66`,
        }}>
          🗺️ Back to Map
        </button>
      </div>
    </div>
  );
}

// ── Result screen after completing ───────────────────────────
function ResultScreen({ result, coins, onBack }) {
  const medal = getMedal(result.stars);
  const isPerfect = result.correct === result.total;

  const confettiColors = {
    3: ['#FFD700','#FF8C00','#FF4FCB','#00C8E8','#7ED957','#fff'],
    2: ['#C0C0C0','#E8E8E8','#00C8E8','#7ED957','#fff'],
    1: ['#CD7F32','#E8A060','#7ED957','#00C8A0'],
    0: [],
  }[result.stars] || [];

  return (
    <div style={{ minHeight:'100vh',
      background:`radial-gradient(ellipse at 50% 0%,${medal.color}33 0%,#062213 50%,#041A0E 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      fontFamily:"'Quicksand',sans-serif", position:'relative', overflow:'hidden' }}>

      {result.stars >= 1 && <Confetti colors={confettiColors} />}

      {/* Burst rings for gold */}
      {isPerfect && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center',
          justifyContent:'center', pointerEvents:'none', zIndex:5 }}>
          {[1,2,3].map(n => (
            <div key={n} style={{
              position:'absolute', borderRadius:'50%',
              border:`4px solid ${medal.color}`,
              width: n*180, height: n*180,
              animation:`pulse-ring 2s ${n*0.3}s ease-out infinite`,
              opacity:0,
            }} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse-ring {
          0%   { transform:scale(0); opacity:.9; }
          100% { transform:scale(1.6); opacity:0; }
        }
        @keyframes medal-drop {
          0%   { transform:translateY(-60px) scale(0) rotate(-20deg); opacity:0; }
          60%  { transform:translateY(12px)  scale(1.2) rotate(5deg); opacity:1; }
          100% { transform:translateY(0)     scale(1)   rotate(0deg); opacity:1; }
        }
      `}</style>

      <div style={{ background:'rgba(4,26,14,.9)', backdropFilter:'blur(14px)',
        borderRadius:32, border:`4px solid ${medal.color}`,
        boxShadow:`0 0 100px ${medal.color}55, 0 12px 0 ${medal.color}66`,
        padding:'44px 40px', textAlign:'center', maxWidth:460,
        position:'relative', zIndex:10 }}>

        {/* Medal with drop animation */}
        <div style={{ fontSize:110, lineHeight:1, animation:'medal-drop .7s cubic-bezier(.4,2,.4,1) both',
          filter:`drop-shadow(0 0 28px ${medal.color}BB)` }}>
          {medal.emoji}
        </div>

        {/* Stars row */}
        {result.stars > 0 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, margin:'10px 0 4px' }}>
            {[...Array(result.stars)].map((_,i) => (
              <span key={i} style={{ fontSize:32,
                animation:`pop .4s ${i*0.15}s cubic-bezier(.4,2,.4,1) both`,
                filter:`drop-shadow(0 0 8px ${medal.color})` }}>⭐</span>
            ))}
          </div>
        )}

        {/* Label */}
        {medal.label ? (
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:42, letterSpacing:3,
            background:`linear-gradient(135deg,${medal.color},#fff 50%,${medal.color})`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            margin:'8px 0 4px' }}>
            {medal.label} MEDAL!
          </div>
        ) : (
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:28, color:'rgba(232,255,245,.5)',
            margin:'14px 0 4px' }}>No Medal This Time</div>
        )}

        <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20,
          color:'rgba(232,255,245,.7)', marginBottom:18 }}>
          {medal.text}
        </div>

        {/* Score */}
        <div style={{ background:`rgba(255,255,255,.06)`, border:`2px solid ${medal.color}55`,
          borderRadius:20, padding:'16px 24px', marginBottom:20 }}>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:30, color:medal.color, marginBottom:8 }}>
            {result.correct} / {result.total} correct
          </div>
          <div style={{ display:'flex', gap:6, justifyContent:'center', flexWrap:'wrap' }}>
            {[...Array(result.total)].map((_,i) => (
              <div key={i} style={{
                width:30, height:30, borderRadius:8,
                background: i < result.correct ? medal.color : 'rgba(255,255,255,.1)',
                border:`2px solid ${i < result.correct ? medal.color : 'rgba(255,255,255,.15)'}`,
                boxShadow: i < result.correct ? `0 3px 0 ${medal.color}88, 0 0 10px ${medal.color}55` : 'none',
                animation: i < result.correct ? 'pop .4s cubic-bezier(.4,2,.4,1) both' : 'none',
                animationDelay:`${i*0.07}s`,
              }} />
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:28, flexWrap:'wrap' }}>
          <div style={{ background:`rgba(126,217,87,.15)`, border:`2px solid #7ED95766`,
            borderRadius:50, padding:'8px 20px',
            fontFamily:"'Fredoka One',cursive", color:'#7ED957', fontSize:18 }}>
            ⭐ +{result.correct * 50} XP
          </div>
          <div style={{ background:'rgba(255,215,0,.15)', border:`2px solid #FFD70066`,
            borderRadius:50, padding:'8px 20px',
            fontFamily:"'Fredoka One',cursive", color:C.gold, fontSize:18 }}>
            🪙 +{coins}
          </div>
        </div>

        <button onClick={onBack} style={{
          background:`linear-gradient(180deg,${medal.color},${medal.color}CC)`,
          border:`3px solid ${medal.color}`, borderRadius:18,
          color: result.stars === 2 ? '#1A2340' : '#fff',
          fontFamily:"'Fredoka One',cursive", fontSize:20, padding:'14px 36px',
          cursor:'pointer', boxShadow:`0 8px 0 ${medal.color}88`,
          width:'100%', letterSpacing:.5,
        }}>
          🗺️ Back to Map!
        </button>
      </div>
    </div>
  );
}

// ── Main QuizPage ─────────────────────────────────────────────
export default function QuizPage() {
  const { id }  = useParams();
  const nav     = useNavigate();
  const { completeSession }  = useProgress();
  const { user }             = useAuth();
  const { courses }          = useCourseContext();

  const [questions,  setQuestions]  = useState([]);
  const [qi,         setQi]         = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [sel,        setSel]        = useState(null);
  const [result,     setResult]     = useState(null);
  const [feedback,   setFeedback]   = useState(null);
  const [coins,      setCoins]      = useState(0);
  const [combo,      setCombo]      = useState(0);
  const [shake,      setShake]      = useState(false);
  const [done,       setDone]       = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [planError,  setPlanError]  = useState(false);
  // Already-completed state
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [prevStars,   setPrevStars]   = useState(0);

  const isPremium = user?.plan === 'PREMIUM' || user?.plan === 'BASIC' || user?.role === 'ADMIN';

  // Find next session after this quiz
  const nextSession = (() => {
    for (const course of courses) {
      const sorted = [...(course.sessions || [])].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(s => s.id === id);
      if (idx >= 0) return sorted[idx + 1] ?? null;
    }
    return null;
  })();

  // Find the course this quiz belongs to
  const parentCourse = courses.find(c => c.sessions?.some(s => s.id === id));

  useEffect(() => {
    api.get(`/quiz/${id}`)
      .then(res => {
        if (res.data.alreadyCompleted) {
          setPrevStars(res.data.stars ?? 0);
          setAlreadyDone(true);
        } else {
          setQuestions(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 403) { setPlanError(true); setLoading(false); }
        else nav('/dashboard');
      });
  }, [id]);

  const q = questions[qi];

  async function pick(optLetter) {
    if (feedback) return;
    setSel(optLetter);
    const newAnswers = { ...answers, [q.id]: optLetter };
    setAnswers(newAnswers);
    try {
      const res = await api.post(`/quiz/${id}/submit`, { answers: newAnswers });
      const thisResult = res.data.results.find(r => r.questionId === q.id);
      const isCorrect = thisResult?.correct;
      if (isCorrect) { setCombo(c=>c+1); setCoins(c=>c+10+combo*2); }
      else { setCombo(0); setShake(true); setTimeout(()=>setShake(false),600); }
      setFeedback({ correct: isCorrect, explanation: thisResult?.explanation });
    } catch (_) {}
  }

  async function next() {
    if (qi < questions.length - 1) {
      setQi(i=>i+1); setSel(null); setFeedback(null);
    } else {
      const res = await api.post(`/quiz/${id}/submit`, { answers });
      setResult(res.data);
      await completeSession(id, res.data.stars);
      setDone(true);
    }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:48, background:'linear-gradient(160deg,#FFF9E6,#E8F4FF)' }}>⏳</div>
  );

  // ── Premium plan required ──
  if (planError) return (
    <div style={{ minHeight:'100vh',
      background:'radial-gradient(ellipse at 50% 20%,#0D3B22,#041A0E)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      gap:20, padding:24, fontFamily:"'Quicksand',sans-serif" }}>
      <div style={{ fontSize:80 }}>👑</div>
      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:28, color:'#FFD700', textAlign:'center' }}>
        This quiz is Premium only
      </div>
      <div style={{ color:'rgba(232,255,245,.7)', fontSize:15, textAlign:'center', maxWidth:320, fontWeight:600 }}>
        Unlock all sessions, quizzes and more for ₹1,499 / month
      </div>
      <button onClick={() => nav('/pricing')}
        style={{ background:'linear-gradient(135deg,#FFD700,#E8A800)', border:'3px solid #FFD700',
          borderRadius:16, color:'#1A0E00', fontFamily:"'Fredoka One',cursive",
          fontSize:20, padding:'14px 36px', cursor:'pointer', boxShadow:'0 6px 0 #A07800' }}>
        👑 Upgrade to Premium →
      </button>
      <button onClick={() => nav(-1)} style={{ background:'transparent', border:'1.5px solid rgba(255,255,255,.3)',
        borderRadius:12, color:'rgba(232,255,245,.6)', padding:'8px 20px',
        fontFamily:"'Fredoka One',cursive", fontSize:14, cursor:'pointer' }}>
        ← Go Back
      </button>
    </div>
  );

  // ── Already completed: locked screen ──
  if (alreadyDone) return (
    <AlreadyDoneScreen stars={prevStars} onBack={() => parentCourse ? nav(`/course/${parentCourse.id}`) : nav('/dashboard')} />
  );

  // ── Result screen after finishing ──
  if (done && result) {
    const goNext = () => {
      if (!nextSession) { nav('/dashboard'); return; }
      if (!isPremium && nextSession.order > 4) { nav('/pricing'); return; }
      nav(nextSession.type === 'QUIZ' ? `/quiz/${nextSession.id}` : `/lesson/${nextSession.id}`);
    };
    const needsUpgrade = nextSession && !isPremium && nextSession.order > 4;
    return (
      <div style={{ position:'relative' }}>
        <ResultScreen result={result} coins={coins}
          onBack={() => parentCourse ? nav(`/course/${parentCourse.id}`) : nav('/dashboard')} />
        {nextSession && (
          <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
            zIndex:400, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            {needsUpgrade && (
              <div style={{ background:'rgba(255,215,0,.15)', border:'1.5px solid rgba(255,215,0,.5)',
                borderRadius:12, padding:'6px 16px', color:'#FFD700',
                fontFamily:"'Fredoka One',cursive", fontSize:13, textAlign:'center' }}>
                Next session requires Premium
              </div>
            )}
            <button onClick={goNext} style={{
              background: needsUpgrade ? 'linear-gradient(135deg,#FFD700,#E8A800)' : `linear-gradient(180deg,#7ED957,#5BB832)`,
              border: `3px solid ${needsUpgrade ? '#FFD700' : '#7ED957'}`,
              borderRadius:16, color: needsUpgrade ? '#1A0E00' : '#1A3020',
              fontFamily:"'Fredoka One',cursive", fontSize:18, padding:'13px 32px',
              cursor:'pointer', boxShadow:`0 6px 0 ${needsUpgrade ? '#A07800' : '#3A8A1A'}`,
              whiteSpace:'nowrap',
            }}>
              {needsUpgrade ? '👑 Upgrade to Continue' : `▶ Next: ${nextSession.title}`}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Quiz in progress ──
  return (
    <div style={{ minHeight:'100vh',
      background:`radial-gradient(ellipse at 50% 10%,#0D3B22 0%,#062213 55%,#041A0E 100%)`,
      fontFamily:"'Quicksand',sans-serif", position:'relative', overflow:'hidden' }}>

      {/* Fireflies */}
      {[{l:'5%',t:'15%'},{l:'90%',t:'20%'},{l:'50%',t:'5%'},{l:'80%',t:'70%'}].map((f,i)=>(
        <div key={i} style={{ position:'fixed', left:f.l, top:f.t, width:5, height:5,
          borderRadius:'50%', background:C.lime, boxShadow:`0 0 8px ${C.lime}`,
          animation:`shimmer ${1.4+i*.4}s ease-in-out infinite`,
          animationDelay:`${i*.5}s`, pointerEvents:'none', zIndex:0 }} />
      ))}
      <style>{`@keyframes shimmer{0%,100%{opacity:.3}50%{opacity:1}}`}</style>

      <Hud />

      <div style={{ maxWidth:560, margin:'0 auto', padding:'24px 20px 40px',
        animation: shake ? 'shake .5s' : 'none', position:'relative', zIndex:1 }}>

        {/* Progress header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontFamily:"'Fredoka One',cursive", color:'rgba(232,255,245,.5)', fontSize:15 }}>
            Question {qi+1} of {questions.length}
          </span>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <span style={{ fontFamily:"'Fredoka One',cursive", color:C.gold, fontSize:15 }}>🪙 {coins}</span>
            {combo>1 && <span style={{ fontFamily:"'Fredoka One',cursive", color:'#FF8C42',
              animation:'bounce .6s ease-in-out infinite', fontSize:15 }}>🔥 x{combo}!</span>}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display:'flex', gap:5, marginBottom:20 }}>
          {questions.map((_,i) => (
            <div key={i} style={{ flex:1, height:8, borderRadius:4,
              background: i<=qi
                ? `linear-gradient(90deg,${C.lime},${C.teal})`
                : 'rgba(255,255,255,.1)',
              transition:'background .3s', boxShadow: i<=qi ? `0 0 6px ${C.lime}66` : 'none' }} />
          ))}
        </div>

        {/* Question card */}
        <div style={{ background:'rgba(13,59,34,.8)', backdropFilter:'blur(8px)',
          border:`3px solid ${C.teal}`, borderRadius:24,
          padding:32, textAlign:'center', marginBottom:16,
          boxShadow:`0 8px 0 ${C.teal}44, 0 0 30px ${C.teal}22` }}>
          <div style={{ fontSize:60, marginBottom:14, animation:'wobble 2s ease-in-out infinite' }}>
            {q?.emoji || '🤔'}
          </div>
          <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:'clamp(18px,4vw,22px)',
            color:'#E8FFF5', lineHeight:1.5 }}>
            {q?.question}
          </div>
        </div>

        {/* Options */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {OPTS.map((opt, i) => {
            let bg='rgba(13,59,34,.7)', border='rgba(126,217,87,.2)', color='#E8FFF5';
            if (feedback && sel === opt) {
              bg     = feedback.correct ? 'rgba(126,217,87,.2)' : 'rgba(255,71,87,.15)';
              border = feedback.correct ? C.lime : C.red;
              color  = feedback.correct ? C.lime : '#FF8888';
            }
            return (
              <button key={opt} onClick={() => pick(opt)} style={{
                background:bg, border:`2.5px solid ${border}`, borderRadius:16,
                padding:'14px 12px', color, fontSize:14, fontWeight:700,
                fontFamily:"'Quicksand',sans-serif",
                cursor: feedback ? 'default' : 'pointer', textAlign:'left', lineHeight:1.4,
                boxShadow:`0 4px 0 rgba(0,0,0,.3)`, transition:'all .15s',
              }}
                onMouseEnter={e => { if(!feedback){ e.currentTarget.style.borderColor=C.cyan; e.currentTarget.style.background='rgba(0,200,232,.1)'; } }}
                onMouseLeave={e => { if(!feedback){ e.currentTarget.style.borderColor='rgba(126,217,87,.2)'; e.currentTarget.style.background='rgba(13,59,34,.7)'; } }}
              >
                <span style={{ color:C.lime, fontFamily:"'Fredoka One',cursive",
                  marginRight:6, fontSize:15 }}>{opt}.</span>
                {q?.[OPT_FIELDS[i]]}
              </button>
            );
          })}
        </div>

        {/* Per-question feedback */}
        {feedback && (
          <div style={{
            background: feedback.correct ? 'rgba(126,217,87,.12)' : 'rgba(255,71,87,.1)',
            border:`2px solid ${feedback.correct ? C.lime : C.red}`,
            borderRadius:18, padding:20, textAlign:'center',
            animation:'pop .3s cubic-bezier(.4,2,.4,1)',
            boxShadow: feedback.correct ? `0 0 20px ${C.lime}33` : `0 0 20px ${C.red}33`,
          }}>
            <div style={{ fontSize:44, marginBottom:8 }}>{feedback.correct ? '🎉' : '💡'}</div>
            <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:20,
              color: feedback.correct ? C.lime : '#FF8888', marginBottom:6 }}>
              {feedback.correct
                ? (combo>1 ? `🔥 ${combo}x Combo! +${10+combo*2} coins!` : 'Correct! +10 coins!')
                : 'Not quite!'}
            </div>
            <div style={{ color:'rgba(232,255,245,.55)', fontSize:13, marginBottom:16, fontWeight:600 }}>
              {feedback.explanation}
            </div>
            <button onClick={next} style={{
              background: feedback.correct
                ? `linear-gradient(180deg,${C.lime},#5BB832)`
                : `linear-gradient(180deg,${C.teal},#008B6E)`,
              border:`3px solid ${feedback.correct ? C.lime : C.teal}`,
              borderRadius:14, color: feedback.correct ? '#1A3020' : '#fff',
              fontFamily:"'Fredoka One',cursive", fontSize:16, padding:'10px 28px',
              cursor:'pointer', boxShadow:`0 5px 0 ${feedback.correct ? '#3A8A1A' : '#006B52'}`,
              width:'100%',
            }}>
              {qi < questions.length-1 ? 'Next Question →' : 'See My Medal! 🏅'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom leaves */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, height:50,
        display:'flex', alignItems:'flex-end', justifyContent:'space-around',
        padding:'0 8px', pointerEvents:'none', zIndex:0 }}>
        {['🌿','🍃','🌱','🌿','🍃','🌱','🌿','🍃','🌱','🌿'].map((e,i)=>(
          <span key={i} style={{ fontSize:18+((i*5)%12), opacity:.2,
            animation:`sway ${3+i*.3}s ease-in-out infinite`,
            animationDelay:`${i*.22}s` }}>{e}</span>
        ))}
      </div>
    </div>
  );
}
