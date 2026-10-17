import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const sendTelegramMessage = async ({ name, phone, address, comment, itemsList }) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID
  if (!token || !chatId) return false

  const text = [
    'Новый заказ из корзины',
    '',
    `Покупатель: ${name}`,
    `Телефон: ${phone}`,
    `Адрес: ${address}`,
    `Товары: ${itemsList}`,
    comment ? `Комментарий: ${comment}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    return res.ok
  } catch {
    return false
  }
}

export default function OrderModal({ isOpen, onClose, cart, onOrderComplete, userEmail }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    setError('')
    const { name, value } = e.target

    // Для телефона — только разрешённые символы
    if (name === 'phone') {
      const filtered = value.replace(/[^\d\+\-\(\)\s]/g, '')
      setForm((prev) => ({ ...prev, phone: filtered }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Валидация имени
    if (form.name.trim().length < 2) {
      setError('Введите корректное имя (минимум 2 символа)')
      return
    }

    // Валидация телефона — только цифры, +, пробелы, скобки, тире
    const phoneClean = form.phone.replace(/[\s\-\(\)]/g, '')
    const phoneDigits = phoneClean.replace(/\D/g, '')
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setError('Введите корректный номер телефона (от 7 до 15 цифр)')
      return
    }

    // Валидация адреса
    if (form.address.trim().length < 5) {
      setError('Введите корректный адрес доставки')
      return
    }

    setSending(true)

    const itemsList = cart.map((c) => `${c.name} — ${c.price}`).join(', ')

    try {
      // 1. Сохраняем в Firestore коллекцию orders
      await addDoc(collection(db, 'orders'), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        comment: form.comment.trim(),
        items: cart,          // массив объектов авто
        itemsList,            // строка для отображения
        email: userEmail || '',
        type: 'purchase',
        status: 'new',
        createdAt: serverTimestamp(),
      })

      // 2. Отправляем в Telegram
      await sendTelegramMessage({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        comment: form.comment.trim(),
        itemsList,
      })

      alert(`Заказ оформлен! Спасибо, ${form.name}! Мы свяжемся с вами.`)
      setForm({ name: '', phone: '', address: '', comment: '' })
      onOrderComplete()
      onClose()
    } catch (err) {
      setError('Ошибка при оформлении заказа: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const total = cart.reduce((sum, car) => {
    const num = Number(String(car.price || '0').replace(/[^\d]/g, ''))
    return sum + num
  }, 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Оформить заказ</h3>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        {/* Список товаров */}
        <div className="order-items-list">
          {cart.map((car) => (
            <div key={car.id || car.name} className="order-item-row">
              <span>{car.name}</span>
              <strong>{car.price}</strong>
            </div>
          ))}
          {total > 0 && (
            <div className="order-item-row order-total">
              <span>Итого</span>
              <strong>${new Intl.NumberFormat('en-US').format(total)}</strong>
            </div>
          )}
        </div>

        <form className="admin-form modal-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ваше имя"
            required
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+996 XXX XX XX XX"
            required
          />
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Адрес доставки"
            required
          />
          <textarea
            name="comment"
            value={form.comment}
            onChange={handleChange}
            placeholder="Комментарий (необязательно)"
          />

          {error && <p className="admin-message" style={{ color: '#ff9a9a' }}>{error}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost-btn modal-cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" disabled={sending}>
              {sending ? 'Оформление...' : 'Подтвердить заказ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
