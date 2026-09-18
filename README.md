<div align="center">

# 🏦 FIN - Digital Banking

**A modern, full-stack digital banking platform built with Spring Boot & React**

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📋 Overview

**FIN** is a production-grade digital banking platform that simulates a complete banking ecosystem — from customer-facing dashboards to administrative operations consoles. Built with a modern enterprise stack (Spring Boot 3 + React 19 + Tailwind CSS 4), it showcases clean architecture, JWT-based security, real-time analytics, and a premium banking UI inspired by HDFC, ICICI, and SBI digital experiences.

> **Note:** This application simulates banking operations. All balances, transactions, and financial products are processed within the application environment.

---

## ✨ Features

### 🏠 Customer Portal

| Feature | Description |
|---|---|
| **Account Dashboard** | Real-time balance display, income/expense summaries, spending category analytics, and recent transaction feed |
| **UPI & Bank Transfers** | Send money via UPI (phone number lookup) or direct bank account transfers with 4-digit UPI PIN verification |
| **Beneficiary Management** | Add, search, and manage saved payees — integrated directly within the Transfers module |
| **Bill Payments** | Pay electricity, water, gas, broadband, DTH, and mobile recharge with real-time balance deduction |
| **Debit & Credit Cards** | Virtual card display, freeze/unfreeze toggle, contactless/international/online shopping controls |
| **Financial Products Hub** | CIBIL credit health report (785/900 gauge), Fixed Deposits (7.25% p.a. calculator), Pre-Approved Loans (₹5L instant disbursal), Wealth & SIPs, Insurance |
| **Spending Analytics** | Monthly income vs expense breakdown, category-wise spend analysis |
| **Transaction History** | Full ledger with filters by type (credit/debit), category, and date range |
| **AI Chatbot** | 24/7 customer support powered by Google Gemini or OpenAI with grounded banking knowledge |
| **KYC Verification** | Tier 3 Full KYC verification status with Aadhaar, PAN, and mobile verification |
| **Deposit / Receive Money** | Add funds to savings account via multiple methods (UPI, NEFT, cash) |

### 🔐 Admin Portal

| Feature | Description |
|---|---|
| **Operations Hub** | Real-time KPIs — total customers, accounts, transaction volume, system revenue |
| **Customer CIF Inquiry** | Search customers by Account Number, Username/CIF, Mobile, PAN, or Email — view full profile, accounts, cards, and transaction history |
| **Clearing & AML Inquiry** | Look up any transaction by UTR/Reference, Account, or Username — complete audit trail |
| **Security & Audit Trail** | System-wide security event log with chronological audit entries |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS 4, Vite 8, React Router 7, Lucide Icons, Axios |
| **Backend** | Spring Boot 3.3, Spring Security, Spring Data JPA, JWT (JJWT 0.12.5) |
| **Database** | H2 (development) / PostgreSQL 16 (production) |
| **AI Chatbot** | Google Gemini API / OpenAI API (auto-fallback to local grounded matcher) |
| **Containerization** | Docker & Docker Compose (multi-stage builds) |
| **API Docs** | SpringDoc OpenAPI 3 (Swagger UI) |

---

## 🚀 Getting Started

### Prerequisites

- **Java 20+** (JDK)
- **Maven 3.9+**
- **Node.js 18+** & **npm 9+**
- **PostgreSQL 14+** (for production) or use the embedded H2 database for local development
- **Docker & Docker Compose** (optional, for containerized deployment)

### Option 1: Local Development (H2 In-Memory Database)

This is the fastest way to get up and running. No external database required.

```bash
# 1. Clone the repository
git clone https://github.com/Vtsrinivas07/Online-Banking-System.git
cd Online-Banking-System

# 2. Start the Spring Boot Backend (uses H2 by default)
cd backend
mvn spring-boot:run
# Backend starts at http://localhost:8080

# 3. Start the React Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev
# Frontend starts at http://localhost:5173
```

### Option 2: Local Development with PostgreSQL

```bash
# 1. Create a PostgreSQL database
psql -U postgres -c "CREATE DATABASE bankdb;"

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Start the Backend with 'prod' profile
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=prod \
  -Dspring-boot.run.arguments="--spring.datasource.url=jdbc:postgresql://localhost:5432/bankdb --spring.datasource.username=postgres --spring.datasource.password=YOUR_PASSWORD"

# 4. Start the Frontend
cd ../frontend
npm install
npm run dev
```

### Option 3: Docker Compose (Full Stack)

```bash
# 1. Clone and configure
git clone https://github.com/Vtsrinivas07/Online-Banking-System.git
cd Online-Banking-System
cp .env.example .env
# Edit .env if needed

# 2. Build and start all services
docker-compose up --build -d

# Services:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:8080
#   PostgreSQL → localhost:5432
```

---

## 🌐 Deployment Guide

### Deploy Backend to Render (Free Tier)

1. **Create a PostgreSQL Database** on [Render](https://render.com) or [Neon](https://neon.tech) or [Supabase](https://supabase.com):
   - Copy the **External Database URL** (e.g., `jdbc:postgresql://host:5432/bankdb`)

2. **Create a Web Service** on Render:
   - Connect your GitHub repository
   - **Root Directory:** `backend`
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/online-banking-backend-1.0.0.jar`
   - **Environment Variables:**
     ```
     SPRING_PROFILES_ACTIVE=prod
     SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<db>
     SPRING_DATASOURCE_USERNAME=<username>
     SPRING_DATASOURCE_PASSWORD=<password>
     APP_JWT_SECRET=<your-256-bit-hex-secret>
     GEMINI_API_KEY=<your-gemini-api-key>  (optional)
     ```

### Deploy Frontend to Vercel / Netlify

1. **Connect your GitHub repository**
2. **Configuration:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variable:**
     ```
     VITE_API_URL=https://your-backend-url.onrender.com/api
     ```
3. **Routing:** Add a redirect rule for SPA:
   - **Vercel:** Create `frontend/vercel.json`:
     ```json
     { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
     ```
   - **Netlify:** Create `frontend/public/_redirects`:
     ```
     /* /index.html 200
     ```

### Deploy with Docker Compose (VPS / Cloud VM)

```bash
# On your server (Ubuntu/Debian)
git clone https://github.com/Vtsrinivas07/Online-Banking-System.git
cd Online-Banking-System

# Configure environment
cp .env.example .env
nano .env  # Set production database credentials, JWT secret, API keys

# Build and run
docker-compose up --build -d

# Your app is now running:
#   Frontend → http://your-server-ip:3000
#   Backend  → http://your-server-ip:8080
```

---

## 📁 Project Structure

```
Online-Banking-System/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/bank/
│   │   ├── config/                   # Security, CORS, JWT configuration
│   │   ├── controller/               # REST API endpoints
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── entity/                   # JPA entity models
│   │   ├── repository/               # Spring Data repositories
│   │   └── service/                  # Business logic services
│   ├── src/main/resources/
│   │   ├── application.yml           # Core configuration
│   │   ├── application-dev.yml       # H2 development profile
│   │   └── application-prod.yml      # PostgreSQL production profile
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── common/               # CibilGaugeChart, SupportChat
│   │   │   └── layout/               # Layout, Sidebar, Header
│   │   ├── context/                  # AuthContext (JWT state)
│   │   ├── pages/
│   │   │   ├── auth/                 # Login, Register
│   │   │   ├── customer/             # Dashboard, Transfers, Cards, etc.
│   │   │   └── admin/                # AdminDashboard
│   │   ├── services/                 # Axios API client
│   │   └── App.jsx                   # Route definitions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml                # Full-stack orchestration
├── .env.example                      # Environment template
└── README.md
```

---

## 🔑 API Documentation

Once the backend is running, access the interactive Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

### Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive JWT token |
| `POST` | `/api/auth/register` | Register a new customer account |
| `GET` | `/api/accounts/primary` | Get primary account details |
| `POST` | `/api/accounts/deposit` | Deposit funds into account |
| `POST` | `/api/transactions/transfer` | Execute fund transfer |
| `GET` | `/api/transactions/history` | Get transaction history |
| `GET` | `/api/beneficiaries` | List saved beneficiaries |
| `POST` | `/api/beneficiaries` | Add new beneficiary |
| `GET` | `/api/cards` | Get linked debit/credit cards |
| `POST` | `/api/bills/pay` | Pay a utility bill |
| `POST` | `/api/support/chat` | AI chatbot conversation |
| `GET` | `/api/admin/users` | Admin: List all customers |
| `GET` | `/api/admin/transactions` | Admin: View all transactions |

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` (H2) or `prod` (PostgreSQL) | `dev` |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL | — |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `postgres` |
| `APP_JWT_SECRET` | 256-bit hex secret for JWT signing | Built-in default |
| `AI_PROVIDER` | AI chatbot provider (`auto`/`gemini`/`openai`) | `auto` |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `VITE_API_URL` | Backend API URL for frontend | `http://localhost:8080/api` |

---

## 🧰 Development Commands

```bash
# Backend
cd backend
mvn spring-boot:run              # Start dev server (H2)
mvn clean package -DskipTests    # Build production JAR
mvn test                         # Run unit tests

# Frontend
cd frontend
npm run dev                      # Start Vite dev server
npm run build                    # Production build
npm run preview                  # Preview production build
npm run lint                     # Run linter
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Srinivas Vuriti](https://github.com/Vtsrinivas07)**

</div>
