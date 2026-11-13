import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Groups', path: '/groups' },
  { label: 'Loans', path: '/loans' },
  { label: 'Payments', path: '/payments' },
  { label: 'Reports', path: '/reports' },
  { label: 'Profile', path: '/profile' },
  { label: 'Admin', path: '/admin' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-premium">
              K
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">KopaHub</p>
              <p className="text-xs text-slate-500">Community Finance</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Account</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{user?.fullName || 'Member'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'member@kopahub.io'}</p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="block lg:hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                    K
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Good morning</p>
                  <h1 className="text-lg font-semibold text-slate-900">KopaHub Workspace</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                  + New Action
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-premium transition hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
