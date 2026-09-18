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
  LifeBuoy
} from 'lucide-react';

const Settings = () => {
  const { user, refreshUser } = useAuth();

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings & Governance</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Account credentials, 24x7 customer support, privacy policy, and banking terms
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('profile'); setError(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'profile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Security</span>
        </button>
        <button
          onClick={() => { setActiveTab('contact'); setError(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'contact' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Contact Us & Support</span>
        </button>
        <button
          onClick={() => { setActiveTab('privacy'); setError(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'privacy' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy Policy</span>
        </button>
        <button
          onClick={() => { setActiveTab('terms'); setError(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'terms' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Terms & Conditions</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: PROFILE & SECURITY */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Personal Info Form */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-400">Update your verified identification credentials</p>
              </div>
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
                    Mobile Number (UPI Linked)
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
                    Registered Address
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
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
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
                <p className="text-xs text-slate-400">Ensure your account is protected by a strong password</p>
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
                * Password must contain at least 8 characters with upper, lower, numbers, and special symbols (@#$%^&+=).
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACT US & SUPPORT */}
      {activeTab === 'contact' && (
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

      {/* TAB 3: PRIVACY POLICY */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Customer Data Privacy Policy</h2>
                <p className="text-xs text-slate-400">Compliant with Section 45E of RBI Act and Digital Personal Data Protection (DPDP) Act</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Zero Unauthorized Data Exposure</h4>
                <p>
                  FIN Bank adheres to strict non-disclosure covenants under the Banking Regulation Act. Customer account balances, deposit figures, PINs, OTPs, and transaction histories are never broadcast openly across administrative screens, teller monitors, or third-party advertising networks.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Military-Grade Cryptographic Encryption</h4>
                <p>
                  All transactional payloads and customer credentials in transit are encrypted via Transport Layer Security (TLS 1.3) with 256-bit AES encryption. Inactive passwords are salted and hashed using BCrypt cryptographic primitives with minimum work factor 12.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Audited Administrative Inquiry Terminals</h4>
                <p>
                  Bank employees and system administrators are prohibited from viewing customer accounts without selecting a verified authentication identifier (Account Number, CIF, Mobile, PAN) and documenting a mandatory compliance reason (such as in-branch servicing, dispute investigation, or court order). Every lookup is permanently recorded in the immutable Security Audit Trail.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TERMS & CONDITIONS */}
      {activeTab === 'terms' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Terms & Conditions of Digital Banking</h2>
                <p className="text-xs text-slate-400">Governing Internet Banking, NPCI UPI 2.0, and Card Settlement Services</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">1. Electronic Fund Transfers & UPI Limits</h4>
                <p>
                  Immediate Payment Service (IMPS) and Unified Payments Interface (UPI) transfers executed through FIN Bank are irrevocable once settled on the NPCI clearing rail. Daily UPI peer-to-peer (P2P) transfers are capped at ₹1,00,000 per banking day in compliance with RBI guidelines.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">2. Customer Liability in Unauthorized Transactions</h4>
                <p>
                  Customers reporting fraudulent or unauthorized debit transactions within 3 calendar days of occurrence enjoy Zero Liability protection under the RBI Charter of Customer Rights. Claims reported after 7 days will be governed by the bank’s board-approved risk indemnity policy.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">3. Debit Card Channel Controls & Security</h4>
                <p>
                  Cardholders are granted self-service toggle switches to freeze/unfreeze cards, enable/disable contactless tap-and-pay (NFC), international roaming, and online e-commerce transactions in real-time through the FIN digital dashboard.
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
