// frontend/src/pages/ParentDashboard.jsx
// Parent can see all their children's progress reports

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProgressCard from '../components/student/ProgressCard';
import Btn from '../components/shared/Btn';

const C = {
  orange: '#FF6B35', cyan: '#00C8E8', lime: '#7ED957',
  pink: '#FF4FCB', yellow: '#FFD700', muted: '#6B82A8',
};

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [children,  setChildren]  = useState([]);
  const [reports,   setReports]   = useState({});   // { childId: report }
  const [activeId,  setActiveId]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    // Load all children linked to this parent account
    api.get('/users/children')
      .then(res => {
        setChildren(res.data || []);
        if (res.data.length > 0) setActiveId(res.data[0].id);
      })
      .catch(() => setError('Could not load children accounts'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId || reports[activeId]) return;
    api.get(`/progress/report/${activeId}`)
      .then(res => setReports(r => ({ ...r, [activeId]: res.data })))
      .catch(() => setError('Could not load progress report'));
  }, [activeId]);

  const activeReport = reports[activeId];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #E0F7FF, #B3ECFF)',
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Nav */}
      <div style={{
        background: `linear-gradient(180deg, ${C.cyan}, #009BB5)`,
        borderBottom: '4px solid #007A90',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 36 }}>👨‍👩‍👧</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: 20, color: '#fff' }}>
            Parent Dashboard
          </div>
          <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12 }}>
            {user?.email}
          </div>
        </div>
        <Btn onClick={() => { logout(); nav('/'); }} color="rgba(0,0,0,.15)" sm
          style={{ border: '2px solid rgba(255,255,255,.4)', color: '#fff' }}>
          Sign Out
        </Btn>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 60px' }}>

        {error && (
          <div style={{ background: '#FFEEEE', border: '2px solid #FF4757', borderRadius: 12,
            padding: '10px 16px', color: '#FF4757', marginBottom: 20 }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, fontSize: 48 }}>⏳</div>
        ) : children.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64 }}>👶</div>
            <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: 24, color: C.orange, margin: '16px 0 8px' }}>
              No Student Accounts Linked Yet
            </div>
            <p style={{ color: C.muted, marginBottom: 24 }}>
              Ask your child to register using your email address as the parent email.
            </p>
            <Btn onClick={() => nav('/register')} color={C.cyan}>Register a Student Account</Btn>
          </div>
        ) : (
          <>
            {/* Child selector */}
            {children.length > 1 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                {children.map(child => (
                  <button key={child.id} onClick={() => setActiveId(child.id)} style={{
                    background: activeId === child.id ? `${C.orange}22` : '#fff',
                    border: `3px solid ${activeId === child.id ? C.orange : '#C8EEFF'}`,
                    borderRadius: 16, padding: '10px 20px', cursor: 'pointer',
                    fontFamily: "'Boogaloo', cursive", fontSize: 16,
                    color: activeId === child.id ? C.orange : C.muted,
                    boxShadow: activeId === child.id ? `0 4px 0 ${C.orange}66` : '0 3px 0 #D8EEF8',
                  }}>
                    {child.avatarEmoji || '🏃'} {child.displayName || child.username}
                    <span style={{ fontSize: 12, marginLeft: 6, opacity: .7 }}>Age {child.age}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Weekly summary strip */}
            {activeReport && (
              <div style={{
                background: `linear-gradient(135deg, ${C.cyan}18, #fff)`,
                border: `3px solid ${C.cyan}`, borderRadius: 20,
                padding: '16px 24px', marginBottom: 28,
                boxShadow: `0 6px 0 ${C.cyan}44`,
                display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: 40, animation: 'wobble 2s ease-in-out infinite' }}>
                  {activeReport.student?.avatarEmoji || '🏃'}
                </div>
                <div>
                  <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: 20, color: C.orange }}>
                    {activeReport.student?.displayName}'s Week
                  </div>
                  <div style={{ color: C.muted, fontSize: 13 }}>
                    🔥 {activeReport.student?.streakDays} day streak · 
                    ✅ {activeReport.totalCompleted} sessions done · 
                    ⚡ Level {activeReport.student?.level}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                  <Btn onClick={() => window.print()} color="#EEF8FF" textColor={C.cyan} sm>
                    🖨️ Print Report
                  </Btn>
                </div>
              </div>
            )}

            {/* Full progress card */}
            {activeReport
              ? <ProgressCard report={activeReport} />
              : <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>⏳ Loading report…</div>
            }
          </>
        )}
      </div>
    </div>
  );
}
