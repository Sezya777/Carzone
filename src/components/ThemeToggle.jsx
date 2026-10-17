import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('carzone-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('carzone-theme', theme)
  }, [theme])

  const toggle = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <button
      type="button"
      className={`theme-toggle-simple${theme === 'light' ? ' light' : ''}`}
      onClick={toggle}
      aria-label="Переключить тему"
    />
  )
}
