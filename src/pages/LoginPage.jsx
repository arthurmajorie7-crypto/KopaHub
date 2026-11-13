import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form, rememberMe);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to KopaHub. Check the API and database are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid lg:grid-cols-2">
        <section className="hidden bg-blue-600 p-10 text-white lg:flex lg:flex-col lg:justify-between"><div><Brand /><h1 className="mt-16 max-w-sm text-4xl font-bold leading-tight">Finance that brings communities together.</h1></div><p className="text-sm text-blue-100">Save together. Borrow responsibly. Grow with confidence.</p></section>
        <section className="p-6 sm:p-10"><p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Welcome back</p><h2 className="mt-2 text-3xl font-bold text-slate-900">Sign in to KopaHub</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5"><div><label htmlFor="login-email" className="text-sm font-medium text-slate-700">Email or phone</label><input id="login-email" required autoComplete="username" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} className="form-input" placeholder="you@example.com" /></div><div><label htmlFor="login-password" className="text-sm font-medium text-slate-700">Password</label><input id="login-password" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} className="form-input" /></div><div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-slate-600"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />Remember me</label><Link to="/forgot-password" className="font-medium text-blue-600">Forgot password?</Link></div>{error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button></form>
          <p className="mt-6 text-center text-sm text-slate-600">New to KopaHub? <Link to="/register" className="font-semibold text-blue-600">Create account</Link></p>
        </section>
      </div>
    </div>
  );
}

function Brand() {
  return <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 font-bold text-white">K</div><div><p className="font-bold text-white">KopaHub</p><p className="text-xs text-blue-100">Community Finance</p></div></div>;
}
