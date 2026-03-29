import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cq_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(err => {
          // Only clear token on 401 (truly invalid/expired token).
          // Keep it on 429 (rate limit), 5xx (server/DB down), or network errors.
          if (err.response?.status === 401) localStorage.removeItem('cq_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('cq_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function googleLogin(credential) {
    const res = await api.post('/auth/google', { credential });
    localStorage.setItem('cq_token', res.data.token);
    setUser(res.data.user);
    return { ...res.data.user, isNew: res.data.isNew };
  }

  async function register(data) {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('cq_token', res.data.token);
    setUser(res.data.user);
    return { ...res.data.user, isNew: true };
  }

  function logout() {
    localStorage.removeItem('cq_token');
    setUser(null);
  }

  async function refreshUser() {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (_) {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
