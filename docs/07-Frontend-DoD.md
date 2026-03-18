# Frontend Definition of Done (DoD)

## 1. Overview
The Definition of Done outlines the specific criteria that every frontend User Story or feature must meet before it can be considered "Complete" and ready for production deployment.

## 2. Code Quality & Standards
- [ ] **Type Safety**: No `any` types used in new code. All API payloads and component props must be strongly typed using TypeScript interfaces/types or Zod schemas.
- [ ] **Linting & Formatting**: Code passes `eslint` without any warnings or errors. Prettier formatting is applied.
- [ ] **Component Structure**: Components are broken down logically. Reusable UI elements are placed in `components/ui/` and feature-specific ones in `components/domain/`.
- [ ] **No Console Logs**: All debugging `console.log()` statements are removed from production code.

## 3. UI/UX & Responsive Design
- [ ] **Responsiveness**: The feature is fully functional and visually accurate on Mobile (320px+), Tablet (768px+), and Desktop (1024px+).
- [ ] **Cross-Browser Verification**: Successfully tested on the latest versions of Chrome, Safari, and Edge.
- [ ] **Loading States**: Skeletons or spinners are implemented for all asynchronous data fetching. No abrupt UI layout shifts (Cumulative Layout Shift prevention).
- [ ] **Empty States**: Meaningful placeholders/illustrations are shown when lists or tables are empty (e.g., "No orders found").
- [ ] **Error Handling**: Network failures or invalid form submissions display clear, user-friendly error messages (via Sonner Toasts or inline form errors).

## 4. Accessibility (a11y)
- [ ] **Keyboard Navigation**: All interactive elements (buttons, inputs, links, dropdowns) are reachable and usable via Keyboard alone.
- [ ] **Focus Management**: Focus styles are visible (ring/outline via Tailwind). Focus is intelligently managed within modals and dialogs.
- [ ] **ARIA Attributes**: Proper ARIA roles and labels are applied where Radix UI does not automatically provide them.
- [ ] **Color Contrast**: Text and background colors meet minimum WCAG AA contrast ratios naturally through the Design System.

## 5. Performance & Data Flow
- [ ] **Optimistic Updates**: Immediate UI feedback is provided for relevant mutative actions (like adjusting cart quantities).
- [ ] **Effective Caching**: React Query query keys are properly structured to ensure accurate cache invalidation without over-fetching.
- [ ] **Image Optimization**: `<Image>` component from Next.js is used for all external or large assets.

## 6. Testing
- [ ] **End-to-End**: Critical flows (Authentication, Add to Cart, Checkout) are covered by Playwright E2E tests and pass successfully. (Phase dependent)
- [ ] **Manual QA**: Developer has manually walked through the "Happy Path" and at least two common "Edge Cases" in a local environment hooked up to the local backend.

## 7. Documentation
- [ ] **Component Specs**: If a major new UI pattern is introduced, it is briefly documented in `02-Frontend-Components.md`.
- [ ] **Readme**: Any new environment variables (e.g., Stripe Public Key) added during development are documented in `.env.example` and the root `README.md`.
