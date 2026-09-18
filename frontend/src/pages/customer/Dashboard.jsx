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
  AlertCircle,
  QrCode,
  Building2,
  Lock,
  CheckCircle2,
  X,
  ArrowDownToLine
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [error, setError] = useState('');

  // Realistic Inter-Bank Funding Workflow States
  const [fundingTab, setFundingTab] = useState('ADD'); // 'ADD' or 'RECEIVE'
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'NETBANKING', 'DEBIT_CARD'
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [upiApp, setUpiApp] = useState('Google Pay');
  const [upiVpa, setUpiVpa] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [depositStep, setDepositStep] = useState('INPUT'); // 'INPUT', 'PIN', 'PROCESSING', 'SUCCESS'
  const [gatewayMessage, setGatewayMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

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

  const handleProceedToAuth = (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    if (paymentMethod === 'UPI') {
      setDepositStep('PIN');
    } else {
      executeFunding();
    }
  };

  const executeFunding = async () => {
    setDepositLoading(true);
    setDepositStep('PROCESSING');
    setGatewayMessage('Connecting to NPCI / Bank Gateway...');

    setTimeout(() => {
      setGatewayMessage('Authorizing transaction with source institution...');
    }, 600);

    setTimeout(async () => {
      try {
        let sourceDetail = '';
        if (paymentMethod === 'UPI') {
          sourceDetail = `${upiApp} (${upiVpa || (user?.username ? user.username + '@okaxis' : 'user@upi')})`;
        } else if (paymentMethod === 'NETBANKING') {
          sourceDetail = `${selectedBank} NetBanking`;
        } else {
          sourceDetail = 'Debit Card (•••• 9012)';
        }

        const res = await api.post('/accounts/deposit', {
          amount: parseFloat(depositAmount),
          paymentMethod: paymentMethod,
          sourceDetail: sourceDetail
        });

        if (res.data?.success) {
          setDepositStep('SUCCESS');
          loadDashboardData();
          setTimeout(() => {
            setShowDepositModal(false);
            setDepositStep('INPUT');
            setDepositAmount('');
            setUpiPin('');
          }, 1800);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Transfer from external bank failed');
        setDepositStep('INPUT');
      } finally {
        setDepositLoading(false);
      }
    }, 1400);
  };

  const copyText = (key, text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
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
            onClick={() => {
              setShowDepositModal(true);
              setDepositStep('INPUT');
              setFundingTab('ADD');
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Add / Receive Money</span>
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
              <span>
                A/C: {showBalance ? account?.accountNumber : (account?.accountNumber ? `•••• •••• ${account.accountNumber.slice(-4)}` : '••••••••••••')}
              </span>
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
              <p className="text-base font-bold text-white font-mono">
                {showBalance
                  ? `₹${parseFloat(analytics?.totalIncome || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : '••••••'}
              </p>
            </div>

            <div className="flex-1 sm:w-40 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>Expenses</span>
              </div>
              <p className="text-base font-bold text-white font-mono">
                {showBalance
                  ? `₹${parseFloat(analytics?.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : '••••••'}
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
              <p className="text-xs text-slate-400">Latest account activity</p>
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
        </div>
      </div>

      {/* Modern Multi-Method Funding & Receive Money Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Fund Savings Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">Transfer from your external bank or scan to receive via UPI</p>
              </div>
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositStep('INPUT');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher: Add from Other Bank vs Receive via QR */}
            <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => { setFundingTab('ADD'); setDepositStep('INPUT'); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
                  fundingTab === 'ADD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Transfer from Other Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setFundingTab('RECEIVE')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
                  fundingTab === 'RECEIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Receive via UPI / QR</span>
              </button>
            </div>

            {/* TAB 1: Transfer from Other Bank (Add via UPI / NetBanking / Debit Card) */}
            {fundingTab === 'ADD' && (
              <div>
                {depositStep === 'INPUT' && (
                  <form onSubmit={handleProceedToAuth} className="space-y-5">
                    {/* Amount Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Amount to Transfer (₹)
                        </label>
                        <span className="text-[11px] text-slate-400">Min ₹100 • Max ₹2,00,000</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                        <input
                          type="number"
                          step="100"
                          min="10"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="e.g. 5,000"
                          required
                          autoFocus
                          className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none transition"
                        />
                      </div>
                      {/* Quick Amount Suggestion Chips */}
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {['500', '1000', '2000', '5000', '10000'].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDepositAmount(amt)}
                            className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200/80 transition"
                          >
                            +₹{parseInt(amt).toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Funding Source Channel Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'UPI', label: 'UPI Apps', sub: 'GPay, PhonePe, Paytm', icon: Smartphone },
                          { id: 'NETBANKING', label: 'NetBanking', sub: 'SBI, HDFC, ICICI', icon: Building2 },
                          { id: 'DEBIT_CARD', label: 'Debit Card', sub: 'Visa / Mastercard', icon: CreditCard },
                        ].map((m) => {
                          const Icon = m.icon;
                          const isSelected = paymentMethod === m.id;
                          return (
                            <div
                              key={m.id}
                              onClick={() => setPaymentMethod(m.id)}
                              className={`p-3 rounded-2xl border cursor-pointer transition text-center flex flex-col items-center justify-center ${
                                isSelected
                                  ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/20'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                              <span className="text-xs font-bold block">{m.label}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">{m.sub}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Method Detail Options */}
                    {paymentMethod === 'UPI' && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <label className="block text-xs font-semibold text-slate-700">Choose UPI Provider or VPA</label>
                        <div className="flex flex-wrap gap-2">
                          {['Google Pay', 'PhonePe', 'Paytm UPI', 'BHIM UPI'].map((app) => (
                            <button
                              key={app}
                              type="button"
                              onClick={() => setUpiApp(app)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                                upiApp === app
                                  ? 'bg-slate-900 text-white font-bold'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {app}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          placeholder={`Enter UPI ID (e.g. ${user?.username || 'user'}@okaxis)`}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {paymentMethod === 'NETBANKING' && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">Select External Bank</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-brand-500 focus:outline-none"
                        >
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          <option value="Punjab National Bank">Punjab National Bank</option>
                        </select>
                        <p className="text-[11px] text-slate-400">You will authorize the transfer securely via your bank's gateway.</p>
                      </div>
                    )}

                    {paymentMethod === 'DEBIT_CARD' && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <label className="block text-xs font-semibold text-slate-700">External Debit Card Details</label>
                        <input
                          type="text"
                          placeholder="Card Number (e.g. 4111 2222 3333 4444)"
                          defaultValue="4532 9812 3456 9012"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:border-brand-500 focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            defaultValue="11/28"
                            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:border-brand-500 focus:outline-none"
                          />
                          <input
                            type="password"
                            maxLength="3"
                            placeholder="CVV"
                            defaultValue="824"
                            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:border-brand-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Submit CTA */}
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDepositModal(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-50 shadow-md shadow-brand-600/20"
                      >
                        Proceed to Authorize ₹{depositAmount ? parseFloat(depositAmount).toLocaleString('en-IN') : '0'} →
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: UPI PIN Gateway Screen */}
                {depositStep === 'PIN' && (
                  <div className="space-y-5 text-center py-2 animate-in fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Enter UPI PIN</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Authorizing transfer of <strong className="text-slate-900">₹{parseFloat(depositAmount).toLocaleString('en-IN')}</strong> from {upiApp}
                      </p>
                    </div>

                    <div className="max-w-xs mx-auto">
                      <input
                        type="password"
                        maxLength="6"
                        autoFocus
                        value={upiPin}
                        onChange={(e) => setUpiPin(e.target.value)}
                        placeholder="••••"
                        className="text-center tracking-widest text-2xl font-mono py-3 w-full bg-slate-50 border border-slate-300 rounded-2xl focus:border-brand-500 focus:bg-white focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-2">
                        Simulated NPCI Secure UPI Gateway. Enter any 4-6 digit PIN to test.
                      </p>
                    </div>

                    <div className="flex items-center justify-center space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setDepositStep('INPUT')}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={executeFunding}
                        disabled={depositLoading || upiPin.length < 4}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-50 shadow-md shadow-brand-600/20"
                      >
                        Confirm & Pay ₹{parseFloat(depositAmount).toLocaleString('en-IN')}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Gateway Processing Screen */}
                {depositStep === 'PROCESSING' && (
                  <div className="py-10 text-center space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 rounded-full border-4 border-brand-600 border-t-transparent animate-spin mx-auto" />
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Processing Inter-Bank Transfer</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium animate-pulse">{gatewayMessage}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Please do not close or refresh this window while NPCI confirms settlement.
                    </p>
                  </div>
                )}

                {/* STEP 4: Success Screen */}
                {depositStep === 'SUCCESS' && (
                  <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900">Funds Transferred Successfully!</h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      ₹{parseFloat(depositAmount).toLocaleString('en-IN')} has been transferred from your external account and credited to your FIN Savings Account.
                    </p>
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Settled via NPCI Fast Payments
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Receive Money (UPI QR & Official Bank Account Details) */}
            {fundingTab === 'RECEIVE' && (
              <div className="space-y-5 animate-in fade-in">
                {/* Styled UPI QR Visual */}
                <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white text-center shadow-xl">
                  <div className="flex items-center justify-center space-x-2 mb-3 text-brand-300">
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">FIN Instant UPI QR</span>
                  </div>

                  {/* QR Code Container */}
                  <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center shadow-md">
                    {/* Stylized QR Box using CSS grid elements */}
                    <div className="w-40 h-40 border-4 border-slate-900 p-2 rounded-xl flex flex-col justify-between relative">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-slate-900 rounded-sm flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-xs" />
                        </div>
                        <div className="w-8 h-8 bg-slate-900 rounded-sm flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-xs" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                          FIN
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-8 h-8 bg-slate-900 rounded-sm flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-xs" />
                        </div>
                        <div className="grid grid-cols-2 gap-1 w-6 h-6">
                          <div className="bg-slate-900 w-2 h-2" />
                          <div className="bg-slate-900 w-2 h-2" />
                          <div className="bg-slate-900 w-2 h-2" />
                          <div className="bg-slate-900 w-2 h-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium mt-3">
                    Scan with any UPI app (GPay, PhonePe, Paytm, BHIM)
                  </p>
                  <p className="text-[10px] text-slate-400">Beneficiary: {user?.fullName}</p>
                </div>

                {/* Bank Transfer Details List */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">UPI ID / VPA</span>
                      <span className="font-bold text-slate-900 font-mono">{user?.username || 'user'}@finbank</span>
                    </div>
                    <button
                      onClick={() => copyText('vpa', `${user?.username || 'user'}@finbank`)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center space-x-1"
                    >
                      {copiedKey === 'vpa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'vpa' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Number</span>
                      <span className="font-bold text-slate-900 font-mono">{account?.accountNumber}</span>
                    </div>
                    <button
                      onClick={() => copyText('acc', account?.accountNumber)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center space-x-1"
                    >
                      {copiedKey === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'acc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">IFSC Code</span>
                      <span className="font-bold text-slate-900 font-mono">FINB0001024</span>
                    </div>
                    <button
                      onClick={() => copyText('ifsc', 'FINB0001024')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center space-x-1"
                    >
                      {copiedKey === 'ifsc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'ifsc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank & Branch</span>
                      <span className="font-semibold text-slate-700">FIN Digital Bank Ltd., Central Digital Hub</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
