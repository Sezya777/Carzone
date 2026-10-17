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

          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={form.password}
            onChange={handleChange}
            minLength="6"
            required
          />

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
