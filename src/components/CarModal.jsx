export default function CarModal({ car, onClose }) {
  if (!car) return null

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="close" type="button" onClick={onClose}>
          ×
        </button>
        <h3>{car.name}</h3>
        <p>{car.brand}</p>
        <img src={car.image} alt={car.name} />
        <ul>
          <li>Мощность: {car.power}</li>
          <li>Разгон: {car.stat}</li>
          <li>Цена: {car.price}</li>
        </ul>
      </div>
    </div>
  )
}
