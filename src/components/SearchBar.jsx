import { useTranslation } from 'react-i18next'

export default function SearchBar({
  searchTerm, onSearchChange,
  category, onCategoryChange,
  priceRange, maxPrice = 200000, onPriceChange,
  sortBy, onSortChange,
}) {
  const { t } = useTranslation()
  const showExtra = !!onPriceChange

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
        {showExtra && (
          <select value={sortBy} onChange={onSortChange}>
            <option value="default">По умолчанию</option>
            <option value="price-asc">Цена ↑</option>
            <option value="price-desc">Цена ↓</option>
            <option value="name-asc">Название А-Я</option>
            <option value="name-desc">Название Я-А</option>
          </select>
        )}
      </div>

      {showExtra && (
        <div className="price-filter">
          <span className="price-filter-label">
            Цена: до <strong>${Number(priceRange).toLocaleString('en-US')}</strong>
          </span>
          <input
            type="range"
            min="0"
            max={maxPrice}
            step={Math.max(5000, Math.round(maxPrice / 20))}
            value={priceRange}
            onChange={onPriceChange}
            className="price-range-input"
          />
          <div className="price-range-marks">
            <span>$0</span>
            <span>${Math.round(maxPrice / 4).toLocaleString('en-US')}</span>
            <span>${Math.round(maxPrice / 2).toLocaleString('en-US')}</span>
            <span>${Math.round((maxPrice * 3) / 4).toLocaleString('en-US')}</span>
            <span>${maxPrice.toLocaleString('en-US')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
