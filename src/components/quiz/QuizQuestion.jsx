// frontend/src/components/quiz/QuizQuestion.jsx
const OPTS = ['A','B','C','D'];
const OPT_FIELDS = ['optionA','optionB','optionC','optionD'];
const C = { orange:'#FF6B35',cyan:'#00C8E8',lime:'#7ED957',red:'#FF4757' };

export default function QuizQuestion({ question, onAnswer, answered, selected, correct }) {
  return (
    <div style={{ fontFamily:"'Nunito',sans-serif" }}>
      <div style={{ background:'#fff',border:`3px solid ${C.cyan}`,borderRadius:24,
        padding:32,textAlign:'center',marginBottom:20,boxShadow:`0 6px 0 ${C.cyan}55` }}>
        <div style={{ fontSize:60,marginBottom:14,animation:'wobble 2s ease-in-out infinite' }}>
          {question.emoji||'🤔'}
        </div>
        <div style={{ fontFamily:"'Boogaloo',cursive",fontSize:'clamp(18px,4vw,24px)',color:'#1A2340',lineHeight:1.4 }}>
          {question.question}
        </div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
        {OPTS.map((opt,i)=>{
          let bg='#fff',border='#C8EEFF',color='#1A2340';
          if(answered){
            if(opt===correct){bg='#E8FFF0';border=C.lime;color='#1A7A30';}
            else if(opt===selected){bg='#FFE8E8';border=C.red;color=C.red;}
          }
          return (
            <button key={opt} onClick={()=>!answered&&onAnswer(opt)} style={{
              background:bg,border:`3px solid ${border}`,borderRadius:16,padding:'15px 14px',
              color,fontSize:14,fontWeight:700,fontFamily:"'Nunito',sans-serif",
              cursor:answered?'default':'pointer',textAlign:'left',lineHeight:1.4,
              boxShadow:'0 4px 0 #D0E8F8',transition:'all .15s'
            }}
              onMouseEnter={e=>{if(!answered){e.currentTarget.style.borderColor=C.cyan;e.currentTarget.style.background='#E0F7FF';}}}
              onMouseLeave={e=>{if(!answered){e.currentTarget.style.borderColor='#C8EEFF';e.currentTarget.style.background='#fff';}}}
            >
              <span style={{color:C.orange,fontFamily:"'Boogaloo',cursive",marginRight:6}}>{opt}.</span>
              {question[OPT_FIELDS[i]]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
