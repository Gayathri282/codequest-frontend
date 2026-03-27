// frontend/src/components/shared/Btn.jsx
import { useState } from 'react';
const C = { orange:'#FF6B35', cyan:'#00C8E8', pink:'#FF4FCB', lime:'#7ED957', red:'#FF4757' };

export default function Btn({ children, onClick, color = C.orange, textColor = '#fff', sm, disabled, full, style = {} }) {
  const [dn, setDn] = useState(false);
  return (
    <button disabled={disabled}
      onMouseDown={() => setDn(true)} onMouseUp={() => setDn(false)} onMouseLeave={() => setDn(false)}
      onClick={onClick}
      style={{
        background: disabled ? '#D0E4F0' : `linear-gradient(180deg,${color}ff,${color}cc)`,
        border: `3px solid ${disabled ? '#B0C8D8' : color}`,
        borderRadius: 14, color: disabled ? '#8AAABB' : textColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Boogaloo', cursive", fontSize: sm ? 13 : 16, fontWeight: 700,
        padding: sm ? '7px 16px' : '11px 26px',
        boxShadow: disabled ? 'none' : dn ? `0 2px 0 ${color}88` : `0 5px 0 ${color}88`,
        transform: dn ? 'translateY(3px)' : 'none',
        transition: 'all .1s', width: full ? '100%' : undefined, ...style
      }}
    >{children}</button>
  );
}
