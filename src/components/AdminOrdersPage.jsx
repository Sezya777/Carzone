import { useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
} from 'firebase/firestore'
import { db } from '../firebase'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [requests, setRequests] = useState([])

  useEffect(() => {
    const qOrders = firestoreQuery(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsubOrders = onSnapshot(
      qOrders,
      (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, _col: 'orders', ...d.data() }))),
      () => setOrders([]),
    )

    const qRequests = firestoreQuery(collection(db, 'requests'), orderBy('createdAt', 'desc'))
    const unsubRequests = onSnapshot(
      qRequests,
      (snap) => setRequests(snap.docs.map((d) => ({ id: d.id, _col: 'requests', ...d.data() }))),
      () => setRequests([]),
    )

    return () => {
      unsubOrders()
      unsubRequests()
    }
  }, [])

  // Объединяем и сортируем по дате (новые сверху)
  const combined = [...orders, ...requests].sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() ?? new Date(0)
    const dateB = b.createdAt?.toDate?.() ?? new Date(0)
    return dateB - dateA
  })

  const handleDelete = async (collectionName, id) => {
    if (!window.confirm('Удалить запись?')) return
    try {
      await deleteDoc(doc(db, collectionName, id))
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="small-title">УПРАВЛЕНИЕ ЗАЯВКАМИ</p>
          <h2>Все заявки</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="role-badge">Всего: {combined.length}</span>
          <span
            className="role-badge"
            style={{ background: 'rgba(127,230,176,0.1)', borderColor: 'rgba(127,230,176,0.28)', color: '#9ff0c1' }}
          >
            Покупка: {orders.length}
          </span>
          <span
            className="role-badge"
            style={{ background: 'rgba(124,187,255,0.1)', borderColor: 'rgba(124,187,255,0.28)', color: '#9dc9ff' }}
          >
            Тест-драйв: {requests.length}
          </span>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <h3>Заявки и заказы</h3>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Тип</th>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Автомобиль</th>
                <th>Дата / Адрес</th>
                <th>Комментарий</th>
                <th>Получено</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {combined.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-row">Заявок пока нет.</td>
                </tr>
              ) : (
                combined.map((item, index) => {
                  const isPurchase = item._col === 'orders'
                  const carText = isPurchase
                    ? Array.isArray(item.items)
                      ? item.items.map((i) => i.name).join(', ')
                      : item.car || '—'
                    : item.car || '—'
                  const dateOrAddress = isPurchase
                    ? item.address || '—'
                    : item.date || '—'
                  const comment = item.comment || '—'
                  const received = item.createdAt?.toDate
                    ? item.createdAt.toDate().toLocaleDateString('ru-RU')
                    : '—'

                  return (
                    <tr key={`${item._col}-${item.id}`}>
                      <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{index + 1}</td>
                      <td>
                        <span className={`status-pill ${isPurchase ? 'success' : 'info'}`}>
                          {isPurchase ? 'Покупка' : 'Тест-драйв'}
                        </span>
                      </td>
                      <td><strong>{item.name || 'Клиент'}</strong></td>
                      <td style={{ color: 'var(--muted)' }}>{item.phone || '—'}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {carText}
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{dateOrAddress}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.82rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {comment}
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{received}</td>
                      <td>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => handleDelete(item._col, item.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
