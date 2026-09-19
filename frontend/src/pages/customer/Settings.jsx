import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  Shield,
  PhoneCall,
  FileText,
  HelpCircle,
  Building,
  ShieldCheck,
  Check,
  ExternalLink,
  LifeBuoy,
  MessageSquare,
  Send,
  Clock,
  Inbox,
  AlertTriangle,
  ChevronRight,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const INITIAL_SUPPORT_TICKETS = [
  {
    id: 'TKT-1042',
    customerName: 'Aarav Sharma',
    username: 'aarav_s',
    accountNumber: '1001928471',
    mobileNumber: '9876543210',
    category: 'Transaction Dispute',
    subject: 'UPI transfer debited but merchant payment pending',
    message: 'I transferred ₹3,500 via UPI (Ref: 429184029148) yesterday evening to BigBazaar. The amount was debited from my account but the shop status showed pending. Please verify.',
    submittedAt: 'Today at 10:24 AM',
    priority: 'HIGH',
    status: 'OPEN',
    adminReply: null,
    repliedAt: null,
    repliedBy: null
  },
  {
    id: 'TKT-1041',
    customerName: 'Priya Patel',
    username: 'priya_p',
    accountNumber: '1001839201',
    mobileNumber: '9823456789',
    category: 'KYC & Profile',
    subject: 'Address proof update after home relocation',
    message: 'I relocated to Bengaluru and submitted my updated Aadhaar and utility bill in the KYC tab. Could you please review and verify my new address?',
    submittedAt: 'Today at 08:45 AM',
    priority: 'MEDIUM',
    status: 'OPEN',
    adminReply: null,
    repliedAt: null,
    repliedBy: null
  },
  {
    id: 'TKT-1039',
    customerName: 'Vikram Singh',
    username: 'vikram_s',
    accountNumber: '1001748293',
    mobileNumber: '9812345678',
    category: 'Card Security',
    subject: 'Request to unblock debit card after incorrect PIN attempts',
    message: 'My debit card was temporarily locked at an ATM after 3 incorrect PIN entries. I have verified my identity and request card reactivation.',
    submittedAt: 'Yesterday at 04:12 PM',
    priority: 'HIGH',
    status: 'RESOLVED',
    adminReply: 'Your debit card ending in 4092 has been unlocked after identity verification. Please set a new PIN in the Cards section before attempting an ATM withdrawal.',
    repliedAt: 'Yesterday at 05:30 PM',
    repliedBy: 'admin'
  }
];

const Settings = () => {
  const { user, refreshUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');

  // --- Admin Support Desk State ---
  const [tickets, setTickets] = useState(INITIAL_SUPPORT_TICKETS);
  const [ticketFilter, setTicketFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'RESOLVED'
  const [selectedTicketId, setSelectedTicketId] = useState('TKT-1042');
  const [replyText, setReplyText] = useState('');
  const [replySuccessMessage, setReplySuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');
    setError('');

    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data?.success) {
        setProfileMessage('Profile information updated successfully.');
        refreshUser();
        setTimeout(() => setProfileMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage('');
    setError('');

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data?.success) {
        setPasswordMessage('Password changed successfully.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendTicketReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const now = new Date();
    const timeStr = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? {
              ...t,
              status: 'RESOLVED',
              adminReply: replyText.trim(),
              repliedAt: timeStr,
              repliedBy: user?.username || 'admin'
            }
          : t
      )
    );

    const targetTicket = tickets.find((t) => t.id === selectedTicketId);
    setReplySuccessMessage(`Response sent to ${targetTicket?.customerName || 'customer'} via email & in-app alert.`);
    setReplyText('');
    setTimeout(() => setReplySuccessMessage(''), 4000);
  };

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'OPEN') return t.status === 'OPEN';
    if (ticketFilter === 'RESOLVED') return t.status === 'RESOLVED';
    return true;
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];
  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isAdmin ? 'Admin Settings & Support Desk' : 'Settings & Support'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {isAdmin
            ? 'Manage your admin credentials, review incoming customer inquiries, and send official replies'
            : 'Manage your profile, change passwords, and access customer support'}
        </p>
      </div>

      {/* Role-Based Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('profile'); setError(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'profile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Security</span>
        </button>

        {isAdmin ? (
          /* ADMIN ONLY TAB: Customer Support Response Center */
          <button
            onClick={() => { setActiveTab('supportDesk'); setError(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'supportDesk' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Customer Support Desk</span>
            {openTicketsCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                {openTicketsCount} Pending
              </span>
            )}
          </button>
        ) : (
          /* CUSTOMER TABS: Contact Us, Privacy Policy, Terms & Conditions */
          <>
            <button
              onClick={() => { setActiveTab('contact'); setError(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'contact' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Contact Us & Support</span>
            </button>
            <button
              onClick={() => { setActiveTab('privacy'); setError(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'privacy' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => { setActiveTab('terms'); setError(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'terms' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms & Conditions</span>
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: PROFILE & SECURITY (For Both Admin & Customer)    */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Personal Info Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-400">
                    {isAdmin ? 'System administrator account details' : 'Update your personal contact details'}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  Role: Bank Administrator
                </span>
              )}
            </div>

            {profileMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{profileMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.mobileNumber}
                    onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                    required
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-500 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {isAdmin ? 'Office Location / Branch' : 'Registered Address'}
                  </label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Security & Password</h2>
                <p className="text-xs text-slate-400">Keep your account secure with a strong password</p>
              </div>
            </div>

            {passwordMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passwordMessage}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                * Must be at least 8 characters with upper, lower, numbers, and special symbols (@#$%^&+=).
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN VIEW: CUSTOMER SUPPORT DESK & INQUIRIES            */}
      {/* ======================================================== */}
      {isAdmin && activeTab === 'supportDesk' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Support Channels Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Inquiries</span>
              <p className="text-xl font-extrabold text-amber-600 mt-0.5">{openTicketsCount} Unresolved</p>
              <span className="text-[10px] text-slate-400 block mt-1">Average response time: 14 mins</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Support Email Routing</span>
              <p className="text-sm font-bold text-slate-900 font-mono mt-0.5 truncate">support@finbank.com</p>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" /> Active & Receiving
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Helpline</span>
              <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">1800-419-0124</p>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1">24x7 Call Center Live</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Grievance Officer</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">Mr. R. K. Nambiar</p>
              <span className="text-[10px] text-slate-400 block mt-1">Escalation SLA: 4 Hours</span>
            </div>
          </div>

          {/* Success Toast */}
          {replySuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{replySuccessMessage}</span>
            </div>
          )}

          {/* Inquiries Workspace: Master-Detail */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header & Filter Bar */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <Inbox className="w-4 h-4 text-brand-600" />
                  <span>Customer Support Inquiries & Tickets</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review customer messages and send official bank responses
                </p>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTicketFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    ticketFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({tickets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTicketFilter('OPEN')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    ticketFilter === 'OPEN' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Needs Response ({openTicketsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTicketFilter('RESOLVED')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    ticketFilter === 'RESOLVED' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Resolved ({tickets.length - openTicketsCount})
                </button>
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
              {/* Left Column: Ticket List */}
              <div className="lg:col-span-5 border-r border-slate-100 divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No inquiries found in this view.
                  </div>
                ) : (
                  filteredTickets.map((t) => {
                    const isSelected = t.id === selectedTicketId;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`p-4 cursor-pointer transition flex items-start space-x-3 text-left ${
                          isSelected ? 'bg-brand-50/50 border-l-4 border-brand-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center flex-shrink-0 text-xs">
                          {t.customerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {t.customerName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t.id}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                            {t.subject}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {t.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                t.status === 'OPEN'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {t.status === 'OPEN' ? 'Needs Response' : 'Resolved'}
                            </span>
                            <span className="text-[10px] text-slate-400">{t.submittedAt}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Selected Ticket Details & Reply Composer */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-6">
                {selectedTicket ? (
                  <div className="space-y-5">
                    {/* Ticket Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                            {selectedTicket.id}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-semibold">{selectedTicket.category}</span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 mt-1">
                          {selectedTicket.subject}
                        </h4>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                          selectedTicket.status === 'OPEN'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {selectedTicket.status === 'OPEN' ? 'Status: Pending Staff Reply' : 'Status: Resolved'}
                      </span>
                    </div>

                    {/* Customer Info Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                        <span className="font-bold text-slate-800">{selectedTicket.customerName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">@{selectedTicket.username}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Number</span>
                        <span className="font-mono font-bold text-slate-800">{selectedTicket.accountNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
                        <span className="font-mono font-bold text-slate-800">+91 {selectedTicket.mobileNumber}</span>
                      </div>
                    </div>

                    {/* Customer's Inquiry Message */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                          <span>Customer Inquiry</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{selectedTicket.submittedAt}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                        "{selectedTicket.message}"
                      </p>
                    </div>

                    {/* Existing Admin Response (if resolved) */}
                    {selectedTicket.adminReply && (
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900 flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Official Bank Response Sent</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono">{selectedTicket.repliedAt}</span>
                        </div>
                        <p className="text-xs text-emerald-900 leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-200">
                          {selectedTicket.adminReply}
                        </p>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Dispatched by: @{selectedTicket.repliedBy || 'admin'}
                        </span>
                      </div>
                    )}

                    {/* Response Composer (If ticket is OPEN or Admin wants to send an update) */}
                    <div className="pt-2">
                      <form onSubmit={handleSendTicketReply} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                            <Send className="w-3.5 h-3.5 text-brand-600" />
                            <span>
                              {selectedTicket.status === 'OPEN' ? 'Type Response to Customer' : 'Send Additional Response'}
                            </span>
                          </label>
                          <span className="text-[10px] text-slate-400">
                            Sent directly to customer email & notifications
                          </span>
                        </div>

                        {/* Quick Pre-fill responses */}
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setReplyText(
                                'Your request has been verified and approved. The changes are now active on your account.'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          >
                            + Approved & Active
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReplyText(
                                'The transaction clearing has been confirmed. The amount has been credited back to your account.'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          >
                            + Transaction Credited
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setReplyText(
                                'Your card has been unlocked after verification. You can now use it normally.'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          >
                            + Card Unlocked
                          </button>
                        </div>

                        <textarea
                          rows={4}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your official response to this customer..."
                          className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:outline-none transition resize-none text-slate-900"
                        />

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-40 shadow-md shadow-brand-600/20 flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Response to Customer</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    Select a support ticket from the list to view and reply.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOMER ONLY TAB: CONTACT US & SUPPORT HELPLINE         */}
      {/* ======================================================== */}
      {!isAdmin && activeTab === 'contact' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">24x7 Customer Support & Helpdesk</h2>
                <p className="text-xs text-slate-400">Reach our dedicated banking officers and fraud resolution desk anytime</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs">
                  <PhoneCall className="w-4 h-4 text-brand-600" />
                  <span>Toll-Free Retail Banking Helpline</span>
                </div>
                <p className="text-xl font-extrabold font-mono text-slate-900">1800-419-0124</p>
                <p className="text-[11px] text-slate-400">Available 24 hours a day, 7 days a week (English, Hindi, Regional)</p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                  <Shield className="w-4 h-4 text-rose-600" />
                  <span>National Cyber Crime & Fraud Helpline</span>
                </div>
                <p className="text-xl font-extrabold font-mono text-rose-900">1930 / +91-11-2345-6789</p>
                <p className="text-[11px] text-rose-600">Immediate card freezing and unauthorized transaction dispute reporting</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
                  <Mail className="w-4 h-4 text-brand-600" />
                  <span>Official Email Inquiries</span>
                </div>
                <p className="text-sm font-bold font-mono text-slate-900">support@finbank.com</p>
                <p className="text-[11px] text-slate-400">Guaranteed response within 4 hours with SLA ticket tracking</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs">
                  <Building className="w-4 h-4 text-brand-600" />
                  <span>Principal Grievance Redressal Officer</span>
                </div>
                <p className="text-xs font-bold text-slate-900">Mr. R. K. Nambiar (General Manager)</p>
                <p className="text-[11px] text-slate-400">FIN Bank Tower, Bandra Kurla Complex (BKC), Mumbai 400051</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOMER ONLY TAB: PRIVACY POLICY                        */}
      {/* ======================================================== */}
      {!isAdmin && activeTab === 'privacy' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Customer Data Privacy Policy</h2>
                <p className="text-xs text-slate-400">How we protect your personal and financial information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Your Data Is Never Shared</h4>
                <p>
                  We keep your account balances, transaction records, phone number, and personal details completely private. We never sell or share your data with advertisers or third parties.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Strong Bank-Grade Security</h4>
                <p>
                  Every payment, transfer, and sensitive operation is protected using high-security encryption. Your passwords are securely scrambled so even bank employees cannot see them.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Staff Searches Are Monitored</h4>
                <p>
                  Bank staff can only view your account when assisting you with a verified request. Every search or profile view is automatically saved in security audit logs to prevent misuse.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOMER ONLY TAB: TERMS & CONDITIONS                    */}
      {/* ======================================================== */}
      {!isAdmin && activeTab === 'terms' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Terms & Conditions</h2>
                <p className="text-xs text-slate-400">Clear guidelines on transfers, payments, and card usage</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Fast & Instant Transfers</h4>
                <p>
                  UPI and IMPS transfers happen immediately and are credited right away. Daily UPI payments are subject to standard daily limits for your security.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Protection Against Fraud</h4>
                <p>
                  If you ever notice an unfamiliar charge or suspicious transaction, notify our 24x7 helpline (1800-419-0124) immediately. We provide prompt support and dispute resolution.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. You Control Your Card</h4>
                <p>
                  You can lock or unlock your debit card at any time through the Cards section, as well as turn online shopping or international transactions on and off whenever you like.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
