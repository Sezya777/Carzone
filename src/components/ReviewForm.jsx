import { useState } from 'react'

export default function ReviewForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ author: '', rating: 5, text: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ author: form.author.trim() || 'Аноним', rating: form.rating, text: form.text.trim() })
    setForm({ author: '', rating: 5, text: '' })
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={form.author}
        onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
        placeholder="Ваше имя"
      />

      {/* Звёздочки */}
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn${star <= form.rating ? ' active' : ''}`}
            onClick={() => setForm((p) => ({ ...p, rating: star }))}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={form.text}
        onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
        placeholder="Ваш отзыв..."
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : 'Оставить отзыв'}
      </button>
    </form>
  )
}
