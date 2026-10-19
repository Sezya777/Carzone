import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../store/authSlice'

const adminNav = [
  { label: 'Дашборд', to: '/admin' },
  { label: 'Авто', to: '/admin/cars' },
  { label: 'Пользователи', to: '/admin/users' },
  { label: 'Заказы', to: '/admin/orders' },
  { label: 'Отзывы', to: '/admin/reviews' },
]

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return null
}

export default function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/')
  }

  return (
    <div className="admin-shell">
      <ScrollToTop />
      <aside className="admin-sidebar">
        {/* Заголовок */}
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-title">Админ панель</span>
        </div>

        {/* Навигация */}
        <nav className="admin-nav">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Профиль и выход внизу */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">
              {(user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="admin-sidebar-user-info">
              <strong>{user?.displayName || 'Администратор'}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button type="button" className="admin-logout-btn" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
