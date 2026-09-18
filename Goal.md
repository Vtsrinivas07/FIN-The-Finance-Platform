You are the lead product engineer, senior Java full-stack developer, UI/UX designer, security engineer, QA engineer, and technical architect for this project.

I have an existing GitHub project called:

"Online Banking System"

Repository:
[https://github.com/Vtsrinivas07/Online-Banking-System](https://github.com/Vtsrinivas07/Online-Banking-System)

First inspect the existing repository completely.

IMPORTANT:

- Do NOT immediately rewrite or delete the existing project.
- First understand the current architecture, functionality, data models, business logic, and limitations.
- Preserve useful existing functionality where practical.
- Create a modernization plan before making major changes.
- Work incrementally.
- After every major feature, run/build/test the application and fix errors before proceeding.
- Never silently invent APIs, dependencies, credentials, environment variables, database schemas, or business rules.
- Never claim a feature is implemented until it actually works.
- Keep the application runnable throughout development.
- Use Git commits after each stable milestone.

==================================================

1. # PRODUCT GOAL

Transform the existing Online Banking System into a polished, production-style educational/demo digital banking platform.

The result should demonstrate strong:

- Java
- Spring Boot
- Spring Security
- JWT
- REST APIs
- PostgreSQL
- JPA/Hibernate
- React
- API integration
- validation
- exception handling
- testing
- API documentation
- Docker
- responsive UI
- accessibility
- secure software practices
- clean architecture
- SDLC practices

This is a DEMO/EDUCATIONAL banking application.

Do NOT represent it as a real banking product.
Do NOT implement real financial transactions.
All money movement is simulated inside the application.

# ================================================== 2. UI/UX RESEARCH REFERENCES

Use the following products as UX inspiration and research references:

Indian banking:

- IDFC FIRST Bank
- Axis Bank
- IndusInd Bank
- HDFC Bank
- ICICI iMobile Pay
- YONO SBI
- Canara ai1
- Kotak Bank
- Bank of Baroda bob World
- PNB ONE
- HSBC India
- Union ease
- IOB Connect

International banking / fintech / payments:

- J.P. Morgan
- PayPal
- Google Pay
- PhonePe
- Paytm
- Navi
- BHIM
- Slice
- Super Money
- Wise
- CRED

IMPORTANT:
Do NOT copy their exact UI.
Do NOT copy logos, proprietary graphics, text, screenshots, illustrations, icons, or branded assets.
Do NOT reproduce their exact screen layouts.
Do NOT imitate one specific app pixel-for-pixel.

Instead extract general UX patterns:

- information hierarchy
- navigation patterns
- placement of important actions
- card-based dashboards
- quick actions
- search
- transaction history
- payment flows
- bottom navigation concepts
- contextual actions
- account summaries
- security indicators
- notification patterns
- support/chat access
- personalization
- accessibility
- minimal-step workflows
- confirmation screens
- empty states
- loading states
- error states
- responsive behavior

Create an ORIGINAL visual identity for this project.

# ================================================== 3. DESIGN DIRECTION

Create a premium modern fintech visual language.

Design principles:

- clean
- trustworthy
- professional
- calm
- highly readable
- minimal cognitive load
- strong information hierarchy
- generous spacing
- rounded cards
- subtle shadows
- clear typography
- accessible contrast
- responsive layouts
- consistent iconography
- polished micro-interactions

Avoid:

- excessive gradients
- excessive animations
- clutter
- giant hero sections
- unnecessary decorative graphics
- excessive glassmorphism
- copying any bank's visual identity

Create an original banking brand.

Suggested product name:

"BANK"

Use a professional logo created specifically for this project.

# ================================================== 4. TECHNOLOGY STACK

Backend:

- Java 21
- Spring Boot
- Spring Web
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- PostgreSQL
- Bean Validation
- Maven
- Lombok where genuinely useful
- Springdoc OpenAPI / Swagger

Frontend:

- React
- Vite
- JavaScript or TypeScript
- React Router
- Axios
- Tailwind CSS
- accessible reusable components

Testing:

- JUnit 5
- Mockito
- Spring Boot Test
- MockMvc

Development:

- Git
- GitHub
- Docker
- Docker Compose

Documentation:

- README
- OpenAPI/Swagger
- architecture diagram
- ER diagram
- API documentation
- setup instructions
- environment configuration documentation

# ================================================== 5. ARCHITECTURE

Use a clean layered architecture.

Backend:

controller
service
repository
entity
dto
mapper
security
exception
config
util

Do NOT expose JPA entities directly from controllers.

Use DTOs.

Use service-layer business logic.

Use repositories for persistence.

Use centralized exception handling.

Use consistent API response/error structures where appropriate.

Frontend:

components
pages
layouts
services
hooks
context
utils
types

Keep UI components reusable.

Keep API calls separated from presentation components.

# ================================================== 6. DATABASE

Use PostgreSQL.

Design the schema before implementation.

Core entities:

User
Role
Account
Beneficiary
Transaction
Bill
BillPayment
Notification
SupportFAQ
ChatSession
ChatMessage
AuditLog

Possible relationships:

User
├── Account
├── Beneficiary
├── Notification
├── AuditLog
└── ChatSession

Account
└── Transaction

Bill
└── BillPayment

ChatSession
└── ChatMessage

SupportFAQ
└── FAQ category

Use proper:

- primary keys
- foreign keys
- unique constraints
- indexes where useful
- NOT NULL constraints
- timestamps
- enum/status handling
- decimal/numeric monetary representation

NEVER use floating point types for monetary values.

Use BigDecimal in Java.

# ================================================== 7. AUTHENTICATION

Implement:

Registration
Login
Logout
JWT authentication
Password hashing
Role-based authorization

Roles:

CUSTOMER
ADMIN

Use Spring Security.

Passwords must NEVER be stored in plain text.

JWT secret must come from environment configuration.

Do not hard-code secrets.

Implement authentication error handling.

Protect all sensitive endpoints.

# ================================================== 8. CUSTOMER FEATURES

Customer dashboard:

- greeting
- available balance
- account number masked
- account type
- recent transactions
- income/expense summary
- quick actions
- upcoming bill payments
- notifications
- support access

Quick actions:

- Transfer
- Pay Bills
- Add Beneficiary
- View Transactions
- Download Statement
- Manage Account

# ================================================== 9. ACCOUNT MANAGEMENT

Implement:

- view account
- masked account number
- account type
- balance
- account status
- account opening date
- account statement
- transaction history

Never expose unnecessary sensitive information.

# ================================================== 10. FUND TRANSFER

Implement a simulated transfer workflow:

Step 1:
Select beneficiary

Step 2:
Enter amount

Step 3:
Add optional note

Step 4:
Show confirmation

Step 5:
Require explicit confirmation

Step 6:
Create simulated transaction

Step 7:
Show success/failure result

Validation:

- positive amount
- sufficient balance
- valid beneficiary
- active account
- valid transaction state

Handle failures gracefully.

Never allow a transfer through the chatbot.

# ================================================== 11. BENEFICIARY MANAGEMENT

Implement:

- add beneficiary
- view beneficiaries
- delete beneficiary
- search beneficiary
- beneficiary status

Use confirmation dialogs for destructive operations.

# ================================================== 12. TRANSACTION HISTORY

Create a highly usable transaction page.

Features:

- search
- date filter
- transaction type filter
- status filter
- amount range
- pagination
- transaction details
- download statement

Transaction states:

SUCCESS
PENDING
FAILED
REVERSED

Use clear visual indicators.

# ================================================== 13. BILL PAYMENTS

Create simulated bill payment functionality.

Categories:

- Electricity
- Mobile
- DTH
- Internet
- Water
- Gas
- Insurance
- Credit Card

Features:

- saved billers
- pay bill
- recent payments
- payment history
- reminders

# ================================================== 14. CARDS

Create a demo card-management section.

Features:

- card overview
- masked card number
- card status
- freeze/unfreeze
- spending limit display
- online transactions toggle
- contactless toggle
- international usage toggle

This is a DEMO.

Do not implement real card processing.

# ================================================== 15. SPENDING ANALYTICS

Create:

- monthly spending
- income vs expenses
- category breakdown
- recent spending
- monthly trend
- transaction categorization

Categories:

Food
Travel
Shopping
Bills
Entertainment
Healthcare
Education
Other

Use charts carefully.

Do not overcrowd the dashboard.

# ================================================== 16. SEARCH

Implement a universal application search inspired by modern banking apps.

Search across:

- transactions
- beneficiaries
- bills
- accounts
- FAQs
- navigation/actions

Examples:

"transfer money"
"electricity bill"
"transaction history"
"add beneficiary"
"forgot password"

Show useful suggestions.

# ================================================== 17. NOTIFICATIONS

Create a notification center.

Types:

- successful transfer
- failed transfer
- bill reminder
- security alert
- account update
- system notification

Allow:

- mark as read
- mark all as read
- delete notification

# ================================================== 18. SUPPORT FAQ CHATBOT

Create a floating support button in the bottom-right corner.

Desktop:

A circular support/chat button fixed to bottom-right.

Mobile:

A compact floating button that does not obstruct bottom navigation.

When clicked:

Open a polished chat panel.

Header:

"BANK Support"

Subtitle:

"How can we help?"

Provide quick FAQ chips:

- How do I transfer money?
- How do I add a beneficiary?
- My transaction failed
- How do I reset my password?
- How do I pay a bill?
- Where can I find my statement?

Create a FAQ knowledge base.

Categories:

Account
Security
Transfers
Transactions
Bills
Cards
General

# ================================================== 19. AI FAQ CHATBOT

Initially implement a deterministic FAQ retrieval system.

User question
↓
Normalize query
↓
Search FAQ knowledge base
↓
Return relevant answer

Do NOT immediately depend on an external LLM.

Then create an optional AI layer.

Architecture:

React
↓
Spring Boot
↓
FAQ retrieval
↓
Optional LLM service
↓
Grounded response

The AI assistant must ONLY answer questions based on the application's approved banking FAQ/knowledge base.

If uncertain:

"I couldn't find a reliable answer in the support knowledge base. Please contact support."

Never hallucinate banking policies.

NEVER allow the chatbot to:

- transfer money
- withdraw money
- change account security settings
- expose passwords
- expose JWTs
- expose account secrets
- execute financial operations

For financial actions, direct the user to the authenticated UI workflow.

# ================================================== 20. ADMIN DASHBOARD

Create an admin dashboard.

Metrics:

- total customers
- active accounts
- transactions today
- successful transactions
- failed transactions
- total simulated transaction volume
- pending support queries

Admin features:

- user management
- account status
- transaction monitoring
- FAQ management
- notification management
- audit log
- support knowledge management

# ================================================== 21. AUDIT LOGGING

Create an AuditLog entity.

Track important events:

LOGIN
LOGOUT
ACCOUNT_CREATED
BENEFICIARY_ADDED
TRANSFER_CREATED
TRANSFER_COMPLETED
TRANSFER_FAILED
BILL_PAYMENT
PROFILE_UPDATED
PASSWORD_CHANGED
ADMIN_ACTION

Store:

- user
- action
- timestamp
- entity
- entity ID
- status
- safe metadata

Never log passwords, JWTs, full card numbers, or other secrets.

# ================================================== 22. SECURITY

Implement:

- password hashing
- JWT authentication
- authorization
- input validation
- CORS configuration
- centralized exception handling
- secure environment variables
- no hard-coded secrets
- no sensitive logging
- safe error messages
- database constraints
- authorization checks at backend level

Remember:

Frontend security is NOT sufficient.

Every sensitive operation must be authorized by the backend.

# ================================================== 23. UI STRUCTURE

Desktop layout:

LEFT:
Persistent sidebar navigation

CENTER:
Primary content

TOP:
Search
Notifications
Profile

BOTTOM-RIGHT:
Floating support chatbot

Suggested sidebar:

Dashboard
Accounts
Payments
Transfers
Transactions
Bills
Cards
Analytics
Beneficiaries
Support
Settings

Mobile:

Use responsive navigation.

Do not simply shrink the desktop layout.

Create:

- bottom navigation
- mobile drawer
- responsive cards
- large touch targets
- mobile-friendly forms
- mobile-friendly transaction lists

# ================================================== 24. DASHBOARD LAYOUT

Create an original dashboard inspired by modern banking UX.

Top:

Greeting + profile

Then:

Account balance card

Quick Actions:

Transfer
Pay Bills
Scan & Pay
Add Beneficiary

Then:

Recent Transactions

Then:

Spending Analytics

Then:

Upcoming Bills

Then:

Financial Insights

Then:

Offers/Services only if useful

Do not overload the dashboard.

Allow users to customize/reorder quick actions if practical.

# ================================================== 25. LOGIN UI

Create a premium banking login screen.

Include:

- logo
- email/mobile field
- password
- show/hide password
- remember device option
- login
- forgot password
- registration
- security notice

Do not use fake biometric authentication.

If biometric authentication is shown, clearly mark it as a demo UI.

# ================================================== 26. RESPONSIVE DESIGN

Must work properly at:

360px
390px
414px
768px
1024px
1280px
1440px
1920px

Check:

- no horizontal overflow
- no clipped buttons
- no overlapping chatbot
- no inaccessible menus
- proper form behavior
- keyboard accessibility
- mobile touch targets

# ================================================== 27. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- focus states
- ARIA labels where needed
- accessible forms
- readable contrast
- meaningful error messages
- reduced-motion support

# ================================================== 28. LOADING / EMPTY / ERROR STATES

Every important screen must have:

Loading state
Empty state
Error state
Success state

Examples:

"No transactions yet."

"No beneficiaries found."

"Unable to load account information."

Use skeleton loading where appropriate.

# ================================================== 29. API DESIGN

Create REST APIs with:

GET
POST
PUT/PATCH
DELETE

Use appropriate HTTP status codes.

Implement:

- validation
- pagination
- filtering
- sorting
- authentication
- authorization

Document everything through Swagger/OpenAPI.

# ================================================== 30. TESTING

Do not consider the project complete without tests.

Backend:

- authentication tests
- service tests
- controller tests
- repository/integration tests where useful
- authorization tests
- transfer validation tests

Important test cases:

- successful transfer
- insufficient balance
- unauthorized transfer
- invalid beneficiary
- invalid amount
- duplicate beneficiary
- failed login
- protected endpoint without JWT
- customer accessing admin endpoint

Frontend:

Test critical user flows where practical.

# ================================================== 31. DOCKER

Create Docker configuration for:

frontend
backend
postgresql

Use environment variables.

Create:

docker-compose.yml

Do not hard-code database passwords.

# ================================================== 32. CI/CD

Create a GitHub Actions workflow.

At minimum:

- install dependencies
- build backend
- run backend tests
- build frontend

Do not add complicated deployment infrastructure unless necessary.

# ================================================== 33. README

Create a professional README containing:

Project overview
Features
Architecture
Tech stack
Screenshots
Database schema
API documentation
Local setup
Environment variables
Docker setup
Testing
Project structure
Security considerations
Known limitations
Future improvements

Clearly state:

"This is an educational/demo banking application and does not process real financial transactions."

# ================================================== 34. DEVELOPMENT WORKFLOW

Do NOT implement everything in one step.

Follow this order:

PHASE 1
Repository analysis

PHASE 2
Architecture and migration plan

PHASE 3
Database design

PHASE 4
Spring Boot backend skeleton

PHASE 5
PostgreSQL integration

PHASE 6
Authentication and JWT

PHASE 7
Account management

PHASE 8
Transactions

PHASE 9
Beneficiaries

PHASE 10
Bill payments

PHASE 11
Notifications

PHASE 12
React frontend

PHASE 13
Dashboard

PHASE 14
Responsive mobile UI

PHASE 15
FAQ chatbot

PHASE 16
Admin dashboard

PHASE 17
Audit logging

PHASE 18
Swagger/OpenAPI

PHASE 19
JUnit/Mockito testing

PHASE 20
Docker

PHASE 21
GitHub Actions

PHASE 22
Final security review

PHASE 23
Final UI/UX review

PHASE 24
README and documentation

# ================================================== 35. AI CODING RULES

Because this project is being developed with AI assistance:

- Never generate thousands of lines unnecessarily.
- Prefer small, reviewable changes.
- Explain architectural decisions before major implementation.
- Reuse existing code when it is correct.
- Don't duplicate components.
- Don't introduce dependencies without explaining why.
- Check dependency compatibility.
- Run builds/tests after changes.
- Fix errors before continuing.
- Never suppress compiler warnings just to make the build pass.
- Never remove tests simply because they fail.
- Never disable security to solve an authentication problem.
- Never expose secrets.
- Never fabricate successful API responses.
- Never use fake backend data in production application flows unless clearly marked as mock/demo data.
- Keep business logic in the backend.
- Never trust frontend authorization.
- Use meaningful names.
- Keep methods focused.
- Keep components reusable.

# ================================================== 36. FINAL QUALITY BAR

Before declaring the project complete, verify:

Backend:

- builds successfully
- tests pass
- PostgreSQL works
- JWT works
- authorization works
- validation works
- exception handling works
- Swagger works

Frontend:

- builds successfully
- all routes work
- API integration works
- responsive design works
- loading/error/empty states work
- chatbot works
- navigation works

Security:

- no secrets committed
- no plaintext passwords
- no JWT leakage
- no sensitive logs
- backend authorization enforced

UX:

- consistent spacing
- consistent typography
- consistent buttons
- consistent icons
- accessible contrast
- responsive mobile design
- polished transitions
- no broken layouts

Documentation:

- README complete
- architecture diagram
- ER diagram
- API documentation
- setup instructions
- environment variables documented

# ================================================== 37. IMPORTANT FINAL REQUIREMENT

At the end, generate:

1. Architecture diagram
2. Database ER diagram
3. Complete API list
4. Complete feature list
5. Test coverage summary
6. Security checklist
7. Technology stack
8. Project folder structure
9. Setup instructions
10. Git commit history recommendation
11. Resume-ready project description
12. Interview explanation
13. Known limitations
14. Future improvements

Do not claim anything that has not actually been implemented and tested.

Start with PHASE 1 ONLY.

First analyze the existing repository and report:

- current architecture
- existing features
- existing files
- reusable code
- problems
- migration strategy
- proposed architecture
- proposed PostgreSQL schema
- proposed folder structure
- dependencies required

Do NOT modify the code until I approve the Phase 1 analysis.

### One adjustment I'd make to your original idea

Don't try to put **every feature from all 20 apps** into the first version. That will turn your project into an enormous clone and make it much harder to finish.

Use the references to build a **feature-rich but coherent banking product**. For example, IDFC FIRST's current materials highlight universal search, UPI, bills, investments, connected accounts and spend categorization, while HDFC highlights personalized shortcuts, card controls, security, UPI and support. Those are useful UX patterns to study without copying their implementation. ([idfcfirstbank][2])

I'd target roughly:

**Core banking**
→ Accounts + transfers + beneficiaries + transactions + bills

**Fintech**
→ UPI-style payment flow + QR demo + spending analytics + cards

**Modern UX**
→ Universal search + quick actions + notifications + personalization

**AI**
→ FAQ/RAG support chatbot

**Engineering**
→ Spring Boot + PostgreSQL + JWT + REST + tests + Swagger + Docker + CI

That will give you a **substantial Java Full Stack project** without making the scope impossible.

[1]: https://www.idfcfirst.bank.in/migration-new-app?utm_source=chatgpt.com "Migration to new app | IDFC FIRST Bank"
[2]: https://www.idfcfirst.bank.in/personal-banking/payments-upi/mobile-banking-services/mobile-banking-app?skey=mobile+b&utm_source=chatgpt.com "Mobile Banking App - Download App for Easy Transactions | IDFC FIRST Bank"
