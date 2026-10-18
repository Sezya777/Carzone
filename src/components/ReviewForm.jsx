import { useState } from 'react'

export default function ReviewForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ author: '', rating: 1, text: '' })
  const currentRating = Number(form.rating) || 1

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleanText = form.text.trim()
    if (!cleanText) return

    onSubmit({ author: form.author.trim() || 'Аноним', rating: currentRating, text: cleanText })
    setForm({ author: '', rating: 1, text: '' })
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={form.author}
        onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
        placeholder="Ваше имя"
      />

      <div className="star-rating">
        <label className="review-rating-label">Оценка:</label>
        <div className="star-rating-buttons" role="radiogroup" aria-label="Оценка">
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1
            return (
              <button
                key={value}
                type="button"
                className={value <= currentRating ? 'star-btn active' : 'star-btn'}
                onClick={() => setForm((p) => ({ ...p, rating: Number(value) }))}
                aria-label={`Оценка ${value}`}
                aria-pressed={value === currentRating}
              >
                ★
              </button>
            )
          })}
        </div>
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
