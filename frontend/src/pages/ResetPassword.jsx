import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get('token') || '';
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    if (!token) { setError('Missing token'); return; }
    if (!p1 || p1 !== p2) { setError('Passwords do not match'); return; }
    try {
      await api('/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword: p1 }) });
      setStatus('Password updated. You can sign in now.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (e) {
      setError(e.message || 'Failed to reset password');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold mb-4">Reset your password</h1>
        <input type="password" placeholder="New password" className="w-full border border-white/15 rounded-md px-3 py-2 mb-3" value={p1} onChange={(e)=>setP1(e.target.value)} />
        <input type="password" placeholder="Confirm password" className="w-full border border-white/15 rounded-md px-3 py-2 mb-3" value={p2} onChange={(e)=>setP2(e.target.value)} />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        {status && <div className="text-emerald-700 text-sm mb-2">{status}</div>}
        <button className="w-full bg-[#D4AF37] text-white rounded-md py-2 font-semibold hover:bg-[#B98B2D]">Update password</button>
      </form>
    </div>
  );
}


