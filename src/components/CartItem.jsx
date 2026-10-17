export default function CartItem({ car, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item-main">
        <img src={car.image} alt={car.name} />
        <div><strong>{car.name}</strong><span>{car.brand}</span></div>
      </div>
      <div className="cart-item-right">
        <span>{car.price}</span>
        {onRemove && (
          <button type="button" className="danger-btn small" onClick={() => onRemove(car.id || car.name)}>✕</button>
        )}
      </div>
    </div>
  )
}
