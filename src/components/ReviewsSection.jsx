import { useEffect, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query as firestoreQuery, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const reviewsRef = firestoreQuery(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
      setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    }, () => setReviews([]))
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, 'reviews'), { ...data, createdAt: serverTimestamp() })
    } catch (err) {
      console.error('Review save error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="reviews-section" id="reviews">
      <div className="section-title">
        <p>ОТЗЫВЫ</p>
        <h2>Что говорят клиенты</h2>
      </div>
      <div className="reviews-grid">
        {reviews.length === 0
          ? <p className="empty-state">Пока нет отзывов. Будьте первым!</p>
          : reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        }
      </div>
      <div className="reviews-form-wrap">
        <h3>Оставить отзыв</h3>
        <ReviewForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </section>
  )
}
