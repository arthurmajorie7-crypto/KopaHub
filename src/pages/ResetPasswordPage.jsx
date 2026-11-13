import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ token: searchParams.get('token') || '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    if (form.password.length < 8) return setMessage('Use a password with at least 8 characters.');
    if (form.password !== form.confirmPassword) return setMessage('Passwords do not match.');
    setLoading(true);
    try {
      const response = await resetPassword(form);
      setMessage(response.message || 'Password reset successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"><h2 className="text-3xl font-bold text-slate-900">Reset password</h2><p className="mt-2 text-sm text-slate-600">Use the token from your reset link to choose a new password.</p><form className="mt-6 space-y-4" onSubmit={handleSubmit}><div><label htmlFor="resetToken" className="text-sm font-medium text-slate-700">Reset token</label><input id="resetToken" required value={form.token} onChange={(e) => setForm((v) => ({ ...v, token: e.target.value }))} className="form-input" /></div><div><label htmlFor="newPassword" className="text-sm font-medium text-slate-700">New password</label><input id="newPassword" type="password" required minLength="8" autoComplete="new-password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} className="form-input" /></div><div><label htmlFor="confirmNewPassword" className="text-sm font-medium text-slate-700">Confirm password</label><input id="confirmNewPassword" type="password" required value={form.confirmPassword} onChange={(e) => setForm((v) => ({ ...v, confirmPassword: e.target.value }))} className="form-input" /></div>{message && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</div>}<button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-premium hover:bg-blue-700 disabled:opacity-60">{loading ? 'Updating…' : 'Update password'}</button></form><p className="mt-5 text-center text-sm text-slate-600"><Link to="/login" className="font-semibold text-blue-600">Back to login</Link></p></div></div>;
}
