import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import AdminStatsGrid from './AdminStatsGrid'
import CarTableRow from './CarTableRow'
import AddCarModal from './AddCarModal'
import UserListItem from './UserListItem'
import RequestListItem from './RequestListItem'
import AdminQuickActions from './AdminQuickActions'
import ChartSection from './ChartSection'

const initialForm = {
  name: '',
  brand: '',
  category: 'sport',
  power: '',
  stat: '',
  price: '',
  image: null,
}

const parsePriceValue = (value) => {
  if (!value) return 0
  const cleaned = String(value).replace(/[^\d]/g, '')
  return Number(cleaned || 0)
}

// Конвертируем файл в base64
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [cars, setCars] = useState([])
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const carsRef = firestoreQuery(collection(db, 'cars'), orderBy('createdAt', 'desc'))
    const usersRef = firestoreQuery(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const requestsRef = firestoreQuery(collection(db, 'requests'), orderBy('createdAt', 'desc'))
    const ordersRef = firestoreQuery(collection(db, 'orders'), orderBy('createdAt', 'desc'))

    const unsubscribeCars = onSnapshot(
      carsRef,
      (snapshot) => {
        setCars(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
      },
      () => setCars([]),
    )

    const unsubscribeUsers = onSnapshot(
      usersRef,
      (snapshot) => {
        setUsers(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
      },
      () => setUsers([]),
    )

    const unsubscribeRequests = onSnapshot(
      requestsRef,
      (snapshot) => {
        setRequests(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
      },
      () => setRequests([]),
    )

    const unsubscribeOrders = onSnapshot(
      ordersRef,
      (snapshot) => {
        setOrders(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })))
      },
      () => setOrders([]),
    )

    return () => {
      unsubscribeCars()
      unsubscribeUsers()
      unsubscribeRequests()
      unsubscribeOrders()
    }
  }, [])

  const dashboardStats = useMemo(
    () => [
      { label: 'Авто в каталоге', value: String(cars.length), growth: '+12.4%' },
      { label: 'Пользователей', value: String(users.length || '0'), growth: '+8.1%' },
      { label: 'Заявок', value: String(requests.length || '0'), growth: '+5.2%' },
      {
        label: 'Доход',
        value: `$${new Intl.NumberFormat('en-US').format(
          Math.round(cars.reduce((sum, car) => sum + parsePriceValue(car.price), 0) / 1000),
        )}K`,
        growth: '+18.7%',
      },
    ],
    [cars, requests.length, users.length],
  )

  const openModal = () => {
    setMessage('')
    setForm(initialForm)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setMessage('')
  }

  const handleChange = (event) => {
    const { name, value, files } = event.target

    if (name === 'image') {
      setForm((prev) => ({ ...prev, image: files[0] || null }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDeleteCar = async (id) => {
    if (!id) return

    const confirmed = window.confirm('Удалить автомобиль из каталога?')
    if (!confirmed) return

    try {
      await deleteDoc(doc(db, 'cars', id))
      setMessage('Автомобиль удалён')
    } catch (error) {
      setMessage(error.message || 'Не удалось удалить автомобиль')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name || !form.brand || !form.image) {
      setMessage('Заполните название, бренд и выберите фото')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      // Конвертируем изображение в base64 и сохраняем в Firestore
      const imageBase64 = await fileToBase64(form.image)

      await addDoc(collection(db, 'cars'), {
        name: form.name,
        brand: form.brand,
        category: form.category,
        badge: form.category.toUpperCase(),
        power: form.power,
        stat: form.stat,
        price: form.price,
        image: imageBase64,
        inStock: true,
        createdAt: serverTimestamp(),
      })

      setForm(initialForm)
      setMessage('Автомобиль успешно добавлен')
      setTimeout(() => {
        closeModal()
      }, 700)
    } catch (error) {
      setMessage(error.message || 'Ошибка при добавлении автомобиля')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="small-title">АДМИН ПАНЕЛЬ</p>
          <h2>Добро пожаловать, {user?.displayName || user?.email}</h2>
        </div>
        <div className="header-actions">
          <span className="role-badge">{user?.role}</span>
          <button type="button" className="ghost-btn" onClick={() => setMessage('')}>Обновить</button>
        </div>
      </div>

      <AdminStatsGrid stats={dashboardStats} />

      <div className="admin-main-grid">
        <div className="panel-card wide-panel">
          <div className="panel-header">
            <h3>Автомобили в каталоге</h3>
            <button type="button" className="mini-btn" onClick={openModal}>Добавить</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Модель</th>
                  <th>Бренд</th>
                  <th>Статус</th>
                  <th>Цена</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {cars.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">Автомобили ещё не добавлены.</td>
                  </tr>
                ) : (
                  cars.map((car) => (
                    <CarTableRow key={car.id || car.name} car={car} onDelete={handleDeleteCar} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AdminQuickActions onAddCar={openModal} />
      </div>

      <AddCarModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        form={form}
        onChange={handleChange}
        loading={loading}
        message={message}
      />

      <div className="admin-bottom-grid">
        <div className="panel-card">
          <div className="panel-header">
            <h3>Пользователи</h3>
          </div>

          <div className="list-block">
            {users.length === 0 ? (
              <p className="empty-state">Пользователи не найдены.</p>
            ) : (
              users.map((item) => (
                <UserListItem key={item.id || item.email} user={item} />
              ))
            )}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>Последние заявки</h3>
          </div>

          <div className="list-block">
            {requests.length === 0 ? (
              <p className="empty-state">Нет новых заявок.</p>
            ) : (
              requests.map((request) => (
                <RequestListItem key={request.id} request={request} />
              ))
            )}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>Заявки на покупку</h3>
          </div>

          <div className="list-block">
            {orders.length === 0 ? (
              <p className="empty-state">Нет заявок на покупку.</p>
            ) : (
              orders.map((order) => (
                <RequestListItem key={order.id} request={order} />
              ))
            )}
          </div>
        </div>
      </div>

      <ChartSection requests={requests} />
    </section>
  )
}
