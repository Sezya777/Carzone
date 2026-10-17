import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  onSnapshot,
  query as firestoreQuery,
} from 'firebase/firestore'
import { db } from '../firebase'
import SearchBar from '../components/SearchBar'
import CarsGrid from '../components/CarsGrid'
import CarModal from '../components/CarModal'
import useUserData from '../hooks/useUserData'

const fallbackCars = [
  { name: 'BMW M5', brand: 'BMW', category: 'sport', badge: 'SPORT', power: '600 л.с.', stat: '3.4 сек', price: '$110,000', image: 'https://hips.hearstapps.com/hmg-prod/images/2025-bmw-m5-115-671a7a8e94c11.jpg?crop=0.744xw:0.630xh;0.128xw,0.267xh&resize=2048:*' },
  { name: 'Mercedes AMG GT', brand: 'MERCEDES', category: 'sport', badge: 'SPORT', power: '585 л.с.', stat: '3.2 сек', price: '$140,000', image: 'https://hips.hearstapps.com/hmg-prod/images/2025-mercedes-amg-gt-63-s-e-performance-108-6924bb6057075.jpg?crop=0.575xw:0.432xh;0.223xw,0.405xh&resize=1200:*' },
  { name: 'Toyota Camry', brand: 'TOYOTA', category: 'sedan', badge: 'SEDAN', power: '203 л.с.', stat: '6.5 л', price: '$32,000', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Toyota_Camry_AXVH80_2.5_HEV_Platinum_White_Pearl_Mica_05.jpg' },
  { name: 'Range Rover', brand: 'LAND ROVER', category: 'suv', badge: 'SUV', power: '530 л.с.', stat: '4x4', price: '$155,000', image: 'https://s.auto.drom.ru/i24315/r/photos/1463259/gen384_1736696.jpg' },
  { name: 'Porsche 911', brand: 'PORSCHE', category: 'sport', badge: 'SPORT', power: '450 л.с.', stat: '3.7 сек', price: '$125,000', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-SD3j9QCDqVCCeYgpSxHlMlWvStjES9lKKsrPkFoLiFVvYVJTiTc75xY&s=10' },
  { name: 'Mercedes GLS', brand: 'MERCEDES', category: 'suv', badge: 'SUV', power: '489 л.с.', stat: '4x4', price: '$135,000', image: 'https://www.heraldnet.com/wp-content/uploads/sites/8/2023/11/34482176_web1_TSR-2024-GLS-SUV-GAL-002-K-FE-DR.jpg.jpg?w=1024' },
]

const normalizeCar = (car, index) => ({
  ...car,
  id: car.id || `${String(car.name || 'car').trim().toLowerCase()}-${index}`,
  name: String(car.name || '').trim(),
  brand: String(car.brand || '').trim(),
  category: String(car.category || '').trim().toLowerCase(),
  badge: String(car.badge || car.category || 'AUTO').toUpperCase(),
  price: String(car.price || '').trim() || '$0',
  image: car.image || '',
})

export default function CarsPage() {
  const [cars, setCars] = useState(fallbackCars)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [priceRange, setPriceRange] = useState(200000)
  const [maxPrice, setMaxPrice] = useState(200000)
  const [sortBy, setSortBy] = useState('default')
  const [selectedCar, setSelectedCar] = useState(null)
  const { favorites, cart, toggleFavorite, toggleCart } = useUserData()

  const parsePrice = (val) => Number(String(val || '0').replace(/[^\d]/g, '')) || 0

  useEffect(() => {
    const q = firestoreQuery(collection(db, 'cars'))
    const unsub = onSnapshot(q, (snap) => {
      const firestoreCars = snap.docs
        .map((d, index) => normalizeCar({ id: d.id, ...d.data() }, index))
        .sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0
          const tb = b.createdAt?.toMillis?.() ?? 0
          return tb - ta
        })

      const uniqueFallback = fallbackCars
        .map((car, index) => normalizeCar(car, index + firestoreCars.length))
        .filter((car) => !firestoreCars.some((item) => String(item.name).toLowerCase() === String(car.name).toLowerCase()))

      const mergedCars = [...firestoreCars, ...uniqueFallback]
      const nextMaxPrice = mergedCars.reduce((max, car) => Math.max(max, parsePrice(car.price)), 200000)

      setCars(mergedCars)
      setMaxPrice(nextMaxPrice)
      setPriceRange((current) => (current > nextMaxPrice ? nextMaxPrice : current))
      setIsLoading(false)
    }, () => {
      const fallbackCarsNormalized = fallbackCars.map((car, index) => normalizeCar(car, index))
      const nextMaxPrice = fallbackCarsNormalized.reduce((max, car) => Math.max(max, parsePrice(car.price)), 200000)

      setCars(fallbackCarsNormalized)
      setMaxPrice(nextMaxPrice)
      setPriceRange((current) => (current > nextMaxPrice ? nextMaxPrice : current))
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const filteredCars = useMemo(() => {
    let result = cars.filter((car) => {
      const normalizedCar = normalizeCar(car, 0)
      const matchesQuery = (normalizedCar.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (normalizedCar.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = category === 'all' || normalizedCar.category === category
      const matchesPrice = parsePrice(normalizedCar.price) <= priceRange
      return matchesQuery && matchesCategory && matchesPrice
    })

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
        break
      case 'price-desc':
        result = [...result].sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
        break
      case 'name-asc':
        result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'name-desc':
        result = [...result].sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        break
      default:
        break
    }

    return result
  }, [cars, searchTerm, category, priceRange, sortBy])

  return (
    <section className="cars-section" id="cars" style={{ minHeight: '80vh' }}>
      <div className="section-title">
        <p>НАШ АВТОПАРК</p>
        <h2>Все автомобили</h2>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        category={category}
        onCategoryChange={(e) => setCategory(e.target.value)}
        priceRange={priceRange}
        maxPrice={maxPrice}
        onPriceChange={(e) => setPriceRange(Number(e.target.value))}
        sortBy={sortBy}
        onSortChange={(e) => setSortBy(e.target.value)}
      />

      <CarsGrid
        cars={filteredCars}
        isLoading={isLoading}
        favorites={favorites}
        cart={cart}
        onToggleFavorite={toggleFavorite}
        onAddToCart={toggleCart}
        onOpenModal={setSelectedCar}
      />

      <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />
    </section>
  )
}
