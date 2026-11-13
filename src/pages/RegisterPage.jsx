import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emptyForm = { fullName: '', phoneNumber: '', email: '', password: '', confirmPassword: '' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim() || undefined });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 text-center"><p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Create account</p><h2 className="mt-2 text-3xl font-bold text-slate-900">Join KopaHub</h2></div>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full name</label><input id="fullName" required minLength="2" autoComplete="name" value={form.fullName} onChange={update('fullName')} className="form-input" /></div>
          <div><label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700">Phone number</label><input id="phoneNumber" required type="tel" autoComplete="tel" value={form.phoneNumber} onChange={update('phoneNumber')} className="form-input" placeholder="+254…" /></div>
          <div><label htmlFor="registerEmail" className="text-sm font-medium text-slate-700">Email (optional)</label><input id="registerEmail" type="email" autoComplete="email" value={form.email} onChange={update('email')} className="form-input" /></div>
          <div><label htmlFor="registerPassword" className="text-sm font-medium text-slate-700">Password</label><input id="registerPassword" type="password" required minLength="8" autoComplete="new-password" value={form.password} onChange={update('password')} className="form-input" /></div>
          <div><label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm password</label><input id="confirmPassword" type="password" required autoComplete="new-password" value={form.confirmPassword} onChange={update('confirmPassword')} className="form-input" /></div>
          {error && <div role="alert" className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <button type="submit" disabled={loading} className="md:col-span-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-premium transition hover:bg-blue-700 disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link></p>
      </div>
    </div>
  );
}
