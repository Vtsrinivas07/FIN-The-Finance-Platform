import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CibilGaugeChart from '../../components/common/CibilGaugeChart';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Award,
  ShieldCheck,
  PiggyBank,
  Zap,
  Coins,
  Shield,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Download,
  Info,
  Calendar,
  DollarSign,
  ChevronRight,
  Calculator,
  Percent,
  Check,
  Building,
  HeartHandshake,
  Lock,
  Flame,
  ArrowUpRight,
  FileText
} from 'lucide-react';

const FinancialProducts = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'CIBIL' | 'DEPOSITS' | 'LOANS' | 'WEALTH' | 'INSURANCE'

  // Fixed Deposits State
  const [fdAmount, setFdAmount] = useState(50000);
  const [fdTenureMonths, setFdTenureMonths] = useState(36);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
  const [bookedFds, setBookedFds] = useState(() => {
    const saved = localStorage.getItem('fin_booked_fds');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
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
    ];
  });
  const [bookingFd, setBookingFd] = useState(false);
  const [fdSuccessData, setFdSuccessData] = useState(null);

  // Pre-Approved Loan State
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanTenureMonths, setLoanTenureMonths] = useState(24);
  const [loanProcessing, setLoanProcessing] = useState(false);
  const [loanSuccessData, setLoanSuccessData] = useState(null);

  // Wealth & SIP State
  const [selectedFund, setSelectedFund] = useState(null);
  const [sipAmount, setSipAmount] = useState(2000);
  const [sipSuccessData, setSipSuccessData] = useState(null);

  // Insurance State
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [insuranceSuccessData, setInsuranceSuccessData] = useState(null);

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounts/primary');
      if (res.data?.success) {
        setAccount(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load account', err);
    } finally {
      setLoading(false);
    }
  };

  // FD Rate Calculator
  const getFdRate = (months, isSenior) => {
    let base = 6.80;
    if (months === 24) base = 7.10;
    if (months === 36) base = 7.25;
    if (months >= 60) base = 7.40;
    return isSenior ? +(base + 0.50).toFixed(2) : base;
  };

  const calculateFdMaturity = (principal, months, isSenior) => {
    const rate = getFdRate(months, isSenior);
    const years = months / 12;
    const maturity = Math.round(principal * Math.pow(1 + (rate / 400), 4 * years));
    const interest = maturity - principal;
    return { maturity, interest, rate };
  };

  // Loan EMI Calculator
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
      alert(`Insufficient savings balance (₹${currentBalance.toLocaleString('en-IN')}) to book this FD of ₹${principal.toLocaleString('en-IN')}. Please add funds to your account first.`);
      return;
    }

    setBookingFd(true);
    setTimeout(() => {
      const { maturity, interest, rate } = calculateFdMaturity(principal, fdTenureMonths, isSeniorCitizen);
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

      const updatedFds = [newFd, ...bookedFds];
      setBookedFds(updatedFds);
      localStorage.setItem('fin_booked_fds', JSON.stringify(updatedFds));
      setFdSuccessData(newFd);
      setBookingFd(false);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }, 600);
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
        loadAccount();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Loan disbursal request failed. Please try again.');
    } finally {
      setLoanProcessing(false);
    }
  };

  const handleStartSip = (fund) => {
    setSipSuccessData({
      fundName: fund.name,
      amount: sipAmount,
      frequency: 'Monthly (5th of each month)',
      folio: `FIN-MF-${Math.floor(10000000 + Math.random() * 90000000)}`
    });
    setSelectedFund(null);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
  };

  const handleApplyInsurance = (policy) => {
    setInsuranceSuccessData({
      policyName: policy.name,
      cover: policy.cover,
      premium: policy.premium,
      policyNumber: `POL-FIN-${Math.floor(1000000 + Math.random() * 9000000)}`
    });
    setSelectedPolicy(null);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-7 pb-16">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Financial Products &amp; Health Hub</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                RBI Compliant • DICGC Insured
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Wealth, Credit &amp; Protection Suite
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Monitor your bureau health score, multiply guaranteed savings with high-yield deposits, unlock pre-approved instant credit, and protect your family with zero-commission wealth solutions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">CIBIL Health</span>
              <span className="text-xl font-black text-emerald-400 font-mono">785 / 900</span>
              <span className="text-[10px] text-emerald-300 block font-bold">Excellent Tier</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">Pre-Approved Loan</span>
              <span className="text-xl font-black text-white font-mono">₹5,00,000</span>
              <span className="text-[10px] text-indigo-300 block font-bold">@ 10.49% p.a.</span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-6 mt-6 border-t border-slate-800 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Products Hub', icon: Sparkles },
            { id: 'CIBIL', label: 'CIBIL Credit Health', icon: Award },
            { id: 'DEPOSITS', label: 'Fixed Deposits (7.25%)', icon: PiggyBank },
            { id: 'LOANS', label: 'Pre-Approved Loans', icon: Zap },
            { id: 'WEALTH', label: 'Wealth & SIPs', icon: Coins },
            { id: 'INSURANCE', label: 'Insurance Cover', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  active
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: CIBIL CREDIT HEALTH REPORT */}
      {(activeTab === 'ALL' || activeTab === 'CIBIL') && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Official Bureau Credit Health Report</h2>
                <p className="text-xs text-slate-500">
                  Powered by TransUnion CIBIL™ &amp; Experian™ • Real-time Refresh
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => alert('Downloading official encrypted CIBIL Credit Health Report (PDF)...')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Speedometer Gauge Box */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 text-white border border-slate-800 flex flex-col items-center justify-center shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bureau Speedometer</span>
              <CibilGaugeChart score={785} showFooter={true} isDark={true} compact={false} />
              <div className="w-full mt-5 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Last Updated: <strong className="text-white">Today</strong></span>
                <span>Next Free Refresh: <strong className="text-brand-400">30 Days</strong></span>
              </div>
            </div>

            {/* Micro Factors Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Credit Score Drivers &amp; Factors
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    title: 'Payment History',
                    value: '100% On-Time',
                    desc: '24 of 24 payments on schedule',
                    impact: 'High Impact',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-500',
                    percent: '100%'
                  },
                  {
                    title: 'Credit Utilization',
                    value: '22.8%',
                    desc: 'Optimal limit usage (< 30% ideal)',
                    impact: 'High Impact',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-500',
                    percent: '23%'
                  },
                  {
                    title: 'Credit Age & Vintage',
                    value: '4 Yrs 8 Mos',
                    desc: 'Strong account longevity',
                    impact: 'Medium Impact',
                    color: 'text-blue-600',
                    bg: 'bg-blue-500',
                    percent: '75%'
                  },
                  {
                    title: 'Total Active Accounts',
                    value: '5 Active Lines',
                    desc: 'Balanced mix of secured & unsecured',
                    impact: 'Low Impact',
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-500',
                    percent: '80%'
                  }
                ].map((factor, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{factor.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {factor.impact}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-base font-extrabold ${factor.color}`}>{factor.value}</span>
                      <span className="text-[11px] text-slate-500">{factor.desc}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${factor.bg}`} style={{ width: factor.percent }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-3 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Why this matters:</strong> With a score of <strong>785</strong>, you qualify for FIN's lowest interest rate tiers (10.49% on loans vs 14.5% standard), instant credit cards with zero joining fees, and priority processing across 7000+ Indian lenders.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: FIXED DEPOSITS (FD / RD) */}
      {(activeTab === 'ALL' || activeTab === 'DEPOSITS') && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-slate-900">High-Yield Fixed Deposits</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                    Up to 7.40% p.a.
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  DICGC Insured up to ₹5,00,000 • Compounded Quarterly • Instant Premature Liquidity
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Calculator */}
            <div className="lg:col-span-7 bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>Instant Deposit Calculator</span>
              </h3>

              {/* Amount Selector */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Deposit Amount (₹)</label>
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    ₹{Number(fdAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={fdAmount}
                  onChange={(e) => setFdAmount(Number(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[25000, 50000, 100000, 200000, 500000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setFdAmount(amt)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        fdAmount === amt
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenure Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Tenure</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { m: 12, label: '1 Year', rate: '6.80%' },
                    { m: 24, label: '2 Years', rate: '7.10%' },
                    { m: 36, label: '3 Years', rate: '7.25%' },
                    { m: 60, label: '5 Yrs (Tax Saver)', rate: '7.40%' },
                  ].map((item) => (
                    <button
                      key={item.m}
                      onClick={() => setFdTenureMonths(item.m)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        fdTenureMonths === item.m
                          ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                      <span className="text-[11px] font-extrabold text-amber-600">{item.rate}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Senior Citizen Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Senior Citizen Special Rate</span>
                  <span className="text-[11px] text-slate-500">Additional +0.50% p.a. guaranteed bonus</span>
                </div>
                <input
                  type="checkbox"
                  checked={isSeniorCitizen}
                  onChange={(e) => setIsSeniorCitizen(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleBookFd}
                disabled={bookingFd}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <PiggyBank className="w-4 h-4" />
                <span>{bookingFd ? 'Booking Deposit...' : 'Confirm & Open Fixed Deposit'}</span>
              </button>
            </div>

            {/* Projection Output & Summary */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {(() => {
                const { maturity, interest, rate } = calculateFdMaturity(fdAmount, fdTenureMonths, isSeniorCitizen);
                return (
                  <div className="bg-gradient-to-tr from-slate-900 to-slate-950 rounded-3xl p-6 text-white border border-slate-800 space-y-4 shadow-md">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-400">Guaranteed Return Preview</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {rate}% p.a.
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Total Investment:</span>
                        <span className="font-extrabold text-white font-mono">₹{Number(fdAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Total Interest Gain:</span>
                        <span className="font-extrabold text-emerald-400 font-mono">+₹{interest.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Maturity Value</span>
                          <span className="text-2xl font-black text-white font-mono">₹{maturity.toLocaleString('en-IN')}</span>
                        </div>
                        <span className="text-[11px] text-amber-400 font-bold">Quarterly Compounded</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Active Portfolio Snapshot */}
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Deposits ({bookedFds.length})</span>
                  <span className="text-xs font-bold text-amber-700 font-mono">
                    ₹{bookedFds.reduce((acc, f) => acc + f.principal, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {bookedFds.map((fd) => (
                    <div key={fd.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800 block">{fd.id}</span>
                        <span className="text-[10px] text-slate-500">Matures: {fd.maturityDate} @ {fd.rate}%</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono">₹{fd.principal.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-emerald-600 block font-bold">+₹{fd.interestEarned?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PRE-APPROVED INSTANT LOANS */}
      {(activeTab === 'ALL' || activeTab === 'LOANS') && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-slate-900">Pre-Approved Instant Personal Loan</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    60s Direct Disbursal
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Pre-Approved Limit: ₹5,00,000 • 10.49% p.a. • Zero Physical Paperwork • No Pre-Closure Charges
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Loan EMI Configurator */}
            <div className="lg:col-span-7 bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>Customize Your Loan Amount &amp; EMI</span>
              </h3>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Required Loan Amount (₹)</label>
                  <span className="text-base font-extrabold text-indigo-700 font-mono">
                    ₹{Number(loanAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="500000"
                  step="25000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[50000, 100000, 200000, 300000, 500000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setLoanAmount(amt)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        loanAmount === amt
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Repayment Tenure</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { m: 12, label: '12 Months' },
                    { m: 24, label: '24 Months' },
                    { m: 36, label: '36 Months' },
                    { m: 48, label: '48 Months' },
                  ].map((item) => (
                    <button
                      key={item.m}
                      onClick={() => setLoanTenureMonths(item.m)}
                      className={`p-3 rounded-2xl border text-center transition ${
                        loanTenureMonths === item.m
                          ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs">
                  <span className="text-slate-500 block">Interest Rate:</span>
                  <strong className="text-slate-900 font-bold">10.49% p.a. Fixed</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs">
                  <span className="text-slate-500 block">Processing Fee:</span>
                  <strong className="text-emerald-600 font-bold">₹0 (Zero Waived)</strong>
                </div>
              </div>

              <button
                onClick={handleDisburseLoan}
                disabled={loanProcessing}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{loanProcessing ? 'Disbursing to Savings Account...' : 'Instant Disburse to Savings Account'}</span>
              </button>
            </div>

            {/* Loan EMI Breakdown Card */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {(() => {
                const { emi, totalPayable, totalInterest, annualRate } = calculateLoanEmi(loanAmount, loanTenureMonths);
                return (
                  <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-slate-800 space-y-4 shadow-md">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-400">Monthly Installment</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {annualRate}% p.a.
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-400">Monthly EMI:</span>
                        <span className="text-2xl font-black text-white font-mono">₹{emi.toLocaleString('en-IN')}/mo</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Principal Disbursal:</span>
                        <span className="font-extrabold text-white font-mono">₹{Number(loanAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Total Interest Payable:</span>
                        <span className="font-extrabold text-indigo-300 font-mono">₹{totalInterest.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total Repayment</span>
                          <span className="text-xl font-extrabold text-white font-mono">₹{totalPayable.toLocaleString('en-IN')}</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-bold">Direct Account Credit</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-indigo-950">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Transparent Borrowing Guarantee</span>
                </div>
                <p className="text-indigo-800">
                  Funds are credited directly to your primary FIN savings account in 60 seconds. Repayments are auto-debited monthly with zero hidden charges.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: WEALTH & DIRECT SIPS */}
      {(activeTab === 'ALL' || activeTab === 'WEALTH') && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-slate-900">Wealth &amp; Direct Mutual Funds</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                    Zero Commission Direct
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Direct Mutual Funds • Save up to 1.5% in broker commissions • SEBI Licensed
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                id: 'NIFTY50',
                name: 'FIN Nifty 50 Index Direct Plan',
                cagr: '14.8% (3Y CAGR)',
                ter: '0.05% Exp. Ratio',
                risk: 'Moderate Risk',
                desc: 'Invest in India top 50 bluechip companies with the lowest expense ratio.'
              },
              {
                id: 'FLEXICAP',
                name: 'FIN Flexi Cap Growth Portfolio',
                cagr: '17.2% (3Y CAGR)',
                ter: '0.45% Exp. Ratio',
                risk: 'High Growth',
                desc: 'Diversified equity exposure across large, mid, and small-cap leaders.'
              },
              {
                id: 'LIQUID',
                name: 'FIN High-Yield Overnight Liquid Fund',
                cagr: '7.1% (1Y Return)',
                ter: '0.12% Exp. Ratio',
                risk: 'Low Risk',
                desc: 'Better alternative to savings account with instant T+0 withdrawal.'
              },
            ].map((fund) => (
              <div key={fund.id} className="bg-slate-50 rounded-3xl p-5 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {fund.risk}
                    </span>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {fund.cagr}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{fund.name}</h4>
                  <p className="text-xs text-slate-500 mt-1.5">{fund.desc}</p>
                  <span className="text-[11px] text-slate-400 block mt-2 font-mono">{fund.ter}</span>
                </div>

                <button
                  onClick={() => setSelectedFund(fund)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Start SIP (from ₹500)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: INSURANCE & PROTECTION */}
      {(activeTab === 'ALL' || activeTab === 'INSURANCE') && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-slate-900">Family &amp; Health Protection</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                    IRDAI Licensed Partners
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Tax Deductions under Sec 80C &amp; 80D • 10,000+ Cashless Hospitals • Instant Digital Policy
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                id: 'TERM_LIFE',
                name: 'Pure Term Life Cover',
                cover: '₹1,00,00,000 (1 Crore)',
                premium: 'from ₹650 / month',
                benefits: ['Tax Deduction under Section 80C', 'Terminal Illness Cover Included', '30-Day Free Look Period'],
                badge: 'SEC 80C TAX SAVER'
              },
              {
                id: 'HEALTH_COVER',
                name: 'Comprehensive Health Shield',
                cover: '₹10,00,000 (10 Lakhs)',
                premium: 'from ₹890 / month',
                benefits: ['Zero Co-Pay across 10,000+ Network Hospitals', 'Pre & Post Hospitalization Covered', 'Section 80D Tax Deduction'],
                badge: 'ZERO CO-PAY'
              }
            ].map((policy) => (
              <div key={policy.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      {policy.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{policy.premium}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{policy.name}</h4>
                  <div className="text-lg font-black text-brand-700 font-mono mt-1">{policy.cover}</div>

                  <ul className="space-y-1.5 mt-3 text-xs text-slate-600">
                    {policy.benefits.map((b, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setSelectedPolicy(policy)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Get Instant Digital Cover</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: FD Success Modal */}
      {fdSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <PiggyBank className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Deposit Booked Successfully!</h3>
            <p className="text-xs text-slate-500">
              Your Fixed Deposit has been opened and backed by DICGC insurance.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit Ref No:</span>
                <strong className="font-mono text-slate-900">{fdSuccessData.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Principal Amount:</span>
                <strong className="font-mono text-slate-900">₹{fdSuccessData.principal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interest Rate:</span>
                <strong className="text-amber-600 font-bold">{fdSuccessData.rate}% p.a.</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Maturity Date:</span>
                <strong className="text-slate-900">{fdSuccessData.maturityDate}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                <span className="text-slate-700">Maturity Value:</span>
                <span className="text-emerald-600 font-mono text-sm">₹{fdSuccessData.maturityAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => setFdSuccessData(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Loan Success Modal */}
      {loanSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Loan Disbursed Instantly!</h3>
            <p className="text-xs text-slate-500">
              ₹{Number(loanSuccessData.amount).toLocaleString('en-IN')} has been directly credited to your primary savings account.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Loan Account:</span>
                <strong className="font-mono text-slate-900">{loanSuccessData.loanAccNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Credited Amount:</span>
                <strong className="font-mono text-emerald-600 font-bold">₹{Number(loanSuccessData.amount).toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly EMI:</span>
                <strong className="font-mono text-slate-900">₹{loanSuccessData.emi.toLocaleString('en-IN')}/mo</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenure:</span>
                <strong className="text-slate-900">{loanSuccessData.tenureMonths} Months</strong>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => { setLoanSuccessData(null); navigate('/dashboard'); }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setLoanSuccessData(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SIP Modal */}
      {selectedFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Start Monthly SIP</h3>
              <button onClick={() => setSelectedFund(null)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
            </div>

            <p className="text-xs text-slate-600 font-semibold">{selectedFund.name}</p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Investment Amount (₹)</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[500, 1000, 2000, 5000].map(a => (
                  <button
                    key={a}
                    onClick={() => setSipAmount(a)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition ${
                      sipAmount === a ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    ₹{a}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={sipAmount}
                onChange={(e) => setSipAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold"
                placeholder="Custom Amount"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Debit Date:</span>
                <strong className="text-slate-900">5th of every month</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Commission:</span>
                <strong className="text-emerald-600">0% (Direct Plan)</strong>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setSelectedFund(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartSip(selectedFund)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Confirm SIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIP Success Notification */}
      {sipSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">SIP Registered Successfully!</h3>
            <p className="text-xs text-slate-500">
              Your monthly mandate for {sipSuccessData.fundName} of ₹{sipSuccessData.amount.toLocaleString('en-IN')} has been scheduled.
            </p>
            <p className="text-xs font-mono font-bold text-slate-600">Folio: {sipSuccessData.folio}</p>
            <button
              onClick={() => setSipSuccessData(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Insurance Success Notification */}
      {insuranceSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Policy Issued Digitally!</h3>
            <p className="text-xs text-slate-500">
              {insuranceSuccessData.policyName} with {insuranceSuccessData.cover} has been generated.
            </p>
            <p className="text-xs font-mono font-bold text-slate-600">Policy No: {insuranceSuccessData.policyNumber}</p>
            <button
              onClick={() => setInsuranceSuccessData(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialProducts;
