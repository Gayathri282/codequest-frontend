import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5003';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#050505' }}>
      {/* Ambient glow */}
      <div className="fixed pointer-events-none" style={{
        width: 560, height: 560, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />

      <div className="relative w-full max-w-sm rounded-3xl px-8 py-10" style={{
        background: 'rgba(17,17,17,0.9)',
        border: '1px solid rgba(212,175,55,0.18)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)', boxShadow: '0 0 24px rgba(212,175,55,0.5)' }}>
            <img src="/fish.svg" alt="GuppyStore" className="w-8 h-8" />
          </div>
          <h1 className="text-white font-bold text-xl">Welcome back</h1>
          <p className="text-white/35 text-sm mt-1">Sign in to GuppyStore</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')}
              placeholder="you@example.com" required className="input" />
          </div>
          <div>
            <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={set('password')}
              placeholder="••••••••" required className="input" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-full transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #AA8B2E)',
              color: '#000', fontWeight: 'bold', textTransform: 'uppercase',
              letterSpacing: '0.1em', padding: '12px 24px',
              boxShadow: '0 8px 24px rgba(212,175,55,0.3)',
              opacity: loading ? 0.7 : 1,
            }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <span className="text-white/25 text-xs">or</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <a href={`${BACKEND}/api/auth/google`}
          className="flex items-center justify-center gap-3 w-full py-2.5 rounded-full text-sm font-semibold text-white/70 transition-all hover:text-white"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <svg width="16" height="16" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </a>

        <p className="text-center text-white/30 text-sm mt-6">
          New here?{' '}
          <Link to="/register" className="font-semibold" style={{ color: '#D4AF37' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
