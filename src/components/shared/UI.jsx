// frontend/src/components/shared/UI.jsx
// Reusable design-system components used across all pages

import { useState } from 'react'

const C = {
  orange:'#FF6B35', pink:'#FF4FCB', cyan:'#00C8E8',
  yellow:'#FFD700', lime:'#7ED957', purple:'#9B59B6',
  red:'#FF4757', border:'#C8EEFF', muted:'#6B82A8',
  txt:'#1A2340', sky:'#E0F7FF',
}

export function Btn({ children, onClick, color = C.orange, textColor = '#fff', sm, disabled, full, style = {} }) {
  const [dn, setDn] = useState(false)
  return (
    <button
      disabled={disabled}
      onMouseDown={() => setDn(true)}
      onMouseUp={() => setDn(false)}
      onMouseLeave={() => setDn(false)}
      onClick={onClick}
      style={{
        background: disabled ? '#D0E4F0' : `linear-gradient(180deg,${color}ff,${color}cc)`,
        border: `3px solid ${disabled ? '#B0C8D8' : color}`,
        borderRadius: 14,
        color: disabled ? '#8AAABB' : textColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Boogaloo', cursive",
        fontSize: sm ? 13 : 16,
        fontWeight: 700,
        padding: sm ? '7px 16px' : '11px 26px',
        boxShadow: disabled ? 'none' : dn ? `0 2px 0 ${color}88` : `0 5px 0 ${color}88, 0 8px 18px ${color}33`,
        transform: dn ? 'translateY(3px)' : 'none',
        transition: 'all .1s',
        letterSpacing: .3,
        width: full ? '100%' : undefined,
        ...style
      }}
    >{children}</button>
  )
}

export function Card({ children, style = {}, color = C.cyan, noBorder }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: noBorder ? 'none' : `3px solid ${color}`,
      boxShadow: `0 6px 0 ${color}55, 0 10px 30px ${color}22`,
      padding: 20,
      ...style
    }}>{children}</div>
  )
}

export function XpBar({ pct, color = C.cyan, h = 14 }) {
  return (
    <div style={{
      background: `${color}22`, borderRadius: 20, height: h,
      overflow: 'hidden', border: `2px solid ${color}44`, position: 'relative'
    }}>
      <div style={{
        width: `${Math.min(pct, 100)}%`, height: '100%',
        background: `linear-gradient(90deg,${color},${color}bb)`,
        borderRadius: 20,
        boxShadow: `0 0 8px ${color}88`,
        transition: 'width 1s cubic-bezier(.4,2,.4,1)'
      }} />
      <span style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 900, color: '#fff',
        textShadow: '0 1px 3px #0005',
        fontFamily: "'Nunito', sans-serif"
      }}>{pct}%</span>
    </div>
  )
}

export function Badge({ children, color = C.cyan }) {
  return (
    <span style={{
      background: `${color}22`,
      border: `2px solid ${color}`,
      borderRadius: 50,
      padding: '3px 12px',
      color,
      fontSize: 12,
      fontFamily: "'Nunito', sans-serif",
      fontWeight: 700,
    }}>{children}</span>
  )
}

export function SectionTitle({ children, color = C.orange, emoji }) {
  return (
    <div style={{
      fontFamily: "'Boogaloo', cursive",
      fontSize: 26,
      color,
      textShadow: `2px 2px 0 ${color}44`,
      marginBottom: 18,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }}>
      {emoji && <span>{emoji}</span>}
      {children}
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontSize: 64, animation: 'bob 0.6s ease-in-out infinite'
    }}>🏃</div>
  )
}
