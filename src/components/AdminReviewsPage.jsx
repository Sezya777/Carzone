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

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const q = firestoreQuery(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }, () => setReviews([]))

    return () => unsub()
  }, [])

  const handleDelete = async (id) => {
    if (!id) return
    if (!window.confirm('Удалить отзыв?')) return

    try {
      await deleteDoc(doc(db, 'reviews', id))
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="small-title">УПРАВЛЕНИЕ ОТЗЫВАМИ</p>
          <h2>Отзывы клиентов</h2>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <h3>Все отзывы ({reviews.length})</h3>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Автор</th>
                <th>Оценка</th>
                <th>Текст</th>
                <th>Дата</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">Отзывы ещё не добавлены.</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id}>
                    <td>{review.author || 'Аноним'}</td>
                    <td>
                      {Array.from({ length: 5 }, (_, index) => {
                        const safeRating = Math.min(5, Math.max(1, Number(review.rating || 0)))
                        return (
                          <span key={index} className={index < safeRating ? 'star filled' : 'star'}>
                            ★
                          </span>
                        )
                      })}
                    </td>
                    <td>{review.text || '—'}</td>
                    <td>
                      {review.createdAt?.toDate
                        ? review.createdAt.toDate().toLocaleDateString('ru-RU')
                        : '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => handleDelete(review.id)}
                      >
                        Удалить
                      </button>
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
