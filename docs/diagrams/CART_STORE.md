# Cart Store Architecture

> Zustand-based cart state management with localStorage persistence and server sync.

## State Architecture

```mermaid
flowchart TD
    subgraph ZustandStore["useCartStore (Zustand + persist)"]
        State["State<br/>─────────────<br/>items: CartItem[]<br/>totalPrice: number<br/>originalTotalPrice: number<br/>totalQuantity: number<br/>isLoading: boolean<br/>lastSynced: number"]
    end

    subgraph Persist["Persistence Layer"]
        LS["localStorage<br/>'cart-storage'"]
    end

    subgraph Server["Backend API"]
        API["/api/cart/*"]
    end

    State <--> LS
    State <--> API

    style ZustandStore fill:#1a1a2e,stroke:#e94560,color:#fff
    style Persist fill:#16213e,stroke:#0f3460,color:#fff
    style Server fill:#0f3460,stroke:#533483,color:#fff
```

## Add Item Flow

```mermaid
flowchart TD
    A[addItem called] --> B{Item already<br/>in cart?}
    B -- Yes --> C[Increment quantity<br/>Optimistic Update]
    B -- No --> D[Add new CartItem<br/>Optimistic Update]
    C --> E[calculateTotals]
    D --> E

    E --> F{User<br/>authenticated?}
    F -- Yes --> G[POST /api/cart<br/>Server sync]
    F -- No --> H[localStorage only]

    G --> I{Server<br/>success?}
    I -- Yes --> J[✅ State confirmed]
    I -- No --> K[⚠️ Revert optimistic<br/>Show error toast]

    H --> L[✅ Saved locally]
```

## Remove / Update Quantity Flow

```mermaid
flowchart TD
    A["removeItem / updateQuantity"] --> B[Optimistic UI Update]
    B --> C[calculateTotals]
    C --> D{User authenticated?}
    D -- Yes --> E[Debounced server sync<br/>300ms delay]
    D -- No --> F[localStorage only]
    E --> G{Server success?}
    G -- Yes --> H[✅ Confirmed]
    G -- No --> I[⚠️ Rollback + toast]
```

## Guest → User Cart Merge

```mermaid
sequenceDiagram
    participant Guest as Guest Cart (localStorage)
    participant Store as useCartStore
    participant API as Backend API
    participant Server as Server Cart

    Note over Guest,Server: User logs in

    Store->>Guest: Read local items
    Store->>API: GET /api/cart (user's server cart)
    API-->>Store: Server cart items

    alt Local cart has items
        Store->>Store: Merge Strategy
        Note over Store: For each local item:<br/>If exists on server → keep MAX qty<br/>If not on server → add it
        Store->>API: POST /api/cart (merged items)
        API-->>Store: Updated server cart
        Store->>Guest: Clear localStorage cart
    else Local cart empty
        Store->>Store: Use server cart as-is
    end

    Store->>Store: calculateTotals()
    Store-->>Store: ✅ Cart synced
```

## Calculate Totals

```mermaid
flowchart LR
    A[items array] --> B["totalPrice = Σ(item.price × qty)<br/>rounded to 2 decimals"]
    A --> C["originalTotalPrice = Σ(item.originalPrice × qty)<br/>rounded to 2 decimals"]
    A --> D["totalQuantity = Σ(qty)"]
    B --> E[Update state]
    C --> E
    D --> E
```
