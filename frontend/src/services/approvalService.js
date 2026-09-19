// FIN Banking Platform - Application & Approvals Service
// Manages customer applications and admin approvals for Credit Cards, Loans, Wealth & Insurance

const SEED_CARDS = [
  {
    id: 'CC-APP-2026-8842',
    userId: 'seed-user-1',
    userName: 'Aarav Mehta',
    accountNumber: '100098412351',
    phone: '9820192834',
    cardName: 'FIN Millennia Credit Card',
    requestedLimit: 150000,
    employmentType: 'SALARIED',
    annualIncome: '1200000',
    address: 'Flat 402, Green Meadows, Bandra West, Mumbai',
    status: 'PENDING',
    appliedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

const SEED_LOANS = [
  {
    id: 'LN-APP-2026-7731',
    userId: 'seed-user-2',
    userName: 'Neha Sharma',
    accountNumber: '100054219873',
    phone: '9876501234',
    amount: 200000,
    tenureMonths: 24,
    emi: 9274,
    annualRate: 10.49,
    purpose: 'Personal & Home Renovation',
    status: 'PENDING',
    appliedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

const SEED_WEALTH = [
  {
    id: 'WI-APP-2026-6621',
    userId: 'seed-user-3',
    userName: 'Vikram Singh',
    accountNumber: '100078123456',
    phone: '9811223344',
    productType: 'INSURANCE',
    title: 'Comprehensive Health Shield',
    cover: '₹10,00,000 (10 Lakhs)',
    premium: '₹890 / month',
    status: 'PENDING',
    appliedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'WI-APP-2026-6622',
    userId: 'seed-user-4',
    userName: 'Pooja Iyer',
    accountNumber: '100065432198',
    phone: '9833445566',
    productType: 'WEALTH_SIP',
    title: 'SBI Bluechip Growth Direct Plan',
    cover: '₹2,500 / month',
    premium: 'Monthly SIP (Direct Plan)',
    status: 'PENDING',
    appliedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Helper to notify all listening components
const notifyUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fin_approvals_updated'));
  }
};

// ==========================================
// 1. CREDIT CARD APPLICATIONS
// ==========================================
export const getCreditCardApplications = () => {
  const raw = localStorage.getItem('fin_admin_card_applications');
  if (!raw) {
    localStorage.setItem('fin_admin_card_applications', JSON.stringify(SEED_CARDS));
    return SEED_CARDS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return SEED_CARDS;
  }
};

export const getUserCreditCardApplication = (userId) => {
  if (!userId) return null;
  const list = getCreditCardApplications();
  return list.find((a) => String(a.userId) === String(userId)) || null;
};

export const submitCreditCardApplication = (data) => {
  const list = getCreditCardApplications();
  const id = `CC-APP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const newApp = {
    id,
    userId: data.userId,
    userName: data.userName || 'Customer',
    accountNumber: data.accountNumber || '100028491823',
    phone: data.phone || '9876543210',
    cardName: 'FIN Millennia Credit Card',
    requestedLimit: data.requestedLimit || 150000,
    employmentType: data.employmentType || 'SALARIED',
    annualIncome: data.annualIncome || '800000',
    address: data.address || 'Address on record',
    status: 'PENDING',
    appliedAt: new Date().toISOString()
  };

  const filtered = list.filter((a) => String(a.userId) !== String(data.userId));
  const updated = [newApp, ...filtered];
  localStorage.setItem('fin_admin_card_applications', JSON.stringify(updated));
  notifyUpdate();
  return newApp;
};

export const approveCreditCardApplication = (appId) => {
  const list = getCreditCardApplications();
  let approvedApp = null;
  const updated = list.map((a) => {
    if (a.id === appId) {
      approvedApp = { ...a, status: 'APPROVED', approvedAt: new Date().toISOString() };
      return approvedApp;
    }
    return a;
  });

  localStorage.setItem('fin_admin_card_applications', JSON.stringify(updated));
  if (approvedApp?.userId) {
    localStorage.setItem(`fin_credit_card_active_${approvedApp.userId}`, 'true');
  }
  notifyUpdate();
  return approvedApp;
};

export const rejectCreditCardApplication = (appId, reason = 'Criteria not met') => {
  const list = getCreditCardApplications();
  const updated = list.map((a) => {
    if (a.id === appId) {
      return { ...a, status: 'REJECTED', rejectReason: reason, rejectedAt: new Date().toISOString() };
    }
    return a;
  });
  localStorage.setItem('fin_admin_card_applications', JSON.stringify(updated));
  notifyUpdate();
};

// ==========================================
// 2. LOAN APPLICATIONS
// ==========================================
export const getLoanApplications = () => {
  const raw = localStorage.getItem('fin_admin_loan_applications');
  if (!raw) {
    localStorage.setItem('fin_admin_loan_applications', JSON.stringify(SEED_LOANS));
    return SEED_LOANS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return SEED_LOANS;
  }
};

export const getUserLoanApplication = (userId) => {
  if (!userId) return null;
  const list = getLoanApplications();
  return list.find((a) => String(a.userId) === String(userId)) || null;
};

export const submitLoanApplication = (data) => {
  const list = getLoanApplications();
  const id = `LN-APP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const newApp = {
    id,
    userId: data.userId,
    userName: data.userName || 'Customer',
    accountNumber: data.accountNumber || '100028491823',
    phone: data.phone || '9876543210',
    amount: data.amount,
    tenureMonths: data.tenureMonths,
    emi: data.emi,
    annualRate: data.annualRate || 10.49,
    purpose: data.purpose || 'Personal Use',
    status: 'PENDING',
    appliedAt: new Date().toISOString()
  };

  const filtered = list.filter((a) => String(a.userId) !== String(data.userId));
  const updated = [newApp, ...filtered];
  localStorage.setItem('fin_admin_loan_applications', JSON.stringify(updated));
  notifyUpdate();
  return newApp;
};

export const approveLoanApplication = (appId) => {
  const list = getLoanApplications();
  let approvedApp = null;
  const updated = list.map((a) => {
    if (a.id === appId) {
      approvedApp = {
        ...a,
        status: 'APPROVED',
        disbursed: true,
        loanAccountNumber: `LN-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        approvedAt: new Date().toISOString()
      };
      return approvedApp;
    }
    return a;
  });

  localStorage.setItem('fin_admin_loan_applications', JSON.stringify(updated));
  notifyUpdate();
  return approvedApp;
};

export const rejectLoanApplication = (appId, reason = 'Bureau debt-to-income threshold exceeded') => {
  const list = getLoanApplications();
  const updated = list.map((a) => {
    if (a.id === appId) {
      return { ...a, status: 'REJECTED', rejectReason: reason, rejectedAt: new Date().toISOString() };
    }
    return a;
  });
  localStorage.setItem('fin_admin_loan_applications', JSON.stringify(updated));
  notifyUpdate();
};

// ==========================================
// 3. WEALTH & INSURANCE APPLICATIONS
// ==========================================
export const getWealthInsuranceApplications = () => {
  const raw = localStorage.getItem('fin_admin_wealth_applications');
  if (!raw) {
    localStorage.setItem('fin_admin_wealth_applications', JSON.stringify(SEED_WEALTH));
    return SEED_WEALTH;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return SEED_WEALTH;
  }
};

export const getUserWealthInsuranceApplications = (userId) => {
  if (!userId) return [];
  const list = getWealthInsuranceApplications();
  return list.filter((a) => String(a.userId) === String(userId));
};

export const submitWealthInsuranceApplication = (data) => {
  const list = getWealthInsuranceApplications();
  const id = `WI-APP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const newApp = {
    id,
    userId: data.userId,
    userName: data.userName || 'Customer',
    accountNumber: data.accountNumber || '100028491823',
    phone: data.phone || '9876543210',
    productType: data.productType, // 'WEALTH_SIP' or 'INSURANCE'
    title: data.title,
    cover: data.cover,
    premium: data.premium,
    status: 'PENDING',
    appliedAt: new Date().toISOString()
  };

  const updated = [newApp, ...list];
  localStorage.setItem('fin_admin_wealth_applications', JSON.stringify(updated));
  notifyUpdate();
  return newApp;
};

export const approveWealthInsuranceApplication = (appId) => {
  const list = getWealthInsuranceApplications();
  let approvedApp = null;
  const updated = list.map((a) => {
    if (a.id === appId) {
      approvedApp = {
        ...a,
        status: 'APPROVED',
        folioOrPolicyNumber: a.productType === 'WEALTH_SIP'
          ? `FIN-MF-${Math.floor(10000000 + Math.random() * 90000000)}`
          : `POL-FIN-${Math.floor(1000000 + Math.random() * 9000000)}`,
        approvedAt: new Date().toISOString()
      };
      return approvedApp;
    }
    return a;
  });

  localStorage.setItem('fin_admin_wealth_applications', JSON.stringify(updated));
  notifyUpdate();
  return approvedApp;
};

export const rejectWealthInsuranceApplication = (appId, reason = 'Underwriting parameters not matched') => {
  const list = getWealthInsuranceApplications();
  const updated = list.map((a) => {
    if (a.id === appId) {
      return { ...a, status: 'REJECTED', rejectReason: reason, rejectedAt: new Date().toISOString() };
    }
    return a;
  });
  localStorage.setItem('fin_admin_wealth_applications', JSON.stringify(updated));
  notifyUpdate();
};

// Summary metrics of pending applications
export const getPendingApplicationsCount = () => {
  const cards = getCreditCardApplications().filter((a) => a.status === 'PENDING').length;
  const loans = getLoanApplications().filter((a) => a.status === 'PENDING').length;
  const wealth = getWealthInsuranceApplications().filter((a) => a.status === 'PENDING').length;
  return {
    cards,
    loans,
    wealth,
    total: cards + loans + wealth
  };
};
