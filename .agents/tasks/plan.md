# Implementation Plan: Migrate Favorites & Cart from localStorage to Firestore

## Context

- Project: Vite + React 19, Firebase v12, Redux Toolkit, no test framework (verify with `npm run build`)
- Auth state: `state.auth.user` → `{ uid, email, displayName, role }` or `null`
- Firebase exports from `src/firebase.js`: `auth`, `db`, `storage`
- Firestore already used in `authSlice.js` via `getDoc`/`setDoc` from `firebase/firestore`
- No existing custom hooks directory — create `src/hooks/` fresh
- `UserCabinet.jsx` listens for `carzone-storage` window event to re-sync; this pattern is preserved

---

- [ ] 1. Create the `src/hooks/` directory and `useUserData.js` hook.

  The hook reads `state.auth.user` from Redux. When authenticated, it loads `favorites` and `cart` from the Firestore document `users/{uid}` (fields `favorites` and `cart`) on mount using `getDoc`. It writes back to Firestore with a 500 ms debounce via `useRef`+`setTimeout`/`clearTimeout` on every state change. When not authenticated, it reads from and writes to `localStorage` keys `carzone-favorites` and `carzone-cart` exactly as before. After every toggle it fires `window.dispatchEvent(new Event('carzone-storage'))`. Exports `{ favorites, cart, toggleFavorite, toggleCart, setCart }`.

  Key implementation details:
  - Use `useSelector` for `user`, `useState` for `favorites`/`cart`, `useRef` for debounce timer and for `user` identity so the debounce callback always sees the current user.
  - On mount: if `user` is set, call `getDoc(doc(db, 'users', user.uid))` and initialise state from `docSnap.data()?.favorites ?? []` and `docSnap.data()?.cart ?? []`; if not authenticated, read from localStorage.
  - On `user` change (login/logout): re-load data from the appropriate source. On logout, fall back to localStorage. On login, load from Firestore and clear any stale localStorage values so they don't bleed across accounts.
  - `toggleFavorite(car)` and `toggleCart(car)` use the `car.id || car.name` key pattern already used in `HomePage.jsx` and `CarsPage.jsx`.
  - `setCart(newList)` sets cart state directly (used by `UserCabinet` after order completion).
  - Debounce save: on every `favorites` or `cart` change, clear previous timer and set a new 500 ms timeout. Inside the timeout, check the current `user` ref — if authenticated, call `setDoc(doc(db, 'users', user.uid), { favorites, cart }, { merge: true })`; otherwise write to localStorage.

  Files: `src/hooks/useUserData.js` (CREATE NEW)

  Verify: `npm run build` — no TypeScript/ESLint errors, build succeeds.

---

- [ ] 2. Refactor `HomePage.jsx` to use `useUserData`.

  Remove: the `readStorageList` helper function, the `useState` initialisers for `favorites` and `cart`, the two `useEffect` blocks that write to localStorage and dispatch `carzone-storage`, and the inline `toggleFavorite`/`toggleCart` functions.

  Add: `import { useUserData } from '../hooks/useUserData'` and destructure `{ favorites, cart, toggleFavorite, toggleCart }` from the hook call at the top of the component. All other code (CarsGrid props, CarModal, etc.) stays unchanged — it already uses these names.

  Files: `src/components/HomePage.jsx`

  Verify: `npm run build` — build succeeds, no unused-variable lint errors.

---

- [ ] 3. Refactor `CarsPage.jsx` to use `useUserData`.

  Identical transformation as step 2: remove `readStorageList`, remove `useState` for `favorites`/`cart`, remove the two localStorage `useEffect` blocks, remove `toggleFavorite`/`toggleCart` functions. Import and call `useUserData`, destructure `{ favorites, cart, toggleFavorite, toggleCart }`.

  Files: `src/pages/CarsPage.jsx`

  Verify: `npm run build` — build succeeds.

---

- [ ] 4. Refactor `UserCabinet.jsx` to use `useUserData`.

  Remove: `readLocalData` function, `useState` initialised with `readLocalData`, the `useEffect` that calls `syncStorage` and listens on `carzone-storage`, and the `useMemo` wrappers for `favorites`/`cart` (they are no longer needed since the hook returns stable values). Remove the `removeFromCart` function that writes to localStorage directly.

  Add: `import { useUserData } from '../hooks/useUserData'` and destructure `{ favorites, cart, toggleCart, toggleFavorite, setCart }` from the hook.

  Update `removeFromCart` (keep the name for CartItem prop compatibility): replace the body with `toggleCart(cart.find(c => (c.id || c.name) === idOrName))` — this calls the hook's toggle which handles Firestore/localStorage correctly and dispatches `carzone-storage`.

  Update `OrderModal` `onOrderComplete` prop: replace the `localStorage.removeItem` + `dispatchEvent` + `setData` block with `setCart([])` from the hook (which debounce-saves the empty array to Firestore for authenticated users, or to localStorage for guests).

  The `carzone-storage` listener in the existing `useEffect` can be removed entirely — `UserCabinet` now gets its data directly from the hook's state, which is the source of truth. The header still uses its own listener (step 5), so the event dispatch from `useUserData` still serves that purpose.

  Files: `src/components/UserCabinet.jsx`

  Verify: `npm run build` — build succeeds, no undefined variable errors.

---

- [ ] 5. Update `Header.jsx` to seed initial counts from Firestore on login.

  The existing `carzone-storage` event listener stays and handles all real-time count updates after toggles. The only gap is the very first render after a page load when the user is already authenticated — `localStorage` may be empty (or stale from a different account), so counts show 0 until a toggle fires.

  Add a second `useEffect` that watches `user`:
  - When `user` becomes non-null (login or page reload with active session): call `getDoc(doc(db, 'users', user.uid))`, then `setFavoritesCount(data?.favorites?.length ?? 0)` and `setCartCount(data?.cart?.length ?? 0)`.
  - When `user` becomes null (logout): reset both counts to `0`.

  Import `doc`, `getDoc` from `firebase/firestore` and `db` from `../firebase`.

  This effect has `[user]` as its dependency array. The existing `syncCounts` effect that reads localStorage is kept for guest users (when `user` is null it reads localStorage counts correctly on page load and on `carzone-storage` events).

  Files: `src/components/Header.jsx`

  Verify: `npm run build` — build succeeds. Manual verification: log in, navigate to `/` — header badges show the correct counts from Firestore without needing to toggle anything first.

---

## Build command

```
npm run build
```
(run from `c:\Users\user\OneDrive\Desktop\Проект экзамен\project`)

No automated test suite exists. Each step's verification is the Vite build succeeding without errors. After all steps, do a full manual smoke-test: log in, toggle a favorite, reload the page, confirm badge count and UserCabinet list are consistent. Log out and back in with a different account, confirm the previous account's data does not appear.
