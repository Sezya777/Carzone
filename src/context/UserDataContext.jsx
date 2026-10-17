import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const readStorageList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

const UserDataContext = createContext(null)

export function UserDataProvider({ children }) {
  const user = useSelector((state) => state.auth.user)

  const [favorites, setFavorites] = useState([])
  const [cart, setCartState] = useState([])

  // Keep refs so debounce callbacks always see the latest values
  const userRef = useRef(user)
  const favoritesRef = useRef(favorites)
  const cartRef = useRef(cart)

  useEffect(() => { userRef.current = user }, [user])
  useEffect(() => { favoritesRef.current = favorites }, [favorites])
  useEffect(() => { cartRef.current = cart }, [cart])

  // Guard: skip persist/dispatch during the initial data load
  const isInitialLoadRef = useRef(true)
  const saveTimerRef = useRef(null)

  // Load data when user identity changes (login / logout / page reload)
  useEffect(() => {
    let cancelled = false

    isInitialLoadRef.current = true

    if (user?.uid) {
      // Authenticated: load from Firestore
      const guestFavorites = readStorageList('carzone-favorites')
      const guestCart = readStorageList('carzone-cart')

      getDoc(doc(db, 'users', user.uid))
        .then((snap) => {
          if (cancelled) return

          const d = snap.exists() ? snap.data() : {}
          const firestoreFavorites = Array.isArray(d.favorites) ? d.favorites : []
          const firestoreCart = Array.isArray(d.cart) ? d.cart : []

          let mergedFavorites = firestoreFavorites
          let mergedCart = firestoreCart

          // Only migrate guest data into truly new accounts (doc has never been created)
          if (!snap.exists() && (guestFavorites.length > 0 || guestCart.length > 0)) {
            mergedFavorites = guestFavorites
            mergedCart = guestCart
            setDoc(
              doc(db, 'users', user.uid),
              { favorites: mergedFavorites, cart: mergedCart },
              { merge: true },
            ).catch(() => {})
          }

          // Mirror into localStorage so the Header's carzone-storage listener always
          // reads correct counts; also clears stale data from other accounts
          localStorage.setItem('carzone-favorites', JSON.stringify(mergedFavorites))
          localStorage.setItem('carzone-cart', JSON.stringify(mergedCart))

          setFavorites(mergedFavorites)
          setCartState(mergedCart)
          isInitialLoadRef.current = false

          // Seed the Header badge counts from the freshly-loaded data
          window.dispatchEvent(new Event('carzone-storage'))
        })
        .catch(() => {
          if (cancelled) return
          setFavorites([])
          setCartState([])
          isInitialLoadRef.current = false
          window.dispatchEvent(new Event('carzone-storage'))
        })
    } else {
      // Guest: load from localStorage
      const gFavorites = readStorageList('carzone-favorites')
      const gCart = readStorageList('carzone-cart')
      setFavorites(gFavorites)
      setCartState(gCart)
      isInitialLoadRef.current = false
      window.dispatchEvent(new Event('carzone-storage'))
    }

    return () => { cancelled = true }
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced persist on every favorites / cart change
  useEffect(() => {
    if (isInitialLoadRef.current) return

    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const currentUser = userRef.current
      const currentFavorites = favoritesRef.current
      const currentCart = cartRef.current

      localStorage.setItem('carzone-favorites', JSON.stringify(currentFavorites))
      localStorage.setItem('carzone-cart', JSON.stringify(currentCart))

      if (currentUser?.uid) {
        setDoc(
          doc(db, 'users', currentUser.uid),
          { favorites: currentFavorites, cart: currentCart },
          { merge: true },
        ).catch(() => {})
      }

      // Dispatch AFTER localStorage has been written so syncCounts reads updated values
      window.dispatchEvent(new Event('carzone-storage'))
    }, 500)

    return () => clearTimeout(saveTimerRef.current)
  }, [favorites, cart]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFavorite = (car) => {
    const key = car.id || car.name
    setFavorites((prev) => {
      const exists = prev.some((item) => (item.id || item.name) === key)
      return exists
        ? prev.filter((item) => (item.id || item.name) !== key)
        : [...prev, { ...car, id: key }]
    })
  }

  const toggleCart = (car) => {
    const key = car.id || car.name
    setCartState((prev) => {
      const exists = prev.some((item) => (item.id || item.name) === key)
      return exists
        ? prev.filter((item) => (item.id || item.name) !== key)
        : [...prev, { ...car, id: key }]
    })
  }

  const setCart = (newCart) => {
    setCartState(newCart)
  }

  return (
    <UserDataContext.Provider value={{ favorites, cart, toggleFavorite, toggleCart, setCart }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserDataContext() {
  const ctx = useContext(UserDataContext)
  if (!ctx) throw new Error('useUserDataContext must be used inside UserDataProvider')
  return ctx
}
