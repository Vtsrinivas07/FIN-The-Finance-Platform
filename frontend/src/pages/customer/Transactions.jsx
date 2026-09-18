import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CustomSelect from '../../components/common/CustomSelect';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X
} from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);

  // Filters
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [page, type, category, status]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);
      if (type) params.append('type', type);
      if (category) params.append('category', category);
      if (status) params.append('status', status);

      const res = await api.get(`/transfers/history?${params.toString()}`);
      if (res.data?.success) {
        setTransactions(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCsvStatement = () => {
    if (transactions.length === 0) return;
    const headers = ["Reference", "Date", "Description", "Type", "Category", "Amount (INR)", "Status", "Recipient"];
    const rows = transactions.map(t => [
      t.referenceNumber,
      new Date(t.createdAt).toISOString(),
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount,
      t.status,
      `"${t.recipientInfo.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.recipientInfo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Transaction History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full ledger of debits, credits, transfers, and utility payments
          </p>
        </div>
        <button
          onClick={downloadCsvStatement}
          disabled={transactions.length === 0}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs transition self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Download Statement (CSV)</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description or reference..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Type filter */}
          <div>
            <CustomSelect
              options={[
                { value: '', label: 'All Types' },
                { value: 'CREDIT', label: 'Credits (+)' },
                { value: 'DEBIT', label: 'Debits (-)' },
              ]}
              value={type}
              onChange={(val) => { setType(val); setPage(0); }}
              placeholder="All Types"
            />
          </div>

          {/* Category filter */}
          <div>
            <CustomSelect
              options={[
                { value: '', label: 'All Categories' },
                { value: 'TRANSFER', label: 'Transfer' },
                { value: 'BILL_PAYMENT', label: 'Bill Payment' },
                { value: 'RECHARGE', label: 'Recharge' },
                { value: 'DEPOSIT', label: 'Cash Deposit' },
              ]}
              value={category}
              onChange={(val) => { setCategory(val); setPage(0); }}
              placeholder="All Categories"
            />
          </div>

          {/* Status filter */}
          <div>
            <CustomSelect
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'SUCCESS', label: 'Success' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'FAILED', label: 'Failed' },
                { value: 'REVERSED', label: 'Reversed' },
              ]}
              value={status}
              onChange={(val) => { setStatus(val); setPage(0); }}
              placeholder="All Statuses"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No transactions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Type & Reference</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-50/70 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-mono font-bold text-slate-900 block">{tx.referenceNumber}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{tx.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{tx.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{tx.recipientInfo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${
                      tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900">Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Ref Number:</span>
                <span className="font-bold text-slate-800">{selectedTx.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className={`font-bold text-sm ${selectedTx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {selectedTx.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(selectedTx.amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Direction:</span>
                <span className="font-bold">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span>{selectedTx.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Description:</span>
                <span>{selectedTx.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient / Note:</span>
                <span>{selectedTx.recipientInfo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-600 font-bold">{selectedTx.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span>{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full mt-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
