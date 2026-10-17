export default function RequestListItem({ request }) {
  return (
    <div className="order-row">
      <div><strong>{request.name || 'Клиент'}</strong><span>{request.car || 'Авто не указано'}</span></div>
      <div className="order-meta"><strong>{request.phone || '—'}</strong><span>{request.date || 'Без даты'}</span></div>
    </div>
  )
}
