// frontend/src/components/shared/XpBar.jsx
export default function XpBar({ pct, color = '#00C8E8', h = 14 }) {
  return (
    <div style={{ background:`${color}22`, borderRadius:20, height:h, overflow:'hidden', border:`2px solid ${color}44`, position:'relative' }}>
      <div style={{ width:`${Math.min(pct,100)}%`, height:'100%', background:`linear-gradient(90deg,${color},${color}bb)`,
        borderRadius:20, boxShadow:`0 0 8px ${color}88`, transition:'width 1s cubic-bezier(.4,2,.4,1)' }} />
      <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:9, fontWeight:900, color:'#fff', textShadow:'0 1px 3px #0005', fontFamily:"'Nunito',sans-serif" }}>{pct}%</span>
    </div>
  );
}
