import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import ContactForm from '../components/ContactForm'
import ContactLinks from '../components/ContactLinks'

const sendTelegramMessage = async (payload) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID
  if (!token || !chatId) return false
  const text = payload.overrideText || `Новая заявка\nИмя: ${payload.name}\nТелефон: ${payload.phone}`
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  return response.ok
}

const contacts = [
  {
    label: 'Email',
    value: 'islamovasezi@gmail.com',
    href: 'mailto:islamovasezi@gmail.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    value: '+996 500 12 07 26',
    href: 'https://wa.me/996500120726',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    value: '@skk023_',
    href: 'https://instagram.com/skk023_',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
]

export default function ContactPage() {
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (event, formType = 'test-drive') => {
    event.preventDefault()
    const form = event.currentTarget
    const isPurchase = formType === 'purchase'
    const payload = {
      name: form.name.value.trim() || 'Клиент',
      phone: form.phone.value.trim(),
      car: form.car?.value?.trim() || '',
      comment: form.message?.value?.trim() || '',
      type: formType,
      ...(isPurchase
        ? { address: form.address?.value?.trim() || '' }
        : { date: form.date?.value || '' }),
    }
    setIsSending(true)
    const telegramText = isPurchase
      ? `Заявка на покупку\n\nИмя: ${payload.name}\nТелефон: ${payload.phone}\nАвто: ${payload.car || '—'}\nАдрес: ${payload.address || '—'}\nКомментарий: ${payload.comment || '—'}`
      : `Запись на тест-драйв\n\nИмя: ${payload.name}\nТелефон: ${payload.phone}\nАвто: ${payload.car || '—'}\nДата: ${payload.date || '—'}\nКомментарий: ${payload.comment || '—'}`
    const sent = await sendTelegramMessage({ ...payload, overrideText: telegramText })
    let saved = false
    try {
      await addDoc(collection(db, isPurchase ? 'orders' : 'requests'), { ...payload, createdAt: serverTimestamp() })
      saved = true
    } catch (error) {
      console.error('Save error:', error)
    }
    if (sent || saved) {
      alert(`Спасибо, ${payload.name}! Ваша заявка отправлена.`)
      form.reset()
    } else {
      alert('Не удалось отправить заявку. Попробуйте позже.')
    }
    setIsSending(false)
  }

  return (
    <div className="contact-page-wrap">
      {/* Контактная информация */}
      <div className="contact-info-section">
        <p className="small-title">СВЯЖИТЕСЬ С НАМИ</p>
        <h2>Контакты</h2>
        <p className="contact-info-desc">Мы всегда на связи. Напишите нам в удобный мессенджер или оставьте заявку ниже.</p>

        <div className="contact-links">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link-card"
            >
              <span className="contact-link-icon">{c.icon}</span>
              <div>
                <span className="contact-link-label">{c.label}</span>
                <strong className="contact-link-value">{c.value}</strong>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Форма */}
      <ContactForm onSubmit={handleSubmit} isSending={isSending} />
    </div>
  )
}
