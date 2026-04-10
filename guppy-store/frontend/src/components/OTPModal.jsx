import { useState, useRef, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function OTPModal({ identifier, type, purpose, onVerified, onClose }) {
  const [digits,  setDigits]  = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer,   setTimer]   = useState(60);
  const refs = Array.from({ length: 6 }, () => useRef(null));

  useEffect(() => {
    const t = setInterval(() => setTimer(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0)
      refs[i - 1].current?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = text.split('').concat(Array(6).fill('')).slice(0, 6);
    setDigits(next);
    refs[Math.min(text.length, 5)].current?.focus();
  };

  const verify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { identifier, type, otp, purpose });
      toast.success('Verified!');
      onVerified(otp);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (timer > 0) return;
    try {
      await api.post('/auth/send-otp', { identifier, type, purpose });
      setTimer(60);
      setDigits(['', '', '', '', '', '']);
      toast.success('OTP resent!');
    } catch {
      toast.error('Failed to resend');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold text-ocean mb-1">Verify your {type}</h2>
        <p className="text-slate-500 text-sm mb-6">
          OTP sent to <span className="font-medium text-slate-700">{identifier}</span>
        </p>

        {/* Digit boxes */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:border-primary-500 transition border-slate-200"
            />
          ))}
        </div>

        <button onClick={verify} disabled={loading} className="btn-primary w-full mb-3">
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>

        <button
          onClick={resend}
          disabled={timer > 0}
          className="w-full flex items-center justify-center gap-1 text-sm text-primary-600 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <RefreshCw size={13} />
          {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}
