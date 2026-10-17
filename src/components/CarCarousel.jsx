import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CarCard from './CarCard'

export default function CarCarousel({ title, subtitle, cars, favorites, cart, onToggleFavorite, onAddToCart }) {
  const trackRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const CARD_WIDTH = 340 // ширина карточки + gap

  const updateArrows = () => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 10)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  const scroll = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * CARD_WIDTH, behavior: 'smooth' })
    setTimeout(updateArrows, 350)
  }

  if (!cars || cars.length === 0) return null

  return (
    <div className="carousel-section">
      <div className="carousel-header">
        <div>
          <p className="small-title">{subtitle}</p>
          <h2>{title}</h2>
        </div>
        <Link to="/cars" className="ghost-btn carousel-all-btn">
          Все автомобили →
        </Link>
      </div>

      <div className="carousel-wrap">
        {cars.length > 3 && canPrev && (
          <button type="button" className="carousel-arrow carousel-prev" onClick={() => scroll(-1)}>
            ‹
          </button>
        )}

        <div
          className="carousel-track"
          ref={trackRef}
          onScroll={updateArrows}
        >
          {cars.map((car) => (
            <div key={car.id || car.name} className="carousel-item">
              <CarCard
                car={car}
                isFavorite={favorites.some((f) => (f.id || f.name) === (car.id || car.name))}
                isInCart={cart.some((c) => (c.id || c.name) === (car.id || car.name))}
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>

        {cars.length > 3 && canNext && (
          <button type="button" className="carousel-arrow carousel-next" onClick={() => scroll(1)}>
            ›
          </button>
        )}
      </div>
    </div>
  )
}
