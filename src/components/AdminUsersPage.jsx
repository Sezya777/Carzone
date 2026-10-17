import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
} from 'firebase/firestore'
import { db } from '../firebase'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const q = firestoreQuery(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }, () => setUsers([]))
    return () => unsub()
  }, [])

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="small-title">УПРАВЛЕНИЕ АККАУНТАМИ</p>
          <h2>Пользователи</h2>
        </div>
        <span className="role-badge">{users.length} чел.</span>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <h3>Все пользователи ({users.length})</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">Пользователи не найдены.</td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id || user.email}>
                    <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="profile-avatar" style={{ width: 34, height: 34, fontSize: '0.9rem' }}>
                          {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <strong>{user.displayName || 'Без имени'}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{user.email || '—'}</td>
                    <td>
                      <span className={`status-pill ${user.role === 'admin' ? 'success' : 'info'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                      {user.createdAt?.toDate
                        ? user.createdAt.toDate().toLocaleDateString('ru-RU')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
