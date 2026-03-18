# Definition of Done — Frontend

> **Version:** 2.0 | **Date:** 2026-03-18

---

## Feature-Level DoD

Every frontend feature must satisfy **all** of the following criteria before it is considered "done":

### Code Quality
- [ ] TypeScript strict mode — zero `any` types in production code
- [ ] Feature follows Feature-Sliced Design (FSD) structure
- [ ] Components are composable and reusable
- [ ] No hardcoded strings (use constants or i18n keys)
- [ ] No `console.log` in production code (use proper error boundaries)
- [ ] ESLint + Prettier pass with zero errors/warnings

### State Management
- [ ] Server state managed via TanStack Query (not local state)
- [ ] Client-only state managed via Zustand (UI toggles, optimistic updates)
- [ ] Filter/sort state synced to URL via nuqs (shareable URLs)
- [ ] Cache invalidation configured for mutations
- [ ] Optimistic updates implemented where applicable (cart, wishlist)

### UI / UX
- [ ] Loading states: skeleton loaders displayed during data fetch
- [ ] Error states: user-friendly error messages via toast notifications
- [ ] Empty states: helpful messaging with action buttons
- [ ] Responsive: tested at 320px (mobile), 768px (tablet), 1280px (desktop)
- [ ] Animations: smooth transitions via Framer Motion (no jarring jumps)
- [ ] Form validation: inline error messages with clear guidance

### Accessibility
- [ ] Semantic HTML (proper `<button>`, `<nav>`, `<main>`, `<h1>`-`<h6>`)
- [ ] All images have `alt` text
- [ ] Interactive elements have keyboard navigation
- [ ] Color contrast meets WCAG AA (≥ 4.5:1)
- [ ] Focus management on modals/drawers

### Security
- [ ] JWT stored in Zustand (memory), not localStorage
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] All API calls use HTTPS
- [ ] No secret keys in `NEXT_PUBLIC_*` env vars (only publishable keys)
- [ ] Stripe Elements used for payment (no raw card data handling)

### API Integration
- [ ] Ky client used with JWT injection via `beforeRequest` hook
- [ ] Error responses parsed and displayed to user
- [ ] 401 responses trigger sign-out + redirect
- [ ] All mutations invalidate appropriate TanStack Query caches

### Testing
- [ ] Feature manually tested across happy path + error states
- [ ] Responsive layout verified on mobile/tablet/desktop
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Stripe payment flow tested with test cards

### Documentation
- [ ] Feature documented in `FUNCTIONAL_REQUIREMENTS.md`
- [ ] Use case documented in `USE_CASES.md`
- [ ] API integration documented in `API_INTEGRATION.md`
- [ ] ADR written for significant UI architecture decisions

---

## Deployment-Level DoD

- [ ] `npm run build` succeeds with zero errors
- [ ] Bundle size within target (< 300KB gzipped initial JS)
- [ ] No hydration mismatch warnings
- [ ] Environment variables configured in AWS Amplify console
- [ ] Amplify build pipeline succeeds on push to `main`

---

## Sprint/Release DoD

- [ ] All planned features meet Feature-Level DoD
- [ ] No console errors in production
- [ ] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] All user flows tested end-to-end (browse → cart → checkout → success)
- [ ] Deployment Guide updated if infrastructure changed
