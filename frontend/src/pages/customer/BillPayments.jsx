import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import CustomSelect from '../../components/common/CustomSelect';
import {
  Zap,
  Droplets,
  Flame,
  Wifi,
  Smartphone,
  Tv,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ELECTRICITY', label: 'Electricity', icon: Zap },
  { id: 'WATER', label: 'Water', icon: Droplets },
  { id: 'GAS', label: 'Piped Gas', icon: Flame },
  { id: 'INTERNET', label: 'Broadband', icon: Wifi },
  { id: 'MOBILE', label: 'Mobile Prepaid', icon: Smartphone },
  { id: 'DTH', label: 'DTH Television', icon: Tv },
];

const BillPayments = () => {
  const [activeCategory, setActiveCategory] = useState('ELECTRICITY');
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [consumerNumber, setConsumerNumber] = useState('');
  const [amount, setAmount] = useState('');

  // Telecom plans state
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    loadProviders();
  }, [activeCategory]);

  useEffect(() => {
    if ((activeCategory === 'MOBILE' || activeCategory === 'DTH') && selectedProvider) {
      loadPlans(selectedProvider);
    } else {
      setPlans([]);
      setSelectedPlan('');
    }
  }, [selectedProvider, activeCategory]);

  const loadProviders = async () => {
    try {
      const res = await api.get(`/bills/providers/${activeCategory}`);
      if (res.data?.success) {
        setProviders(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedProvider(res.data.data[0].id);
        } else {
          setSelectedProvider('');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPlans = async (providerId) => {
    try {
      const res = await api.get(`/bills/plans/${providerId}`);
      if (res.data?.success) {
        setPlans(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedPlan(res.data.data[0].id);
          setAmount(res.data.data[0].amount);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlanChange = (planId) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setAmount(plan.amount);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (activeCategory === 'MOBILE' || activeCategory === 'DTH') {
        res = await api.post('/bills/recharge', {
          planId: selectedPlan,
          mobileNumber: consumerNumber,
        });
      } else {
        res = await api.post('/bills/pay', {
          providerId: selectedProvider,
          consumerNumber: consumerNumber,
          amount: parseFloat(amount),
        });
      }

      if (res.data?.success) {
        setReceipt(res.data.data);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setConsumerNumber('');
    setAmount('');
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bill Payments & Recharges</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Settle your utility bills and recharge telecom subscriptions in seconds
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-100/80 p-1.5 rounded-2xl">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setReceipt(null);
                setError('');
              }}
              className={`flex flex-col items-center py-2.5 px-2 rounded-xl transition text-xs font-semibold ${
                isActive
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[11px] truncate max-w-[80px]">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Payment Form or Receipt Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        {!receipt ? (
          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Service Provider
              </label>
              <CustomSelect
                options={providers.map((p) => ({ value: p.id, label: p.name }))}
                value={selectedProvider}
                onChange={setSelectedProvider}
                placeholder="Select service provider..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {activeCategory === 'MOBILE' ? '10-Digit Mobile Number' : activeCategory === 'DTH' ? 'Subscriber / Smart Card ID' : 'Consumer / Account Number'}
              </label>
              <input
                type="text"
                value={consumerNumber}
                onChange={(e) => setConsumerNumber(e.target.value)}
                placeholder={activeCategory === 'MOBILE' ? 'e.g. 9849728400' : 'e.g. 1029384756'}
                required
                maxLength={activeCategory === 'MOBILE' ? 10 : 20}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none font-mono"
              />
            </div>

            {/* Plans List for Mobile / DTH */}
            {(activeCategory === 'MOBILE' || activeCategory === 'DTH') && plans.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Recharge Plan
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => handlePlanChange(plan.id)}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                        selectedPlan === plan.id
                          ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">{plan.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 text-slate-700">
                            {plan.validity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{plan.description}</p>
                      </div>
                      <span className="font-extrabold text-sm text-slate-900 ml-2">₹{plan.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bill Amount for non-recharge utilities */}
            {activeCategory !== 'MOBILE' && activeCategory !== 'DTH' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Bill Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-bold focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 text-xs sm:text-sm"
            >
              {loading ? (
                <span>Authorizing Payment...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Pay Bill</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Payment Successful!</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your bill has been settled and reference generated</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-bold text-slate-800">{receipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">₹{parseFloat(receipt.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-bold text-slate-800">{receipt.recipientInfo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-800">{new Date(receipt.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-md transition"
            >
              Make Another Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillPayments;
