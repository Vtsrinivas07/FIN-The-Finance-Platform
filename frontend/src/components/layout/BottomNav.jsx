import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight, Receipt, CreditCard, Users, ShieldCheck, Menu } from 'lucide-react';

const BottomNav = ({ onOpenSidebar }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const customerNavs = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfer', path: '/transfers', icon: ArrowLeftRight },
    { name: 'Bills', path: '/bills', icon: Receipt },
    { name: 'Cards', path: '/cards', icon: CreditCard },
  ];

  const adminNavs = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin?tab=users', icon: Users },
    { name: 'Approvals', path: '/admin?tab=kyc', icon: ShieldCheck },
    { name: 'Audits', path: '/admin?tab=audit', icon: LayoutDashboard },
  ];

  const navs = isAdmin ? adminNavs : customerNavs;

  const isNavActive = (itemPath) => {
    const currentFull = location.pathname + location.search;
    if (itemPath.includes('?')) {
      return currentFull === itemPath;
    }
    if (itemPath === '/admin') {
      return location.pathname === '/admin' && (!location.search || location.search === '?tab=overview');
    }
    return location.pathname === itemPath;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navs.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-1 px-2 xs:px-3 rounded-xl transition text-[10px] xs:text-[11px] font-medium ${
              active ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4 xs:w-5 xs:h-5 mb-0.5" />
            <span className="truncate max-w-[60px]">{item.name}</span>
          </Link>
        );
      })}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center py-1 px-2 xs:px-3 rounded-xl text-slate-500 hover:text-slate-900 text-[10px] xs:text-[11px] font-medium"
      >
        <Menu className="w-4 h-4 xs:w-5 xs:h-5 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};

export default BottomNav;

