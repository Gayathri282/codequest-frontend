// frontend/src/components/shared/Modal.jsx
import { useEffect } from 'react';

export default function Modal({ children, onClose, maxWidth = 480 }) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 20,
      }}>
      <div style={{
        background: '#fff', borderRadius: 24,
        border: '3px solid #00C8E8',
        boxShadow: '0 0 60px #00C8E844',
        padding: 32, maxWidth, width: '100%',
        animation: 'pop .3s cubic-bezier(.4,2,.4,1)',
        position: 'relative',
      }}>
        {onClose && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none', fontSize: 22,
            cursor: 'pointer', color: '#6B82A8', lineHeight: 1,
          }}>✕</button>
        )}
        {children}
      </div>
    </div>
  );
}
