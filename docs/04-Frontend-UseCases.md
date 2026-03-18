# Frontend Use Cases

## 1. Overview
This document describes the primary user interactions with the frontend application, mapped to the features of the FSSE2510 E-Commerce platform. It supplements the backend Use Cases by focusing on the UI/UX flows.

## 2. Customer Use Cases

### UC-F01: Browse Products & Navigation (Endless Aisle)
*   **Actor**: Guest / Customer
*   **Flow**:
    1.  User lands on the home page and sees the Showcase Collections.
    2.  User navigates using the dynamic CMS Navigation menu.
    3.  User clicks into a category/shop page and sees a grid of products.
    4.  User can use the sorting dropdown or search bar to filter products (updates Nuqs URL state).
    5.  System displays filtered results dynamically.
    6.  As the user scrolls down the page, more products are automatically loaded (Infinite Scrolling) to simulate an "Endless Aisle" experience, preventing the need to click manual pagination buttons.

### UC-F02: View Product Details
*   **Actor**: Guest / Customer
*   **Flow**:
    1.  User clicks on a product card from the list.
    2.  System navigates to `/product/[slug]`.
    3.  User sees high-res images, full description, active promotions (e.g., "20% off"), price, and stock status.
    4.  User selects specific variants (Color, Size) which updates the displayed price and stock.

### UC-F03: Manage Shopping Cart
*   **Actor**: Customer (Logged In)
*   **Flow**:
    1.  User clicks "Add to Cart" on a product variant.
    2.  System optimistically updates UI, opens Cart Drawer, and sends API request.
    3.  User can change quantities or click "Remove" inside the Cart Drawer.
    4.  System updates subtotal in real-time.

### UC-F04: Authentication Flow
*   **Actor**: Guest
*   **Flow**:
    1.  User clicks "Login" in navbar.
    2.  User enters email and password.
    3.  System authenticates via Firebase.
    4.  On success, system updates navbar to show User Profile Dropdown.

### UC-F05: Checkout & Payment
*   **Actor**: Customer
*   **Flow**:
    1.  User clicks "Checkout" from Cart Drawer.
    2.  System navigates to `/checkout`, displaying Order Summary.
    3.  User fills in Shipping Address (validated by Zod/React Hook Form) or selects a saved address.
    4.  User can apply a Coupon Code. System recalculates total.
    5.  User can choose to apply Membership Points for a discount.
    6.  System requests Stripe `client_secret` from backend and mounts Stripe Payment Element.
    7.  User submits payment details. On success, system redirects to `/checkout/success/{id}`.

### UC-F06: Manage User Profile
*   **Actor**: Customer
*   **Flow**:
    1.  User navigates to "My Profile" from the dropdown.
    2.  User can view their current Membership Tier, Points balance, and cycle details.
    3.  User can update their basic information (e.g., display name, phone number).

### UC-F07: Manage Shipping Addresses
*   **Actor**: Customer
*   **Flow**:
    1.  User navigates to "My Addresses" from the profile menu or during the Checkout flow.
    2.  System displays a list of saved shipping addresses.
    3.  User clicks "Add New Address" or "Edit" on an existing address, opening a modal or form.
    4.  User enters address details (validated by Zod schema).
    5.  User can set an address as the "Default" shipping address.
    6.  System calls the backend to save the address and updates the UI cache instantly.

### UC-F08: View Order History
*   **Actor**: Customer
*   **Flow**:
    1.  User navigates to "My Orders".
    2.  System displays a chronological list of transactions.
    3.  User can click an order to view the items purchased, the total amount, and shipping details.

### UC-F09: Manage Wishlist
*   **Actor**: Customer
*   **Flow**:
    1.  User clicks the heart icon on a product card or details page.
    2.  System uses optimistic UI to toggle the heart color immediately.
    3.  User navigates to "My Wishlist" to see all saved items.

## 3. Admin Use Cases

### UC-A01: Admin Dashboard Navigation
*   **Actor**: Admin
*   **Flow**:
    1.  Admin logs in and is navigated to `/admin/dashboard`.
    2.  System renders layout with the Left Sidebar for CMS navigation.

### UC-A02: Manage Products (CRUD)
*   **Actor**: Admin
*   **Flow**:
    1.  Admin navigates to Admin Product List.
    2.  Admin clicks "Add New Product" to open a modal form.
    3.  Admin fills out product details, uploads images, and configures variants (SKU, size, color, stock, price).
    4.  Admin submits form; system calls API and updates React Query cache instantly.

### UC-A03: Manage Promotions & Coupons
*   **Actor**: Admin
*   **Flow**:
    1.  Admin creates a new Promotion (e.g., BOGO, Percentage Off) defining target products, collections, and dates.
    2.  Admin creates a new Coupon Code defining logic (discount amount, max uses, required membership tier).

### UC-A04: Configure Navigation (CMS)
*   **Actor**: Admin
*   **Flow**:
    1.  Admin navigates to Menu Settings.
    2.  Admin uses a drag-and-drop or nested list UI to build the site's top navigation bar (Nodes and endpoints).

### UC-A05: Manage Transactions & Users
*   **Actor**: Admin
*   **Flow**:
    1.  Admin navigates to Transactions view to see all platform orders, filterable by status (`SUCCESS`, `PENDING`).
    2.  Admin navigates to Users view to see customer details, points balances, and current membership tiers.

### UC-A06: Manage Showcase
*   **Actor**: Admin
*   **Flow**:
    1.  Admin navigates to Showcase Settings.
    2.  Admin selects which Collections to highlight on the Customer Homepage to drive sales.
