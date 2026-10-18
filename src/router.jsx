import { createHashRouter, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import AdminLayout from './layout/AdminLayout'
import HomePage from './components/HomePage'
import AuthForm from './components/AuthForm'
import AdminDashboard from './components/AdminDashboard'
import AdminCarsPage from './components/AdminCarsPage'
import AdminUsersPage from './components/AdminUsersPage'
import AdminOrdersPage from './components/AdminOrdersPage'
import AdminReviewsPage from './components/AdminReviewsPage'
import UserCabinet from './components/UserCabinet'
import ProtectedRoute from './components/ProtectedRoute'
import CarsPage from './pages/CarsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CarDetailPage from './pages/CarDetailPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'cars',
        element: <CarsPage />,
      },
      {
        path: 'cars/:id',
        element: <CarDetailPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'login',
        element: <AuthForm mode="login" />,
      },
      {
        path: 'register',
        element: <AuthForm mode="register" />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserCabinet />
          </ProtectedRoute>
        ),
      },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserCabinet />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserCabinet />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'cars',
            element: <AdminCarsPage />,
          },
          {
            path: 'users',
            element: <AdminUsersPage />,
          },
          {
            path: 'orders',
            element: <AdminOrdersPage />,
          },
          {
            path: 'reviews',
            element: <AdminReviewsPage />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

export default router
