// frontend/src/hooks/useCourses.js
import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  return { courses, loading, error };
}
