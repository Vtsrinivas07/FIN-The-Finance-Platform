import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
  Cpu
} from 'lucide-react';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState('');

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
        setFeedback('Card settings updated.');
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

  const card = cards[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Debit Cards & Security</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your virtual debit cards, spending limits, and channel controls
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
      ) : !card ? (
        <div className="p-12 text-center bg-white rounded-3xl border text-slate-400 text-xs">
          No cards linked to your account.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Card Physical Visual Mockup */}
          <div className="flex flex-col items-center">
            <div className={`relative w-full max-w-sm aspect-[1.586/1] rounded-3xl p-6 sm:p-7 text-white shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
              card.frozen
                ? 'bg-gradient-to-tr from-slate-800 to-slate-900 filter grayscale'
                : 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-brand-900'
            }`}>
              {/* Glossy card overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              {/* Card Top: Bank name & Contactless */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">F</div>
                  <span className="text-xs font-extrabold tracking-widest uppercase">FIN</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-slate-300 rotate-90" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md">
                    {card.frozen ? 'FROZEN' : 'ACTIVE'}
                  </span>
                </div>
              </div>

              {/* Chip Visual */}
              <div className="relative z-10 my-auto">
                <div className="w-11 h-9 rounded-lg bg-gradient-to-tr from-amber-300 to-yellow-500 border border-yellow-600/40 shadow-inner flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-yellow-900/60" />
                </div>
              </div>

              {/* Card Number & Holder info */}
              <div className="relative z-10 space-y-2">
                <p className="font-mono text-lg sm:text-xl tracking-widest text-slate-100 font-bold">
                  {card.cardNumberMasked}
                </p>
                <div className="flex items-end justify-between text-[10px] sm:text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Cardholder</span>
                    <span className="font-bold tracking-wide uppercase">{card.cardHolderName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Expires</span>
                    <span className="font-mono font-bold">{card.expiryDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Freeze Toggle CTA */}
            <div className="w-full max-w-sm mt-4">
              <button
                onClick={() => handleToggleSetting(card.id, 'isFrozen', card.frozen)}
                disabled={updating}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition ${
                  card.frozen
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {card.frozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{card.frozen ? 'Unfreeze Card' : 'Freeze Card Immediately'}</span>
              </button>
            </div>
          </div>

          {/* Controls & Security Settings */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900">Card Controls & Limits</h2>

            {/* Controls List */}
            <div className="space-y-4 divide-y divide-slate-100">
              {/* Online transactions */}
              <div className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Online Transactions</p>
                    <p className="text-[11px] text-slate-400">E-commerce, web shopping & subscriptions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting(card.id, 'isOnlineEnabled', card.onlineEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    card.onlineEnabled ? 'bg-brand-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Contactless tap & pay */}
              <div className="pt-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Contactless (NFC) Payments</p>
                    <p className="text-[11px] text-slate-400">Tap-to-pay at POS card terminals</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting(card.id, 'isContactlessEnabled', card.contactlessEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    card.contactlessEnabled ? 'bg-brand-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* International usage */}
              <div className="pt-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">International Usage</p>
                    <p className="text-[11px] text-slate-400">Enable cross-border foreign currency charges</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting(card.id, 'isInternationalEnabled', card.internationalEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    card.internationalEnabled ? 'bg-brand-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>

            {/* Daily Spending Limit Slider */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">Daily Spending Limit</span>
                <span className="text-xs font-extrabold text-brand-600">
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

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              💡 <strong>Demo Mode:</strong> All toggles interact in real-time with the database. Real payments or physical card production are not processed.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
