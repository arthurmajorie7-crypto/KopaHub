import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  ['Dashboard', '/dashboard'], ['Groups', '/groups'], ['Loans', '/loans'],
  ['Payments', '/payments'], ['Reports', '/reports'], ['Profile', '/profile'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = user?.role?.toLowerCase() === 'admin' ? [...navigation, ['Admin', '/admin']] : navigation;
  const signOut = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
        <Brand />
        <nav className="mt-8 space-y-1">{links.map(([label, path]) => <NavItem key={path} label={label} path={path} />)}</nav>
        <div className="mt-10 border-t border-slate-100 pt-4"><p className="truncate text-sm font-semibold">{user?.fullName || 'Member'}</p><p className="truncate text-xs text-slate-500">{user?.email || user?.phoneNumber}</p></div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="lg:hidden"><Brand /></div><p className="hidden text-sm text-slate-500 lg:block">Community finance, made clear.</p>
          <div className="flex items-center gap-3"><span className="hidden text-sm sm:inline">{user?.fullName}</span><button className="rounded-lg border px-3 py-2 text-sm lg:hidden" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>Menu</button><button onClick={signOut} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">Sign out</button></div>
        </header>
        {menuOpen && <nav className="space-y-1 border-b bg-white p-3 lg:hidden">{links.map(([label, path]) => <NavItem key={path} label={label} path={path} onClick={() => setMenuOpen(false)} />)}</nav>}
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

function NavItem({ label, path, onClick }) {
  return <NavLink to={path} onClick={onClick} className={({ isActive }) => `block rounded-xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>{label}</NavLink>;
}

function Brand() {
  return <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">K</div><div><p className="font-bold text-slate-900">KopaHub</p><p className="text-xs text-slate-500">Community Finance</p></div></div>;
}
