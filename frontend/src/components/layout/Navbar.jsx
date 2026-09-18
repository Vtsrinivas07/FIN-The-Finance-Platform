import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Search, Bell, CheckCheck, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const Navbar = ({ onOpenSidebar, onOpenSearch }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
      const countRes = await api.get('/notifications/unread-count');
      if (countRes.data?.success) {
        setUnreadCount(countRes.data.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignored if offline
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(notifications.map(n => n.id === id ? ({ ...n, isRead: true }) : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Left section: Hamburger & Search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Universal Search trigger button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-sm w-48 sm:w-72 transition text-left group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          <span className="flex-1 truncate">Search transfers, bills, FAQs...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right section: Educational demo pill, Notification Center, User Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Educational Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Simulated Banking Mode</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-brand-600 hover:text-brand-700 flex items-center space-x-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                      className={`p-3.5 transition flex items-start space-x-3 cursor-pointer ${
                        n.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-brand-50/40 hover:bg-brand-50/70'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? 'bg-slate-300' : 'bg-brand-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">{user?.fullName}</p>
            <p className="text-[10px] text-slate-400 font-mono">ACC Verified</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
