# FSSE2510 Project E-Commerce Frontend 🛍️

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Stripe](https://img.shields.io/badge/Stripe-Elements-635BFF)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28)

## 📖 Introduction
This repository contains the frontend application for the FSSE2510 E-Commerce course project. It is the customer-facing storefront that connects to the [Spring Boot Backend](https://github.com/johnmak101-ops/Fsse2510ProjectBackend), handling product browsing, shopping cart, Stripe checkout, and user account management. Authentication is managed through Firebase, with JWT tokens passed to the backend for API authorization.

**🚀 Live Demo:** [https://johnmak.store](https://johnmak.store)

### 🌟 Project Features
*   **Product Discovery**: Infinite scroll browsing with category filtering and sorting via URL state.
*   **Shopping Cart**: Server-synced cart stored in the database — persists across devices, not just the browser.
*   **Stripe Checkout**: PCI-compliant payment flow using Stripe Elements — the app never handles raw card data.
*   **Membership & Points**: Customers earn points per purchase and can redeem them at checkout based on admin-configured rates.
*   **Promotions**: Coupon code input with server-side validation — all discount calculations happen on the backend.
*   **Dynamic Navigation**: Header menu driven by CMS data from the backend, allowing admin updates without redeployment.

## 📚 Official Documentation

The frontend is fully documented in the `docs` directory. Click the links below to view the documentation directly on GitHub:

### Architecture & Requirements
1. [Frontend Architecture](./docs/01-Frontend-Architecture.md)
2. [BRD → FSD Mapping](./docs/06-Frontend-BRD-FSD.md)

### Interactions & Design
3. [Use Cases](./docs/04-Frontend-UseCases.md)
4. [State & Data Flow](./docs/03-State-Data-Flow.md)
5. [UI Components & Design System](./docs/02-Frontend-Components.md)

### Quality Assurance (QA)
6. [Definition of Done (DoD)](./docs/07-Frontend-DoD.md)

## 🛠️ Tech Stack & Architecture

### Core Frameworks
*   **Framework**: Next.js 16.1.6 (App Router, React Server Components)
*   **Language**: TypeScript (strict mode)
*   **UI Library**: React 19

### Styling & Components
*   **CSS**: Tailwind CSS v4
*   **Component Library**: shadcn/ui (Radix UI primitives)
*   **Animations**: Framer Motion, GSAP

### State Management & Data
*   **Server State**: TanStack React Query v5 (caching, background sync, mutations)
*   **Client State**: Zustand (UI toggles like cart drawer)
*   **URL State**: Nuqs (filters, sorting, pagination)
*   **HTTP Client**: Ky (with Firebase JWT interceptor)

### Forms & Validation
*   **Forms**: React Hook Form
*   **Schema Validation**: Zod

### Security & Integrations
*   **Authentication**: Firebase Web SDK (JWT token generation)
*   **Payment**: Stripe Elements (@stripe/react-stripe-js)
*   **Hosting**: AWS Amplify

---

