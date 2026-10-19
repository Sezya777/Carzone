import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { addDoc, collection, onSnapshot, orderBy, query as firestoreQuery, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import 'swiper/css'

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const reviewsRef = firestoreQuery(collection(db, 'reviews'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
      const nextReviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setReviews((prev) => {
        const map = new Map(prev.map((item) => [item.id, item]))
        nextReviews.forEach((item) => map.set(item.id, item))
        return Array.from(map.values()).sort((a, b) => {
          const aTime = a.createdAt?.seconds ?? 0
          const bTime = b.createdAt?.seconds ?? 0
          return bTime - aTime
        })
      })
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

  const hasCarousel = reviews.length > 3

  return (
    <section className="reviews-section" id="reviews">
      <div className="section-title">
        <p>ОТЗЫВЫ</p>
        <h2>Что говорят клиенты</h2>
      </div>

      {reviews.length === 0 ? (
        <p className="empty-state">Пока нет отзывов. Будьте первым!</p>
      ) : hasCarousel ? (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={3}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            980: { slidesPerView: 3 }
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          className="reviews-swiper"
        >
          {reviews.map((r) => (
            <SwiperSlide key={r.id} className="reviews-swiper-slide">
              <ReviewCard review={r} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="reviews-grid">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}

      <div className="reviews-form-wrap">
        <h3>Оставить отзыв</h3>
        <ReviewForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </section>
  )
}
