# Sequence Diagrams — Frontend Key Flows

> **Version:** 2.0 | **Date:** 2026-03-18

---

## 1. User Authentication Flow (Frontend Perspective)

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant Store as Auth Store (Zustand)
    participant FB as Firebase Auth SDK
    participant BE as Backend API

    User->>UI: Click "Sign In with Google"
    UI->>FB: signInWithPopup(GoogleAuthProvider)
    FB->>User: Google OAuth Consent Screen
    User->>FB: Authorize
    FB-->>Store: onAuthStateChanged(user)
    Store->>Store: Store Firebase ID Token in memory
    Store->>BE: GET /users/me (Authorization: Bearer {JWT})
    BE-->>Store: UserResponseDto
    Store->>UI: Re-render with authenticated user state
    UI->>UI: Show user avatar + name in header
```

---

## 2. Product Browsing with URL Filters

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant URL as URL State (nuqs)
    participant TQ as TanStack Query
    participant BE as Backend API

    User->>UI: Navigate to /shop
    UI->>TQ: useQuery(['products', {}])
    TQ->>BE: GET /public/products?page=0&size=12
    BE-->>TQ: Product list (page 1)
    TQ-->>UI: Render product grid

    User->>UI: Click "Tops" category
    UI->>URL: setCategory('tops')
    URL->>URL: URL updates to /shop?category=tops
    URL->>TQ: Query key changes → refetch
    TQ->>BE: GET /public/products?category=tops&page=0&size=12
    BE-->>TQ: Filtered product list
    TQ-->>UI: Re-render with filtered products

    User->>UI: Select "Price: Low to High"
    UI->>URL: setSort('price_asc')
    URL->>URL: URL: /shop?category=tops&sort=price_asc
    URL->>TQ: Query key changes → refetch
    TQ->>BE: GET /public/products?category=tops&sort=price_asc&page=0
    BE-->>TQ: Sorted product list
    TQ-->>UI: Re-render with sorted products
```

---

## 3. Optimistic Add-to-Cart Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant Cart as Cart Store (Zustand)
    participant TQ as TanStack Query
    participant BE as Backend API

    User->>UI: Click "Add to Cart" (pid, sku, qty=1)
    UI->>Cart: addItem({pid, sku, qty}) — Optimistic
    Cart->>UI: Cart badge +1 (instant)
    UI->>UI: Show success toast "Added to cart!"
    
    UI->>TQ: useMutation → POST /cart
    TQ->>BE: POST /cart {pid, sku, quantity: 1}
    
    alt API Success
        BE-->>TQ: CartItemDto
        TQ->>TQ: invalidateQueries(['cart'])
        TQ-->>Cart: Sync server cart state
    end

    alt API Failure (409 - Out of stock)
        BE-->>TQ: {status: 409, message: "Insufficient stock"}
        TQ->>Cart: Rollback optimistic update
        Cart->>UI: Cart badge -1 (reverted)
        UI->>UI: Show error toast "Out of stock"
    end
```

---

## 4. Checkout & Payment Flow (Frontend Perspective)

```mermaid
sequenceDiagram
    actor User
    participant UI as Checkout UI
    participant TQ as TanStack Query
    participant BE as Backend API
    participant SE as Stripe Elements

    Note over UI: Step 1 — Shipping Address
    User->>UI: Select shipping address
    
    Note over UI: Step 2 — Apply Discounts
    User->>UI: Enter coupon "SAVE20" + Apply
    UI->>TQ: GET /public/coupon/validate?code=SAVE20
    TQ->>BE: Validate coupon
    BE-->>TQ: {discountType: "PERCENTAGE", discountValue: 20}
    TQ-->>UI: Show "20% off applied!" + recalculate total
    
    User->>UI: Enter 30 points to redeem
    UI->>UI: Live recalculate: $200 - $40 - $30 = $130
    
    Note over UI: Step 3 — Create Order
    User->>UI: Click "Pay Now"
    UI->>TQ: POST /transactions {couponCode, usePoints, shippingAddressId}
    TQ->>BE: Create transaction
    BE-->>TQ: {tid, total: 130}
    
    Note over UI: Step 4 — Payment Intent
    UI->>TQ: POST /transactions/{tid}/payment
    TQ->>BE: Create PaymentIntent
    BE-->>TQ: {clientSecret: "pi_xxx_secret_yyy"}
    
    Note over UI: Step 5 — Stripe Payment
    UI->>SE: stripe.confirmPayment({clientSecret})
    SE->>User: Card input form
    User->>SE: Enter card details + confirm
    
    alt Payment Succeeded
        SE-->>UI: paymentIntent.status = "succeeded"
        UI->>TQ: PATCH /transactions/{tid}/processing
        UI->>TQ: PATCH /transactions/{tid}/success
        TQ->>TQ: invalidateQueries(['cart', 'transactions', 'user'])
        UI->>UI: Redirect to /checkout/success
    end

    alt Payment Failed
        SE-->>UI: Error
        UI->>TQ: PATCH /transactions/{tid}/fail
        UI->>UI: Show error + retry option
    end
```

---

## 5. Wishlist Toggle Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Product Card
    participant TQ as TanStack Query
    participant BE as Backend API

    User->>UI: Click heart icon ♡

    alt Product NOT in wishlist
        UI->>UI: ♡ → ♥ (filled, instant)
        UI->>TQ: POST /wishlist/{pid}
        TQ->>BE: Add to wishlist
        BE-->>TQ: 201 Created
    end

    alt Product IS in wishlist
        UI->>UI: ♥ → ♡ (empty, instant)
        UI->>TQ: DELETE /wishlist/{pid}
        TQ->>BE: Remove from wishlist
        BE-->>TQ: 200 OK
    end

    TQ->>TQ: invalidateQueries(['wishlist'])
```

---

## 6. Admin Product Management Flow

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin Dashboard
    participant TQ as TanStack Query
    participant BE as Backend API

    Admin->>UI: Navigate to /admin/products
    UI->>TQ: useQuery(['admin', 'products'])
    TQ->>BE: GET /products (admin endpoint)
    BE-->>TQ: Product list
    TQ-->>UI: Render product table

    Admin->>UI: Click "Create Product"
    UI->>UI: Show create form
    Admin->>UI: Fill form + Submit
    UI->>TQ: useMutation → POST /products
    TQ->>BE: POST /products {name, price, variants...}
    BE-->>TQ: Created ProductDto
    TQ->>TQ: invalidateQueries(['admin', 'products'])
    UI->>UI: Toast "Product created!" + close form
```
