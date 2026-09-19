import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  ShieldAlert,
  Activity,
  CheckCircle,
  XCircle,
  Database,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw,
  Search,
  Lock,
  Eye,
  EyeOff,
  Server,
  CheckCircle2,
  Building2,
  FileText,
  X,
  KeyRound,
  AlertTriangle,
  CreditCard,
  History,
  UserCheck,
  BadgeAlert,
  Fingerprint,
  PiggyBank,
  Zap,
  Award,
  Coins,
  Smartphone,
  ChevronDown,
  Check,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react';
import {
  getCreditCardApplications,
  approveCreditCardApplication,
  rejectCreditCardApplication,
  getLoanApplications,
  approveLoanApplication,
  rejectLoanApplication,
  getWealthInsuranceApplications,
  approveWealthInsuranceApplication,
  rejectWealthInsuranceApplication,
  getPendingApplicationsCount
} from '../../services/approvalService';

const CIF_AUTH_OPTIONS = [
  { value: 'ACCOUNT_NUMBER', label: 'Account Number' },
  { value: 'CIF_USERNAME', label: 'Username' },
  { value: 'MOBILE', label: 'Phone Number' },
  { value: 'PAN_TAX_ID', label: 'PAN Card' },
  { value: 'EMAIL', label: 'Email Address' }
];

const TX_SEARCH_OPTIONS = [
  { value: 'REFERENCE_NUMBER', label: 'Reference Number (UTR)' },
  { value: 'ACCOUNT_NUMBER', label: 'Account Number' },
  { value: 'CIF_USERNAME', label: 'Username' }
];

const CustomSelect = ({ value, onChange, options, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-semibold text-slate-800 transition focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs text-left"
      >
        <span className="truncate">{selectedOption?.label || value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-2 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180 text-brand-600' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-0.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 min-w-[200px]">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left font-medium transition ${
                  isSelected
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(currentTab);
  const [loading, setLoading] = useState(true);

  // --- Live Time Clock for IST & Real-Time Auditing ---
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format timestamp accurately to Indian Standard Time (IST)
  const formatLiveTimestamp = (isoStr) => {
    if (!isoStr) return 'N/A';
    const normalized = (typeof isoStr === 'string' && (isoStr.endsWith('Z') || isoStr.includes('+')))
      ? isoStr
      : `${isoStr}Z`;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return String(isoStr);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Live relative time badge (updates each second with currentTime)
  const getRelativeTime = (isoStr) => {
    if (!isoStr) return '';
    const normalized = (typeof isoStr === 'string' && (isoStr.endsWith('Z') || isoStr.includes('+')))
      ? isoStr
      : `${isoStr}Z`;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return '';
    const diffSec = Math.max(0, Math.floor((currentTime.getTime() - d.getTime()) / 1000));
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // --- Customer CIF Inquiry State (Privacy-Gated) ---
  const [cifAuthType, setCifAuthType] = useState('ACCOUNT_NUMBER');
  const [cifQuery, setCifQuery] = useState('');
  const [cifLoading, setCifLoading] = useState(false);
  const [cifError, setCifError] = useState('');
  const [customerDossier, setCustomerDossier] = useState(null);
  const [cifMaskSensitive, setCifMaskSensitive] = useState(true);

  // --- Transaction Clearing Inquiry State (Privacy-Gated) ---
  const [txSearchType, setTxSearchType] = useState('REFERENCE_NUMBER');
  const [txQuery, setTxQuery] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState('');
  const [searchedTransactions, setSearchedTransactions] = useState(null);
  const [txMaskAmounts, setTxMaskAmounts] = useState(true);

  // --- KYC Approval Queue State ---
  const [kycRequests, setKycRequests] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycActionLoading, setKycActionLoading] = useState(null); // userId being actioned
  const [showRejectModal, setShowRejectModal] = useState(null); // user obj
  const [rejectReason, setRejectReason] = useState('');

  // --- Extended Approvals State (Cards, Loans, Wealth & Insurance) ---
  const [approvalsSubTab, setApprovalsSubTab] = useState('kyc'); // 'kyc' | 'cards' | 'loans' | 'wealth'
  const [cardApps, setCardApps] = useState(() => getCreditCardApplications());
  const [loanApps, setLoanApps] = useState(() => getLoanApplications());
  const [wealthApps, setWealthApps] = useState(() => getWealthInsuranceApplications());
  const [approvalFeedback, setApprovalFeedback] = useState('');

  const loadAllApprovals = () => {
    loadKycRequests();
    setCardApps(getCreditCardApplications());
    setLoanApps(getLoanApplications());
    setWealthApps(getWealthInsuranceApplications());
  };

  useEffect(() => {
    const handleSync = () => {
      setCardApps(getCreditCardApplications());
      setLoanApps(getLoanApplications());
      setWealthApps(getWealthInsuranceApplications());
    };
    window.addEventListener('fin_approvals_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('fin_approvals_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleApproveCard = (appId) => {
    const app = approveCreditCardApplication(appId);
    setCardApps(getCreditCardApplications());
    setApprovalFeedback(`Credit card approved for ${app?.userName || 'customer'} with ₹1,50,000 limit!`);
    setTimeout(() => setApprovalFeedback(''), 4000);
  };

  const handleRejectCard = (appId) => {
    rejectCreditCardApplication(appId, 'Annual income criteria not satisfied');
    setCardApps(getCreditCardApplications());
    setApprovalFeedback('Credit card application rejected.');
    setTimeout(() => setApprovalFeedback(''), 4000);
  };

  const handleApproveLoan = (appId) => {
    const app = approveLoanApplication(appId);
    setLoanApps(getLoanApplications());
    setApprovalFeedback(`Personal Loan approved & disbursed for ${app?.userName || 'customer'}!`);
    setTimeout(() => setApprovalFeedback(''), 4000);
  };

  const handleRejectLoan = (appId) => {
    rejectLoanApplication(appId, 'High debt-to-income ratio');
    setLoanApps(getLoanApplications());
    setApprovalFeedback('Loan application rejected.');
    setTimeout(() => setApprovalFeedback(''), 4000);
  };

  const handleApproveWealth = (appId) => {
    const app = approveWealthInsuranceApplication(appId);
    setWealthApps(getWealthInsuranceApplications());
    setApprovalFeedback(`Application approved & policy/folio generated: ${app?.folioOrPolicyNumber}!`);
    setTimeout(() => setApprovalFeedback(''), 4000);
  };

  const handleRejectWealth = (appId) => {
    rejectWealthInsuranceApplication(appId, 'Underwriting parameters not matched');
    setWealthApps(getWealthInsuranceApplications());
    setApprovalFeedback('Application rejected.');
    setTimeout(() => setApprovalFeedback(''), 4000);
  };

  const pendingCardCount = cardApps.filter((c) => c.status === 'PENDING').length;
  const pendingLoanCount = loanApps.filter((l) => l.status === 'PENDING').length;
  const pendingWealthCount = wealthApps.filter((w) => w.status === 'PENDING').length;
  const totalPendingApprovals = (metrics?.pendingKycCount || kycRequests.length) + pendingCardCount + pendingLoanCount + pendingWealthCount;

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    if (['overview', 'users', 'transactions', 'audit', 'kyc'].includes(tab)) {
      setActiveTab(tab);
      if (tab === 'kyc') {
        loadAllApprovals();
      }
    }
  }, [searchParams]);

  useEffect(() => {
    loadMacroData();
  }, []);

  const loadMacroData = async () => {
    try {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/audit-logs?size=25'),
      ]);

      if (mRes.data?.success) setMetrics(mRes.data.data);
      if (aRes.data?.success) setAuditLogs(aRes.data.data.content || []);
    } catch (err) {
      console.error('Failed to fetch admin macro data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadKycRequests = async () => {
    setKycLoading(true);
    try {
      const res = await api.get('/admin/kyc/pending');
      if (res.data?.success) setKycRequests(res.data.data || []);
    } catch (e) {
      console.error('Failed to load KYC requests', e);
    } finally {
      setKycLoading(false);
    }
  };

  const handleApproveKyc = async (userId) => {
    setKycActionLoading(userId);
    try {
      await api.post(`/admin/kyc/${userId}/approve`);
      await loadKycRequests();
      await loadMacroData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve KYC');
    } finally {
      setKycActionLoading(null);
    }
  };

  const handleRejectKyc = async () => {
    if (!showRejectModal || !rejectReason.trim()) return;
    setKycActionLoading(showRejectModal.id);
    try {
      await api.post(`/admin/kyc/${showRejectModal.id}/reject`, { reason: rejectReason });
      setShowRejectModal(null);
      setRejectReason('');
      await loadKycRequests();
      await loadMacroData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject KYC');
    } finally {
      setKycActionLoading(null);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const aRes = await api.get('/admin/audit-logs?size=25');
      if (aRes.data?.success) setAuditLogs(aRes.data.data.content || []);
    } catch (e) {
      // Ignored
    }
  };

  // --- Customer Inquiry Submit Handler ---
  const handleCustomerInquiry = async (e) => {
    if (e) e.preventDefault();
    if (!cifQuery.trim()) return;

    setCifLoading(true);
    setCifError('');

    try {
      const res = await api.post('/admin/customer-inquiry', {
        authType: cifAuthType,
        identifier: cifQuery.trim(),
        reason: 'Customer Account Search'
      });

      if (res.data?.success) {
        setCustomerDossier(res.data.data);
        loadAuditLogs();
      } else {
        setCifError(res.data?.message || 'Customer account not found.');
        setCustomerDossier(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || `No customer found matching ${getAuthTypeLabel(cifAuthType)} "${cifQuery}". Please check details and try again.`;
      setCifError(msg);
      setCustomerDossier(null);
    } finally {
      setCifLoading(false);
    }
  };

  // --- Transaction Inquiry Submit Handler ---
  const handleTransactionInquiry = async (e) => {
    if (e) e.preventDefault();
    if (!txQuery.trim()) return;

    setTxLoading(true);
    setTxError('');

    try {
      const res = await api.post('/admin/transaction-inquiry', {
        searchType: txSearchType,
        identifier: txQuery.trim(),
        reason: 'Transaction Search'
      });

      if (res.data?.success) {
        setSearchedTransactions(res.data.data || []);
        loadAuditLogs();
        if ((res.data.data || []).length === 0) {
          setTxError(`No transactions found matching ${getTxSearchTypeLabel(txSearchType)} "${txQuery}".`);
        }
      }
    } catch (err) {
      setTxError(err.response?.data?.message || `No records found for ${getTxSearchTypeLabel(txSearchType)} "${txQuery}".`);
      setSearchedTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  // --- Suspend/Activate User ---
  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      if (customerDossier && customerDossier.user?.id === userId) {
        setCustomerDossier({
          ...customerDossier,
          user: {
            ...customerDossier.user,
            status: customerDossier.user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
          }
        });
      }
      loadAuditLogs();
      loadMacroData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Helper Labels
  const getAuthTypeLabel = (type) => {
    switch (type) {
      case 'ACCOUNT_NUMBER': return 'Account Number';
      case 'CIF_USERNAME': return 'Username';
      case 'MOBILE': return 'Phone Number';
      case 'PAN_TAX_ID': return 'PAN Card';
      case 'EMAIL': return 'Email Address';
      default: return 'Search Query';
    }
  };

  const getCifPlaceholder = (type) => {
    switch (type) {
      case 'ACCOUNT_NUMBER': return 'Enter 10 or 12-digit account number...';
      case 'CIF_USERNAME': return 'Enter customer username (e.g. john)...';
      case 'MOBILE': return 'Enter 10-digit mobile phone number...';
      case 'PAN_TAX_ID': return 'Enter 10-character PAN (e.g. ABCDE1234F)...';
      case 'EMAIL': return 'Enter customer email (e.g. customer@bank.com)...';
      default: return 'Enter search value...';
    }
  };

  const getTxSearchTypeLabel = (type) => {
    switch (type) {
      case 'REFERENCE_NUMBER': return 'Reference Number (UTR)';
      case 'ACCOUNT_NUMBER': return 'Account Number';
      case 'CIF_USERNAME': return 'Customer Username';
      default: return 'Search Type';
    }
  };

  const getTxPlaceholder = (type) => {
    switch (type) {
      case 'REFERENCE_NUMBER': return 'Enter reference number (UTR)...';
      case 'ACCOUNT_NUMBER': return 'Enter account number (e.g. 100123456789)...';
      case 'CIF_USERNAME': return 'Enter customer username...';
      default: return 'Enter search reference...';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-3xl" />)}
        </div>
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-brand-600" />
            <span>Bank Operations Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live overview of customer accounts, transactions, and system security
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Live Indian Standard Time (IST) Clock */}
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">
              {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
            </span>
          </div>
          <button
            onClick={loadMacroData}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Macro Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Customers</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.totalCustomers || 0}</p>
          <span className="text-[10px] text-brand-600 font-semibold mt-1 inline-block">Registered Users</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Active Accounts</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.activeAccounts || 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">Open Bank Accounts</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Transactions Today</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.transactionsToday || 0}</p>
          <span className="text-[10px] text-slate-500 mt-1 inline-block">
            {metrics?.successfulTransactions} Successful • {metrics?.failedTransactions} Failed
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Money Transferred</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹{parseFloat(metrics?.totalTransactionVolume || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-brand-600 font-semibold mt-1 inline-block">All-Time Platform Volume</span>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('overview'); setSearchParams({}); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => { setActiveTab('users'); setSearchParams({ tab: 'users' }); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Customer Search {customerDossier && '(1 Selected)'}</span>
        </button>
        <button
          onClick={() => { setActiveTab('transactions'); setSearchParams({ tab: 'transactions' }); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'transactions' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Transaction Search {searchedTransactions && `(${searchedTransactions.length} Found)`}</span>
        </button>
        <button
          onClick={() => { setActiveTab('audit'); setSearchParams({ tab: 'audit' }); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'audit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('kyc'); setSearchParams({ tab: 'kyc' }); loadAllApprovals(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'kyc' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
          <span>Approvals Queue</span>
          {totalPendingApprovals > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-extrabold">
              {totalPendingApprovals}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* TAB 0: OVERVIEW (Macro Status & Quick Launcher) */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Payment Systems Status */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <Server className="w-4 h-4 text-brand-600" />
                  <span>Payment Systems & Network Status</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Live status of bank transfer systems and gateways</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">UPI Payments</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Connected
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Average speed: 24ms</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">NEFT & RTGS Transfers</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">24x7 Real-Time Processing</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">IMPS Fast Transfers</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Online
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Instant Settlement</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Ledger Status</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Synchronized
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">100% Balanced</span>
              </div>
            </div>
          </div>

          {/* Deposits & Loans Summary */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-brand-600" />
                  <span>Deposits & Loans Overview</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Total customer savings deposits and loan balances</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-brand-600" />
                <span>Healthy</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-slate-500 mb-1">
                  <PiggyBank className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Fixed Deposits</span>
                </div>
                <p className="text-base font-extrabold text-slate-900">₹2,45,80,000</p>
                <span className="text-[10px] text-amber-600 font-semibold block mt-1">7.25% Average Return</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-slate-500 mb-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Loans Disbursed</span>
                </div>
                <p className="text-base font-extrabold text-slate-900">₹1,82,40,000</p>
                <span className="text-[10px] text-indigo-600 font-semibold block mt-1">10.49% Average Interest</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-slate-500 mb-1">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Credit Score Check</span>
                </div>
                <p className="text-base font-extrabold text-slate-900 flex items-center text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Live Connected
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Average Score: 762</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center space-x-2 text-slate-500 mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-sky-500" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">UPI Success Rate</span>
                </div>
                <p className="text-base font-extrabold text-slate-900 flex items-center text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 99.98%
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">Fast & Reliable</span>
              </div>
            </div>
          </div>

          {/* Quick Customer Search Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 to-indigo-50/50 border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-brand-600" />
                <span>Search Customer Accounts</span>
              </h3>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Quickly look up any customer's profile, balance, and account details using their Account Number, Phone, Email, PAN, or Username.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setActiveTab('users'); setSearchParams({ tab: 'users' }); }}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition shadow-md shadow-brand-600/20 flex items-center space-x-2 flex-shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Search Customers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: CUSTOMER SEARCH */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Customer Search Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-brand-600" />
                  <span>Customer Search</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search any customer by Account Number, Username, Phone Number, PAN Card, or Email Address.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1" />
                  <span>Secure Search</span>
                </span>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleCustomerInquiry} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <div className="sm:col-span-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Search By
                </label>
                <CustomSelect
                  value={cifAuthType}
                  onChange={setCifAuthType}
                  options={CIF_AUTH_OPTIONS}
                />
              </div>

              <div className="sm:col-span-5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Enter Details
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cifQuery}
                    onChange={(e) => setCifQuery(e.target.value)}
                    placeholder={getCifPlaceholder(cifAuthType)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={!cifQuery.trim() || cifLoading}
                  className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-50 shadow-md shadow-brand-600/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{cifLoading ? 'Searching...' : 'Search Customer'}</span>
                </button>
              </div>
            </form>

            {cifError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{cifError}</span>
              </div>
            )}
          </div>

          {/* STATE A: NO CUSTOMER LOADED */}
          {!customerDossier && (
            <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-900">
                  Search for a Customer
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Use the search bar above to look up any customer's profile, bank accounts, and transaction records.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  🔒 Private & Secure
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  📋 Searches Logged
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  🛡️ Staff Access Only
                </span>
              </div>
            </div>
          )}

          {/* STATE B: CUSTOMER RETRIEVED */}
          {customerDossier && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Customer Header */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-brand-600/20">
                      {customerDossier.user?.fullName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-extrabold text-slate-900">{customerDossier.user?.fullName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          customerDossier.user?.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {customerDossier.user?.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Customer ID: {customerDossier.cifNumber} • @{customerDossier.user?.username} • Role: {customerDossier.user?.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {customerDossier.user?.role !== 'ROLE_ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(customerDossier.user?.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                          customerDossier.user?.status === 'ACTIVE'
                            ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {customerDossier.user?.status === 'ACTIVE' ? 'Block Account' : 'Unblock Account'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCustomerDossier(null);
                        setCifQuery('');
                        setCifError('');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>

                {/* Audit Authorization Justification Banner */}
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center space-x-2 text-indigo-950 font-medium">
                    <UserCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Customer found via: <strong>{getAuthTypeLabel(customerDossier.authType)}</strong> ({customerDossier.queriedIdentifier})</span>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-bold bg-white/90 px-3 py-1 rounded-xl border border-indigo-200/60 flex items-center space-x-1.5 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Search Logged</span>
                  </span>
                </div>

                {/* Verified Customer Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Phone Number</span>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                      {cifMaskSensitive
                        ? (customerDossier.user?.mobileNumber ? `••••••${customerDossier.user.mobileNumber.slice(-4)}` : 'N/A')
                        : (customerDossier.user?.mobileNumber || 'N/A')}
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">Active for SMS & OTP</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-1 truncate">
                      {cifMaskSensitive
                        ? (customerDossier.user?.email ? `${customerDossier.user.email.slice(0, 2)}••••@bank.com` : 'N/A')
                        : (customerDossier.user?.email || 'N/A')}
                    </p>
                    <span className="text-[10px] text-brand-600 font-semibold mt-1 inline-block">Statements Enabled</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">KYC Status</span>
                    <p className="text-xs font-bold text-slate-900 mt-1 flex items-center text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">Aadhaar & PAN Linked</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Joined On</span>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                      {new Date(customerDossier.user?.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">Branch: Head Office</span>
                  </div>
                </div>
              </div>

              {/* Customer Accounts & Balances */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-brand-600" />
                      <span>Bank Accounts ({customerDossier.accounts?.length || 0})</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Savings and current accounts belonging to this customer</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCifMaskSensitive(!cifMaskSensitive)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                  >
                    {cifMaskSensitive ? <Eye className="w-3.5 h-3.5 text-slate-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{cifMaskSensitive ? 'Show Numbers & Balance' : 'Hide Details'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(customerDossier.accounts || []).map((acc) => (
                    <div key={acc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-brand-600">{acc.accountType} Account</span>
                        <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{acc.maskedAccountNumber}</p>
                        <span className="text-[10px] text-slate-400 font-mono">IFSC: FINB0001024</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Balance</span>
                        <p className="text-base font-mono font-extrabold text-slate-900 mt-0.5">
                          {cifMaskSensitive ? '₹••••••••' : `₹${parseFloat(acc.balance).toFixed(2)}`}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {acc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Credit Health & Products Portfolio */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Credit Score & Loan Eligibility</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Customer's credit rating, active fixed deposits, and pre-approved loans</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Good Standing</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Credit Score Assessment */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Credit Score</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        785 / 900
                      </span>
                    </div>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      785 <span className="text-xs font-semibold text-emerald-600">EXCELLENT</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Excellent credit profile with 100% on-time payment track record.
                    </p>
                  </div>

                  {/* Booked Fixed Deposits */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Fixed Deposits</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        1 Deposit
                      </span>
                    </div>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {cifMaskSensitive ? '₹••••••••' : '₹1,00,000.00'}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      FD-2025-78210 @ 7.25% p.a. • 36M Tenure • Maturing 2028-04-15 (DICGC ₹5L Insured).
                    </p>
                  </div>

                  {/* Digital Lending Facility */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Pre-Approved Personal Loan</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        Pre-Approved
                      </span>
                    </div>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {cifMaskSensitive ? '₹••••••••' : '₹5,00,000.00'}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Pre-approved limit @ 10.49% p.a. • Instant paperless approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Transaction History */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                      <History className="w-4 h-4 text-brand-600" />
                      <span>Recent Transactions ({customerDossier.transactions?.length || 0})</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">All transactions made by this customer</p>
                  </div>
                </div>

                {(!customerDossier.transactions || customerDossier.transactions.length === 0) ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No transaction records found for this customer account.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <tr>
                          <th className="px-4 py-3">Reference (UTR)</th>
                          <th className="px-4 py-3">Account</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3">Date & Time</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerDossier.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">{tx.referenceNumber}</td>
                            <td className="px-4 py-3 font-mono text-slate-600">{tx.accountNumber}</td>
                            <td className="px-4 py-3 text-slate-700">{tx.description}</td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                              {new Date(tx.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                              {cifMaskSensitive ? '₹••••••' : `₹${parseFloat(tx.amount).toFixed(2)}`}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TRANSACTION SEARCH */}
      {/* ======================================================== */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Transaction Search Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <Search className="w-5 h-5 text-brand-600" />
                  <span>Transaction Search</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search any payment or transfer by Reference Number (UTR), Account Number, or Customer Username.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setTxMaskAmounts(!txMaskAmounts)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                >
                  {txMaskAmounts ? <Eye className="w-3.5 h-3.5 text-slate-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{txMaskAmounts ? 'Show Amounts' : 'Hide Amounts'}</span>
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleTransactionInquiry} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <div className="sm:col-span-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Search By
                </label>
                <CustomSelect
                  value={txSearchType}
                  onChange={setTxSearchType}
                  options={TX_SEARCH_OPTIONS}
                />
              </div>

              <div className="sm:col-span-5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Enter Reference or Account
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={txQuery}
                    onChange={(e) => setTxQuery(e.target.value)}
                    placeholder={getTxPlaceholder(txSearchType)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={!txQuery.trim() || txLoading}
                  className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-50 shadow-md shadow-brand-600/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{txLoading ? 'Searching...' : 'Search Transactions'}</span>
                </button>
              </div>
            </form>

            {txError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>{txError}</span>
              </div>
            )}
          </div>

          {/* STATE A: NO QUERY EXECUTED */}
          {searchedTransactions === null && (
            <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <Search className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-900">
                  Search for Transactions
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter a Reference Number (UTR), Account Number, or Customer Username above to find transaction records.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  ⚡ Fast UPI & IMPS Lookup
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  🔍 Simple Account Search
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  🔒 Private & Logged
                </span>
              </div>
            </div>
          )}

          {/* STATE B: MATCHING TRANSACTIONS DISPLAYED */}
          {searchedTransactions !== null && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BadgeAlert className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Found {searchedTransactions.length} transaction record(s) for "{txQuery}"
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSearchedTransactions(null);
                    setTxQuery('');
                    setTxError('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                >
                  Clear Search
                </button>
              </div>

              {searchedTransactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No matching transaction records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-6 py-3.5">Reference (UTR)</th>
                        <th className="px-6 py-3.5">Account</th>
                        <th className="px-6 py-3.5">Description</th>
                        <th className="px-6 py-3.5">Date & Time</th>
                        <th className="px-6 py-3.5 text-right">Amount</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {searchedTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{tx.referenceNumber}</td>
                          <td className="px-6 py-3.5 font-mono text-slate-600">{tx.accountNumber}</td>
                          <td className="px-6 py-3.5 text-slate-700">{tx.description}</td>
                          <td className="px-6 py-3.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                            {formatLiveTimestamp(tx.createdAt)}
                          </td>
                          <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-900">
                            {txMaskAmounts ? '₹••••••' : `₹${parseFloat(tx.amount).toFixed(2)}`}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SECURITY AUDIT LOGS */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-brand-600" />
                <span>Security Audit Logs</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Record of all administrator sessions, customer searches, and account updates</p>
            </div>
            <div className="flex items-center space-x-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={loadAuditLogs}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
              <span className="text-xs text-slate-400 font-mono">
                {auditLogs.length} events recorded
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Date & Time (IST)</th>
                  <th className="px-6 py-3.5">User / Admin</th>
                  <th className="px-6 py-3.5">Action Taken</th>
                  <th className="px-6 py-3.5">Item Affected</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 font-mono text-[11px]">
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        {formatLiveTimestamp(log.createdAt)}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{getRelativeTime(log.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">@{log.username}</td>
                    <td className="px-6 py-3.5 text-brand-600 font-bold">{log.action}</td>
                    <td className="px-6 py-3.5 text-slate-500">{log.entityName} #{log.entityId}</td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ============================================ */}
      {/* TAB 4: BANK APPLICATIONS & APPROVALS CENTER  */}
      {/* ============================================ */}
      {activeTab === 'kyc' && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>Bank Applications &amp; Approvals Center</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and approve or reject customer KYC, Credit Cards, Personal Loans, and Wealth &amp; Insurance applications
              </p>
            </div>
            <button
              onClick={loadAllApprovals}
              className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {approvalFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold">{approvalFeedback}</span>
            </div>
          )}

          {/* Sub-Tabs Selector */}
          <div className="flex p-1 bg-slate-100 rounded-2xl self-start overflow-x-auto gap-1">
            <button
              type="button"
              onClick={() => setApprovalsSubTab('kyc')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                approvalsSubTab === 'kyc' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              <span>KYC Verification</span>
              {kycRequests.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-extrabold">
                  {kycRequests.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setApprovalsSubTab('cards')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                approvalsSubTab === 'cards' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              <span>Credit Cards</span>
              {pendingCardCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-extrabold">
                  {pendingCardCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setApprovalsSubTab('loans')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                approvalsSubTab === 'loans' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Personal Loans</span>
              {pendingLoanCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-extrabold">
                  {pendingLoanCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setApprovalsSubTab('wealth')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                approvalsSubTab === 'wealth' ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              <span>Wealth &amp; Insurance</span>
              {pendingWealthCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-extrabold">
                  {pendingWealthCount}
                </span>
              )}
            </button>
          </div>

          {/* SUB-TAB 1: KYC DOCUMENTS */}
          {approvalsSubTab === 'kyc' && (
            <div className="space-y-3">
              {kycLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
                </div>
              )}

              {!kycLoading && kycRequests.length === 0 && (
                <div className="p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">All Clear — No Pending KYC Applications</p>
                  <p className="text-xs text-slate-400 max-w-sm">All submitted customer KYC documents have been reviewed.</p>
                </div>
              )}

              {!kycLoading && kycRequests.length > 0 && (
                <div className="space-y-3">
                  {kycRequests.map(req => (
                    <div key={req.id} className="p-5 rounded-2xl bg-white border border-orange-200/60 shadow-xs hover:border-orange-300 transition">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-extrabold text-base flex-shrink-0">
                            {req.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-slate-900">{req.fullName}</p>
                            <p className="text-xs text-slate-500">{req.email} &bull; +91{req.mobileNumber}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">@{req.username}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            disabled={kycActionLoading === req.id}
                            onClick={() => handleApproveKyc(req.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{kycActionLoading === req.id ? 'Processing…' : 'Approve KYC'}</span>
                          </button>
                          <button
                            disabled={kycActionLoading === req.id}
                            onClick={() => { setShowRejectModal(req); setRejectReason(''); }}
                            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">PAN Number</span>
                          <span className="text-xs font-mono font-bold text-slate-800">{req.panNumber || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Aadhaar</span>
                          <span className="text-xs font-mono font-bold text-slate-800">{req.aadhaarNumber || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Birth</span>
                          <span className="text-xs font-bold text-slate-800">{req.dateOfBirth || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">V-KYC Reference</span>
                          <span className="text-xs font-mono font-bold text-brand-700">{req.vkycReference || '—'}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wide">
                          KYC SUBMITTED
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Submitted: {req.createdAt ? formatLiveTimestamp(req.createdAt) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: CREDIT CARDS */}
          {approvalsSubTab === 'cards' && (
            <div className="space-y-3">
              {cardApps.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">No Credit Card Applications in Queue</p>
                  <p className="text-xs text-slate-400">Applications submitted by customers will appear here for review.</p>
                </div>
              ) : (
                cardApps.map((app) => (
                  <div key={app.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-extrabold text-slate-900">{app.userName}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {app.status === 'APPROVED' ? 'APPROVED & ACTIVE' : app.status === 'REJECTED' ? 'REJECTED' : 'PENDING REVIEW'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">A/C: {app.accountNumber} &bull; +91 {app.phone}</p>
                          <p className="text-[11px] text-slate-400 font-mono">Ref: {app.id}</p>
                        </div>
                      </div>

                      {app.status === 'PENDING' ? (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleApproveCard(app.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Card</span>
                          </button>
                          <button
                            onClick={() => handleRejectCard(app.id)}
                            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Action Completed</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested Card</span>
                        <span className="font-bold text-slate-800">{app.cardName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Credit Limit</span>
                        <span className="font-mono font-bold text-brand-700">₹{Number(app.requestedLimit).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Employment</span>
                        <span className="font-bold text-slate-800">{app.employmentType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Income</span>
                        <span className="font-mono font-bold text-slate-800">₹{Number(app.annualIncome).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SUB-TAB 3: PERSONAL LOANS */}
          {approvalsSubTab === 'loans' && (
            <div className="space-y-3">
              {loanApps.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
                  <Zap className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">No Loan Applications in Queue</p>
                  <p className="text-xs text-slate-400">Customer personal loan requests will appear here for underwriting review.</p>
                </div>
              ) : (
                loanApps.map((app) => (
                  <div key={app.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-extrabold text-slate-900">{app.userName}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}>
                              {app.status === 'APPROVED' ? 'DISBURSED & ACTIVE' : app.status === 'REJECTED' ? 'REJECTED' : 'PENDING DISBURSAL'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">A/C: {app.accountNumber} &bull; +91 {app.phone}</p>
                          <p className="text-[11px] text-slate-400 font-mono">Ref: {app.id}</p>
                        </div>
                      </div>

                      {app.status === 'PENDING' ? (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleApproveLoan(app.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Approve &amp; Disburse</span>
                          </button>
                          <button
                            onClick={() => handleRejectLoan(app.id)}
                            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Action Completed</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Loan Principal</span>
                        <span className="font-mono font-bold text-indigo-700 text-sm">₹{Number(app.amount).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Repayment Tenure</span>
                        <span className="font-bold text-slate-800">{app.tenureMonths} Months</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Installment</span>
                        <span className="font-mono font-bold text-slate-800">₹{Number(app.emi).toLocaleString('en-IN')}/mo</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Fixed Interest Rate</span>
                        <span className="font-mono font-bold text-slate-800">{app.annualRate || 10.49}% p.a.</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SUB-TAB 4: WEALTH & INSURANCE */}
          {approvalsSubTab === 'wealth' && (
            <div className="space-y-3">
              {wealthApps.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-2">
                  <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">No Wealth &amp; Insurance Applications</p>
                  <p className="text-xs text-slate-400">SIP mandates and insurance policy applications will show here for underwriter sign-off.</p>
                </div>
              ) : (
                wealthApps.map((app) => (
                  <div key={app.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-extrabold text-slate-900">{app.userName}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {app.status === 'APPROVED' ? 'APPROVED & ISSUED' : app.status === 'REJECTED' ? 'REJECTED' : 'PENDING UNDERWRITING'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">A/C: {app.accountNumber} &bull; +91 {app.phone}</p>
                          <p className="text-[11px] text-slate-400 font-mono">Ref: {app.id}</p>
                        </div>
                      </div>

                      {app.status === 'PENDING' ? (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleApproveWealth(app.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve &amp; Issue</span>
                          </button>
                          <button
                            onClick={() => handleRejectWealth(app.id)}
                            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Folio / Policy No</span>
                          <span className="font-mono text-xs font-bold text-slate-800">{app.folioOrPolicyNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Product</span>
                        <span className="font-bold text-slate-800">{app.title}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Cover / Investment</span>
                        <span className="font-mono font-bold text-purple-700">{app.cover}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Plan Type</span>
                        <span className="font-bold text-slate-800">{app.productType === 'WEALTH_SIP' ? 'Mutual Fund SIP' : 'Insurance Policy'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Reject KYC Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reject KYC Application</h3>
                  <p className="text-xs text-slate-500">{showRejectModal.fullName}</p>
                </div>
              </div>
              <button onClick={() => setShowRejectModal(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block text-xs font-bold text-slate-700 mb-2">Rejection Reason (will be sent to customer)</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. PAN number does not match records. Please re-submit with correct PAN..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />

            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowRejectModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim() || kycActionLoading === showRejectModal.id}
                onClick={handleRejectKyc}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {kycActionLoading === showRejectModal.id ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
