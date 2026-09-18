import React, { useState, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';

const Transfers = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [primaryAccount, setPrimaryAccount] = useState(null);
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  // Stepped flow: 'input' -> 'confirm' -> 'success'
  const [step, setStep] = useState('input');
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

  const handleSelectBeneficiary = (ben) => {
    setSelectedBeneficiary(ben);
    setRecipientAccount(ben.beneficiaryAccountNumber);
    setError('');
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    setError('');

    const transferAmt = parseFloat(amount);
    if (!recipientAccount) {
      setError('Please select a beneficiary or enter a recipient account number.');
      return;
    }

    if (!transferAmt || transferAmt <= 0) {
      setError('Please enter a valid transfer amount greater than ₹0.');
      return;
    }

    if (primaryAccount && transferAmt > parseFloat(primaryAccount.balance)) {
      setError(`Insufficient balance. Your current balance is ₹${parseFloat(primaryAccount.balance).toFixed(2)}.`);
      return;
    }

    if (primaryAccount && primaryAccount.accountNumber === recipientAccount) {
      setError('You cannot transfer funds to your own account.');
      return;
    }

    setStep('confirm');
  };

  const handleExecuteTransfer = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/transfers', {
        recipientAccountNumber: recipientAccount,
        amount: parseFloat(amount),
        description: description || 'Fund Transfer',
      });

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
    setRecipientAccount('');
    setAmount('');
    setDescription('');
    setSelectedBeneficiary(null);
    setReceipt(null);
    setError('');
    setStep('input');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fund Transfer</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Send money securely to any registered account
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stepped Transfer Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 'input' ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-emerald-500 text-white'
            }`}>
              1
            </div>
            <span className="text-[11px] font-semibold mt-1 text-slate-600">Details</span>
          </div>
          <div className={`flex-1 h-0.5 mx-3 ${step !== 'input' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 'confirm' ? 'bg-brand-600 text-white ring-4 ring-brand-100' : step === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
            <span className="text-[11px] font-semibold mt-1 text-slate-600">Confirm</span>
          </div>
          <div className={`flex-1 h-0.5 mx-3 ${step === 'success' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === 'success' ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-slate-100 text-slate-400'
            }`}>
              3
            </div>
            <span className="text-[11px] font-semibold mt-1 text-slate-600">Receipt</span>
          </div>
        </div>

        {/* STEP 1: INPUT DETAILS */}
        {step === 'input' && (
          <form onSubmit={handleProceedToConfirm} className="space-y-5">
            {/* Quick Beneficiaries Carousel */}
            {beneficiaries.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Saved Beneficiary
                </label>
                <div className="flex space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {beneficiaries.map((ben) => (
                    <button
                      key={ben.id}
                      type="button"
                      onClick={() => handleSelectBeneficiary(ben)}
                      className={`flex-shrink-0 flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl border text-left transition ${
                        selectedBeneficiary?.id === ben.id
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                        {ben.beneficiaryName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[110px]">{ben.beneficiaryName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{ben.maskedAccountNumber}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Recipient Account Number
              </label>
              <input
                type="text"
                value={recipientAccount}
                onChange={(e) => {
                  setRecipientAccount(e.target.value);
                  setSelectedBeneficiary(null);
                }}
                placeholder="Enter 12-digit account number"
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-brand-500 focus:bg-white focus:outline-none transition font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Transfer Amount (₹)
                </label>
                {primaryAccount && (
                  <span className="text-xs text-slate-500">
                    Available: <strong className="text-slate-800">₹{parseFloat(primaryAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-lg font-bold focus:border-brand-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Reference / Note (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Rent, Gift, Project invoice"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-brand-500 focus:bg-white focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/25 flex items-center justify-center space-x-2 transition"
            >
              <span>Review Transfer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: EXPLICIT CONFIRMATION (Goal.md section 10, step 4 & 5) */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transfer Amount</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mt-1">
                ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>From Account:</span>
                <span className="font-semibold text-slate-900 font-mono">{primaryAccount?.accountNumber}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>To Account:</span>
                <span className="font-semibold text-slate-900 font-mono">{recipientAccount}</span>
              </div>
              {selectedBeneficiary && (
                <div className="flex justify-between text-slate-600">
                  <span>Beneficiary Name:</span>
                  <span className="font-semibold text-slate-900">{selectedBeneficiary.beneficiaryName}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Transfer Note:</span>
                <span className="font-semibold text-slate-900">{description || 'Fund Transfer'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Processing Mode:</span>
                <span className="font-semibold text-emerald-600">Instant Real-Time Settlement</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Confirm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS RECEIPT */}
        {step === 'success' && receipt && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Transfer Successful!</h2>
              <p className="text-xs text-slate-500 mt-1">Your transaction has been confirmed and ledger updated</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <span className="font-bold text-slate-800">{receipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Sent:</span>
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
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-600/20 transition flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Make Another Transfer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfers;
