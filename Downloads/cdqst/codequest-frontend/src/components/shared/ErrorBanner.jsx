// frontend/src/components/shared/ErrorBanner.jsx
export default function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: '#FFEEEE', border: '3px solid #FF4757',
      borderRadius: 16, padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 28 }}>😬</span>
      <div style={{ flex: 1, color: '#CC1122', fontWeight: 700, fontFamily: "'Nunito',sans-serif" }}>
        {message || 'Something went wrong'}
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: '#FF4757', border: 'none', borderRadius: 10,
          color: '#fff', padding: '8px 18px', cursor: 'pointer',
          fontFamily: "'Boogaloo',cursive", fontSize: 15,
        }}>↺ Try Again</button>
      )}
    </div>
  );
}
