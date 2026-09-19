import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import {
  ArrowLeftRight,
  Users,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building,
  UserCheck,
  Receipt,
  RotateCcw,
  ArrowRight,
  Smartphone,
  QrCode,
  Lock,
  Sparkles,
  Zap,
  PhoneCall,
  Search,
  Check,
  Plus,
  Trash2,
  Building2,
  X
} from 'lucide-react';

const Transfers = () => {
  const { user } = useAuth();
  const isKycApproved = user?.kycStatus === 'VERIFIED_TIER_3';

  const [searchParams, setSearchParams] = useSearchParams();
  const initialMainTab = searchParams.get('tab') === 'beneficiaries' ? 'BENEFICIARIES' : 'TRANSFER';
  const [activeMainTab, setActiveMainTab] = useState(initialMainTab);

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [primaryAccount, setPrimaryAccount] = useState(null);

  // Beneficiary Management Sub-States
  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  const [showAddBenModal, setShowAddBenModal] = useState(false);
  const [benActionSuccess, setBenActionSuccess] = useState('');
  const [benActionError, setBenActionError] = useState('');
  const [benFormData, setBenFormData] = useState({
    beneficiaryAccountNumber: '',
    beneficiaryName: '',
    bankName: 'Digital Bank',
    ifscCode: 'FINB0001024',
  });

  // Transfer Rail Mode: 'UPI_PHONE' | 'BANK_ACCOUNT'
  const [transferMode, setTransferMode] = useState('UPI_PHONE');

  // UPI Phone Number States
  const [phone, setPhone] = useState('');
  const [resolvedPhoneRecipient, setResolvedPhoneRecipient] = useState(null);
  const [phoneSearching, setPhoneSearching] = useState(false);

  // Account Transfer States
  const [recipientAccount, setRecipientAccount] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  // Common Transfer States
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Stepped flow: 'input' -> 'confirm' -> 'success'
  const [step, setStep] = useState('input');
  const [upiPin, setUpiPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accRes, benRes] = await Promise.all([
        api.get('/accounts/primary'),
        api.get('/beneficiaries'),
      ]);
      if (accRes.data?.success) setPrimaryAccount(accRes.data.data);
      if (benRes.data?.success) setBeneficiaries(benRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Live UPI Phone Number Lookup
  useEffect(() => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length === 10) {
      lookupPhone(clean);
    } else {
      setResolvedPhoneRecipient(null);
    }
  }, [phone]);

  const lookupPhone = async (cleanDigits) => {
    setPhoneSearching(true);
    try {
      const res = await api.get(`/transfers/lookup-upi-phone?phone=${cleanDigits}`);
      if (res.data?.success) {
        setResolvedPhoneRecipient(res.data.data);
      }
    } catch (e) {
      setResolvedPhoneRecipient({
        isInternalCustomer: false,
        fullName: 'Verified UPI Beneficiary',
        phone: cleanDigits,
        upiId: `${cleanDigits}@upi`,
        bankName: 'NPCI UPI Network'
      });
    } finally {
      setPhoneSearching(false);
    }
  };

  const handleSelectBeneficiary = (ben) => {
    setSelectedBeneficiary(ben);
    setRecipientAccount(ben.beneficiaryAccountNumber);
    setError('');
  };

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();
    setBenActionError('');
    setBenActionSuccess('');
    try {
      const res = await api.post('/beneficiaries', benFormData);
      if (res.data?.success) {
        setBenActionSuccess('Beneficiary added successfully!');
        setShowAddBenModal(false);
        setBenFormData({
          beneficiaryAccountNumber: '',
          beneficiaryName: '',
          bankName: 'Digital Bank',
          ifscCode: 'FINB0001024',
        });
        loadData();
      }
    } catch (err) {
      setBenActionError(err.response?.data?.message || 'Failed to add beneficiary');
    }
  };

  const handleDeleteBeneficiary = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your beneficiaries?`)) return;
    try {
      await api.delete(`/beneficiaries/${id}`);
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      setBenActionSuccess('Beneficiary removed.');
    } catch (err) {
      setBenActionError(err.response?.data?.message || 'Failed to remove beneficiary');
    }
  };

  const handleQuickPayBeneficiary = (ben) => {
    if (!isKycApproved) {
      setError('Fund transfers are locked. Tier-3 KYC verification and Bank Admin approval is required.');
      return;
    }
    setActiveMainTab('TRANSFER');
    setTransferMode('BANK_ACCOUNT');
    setSelectedBeneficiary(ben);
    setRecipientAccount(ben.beneficiaryAccountNumber);
    setSearchParams({});
    setError('');
  };

  const filteredBeneficiaries = beneficiaries.filter(b =>
    (b.beneficiaryName || '').toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
    (b.beneficiaryAccountNumber || '').includes(beneficiarySearch)
  );

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    setError('');

    if (!isKycApproved) {
      setError('Fund transfers are restricted. Full Tier-3 KYC verification and Bank Admin approval is required.');
      return;
    }

    const transferAmt = parseFloat(amount);

    if (transferMode === 'UPI_PHONE') {
      const clean = phone.replace(/[^0-9]/g, '');
      if (clean.length < 10) {
        setError('Please enter a valid 10-digit mobile phone number.');
        return;
      }
    } else {
      if (!recipientAccount.trim()) {
        setError('Please enter a recipient account number or select a beneficiary.');
        return;
      }
      if (primaryAccount && primaryAccount.accountNumber === recipientAccount) {
        setError('You cannot transfer funds to your own account.');
        return;
      }
    }

    if (!transferAmt || transferAmt <= 0) {
      setError('Please enter a valid transfer amount greater than ₹0.');
      return;
    }

    if (primaryAccount && transferAmt > parseFloat(primaryAccount.balance)) {
      setError(`Insufficient balance. Your current balance is ₹${parseFloat(primaryAccount.balance).toFixed(2)}.`);
      return;
    }

    setStep('confirm');
  };

  const handleExecuteTransfer = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        amount: parseFloat(amount),
        description: description || (transferMode === 'UPI_PHONE' ? `UPI P2P to +91 ${phone}` : 'Bank Fund Transfer'),
        paymentType: transferMode
      };

      if (transferMode === 'UPI_PHONE') {
        payload.recipientPhone = phone.replace(/[^0-9]/g, '');
      } else {
        payload.recipientAccountNumber = recipientAccount;
      }

      const res = await api.post('/transfers', payload);

      if (res.data?.success) {
        setReceipt(res.data.data);
        setStep('success');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        loadData(); // Refresh balance
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhone('');
    setResolvedPhoneRecipient(null);
    setRecipientAccount('');
    setAmount('');
    setDescription('');
    setSelectedBeneficiary(null);
    setReceipt(null);
    setError('');
    setUpiPin(['', '', '', '']);
    setStep('input');
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ArrowLeftRight className="w-6 h-6 text-brand-600" />
            <span>Transfers &amp; Payees Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Instant UPI phone payments, inter-bank transfers &amp; verified beneficiary directory
          </p>
        </div>

        {/* Top-Level Navigation Switcher */}
        <div className="flex bg-slate-200/70 p-1.5 rounded-2xl self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => { setActiveMainTab('TRANSFER'); setSearchParams({}); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMainTab === 'TRANSFER'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Send Money</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveMainTab('BENEFICIARIES'); setSearchParams({ tab: 'beneficiaries' }); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeMainTab === 'BENEFICIARIES'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Beneficiaries ({beneficiaries.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SEND MONEY (UPI & ACCOUNT TRANSFERS) */}
      {activeMainTab === 'TRANSFER' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* KYC Restriction Alert Banner */}
          {!isKycApproved && (
            <div className="p-5 rounded-3xl bg-amber-50/90 border border-amber-200 text-amber-900 shadow-xs space-y-3 animate-in fade-in">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-extrabold text-amber-950">Fund Transfers Restricted — KYC Approval Required</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 text-amber-800 uppercase tracking-wide">
                      {user?.kycStatus || 'PENDING'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                    In compliance with RBI regulations, outward fund transfers (UPI, NEFT, IMPS) are locked until full Tier-3 KYC is approved by the Bank Admin.
                    {user?.kycStatus === 'SUBMITTED' ? (
                      <span className="font-bold block mt-1 text-amber-950">
                        ⏳ Your KYC documents have been submitted and are pending review in the Admin Verification Queue. Transfers will unlock automatically once approved.
                      </span>
                    ) : (
                      <span className="block mt-1">
                        Please submit your Video KYC and Aadhaar/PAN verification to unlock transfers.
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {user?.kycStatus !== 'SUBMITTED' && (
                <div className="pt-1 flex justify-end">
                  <a
                    href="/dashboard"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>Complete KYC on Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step === 'input' ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-emerald-500 text-white'
                }`}>
                  1
                </div>
                <span className="text-[11px] font-semibold mt-1 text-slate-600">Enter Details</span>
              </div>
              <div className={`flex-1 h-0.5 mx-3 ${step !== 'input' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step === 'confirm' ? 'bg-brand-600 text-white ring-4 ring-brand-100' : step === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  2
                </div>
                <span className="text-[11px] font-semibold mt-1 text-slate-600">Authorize PIN</span>
              </div>
              <div className={`flex-1 h-0.5 mx-3 ${step === 'success' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step === 'success' ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-slate-100 text-slate-400'
                }`}>
                  3
                </div>
                <span className="text-[11px] font-semibold mt-1 text-slate-600">Receipt</span>
              </div>
            </div>

            {/* STEP 1: INPUT DETAILS */}
            {step === 'input' && (
              <form onSubmit={handleProceedToConfirm} className="space-y-6">
                {/* Transfer Rail Selector Tabs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Transfer Method
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => { setTransferMode('UPI_PHONE'); setError(''); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                        transferMode === 'UPI_PHONE'
                          ? 'bg-white text-brand-700 shadow-xs ring-1 ring-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>UPI Mobile Transfer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTransferMode('BANK_ACCOUNT'); setError(''); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                        transferMode === 'BANK_ACCOUNT'
                          ? 'bg-white text-brand-700 shadow-xs ring-1 ring-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>Account &amp; IFSC</span>
                    </button>
                  </div>
                </div>

                {/* Source Account Info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Debit From (CBS)</span>
                    <span className="text-xs font-bold text-slate-800">
                      {primaryAccount ? `${primaryAccount.accountType} (••• ${primaryAccount.accountNumber?.slice(-4)})` : 'Loading...'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Available Balance</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      ₹{primaryAccount ? parseFloat(primaryAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </span>
                  </div>
                </div>

                {/* RAIL A: UPI PHONE NUMBER INPUT */}
                {transferMode === 'UPI_PHONE' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Recipient Mobile Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span className="text-xs font-bold text-slate-400 font-mono">+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength="10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                        {phoneSearching ? (
                          <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        ) : resolvedPhoneRecipient ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <PhoneCall className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    </div>

                    {/* NPCI Verified VPA Display Card */}
                    {resolvedPhoneRecipient && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs animate-in fade-in">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                            {resolvedPhoneRecipient.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-emerald-950 block">{resolvedPhoneRecipient.fullName}</span>
                            <span className="text-[11px] text-emerald-700 font-mono">{resolvedPhoneRecipient.upiId}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200">
                          {resolvedPhoneRecipient.bankName || 'NPCI Verified'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* RAIL B: CBS ACCOUNT & SAVED BENEFICIARY SELECTION */}
                {transferMode === 'BANK_ACCOUNT' && (
                  <div className="space-y-4">
                    {beneficiaries.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Select Saved Payee
                          </label>
                          <button
                            type="button"
                            onClick={() => { setActiveMainTab('BENEFICIARIES'); setSearchParams({ tab: 'beneficiaries' }); }}
                            className="text-xs text-brand-600 hover:text-brand-700 font-bold"
                          >
                            Manage All Payees →
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                          {beneficiaries.map((ben) => (
                            <button
                              key={ben.id}
                              type="button"
                              onClick={() => handleSelectBeneficiary(ben)}
                              className={`p-2.5 rounded-2xl border text-left transition flex items-center space-x-2.5 ${
                                selectedBeneficiary?.id === ben.id
                                  ? 'bg-brand-50 border-brand-500 text-brand-900 ring-1 ring-brand-500'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">
                                {ben.beneficiaryName?.charAt(0)}
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold block truncate">{ben.beneficiaryName}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">•••• {ben.beneficiaryAccountNumber?.slice(-4)}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={recipientAccount}
                        onChange={(e) => {
                          setRecipientAccount(e.target.value.replace(/[^0-9]/g, ''));
                          setSelectedBeneficiary(null);
                        }}
                        placeholder="Enter 12-digit core banking account number"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                      />
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Transfer Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-2 mt-2">
                    {quickAmounts.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt.toString())}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note / Remarks */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Purpose / Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Rent payment, Groceries, Dinner"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isKycApproved}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    isKycApproved
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {isKycApproved ? (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-400 mr-1.5" />
                      <span>KYC Approval Required to Transfer Funds</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: AUTHORIZE & ENTER UPI PIN */}
            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Transfer Amount</span>
                  <div className="text-3xl font-black text-slate-900 font-mono">
                    ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500">
                    To: {transferMode === 'UPI_PHONE' ? (resolvedPhoneRecipient?.fullName || `+91 ${phone}`) : (selectedBeneficiary?.beneficiaryName || recipientAccount)}
                  </p>
                </div>

                {/* Security PIN Entry */}
                <div className="space-y-2 text-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Enter 4-Digit UPI / Transaction Security PIN
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Protected by FIN 256-bit HSM encryption
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={idx}
                        id={`pin-${idx}`}
                        type="password"
                        maxLength="1"
                        value={upiPin[idx]}
                        onChange={(e) => handlePinChange(idx, e.target.value)}
                        className="w-12 h-12 text-center text-xl font-bold font-mono rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="flex-1 py-3 px-4 rounded-2xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={loading || upiPin.join('').length < 4}
                    onClick={handleExecuteTransfer}
                    className="flex-2 py-3 px-4 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{loading ? 'Processing via NPCI...' : 'Authorize & Transfer'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS RECEIPT */}
            {step === 'success' && receipt && (
              <div className="text-center space-y-6 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Payment Settled via NPCI UPI
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                    ₹{parseFloat(receipt.amount).toFixed(2)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Successfully debited from {receipt.accountNumber}
                  </p>
                </div>

                {/* Receipt Summary Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-3 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">UPI Ref / UTR:</span>
                    <span className="font-bold text-slate-900">{receipt.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Beneficiary:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{receipt.recipientInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-slate-600">{new Date(receipt.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-600 font-bold">{receipt.status}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
                  >
                    Send Another Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: BENEFICIARY DIRECTORY MANAGEMENT */}
      {activeMainTab === 'BENEFICIARIES' && (
        <div className="space-y-6">
          {benActionSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{benActionSuccess}</span>
            </div>
          )}

          {benActionError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{benActionError}</span>
            </div>
          )}

          {/* Beneficiary Action Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={beneficiarySearch}
                onChange={(e) => setBeneficiarySearch(e.target.value)}
                placeholder="Search payees by name or account..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
              />
            </div>

            <button
              onClick={() => {
                setBenActionError('');
                setBenActionSuccess('');
                setShowAddBenModal(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white flex items-center space-x-2 transition shadow-md shadow-brand-600/20 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Beneficiary</span>
            </button>
          </div>

          {/* Beneficiaries Grid */}
          {filteredBeneficiaries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No beneficiaries found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {beneficiarySearch ? 'No payees match your search term.' : 'Add your frequently used friends, family, or business payees for one-click transfers.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBeneficiaries.map((ben) => (
                <div
                  key={ben.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {ben.beneficiaryName?.charAt(0) || 'P'}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVE
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">{ben.beneficiaryName}</h4>
                    <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                      •••• {ben.beneficiaryAccountNumber?.slice(-4)}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {ben.bankName || 'Digital Bank'} • {ben.ifscCode || 'FINB0001024'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 mt-5 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleQuickPayBeneficiary(ben)}
                      className="flex-1 py-2 px-3 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white text-xs font-bold transition flex items-center justify-center space-x-1"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Send Money</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBeneficiary(ben.id, ben.beneficiaryName)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Payee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Beneficiary Modal */}
          {showAddBenModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900">Add New Beneficiary</h3>
                  <button
                    onClick={() => setShowAddBenModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddBeneficiary} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Payee Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={benFormData.beneficiaryName}
                      onChange={(e) => setBenFormData({ ...benFormData, beneficiaryName: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      required
                      value={benFormData.beneficiaryAccountNumber}
                      onChange={(e) => setBenFormData({ ...benFormData, beneficiaryAccountNumber: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="12-digit core banking account"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        required
                        value={benFormData.bankName}
                        onChange={(e) => setBenFormData({ ...benFormData, bankName: e.target.value })}
                        placeholder="e.g. State Bank of India"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        required
                        value={benFormData.ifscCode}
                        onChange={(e) => setBenFormData({ ...benFormData, ifscCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. SBIN0001234"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddBenModal(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 transition"
                    >
                      Save Payee
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Transfers;
