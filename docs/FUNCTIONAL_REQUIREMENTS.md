# Functional Requirements — Frontend

> **Version:** 2.0 | **Date:** 2026-03-18

---

## FR-01: User Authentication

| ID | Requirement | Priority |
|:---|:---|:---|
| FR-01.1 | User shall sign in via Google OAuth (Firebase popup) | Must |
| FR-01.2 | JWT token shall be stored in memory (Zustand), not localStorage | Must |
| FR-01.3 | Auth state shall persist across page navigation via TanStack Query | Must |
| FR-01.4 | Sign-out shall clear all auth state and redirect to home | Must |
| FR-01.5 | Protected routes shall redirect unauthenticated users to login | Must |

### Acceptance Criteria
```gherkin
Scenario: Google Sign In
  Given user is on the homepage
  When user clicks "Sign In with Google"
  Then a Google OAuth popup appears
  And upon authorization, user is redirected to dashboard

Scenario: Unauthenticated access to protected route
  Given user is not logged in
  When user navigates to /account
  Then user is redirected to login page
```

---

## FR-02: Product Discovery

| ID | Requirement | Priority |
|:---|:---|:---|
| FR-02.1 | Homepage shall display featured products and showcase banners | Must |
| FR-02.2 | Shop page shall show paginated product grid with category/sort filters | Must |
| FR-02.3 | All filters and sort options shall sync to URL query params (via nuqs) | Must |
| FR-02.4 | Product search shall provide real-time results | Should |
| FR-02.5 | Product detail page shall display images, variants, stock, and promotions | Must |
| FR-02.6 | "You May Also Like" section shall appear on product detail pages | Should |
| FR-02.7 | Navigation bar shall be dynamically loaded from backend API | Must |

### Acceptance Criteria
```gherkin
Scenario: URL-synced filtering
  Given user is on /shop
  When user selects "Tops" category and "Price: Low to High" sort
  Then URL updates to /shop?category=tops&sort=price_asc
  And product grid refreshes with filtered results
  And sharing the URL shows the same filtered view
```

---

## FR-03: Shopping Cart

| ID | Requirement | Priority |
|:---|:---|:---|
| FR-03.1 | "Add to Cart" button shall update cart with optimistic UI | Must |
| FR-03.2 | Cart shall display item count badge in header | Must |
| FR-03.3 | Cart page shall allow quantity updates and item removal | Must |
| FR-03.4 | Cart state shall sync across tabs/devices (server-side persistence) | Must |
| FR-03.5 | API failure shall trigger rollback of optimistic update + error toast | Must |

### Acceptance Criteria
```gherkin
Scenario: Optimistic add to cart
  Given user views a product with available stock
  When user clicks "Add to Cart"
  Then cart icon count increases immediately (optimistic)
  And API call fires in background
  And on success, cart data syncs from server

Scenario: Out of stock error
  Given product has 0 stock
  When user clicks "Add to Cart"
  Then error toast "Out of stock" appears
  And cart count does not change
```

---

## FR-04: Checkout Flow

| ID | Requirement | Priority |
|:---|:---|:---|
| FR-04.1 | Checkout shall require profile completion (name + phone) | Must |
| FR-04.2 | User shall select or add a shipping address | Must |
| FR-04.3 | User shall be able to apply coupon code with live validation | Must |
| FR-04.4 | Members shall be able to redeem points with live total recalculation | Must |
| FR-04.5 | Stripe Payment Element shall render for card input | Must |
| FR-04.6 | Success page shall display order summary | Must |
| FR-04.7 | Failure page shall allow retry or return to cart | Must |

### Acceptance Criteria
```gherkin
Scenario: Apply coupon with live feedback
  Given user is on checkout with $200 cart
  When user enters coupon "SAVE20" and clicks Apply
  Then "20% off applied!" message appears
  And order total updates to $160
```

---

## FR-05: Wishlist

| ID | Requirement | Priority |
|:---|:---|:---|
| FR-05.1 | Product cards shall show a heart icon for wishlist toggle | Must |
| FR-05.2 | Filled heart indicates product is in wishlist | Must |
| FR-05.3 | Wishlist page shall list all wishlisted products | Must |

---

## FR-06: User Account

| ID | Requirement | Priority |
|:---|:---|:---|
| FR-06.1 | Account page shall display membership tier and points balance | Must |
| FR-06.2 | User shall update profile (name, phone, birthday) | Must |
| FR-06.3 | Order history shall show all past transactions with status | Must |
| FR-06.4 | Order detail shall show product snapshots and payment info | Must |

---

## FR-07: Shipping Address Management

| ID | Requirement | Priority |
|:---|:---|:---|
| FR-07.1 | User shall add, edit, and delete shipping addresses | Must |
| FR-07.2 | User shall set one address as default (visual indicator) | Must |
| FR-07.3 | Checkout shall auto-select default address | Must |

---

## FR-08: Admin Dashboard

| ID | Requirement | Priority |
|:---|:---|:---|
| FR-08.1 | Admin shall view product list with create/edit/delete options | Must |
| FR-08.2 | Admin shall manage coupons (CRUD with all properties) | Must |
| FR-08.3 | Admin shall manage promotions with multi-target assignment | Must |
| FR-08.4 | Admin shall view all transactions and update statuses | Must |
| FR-08.5 | Admin shall search and manage users | Must |
| FR-08.6 | Admin shall configure membership tier thresholds | Should |
| FR-08.7 | Admin shall manage showcase collections and navigation | Should |
