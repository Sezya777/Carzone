import { useNavigate } from 'react-router-dom'

export default function CarCard({ car, isFavorite, isInCart, onToggleFavorite, onAddToCart }) {
  const navigate = useNavigate()

  const handleClick = () => {
    const id = car.id || encodeURIComponent(car.name)
    navigate(`/cars/${id}`)
  }

  return (
    <article className="car-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="car-image">
        <img src={car.image} alt={car.name} />
        <span className="car-badge">{car.badge}</span>
        <button
          type="button"
          className={`car-favorite-btn${isFavorite ? ' active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(car) }}
          title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <div className="car-info">
        <p className="brand">{car.brand}</p>
        <h3>{car.name}</h3>
        <div className="specs">
          <span>⚡ {car.power}</span>
          <span>🏁 {car.stat}</span>
        </div>
        <div className="price">
          <strong>{car.price}</strong>
          <button
            type="button"
            className={`cart-add-btn${isInCart ? ' in-cart' : ''}`}
            onClick={(e) => { e.stopPropagation(); onAddToCart(car) }}
            title={isInCart ? 'Убрать из корзины' : 'В корзину'}
          >
            {isInCart ? 'В корзине' : 'В корзину'}
          </button>
        </div>
      </div>
    </article>
  )
}
