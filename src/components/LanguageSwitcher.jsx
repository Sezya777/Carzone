import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'ky', label: 'KY' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = LANGS.find((l) => l.code === i18n.language) || LANGS[0]
  const others = LANGS.filter((l) => l.code !== current.code)

  const handleChange = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('carzone-lang', code)
    setOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="lang-dropdown-wrap" ref={ref}>
      {/* Кнопка текущего языка */}
      <button
        type="button"
        className="lang-current-btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        {current.label}
        <svg
          className={`lang-chevron${open ? ' open' : ''}`}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Выпадающий список */}
      {open && (
        <div className="lang-dropdown">
          {others.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className="lang-dropdown-item"
              onClick={() => handleChange(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
