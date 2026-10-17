import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'ky', label: 'KY' },
]

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('carzone-theme') || 'dark')
  const toggle = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('carzone-theme', next)
      return next
    })
  }
  return { theme, toggle }
}

export default function BurgerMenu({ user, favorites = [], cart = [], onLogout }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { theme, toggle: toggleTheme } = useTheme()

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const navLinks = [
    { to: '/', label: t('nav.home', 'Главная') },
    { to: '/cars', label: t('nav.cars', 'Автомобили') },
    { to: '/about', label: t('nav.about', 'О нас') },
    { to: '/contact', label: t('nav.contact', 'Контакты') },
  ]

  const changeLang = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('carzone-lang', code)
  }

  return (
    <>
      <button className="burger-btn" aria-label="Меню" onClick={() => setOpen(v => !v)}>
        <span className={`burger-line ${open ? 'burger-line--top-open' : ''}`} />
        <span className={`burger-line ${open ? 'burger-line--mid-open' : ''}`} />
        <span className={`burger-line ${open ? 'burger-line--bot-open' : ''}`} />
      </button>

      {open && createPortal(
        <div className="mobile-menu" role="dialog">
          <div className="mobile-menu-inner" ref={menuRef}>

            {/* Закрыть */}
            <button className="mobile-menu-close" onClick={() => setOpen(false)}>✕</button>

            {/* Навигация */}
            <nav className="mobile-nav">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Тема и язык */}
            <div className="mobile-settings">
              {/* Тёмная/светлая тема */}
              <div className="mobile-setting-row">
                <span>Тема</span>
                <div className="mobile-lang-btns">
                  <button
                    type="button"
                    className={`mobile-lang-btn${theme === 'dark' ? ' active' : ''}`}
                    onClick={() => { if (theme !== 'dark') toggleTheme() }}
                  >
                    Ночь
                  </button>
                  <button
                    type="button"
                    className={`mobile-lang-btn${theme === 'light' ? ' active' : ''}`}
                    onClick={() => { if (theme !== 'light') toggleTheme() }}
                  >
                    День
                  </button>
                </div>
              </div>

              {/* Язык */}
              <div className="mobile-setting-row">
                <span>Язык</span>
                <div className="mobile-lang-btns">
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      type="button"
                      className={`mobile-lang-btn${i18n.language === l.code ? ' active' : ''}`}
                      onClick={() => changeLang(l.code)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Авторизован */}
            {user && (
              <div className="mobile-menu-user">
                {user.role !== 'admin' && (
                  <div className="mobile-menu-actions">
                    <Link to="/favorites" className="mobile-action-link" onClick={() => setOpen(false)}>
                      ♡ Избранное {favorites.length > 0 && <span className="mobile-badge">{favorites.length}</span>}
                    </Link>
                    <Link to="/cart" className="mobile-action-link" onClick={() => setOpen(false)}>
                      Корзина {cart.length > 0 && <span className="mobile-badge">{cart.length}</span>}
                    </Link>
                    <Link to="/profile" className="mobile-action-link" onClick={() => setOpen(false)}>
                      Личный кабинет
                    </Link>
                  </div>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="mobile-action-link" onClick={() => setOpen(false)}>
                    Админ панель
                  </Link>
                )}
                <button className="mobile-logout-btn" onClick={() => { onLogout?.(); setOpen(false) }}>
                  Выйти
                </button>
              </div>
            )}

            {/* Не авторизован */}
            {!user && (
              <div className="mobile-menu-auth">
                <Link to="/login" className="primary-btn" style={{ textAlign: 'center', display: 'block' }} onClick={() => setOpen(false)}>
                  Войти
                </Link>
                <Link to="/register" className="ghost-btn" style={{ textAlign: 'center', display: 'block', marginTop: 8 }} onClick={() => setOpen(false)}>
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
