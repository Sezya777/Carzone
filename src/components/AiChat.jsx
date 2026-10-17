import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `Ты AI-помощник автосалона CARZONE. 
Автосалон продаёт премиальные автомобили: BMW, Mercedes, Porsche, Toyota, Land Rover и другие.
Категории: спортивные, седаны, SUV. Цены от $32,000 до $155,000.
Контакты: email islamovasezi@gmail.com, WhatsApp +996500120726, Instagram @skk023_.
Ты помогаешь клиентам выбрать авто, отвечаешь на вопросы про машины, характеристики, цены, оформление заказа, тест-драйв.
Отвечай коротко и по делу. Пиши на русском языке.`

async function askAI(messages) {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_KEY
    if (!apiKey) throw new Error('No API key')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'CARZONE AI Assistant',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) throw new Error('API error')
    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'Не удалось получить ответ.'
  } catch {
    return null
  }
}

// Локальные ответы как запасной вариант
const LOCAL_ANSWERS = {
  'наличии': 'В каталоге есть спортивные авто, седаны и внедорожники. Перейдите в раздел "Автомобили" чтобы посмотреть все модели.',
  'заказ': 'Добавьте авто в корзину → Личный кабинет → "Оформить заказ". Укажите имя, телефон и адрес.',
  'тест-драйв': 'Перейдите в "Контакты" и заполните форму. Укажите имя, номер и желаемую дату.',
  'привет': 'Привет! Я AI-помощник CARZONE. Чем могу помочь?',
  'цен': 'Цены от $32,000 до $155,000. Смотрите на карточках автомобилей.',
  'bmw': 'BMW M5 — 600 л.с., разгон 3.4 сек, цена $110,000.',
  'mercedes': 'Mercedes AMG GT — 585 л.с., 3.2 сек, $140,000. Также есть Mercedes GLS — 489 л.с., $135,000.',
  'porsche': 'Porsche 911 — 450 л.с., разгон 3.7 сек, цена $125,000.',
  'range rover': 'Range Rover — 530 л.с., полный привод 4x4, цена $155,000.',
  'camry': 'Toyota Camry — 203 л.с., расход 6.5л/100км, цена $32,000.',
  'регистр': 'Нажмите "Регистрация" в шапке сайта. Введите имя, email и пароль.',
  'контакт': 'Email: islamovasezi@gmail.com, WhatsApp: +996 500 12 07 26, Instagram: @skk023_',
  'спасибо': 'Пожалуйста! Если есть ещё вопросы — всегда готов помочь.',
}

function getLocalAnswer(text) {
  const lower = text.toLowerCase()
  for (const [key, answer] of Object.entries(LOCAL_ANSWERS)) {
    if (lower.includes(key)) return answer
  }
  return 'Интересный вопрос! Для детальной консультации свяжитесь с нами: WhatsApp +996 500 12 07 26 или email islamovasezi@gmail.com'
}

const SUGGESTIONS = [
  'Какие авто есть?',
  'Как оформить заказ?',
  'Тест-драйв',
  'Цены на BMW',
]

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Привет! Я AI-помощник CARZONE. Задайте любой вопрос об автомобилях!' }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')

    const userMsg = { role: 'user', text: msg }
    setMessages((prev) => [...prev, userMsg])
    setTyping(true)

    // Формируем историю для API
    const history = [...messages, userMsg]
      .filter((m) => m.role !== 'assistant' || messages.indexOf(m) > 0)
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }))

    // Пробуем AI, если не работает — локальный ответ
    const aiAnswer = await askAI(history)
    const answer = aiAnswer || getLocalAnswer(msg)

    setMessages((prev) => [...prev, { role: 'assistant', text: answer }])
    setTyping(false)
  }

  return (
    <>
      <button
        type="button"
        className="ai-chat-fab"
        onClick={() => setOpen((p) => !p)}
        title="AI Помощник"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <circle cx="9" cy="10" r="1" fill="currentColor"/>
            <circle cx="12" cy="10" r="1" fill="currentColor"/>
            <circle cx="15" cy="10" r="1" fill="currentColor"/>
          </svg>
        )}
      </button>

      {open && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-chat-avatar">AI</div>
            <div>
              <strong>AI Помощник</strong>
              <span>CARZONE · онлайн</span>
            </div>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ai-msg-${msg.role === 'user' ? 'user' : 'bot'}`}>
                {msg.text}
              </div>
            ))}
            {typing && (
              <div className="ai-msg ai-msg-bot ai-typing">
                <span/><span/><span/>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="ai-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="ai-suggestion-btn" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="ai-chat-input-wrap">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Задайте любой вопрос..."
              className="ai-chat-input"
            />
            <button type="button" className="ai-send-btn" onClick={() => sendMessage()}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
