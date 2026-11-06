# FITCORE – Multi-Tenant SaaS Gym Management Platform

**FITCORE** is a modern, high-performance, multi-tenant SaaS gym management platform designed to empower gym owners, boutique fitness studios, and athletic clubs to manage their facilities independently and securely.

---

## ⚡ Core Value Proposition: Multi-Tenancy

- **Self-Service Gym Onboarding**: Any gym owner can discover FITCORE via the public SaaS landing page, register their gym facility, and receive an independent `ADMIN` account.
- **Tenant Isolation**: Gym A and Gym B operate in total isolation. Each gym's clients, membership plans, active/historical memberships, payments, and financial metrics are strictly partitioned.
- **Dedicated Client Portal**: Gym members (clients) are provisioned by their gym administrator and access their own start dates, expiry dates, payment status, remaining balances, and transaction history.
- **Bulletproof Security**: The backend never trusts client-supplied tenant identifiers; `gym_id` context is cryptographically derived directly from the authenticated JWT token.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 6, Modern Dark Mode CSS System, Axios.
- **Backend**: Java 17+, Spring Boot 3.3.3, Spring Security 6, JJWT (HMAC SHA-256), Spring Data JPA, Hibernate ORM.
- **Database**: MySQL 8.0 (with automated schema migration and backward-compatible data seeding).
- **API Documentation**: OpenAPI 3.0 / SpringDoc Swagger UI with JWT Bearer authentication.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Java JDK 17+
- MySQL 8.0 running locally on port `3306` (with user `root`, password `root`)
- Node.js (v18+) & npm

### 2. Backend Startup (Spring Boot)
From the project root:
```bash
# Package and run Spring Boot backend
cd backend
mvn spring-boot:run
```
*Or run the packaged JAR directly:*
```bash
java -jar backend/target/gym360-backend-1.0.0.jar
```
The backend server runs on `http://localhost:8080`.

### 3. Frontend Startup (Vite React)
From the project root:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Interactive Swagger UI & API Documentation
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI v3 Docs**: `http://localhost:8080/v3/api-docs`

---

## 🔑 Pre-Seeded Accounts & Initial Facility

| Facility | Role | Email | Password | Details |
|---|---|---|---|---|
| **FITCORE Flagship Gym** | **Admin (Owner)** | `admin@gym360.com` | `admin123` | Full administrative control of Flagship Gym |
| **FITCORE Flagship Gym** | **Client** | `john@example.com` | `client123` | Active Quarterly plan ($130, Paid) |
| **FITCORE Flagship Gym** | **Client** | `sarah@example.com` | `client123` | Active Monthly plan ($50, Partially Paid: $30 paid, $20 due) |
| **FITCORE Flagship Gym** | **Client** | `mike@example.com` | `client123` | Expired Monthly plan ($50, Paid) |

*New gym owners can create their own independent gyms anytime using the **Get Started** button on the public landing page.*

---

## 🏢 Multi-Tenant SaaS Architecture

```
[ Public SaaS Landing Page ]
          │
          ├───► POST /api/auth/register-gym (Self-Service Gym Onboarding)
          │         ├─ Creates new Gym entity (id, name, code, contact)
          │         ├─ Creates Gym Owner account (Role: ADMIN, linked to gym)
          │         ├─ Auto-seeds Starter Plans (Monthly, Quarterly, Yearly)
          │         └─ Issues JWT token embedded with gymId
          │
          └───► POST /api/auth/login (Tenant Login)
                    └─ Resolves User & Gym Context
```

### Data Isolation Guarantees:
- **`Gym` Entity**: Master tenant boundary table.
- **`User` Table**: Scoped via `gym_id`. Gym A admin cannot view or edit Gym B users.
- **`MembershipPlan` Table**: Scoped via `gym_id`. Plans created by Gym A are invisible to Gym B.
- **`Membership` Table**: Scoped via `gym_id`. Renewals, extensions, and cancellations strictly check gym ownership.
- **`Payment` / `PaymentTransaction`**: Linked through `membership.gym_id`. Cross-tenant payments and refunds are rejected with HTTP 400/403/404.

---

## 📋 Comprehensive API Endpoints

### Authentication & Onboarding (Public)
- `POST /api/auth/register-gym`: Self-service gym registration for new gym owners.
- `POST /api/auth/login`: Authenticate with email and password to obtain a JWT Bearer token.
- `GET /api/auth/me`: Inspect authenticated identity and gym association.
- `POST /api/auth/forgot-password`: Request 15-minute secure password reset token.
- `POST /api/auth/reset-password`: Reset password using valid recovery token.

### Admin Operations (Protected: `ADMIN` Role Required)
- `GET /api/admin/dashboard`: Aggregated analytics (Total/Active Clients, Active/Upcoming/Expired Memberships, Revenue, Pending Balances, Customer Credits).
- `GET /api/admin/clients`: List all clients registered in the authenticated admin's gym.
- `POST /api/admin/clients`: Provision a new client account under the authenticated admin's gym.
- `PUT /api/admin/clients/{id}`: Update client details.
- `PATCH /api/admin/clients/{id}/status`: Toggle client between `ACTIVE` and `INACTIVE` (blocking/unblocking portal access).
- `DELETE /api/admin/clients/{id}`: Delete client (rejected if historical membership/financial records exist).
- `GET /api/admin/plans`: List membership plans configured for this gym.
- `POST /api/admin/plans`: Create a new membership plan for this gym.
- `PUT /api/admin/plans/{id}`: Update plan details.
- `DELETE /api/admin/plans/{id}`: Delete plan (rejected if assigned to memberships).
- `POST /api/admin/memberships/assign`: Assign or renew membership plan with auto-calculated expiry and agreed price protection.
- `POST /api/admin/memberships/{id}/extend`: Extend membership expiry date.
- `POST /api/admin/memberships/{id}/cancel`: Cancel active membership.
- `PUT /api/admin/payments/{membershipId}`: Manually update amount paid and recalculate remaining balance.
- `POST /api/admin/payments/{membershipId}/transactions`: Record installment payments or refunds with duplicate reference protection.
- `GET /api/admin/profile`: Inspect administrator account details and password status.
- `PUT /api/admin/profile`: Update administrator name and contact number.
- `PUT /api/admin/profile/email`: Update administrator email with password verification.
- `POST /api/admin/profile/change-password`: Change administrator password.

### Client Portal (Protected: `CLIENT` Role)
- `GET /api/client/dashboard`: Retrieve personal membership details, start/expiry dates, payment status, remaining balance, and past membership history.

---

## 🧪 Automated Verification & Test Suites

Run the automated test suites using Node.js:

```bash
# 1. Multi-Tenant SaaS Integration & Cross-Tenant Isolation Test
node test_multitenant_saas.mjs

# 2. Administrator Account Security & Password Recovery Test
node test_admin_security_management.mjs

# 3. Comprehensive Logic Audit (Membership Lifecycle & Financial Tracking)
node test_audit_scenarios.mjs

# 4. Full-Stack End-to-End Test
node test_e2e_fullstack.mjs
```

---

## 🛡️ License

FITCORE SaaS Platform is developed for gym and fitness facility operations. All rights reserved.
