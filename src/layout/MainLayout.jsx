import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AiChat from '../components/AiChat'
import { UserDataProvider } from '../context/UserDataContext'

export default function MainLayout() {
  return (
    <UserDataProvider>
      <div className="page-shell">
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
