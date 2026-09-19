import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Receipt,
  CreditCard,
  PieChart,
  History,
  Settings,
  ShieldAlert,
  LogOut,
  Building2,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const customerNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfers', path: '/transfers', icon: ArrowLeftRight },
    { name: 'Financial Products & Health', path: '/products', icon: Sparkles },
    { name: 'Bill Payments', path: '/bills', icon: Receipt },
    { name: 'Cards', path: '/cards', icon: CreditCard },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminNavItems = [
    { name: 'Operations Hub', path: '/admin', icon: LayoutDashboard },
    { name: 'Customer CIF Inquiry', path: '/admin?tab=users', icon: Users },
    { name: 'Clearing & AML Inquiry', path: '/admin?tab=transactions', icon: ArrowLeftRight },
    { name: 'Security & Audit Trail', path: '/admin?tab=audit', icon: ShieldAlert },
    { name: 'KYC Approvals', path: '/admin?tab=kyc', icon: ShieldCheck },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const isItemActive = (itemPath) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;

    if (itemPath.includes('?')) {
      const [itemBasePath, itemQuery] = itemPath.split('?');
      if (currentPath !== itemBasePath) return false;
      const itemParams = new URLSearchParams(itemQuery);
      const currentParams = new URLSearchParams(currentSearch);
      for (const [key, value] of itemParams.entries()) {
        if (currentParams.get(key) !== value) return false;
      }
      return true;
    }

    if (itemPath === '/admin') {
      if (currentPath !== '/admin') return false;
      const currentParams = new URLSearchParams(currentSearch);
      const tab = currentParams.get('tab');
      return !tab || tab === 'overview';
    }

    return currentPath === itemPath;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white font-sans">FIN</span>
            {isAdmin && (
              <span className="text-[10px] uppercase tracking-widest text-brand-400 font-bold block -mt-1">
                Admin Console
              </span>
            )}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {isAdmin ? 'Bank Operations' : 'Banking Menu'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-sm">
              {user?.fullName?.charAt(0) || (isAdmin ? 'A' : 'U')}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">
                {isAdmin ? 'Operations Admin' : `@${user?.username}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
