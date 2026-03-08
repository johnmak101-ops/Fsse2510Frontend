# FSSE2510 Project Frontend - E-Commerce Web App

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-000000.svg?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.4-20232a.svg?style=for-the-badge&logo=react&logoColor=61dafb" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.2.1-38B2AC.svg?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TanStack_Query-5.0-FF4154.svg?style=for-the-badge&logo=reactquery" alt="React Query" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28.svg?style=for-the-badge&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Stripe-Payments-008CDD.svg?style=for-the-badge&logo=stripe" alt="Stripe" />
  <img src="https://img.shields.io/badge/AWS_Amplify-Hosting-FF9900.svg?style=for-the-badge&logo=awsamplify" alt="AWS Amplify" />
</div>

<br />

A Next.js 16 storefront application built with React 19 and Tailwind CSS 4. It delivers a modern shopping experience with complex state management, authentication, and payment integration.

🔴 **Live Demo:** [https://johnmak.store](https://johnmak.store)    

---

## Key Features

- **Engineered Shopping Flow**: Real-time cart state management with **Optimistic UI** orchestration, ensuring immediate feedback for item additions and updates.
- **URL-Synchronized Catalog**: Advanced product filtering and sorting using `nuqs`. Synchronizes UI state (categories, price ranges, sort order) with the URL for shareable, reproducible discovery experiences.
- **Membership Ecosystem**: Implements tiered benefits (Bronze to Diamond) with dynamic reward logic based on user interactions.
- **Secure Integration**: End-to-end checkout powered by the **Stripe API** and identity management via **Firebase Auth**.
- **Management Dashboard**: Protected administrative interfaces for handling product data, coupon lifecycles, and site-wide promotional rules.

---

## Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Library**: React 19.2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.2, Radix UI Primitives, Lucide Icons
- **State Management**: Zustand 5 (Client Global State), TanStack Query 5 (Server State)
- **Forms & Validation**: React Hook Form, Zod
- **Networking**: Ky
- **Animation**: GSAP 3.14, Motion 12.23
- **Services**: Firebase (Auth), Stripe (Payments)
- **Deployment**: AWS Amplify

---

## Getting Started

### 1. Prerequisites
- Node.js 20 or higher
- npm (v10+)
- A Firebase project for authentication
- A Stripe account for test/production API keys

### 2. Clone the Repository
```bash
git clone https://github.com/johnmak101-ops/Fsse2510Frontend.git
cd Fsse2510Frontend
```

### 3. Install Dependencies
```bash
npm install
# or for an exact replica of package-lock.json:
npm ci
```

### 4. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```

Configure your `.env.local` with the following variables:

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_API_BASE_URL` | Your Spring Boot backend URL (e.g., `http://localhost:8080`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Auth Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| Firebase Messaging ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key for elements |

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

The project follows a **Feature-Sliced Design**-inspired architecture, separating concerns into routing (`app`), shared UI (`components`), business domains (`features`), and utilities (`lib`/`hooks`/`services`).

### Directory Structure
```text
src/
├── app/             # Next.js App Router (Entry points & Layouts)
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

### Data Flow
```text
User Interaction → Feature Component → TanStack Query/Zustand → Ky Client Interceptor (Injects JWT) → backend API
```

### Core Engineering Decisions

1. **API Interception (`services/api-client.ts`)**: 
   - Centralized handling of outgoing requests through `ky`.
   - Automatically injects Firebase ID tokens into the Authorization header.
   - Globally intercepts 401 Unauthorized responses to trigger re-authentication flows.
2. **State Segregation**:
   - `Zustand`: Used for synchronous UI state (e.g., UI toggles, temporary local cart state).
   - `TanStack Query`: Automates caching, background fetching, and invalidations for all server interactions, heavily reducing boilerplate.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js development server with hot-reloading. |
| `npm run build` | Builds the application for production. |
| `npm run start` | Starts a Node.js server using the production build. |
| `npm run lint` | Runs ESLint to strictly analyze the code for errors. |

---

## Deployment (AWS Amplify)

The application is fully configured for continuous deployment via **AWS Amplify**.

1. Connect your GitHub repository to AWS Amplify.
2. AWS Amplify automatically detects the Next.js 16 SSR framework.
3. The build settings are predefined in `amplify.yml`.
4. Add your Environment variables inside the AWS Amplify Console.
5. AWS Amplify handles the provisioning of edge servers, CloudFront caching, and custom domain SSL (AWS ACM).

`amplify.yml` snippet:
```yaml
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

## Troubleshooting

- **API Requests Failing (CORS or 401)**: Ensure your `NEXT_PUBLIC_API_BASE_URL` correctly points to the running backend without a trailing slash. Confirm your Firebase Project matches the backend's allowed issuer.
- **Stripe Elements Not Rendering**: Verify your `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is loaded correctly. It must start with `pk_test_` or `pk_live_`.
- **Hydration Errors**: Next.js 15+ is strict about hydration. Ensure you aren't rendering browser-specific APIs (like `window` or `localStorage`) during the SSR phase without standard checking protocols (`useEffect`).

---

<div align="center">
  <b>Developed by John Mak</b><br>

