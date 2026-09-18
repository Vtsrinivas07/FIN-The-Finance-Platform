import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PieChart, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics');
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-3xl" />)}
        </div>
        <div className="h-72 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  const income = parseFloat(analytics?.totalIncome || 0);
  const expenses = parseFloat(analytics?.totalExpenses || 0);
  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, Math.round((savings / income) * 100)) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Spending & Financial Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time analysis of account cashflow, monthly trends, and expense categories
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Inflow</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Credits this month</span>
        </div>

        {/* Total Expenses */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Outflow</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 inline-block">Debits this month</span>
        </div>

        {/* Net Savings */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-brand-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Retention</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold ${savings >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            ₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-brand-600 font-semibold mt-1 inline-block">
            {savingsRate}% Savings Rate
          </span>
        </div>
      </div>

      {/* Grid: Category Breakdown + Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Expenses by Category</h3>
          <p className="text-xs text-slate-400 -mt-2">Breakdown of all debited funds</p>

          <div className="space-y-4 pt-2">
            {analytics?.categoryExpenses && Object.entries(analytics.categoryExpenses).map(([category, amt]) => {
              const amount = parseFloat(amt);
              const percent = expenses > 0 ? Math.round((amount / expenses) * 100) : 0;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{category}</span>
                    <span className="text-slate-900 font-mono">₹{amount.toFixed(2)} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-Month Trend Visualization */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Cashflow Trend</h3>
          <p className="text-xs text-slate-400 -mt-2">Monthly Inflow vs Outflow</p>

          <div className="space-y-4 pt-4">
            {analytics?.monthlyTrends?.map((trend, idx) => {
              const inc = parseFloat(trend.income);
              const exp = parseFloat(trend.expense);
              const maxVal = Math.max(inc, exp, 1000);
              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{trend.month}</span>
                    <span className="text-slate-500 font-normal">
                      Net: <strong className={inc >= exp ? 'text-emerald-600' : 'text-rose-600'}>
                        ₹{(inc - exp).toFixed(2)}
                      </strong>
                    </span>
                  </div>
                  {/* Inflow bar */}
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="w-12 text-slate-400">Inflow</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(inc / maxVal) * 100}%` }} />
                    </div>
                    <span className="w-16 text-right font-mono font-bold text-emerald-600">₹{inc.toFixed(0)}</span>
                  </div>
                  {/* Outflow bar */}
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="w-12 text-slate-400">Outflow</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${(exp / maxVal) * 100}%` }} />
                    </div>
                    <span className="w-16 text-right font-mono font-bold text-rose-600">₹{exp.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
