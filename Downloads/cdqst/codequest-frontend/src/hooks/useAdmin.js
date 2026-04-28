// frontend/src/hooks/useAdmin.js
// All admin data-fetching hooks in one place
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useAdminStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed'))
      .finally(() => setLoading(false));
  }, []);
  return { stats, loading, error };
}

export function useAdminStudents({ page = 1, search = '' } = {}) {
  const [data,    setData]    = useState({ students: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    api.get('/admin/students', { params: { page, limit: 20, search } })
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);
  return { ...data, loading, refetch: fetch };
}

export function useAdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await api.get('/courses');
    setCourses(r.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePublish(courseId, isLocked) {
    const r = await api.patch(`/courses/${courseId}`, { isLocked: !isLocked });
    setCourses(cs => cs.map(c => c.id === courseId ? r.data : c));
  }

  async function deleteCourse(courseId) {
    await api.delete(`/courses/${courseId}`);
    setCourses(cs => cs.filter(c => c.id !== courseId));
  }

  return { courses, loading, togglePublish, deleteCourse, reload: load };
}

export function useAdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  useEffect(() => {
    api.get('/payments/history')
      .then(r => setPayments(r.data))
      .finally(() => setLoading(false));
  }, []);
  return { payments, loading };
}
