export default function ReviewCard({ review, onDelete }) {
  const safeRating = Math.min(5, Math.max(1, Number(review?.rating) || 0))
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < safeRating ? 'star filled' : 'star'}>★</span>
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
      <div className="review-footer">
        <span className="review-date">{date}</span>
        {onDelete && (
          <button type="button" className="ghost-btn review-delete-btn" onClick={() => onDelete(review.id)}>
            Удалить
          </button>
        )}
      </div>
    </div>
  )
}
