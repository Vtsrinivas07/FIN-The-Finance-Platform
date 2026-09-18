import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import Dashboard from './pages/customer/Dashboard';
import Transfers from './pages/customer/Transfers';
import Beneficiaries from './pages/customer/Beneficiaries';
import FinancialProducts from './pages/customer/FinancialProducts';
import BillPayments from './pages/customer/BillPayments';
import Cards from './pages/customer/Cards';
import Analytics from './pages/customer/Analytics';
import Transactions from './pages/customer/Transactions';
import Settings from './pages/customer/Settings';

// Admin Page
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
        Loading banking session...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const CustomerRoute = ({ children }) => {
  const { loading, isAdmin } = useAuth();
  if (loading) return null;
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

const IndexRoute = () => {
  const { loading, isAdmin } = useAuth();
  if (loading) return null;
  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<IndexRoute />} />
            <Route path="dashboard" element={<CustomerRoute><Dashboard /></CustomerRoute>} />
            <Route path="transfers" element={<CustomerRoute><Transfers /></CustomerRoute>} />
            <Route path="products" element={<CustomerRoute><FinancialProducts /></CustomerRoute>} />
            <Route path="beneficiaries" element={<Navigate to="/transfers?tab=beneficiaries" replace />} />
            <Route path="bills" element={<CustomerRoute><BillPayments /></CustomerRoute>} />
            <Route path="cards" element={<CustomerRoute><Cards /></CustomerRoute>} />
            <Route path="analytics" element={<CustomerRoute><Analytics /></CustomerRoute>} />
            <Route path="transactions" element={<CustomerRoute><Transactions /></CustomerRoute>} />
            <Route path="settings" element={<Settings />} />

            {/* Admin Portal Route */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<IndexRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
