# Non-Functional Requirements — Frontend

> **Version:** 2.0 | **Date:** 2026-03-18

---

## NFR-01: Performance

| ID | Requirement | Target | Measurement |
|:---|:---|:---|:---|
| NFR-01.1 | Largest Contentful Paint (LCP) | < 2.5s | Lighthouse / CWV Report |
| NFR-01.2 | First Input Delay (FID) | < 100ms | Lighthouse |
| NFR-01.3 | Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| NFR-01.4 | Time to First Byte (TTFB) | < 200ms | AWS Amplify CloudFront edge |
| NFR-01.5 | JavaScript bundle size (initial) | < 300KB gzipped | Next.js build output |
| NFR-01.6 | Product list render time | < 500ms for 12 items | Browser DevTools |
| NFR-01.7 | TanStack Query cache utilization | > 70% cache hits on repeat visits | React Query DevTools |

---

## NFR-02: Responsiveness

| ID | Requirement | Target | Implementation |
|:---|:---|:---|:---|
| NFR-02.1 | Mobile-first responsive design | Fully functional at 320px+ | Tailwind CSS breakpoints |
| NFR-02.2 | Tablet layout optimization | Adapted grid at 768px+ | Responsive grid columns |
| NFR-02.3 | Desktop full-width layout | Optimized at 1280px+ | Max-width container |
| NFR-02.4 | Touch-friendly interactions | Min touch target 44×44px | Mobile UI guidelines |

---

## NFR-03: Accessibility

| ID | Requirement | Target | Implementation |
|:---|:---|:---|:---|
| NFR-03.1 | WCAG 2.1 Level AA compliance | Core user flows | Semantic HTML + ARIA |
| NFR-03.2 | Keyboard navigation support | All interactive elements | `tabIndex` + focus management |
| NFR-03.3 | Color contrast ratio | ≥ 4.5:1 (text) | Design system tokens |
| NFR-03.4 | Screen reader compatibility | Page titles + alt text | `aria-label`, `alt` attributes |
| NFR-03.5 | Form error announcements | Live regions for errors | `aria-live="polite"` |

---

## NFR-04: SEO

| ID | Requirement | Target | Implementation |
|:---|:---|:---|:---|
| NFR-04.1 | Server-Side Rendering for product pages | Full HTML in first response | Next.js SSR |
| NFR-04.2 | Meta tags (title, description) per page | All public pages | Next.js `metadata` API |
| NFR-04.3 | SEO-friendly product URLs | `/product/{slug}` pattern | Product slug from backend |
| NFR-04.4 | Open Graph tags for social sharing | Product image + title | `og:image`, `og:title` |

---

## NFR-05: Browser Compatibility

| ID | Requirement | Target |
|:---|:---|:---|
| NFR-05.1 | Chrome (latest 2 versions) | Full support |
| NFR-05.2 | Firefox (latest 2 versions) | Full support |
| NFR-05.3 | Safari (latest 2 versions) | Full support |
| NFR-05.4 | Edge (latest 2 versions) | Full support |
| NFR-05.5 | Mobile Safari (iOS 15+) | Full support |
| NFR-05.6 | Chrome Mobile (Android 11+) | Full support |

---

## NFR-06: Security

| ID | Requirement | Target | Implementation |
|:---|:---|:---|:---|
| NFR-06.1 | No JWT stored in localStorage | Token in Zustand (memory) | In-memory auth store |
| NFR-06.2 | XSS prevention | No `dangerouslySetInnerHTML` | React auto-escaping |
| NFR-06.3 | HTTPS-only communication | All API calls over HTTPS | `NEXT_PUBLIC_API_BASE_URL` |
| NFR-06.4 | Env vars exposure control | Only `NEXT_PUBLIC_*` exposed | Next.js env var scoping |
| NFR-06.5 | Stripe PCI compliance | Stripe Elements handles card data | No raw card data touches our server |

---

## NFR-07: User Experience

| ID | Requirement | Target | Implementation |
|:---|:---|:---|:---|
| NFR-07.1 | Optimistic UI for cart operations | Instant feedback on actions | Zustand + TanStack Query |
| NFR-07.2 | Loading skeletons for async data | No blank screens during loads | Skeleton components |
| NFR-07.3 | Toast notifications for actions | Success/error feedback | Toast component system |
| NFR-07.4 | Smooth page transitions | No jarring layout shifts | Framer Motion |
| NFR-07.5 | Error boundary catchall | Graceful error fallback | React Error Boundary |

---

## NFR-08: Maintainability

| ID | Requirement | Target | Implementation |
|:---|:---|:---|:---|
| NFR-08.1 | TypeScript strict mode | Zero `any` in production code | `strict: true` in tsconfig |
| NFR-08.2 | Feature-Sliced Design structure | Every feature self-contained | `/features/{name}/` folder |
| NFR-08.3 | Consistent code formatting | ESLint + Prettier enforced | Pre-commit hooks |
| NFR-08.4 | Reusable component library | `shared/components/` | Composable, prop-driven |
