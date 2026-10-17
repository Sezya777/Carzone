import { Link } from 'react-router-dom'
export default function FavoriteCard({ car }) {
  return (
    <div className="mini-card">
      <img src={car.image} alt={car.name} />
      <div>
        <strong>{car.name}</strong>
        <span>{car.price}</span>
        <Link to="/">Подробнее</Link>
      </div>
    </div>
  )
}
