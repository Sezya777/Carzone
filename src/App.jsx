import { useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { router } from './router'
import { setAuthUser } from './store/authSlice'
import { store } from './store/store'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const theme = localStorage.getItem('carzone-theme') || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userSnap = await getDoc(userRef)
        const userData = userSnap.data() || {}

        dispatch(
          setAuthUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData.displayName || firebaseUser.displayName || '',
            role: userData.role || 'user',
          }),
        )
      } else {
        dispatch(setAuthUser(null))
      }
    })

    return () => unsubscribe()
  }, [dispatch])

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}

export default function AppRoot() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}
