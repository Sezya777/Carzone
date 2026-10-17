# Favorites/cart Firestore migration for CARZONE

The change moves favorites and cart state from per-component localStorage reads/writes into a single shared `UserDataContext`. Authenticated users get their data loaded from and persisted to Firestore; guests continue to use localStorage. `useUserData` is now a thin proxy to the context, and `HomePage`, `CarsPage`, `UserCabinet`, and `Header` all consume it rather than touching storage directly. The build passes cleanly (exit code 0, no errors).

**Watch for:** localStorage remains the source of truth for Header badge counts (confirmed). The guest→authenticated migration only fires for brand-new accounts (confirmed). Firestore writes silently swallow all errors (confirmed).

**Verdict**: APPROVED

## High-level view

`UserDataContext` owns the full lifecycle: load on auth-state change, debounced dual-write (localStorage + Firestore) on every mutation, and a `carzone-storage` event to keep the Header badge counts in sync. The debounce timer is correctly cleaned up on each effect re-run. All consuming components (`HomePage`, `CarsPage`, `UserCabinet`) call `useUserData()` and pass the values through as props — no direct localStorage access remains.

The Header reads badge counts exclusively from localStorage via the `carzone-storage` event. The context mirrors every Firestore load back into localStorage before dispatching that event, so the Header always reads fresh values after login. However, the Header never directly reads from Firestore, so on the initial page load there is a one-render gap where the context hasn't finished its async `getDoc` and the Header shows zeroes. The event dispatch at the end of the `getDoc` `.then()` closes this gap reliably in the common case.

The guest-to-authenticated merge is deliberately conservative: it only applies when the Firestore document doesn't exist yet (truly new accounts). A returning user logging in on a device with guest-accumulated data will silently lose that data — the Firestore copy wins. This is a reasonable trade-off for an app at this scale but is undocumented.

<details>
<summary>Issues (4)</summary>

1. **Silent Firestore write failures** — Both the merge `setDoc` in the load effect and the debounced `setDoc` in the persist effect call `.catch(() => {})`, discarding all errors. A network drop or Firestore permission denial will silently fail to persist data. Add at minimum a `console.error` so failures surface during development and can be caught by any future error-monitoring integration.

2. **localStorage as Header's source of truth** — The Header reads counts from localStorage, not from React state. This works because the context always mirrors into localStorage before dispatching `carzone-storage`. If any future code path updates `favorites`/`cart` state without going through `toggleFavorite`/`toggleCart`/`setCart` (bypassing the debounce effect), the Header badge will silently desync. The coupling is fragile; consider passing counts directly via context or a selector instead.

3. **Guest data silently lost on returning-user login** — If a user who already has a Firestore document logs in after accumulating favorites/cart as a guest, the guest data is discarded without notification. The merge guard `if (!snap.exists())` is intentional but undocumented. A comment explaining the trade-off would prevent a future developer from "fixing" it incorrectly.

4. **removeFromCart stale closure** — `removeFromCart` in `UserCabinet` calls `setCart(cart.filter(...))` where `cart` is the render-closure value. Two removes dispatched in the same render tick would lose the first. Not a live bug today, but would silently misbehave if a "remove all checked" action is ever added. Fix by using the functional form: `setCart(prev => prev.filter(...))`.

</details>

<details>
<summary>Details</summary>

### Auth-state load and guest merge

On every `user.uid` change the load effect runs. The `cancelled` flag prevents stale `getDoc` callbacks from writing state after a subsequent login/logout has already run. The `isInitialLoadRef.current = true` guard at the top blocks the persist effect from firing a redundant Firestore write while the initial population is in flight.

The merge guard `!snap.exists()` means that if a returning user accumulates guest favorites before logging in, those items are lost — Firestore wins. This is intentional (prevents overwriting a real account's data with a transient guest session) but there is no comment in the code explaining it and no user-visible notification.

### Header badge coupling and desync risk

The Header's `syncCounts` reads localStorage rather than subscribing to React state. The context always writes localStorage before dispatching `carzone-storage`, so the counts are correct today. The risk is forward-facing: any code path that mutates `favorites`/`cart` state without going through the three exported mutators (bypassing the debounce effect) will silently desync the badge. The `BurgerMenu` receives `Array(favoritesCount).fill(null)` — a synthetic array whose only purpose is to convey a length — which propagates the same fragility.

### removeFromCart stale closure

`removeFromCart` in `UserCabinet` is `setCart(cart.filter(...))` where `cart` is the render-closure value. Two rapid removes in the same render would lose the first. In practice the cart UI renders individual remove buttons without batching, so this is not a live bug, but it would silently misbehave if the UI ever adds a "remove all checked" action.

</details>

<details>
<summary>File map</summary>

- `src/context/UserDataContext.jsx` — new file; owns all favorites/cart state, Firestore reads/writes, debounced persistence, and `carzone-storage` dispatch
- `src/hooks/useUserData.js` — now a thin proxy to `useUserDataContext`; no logic of its own
- `src/components/HomePage.jsx` — removed local storage handling; destructures `{ favorites, cart, toggleFavorite, toggleCart }` from `useUserData`
- `src/pages/CarsPage.jsx` — same localStorage removal; same `useUserData` consumption
- `src/components/UserCabinet.jsx` — uses `useUserData`; `setCart([])` on order complete; `removeFromCart` via `setCart`
- `src/components/Header.jsx` — unchanged storage-event approach; now correctly seeded by context's `carzone-storage` dispatch after Firestore load

</details>
