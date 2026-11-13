import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setResetToken('');
    try {
      const response = await forgotPassword(email);
      setMessage(response.message || 'If an account exists for this email, reset instructions will be sent.');
      if (response.resetToken) setResetToken(response.resetToken);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to send reset request.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"><h2 className="text-3xl font-bold text-slate-900">Forgot password</h2><p className="mt-2 text-sm text-slate-600">Enter your account email to request a reset.</p><form className="mt-6 space-y-4" onSubmit={handleSubmit}><div><label htmlFor="forgotEmail" className="text-sm font-medium text-slate-700">Email address</label><input id="forgotEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" /></div>{message && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</div>}{resetToken && <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`} className="block text-sm font-semibold text-blue-600">Continue to reset password (development link)</Link>}<button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-premium hover:bg-blue-700 disabled:opacity-60">{loading ? 'Sending…' : 'Send reset request'}</button></form><p className="mt-5 text-center text-sm text-slate-600"><Link to="/login" className="font-semibold text-blue-600">Back to sign in</Link></p></div></div>;
}
