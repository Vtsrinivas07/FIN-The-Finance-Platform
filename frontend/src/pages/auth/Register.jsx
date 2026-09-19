import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Lock, User, Mail, Phone, MapPin, Check, X, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    mobileNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password requirements calculation
  const pwd = formData.password;
  const checks = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    special: /[@#$%^&+=]/.test(pwd),
    match: pwd && pwd === formData.confirmPassword,
  };

  const isPasswordValid = checks.length && checks.upper && checks.lower && checks.digit && checks.special && checks.match;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username || !formData.email || !formData.mobileNumber || !formData.address) {
      setError('All fields are required.');
      return;
    }

    if (formData.username.length < 4) {
      setError('Username must be at least 4 characters long.');
      return;
    }

    if (formData.mobileNumber.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please fulfill all password security requirements.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Open a <span className="text-brand-400">FIN</span> Account
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Instant digital account opening with zero maintenance fees and instant activation
          </p>
        </div>

        {/* Card */}
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. johndoe"
                    className="w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Residential Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, City, PIN"
                  className="w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Live Password Checklist */}
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 grid grid-cols-2 gap-2 text-[11px]">
              <span className={`flex items-center ${checks.length ? 'text-emerald-400' : 'text-slate-400'}`}>
                {checks.length ? <Check className="w-3.5 h-3.5 mr-1" /> : <X className="w-3.5 h-3.5 mr-1 text-slate-500" />} 8+ characters
              </span>
              <span className={`flex items-center ${checks.upper ? 'text-emerald-400' : 'text-slate-400'}`}>
                {checks.upper ? <Check className="w-3.5 h-3.5 mr-1" /> : <X className="w-3.5 h-3.5 mr-1 text-slate-500" />} Uppercase letter
              </span>
              <span className={`flex items-center ${checks.lower ? 'text-emerald-400' : 'text-slate-400'}`}>
                {checks.lower ? <Check className="w-3.5 h-3.5 mr-1" /> : <X className="w-3.5 h-3.5 mr-1 text-slate-500" />} Lowercase letter
              </span>
              <span className={`flex items-center ${checks.digit ? 'text-emerald-400' : 'text-slate-400'}`}>
                {checks.digit ? <Check className="w-3.5 h-3.5 mr-1" /> : <X className="w-3.5 h-3.5 mr-1 text-slate-500" />} Number (0-9)
              </span>
              <span className={`flex items-center ${checks.special ? 'text-emerald-400' : 'text-slate-400'}`}>
                {checks.special ? <Check className="w-3.5 h-3.5 mr-1" /> : <X className="w-3.5 h-3.5 mr-1 text-slate-500" />} Symbol (@#$%^&+=)
              </span>
              <span className={`flex items-center ${checks.match ? 'text-emerald-400' : 'text-slate-400'}`}>
                {checks.match ? <Check className="w-3.5 h-3.5 mr-1" /> : <X className="w-3.5 h-3.5 mr-1 text-slate-500" />} Passwords match
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Claim ₹1,000 Bonus</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-5 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
