# Frontend Test Cases

## 1. Overview
This document outlines the testing strategy and key test cases for the FSSE2510 E-Commerce platform frontend.

Testing will primarily focus on:
1.  **Component Tests**: Verifying UI components render correctly.
2.  **Integration Tests**: Verifying interactions between components and mock APIs.
3.  **End-to-End (E2E) Tests**: Verifying critical user flows (e.g., Checkout) using Playwright.

## 2. Core Test Scenarios

### FT-01: Authentication
*   **Scenario**: User Login and Logout
*   **Steps**:
    1.  Navigate to homepage.
    2.  Click "Login".
    3.  Enter valid email and password.
    4.  Click Submit.
    5.  Verify the Login modal closes.
    6.  Verify the Navbar shows the User Profile icon instead of "Login".
    7.  Click User Profile -> "Logout".
    8.  Verify Navbar reverts to showing "Login".
*   **Expected Result**: UI strictly reflects the authentication state.

### FT-02: Product Listing & Nuqs State
*   **Scenario**: Filtering and Sorting products updates URL and UI.
*   **Steps**:
    1.  Navigate to `/products`.
    2.  Select "Sort: Price Low to High" from dropdown.
    3.  Verify URL updates to `?sort=price_asc`.
    4.  Verify the displayed product list reorders accordingly.
*   **Expected Result**: URL query params and UI state stay perfectly synchronized.

### FT-03: Cart Interactions (Optimistic Updates)
*   **Scenario**: Adding an item to the cart updates UI immediately.
*   **Steps**:
    1.  Log in as a valid customer.
    2.  Click "Add to Cart" on a product card.
    3.  Verify the Cart badge counter increments immediately.
    4.  Verify the Cart Drawer opens showing the new item.
    5.  Wait for mock network response.
    6.  Verify item persists in the cart.
*   **Expected Result**: UI response is immediate (optimistic), backed up by API consistency.

### FT-04: Form Validation (React Hook Form + Zod)
*   **Scenario**: Submitting incomplete shipping info during checkout.
*   **Steps**:
    1.  Navigate to `/checkout` (with items in cart).
    2.  Leave "Shipping Address" field blank.
    3.  Click "Continue to Payment".
    4.  Verify an error message "Address is required" appears below the input.
    5.  Verify the user cannot proceed to the Stripe payment step.
*   **Expected Result**: Client-side validation prevents invalid submissions.

### FT-05: Protected Routes
*   **Scenario**: Guest attempting to access Admin Dashboard.
*   **Steps**:
    1.  Ensure user is logged out.
    2.  Navigate directly to `/admin/dashboard` via URL.
    3.  Verify system intercepts request.
    4.  Verify user is redirected to the home page or a login prompt.
*   **Expected Result**: Unauthorized access is prevented via Next.js middleware or route guards.

### FT-06: Error Handling (API Failure)
*   **Scenario**: Backend API returns a 500 status when adding to cart.
*   **Steps**:
    1.  Mock API to return 500 Error for `POST /cart`.
    2.  Click "Add to Cart" on a product.
    3.  Verify optimistic update occurs first.
    4.  Verify that after API failure, the optimistic update is rolled back (cart item count decreases).
    5.  Verify a toast notification appears: "Failed to add item to cart. Please try again."
*   **Expected Result**: Application handles errors gracefully without crashing and informs the user.
