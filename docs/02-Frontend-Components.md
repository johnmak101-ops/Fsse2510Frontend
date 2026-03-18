# Frontend Component & UI/UX Design

## FSSE2510 E-Commerce Platform

| Item               | Detail                  |
|--------------------|-------------------------|
| **Document Version** | 1.1                   |
| **Project Name**     | FSSE2510 E-Commerce   |

## 1. Global Layouts

### 1.1 Storefront Layout
Applied to all customer-facing views (Home, Product List, Details).
*   **Header/Navbar**:
    *   Logo (left).
    *   Navigation Links (Products, Categories).
    *   User Actions: Cart Icon (with badge for quantity), User Profile Dropdown / Login Button.
*   **Footer**: Links to About Us, Terms of Service, Contact Info, Socials.

### 1.2 Checkout Layout
*   Minimalist header without standard navigation to reduce distractions. Only Company Logo and "Return to Cart" link.

### 1.3 Admin Layout
*   **Sidebar Navigation**: Fixed left sidebar with sections: Dashboard, Products, Promotions, Orders, Users, Membership, CMS Settings.
*   **Top Bar**: Breadcrumbs, Admin Profile, Logout.

## 2. Key Components

### 2.1 Product Card (`ProductCard.tsx`)
*   **Visual**: Image taking up top 60-70% of the card.
*   **Details**: Title (truncated to 2 lines), Price.
*   **Interaction**: Hover effects (GSAP or Motion) to reveal a quick "Add to Cart" button or secondary image.
*   **Link**: Entire card links to `/product/[id]`.

### 2.2 Shopping Cart Drawer (`CartDrawer.tsx` or `CartPage`)
*   Accessible via Navbar Cart Icon.
*   Displays a list of `CartItem` components.
*   **Features**:
    *   Quantity adjustment (+/- buttons).
    *   Remove item button.
    *   Subtotal calculation.
    *   "Proceed to Checkout" CTA button.

### 2.3 Checkout Flow Components
*   **Order Summary**: Read-only display of items in the cart and total cost.
*   **Shipping Form**: Hook Form for collecting address details.
*   **Payment Component**: Stripe Elements integration securely collecting CC info.

### 2.4 User Profile & Orders
*   **Tabs / Navigation**: Profile Settings, Order History.
*   **Order List**: Chronological list of past transactions showing Date, Status (e.g., SUCCESS, PENDING), Total Amount, and a button to view details.

## 3. Design System & Theming
*   **Colors**: Define CSS variables or Tailwind config for `primary`, `secondary`, `destructive`, `muted`, etc.
*   **Typography**: Clean sans-serif font (e.g., Inter or Geist).
*   **Components**: Built using Radix UI primitives for accessibility (ARIA attributes, keyboard navigation) and styled with Tailwind.

## 4. UI Feedback Mechanisms
*   **Toasts/Snackbars (Sonner)**: Success messages ("Added to Cart") or Error messages ("Payment Failed").
*   **Loading States**: Skeleton loaders for initial data fetches (Products, Cart) instead of simple spinners.
*   **Empty States**: Illustrated empty components for components like "Cart is Empty" or "No Orders Found".
