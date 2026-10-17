import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
} from 'firebase/firestore'
import { useTranslation } from 'react-i18next'
import { db } from '../firebase'
import HeroSection from './HeroSection'
import CarCarousel from './CarCarousel'
import AboutSection from './AboutSection'
import ReviewsSection from './ReviewsSection'
import ContactLinks from './ContactLinks'
import ContactForm from './ContactForm'
import CarModal from './CarModal'
import useUserData from '../hooks/useUserData'

const fallbackCars = [
  {
    name: 'BMW M5',
    brand: 'BMW',
    category: 'sport',
    badge: 'SPORT',
    power: '600 л.с.',
    stat: '3.4 сек',
    price: '$110,000',
    image:
      'https://hips.hearstapps.com/hmg-prod/images/2025-bmw-m5-115-671a7a8e94c11.jpg?crop=0.744xw:0.630xh;0.128xw,0.267xh&resize=2048:*',
  },
  {
    name: 'Mercedes AMG GT',
    brand: 'MERCEDES',
    category: 'sport',
    badge: 'SPORT',
    power: '585 л.с.',
    stat: '3.2 сек',
    price: '$140,000',
    image:
      'https://hips.hearstapps.com/hmg-prod/images/2025-mercedes-amg-gt-63-s-e-performance-108-6924bb6057075.jpg?crop=0.575xw:0.432xh;0.223xw,0.405xh&resize=1200:*',
  },
  {
    name: 'Toyota Camry',
    brand: 'TOYOTA',
    category: 'sedan',
    badge: 'SEDAN',
    power: '203 л.с.',
    stat: '6.5 л',
    price: '$32,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Toyota_Camry_AXVH80_2.5_HEV_Platinum_White_Pearl_Mica_05.jpg?utm_source=ru.wikipedia.org&utm_campaign=index&utm_content=original',
  },
  {
    name: 'Range Rover',
    brand: 'LAND ROVER',
    category: 'suv',
    badge: 'SUV',
    power: '530 л.с.',
    stat: '4x4',
    price: '$155,000',
    image: 'https://s.auto.drom.ru/i24315/r/photos/1463259/gen384_1736696.jpg',
  },
  {
    name: 'Porsche 911',
    brand: 'PORSCHE',
    category: 'sport',
    badge: 'SPORT',
    power: '450 л.с.',
    stat: '3.7 сек',
    price: '$125,000',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-SD3j9QCDqVCCeYgpSxHlMlWvStjES9lKKsrPkFoLiFVvYVJTiTc75xY&s=10',
  },
  {
    name: 'Mercedes GLS',
    brand: 'MERCEDES',
    category: 'suv',
    badge: 'SUV',
    power: '489 л.с.',
    stat: '4x4',
    price: '$135,000',
    image:
      'https://www.heraldnet.com/wp-content/uploads/sites/8/2023/11/34482176_web1_TSR-2024-GLS-SUV-GAL-002-K-FE-DR.jpg.jpg?w=1024',
  },
]

const sendTelegramMessage = async (payload) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('Telegram bot credentials are not configured.')
    return false
  }

  const text = payload.overrideText || `
📌 Новая запись на тест-драйв\n\n
Имя: ${payload.name}\n
Телефон: ${payload.phone}\n
Автомобиль: ${payload.car || 'Не указано'}\n
Дата: ${payload.date || 'Не указана'}\n
Комментарий: ${payload.comment || 'Нет комментария'}
  `.trim()

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })

  return response.ok
}

export default function HomePage() {
  const { t } = useTranslation()
  const [cars, setCars] = useState(fallbackCars)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCar, setSelectedCar] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const { favorites, cart, toggleFavorite, toggleCart } = useUserData()

  const normalizedCars = useMemo(
    () => cars.map((car, index) => ({
      ...car,
      id: car.id || `${String(car.name || 'car').trim().toLowerCase()}-${index}`,
      name: String(car.name || '').trim(),
      brand: String(car.brand || '').trim(),
      category: String(car.category || '').trim().toLowerCase(),
      badge: String(car.badge || car.category || 'AUTO').toUpperCase(),
      price: String(car.price || '').trim() || '$0',
      image: car.image || '',
    })),
    [cars],
  )

  const popularCars = useMemo(() => normalizedCars.filter((c) => c.category === 'sport'), [normalizedCars])
  const newCars = useMemo(() => normalizedCars.slice(0, 6), [normalizedCars])

  useEffect(() => {
    const carsRef = firestoreQuery(collection(db, 'cars'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      carsRef,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          badge: doc.data().category?.toUpperCase() || 'AUTO',
        }))

        if (list.length > 0) {
          setCars(list)
        }
        setIsLoading(false)
      },
      () => {
        setCars(fallbackCars)
        setIsLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const handleContactSubmit = async (event, formType = 'test-drive') => {
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
      ? `🛒 Заявка на покупку\n\nИмя: ${payload.name}\nТелефон: ${payload.phone}\nАвто: ${payload.car || '—'}\nАдрес: ${payload.address || '—'}\nКомментарий: ${payload.comment || '—'}`
      : `🚗 Запись на тест-драйв\n\nИмя: ${payload.name}\nТелефон: ${payload.phone}\nАвто: ${payload.car || '—'}\nДата: ${payload.date || '—'}\nКомментарий: ${payload.comment || '—'}`

    const sent = await sendTelegramMessage({ ...payload, overrideText: telegramText })

    // Сохраняем в нужную коллекцию
    const collectionName = isPurchase ? 'orders' : 'requests'
    let saved = false
    try {
      await addDoc(collection(db, collectionName), {
        ...payload,
        createdAt: serverTimestamp(),
      })
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
    <>
      <HeroSection />

      <CarCarousel
        title="Популярные модели"
        subtitle="НАШ АВТОПАРК"
        cars={popularCars.length > 0 ? popularCars : normalizedCars.slice(0, 4)}
        favorites={favorites}
        cart={cart}
        onToggleFavorite={toggleFavorite}
        onAddToCart={toggleCart}
      />

      <CarCarousel
        title="Новые поступления"
        subtitle="КАТАЛОГ"
        cars={newCars}
        favorites={favorites}
        cart={cart}
        onToggleFavorite={toggleFavorite}
        onAddToCart={toggleCart}
      />

      <AboutSection />

      <ReviewsSection />

      {/* Контакты */}
      <div className="contact-info-section">
        <p className="small-title">СВЯЖИТЕСЬ С НАМИ</p>
        <h2>Контакты</h2>
        <p className="contact-info-desc">Мы всегда на связи. Напишите нам в удобный мессенджер или оставьте заявку ниже.</p>
        <ContactLinks variant="cards" />
      </div>

      <ContactForm onSubmit={handleContactSubmit} isSending={isSending} />

      <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />
    </>
  )
}
