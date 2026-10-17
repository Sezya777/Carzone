export default function CarTableRow({ car, onDelete }) {
  return (
    <tr>
      <td>{car.name}</td>
      <td>{car.brand}</td>
      <td><span className={`status-pill ${car.inStock === false ? 'warning' : 'success'}`}>{car.inStock === false ? 'Под заказ' : 'В наличии'}</span></td>
      <td>{car.price || '$0'}</td>
      <td><button type="button" className="danger-btn" onClick={() => onDelete(car.id)}>Удалить</button></td>
    </tr>
  )
}
