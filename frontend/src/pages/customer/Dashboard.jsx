import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Receipt,
  Users,
  Smartphone,
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Check,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [accRes, txRes, anaRes] = await Promise.all([
        api.get('/accounts/primary'),
        api.get('/transfers/recent'),
        api.get('/analytics'),
      ]);

      if (accRes.data?.success) setAccount(accRes.data.data);
      if (txRes.data?.success) setRecentTx(txRes.data.data);
      if (anaRes.data?.success) setAnalytics(anaRes.data.data);
    } catch (err) {
      setError('Unable to load dashboard information. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const copyAccountNumber = () => {
    if (account?.accountNumber) {
      navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    setDepositLoading(true);
    try {
      const res = await api.post('/accounts/deposit', { amount: parseFloat(depositAmount) });
      if (res.data?.success) {
        setShowDepositModal(false);
        setDepositAmount('');
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here is your daily account summary and activity
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Funds</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                {account?.accountType || 'SAVINGS'} ACCOUNT
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mt-3">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans">
                {showBalance ? `₹ ${parseFloat(account?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '••••••••'}
              </span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-white p-1 transition"
                title={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center space-x-2 mt-4 text-xs text-slate-400 font-mono">
              <span>A/C: {account?.accountNumber}</span>
              <button
                onClick={copyAccountNumber}
                className="hover:text-brand-400 p-1 transition flex items-center"
                title="Copy account number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {copied && <span className="text-emerald-400 text-[10px]">Copied!</span>}
            </div>
          </div>

          {/* Mini income/expense pill cards */}
          <div className="flex sm:flex-row gap-3">
            <div className="flex-1 sm:w-40 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Income</span>
              </div>
              <p className="text-base font-bold text-white">
                ₹{parseFloat(analytics?.totalIncome || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex-1 sm:w-40 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Expenses</span>
              </div>
              <p className="text-base font-bold text-white">
                ₹{parseFloat(analytics?.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row (Goal.md sections 8 & 24) */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Send Money', path: '/transfers', icon: ArrowLeftRight, color: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600' },
            { label: 'Pay Bills', path: '/bills', icon: Receipt, color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600' },
            { label: 'Add Payee', path: '/beneficiaries', icon: Users, color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600' },
            { label: 'Recharge', path: '/bills', icon: Smartphone, color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600' },
            { label: 'Manage Cards', path: '/cards', icon: CreditCard, color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600' },
            { label: 'Statements', path: '/transactions', icon: Wallet, color: 'bg-slate-100 text-slate-700 group-hover:bg-slate-800' },
          ].map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(act.path)}
                className="group p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs transition-all duration-200 flex flex-col items-center text-center text-slate-700 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-colors duration-200 group-hover:text-white ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions & Quick Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List (2 columns on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Latest simulated ledger entries</p>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
            >
              View All
            </button>
          </div>

          {recentTx.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No transactions yet. Start by sending money or paying a utility bill.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTx.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition">
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-tight">{tx.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tx.recipientInfo} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs sm:text-sm font-bold font-mono ${
                      tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                    </p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 mt-0.5">
                      {tx.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Card: Security & Spending Category Summary */}
        <div className="space-y-6">
          {/* Quick Category Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Spend by Category</h3>
            <p className="text-xs text-slate-400 mb-4">Current month expenses</p>

            {analytics?.categoryExpenses && (
              <div className="space-y-3">
                {Object.entries(analytics.categoryExpenses)
                  .filter(([_, amt]) => parseFloat(amt) > 0)
                  .map(([cat, amt]) => (
                    <div key={cat} className="text-xs">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>{cat}</span>
                        <span className="font-bold">₹{parseFloat(amt).toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (parseFloat(amt) / (parseFloat(analytics.totalExpenses) || 1)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                {Object.values(analytics.categoryExpenses).every(amt => parseFloat(amt) === 0) && (
                  <p className="text-xs text-slate-400 py-4 text-center">No categorized expenses this month.</p>
                )}
              </div>
            )}
          </div>

          {/* Security & Educational Assurance Badge */}
          <div className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-100 text-indigo-900">
            <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Fintech Safety</span>
            </div>
            <p className="text-xs text-indigo-950/80 leading-relaxed mt-1">
              All transactions are processed inside a secure simulated environment. Real bank accounts are never linked.
            </p>
          </div>
        </div>
      </div>

      {/* Deposit Funds Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Simulate Cash Deposit</h3>
            <p className="text-xs text-slate-500 mb-4">Top up your educational balance instantly</p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  step="10"
                  min="10"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-50"
                >
                  {depositLoading ? 'Depositing...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
