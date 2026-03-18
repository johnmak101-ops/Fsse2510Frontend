# Frontend BRD & FSD Mapping

## FSSE2510 E-Commerce Platform

| Item               | Detail                  |
|--------------------|-------------------------|
| **Document Version** | 1.1                   |
| **Project Name**     | FSSE2510 E-Commerce   |

## 1. Overview
This document serves as the bridge between the high-level Business Requirements (BRD), the detailed Backend Functional Specifications (FSD), and how they are materialized specifically on the Frontend.

## 2. Business Values (BRD Mapping)

| Business Requirement | Frontend Implementation Strategy |
| :--- | :--- |
| **User Acquisition & Conversion** | Fast page loads (Next.js SSR), smooth animations (Framer Motion), Optimistic UI for "Add to Cart", and seamless Stripe checkout flow. |
| **Mobile-First Experience** | Strict adherence to Tailwind responsive utilities (`sm:`, `md:`). Bottom navigation or hamburger menus for mobile. |
| **Brand Identity & Trust** | High-quality image loading (Next/Image), consistent Radix UI design system, clear error/success toast notifications (Sonner). |
| **Admin Efficiency** | Single Page Application (SPA)-like feel in the Admin Dashboard using React Query cache to avoid full reloads when managing products. |

## 3. Functional Specifications (FSD Mapping)

### 3.1 Product Catalog Module
*   **Backend Entity**: `Product`, `Category`, `Collection`
*   **Frontend Data Strategy**: 
    *   Home Page / Collections: Fetched Server-Side (RSC) for SEO.
    *   Product List (Filters): Fetched Client-Side using React Query `useInfiniteQuery` to support an **"Endless Aisle" (Infinite Scrolling)** UX, driven by Nuqs URL state (`?category=shoes&sort=price`).
    *   Images: Next.js `<Image>` component used for WebP automatic optimization.

### 3.2 System Architecture & Global Elements
*   **Backend Entity**: `Navbar` (CMS), `Webhooks`
*   **Frontend Data Strategy**:
    *   Dynamic Navbar: Fetched Server-Side from the backend (tree structure). Drives the Header links and dropdowns dynamically, allowing Admin manipulation.
    *   Marquee Slider / Announcement Bar: Auto-scrolling text element at the top of the app, fetching global active promotions or hardcoded announcements. 
    *   Stripe Webhooks: The frontend acts only on the Stripe Client API, not Webhooks. Order success is verified locally before showing the Success page.

### 3.3 Shopping Cart Module
*   **Backend Entity**: `CartItem` (stored in DB against User ID).
*   **Frontend Data Strategy**:
    *   Stored exclusively in React Query cache (Server State), NOT in local localStorage (to stay synced across devices).
    *   Use Zustand merely to control the `isCartDrawerOpen` boolean.
    *   Implement Optimistic Updates for quantity changes.

### 3.4 Transaction & Payment Module
*   **Backend Integration**: `POST /transaction/prepare` -> receive `client_secret`.
*   **Frontend Implementation**: 
    *   Use `@stripe/react-stripe-js` to wrap the Checkout form in an `<Elements>` provider.
    *   Ensure PCI compliance by letting Stripe Elements handle raw card inputs entirely within IFrames.

### 3.5 Authentication & Membership Module
*   **Backend Security**: Validates Firebase JWT.
*   **Frontend Implementation**:
    *   Firebase Web SDK (`firebase/auth`).
    *   Listen to `onAuthStateChanged()`.
    *   Attach the JWT as an `Authorization: Bearer <token>` header globally using an interceptor inside the `ky` HTTP client setup.

### 3.6 Discount & Promotion Module
*   **Feature**: Coupons & Tier Discounts.
*   **Frontend Implementation**:
    *   Provide a "Promo Code" input in the Cart Drawer.
    *   If applied successfully, highlight the discounted amounts in red/green (depending on design system constraints).
    *   Subtotals are ALWAYS recalculated based on backend response, never strictly calculated on the frontend to avoid tampering.

## 4. API & Error Handling Standardization
*   All backend `FsseResponse<T>` wrappers will be unwrapped in the `ky` API utility layer so React Query hooks strictly deal with the `T` (payload).
*   Any 400/500 errors will be caught and transformed into readable messages via global error boundary toasts.
