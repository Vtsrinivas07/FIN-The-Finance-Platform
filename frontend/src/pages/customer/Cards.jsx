import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Lock,
  Unlock,
  Wifi,
  Globe,
  ShoppingCart,
  Sliders,
  AlertCircle,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  Receipt,
  RotateCcw,
  Check,
  ArrowRight,
  Gift,
  Plane,
  Fuel,
  TrendingUp,
  UserCheck
} from 'lucide-react';

const Cards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isKycVerified = user?.kycStatus === 'VERIFIED_TIER_3';
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DEBIT'); // 'DEBIT' | 'CREDIT'
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Credit Card Application & Issued State
  const [hasCreditCard, setHasCreditCard] = useState(() => {
    if (!user?.id) return false;
    return localStorage.getItem(`fin_credit_card_active_${user.id}`) === 'true';
  });

  useEffect(() => {
    if (user?.id) {
      const isIssued = localStorage.getItem(`fin_credit_card_active_${user.id}`) === 'true';
      setHasCreditCard(isIssued);
      if (user?.fullName) {
        setCreditCard((prev) => ({
          ...prev,
          cardHolder: user.fullName.toUpperCase()
        }));
      }
    }
  }, [user?.id, user?.fullName]);

  // Credit Card Details
  const [creditCard, setCreditCard] = useState({
    cardNumber: '4532 8912 3456 8821',
    cardHolder: user?.fullName?.toUpperCase() || 'CARDHOLDER',
    expiryDate: '09/29',
    totalLimit: 150000,
    usedLimit: 0,
    rewardPoints: 5192,
    dueDate: '5th of next month',
    frozen: false,
    contactless: true,
    international: false,
    onlineShopping: true
  });

  // Credit Card Application Form State
  const [applying, setApplying] = useState(false);
  const [applyStep, setApplyStep] = useState(0); // 0 = idle, 1 = verifying, 2 = bureau check, 3 = card issuing
  const [employmentType, setEmploymentType] = useState('SALARIED');
  const [incomeRange, setIncomeRange] = useState('800000');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [payingBill, setPayingBill] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cards');
      if (res.data?.success) {
        setCards(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (cardId, field, currentValue) => {
    setUpdating(true);
    setFeedback('');
    try {
      const payload = { [field]: !currentValue };
      const res = await api.patch(`/cards/${cardId}/settings`, payload);
      if (res.data?.success) {
        setCards(cards.map(c => c.id === cardId ? res.data.data : c));
        setFeedback('Debit card settings updated.');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update setting');
    } finally {
      setUpdating(false);
    }
  };

  const handleLimitChange = async (cardId, newLimit) => {
    try {
      const res = await api.patch(`/cards/${cardId}/settings`, { spendingLimit: parseFloat(newLimit) });
      if (res.data?.success) {
        setCards(cards.map(c => c.id === cardId ? res.data.data : c));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update limit');
    }
  };

  const handleToggleCreditSetting = (field) => {
    setCreditCard((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
    setFeedback('Credit Card channel control updated.');
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleApplyCreditCard = (e) => {
    e.preventDefault();
    if (!agreedTerms) return;

    setApplying(true);
    setApplyStep(1); // Verifying customer KYC identity

    setTimeout(() => {
      setApplyStep(2); // Checking CIBIL Credit Bureau
    }, 700);

    setTimeout(() => {
      setApplyStep(3); // Allocating ₹1,50,000 credit limit & generating card
    }, 1400);

    setTimeout(() => {
      if (user?.id) {
        localStorage.setItem(`fin_credit_card_active_${user.id}`, 'true');
      }
      setHasCreditCard(true);
      setCreditCard((prev) => ({
        ...prev,
        cardHolder: user?.fullName?.toUpperCase() || 'CARDHOLDER',
        usedLimit: 0,
        rewardPoints: 5192
      }));
      setApplying(false);
      setApplyStep(0);
      setFeedback('Congratulations! Your FIN Millennia Credit Card has been approved and activated with a ₹1,50,000 credit limit.');
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => setFeedback(''), 5000);
    }, 2200);
  };

  const handlePayCreditBill = () => {
    if (creditCard.usedLimit <= 0) return;
    setPayingBill(true);
    setTimeout(() => {
      setCreditCard({
        ...creditCard,
        usedLimit: 0,
        rewardPoints: creditCard.rewardPoints + 342
      });
      setPayingBill(false);
      setFeedback('Credit Card bill paid in full. Dues cleared!');
      confetti({ particleCount: 60, spread: 60 });
      setTimeout(() => setFeedback(''), 4000);
    }, 1200);
  };

  const card = cards[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-brand-600" />
            <span>Cards & Security Controls</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your FIN Platinum Debit and Millennia Credit cards, limits, and channels
          </p>
        </div>

        {/* Tab Switcher: Debit Card vs Credit Card */}
        <div className="flex p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('DEBIT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'DEBIT' ? 'bg-white text-brand-600 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Platinum Debit Card</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CREDIT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'CREDIT' ? 'bg-white text-brand-600 shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{hasCreditCard ? 'Millennia Credit Card' : 'Apply for Credit Card'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* TAB 1: DEBIT CARD */}
      {activeTab === 'DEBIT' && (
        <div>
          {loading ? (
            <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          ) : !card ? (
            <div className="p-12 text-center bg-white rounded-3xl border text-slate-400 text-xs">
              No debit card linked to your account.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Debit Card Physical Mockup */}
              <div className="flex flex-col items-center">
                <div className={`relative w-full max-w-sm aspect-[1.586/1] rounded-3xl p-6 sm:p-7 text-white shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
                  card.frozen
                    ? 'bg-gradient-to-tr from-slate-800 to-slate-900 filter grayscale'
                    : 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-brand-900'
                }`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">F</div>
                      <span className="text-xs font-extrabold tracking-widest uppercase">FIN Bank</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-5 h-5 text-slate-300 rotate-90" />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md">
                        {card.frozen ? 'FROZEN' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 relative z-10 my-1">
                    <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 to-amber-500 border border-amber-200/50 flex items-center justify-center shadow-xs">
                      <Cpu className="w-4 h-4 text-amber-900" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 tracking-wider">PLATINUM DEBIT</span>
                  </div>

                  <div className="relative z-10">
                    <p className="font-mono text-lg sm:text-xl tracking-widest text-slate-100 font-medium">
                      {card.maskedCardNumber || '•••• •••• •••• 4589'}
                    </p>
                    <div className="flex justify-between items-end mt-3 text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">Cardholder</span>
                        <p className="font-bold tracking-wider text-slate-200 uppercase truncate max-w-[150px]">
                          {card.cardHolderName || 'CARDHOLDER'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">Expires</span>
                        <p className="font-mono font-bold text-slate-200">{card.expiryDate || '12/28'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-sm mt-4">
                  <button
                    onClick={() => handleToggleSetting(card.id, 'frozen', card.frozen)}
                    disabled={updating}
                    className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer ${
                      card.frozen
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                    }`}
                  >
                    {card.frozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>{card.frozen ? 'Unfreeze Debit Card' : 'Freeze Card Immediately'}</span>
                  </button>
                </div>
              </div>

              {/* Debit Card Settings Controls */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Channel Authorization Controls
                </h3>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Online Transactions (E-Commerce)</p>
                        <p className="text-[11px] text-slate-400">Amazon, Flipkart, Swiggy, Uber</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={card.onlineShopping}
                      onChange={() => handleToggleSetting(card.id, 'onlineShopping', card.onlineShopping)}
                      className="w-4 h-4 accent-brand-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Contactless Tap & Pay (NFC)</p>
                        <p className="text-[11px] text-slate-400">POS terminals up to ₹5,000 without PIN</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={card.contactless}
                      onChange={() => handleToggleSetting(card.id, 'contactless', card.contactless)}
                      className="w-4 h-4 accent-brand-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">International Usage</p>
                        <p className="text-[11px] text-slate-400">Cross-border merchant charges and ATMs</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={card.international}
                      onChange={() => handleToggleSetting(card.id, 'international', card.international)}
                      className="w-4 h-4 accent-brand-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700">Daily ATM & POS Spending Limit</span>
                    <span className="text-xs font-bold font-mono text-brand-600">
                      ₹{parseFloat(card.spendingLimit || 50000).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="200000"
                    step="5000"
                    value={card.spendingLimit || 50000}
                    onChange={(e) => handleLimitChange(card.id, e.target.value)}
                    className="w-full accent-brand-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Min ₹5,000</span>
                    <span>Max ₹2,00,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREDIT CARD */}

      {/* SCENARIO A: KYC NOT VERIFIED (Full KYC Tier 3 Required to apply) */}
      {activeTab === 'CREDIT' && !isKycVerified && (
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-200/80 shadow-xs flex flex-col items-center text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide">
              Full KYC Verification Required
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              Credit Card Application Locked — Full KYC Required
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Under banking regulations, credit card applications can only be processed for customers who have completed <strong>Full KYC (Tier 3)</strong> and received approval from our bank team.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
              <span className="font-medium">Your Current Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                user?.kycStatus === 'SUBMITTED' ? 'bg-orange-100 text-orange-700' :
                user?.kycStatus === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
              }`}>
                {user?.kycStatus === 'SUBMITTED' ? 'Submitted (Awaiting Admin Review)' :
                 user?.kycStatus === 'REJECTED' ? 'Rejected' : 'Tier 1 (Minimum KYC)'}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-brand-600/20 cursor-pointer"
          >
            <span>{user?.kycStatus === 'SUBMITTED' ? 'View KYC Status on Dashboard' : 'Complete Video KYC on Dashboard'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SCENARIO B: KYC VERIFIED, BUT CREDIT CARD NOT APPLIED YET */}
      {activeTab === 'CREDIT' && isKycVerified && !hasCreditCard && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  Pre-Approved Offer
                </span>
                <span className="text-xs text-amber-800 font-semibold">• Tier 3 KYC Verified</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Apply for FIN Millennia Credit Card
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Enjoy a <strong>₹1,50,000 pre-approved credit limit</strong> with 5% unlimited cashback, zero annual fee, and instant virtual card activation.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-right">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Joining & Annual Fee</span>
                <span className="text-base font-extrabold text-emerald-600">LIFETIME FREE (₹0)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Card Mockup Preview & Perks */}
            <div className="md:col-span-5 space-y-4">
              {/* Obsidian Gold Card Mockup */}
              <div className="relative w-full aspect-[1.586/1] rounded-3xl p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden bg-gradient-to-tr from-slate-950 via-zinc-900 to-amber-950 border border-amber-500/30">
                <div className="absolute top-0 right-0 w-52 h-52 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xs">F</div>
                    <span className="text-xs font-extrabold tracking-widest uppercase text-amber-300">FIN MILLENNIA</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200">
                    SIGNATURE
                  </span>
                </div>

                <div className="flex items-center space-x-3 relative z-10 my-1">
                  <div className="w-9 h-6 rounded-md bg-gradient-to-r from-amber-300 to-yellow-500 border border-amber-200 flex items-center justify-center shadow-xs">
                    <Cpu className="w-3.5 h-3.5 text-amber-950" />
                  </div>
                  <span className="text-[10px] font-mono text-amber-200/90 tracking-wider">LIMIT: ₹1,50,000</span>
                </div>

                <div className="relative z-10">
                  <p className="font-mono text-base tracking-widest text-slate-300 font-medium">
                    •••• •••• •••• 8821
                  </p>
                  <div className="flex justify-between items-end mt-2 text-xs">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-amber-400/70 block">Cardholder</span>
                      <p className="font-bold tracking-wider text-slate-100 uppercase text-[11px] truncate max-w-[130px]">
                        {user?.fullName || 'CARDHOLDER'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-wider text-amber-400/70 block">Valid Thru</span>
                      <p className="font-mono font-bold text-slate-100 text-[11px]">09/29</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Highlights */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Card Benefits</h4>
                <div className="flex items-center space-x-2 text-slate-600">
                  <ShoppingBag className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>5% Unlimited Cashback on Amazon, Swiggy & Flipkart</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Fuel className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>1% Fuel Surcharge Waiver across all fuel pumps</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Plane className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>4 Free Domestic Airport Lounge visits every year</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Zero Lost Card Liability with instant app freezing</span>
                </div>
              </div>
            </div>

            {/* Right: Application Form */}
            <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Credit Card Application</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm your details below to activate your card. No physical paperwork needed.
                </p>
              </div>

              {/* Verified KYC summary chips */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant</span>
                  <span className="font-bold text-slate-800">{user?.fullName || 'Customer'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                  <span className="font-mono font-bold text-slate-800">+91 {user?.mobileNumber || '••••••••••'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Credit Bureau Rating</span>
                  <span className="font-bold text-emerald-600">Score: 785 (Excellent)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Limit</span>
                  <span className="font-mono font-bold text-brand-700">₹1,50,000.00</span>
                </div>
              </div>

              <form onSubmit={handleApplyCreditCard} className="space-y-4">
                {/* Employment Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Employment Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'SALARIED', label: 'Salaried' },
                      { id: 'SELF_EMPLOYED', label: 'Self-Employed' },
                      { id: 'BUSINESS', label: 'Business Owner' },
                    ].map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => setEmploymentType(emp.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          employmentType === emp.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {emp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual Income Range */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Approximate Annual Income
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: '500000', label: '₹5L – ₹8L' },
                      { val: '800000', label: '₹8L – ₹15L' },
                      { val: '1500000', label: '₹15L+' },
                    ].map((inc) => (
                      <button
                        key={inc.val}
                        type="button"
                        onClick={() => setIncomeRange(inc.val)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          incomeRange === inc.val
                            ? 'bg-brand-50 text-brand-700 border-brand-300 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {inc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Card Delivery & Communication Address
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.address || 'Registered Residential Address'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start space-x-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="creditConsent"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-brand-600 rounded cursor-pointer"
                  />
                  <label htmlFor="creditConsent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                    I agree to the Credit Card Terms & Conditions, authorize CIBIL credit score check, and accept the ₹1,50,000 credit limit.
                  </label>
                </div>

                {/* Application Live Steps (when submitting) */}
                {applying && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-indigo-950 font-bold">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      <span>Processing Instant Card Issuance...</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-indigo-800">
                      <p className={applyStep >= 1 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                        {applyStep >= 1 ? '✓' : '•'} 1. Validating Full KYC Tier 3 Identity
                      </p>
                      <p className={applyStep >= 2 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                        {applyStep >= 2 ? '✓' : '•'} 2. Checking CIBIL Credit Bureau (Score: 785 - Prime)
                      </p>
                      <p className={applyStep >= 3 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                        {applyStep >= 3 ? '✓' : '•'} 3. Allocating ₹1,50,000 credit line & generating card number
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={applying || !agreedTerms}
                    className="w-full py-3 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 transition shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{applying ? 'Activating Card...' : 'Submit Application & Activate Card'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SCENARIO C: CREDIT CARD ISSUED & ACTIVE */}
      {activeTab === 'CREDIT' && isKycVerified && hasCreditCard && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in">
          {/* Credit Card Physical Mockup (Obsidian Gold finish) */}
          <div className="flex flex-col items-center">
            <div className={`relative w-full max-w-sm aspect-[1.586/1] rounded-3xl p-6 sm:p-7 text-white shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
              creditCard.frozen
                ? 'bg-gradient-to-tr from-slate-900 to-slate-950 filter grayscale'
                : 'bg-gradient-to-tr from-slate-950 via-zinc-900 to-amber-950 border border-amber-500/20'
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xs">F</div>
                  <span className="text-xs font-extrabold tracking-widest uppercase text-amber-300">FIN MILLENNIA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-amber-300/80 rotate-90" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200">
                    {creditCard.frozen ? 'FROZEN' : 'SIGNATURE'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 relative z-10 my-1">
                <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 to-yellow-500 border border-amber-200 flex items-center justify-center shadow-xs">
                  <Cpu className="w-4 h-4 text-amber-950" />
                </div>
                <span className="text-[10px] font-mono text-amber-200/80 tracking-wider">CREDIT LIMIT ₹1.5L</span>
              </div>

              <div className="relative z-10">
                <p className="font-mono text-lg sm:text-xl tracking-widest text-slate-100 font-medium">
                  {creditCard.cardNumber}
                </p>
                <div className="flex justify-between items-end mt-3 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-amber-400/70 block font-sans">Cardholder</span>
                    <p className="font-bold tracking-wider text-slate-200 uppercase truncate max-w-[150px]">
                      {creditCard.cardHolder}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-amber-400/70 block font-sans">Valid Thru</span>
                    <p className="font-mono font-bold text-slate-200">{creditCard.expiryDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Freeze / Unfreeze Toggle */}
            <div className="w-full max-w-sm mt-3">
              <button
                type="button"
                onClick={() => handleToggleCreditSetting('frozen')}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  creditCard.frozen
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                {creditCard.frozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{creditCard.frozen ? 'Unfreeze Credit Card' : 'Freeze Credit Card Temporarily'}</span>
              </button>
            </div>

            {/* Quick Bill Pay Action */}
            <div className="w-full max-w-sm mt-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Outstanding Bill</span>
                <span className="font-mono font-extrabold text-base text-slate-900">
                  ₹{creditCard.usedLimit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                type="button"
                onClick={handlePayCreditBill}
                disabled={payingBill || creditCard.usedLimit <= 0}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{payingBill ? 'Debiting Account...' : creditCard.usedLimit > 0 ? 'Pay Outstanding Bill in Full' : 'All Dues Paid in Full ✓'}</span>
              </button>
            </div>
          </div>

          {/* Credit Card Utilization & Rewards */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Credit Limit & Spends Utilization
            </h3>

            {/* Progress Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Available Credit: <strong className="text-emerald-600 font-mono">₹{(creditCard.totalLimit - creditCard.usedLimit).toLocaleString('en-IN')}</strong></span>
                <span className="text-slate-500">Total Limit: <strong className="text-slate-900 font-mono">₹{creditCard.totalLimit.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-amber-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, (creditCard.usedLimit / creditCard.totalLimit) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {((creditCard.usedLimit / creditCard.totalLimit) * 100).toFixed(1)}% Credit Utilization • Healthy ratio (&lt;30% recommended for CIBIL)
              </p>
            </div>

            {/* Rewards Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950">FIN Reward Points</p>
                  <p className="text-base font-extrabold font-mono text-amber-700">{creditCard.rewardPoints.toLocaleString()} Pts</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-white/80 px-2.5 py-1 rounded-xl border border-amber-200">
                Worth ₹{(creditCard.rewardPoints * 0.25).toFixed(2)}
              </span>
            </div>

            {/* Channel Authorization Controls for Credit Card */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Credit Card Channel Controls</span>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center space-x-2.5">
                  <ShoppingCart className="w-4 h-4 text-brand-600" />
                  <div>
                    <p className="font-bold text-slate-900">Online Transactions</p>
                    <p className="text-[10px] text-slate-400">E-Commerce shopping websites</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={creditCard.onlineShopping}
                  onChange={() => handleToggleCreditSetting('onlineShopping')}
                  className="w-4 h-4 accent-brand-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center space-x-2.5">
                  <Wifi className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="font-bold text-slate-900">Contactless Tap & Pay</p>
                    <p className="text-[10px] text-slate-400">NFC payments without PIN</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={creditCard.contactless}
                  onChange={() => handleToggleCreditSetting('contactless')}
                  className="w-4 h-4 accent-brand-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center space-x-2.5">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="font-bold text-slate-900">International Usage</p>
                    <p className="text-[10px] text-slate-400">Cross-border merchant transactions</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={creditCard.international}
                  onChange={() => handleToggleCreditSetting('international')}
                  className="w-4 h-4 accent-brand-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Enjoy 5% cashback on Amazon & Swiggy, 1% fuel surcharge waiver across India, and complimentary domestic airport lounge access.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
