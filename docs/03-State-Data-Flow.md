# State & Data Flow Documentation

## FSSE2510 E-Commerce Platform

| Item               | Detail                  |
|--------------------|-------------------------|
| **Document Version** | 1.1                   |
| **Project Name**     | FSSE2510 E-Commerce   |

## 1. Overview
The frontend strictly separates UI state, Server state, and URL state to maintain clean architecture and high performance.

## 2. State Management Tools

### 2.1 Server State (TanStack React Query)
Handles fetching, caching, synchronizing, and updating server data.
*   **Usage**: Product lists, user profile, cart data from DB, order history.
*   **Benefits**: Automatic retries, background refetching, caching deduplication, organized query invalidation for mutations (e.g., adding to cart).

### 2.2 Global UI State (Zustand)
Manages lightweight, reactive application state that doesn't belong on the server and needs to be accessed across multiple components.
*   **Usage**: 
    *   Toggling the Cart Drawer / Mobile Menu open/close state.
    *   Storing immediate, non-persisted user preferences (e.g., UI theme).

### 2.3 URL State (Nuqs)
Stores state directly in the URL query string.
*   **Usage**: Search queries, active filters, sorting options, pagination.
*   **Benefits**: Enables URL sharing, deep linking, and browser back/forward navigation without complex React state syncing.

### 2.4 Form State (React Hook Form)
Manages local component state specifically for inputs.
*   **Usage**: Login/Register, Checkout Shipping Form, Admin Product edit form.

## 3. Data Flows

### 3.1 Authentication Flow
1.  **User Action**: User enters credentials.
2.  **Firebase Identity**: Call Firebase `signInWithEmailAndPassword`.
3.  **Token Generation**: Firebase returns user info and an ID Token (JWT).
4.  **Backend Auth**: Send ID Token to standard API requests in the `Authorization: Bearer <token>` header.
5.  **Session state**: The frontend listens to Firebase's `onAuthStateChanged` hook to persist the login span across reloads. 

### 3.2 Add to Cart Flow (Synchronized Update)
1.  **User Click**: Clicks "Add to Cart" on a product.
2.  **Loading State**: UI shows a loading spinner or disables the button during the request.
3.  **Network Request**: Send `POST /cart` to backend via `ky`.
4.  **Success/Failure**: If success, React Query invalidates the cart query to refetch fresh data. If network fails, show a Sonner toast error ("Failed to add item").

### 3.3 Checkout & Payment Flow
1.  **Initiation**: User clicks Checkout. Frontend pulls Cart Server State.
2.  **Intent**: Frontend requests a Stripe `client_secret` from backend by calling `POST /transaction/prepare` (or similar).
3.  **Stripe Display**: Frontend mounts Stripe elements using the retrieved `client_secret`.
4.  **Action**: User hits Pay. Stripe processes the payment securely.
5.  **Confirmation**: Stripe returns success to frontend; frontend redirects user to a `/checkout/success` page.
6.  **Reconciliation**: Backend Stripe Webhook receives the async event, finalizing the transaction status in the database.
