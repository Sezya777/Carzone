export default function AdminQuickActions({ onAddCar }) {
  return (
    <div className="panel-card">
      <div className="panel-header"><h3>Быстрые действия</h3></div>
      <div className="quick-action-box">
        <p>Добавьте новую модель в каталог и сразу выгрузите фото в Firebase Storage.</p>
        <button type="button" className="primary-btn" onClick={onAddCar}>Добавить автомобиль</button>
      </div>
    </div>
  )
}
