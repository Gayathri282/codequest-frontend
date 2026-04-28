// frontend/src/hooks/useProgress.js
import { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function useProgress() {
  const { refreshUser } = useAuth();
  const [completing, setCompleting] = useState(false);
  const [reward,     setReward]     = useState(null);

  async function completeSession(sessionId, stars = 3) {
    setCompleting(true);
    try {
      const res = await api.post('/progress/complete', { sessionId, stars });
      setReward(res.data);
      refreshUser(); // fire-and-forget — HUD updates when it can, never blocks the overlay
      return res.data;
    } finally {
      setCompleting(false);
    }
  }

  return { completeSession, completing, reward, clearReward: () => setReward(null) };
}
