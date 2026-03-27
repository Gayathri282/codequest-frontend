// frontend/src/components/lesson/DocumentViewer.jsx
export default function DocumentViewer({ title, content }) {
  const C = { orange:'#FF6B35',cyan:'#00C8E8' };
  function renderLine(line, i) {
    if (line.startsWith('# '))  return <h1 key={i} style={{ fontFamily:"'Boogaloo',cursive",color:C.orange,fontSize:28,margin:'16px 0 8px' }}>{line.slice(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily:"'Boogaloo',cursive",color:C.cyan,fontSize:22,margin:'14px 0 6px' }}>{line.slice(3)}</h2>;
    if (line.startsWith('```')) return <div key={i}/>;
    if (line.startsWith('- '))  return <li key={i} style={{ marginLeft:20,marginBottom:4 }}>{line.slice(2)}</li>;
    if (line==='')              return <br key={i}/>;
    return <p key={i} style={{ margin:'6px 0',lineHeight:1.7 }}>{line}</p>;
  }
  return (
    <div style={{ flex:1,overflow:'auto',padding:'28px 32px',background:'#fff',fontFamily:"'Nunito',sans-serif" }}>
      <div style={{ maxWidth:700,margin:'0 auto' }}>
        <div style={{ fontFamily:"'Boogaloo',cursive",fontSize:26,color:C.orange,marginBottom:20 }}>📄 {title}</div>
        <div style={{ fontSize:15,color:'#1A2340',lineHeight:1.9,background:'#F0FAFF',borderRadius:16,
          padding:'20px 24px',border:`2px solid ${C.cyan}44` }}>
          {(content||'').split('\n').map(renderLine)}
        </div>
      </div>
    </div>
  );
}
