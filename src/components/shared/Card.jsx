// frontend/src/components/shared/Card.jsx
export default function Card({ children, style = {}, color = '#00C8E8' }) {
  return (
    <div style={{
      background:'#fff', borderRadius:20, border:`3px solid ${color}`,
      boxShadow:`0 6px 0 ${color}55, 0 10px 30px ${color}22`,
      padding:20, ...style
    }}>{children}</div>
  );
}
