# FIN - Digital Banking Platform

A full-stack, enterprise-grade digital banking simulation platform built with Spring Boot, React, and PostgreSQL.

---

## 1. Overview

FIN is a digital banking platform that replicates the core architecture and features of modern retail and commercial banking systems. It provides a dual-portal ecosystem:

- **Customer Banking Portal**: Daily financial management, fund transfers, bill settlements, card management, financial product simulations, spending analytics, and AI-assisted support.
- **Admin Operations Console**: Banking operations oversight, customer relationship management (CIF inquiry), anti-money laundering (AML) inquiry, and system-wide security auditing.

The application adheres to clean architecture principles, utilizing a decoupled client-server structure with stateless JWT authentication, double-entry ledger bookkeeping, and responsive user interfaces.

---

## 2. System Architecture

The application is structured into three decoupled layers: presentation, application services, and persistence.

```
+-------------------------------------------------------------------------+
|                              Client Layer                               |
|   React 19 SPA (Vite, Tailwind CSS 4, Lucide Icons, Context API)        |
+------------------------------------┬------------------------------------+
                                     │ HTTPS / REST (JSON) + JWT
                                     ▼
+-------------------------------------------------------------------------+
|                    Application Service Layer (Spring Boot 3.3)          |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   | Security Filter Chain (JWT Authentication, CORS, RBAC)          |   |
|   +--------------------------------┬--------------------------------+   |
|                                    ▼                                    |
|   +-----------------------------------------------------------------+   |
|   | REST Controllers (Auth, Accounts, Transfers, Cards, Admin, AI)  |   |
|   +--------------------------------┬--------------------------------+   |
|                                    ▼                                    |
|   +-----------------------------------------------------------------+   |
|   | Business Services (Ledger Engine, Validation, Audit, AI Chat)   |   |
|   +--------------------------------┬--------------------------------+   |
|                                    ▼                                    |
|   +-----------------------------------------------------------------+   |
|   | Persistence Repositories (Spring Data JPA / Hibernate ORM)      |   |
|   +-----------------------------------------------------------------+   |
+------------------------------------┬------------------------------------+
                                     │ JDBC / TLS
                                     ▼
+-------------------------------------------------------------------------+
|                           Persistence Layer                             |
|   PostgreSQL / Embedded H2 (Relational Ledger, ACID Transactions, Logs) |
+-------------------------------------------------------------------------+
```

### Layer Descriptions

- **Presentation Layer (Frontend)**: React single-page application handling routing, authentication state, real-time validations, and interactive components.
- **Application Layer (Backend)**: Spring Boot REST API orchestrating business rules, access control, transaction boundaries, and integrations.
- **Persistence Layer (Database)**: Relational storage enforcing referential integrity, unique constraints, and ACID guarantees for financial transactions.

---

## 3. Security and Authentication Architecture

Security is designed around stateless token authentication and role-based access control.

### Authentication Lifecycle

1. **User Authentication**: Client submits credentials to `/api/auth/login`.
2. **Password Verification**: Passwords are validated using BCrypt salted hashing (`BCryptPasswordEncoder`).
3. **Token Generation**: Upon verification, the backend issues an HMAC-SHA256 signed JSON Web Token (JWT). The token payload contains user identity and assigned roles (`ROLE_CUSTOMER` or `ROLE_ADMIN`).
4. **Stateless Authorization**: Client transmits the token via the HTTP `Authorization: Bearer <token>` header on subsequent requests.
5. **Request Interception**: `JwtAuthenticationFilter` validates token integrity and expiry on each incoming request, establishing the Spring Security context.
6. **Role-Based Access Control (RBAC)**:
   - Public access: Authentication endpoints (`/api/auth/**`), OpenAPI documentation (`/swagger-ui/**`, `/api-docs/**`), and support endpoints (`/api/support/**`).
   - Customer access: Account management, transfers, bill payments, and cards.
   - Administrator access: Management and audit endpoints (`/api/admin/**`) restricted to `ROLE_ADMIN`.

---

## 4. Domain Models and Database Schema

The database schema utilizes relational constraints, composite checks, and automated entity lifecycle hooks (`@PrePersist`, `@PreUpdate`).

### Core Entities

- **User (`users`)**: Represents customers and administrative personnel. Attributes include username, BCrypt-hashed password, legal full name, verified email, phone number, address, role reference, and account status (`ACTIVE`, `SUSPENDED`, `CLOSED`).
- **Account (`accounts`)**: Financial balance holder. Contains unique 12-digit account number, account category (`SAVINGS`, `CURRENT`, `SALARY`), monetary balance with fixed precision, currency (`INR`), and operational state.
- **Transaction (`transactions`)**: Immutable record of fund movements. Contains a UUID primary key, account reference, unique reference number (UTR), debit/credit classification, category (`TRANSFER`, `BILL_PAYMENT`, `RECHARGE`, `DEPOSIT`), status (`SUCCESS`, `PENDING`, `FAILED`, `REVERSED`), description, counterparty details, and paired transaction link.
- **Card (`cards`)**: Virtual debit and credit cards with masked card numbers, expiry dates, CVVs, card networks (`VISA`, `MASTERCARD`, `RUPAY`), operational limits, and security toggles.
- **Beneficiary (`beneficiaries`)**: Saved counterparty profiles containing payee names, account numbers, IFSC codes, bank names, and contact details.
- **Bill & BillProvider (`bills`, `bill_providers`, `recharge_plans`)**: Catalog of utility providers and mobile recharge packages with automated balance deduction.
- **AuditLog (`audit_logs`)**: Non-repudiation audit ledger capturing user identity, action type, entity references, IP addresses, execution status, and timestamps.
- **Notification (`notifications`)**: In-app notification queue for transaction alerts and security warnings.

---

## 5. System Capabilities and Features

### Customer Banking Portal

- **Account Dashboard**: Live balance overview, account credentials, recent transaction ledger, and summary metrics for monthly income and expenditure.
- **Fund Transfers and UPI Engine**:
  - Direct account-to-account transfers via Account Number and IFSC.
  - Mobile phone lookup for instant peer-to-peer UPI transfers.
  - Double-entry ledger mechanism: atomically debits sender and credits recipient within a single database transaction.
  - 4-digit transaction PIN verification prior to execution.
- **Beneficiary Management**: Directory of saved payees with validation on account formats and routing codes.
- **Bill Payments and Telecom Recharges**: Integrated payment channels for electricity, water, piped gas, broadband, DTH, and prepaid mobile top-ups.
- **Card Controls and Security**:
  - Virtual card viewer with flip animations.
  - One-click freeze/unfreeze mechanism for lost or stolen cards.
  - Individual channel controls for online commerce, contactless (NFC), and international transactions.
  - Adjustable daily transaction spending limits.
- **Financial Products Hub**:
  - CIBIL Credit Score Simulator (evaluating payment history, credit utilization, age, and inquiries).
  - Fixed Deposit (FD) Center with compounding interest projections (up to 7.25% p.a.).
  - Instant Pre-Approved Personal Loan calculator with tenure and EMI simulation.
  - Wealth and SIP investment planning tools.
  - Insurance overview center.
- **Spending Analytics**: Breakdown of monthly expenditures categorized by transfers, bills, shopping, food, and utilities.
- **KYC Verification**: Three-tier identity verification module (Aadhaar, PAN, and mobile verification).
- **Dual-Engine Customer Support Chat**:
  - Cloud AI mode powered by LLM APIs (Google Gemini or OpenAI).
  - Offline fallback mode using an internal grounded natural language matcher to answer banking questions without external dependencies.

### Admin Operations Console

- **Operations Hub**: High-level telemetry displaying total customers, active accounts, daily transaction counters, and aggregate volume.
- **Customer CIF (Customer Information File) Inquiry**: Search engine to look up users by Account Number, Username/CIF, Mobile Number, PAN, or Email. Displays a 360-degree view of accounts, issued cards, and historical ledgers.
- **Clearing and AML (Anti-Money Laundering) Inquiry**: Audit and tracking tool for financial transactions across all accounts, searchable by UTR, account, or username.
- **Security Audit Trail**: System-wide event log recording user logins, administrative modifications, transaction failures, and permission changes.

---

## 6. End-to-End Transfer Transaction Lifecycle

1. **Initiation**: Customer submits recipient information, amount, and transaction PIN through the transfer interface.
2. **Client Validation**: Frontend checks input formats and ensures the transfer amount is positive.
3. **Transport**: Authenticated HTTPS request dispatched to `/api/transactions/transfer` with bearer token.
4. **Security Filter**: `JwtAuthenticationFilter` validates token authenticity and sets user principal.
5. **Business Validation**:
   - Sender account verified as active.
   - Balance evaluated to prevent overdraft.
   - Recipient identified via account or phone lookup.
   - Self-transfer loop restrictions validated.
6. **Ledger Execution**:
   - Under a `@Transactional` boundary, sender balance is decremented and recipient balance is incremented.
   - Paired `DEBIT` and `CREDIT` transaction records are generated with a shared UTR.
7. **Audit and Notification**:
   - Audit service appends an entry to the compliance ledger.
   - In-app notification entities generated for involved parties.
8. **Confirmation**: Transaction response returned to the client, updating UI balance and ledger views.

---

## 7. Technology Stack

| Layer | Component | Details |
|---|---|---|
| **Frontend** | Framework | React 19 (SPA) |
| | Build Tool | Vite 8 |
| | Styling | Tailwind CSS 4 |
| | Routing | React Router 7 |
| | Icons | Lucide React |
| | HTTP Client | Axios with JWT Interceptors |
| **Backend** | Framework | Spring Boot 3.3 |
| | Language | Java 20 / 21 |
| | Security | Spring Security, JJWT (0.12.5) |
| | Persistence | Spring Data JPA, Hibernate 6 |
| | API Docs | SpringDoc OpenAPI 3 (Swagger UI) |
| | Utilities | Lombok, Jakarta Validation |
| **Database** | Production | PostgreSQL 16 |
| | Development | Embedded H2 In-Memory Database |
| **AI Support** | Engine | Google Gemini API / OpenAI API / Local Matcher |

---

## 8. REST API Reference

Interactive API documentation is available via Swagger UI at `/swagger-ui.html`.

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new customer profile |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT token |
| `GET` | `/api/accounts/primary` | Customer | Fetch primary account details and balance |
| `POST` | `/api/accounts/deposit` | Customer | Simulate funds deposit into savings account |
| `POST` | `/api/transactions/transfer` | Customer | Execute account or UPI fund transfer |
| `GET` | `/api/transactions/history` | Customer | Retrieve paginated transaction ledger |
| `GET` | `/api/beneficiaries` | Customer | List saved beneficiaries |
| `POST` | `/api/beneficiaries` | Customer | Save a new beneficiary |
| `GET` | `/api/cards` | Customer | Retrieve issued debit and credit cards |
| `POST` | `/api/cards/{cardId}/toggle-freeze` | Customer | Freeze or unfreeze a virtual card |
| `POST` | `/api/bills/pay` | Customer | Execute utility bill or recharge payment |
| `POST` | `/api/support/chat` | Public | Interact with the AI support assistant |
| `GET` | `/api/admin/metrics` | Admin | Aggregate system-wide operational metrics |
| `POST` | `/api/admin/customer-inquiry` | Admin | Execute comprehensive CIF customer lookup |
| `POST` | `/api/admin/transaction-inquiry` | Admin | Search system-wide clearing and AML records |
| `GET` | `/api/admin/audit-logs` | Admin | Retrieve security audit trail events |

---

## 9. License

This project is open source and available under the terms of the [MIT License](LICENSE).
