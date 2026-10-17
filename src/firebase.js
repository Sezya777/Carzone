import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBoBn2DpuoIyZL-fgtBvvp6qv4_IAebi50',
  authDomain: 'cars-5cba5.firebaseapp.com',
  projectId: 'cars-5cba5',
  storageBucket: 'cars-5cba5.firebasestorage.app',
  messagingSenderId: '49458092133',
  appId: '1:49458092133:web:ec4f8f6d0d292f51034e8c',
  measurementId: 'G-GF0WFKXD5W',
}

const app = initializeApp(firebaseConfig)

export const analytics = getAnalytics(app)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
