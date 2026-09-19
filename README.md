# FIN - Digital Banking Platform

A modern digital banking web application built with Spring Boot and React.

---

## What is FIN?

FIN is an online banking platform that provides a complete, secure, and easy-to-use banking experience for both customers and bank staff.

- **Customer Portal**: Manage your bank account, send money instantly, pay utility bills, control your debit card, apply for credit cards, and explore loans.
- **Admin Portal**: Search customers, review transactions, approve KYC applications, view audit logs, and respond to customer support inquiries.

---

## Key Features

### For Customers

- **Account Dashboard**: View your account balance, account number, IFSC code, and recent transactions.
- **Money Transfers**:
  - Send money instantly to any bank account using Account Number and IFSC.
  - Send money directly to phone numbers via UPI.
  - Set a 4-digit PIN to keep all transfers secure.
- **Debit & Credit Cards**:
  - View your virtual Platinum Debit Card.
  - Lock or unlock your card anytime with one click.
  - Turn online shopping, tap-and-pay (NFC), and international usage on or off.
  - Apply for the FIN Millennia Credit Card (reviewed and approved by bank staff).
- **Bill Payments & Mobile Recharge**:
  - Pay electricity, water, gas, broadband, and DTH bills.
  - Recharge prepaid mobile numbers with popular talktime and data packs.
- **Savings, Loans & Insurance**:
  - Open Fixed Deposits and calculate your interest earnings.
  - Apply for instant personal loans (approved and disbursed by bank staff).
  - Apply for mutual fund SIP investments and family insurance policies.
  - Check your credit score with simple score tips.
- **Digital KYC Verification**:
  - Simple 3-step KYC verification using Aadhaar, PAN, and Video KYC.
  - Required for account holders (18+ only) to unlock money transfers and credit cards.
- **24/7 Support Assistant**:
  - Built-in AI assistant to answer banking questions anytime.

### For Bank Administrators

- **Operations Overview**: View total customers, active accounts, daily transfer volume, and system status.
- **Customer Search**: Search any customer quickly using their Account Number, Phone Number, Email, or Username.
- **Transaction Search**: Find transfer details using a Reference Number (UTR) or Account Number.
- **Bank Approvals Queue**:
  - **KYC Verification**: Review pending customer KYC documents and approve or reject them.
  - **Credit Card Approvals**: Review customer employment, income, and approve credit cards.
  - **Loan Approvals**: Review personal loan requests and approve direct money disbursals.
  - **Wealth & Insurance**: Review and issue digital insurance policies and SIP investments.
- **Security Audit Logs**: Automatically records administrative searches, account updates, and logins.
- **Customer Support Desk**: Review incoming customer questions and send official bank replies directly.

---

## Technology Used

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Java, Spring Boot, Spring Security (JWT authentication)
- **Database**: PostgreSQL / H2 In-Memory Database
- **API Documentation**: Swagger UI (OpenAPI)

---

## How It Works

1. **Sign Up**: A new user creates an account with their full name, email, phone, and date of birth (must be 18+).
2. **KYC Verification**: The customer completes their Aadhaar, PAN, and Video KYC submission.
3. **Admin Review**: Bank staff review and approve the customer's KYC in the Admin Portal.
4. **Active Banking & Financial Products**: Once approved, the customer can transfer money and pay bills. When customers apply for credit cards, loans, or insurance, the bank administrator reviews and approves each product before activation.

---

## License

This project is licensed under the MIT License.
