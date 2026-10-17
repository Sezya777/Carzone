import { useState } from 'react'

export default function ContactForm({ onSubmit, isSending }) {
  const [formType, setFormType] = useState('test-drive')

  return (
    <section className="contact" id="contact">
      <p className="small-title">КОНТАКТЫ</p>
      <h2>Оставьте заявку</h2>
      <p>Запишитесь на тест-драйв или оформите заявку на покупку — менеджер свяжется с вами.</p>

      {/* Переключатель типа */}
      <div className="contact-type-tabs">
        <button
          type="button"
          className={`contact-type-btn${formType === 'test-drive' ? ' active' : ''}`}
          onClick={() => setFormType('test-drive')}
        >
          Тест-драйв
        </button>
        <button
          type="button"
          className={`contact-type-btn${formType === 'purchase' ? ' active' : ''}`}
          onClick={() => setFormType('purchase')}
        >
          Заявка на покупку
        </button>
      </div>

      <form onSubmit={(e) => onSubmit(e, formType)}>
        {/* Скрытое поле типа */}
        <input type="hidden" name="formType" value={formType} />

        <input type="text" name="name" placeholder="Ваше имя" required />
        <input type="tel" name="phone" placeholder="Ваш номер телефона" required />
        <input type="text" name="car" placeholder="Модель автомобиля" />

        {formType === 'test-drive' ? (
          /* Поля для тест-драйва */
          <input type="date" name="date" placeholder="Желаемая дата" />
        ) : (
          /* Поля для покупки */
          <input type="text" name="address" placeholder="Адрес доставки / самовывоза" />
        )}

        <textarea
          name="message"
          placeholder={
            formType === 'test-drive'
              ? 'Пожелания по тест-драйву...'
              : 'Дополнительные пожелания к заказу...'
          }
        />

        <button type="submit" disabled={isSending}>
          {isSending
            ? 'Отправка...'
            : formType === 'test-drive'
              ? 'Записаться на тест-драйв'
              : 'Отправить заявку на покупку'}
        </button>
      </form>
    </section>
  )
}
