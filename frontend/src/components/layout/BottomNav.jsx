import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ArrowLeftRight, Receipt, CreditCard, Users, ShieldAlert, Menu } from 'lucide-react';

const BottomNav = ({ onOpenSidebar }) => {
  const { isAdmin } = useAuth();

  const customerNavs = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfer', path: '/transfers', icon: ArrowLeftRight },
    { name: 'Bills', path: '/bills', icon: Receipt },
    { name: 'Cards', path: '/cards', icon: CreditCard },
  ];

  const adminNavs = [
    { name: 'Operations', path: '/admin', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin?tab=users', icon: Users },
    { name: 'Monitor', path: '/admin?tab=transactions', icon: ArrowLeftRight },
    { name: 'Audit', path: '/admin?tab=audit', icon: ShieldAlert },
  ];

  const navs = isAdmin ? adminNavs : customerNavs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {navs.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl transition text-[11px] font-medium ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 text-[11px] font-medium"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};

export default BottomNav;
