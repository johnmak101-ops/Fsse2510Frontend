# Business Logic & Architectural Decisions — Frontend

> **Version:** 2.0 | **Date:** 2026-03-18

---

## Decision Log

### BLD-007: Zustand + TanStack Query (State Segregation)
- **Decision**: Client state uses Zustand, Server state uses TanStack Query
- **Context**: Redux is too heavy with excessive boilerplate; React Context alone is not flexible enough
- **Trade-off**: Two libraries vs clear state boundaries
- **Result**: Zustand handles UI toggles / optimistic cart updates; TanStack Query handles auto-cache + refetch

### BLD-008: URL-Synchronized Filtering (nuqs)
- **Decision**: All product filter/sort criteria sync to URL query parameters
- **Context**: Traditional client-side filter state is not shareable or bookmarkable
- **Trade-off**: URL readability vs functionality
- **Result**: Shareable and reproducible product discovery experience

### BLD-014: Optimistic UI for Cart Operations
- **Decision**: Cart mutations update Zustand immediately, with background API sync
- **Context**: Server round-trips create perceptible delays that hurt user experience
- **Trade-off**: Complexity of rollback logic vs perceived speed
- **Result**: Cart actions feel instant; rollback only occurs on actual API failure

### BLD-015: Firebase JWT in Memory (Not localStorage)
- **Decision**: Firebase ID Token stored in Zustand (memory), never in localStorage
- **Context**: localStorage tokens are vulnerable to XSS attacks
- **Trade-off**: Token lost on tab close (re-auth needed) vs security
- **Result**: No persistent XSS attack vector; Firebase SDK handles seamless re-authentication

### BLD-016: Feature-Sliced Design (FSD) Structure
- **Decision**: Codebase organized by features rather than by file type
- **Context**: Traditional `components/`, `pages/`, `utils/` structure becomes unnavigable at scale
- **Trade-off**: Higher initial setup effort vs long-term maintainability
- **Result**: Each feature module is self-contained with its own components, hooks, types, and API calls

### BLD-017: Ky HTTP Client (Not Axios)
- **Decision**: Ky chosen as HTTP client for API communication
- **Context**: Ky is built on native `fetch`, lighter than Axios, with better retry and hook support
- **Trade-off**: Less community adoption vs modern design + smaller bundle
- **Result**: Simpler JWT injection via `beforeRequest` hook; auto-retry on network errors

### BLD-018: Stripe Elements (Not Custom Card Forms)
- **Decision**: Stripe's pre-built Payment Element used for card input
- **Context**: Custom card forms require PCI SAQ-A-EP compliance; Stripe Elements maintains SAQ-A
- **Trade-off**: Less visual customization vs PCI compliance simplification
- **Result**: Zero raw card data touches our frontend; full PCI compliance via Stripe

### BLD-019: Next.js App Router with SSR
- **Decision**: Use Next.js App Router with Server-Side Rendering for product pages
- **Context**: Product pages need SEO (Google indexing) and fast LCP
- **Trade-off**: SSR complexity vs SEO + performance
- **Result**: Product pages fully rendered in initial HTML response; excellent Core Web Vitals
