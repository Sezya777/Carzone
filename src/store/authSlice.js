import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const ADMIN_EMAIL = 'admin@carzone.com'

const resolveRole = (email, savedRole) => {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (normalizedEmail === ADMIN_EMAIL || savedRole === 'admin') {
    return 'admin'
  }
  return 'user'
}

const initialState = {
  user: null,
  status: 'idle',
  error: null,
}

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const finalRole = resolveRole(user.email, 'user')

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: displayName || '',
          role: finalRole,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.data() || {}

      return {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || displayName || '',
        role: resolveRole(user.email, userData.role || finalRole),
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Получаем данные из Firestore
      const userDocRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userDocRef)
      let userData = userSnap.data() || {}

      // Если документа нет — создаём (например для первого входа admin@carzone.com)
      if (!userSnap.exists()) {
        const role = resolveRole(user.email, 'user')
        const newData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || (role === 'admin' ? 'Администратор' : ''),
          role,
          createdAt: serverTimestamp(),
        }
        await setDoc(userDocRef, newData)
        userData = newData
      }

      const role = resolveRole(user.email, userData.role || 'user')

      // Если это admin — убедимся что роль записана в Firestore
      if (role === 'admin' && userData.role !== 'admin') {
        await setDoc(userDocRef, { role: 'admin' }, { merge: true })
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || user.displayName || '',
        role,
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth)
      return null
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload
      state.status = 'succeeded'
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Ошибка регистрации'
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Ошибка входа'
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Ошибка выхода'
      })
  },
})

export const { setAuthUser, clearError } = authSlice.actions
export default authSlice.reducer
