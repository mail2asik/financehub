import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  Tags,
  Receipt,
  PieChart,
  Target,
  Repeat,
  BarChart3,
  LogOut,
  User,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const PrivateLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Landmark },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Recurring', path: '/recurring', icon: Repeat },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-50">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">FinanceHub</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white transition"
          >
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-lg font-semibold text-slate-800">
            {menuItems.find((m) => m.path === location.pathname)?.name || 'App Console'}
          </h1>
        </header>

        <main className="flex-1 min-w-0 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;