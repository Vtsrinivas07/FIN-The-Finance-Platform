import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  X,
  ArrowLeftRight,
  Users,
  Receipt,
  CreditCard,
  PieChart,
  HelpCircle,
  LayoutDashboard,
  ShieldAlert,
  Settings,
  User,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CUSTOMER_QUICK_ACTIONS = [
  { label: 'Transfer Money', path: '/transfers', icon: ArrowLeftRight, category: 'Action' },
  { label: 'Add Beneficiary', path: '/beneficiaries', icon: Users, category: 'Action' },
  { label: 'Pay Utility Bills', path: '/bills', icon: Receipt, category: 'Action' },
  { label: 'Manage Debit Cards', path: '/cards', icon: CreditCard, category: 'Action' },
  { label: 'View Spending Analytics', path: '/analytics', icon: PieChart, category: 'Action' },
  { label: 'View Statements & History', path: '/transactions', icon: Receipt, category: 'Action' },
];

const ADMIN_QUICK_ACTIONS = [
  { label: 'Overview Dashboard', path: '/admin', icon: LayoutDashboard, category: 'Dashboard' },
  { label: 'Customer Search', path: '/admin?tab=users', icon: Users, category: 'Customers' },
  { label: 'Transaction Search', path: '/admin?tab=transactions', icon: ArrowLeftRight, category: 'Transactions' },
  { label: 'Audit Logs', path: '/admin?tab=audit', icon: ShieldAlert, category: 'Security' },
  { label: 'Admin Settings & Support Desk', path: '/settings', icon: Settings, category: 'Settings' },
];

const SearchModal = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState('');
  const [faqResults, setFaqResults] = useState([]);
  const [matchingUsers, setMatchingUsers] = useState([]);
  const [matchingTransactions, setMatchingTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (query.trim().length > 1) {
      if (isAdmin) {
        searchAdminData(query.trim().toLowerCase());
      } else {
        searchFaqs(query.trim());
      }
    } else {
      setFaqResults([]);
      setMatchingUsers([]);
      setMatchingTransactions([]);
    }
  }, [query, isAdmin]);

  const searchFaqs = async (q) => {
    try {
      const res = await api.get(`/support/faqs/search?query=${encodeURIComponent(q)}`);
      if (res.data?.success) {
        setFaqResults(res.data.data.slice(0, 4));
      }
    } catch (e) {
      // Ignored
    }
  };

  const searchAdminData = async (q) => {
    try {
      const [uRes, tRes] = await Promise.all([
        api.get('/admin/users?size=25'),
        api.get('/admin/transactions?size=25'),
      ]);

      if (uRes.data?.success) {
        const allUsers = uRes.data.data.content || [];
        const matched = allUsers.filter(
          (u) =>
            u.fullName?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.mobileNumber?.includes(q)
        );
        setMatchingUsers(matched.slice(0, 3));
      }

      if (tRes.data?.success) {
        const allTx = tRes.data.data.content || [];
        const matched = allTx.filter(
          (t) =>
            t.referenceNumber?.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q) ||
            t.accountNumber?.includes(q)
        );
        setMatchingTransactions(matched.slice(0, 3));
      }
    } catch (e) {
      // Ignored
    }
  };

  if (!isOpen) return null;

  const quickActions = isAdmin ? ADMIN_QUICK_ACTIONS : CUSTOMER_QUICK_ACTIONS;
  const filteredActions = quickActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAdmin
                ? 'Search customer accounts, transactions, audit logs...'
                : 'Search actions, beneficiaries, bills, FAQs...'
            }
            autoFocus
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Navigation Actions */}
          {filteredActions.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isAdmin ? 'Admin Navigation' : 'Quick Navigation'}
              </p>
              <div className="space-y-1">
                {filteredActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(action.path)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-brand-700 text-slate-700 cursor-pointer transition text-sm group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-brand-100 text-slate-500 group-hover:text-brand-600 transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{action.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin User Search Results */}
          {isAdmin && matchingUsers.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Matching Customer Accounts
              </p>
              <div className="space-y-1">
                {matchingUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelect('/admin?tab=users')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-brand-700 text-slate-700 cursor-pointer transition text-sm group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-900">{u.fullName}</p>
                        <p className="text-[11px] text-slate-400">@{u.username} • {u.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {u.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Transaction Search Results */}
          {isAdmin && matchingTransactions.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Matching Transactions
              </p>
              <div className="space-y-1">
                {matchingTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => handleSelect('/admin?tab=transactions')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-brand-700 text-slate-700 cursor-pointer transition text-sm group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-900 truncate max-w-xs">{tx.description}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{tx.referenceNumber}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      ₹{parseFloat(tx.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Knowledge Base Results (Customer only) */}
          {!isAdmin && faqResults.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Related Banking FAQs
              </p>
              <div className="space-y-1.5">
                {faqResults.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-xs transition"
                  >
                    <p className="font-semibold text-slate-800 flex items-center">
                      <HelpCircle className="w-3.5 h-3.5 text-brand-600 mr-1.5 flex-shrink-0" />
                      {faq.question}
                    </p>
                    <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 &&
            faqResults.length === 0 &&
            matchingUsers.length === 0 &&
            matchingTransactions.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                No results found for "{query}".
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with mouse or keyboard</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

