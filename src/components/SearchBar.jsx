import { useTranslation } from 'react-i18next'

export default function SearchBar({
  searchTerm, onSearchChange,
  category, onCategoryChange,
  sortBy, onSortChange,
}) {
  const { t } = useTranslation()

  return (
    <div className="filters-wrap">
      <div className="controls">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={t('cars.search')}
        />
        <select value={category} onChange={onCategoryChange}>
          <option value="all">{t('cars.filter.all')}</option>
          <option value="sport">{t('cars.filter.sport')}</option>
          <option value="sedan">{t('cars.filter.sedan')}</option>
          <option value="suv">{t('cars.filter.suv')}</option>
        </select>
        <select value={sortBy} onChange={onSortChange}>
          <option value="default">По умолчанию</option>
          <option value="price-asc">Цена ↑</option>
          <option value="price-desc">Цена ↓</option>
          <option value="name-asc">Название А-Я</option>
          <option value="name-desc">Название Я-А</option>
        </select>
      </div>
    </div>
  )
}
