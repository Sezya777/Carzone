import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { clearError, loginUser, logoutUser, registerUser } from '../store/authSlice'

export default function AuthForm({ mode = 'login' }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, status, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    dispatch(clearError())
    setForm({ displayName: '', email: '', password: '' })
  }, [mode, dispatch])

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  }

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    dispatch(clearError())

    const thunk = mode === 'register' ? registerUser : loginUser
    const result = await dispatch(thunk(form))

    if (result.type.endsWith('/fulfilled')) {
      if (mode === 'register') {
        await dispatch(logoutUser())
        navigate('/login')
        return
      }

      const nextUser = result.payload
      navigate(nextUser?.role === 'admin' ? '/admin' : '/')
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>{mode === 'register' ? 'Регистрация' : 'Вход'}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <input
              type="text"
              name="displayName"
              placeholder="Ваше имя"
              value={form.displayName}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="auth-password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Пароль"
              value={form.password}
              onChange={handleChange}
              minLength="6"
              required
            />
            <span
              className="password-toggle-btn"
              role="button"
              tabIndex={0}
              onClick={() => setShowPassword((prev) => !prev)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setShowPassword((prev) => !prev)
                }
              }}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3.5 20.5 21M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M9.2 5.5A11 11 0 0 1 12 5c4.6 0 8.4 3.2 10 7a12.5 12.5 0 0 1-4.4 5.9M6.9 6.8A12.7 12.7 0 0 0 2 12c1.6 3.8 5.4 7 10 7 1.8 0 3.5-.4 5-1.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              )}
            </span>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading'
              ? 'Подождите...'
              : mode === 'register'
                ? 'Создать аккаунт'
                : 'Войти'}
          </button>

          <p className="auth-switch">
            {mode === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <Link to={mode === 'register' ? '/login' : '/register'}>
              {mode === 'register' ? 'Войти' : 'Зарегистрироваться'}
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}
