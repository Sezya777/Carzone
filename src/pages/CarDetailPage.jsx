import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query as firestoreQuery, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const fallbackCars = [
  { name: 'BMW M5', brand: 'BMW', category: 'sport', badge: 'SPORT', power: '600 л.с.', stat: '3.4 сек', price: '$110,000', image: 'https://hips.hearstapps.com/hmg-prod/images/2025-bmw-m5-115-671a7a8e94c11.jpg?crop=0.744xw:0.630xh;0.128xw,0.267xh&resize=2048:*' },
  { name: 'Mercedes AMG GT', brand: 'MERCEDES', category: 'sport', badge: 'SPORT', power: '585 л.с.', stat: '3.2 сек', price: '$140,000', image: 'https://hips.hearstapps.com/hmg-prod/images/2025-mercedes-amg-gt-63-s-e-performance-108-6924bb6057075.jpg?crop=0.575xw:0.432xh;0.223xw,0.405xh&resize=1200:*' },
  { name: 'Toyota Camry', brand: 'TOYOTA', category: 'sedan', badge: 'SEDAN', power: '203 л.с.', stat: '6.5 л', price: '$32,000', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Toyota_Camry_AXVH80_2.5_HEV_Platinum_White_Pearl_Mica_05.jpg' },
  { name: 'Range Rover', brand: 'LAND ROVER', category: 'suv', badge: 'SUV', power: '530 л.с.', stat: '4x4', price: '$155,000', image: 'https://s.auto.drom.ru/i24315/r/photos/1463259/gen384_1736696.jpg' },
  { name: 'Porsche 911', brand: 'PORSCHE', category: 'sport', badge: 'SPORT', power: '450 л.с.', stat: '3.7 сек', price: '$125,000', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-SD3j9QCDqVCCeYgpSxHlMlWvStjES9lKKsrPkFoLiFVvYVJTiTc75xY&s=10' },
  { name: 'Mercedes GLS', brand: 'MERCEDES', category: 'suv', badge: 'SUV', power: '489 л.с.', stat: '4x4', price: '$135,000', image: 'https://www.heraldnet.com/wp-content/uploads/sites/8/2023/11/34482176_web1_TSR-2024-GLS-SUV-GAL-002-K-FE-DR.jpg.jpg?w=1024' },
]

export default function CarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Сначала пробуем загрузить из Firestore по ID
    const fetchCar = async () => {
      try {
        const docRef = doc(db, 'cars', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setCar({ id: docSnap.id, ...docSnap.data() })
        } else {
          // Ищем в fallback по имени (для статичных авто)
          const found = fallbackCars.find((c) => c.name === decodeURIComponent(id))
          setCar(found || null)
        }
      } catch {
        const found = fallbackCars.find((c) => c.name === decodeURIComponent(id))
        setCar(found || null)
      } finally {
        setLoading(false)
      }
    }
    fetchCar()
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!car) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <h2>Автомобиль не найден</h2>
        <button className="primary-btn" onClick={() => navigate('/cars')}>Вернуться к каталогу</button>
      </div>
    )
  }

  return (
    <div className="car-detail-page">
      <button className="car-detail-back" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <div className="car-detail-grid">
        {/* Фото */}
        <div className="car-detail-image">
          <img src={car.image} alt={car.name} />
          <span className="car-badge">{car.badge || car.category?.toUpperCase()}</span>
        </div>

        {/* Инфо */}
        <div className="car-detail-info">
          <p className="brand">{car.brand}</p>
          <h1 className="car-detail-title">{car.name}</h1>

          <div className="car-detail-specs">
            <div className="car-detail-spec">
              <span>Мощность</span>
              <strong>{car.power || '—'}</strong>
            </div>
            <div className="car-detail-spec">
              <span>Разгон / хар.</span>
              <strong>{car.stat || '—'}</strong>
            </div>
            <div className="car-detail-spec">
              <span>Категория</span>
              <strong>{car.category?.toUpperCase() || '—'}</strong>
            </div>
            <div className="car-detail-spec">
              <span>Статус</span>
              <strong style={{ color: '#7fe6b0' }}>{car.inStock === false ? 'Под заказ' : 'В наличии'}</strong>
            </div>
          </div>

          <div className="car-detail-price">
            <span>Стоимость</span>
            <strong>{car.price}</strong>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="primary-btn" onClick={() => navigate('/contact')}>
              Записаться на тест-драйв
            </button>
            <button className="ghost-btn" onClick={() => navigate('/cars')}>
              Все автомобили
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
