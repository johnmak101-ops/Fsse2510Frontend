# Frontend Architecture Document

## 1. Overview

This document outlines the high-level architecture for the FSSE2510 E-Commerce platform frontend. The application utilizes a modern React ecosystem tailored for high performance, great developer experience, and scalability.

### Frontend Architecture Overview
```mermaid
graph TD
    User([User / Browser])
    Next[Next.js App Router]
    Client[Client Components (React Query, Zustand)]
    Server[React Server Components]
    Backend[(Spring Boot Backend)]

    User -->|HTTP | Next
    Next --> Server
    Server -->|Pass Props / Initial HTML| Client
    Client <-->|User Interactions| User
    
    Server -->|Server-side fetch| Backend
    Client -.->|Client-side fetch (Tanstack)| Backend
```

## 2. Tech Stack

### Core Frameworks
*   **Next.js 16 (App Router)**: Core meta-framework for routing, SSR/SSG, and SEO optimization.
*   **React 19**: UI component library with leveraging Server Components (RSC) and React Compiler.

### Styling & UI
*   **Tailwind CSS v4**: Utility-first CSS framework for styling.
*   **Radix UI**: Headless, accessible UI primitives for complex components (Dialog, Dropdown, Accordion, etc.).
*   **Lucide React / Remix Icon**: Scalable SVG icon libraries.

### State Management & Data Fetching
*   **Zustand**: Lightweight global state management for UI states (e.g., cart drawer visibility, theme).
*   **TanStack React Query v5**: Managing asynchronous server state, caching, and data synchronization.
*   **Nuqs**: Type-safe URL query state management (useful for filtering/pagination without React state).
*   **Ky**: Elegant and lightweight HTTP client based on `fetch` for communicating with the Spring Boot backend.

### Forms & Validation
*   **React Hook Form**: Performant, flexible, and extensible forms with easy-to-use validation.
*   **Zod**: TypeScript-first schema declaration and validation library.

### Authentication & Payments
*   **Firebase SDK**: Specifically used for Firebase Authentication (JWT token generation).
*   **Stripe Elements**: Secure frontend card and payment input integration.

### Animations
*   **Motion (Framer Motion)**: Declarative animations for React components.
*   **GSAP**: Professional-grade animation library for complex, timeline-based sequences.

## 3. Directory Structure (Proposed)

```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, API routes)
│   ├── (auth)/           # Route group for Login/Register (no standard layout)
│   ├── (shop)/           # Route group with Main Navbar/Footer
│   │   ├── product/[id]/ # Dynamic product details page
│   │   ├── cart/         # Shopping cart page
│   │   ├── checkout/     # Checkout flow
│   │   └── profile/      # User profile & order history
│   └── admin/            # Admin dashboard layout
├── components/           # Reusable React components
│   ├── ui/               # Generic UI components (Buttons, Inputs, Dialogs - Radix/Tailwind based)
│   ├── layout/           # Navbar, Footer, Sidebar
│   └── domain/           # Feature-specific components (ProductCard, CartItem)
├── lib/                  # Utility functions
│   ├── api/              # Ky instances and API endpoints setup
│   ├── queries/          # React Query hook definitions
│   └── utils.ts          # Helper functions (clsx, tailwind-merge)
├── store/                # Zustand stores
├── types/                # Global TypeScript definitions
└── config/               # Application configurations (Constants, Env validation)
```

## 4. Coding Conventions

1.  **Server vs Client Components**: Default to Server Components for performance and SEO. Add `'use client'` only when interactivity (hooks, event listeners) is required.
2.  **API Communication**: Centralize API calls via `ky` inside `lib/api/` and manage them with React Query in `lib/queries/`.
3.  **Styling**: Use simple Tailwind utility classes. For conditional classes, use `cn()` helper (combining `clsx` and `tailwind-merge`).
4.  **Error Handling**: Utilize React Hook Form + Zod for field-level validation and TanStack Query's error boundaries for network errors.
