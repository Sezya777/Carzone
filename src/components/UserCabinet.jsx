import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  collection,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import CartItem from './CartItem'
import FavoriteCard from './FavoriteCard'
import ProfileInfo from './ProfileInfo'
import OrderModal from './OrderModal'
import useUserData from '../hooks/useUserData'

const STATUS_LABEL = {
  new: 'Новый',
  processing: 'В обработке',
  done: 'Выполнен',
}

const STATUS_COLOR = {
  new: 'info',
  processing: 'warning',
  done: 'success',
}

export default function UserCabinet() {
  const user = useSelector((state) => state.auth.user)
  const location = useLocation()
  const [tab, setTab] = useState('profile')
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const { favorites, cart, setCart } = useUserData()

  useEffect(() => {
    const pathname = location.pathname
    if (pathname.includes('/favorites')) setTab('favorites')
    else if (pathname.includes('/cart')) setTab('cart')
    else if (pathname.includes('/orders')) setTab('orders')
    else setTab('profile')
  }, [location.pathname])

  // Загружаем заказы пользователя из Firestore по email
  useEffect(() => {
    if (!user?.email) return
    const q = firestoreQuery(
      collection(db, 'orders'),
      where('email', '==', user.email),
      orderBy('createdAt', 'desc'),
    )
    // Также ищем по имени если email не указан в заказе
    const qAll = firestoreQuery(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(qAll, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Фильтруем по email или phone пользователя
      setOrders(all)
    }, () => setOrders([]))
    return () => unsub()
  }, [user])

  const removeFromCart = (idOrName) => {
    setCart(cart.filter((c) => (c.id || c.name) !== idOrName))
  }

  if (!user) return <Navigate to="/login" replace />

  const accountTabs = [
    { key: 'profile', label: 'Профиль' },
    { key: 'favorites', label: `Избранное (${favorites.length})` },
    { key: 'cart', label: `Корзина (${cart.length})` },
    { key: 'orders', label: `Мои заказы` },
  ]

  return (
    <section className="profile-page">
      <div className="profile-shell">
        <aside className="profile-sidebar">
          <div className="profile-user-card">
            <div className="profile-avatar">
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.displayName || 'Пользователь'}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <nav className="profile-nav">
            {accountTabs.map((item) => (
              <button
                key={item.key}
                type="button"
                className={tab === item.key ? 'profile-tab active' : 'profile-tab'}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="profile-content">
          {/* Профиль */}
          {tab === 'profile' && <ProfileInfo user={user} />}

          {/* Избранное */}
          {tab === 'favorites' && (
            <div className="profile-panel">
              <div className="panel-header"><h3>Избранное</h3></div>
              {favorites.length === 0 ? (
                <p className="empty-state">Пока ничего не добавлено в избранное.</p>
              ) : (
                <div className="catalog-grid small-grid">
                  {favorites.map((car) => (
                    <FavoriteCard car={car} key={car.id || car.name} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Корзина */}
          {tab === 'cart' && (
            <div className="profile-panel">
              <div className="panel-header"><h3>Корзина</h3></div>
              {cart.length === 0 ? (
                <p className="empty-state">Корзина пуста.</p>
              ) : (
                <div className="cart-list">
                  {cart.map((car) => (
                    <CartItem car={car} key={car.id || car.name} onRemove={removeFromCart} />
                  ))}
                </div>
              )}
              <button
                type="button"
                className="primary-btn"
                style={{ marginTop: 16 }}
                disabled={cart.length === 0}
                onClick={() => setIsOrderModalOpen(true)}
              >
                Оформить заказ
              </button>
            </div>
          )}

          {/* Мои заказы */}
          {tab === 'orders' && (
            <div className="profile-panel">
              <div className="panel-header"><h3>Мои заказы</h3></div>
              {orders.length === 0 ? (
                <p className="empty-state">У вас пока нет заказов.</p>
              ) : (
                <div className="user-orders-list">
                  {orders.map((order) => {
                    const items = Array.isArray(order.items)
                      ? order.items
                      : order.itemsList
                        ? [{ name: order.itemsList }]
                        : []
                    const total = items.reduce((sum, item) => {
                      return sum + Number(String(item.price || '0').replace(/[^\d]/g, ''))
                    }, 0)
                    const date = order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleDateString('ru-RU')
                      : '—'
                    const status = order.status || 'new'

                    return (
                      <div key={order.id} className="user-order-card">
                        <div className="user-order-header">
                          <div>
                            <span className="user-order-date">{date}</span>
                            <strong className="user-order-id">#{order.id.slice(0, 8).toUpperCase()}</strong>
                          </div>
                          <span className={`status-pill ${STATUS_COLOR[status] || 'info'}`}>
                            {STATUS_LABEL[status] || 'Новый'}
                          </span>
                        </div>

                        {/* Список авто */}
                        <div className="user-order-items">
                          {items.length > 0 ? items.map((item, i) => (
                            <div key={i} className="user-order-item">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="user-order-item-img" />
                              )}
                              <div>
                                <strong>{item.name || order.car || '—'}</strong>
                                {item.price && <span>{item.price}</span>}
                              </div>
                            </div>
                          )) : (
                            <div className="user-order-item">
                              <div><strong>{order.car || order.itemsList || '—'}</strong></div>
                            </div>
                          )}
                        </div>

                        {/* Детали */}
                        <div className="user-order-footer">
                          <div className="user-order-meta">
                            {order.phone && <span>📞 {order.phone}</span>}
                            {order.address && <span>📍 {order.address}</span>}
                          </div>
                          {total > 0 && (
                            <strong className="user-order-total">
                              ${new Intl.NumberFormat('en-US').format(total)}
                            </strong>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        cart={cart}
        onOrderComplete={() => setCart([])}
        userEmail={user?.email}
      />
    </section>
  )
}
