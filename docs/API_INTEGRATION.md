# API Integration Guide — Frontend

> **Version:** 2.0 | **Date:** 2026-03-18

---

## 1. HTTP Client Setup (Ky)

```typescript
import ky from 'ky';
import { useAuthStore } from '@/features/auth/store';

const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  retry: { limit: 2, statusCodes: [408, 500, 502, 503, 504] },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      }
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          // Token expired - trigger re-auth
          useAuthStore.getState().signOut();
        }
      }
    ]
  }
});
```

---

## 2. API Endpoints Consumed

### Public Endpoints (No Auth Required)

| Feature | Method | Endpoint | TanStack Query Key |
|:---|:---|:---|:---|
| Product List | GET | `/public/products` | `['products', filters]` |
| Product Detail | GET | `/public/products/slug/{slug}` | `['product', slug]` |
| Product Search | GET | `/public/products/search` | `['products', 'search', query]` |
| Product Attributes | GET | `/public/products/attributes` | `['product-attributes']` |
| Recommendations | GET | `/public/products/recommendations` | `['recommendations']` |
| Showcase | GET | `/public/products/showcase` | `['showcase']` |
| Collections | GET | `/public/products/showcase/collections` | `['showcase-collections']` |
| Validate Coupon | GET | `/public/coupon/validate?code=X` | `['coupon', code]` |
| Active Promotions | GET | `/public/promotions/active` | `['promotions']` |
| Membership Tiers | GET | `/public/membership` | `['membership-tiers']` |
| Navigation | GET | `/public/navigation` | `['navigation']` |

### Authenticated Endpoints

| Feature | Method | Endpoint | TanStack Query Key |
|:---|:---|:---|:---|
| User Profile | GET | `/users/me` | `['user', 'me']` |
| Update Profile | PATCH | `/users/profile` | mutation |
| Cart Items | GET | `/cart` | `['cart']` |
| Add to Cart | POST | `/cart` | mutation → invalidate `['cart']` |
| Update Cart Item | PATCH | `/cart/{cid}` | mutation → invalidate `['cart']` |
| Remove Cart Item | DELETE | `/cart/{cid}` | mutation → invalidate `['cart']` |
| Wishlist | GET | `/wishlist` | `['wishlist']` |
| Toggle Wishlist | POST/DELETE | `/wishlist/{pid}` | mutation → invalidate `['wishlist']` |
| Addresses | GET | `/addresses` | `['addresses']` |
| Create Address | POST | `/addresses` | mutation → invalidate `['addresses']` |
| Transactions | GET | `/transactions` | `['transactions']` |
| Create Transaction | POST | `/transactions` | mutation |
| Create Payment | POST | `/transactions/{tid}/payment` | mutation |

### Admin Endpoints

| Feature | Method | Endpoint |
|:---|:---|:---|
| All Products | POST/PUT/PATCH/DELETE | `/products/**` |
| All Coupons | GET/POST/PUT/DELETE | `/admin/coupons/**` |
| All Promotions | GET/POST/PUT/DELETE | `/admin/promotions/**` |
| All Transactions | GET/PATCH | `/admin/transactions/**` |
| All Users | GET/POST | `/admin/users/**` |
| Membership Config | GET/PUT | `/admin/membership/configs/**` |
| Showcase | GET/POST/PUT/DELETE | `/api/admin/showcase/collections/**` |
| Navigation | GET/PUT | `/admin/navigation` |

---

## 3. Error Handling Pattern

```typescript
// All API errors follow this format:
interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

// Usage in TanStack Query:
const { mutate } = useMutation({
  mutationFn: (data) => api.post('cart', { json: data }).json(),
  onError: (error: HTTPError) => {
    const body = await error.response.json() as ApiError;
    toast.error(body.message); // e.g., "Insufficient stock"
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }
});
```

---

## 4. Cache Invalidation Strategy

| Event | Invalidated Queries | Reason |
|:---|:---|:---|
| Add/Update/Remove Cart | `['cart']` | Cart data changed |
| Toggle Wishlist | `['wishlist']` | Wishlist data changed |
| Complete Transaction | `['cart']`, `['transactions']`, `['user', 'me']` | Cart emptied, order created, points changed |
| Update Profile | `['user', 'me']` | User data changed |
| Address CRUD | `['addresses']` | Address list changed |
