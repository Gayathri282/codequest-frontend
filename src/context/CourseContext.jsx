// frontend/src/context/CourseContext.jsx
// Optional: cache courses globally so Dashboard → Lesson doesn't re-fetch
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const { user } = useAuth();
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const load = useCallback(async (force = false) => {
    // Don't re-fetch if loaded in last 60 seconds
    if (!force && lastFetch && (Date.now() - lastFetch < 60000)) return;
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
      setLastFetch(Date.now());
    } finally {
      setLoading(false);
    }
  }, [user, lastFetch]);

  useEffect(() => { if (user) load(); }, [user]);

  // Mark a session done locally (optimistic update) so the UI
  // updates immediately without a full re-fetch
  function markSessionDone(sessionId) {
    setCourses(prev => prev.map(course => ({
      ...course,
      sessions: course.sessions?.map(s =>
        s.id === sessionId ? { ...s, completed: true } : s
      ),
      completedCount: course.sessions?.filter(s => s.completed || s.id === sessionId).length,
    })));
  }

  return (
    <CourseContext.Provider value={{ courses, loading, reload: () => load(true), markSessionDone }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourseContext() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourseContext must be inside CourseProvider');
  return ctx;
}
