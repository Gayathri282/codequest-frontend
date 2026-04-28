// frontend/src/hooks/useQuiz.js
import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useQuiz(sessionId) {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    api.get(`/quiz/${sessionId}`)
      .then(r => setQuestions(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  async function submitAnswers(answers) {
    const r = await api.post(`/quiz/${sessionId}/submit`, { answers });
    return r.data; // { correct, total, stars, results }
  }

  return { questions, loading, error, submitAnswers };
}
