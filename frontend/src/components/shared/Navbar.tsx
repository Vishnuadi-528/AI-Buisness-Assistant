import { Link, useLocation } from 'react-router-dom';
import { Brain, LayoutDashboard, Plus, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';
import clsx from 'clsx';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/new-business', label: 'New Report', icon: Plus },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const { user } = useAuthStore();
  const logout = useLogout();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm hidden sm:block">
              AI Business Assistant
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* User + logout */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-slate-500">{user?.name}</span>
            <button onClick={logout} className="btn-secondary py-1.5 px-3 text-xs">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium',
                location.pathname === to
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
          <button
            onClick={() => { logout(); setMobileOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
