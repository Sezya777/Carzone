import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../store/authSlice'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import BurgerMenu from './BurgerMenu'

const readStorageCount = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(data) ? data.length : 0
  } catch {
    return 0
  }
}

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const { t } = useTranslation()
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const syncCounts = () => {
      setFavoritesCount(readStorageCount('carzone-favorites'))
      setCartCount(readStorageCount('carzone-cart'))
    }
    syncCounts()
    window.addEventListener('carzone-storage', syncCounts)
    return () => window.removeEventListener('carzone-storage', syncCounts)
  }, [])

  // Закрываем дропдаун при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const nav = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.cars'), to: '/cars' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.contact'), to: '/contact' },
  ]

  const handleLogout = async () => {
    setDropdownOpen(false)
    await dispatch(logoutUser())
    navigate('/')
  }

  const avatarLetter = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <header className="header">
      <Link to="/" className="logo">
        CAR<span>ZONE</span>
      </Link>

      <nav className="nav">
        {nav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-actions">
        <ThemeToggle />
        <LanguageSwitcher />

        {user ? (
          <>
            {user.role !== 'admin' && (
              <>
                <div className="header-divider" />
                <Link to="/favorites" className="header-icon-btn" title="Избранное">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {favoritesCount > 0 && <span className="header-badge">{favoritesCount}</span>}
                </Link>

                <Link to="/cart" className="header-icon-btn" title="Корзина">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
                </Link>
              </>
            )}

            {/* Аватар с дропдауном */}
            <div className="header-divider" />
            <div className="user-avatar-wrap" ref={dropdownRef}>
              <button
                type="button"
                className="user-avatar-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
                title={user.displayName || user.email}
              >
                {avatarLetter}
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">{avatarLetter}</div>
                    <div>
                      <strong>{user.displayName || 'Пользователь'}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="user-dropdown-divider" />

                  {user.role !== 'admin' && (
                    <>
                      <Link to="/profile" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        Личный кабинет
                      </Link>
                      <Link to="/favorites" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        Избранное {favoritesCount > 0 && `(${favoritesCount})`}
                      </Link>
                      <Link to="/cart" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        Корзина {cartCount > 0 && `(${cartCount})`}
                      </Link>
                      <div className="user-dropdown-divider" />
                    </>
                  )}

                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        Админ панель
                      </Link>
                      <div className="user-dropdown-divider" />
                    </>
                  )}

                  <button type="button" className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="ghost-btn login-btn">ВОЙТИ</Link>
            <Link to="/register" className="primary-btn small-btn register-btn">РЕГИСТРАЦИЯ</Link>
          </>
        )}
      </div>

      <BurgerMenu
        user={user}
        favorites={Array(favoritesCount).fill(null)}
        cart={Array(cartCount).fill(null)}
        onLogout={handleLogout}
      />
    </header>
  )
}
