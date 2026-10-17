export default function AddCarModal({ isOpen, onClose, onSubmit, form, onChange, loading, message }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>Добавить автомобиль</h3>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <form className="admin-form modal-form" onSubmit={onSubmit}>
          <input type="text" name="name" value={form.name} onChange={onChange} placeholder="Название" required />
          <input type="text" name="brand" value={form.brand} onChange={onChange} placeholder="Бренд" required />

          <select name="category" value={form.category} onChange={onChange}>
            <option value="sport">Спортивные</option>
            <option value="sedan">Седаны</option>
            <option value="suv">SUV</option>
          </select>

          <input type="text" name="power" value={form.power} onChange={onChange} placeholder="Мощность" />
          <input type="text" name="stat" value={form.stat} onChange={onChange} placeholder="Разгон / характеристики" />
          <input type="text" name="price" value={form.price} onChange={onChange} placeholder="Цена" />
          <input type="file" name="image" accept="image/*" onChange={onChange} required />

          {message && <p className="admin-message">{message}</p>}

          <div className="modal-actions">
            <button type="button" className="ghost-btn modal-cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Загрузка...' : 'Добавить авто'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
