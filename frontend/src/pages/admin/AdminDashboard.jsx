import React, { useState, useEffect } from 'react';
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
  RotateCcw
} from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(currentTab);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    if (['overview', 'users', 'transactions', 'audit'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes, tRes, aRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users?size=15'),
        api.get('/admin/transactions?size=15'),
        api.get('/admin/audit-logs?size=15'),
      ]);

      if (mRes.data?.success) setMetrics(mRes.data.data);
      if (uRes.data?.success) setUsers(uRes.data.data.content || []);
      if (tRes.data?.success) setTransactions(tRes.data.data.content || []);
      if (aRes.data?.success) setAuditLogs(aRes.data.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-brand-600" />
            <span>Admin Governance Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            System overview, customer lifecycle management, transaction monitor, and audit logs
          </p>
        </div>
        <button
          onClick={loadAdminData}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row (Goal.md section 20) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Customers</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.totalCustomers || 0}</p>
          <span className="text-[10px] text-brand-600 font-semibold mt-1 inline-block">Registered profiles</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Active Accounts</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.activeAccounts || 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">Operational</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Transactions Today</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.transactionsToday || 0}</p>
          <span className="text-[10px] text-slate-500 mt-1 inline-block">
            {metrics?.successfulTransactions} success • {metrics?.failedTransactions} failed
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Volume</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹{parseFloat(metrics?.totalTransactionVolume || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] text-brand-600 font-semibold mt-1 inline-block">Platform Turnover</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('overview'); setSearchParams({}); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Operations Console
        </button>
        <button
          onClick={() => { setActiveTab('users'); setSearchParams({ tab: 'users' }); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Customer Accounts ({users.length})
        </button>
        <button
          onClick={() => { setActiveTab('transactions'); setSearchParams({ tab: 'transactions' }); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'transactions' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Transaction Monitor ({transactions.length})
        </button>
        <button
          onClick={() => { setActiveTab('audit'); setSearchParams({ tab: 'audit' }); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Security Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Tab 0: Operations Console Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Previews: Customer Accounts & Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Customers Preview */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Recent Customer Registrations</h3>
                  <p className="text-xs text-slate-400">Latest accounts onboarded</p>
                </div>
                <button
                  onClick={() => { setActiveTab('users'); setSearchParams({ tab: 'users' }); }}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 transition"
                >
                  Manage All →
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {users.slice(0, 4).map((u) => (
                  <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400">@{u.username} • {u.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Preview */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Live Transaction Stream</h3>
                  <p className="text-xs text-slate-400">Real-time ledger entries</p>
                </div>
                <button
                  onClick={() => { setActiveTab('transactions'); setSearchParams({ tab: 'transactions' }); }}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 transition"
                >
                  View Monitor →
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-xs">{tx.description}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{tx.referenceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-mono text-slate-900">₹{parseFloat(tx.amount).toFixed(2)}</p>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Email & Mobile</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400">@{u.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700">{u.email}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{u.mobileNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                            u.status === 'ACTIVE'
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Transaction Monitor */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5">Account</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{tx.referenceNumber}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">{tx.accountNumber}</td>
                    <td className="px-6 py-3.5 text-slate-700">{tx.description}</td>
                    <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{parseFloat(tx.amount).toFixed(2)}
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
        </div>
      )}

      {/* Tab 3: Audit Logs Stream */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 font-mono text-[11px]">
                    <td className="px-6 py-3.5 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">@{log.username}</td>
                    <td className="px-6 py-3.5 text-brand-600 font-bold">{log.action}</td>
                    <td className="px-6 py-3.5 text-slate-500">{log.entityName} #{log.entityId}</td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">{log.details}</td>
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
    </div>
  );
};

export default AdminDashboard;
