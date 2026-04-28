// frontend/src/hooks/useSession.js
import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    api.get(`/sessions/${sessionId}`)
      .then(res => setSession(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load lesson'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return { session, loading, error };
}
