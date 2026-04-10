import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function AuthCallback() {
  const [params]   = useSearchParams();
  const { login }  = useAuth();
  const navigate   = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login'); return; }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.get('/auth/me')
      .then(r => {
        login(token, r.data);
        navigate(r.data.role === 'admin' ? '/admin' : '/');
      })
      .catch(() => navigate('/login'));
  }, []);

  return (
    <div className="h-64 flex items-center justify-center animate-pulse text-primary-500">
      Signing you in…
    </div>
  );
}
