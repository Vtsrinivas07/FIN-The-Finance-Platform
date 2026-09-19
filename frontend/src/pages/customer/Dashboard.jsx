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
  ArrowDownToLine,
  Sparkles,
  Percent,
  PiggyBank,
  Coins,
  Calculator,
  ChevronRight,
  Info,
  ShieldAlert,
  FileCheck,
  Award,
  Zap,
  CheckCircle
} from 'lucide-react';
import CibilGaugeChart from '../../components/common/CibilGaugeChart';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
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

  // KYC Modal & Wizard States
  const [showKycModal, setShowKycModal] = useState(false);
  const [showKycWizard, setShowKycWizard] = useState(false);
  const [kycStep, setKycStep] = useState(1);
  const [panInput, setPanInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [panValidating, setPanValidating] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [aadhaarVerifying, setAadhaarVerifying] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [vkycScanning, setVkycScanning] = useState(false);
  const [vkycSuccess, setVkycSuccess] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycError, setKycError] = useState('');

  const isKycVerified = user?.kycStatus === 'VERIFIED_TIER_3' || user?.username === 'demo' || user?.username === 'sarah' || user?.username === 'admin';

  // Financial Health & Products Hub States
  const [showCibilModal, setShowCibilModal] = useState(false);
  const [showFdModal, setShowFdModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showWealthModal, setShowWealthModal] = useState(false);

  // Interactive FD State & Calculator
  const [fdAmount, setFdAmount] = useState(50000);
  const [fdTenureMonths, setFdTenureMonths] = useState(36);
  const [bookedFds, setBookedFds] = useState([
    {
      id: 'FD-2025-78210',
      principal: 100000,
      rate: 7.25,
      tenureMonths: 36,
      maturityDate: '2028-04-15',
      maturityAmount: 124150,
      interestEarned: 24150,
      status: 'ACTIVE'
    }
  ]);
  const [fdSuccessData, setFdSuccessData] = useState(null);

  // Interactive Pre-Approved Loan State
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanTenureMonths, setLoanTenureMonths] = useState(24);
  const [loanProcessing, setLoanProcessing] = useState(false);
  const [loanSuccessData, setLoanSuccessData] = useState(null);

  // Wealth & SIP State
  const [sipAmount, setSipAmount] = useState(1000);
  const [sipSuccessToast, setSipSuccessToast] = useState('');

  const getFdRate = (months) => {
    if (months === 12) return 6.80;
    if (months === 24) return 7.10;
    if (months === 36) return 7.25;
    return 7.40;
  };

  const calculateFdMaturity = (principal, months) => {
    const rate = getFdRate(months);
    const years = months / 12;
    const maturity = Math.round(principal * Math.pow(1 + (rate / 400), 4 * years));
    const interest = maturity - principal;
    return { maturity, interest, rate };
  };

  const calculateLoanEmi = (principal, months) => {
    const annualRate = 10.49;
    const r = annualRate / 1200;
    const emi = Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
    const totalPayable = emi * months;
    const totalInterest = totalPayable - principal;
    return { emi, totalPayable, totalInterest, annualRate };
  };

  const handleBookFd = () => {
    const principal = parseFloat(fdAmount);
    if (isNaN(principal) || principal < 5000) {
      alert('Minimum Fixed Deposit amount is ₹5,000');
      return;
    }
    const currentBalance = parseFloat(account?.balance || 0);
    if (principal > currentBalance) {
      alert(`Insufficient savings balance (₹${currentBalance.toLocaleString('en-IN')}) to book this FD of ₹${principal.toLocaleString('en-IN')}. Please add funds first.`);
      return;
    }

    const { maturity, interest, rate } = calculateFdMaturity(principal, fdTenureMonths);
    const matDate = new Date();
    matDate.setMonth(matDate.getMonth() + fdTenureMonths);

    const newFd = {
      id: `FD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      principal,
      rate,
      tenureMonths: fdTenureMonths,
      maturityDate: matDate.toISOString().split('T')[0],
      maturityAmount: maturity,
      interestEarned: interest,
      status: 'ACTIVE'
    };

    setBookedFds(prev => [newFd, ...prev]);
    setFdSuccessData(newFd);
  };

  const handleDisburseLoan = async () => {
    setLoanProcessing(true);
    try {
      const { emi, annualRate } = calculateLoanEmi(loanAmount, loanTenureMonths);
      const loanAccNumber = `LN-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const res = await api.post('/accounts/deposit', {
        amount: parseFloat(loanAmount),
        paymentMethod: 'LOAN_DISBURSAL',
        sourceDetail: `Instant Personal Loan Disbursal (Loan A/C ${loanAccNumber})`
      });

      if (res.data?.success) {
        setLoanSuccessData({
          loanAccNumber,
          amount: loanAmount,
          tenureMonths: loanTenureMonths,
          emi,
          annualRate,
          disbursedAt: new Date().toLocaleTimeString()
        });
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Loan disbursal failed. Please try again.');
    } finally {
      setLoanProcessing(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.fullName?.split(' ')[0]}
            </h1>
            {isKycVerified ? (
              <button
                onClick={() => setShowKycModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold transition shadow-xs cursor-pointer group"
                title="Click to view KYC Verification Details"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Full KYC Verified (Tier 3)</span>
                <ChevronRight className="w-3 h-3 text-emerald-500 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowKycWizard(true);
                  setKycStep(1);
                  setKycError('');
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold transition shadow-xs cursor-pointer group animate-pulse"
                title="Click to complete Video KYC"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>KYC Pending (Tier 1 Limited) - Complete V-KYC</span>
                <ChevronRight className="w-3 h-3 text-amber-600 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here is your daily account summary and financial wellness hub
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

      {/* Pending KYC Action Alert Banner */}
      {!isKycVerified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-amber-200/80 text-amber-900 font-mono">
                  RBI Master Direction
                </span>
                <span className="text-xs font-bold text-slate-900">Tier-1 Minimum KYC Account</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Your account is currently under minimum KYC holding limits. Complete your 3-step digital KYC verification (PAN, Aadhaar OTP, and live Video KYC) to upgrade to Full KYC (Tier 3) with unlimited transfers.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowKycWizard(true);
              setKycStep(1);
              setKycError('');
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 whitespace-nowrap cursor-pointer transition flex items-center justify-center space-x-1.5 self-start sm:self-center"
          >
            <span>Complete Video KYC</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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
            { label: 'Add Payee', path: '/transfers?tab=beneficiaries', icon: Users, color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600' },
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

      {/* Financial Health & Products Hub (Goal.md sections 8, 24 & Indian Banking Benchmark) */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800">
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-brand-400" />
                <span>Financial Products & Health</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                RBI Compliant • DICGC Insured
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5">
              Grow, Borrow & Protect Your Wealth
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-yield guaranteed deposits, real-time CIBIL tracking, instant credit, and zero-commission wealth
            </p>
          </div>

          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-2 transition shadow-md shadow-brand-600/20 cursor-pointer self-start md:self-auto shrink-0"
          >
            <span>View Full Financial Hub</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Interactive Product Cards Grid (Harmonized Heights, Tags, & Buttons) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mt-6 items-stretch">
          {/* PRODUCT 1: CIBIL Credit Health Score */}
          <div className="bg-slate-800/70 hover:bg-slate-800/90 rounded-2xl p-5 border border-slate-700/70 transition-all flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">CIBIL Credit Score</span>
                    <span className="text-[10px] text-slate-400">TransUnion • Experian</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shrink-0">
                  EXCELLENT
                </span>
              </div>

              {/* Gauge Speedometer Chart with High-Contrast Radiant Elements */}
              <div className="py-2.5 flex items-center justify-center">
                <CibilGaugeChart score={785} showFooter={true} isDark={true} compact={true} />
              </div>

              {/* Micro Factors */}
              <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-700/60">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">On-Time Payments:</span>
                  <span className="font-bold text-emerald-400">100% (24/24)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Card Utilization:</span>
                  <span className="font-bold text-emerald-400">22.8% (&lt;30% ideal)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCibilModal(true)}
              className="mt-4 w-full h-10 rounded-xl bg-slate-700/90 hover:bg-brand-600 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <span>View Credit Health Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PRODUCT 2: High-Yield Fixed Deposit (FD / RD) */}
          <div className="bg-slate-800/70 hover:bg-slate-800/90 rounded-2xl p-5 border border-slate-700/70 transition-all flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Fixed Deposits</span>
                    <span className="text-[10px] text-slate-400">DICGC Insured ₹5L</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap shrink-0">
                  7.25% p.a.
                </span>
              </div>

              {/* Quick Calculator View */}
              <div className="my-2.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Invest:</span>
                  <div className="flex space-x-1.5">
                    {[25000, 50000, 100000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setFdAmount(amt)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          fdAmount === amt ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {(() => {
                  const { maturity, interest, rate } = calculateFdMaturity(fdAmount, fdTenureMonths);
                  return (
                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">At 3 Yrs ({rate}%):</span>
                        <span className="text-base font-extrabold text-white font-mono">
                          ₹{maturity.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        +₹{interest.toLocaleString('en-IN')} Gain
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Deposit Portfolio Snapshot */}
              <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-700/60">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Compounding:</span>
                  <span className="font-bold text-white">Quarterly Compounded</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active FDs:</span>
                  <span className="font-bold text-amber-400">
                    {bookedFds.length} Deposit ({bookedFds.reduce((acc, f) => acc + f.principal, 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setFdSuccessData(null); setShowFdModal(true); }}
              className="mt-4 w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Open Instant Deposit</span>
            </button>
          </div>

          {/* PRODUCT 3: Pre-Approved Instant Personal Loan */}
          <div className="bg-slate-800/70 hover:bg-slate-800/90 rounded-2xl p-5 border border-slate-700/70 transition-all flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Pre-Approved Loan</span>
                    <span className="text-[10px] text-slate-400">Zero Paperwork • Instant</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap shrink-0">
                  PRE-APPROVED
                </span>
              </div>

              {/* Offer & EMI Box */}
              <div className="my-2.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Eligible Credit Limit</span>
                    <span className="text-base font-black text-white font-mono">₹5,00,000</span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-bold bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
                    @ 10.49% p.a.
                  </span>
                </div>

                {(() => {
                  const { emi } = calculateLoanEmi(loanAmount, loanTenureMonths);
                  return (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">₹1L for 24M EMI:</span>
                      <span className="font-bold text-white font-mono">₹{emi.toLocaleString('en-IN')}/mo</span>
                    </div>
                  );
                })()}
              </div>

              {/* Loan Speed Highlights */}
              <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-700/60">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tenure Flexibility:</span>
                  <span className="font-bold text-white">12 to 60 Months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Direct Disbursal:</span>
                  <span className="font-bold text-emerald-400">In 60 Seconds</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setLoanSuccessData(null); setShowLoanModal(true); }}
              className="mt-4 w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Claim Instant Loan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PRODUCT 4: Wealth & Insurance Protection */}
          <div className="bg-slate-800/70 hover:bg-slate-800/90 rounded-2xl p-5 border border-slate-700/70 transition-all flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Wealth & Insurance</span>
                    <span className="text-[10px] text-slate-400">Zero Commission Direct</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap shrink-0">
                  PROTECT
                </span>
              </div>

              {/* Curated Baskets */}
              <div className="my-2.5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium truncate pr-2">Nifty 50 Index SIP</span>
                  <span className="font-bold text-emerald-400 whitespace-nowrap">14.8% CAGR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium truncate pr-2">₹1 Cr Term Life</span>
                  <span className="text-slate-400 whitespace-nowrap">from ₹650/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium truncate pr-2">₹10L Health Cover</span>
                  <span className="text-slate-400 whitespace-nowrap">Zero Co-pay</span>
                </div>
              </div>

              {/* Regulatory Assurance */}
              <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-700/60">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tax Benefits:</span>
                  <span className="font-bold text-emerald-400">Sec 80C &amp; 80D</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Regulators:</span>
                  <span className="font-bold text-white">SEBI &amp; IRDAI Licensed</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWealthModal(true)}
              className="mt-4 w-full h-10 rounded-xl bg-slate-700/90 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Explore Wealth & Cover</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
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

      {/* KYC Compliance & Verification Details Modal */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">KYC Verification & Identity</h3>
                  <p className="text-xs text-slate-500">RBI Master Direction - Know Your Customer (Tier 3)</p>
                </div>
              </div>
              <button
                onClick={() => setShowKycModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KYC Status Badge Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">Full KYC Verified (Tier 3)</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Unlimited transactions • Zero holding or debit cap
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white shadow-xs">
                ACTIVE
              </span>
            </div>

            {/* Compliance Verified Records Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Aadhaar (UIDAI Verified)</span>
                  <span className="font-bold text-slate-900 font-mono">{user?.aadhaarNumber || '•••• •••• 8921'}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">OTP / Biometric Authenticated</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Permanent Account Number (PAN)</span>
                  <span className="font-bold text-slate-900 font-mono">{user?.panNumber || '••••• 1234F'}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">NSDL Validated</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Video KYC (V-KYC)</span>
                  <span className="font-bold text-slate-900 font-mono">{user?.vkycReference || 'VKYC-2026-90412'}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Facial & Geo-match Done</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Central KYC (CKYC) Registry ID</span>
                  <span className="font-bold text-slate-900 font-mono">IN-CKYC-9912049102</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">CERSAI Portal Synced</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Next Periodic Re-KYC</span>
                  <span className="font-bold text-slate-900 font-mono">14 Jan 2036</span>
                </div>
                <span className="text-[10px] text-slate-500">Valid 10 Years (Low Risk)</span>
              </div>
            </div>

            {/* Regulatory Footer Note */}
            <div className="mt-5 p-3 rounded-xl bg-slate-100 text-[11px] text-slate-500 flex items-start space-x-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                Verified under Section 35A of the Banking Regulation Act, 1949 and Prevention of Money Laundering Act (PMLA), 2002.
              </span>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  alert('KYC Certification PDF downloaded for your records.');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Download KYC Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setShowKycModal(false)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Digital KYC Verification Wizard */}
      {showKycWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">RBI Digital KYC Verification</h3>
                  <p className="text-xs text-slate-500">Upgrade to Tier 3 Full KYC with unlimited limits</p>
                </div>
              </div>
              <button
                onClick={() => setShowKycWizard(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${kycStep >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  1
                </div>
                <span className={`text-xs font-semibold ${kycStep === 1 ? 'text-brand-600 font-bold' : 'text-slate-500'}`}>PAN Card</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${kycStep >= 2 ? 'bg-brand-600' : 'bg-slate-200'}`} />
              <div className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${kycStep >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  2
                </div>
                <span className={`text-xs font-semibold ${kycStep === 2 ? 'text-brand-600 font-bold' : 'text-slate-500'}`}>Aadhaar OTP</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${kycStep >= 3 ? 'bg-brand-600' : 'bg-slate-200'}`} />
              <div className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${kycStep >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  3
                </div>
                <span className={`text-xs font-semibold ${kycStep === 3 ? 'text-brand-600 font-bold' : 'text-slate-500'}`}>Video KYC</span>
              </div>
            </div>

            {kycError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{kycError}</span>
              </div>
            )}

            {/* Step 1: PAN Card & DOB */}
            {kycStep === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Government ID Details</span>
                  <p className="text-xs text-slate-600">Enter your 10-digit Permanent Account Number (PAN) issued by the Income Tax Department.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">PAN Card Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. ABCDE1234F"
                    value={panInput}
                    onChange={(e) => {
                      setPanInput(e.target.value.toUpperCase());
                      setPanVerified(false);
                      setKycError('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono uppercase text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Format: 5 letters, 4 numbers, 1 letter</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth (as on PAN)</label>
                  <input
                    type="date"
                    value={dobInput}
                    onChange={(e) => {
                      setDobInput(e.target.value);
                      setKycError('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={panValidating}
                    onClick={() => {
                      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                      if (!panRegex.test(panInput)) {
                        setKycError('Please enter a valid 10-digit PAN format (e.g. ABCDE1234F).');
                        return;
                      }
                      if (!dobInput) {
                        setKycError('Please enter your Date of Birth.');
                        return;
                      }
                      setPanValidating(true);
                      setTimeout(() => {
                        setPanValidating(false);
                        setPanVerified(true);
                        setKycStep(2);
                      }, 800);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center space-x-1.5"
                  >
                    <span>{panValidating ? 'Validating with NSDL...' : 'Verify PAN & Continue'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Aadhaar e-KYC */}
            {kycStep === 2 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">UIDAI Aadhaar Verification</span>
                  <p className="text-xs text-slate-600">Enter your 12-digit Aadhaar number to verify with UIDAI via OTP on your registered mobile number.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Aadhaar Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12-digit Aadhaar Number"
                      value={aadhaarInput}
                      onChange={(e) => {
                        setAadhaarInput(e.target.value.replace(/[^0-9]/g, ''));
                        setKycError('');
                      }}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (aadhaarInput.length !== 12) {
                          setKycError('Please enter a valid 12-digit Aadhaar number.');
                          return;
                        }
                        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(randomOtp);
                        setEnteredOtp(randomOtp);
                        setOtpSent(true);
                        setKycError('');
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition whitespace-nowrap"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 animate-in fade-in duration-200">
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>UIDAI OTP Sent to {user?.mobileNumber || 'Registered Mobile'}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Simulated UIDAI OTP: <strong className="font-mono text-xs bg-emerald-100 px-1.5 py-0.5 rounded">{generatedOtp}</strong>
                    </p>
                    <div className="mt-2.5">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setKycStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={aadhaarVerifying}
                    onClick={() => {
                      if (aadhaarInput.length !== 12) {
                        setKycError('Please enter a 12-digit Aadhaar number.');
                        return;
                      }
                      if (!otpSent || enteredOtp.length !== 6) {
                        setKycError('Please request and enter the 6-digit Aadhaar OTP.');
                        return;
                      }
                      setAadhaarVerifying(true);
                      setTimeout(() => {
                        setAadhaarVerifying(false);
                        setAadhaarVerified(true);
                        setKycStep(3);
                      }, 800);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition flex items-center space-x-1.5"
                  >
                    <span>{aadhaarVerifying ? 'Authenticating UIDAI...' : 'Verify Aadhaar & Proceed to V-KYC'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Video KYC (V-KYC) Simulation */}
            {kycStep === 3 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">RBI Mandated Video KYC Session</span>
                  <p className="text-xs text-slate-600">Under RBI guidelines, a live face liveness capture and geo-location match is required for Tier 3 full approval.</p>
                </div>

                {/* Simulated Camera Viewfinder */}
                <div className="relative rounded-2xl bg-slate-950 overflow-hidden h-52 flex flex-col items-center justify-center p-4 border-2 border-slate-800 text-white">
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-black/60 px-2 py-1 rounded-full text-[10px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>REC: Encrypted 256-Bit</span>
                  </div>
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-1 rounded-full">
                    GPS: 17.3850 N, 78.4867 E (India)
                  </div>

                  {vkycScanning ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-16 h-16 rounded-full border-4 border-brand-400 border-t-transparent animate-spin" />
                      <span className="text-xs font-bold text-brand-300">Scanning Face & Verifying Documents Live...</span>
                    </div>
                  ) : vkycSuccess ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-400">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-bold text-emerald-300">Facial Liveness & Geo-Match Verified!</span>
                      <span className="text-[10px] text-slate-400 font-mono">Reference: VKYC-2026-90412</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-center">
                      <div className="w-20 h-24 rounded-3xl border-2 border-dashed border-white/40 flex items-center justify-center">
                        <span className="text-[10px] text-white/60 font-mono">Align Face</span>
                      </div>
                      <p className="text-[11px] text-slate-300 max-w-xs">
                        Click below to initiate the automated camera verification and NSDL-UIDAI photo match.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setKycStep(2)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Back
                  </button>

                  {!vkycSuccess ? (
                    <button
                      type="button"
                      disabled={vkycScanning}
                      onClick={() => {
                        setVkycScanning(true);
                        setTimeout(() => {
                          setVkycScanning(false);
                          setVkycSuccess(true);
                        }, 2000);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition"
                    >
                      {vkycScanning ? 'Verifying Live...' : 'Start Liveness & Document Scan'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={kycSubmitting}
                      onClick={async () => {
                        setKycSubmitting(true);
                        setKycError('');
                        try {
                          const res = await api.post('/auth/kyc/submit', {
                            panNumber: panInput,
                            aadhaarNumber: aadhaarInput,
                            dateOfBirth: dobInput,
                            otp: enteredOtp,
                            vkycReference: 'VKYC-2026-' + Math.floor(10000 + Math.random() * 90000)
                          });
                          if (res.data && res.data.success) {
                            if (refreshUser) await refreshUser();
                            setShowKycWizard(false);
                            setShowKycModal(true);
                          }
                        } catch (err) {
                          setKycError(err.response?.data?.message || 'KYC submission failed. Please try again.');
                        } finally {
                          setKycSubmitting(false);
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5"
                    >
                      <span>{kycSubmitting ? 'Finalizing Approval...' : 'Complete & Activate Tier 3 Full KYC'}</span>
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CIBIL Credit Health Report Modal */}
      {showCibilModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">TransUnion CIBIL Credit Report</h3>
                  <p className="text-xs text-slate-500">Official Credit Scorecard & Factor Analysis</p>
                </div>
              </div>
              <button
                onClick={() => setShowCibilModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Showcase Hero with Speedometer Gauge */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 mb-5 flex flex-col items-center">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-3">
                EXCELLENT CREDIT HEALTH
              </span>
              <CibilGaugeChart score={785} showFooter={true} />
              <p className="text-xs text-emerald-400 font-semibold mt-3 text-center">
                Higher than 89% of borrowers in India • Eligible for Prime Loan Rates
              </p>
            </div>

            {/* 5 High-Impact Credit Factors */}
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Score Drivers & Factors</h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">Payment History</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">HIGH IMPACT</span>
                  </div>
                  <span className="text-[11px] text-slate-500">24 of 24 on-time monthly EMI & bill payments</span>
                </div>
                <span className="font-bold text-emerald-600">100% On-Time</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">Credit Card Utilization</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">HIGH IMPACT</span>
                  </div>
                  <span className="text-[11px] text-slate-500">₹34,200 of ₹1,50,000 credit limit in use</span>
                </div>
                <span className="font-bold text-emerald-600">22.8% (Healthy &lt;30%)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">Credit History Age</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">MEDIUM IMPACT</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Oldest active credit line opened in 2022</span>
                </div>
                <span className="font-bold text-slate-800 font-mono">3.4 Years</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">Credit Mix & Active Accounts</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">LOW IMPACT</span>
                  </div>
                  <span className="text-[11px] text-slate-500">1 Credit Card, 1 Primary Savings Account</span>
                </div>
                <span className="font-bold text-slate-800 font-mono">2 Accounts</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">Recent Hard Enquiries</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">LOW IMPACT</span>
                  </div>
                  <span className="text-[11px] text-slate-500">No new hard inquiries in the last 90 days</span>
                </div>
                <span className="font-bold text-emerald-600 font-mono">0 Enquiries</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  alert('Authorized TransUnion CIBIL Report PDF downloaded.');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              >
                Download Full Bureau Report
              </button>
              <button
                type="button"
                onClick={() => setShowCibilModal(false)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Yield Fixed Deposit Modal */}
      {showFdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">High-Yield Fixed Deposit</h3>
                  <p className="text-xs text-slate-500">Guaranteed Return • DICGC Insured up to ₹5 Lakh</p>
                </div>
              </div>
              <button
                onClick={() => setShowFdModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {fdSuccessData ? (
              /* Success Certificate View */
              <div className="space-y-5 animate-in zoom-in-95 duration-200">
                <div className="p-5 rounded-3xl bg-gradient-to-tr from-amber-950 via-slate-900 to-slate-950 text-white text-center shadow-xl border border-amber-500/30">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-3 font-bold">
                    <Check className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-black text-white">Fixed Deposit Booked Successfully!</h4>
                  <p className="text-xs text-amber-300 mt-0.5">Deposit Account: {fdSuccessData.id}</p>

                  <div className="grid grid-cols-2 gap-2.5 mt-5 text-left text-xs bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Principal</span>
                      <span className="font-bold text-white font-mono">₹{fdSuccessData.principal.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Interest Rate</span>
                      <span className="font-bold text-amber-400 font-mono">{fdSuccessData.rate}% p.a.</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Maturity Date</span>
                      <span className="font-bold text-white">{fdSuccessData.maturityDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Maturity Value</span>
                      <span className="font-bold text-emerald-400 font-mono">₹{fdSuccessData.maturityAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Backed by Reserve Bank of India & DICGC Insurance protection.</span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => alert(`Fixed Deposit Certificate for ${fdSuccessData.id} downloaded.`)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                  >
                    Download Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFdModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Booking & Calculator Form */
              <div className="space-y-5">
                {/* Available Balance Helper */}
                <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-500">Savings Account Balance:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{parseFloat(account?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Deposit Amount (₹)
                    </label>
                    <span className="text-[11px] text-slate-400">Min ₹5,000</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">₹</span>
                    <input
                      type="number"
                      step="5000"
                      min="5000"
                      value={fdAmount}
                      onChange={(e) => setFdAmount(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-base font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[10000, 25000, 50000, 100000, 200000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFdAmount(amt)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border transition ${
                          fdAmount === amt
                            ? 'bg-amber-50 border-amber-400 text-amber-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tenure Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Select Tenure & Return Rate
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { months: 12, label: '1 Year', rate: '6.80% p.a.' },
                      { months: 24, label: '2 Years', rate: '7.10% p.a.' },
                      { months: 36, label: '3 Years (Popular)', rate: '7.25% p.a.' },
                      { months: 60, label: '5 Yrs (Tax Saver)', rate: '7.40% p.a.' },
                    ].map(ten => (
                      <button
                        key={ten.months}
                        type="button"
                        onClick={() => setFdTenureMonths(ten.months)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          fdTenureMonths === ten.months
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold block">{ten.label}</span>
                        <span className="text-[11px] font-semibold text-amber-600 font-mono">{ten.rate}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Return Projection */}
                {(() => {
                  const { maturity, interest, rate } = calculateFdMaturity(parseFloat(fdAmount) || 0, fdTenureMonths);
                  return (
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Compounding Frequency:</span>
                        <span className="font-semibold text-white">Quarterly Compounded</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Maturity Amount</span>
                          <span className="text-2xl font-black text-white font-mono">
                            ₹{maturity.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Interest Earned</span>
                          <span className="text-base font-bold text-emerald-400 font-mono">
                            +₹{interest.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFdModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBookFd}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md"
                  >
                    Confirm & Book Fixed Deposit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pre-Approved Instant Personal Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pre-Approved Instant Personal Loan</h3>
                  <p className="text-xs text-slate-500">60-Second Disbursal • Zero Collateral • 10.49% p.a.</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoanModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loanSuccessData ? (
              /* Disbursal Celebration Screen */
              <div className="space-y-5 animate-in zoom-in-95 duration-200">
                <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-slate-950 text-white text-center shadow-xl border border-indigo-500/30">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-white">Loan Disbursed Instantly!</h4>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    ₹{loanSuccessData.amount.toLocaleString('en-IN')} credited to your FIN Savings Account
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Loan Account: {loanSuccessData.loanAccNumber}</p>

                  <div className="grid grid-cols-2 gap-2.5 mt-5 text-left text-xs bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanctioned Amount</span>
                      <span className="font-bold text-white font-mono">₹{loanSuccessData.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Monthly EMI</span>
                      <span className="font-bold text-indigo-400 font-mono">₹{loanSuccessData.emi.toLocaleString('en-IN')}/mo</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Tenure</span>
                      <span className="font-bold text-white">{loanSuccessData.tenureMonths} Months</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Interest Rate</span>
                      <span className="font-bold text-emerald-400 font-mono">{loanSuccessData.annualRate}% p.a.</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-2xl text-xs text-slate-600 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>First EMI auto-debit scheduled for the 5th of next month.</span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoanModal(false);
                      setLoanSuccessData(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    View Updated Account Balance
                  </button>
                </div>
              </div>
            ) : (
              /* Loan Customizer & Disbursal Screen */
              <div className="space-y-5">
                {/* Eligible Offer Callout */}
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-700 block">Pre-Approved Limit</span>
                    <span className="text-xl font-black text-indigo-950 font-mono">₹5,00,000</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    INSTANT APPROVAL
                  </span>
                </div>

                {/* Amount Customizer */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Borrow Amount (₹)
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      ₹{loanAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="25000"
                    max="500000"
                    step="5000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>₹25,000</span>
                    <span>₹2,50,000</span>
                    <span>₹5,00,000</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[50000, 100000, 200000, 500000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setLoanAmount(amt)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border transition ${
                          loanAmount === amt
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tenure Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Repayment Tenure
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[12, 24, 36, 48].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setLoanTenureMonths(m)}
                        className={`py-2 px-1 rounded-xl border text-center transition ${
                          loanTenureMonths === m
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="text-xs">{m} Months</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live EMI & Financial Transparency Breakdown */}
                {(() => {
                  const { emi, totalPayable, totalInterest } = calculateLoanEmi(loanAmount, loanTenureMonths);
                  return (
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Monthly EMI</span>
                          <span className="text-2xl font-black text-indigo-400 font-mono">
                            ₹{emi.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/mo</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Interest Rate</span>
                          <span className="text-sm font-bold text-white font-mono">10.49% p.a. Reducing</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Principal</span>
                          <span className="font-mono text-white">₹{loanAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total Interest</span>
                          <span className="font-mono text-white">₹{totalInterest.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Processing Fee</span>
                          <span className="font-mono text-emerald-400">₹0 (Waived)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Digital Lending Compliance Declaration */}
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>RBI Digital Lending Guidelines Compliant (No hidden charges)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Zero foreclosure fees after 6 on-time EMI repayments</span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLoanModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={loanProcessing}
                    onClick={handleDisburseLoan}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loanProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Disbursing Funds...</span>
                      </>
                    ) : (
                      <span>Disburse ₹{loanAmount.toLocaleString('en-IN')} to Savings</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wealth & Insurance Direct Products Modal */}
      {showWealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Wealth & Insurance Protection</h3>
                  <p className="text-xs text-slate-500">Zero Commission Mutual Funds & Comprehensive Coverage</p>
                </div>
              </div>
              <button
                onClick={() => setShowWealthModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sipSuccessToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold mb-4 flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{sipSuccessToast}</span>
              </div>
            )}

            {/* Curated Institutional Offerings */}
            <div className="space-y-4 text-xs">
              {/* Mutual Fund 1: Nifty 50 */}
              <div className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 uppercase">
                      Index Fund • Direct Growth
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">FIN Nifty 50 Index Fund</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">3Y CAGR</span>
                    <span className="text-sm font-black text-emerald-600 font-mono">+14.8%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tracks top 50 bluechip companies in India. Lowest expense ratio (0.15%), zero exit load after 30 days.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Min Monthly SIP: ₹500</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSipSuccessToast('Monthly SIP of ₹1,000 in FIN Nifty 50 Index Fund scheduled on the 5th.');
                      setTimeout(() => setSipSuccessToast(''), 4000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition"
                  >
                    Start ₹1,000/mo SIP
                  </button>
                </div>
              </div>

              {/* Insurance 1: Term Life */}
              <div className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 uppercase">
                      Pure Term Life Protection
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">₹1 Crore Family Protection Cover</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Premium</span>
                    <span className="text-sm font-black text-slate-900 font-mono">₹650/mo</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  99.4% claim settlement ratio, zero medical tests required for FIN Tier 3 KYC customers up to age 45.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Tax exemption under Section 80C</span>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Policy inquiry generated. Insurance sanction document sent to registered email.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                  >
                    Apply for Policy
                  </button>
                </div>
              </div>

              {/* Insurance 2: Health Cover */}
              <div className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                      Cashless Health Insurance
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">₹10 Lakh Super Top-Up Health Shield</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Premium</span>
                    <span className="text-sm font-black text-slate-900 font-mono">₹380/mo</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Zero co-payment, cashless settlement in 12,000+ network hospitals across India. Pre & post hospitalization covered.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Tax benefit under Section 80D</span>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Health coverage application submitted. Hospital network passbook dispatched.');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                  >
                    Get Protected
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowWealthModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
