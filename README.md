# 🛍️ FSSE2510 Project Frontend - E-Commerce Web App

> A Next.js 16 storefront application — featuring product browsing, shopping cart, Stripe checkout, Optimistic UI, membership system, and Admin Dashboard.  
> Deployed on AWS Amplify with automated CI/CD.

🔴 **Live Demo:** [https://johnmak.store](https://johnmak.store)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🛒 **Engineered Shopping Flow** | Optimistic UI with instant feedback, TanStack Query server state management |
| 🔍 **URL-Synchronized Catalog** | `nuqs`-driven filtering/sorting, shareable and reproducible URLs |
| ⭐ **Membership Ecosystem** | Bronze → Diamond tiers with dynamic reward logic |
| 💳 **Secure Checkout** | End-to-end Stripe API payment + Firebase Auth identity management |
| 🎫 **Coupon System** | Apply discount codes at checkout |
| ❤️ **Wishlist** | Save and track favorite products |
| 🛠️ **Admin Dashboard** | Product management, coupon lifecycle, site-wide promotional rules |

---

## 🛠️ Tech Stack

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| **Framework** | Next.js | 16.1.6 (App Router) |
| **Library** | React | 19.2 |
| **Language** | TypeScript | 5 |
| **Styling** | Tailwind CSS | 4.2 + Radix UI + Lucide Icons |
| **State (Client)** | Zustand | 5 — Global UI state |
| **State (Server)** | TanStack Query | 5 — Caching, background refetch, invalidation |
| **Forms** | React Hook Form + Zod | Validation |
| **HTTP Client** | Ky | Auto JWT injection interceptor |
| **Animation** | GSAP 3.14 + Motion 12.23 | Micro-animations |
| **Auth** | Firebase Auth | Google Secure Token |
| **Payments** | Stripe | Elements + Checkout |
| **Deployment** | AWS Amplify | SSR + CloudFront CDN |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+
- npm v10+
- A Firebase project (Auth)
- A Stripe account (test/production API keys)

### 2. Clone & Install

```bash
git clone https://github.com/johnmak101-ops/Fsse2510Frontend.git
cd Fsse2510Frontend
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Spring Boot backend URL (e.g., `http://localhost:8080`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Auth Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key (`pk_test_` or `pk_live_`) |

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
src/
├── app/             # Next.js App Router (Entry Points & Layouts)
│   ├── (account)/   # Account management routes
│   ├── (admin)/     # Protected admin dashboard routes
│   ├── (auth)/      # Login/Register routes
│   └── (shop)/      # Main storefront routes
├── components/      # Shared UI Components (Domain-Agnostic)
│   ├── common/      # Global Layouts, Headers, Footers
│   └── ui/          # Radix UI / shadcn base components
├── features/        # Business Logic & Domain-Specific Components
│   ├── account/     # User profile logic
│   ├── admin/       # Management logic
│   ├── auth/        # Authentication logic
│   ├── cart/        # Shopping cart state & API hooks
│   ├── home/        # Landing page components
│   ├── product/     # Product grid, details, filtering
│   └── wishlist/    # Wishlist operations
├── hooks/           # Custom React Hooks
├── lib/             # Utilities (Firebase init, GSAP, formatters)
├── services/        # API Clients (Ky interceptors)
└── types/           # Global TypeScript Definitions
```

### Core Engineering Decisions

- **API Interceptor** — `ky` auto-injects Firebase ID Token; 401 globally intercepted to trigger re-authentication
- **State Segregation** — Zustand (synchronous UI state) + TanStack Query (server state caching & invalidation)

---

## 📚 Project Documentation

All documentation is available in the [`docs/`](./docs) directory, viewable directly on GitHub:

### 📐 Requirements & Design

| Document | Description |
|----------|-------------|
| [📄 FUNCTIONAL_REQUIREMENTS.md](./docs/FUNCTIONAL_REQUIREMENTS.md) | Functional Requirements — User Stories + Gherkin acceptance criteria |
| [📄 NON_FUNCTIONAL_REQUIREMENTS.md](./docs/NON_FUNCTIONAL_REQUIREMENTS.md) | Non-Functional Requirements — Performance, accessibility, SEO, UX standards |
| [📄 USE_CASES.md](./docs/USE_CASES.md) | Use Cases — Actor-based UML use case diagrams |
| [📄 DEFINITION_OF_DONE.md](./docs/DEFINITION_OF_DONE.md) | Definition of Done — Quality gates and acceptance checklists |

### 🏗️ Architecture & Flows

| Document | Description |
|----------|-------------|
| [📄 ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System Architecture — Feature-Sliced Design, rendering strategies |
| [📄 SEQUENCE_DIAGRAMS.md](./docs/SEQUENCE_DIAGRAMS.md) | Sequence Diagrams — Auth, cart, and checkout flow Mermaid diagrams |
| [📄 CHECKOUT_FLOW.md](./docs/CHECKOUT_FLOW.md) | Checkout Flow — End-to-end Stripe checkout sequence diagrams |

### 🔌 API

| Document | Description |
|----------|-------------|
| [📄 API_INTEGRATION.md](./docs/API_INTEGRATION.md) | API Integration — Ky client setup, JWT interceptors, TanStack Query hooks |

### ⚙️ Deployment & Decisions

| Document | Description |
|----------|-------------|
| [📄 DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment Guide — AWS Amplify CI/CD pipeline |
| [📄 BUSINESS_DECISIONS.md](./docs/BUSINESS_DECISIONS.md) | Business Decisions — ADRs documenting frontend technology and design choices |

### 📊 Flowcharts & Diagrams

| Diagram | Description |
|---------|-------------|
| [📊 Cart Store Architecture](./docs/diagrams/CART_STORE.md) | Zustand state management, optimistic updates, server sync, guest cart merge |
| [📊 Checkout Flow](./docs/diagrams/CHECKOUT_FLOW.md) | End-to-end checkout journey, auth state machine, TanStack Query caching |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint strict analysis |

---

## 🌐 Deploy to AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Amplify auto-detects Next.js 16 SSR framework
3. Build settings are predefined in `amplify.yml`
4. Add environment variables in the Amplify Console
5. Amplify handles Edge Servers, CloudFront CDN, and SSL

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - env | grep -e NEXT_PUBLIC_ >> .env.production
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

---

## ❓ Troubleshooting

- **API Requests Failing (CORS / 401)** — Ensure `NEXT_PUBLIC_API_BASE_URL` points to the running backend without a trailing slash
- **Stripe Elements Not Rendering** — Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_test_` or `pk_live_`
- **Hydration Errors** — Next.js 15+ strict hydration; avoid `window`/`localStorage` during SSR (use `useEffect`)

---

Created by **John Mak** 🚀

*Last updated: 2026-03-18*
