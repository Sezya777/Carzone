import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AiChat from '../components/AiChat'
import { UserDataProvider } from '../context/UserDataContext'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return null
}

export default function MainLayout() {
  return (
    <UserDataProvider>
      <div className="page-shell">
        <ScrollToTop />
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <AiChat />
      </div>
    </UserDataProvider>
  )
}
