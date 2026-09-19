# FIN - Digital Banking Platform

A secure, modern digital banking web application built on the Java Full Stack with Spring Boot and React. FIN is fully responsive across all devices, including mobile phones, tablets, and desktops.

---

## What is FIN?

FIN is a digital banking platform designed for both customers and bank staff. It provides an intuitive online banking experience with instant transfers, card controls, loan applications, and admin approval workflows.

- **Customer Banking**: Check account balances, transfer money, pay utility bills, control debit cards, apply for credit cards, explore loans, and get instant answers from the AI support assistant.
- **Bank Administration**: Search customers, review transactions, verify KYC identity documents, approve credit cards and loans, view security audit logs, and assist customers.

---

## Key Features

### For Customers

- **Responsive Design**: Works on any device — mobile phones, tablets, laptops, and desktops.
- **Account Overview**: Check your savings account balance, account number, IFSC code, and transaction history.
- **Money Transfers**:
  - Instant inter-bank transfers using Account Number and IFSC.
  - Quick transfers to registered phone numbers via UPI.
  - Protected with a 4-digit transfer PIN.
- **Debit & Credit Cards**:
  - Manage your virtual Platinum Debit Card.
  - Freeze or unfreeze cards instantly with one tap.
  - Toggle online payments, contactless tap-and-pay, and international usage.
  - Apply for the FIN Millennia Credit Card (reviewed and approved by bank staff).
- **Bill Payments & Mobile Recharge**:
  - Pay electricity, water, gas, and broadband bills.
  - Recharge prepaid mobile numbers with popular talktime and data packs.
- **Loans, Deposits & Insurance**:
  - Open high-yield Fixed Deposits with an interactive interest calculator.
  - Apply for instant personal loans (reviewed and approved by bank staff).
  - Apply for mutual fund SIP investments and family insurance policies.
  - Track your real-time CIBIL credit health score.
- **Digital KYC Verification**:
  - 3-step digital KYC verification with PAN, Aadhaar OTP, and live Video KYC scan.
  - Full Tier-3 verification unlocks unlimited transaction and card limits.
- **24/7 AI Banking Assistant**:
  - Built-in smart assistant to answer questions about transfers, KYC, cards, deposits, and account security.
  - Built with strict banking privacy guards: never shows passwords, PINs, or private balances in chat transcripts.

### For Bank Administrators

- **Dashboard Overview**: Monitor total customers, active accounts, daily transaction totals, and system health.
- **Customer Search**: Find any customer account by Account Number, Phone Number, Email, or Username.
- **Transaction Search**: Lookup transactions using Reference Number (UTR) or Account Number.
- **Bank Approvals Queue**:
  - **KYC Approvals**: Review customer identity documents and approve or reject submissions.
  - **Credit Card Approvals**: Review customer employment, annual income, and approve credit cards.
  - **Loan Approvals**: Review personal loan applications and approve money disbursals.
  - **Wealth & Insurance**: Review and issue digital insurance policies and SIP investments.
- **Security Audit Logs**: Automatically tracks administrative searches, customer edits, and system actions.

---

## Technology Stack

- **Backend**: Java 20, Spring Boot 3, Spring Security 6 (JWT Bearer tokens), Spring Data JPA, Hibernate 6
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Axios
- **Database**: H2 In-Memory Database (Development) / MySQL / PostgreSQL
- **Testing**: JUnit 5, Mockito, Spring Boot Test

---

## Getting Started Locally

### Prerequisites

- Java 17 or higher
- Maven 3.8+
- Node.js 18+ and npm

### 1. Run the Backend

```bash
cd backend
mvn clean spring-boot:run
```

The backend server starts at `http://localhost:8080`.

### 2. Run the Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The web application opens at `http://localhost:5173`.

---

## License

This project is open source and available under the [MIT License](LICENSE).
