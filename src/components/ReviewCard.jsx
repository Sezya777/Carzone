import { useState } from 'react'

export default function ReviewCard({ review }) {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
  ))
  const date = review.createdAt?.toDate
    ? review.createdAt.toDate().toLocaleDateString('ru-RU')
    : (review.createdAt || '')
  return (
    <div className="review-card">
      <div className="review-header">
        <strong className="review-author">{review.author || 'Аноним'}</strong>
        <div className="review-stars">{stars}</div>
      </div>
      <p className="review-text">{review.text}</p>
      <span className="review-date">{date}</span>
    </div>
  )
}
