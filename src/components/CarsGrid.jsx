import { useState } from 'react'
import CarCard from './CarCard'
import Skeleton from './Skeleton'
import Pagination from './Pagination'

const CARS_PER_PAGE = 6

export default function CarsGrid({ cars, isLoading, favorites, cart = [], onToggleFavorite, onAddToCart, onOpenModal }) {
  const [currentPage, setCurrentPage] = useState(1)

  if (isLoading) {
    return (
      <div className="cars">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} width="100%" height="300px" borderRadius="12px" />
        ))}
      </div>
    )
  }

  if (cars.length === 0) {
    return <div className="no-results">Автомобили не найдены</div>
  }

  const totalPages = Math.ceil(cars.length / CARS_PER_PAGE)
  const startIndex = (currentPage - 1) * CARS_PER_PAGE
  const paginatedCars = cars.slice(startIndex, startIndex + CARS_PER_PAGE)

  return (
    <>
      <div className="cars">
        {paginatedCars.map((car) => (
          <CarCard
            key={car.id || car.name}
            car={car}
            isFavorite={favorites.some((item) => (item.id || item.name) === (car.id || car.name))}
            isInCart={cart.some((item) => (item.id || item.name) === (car.id || car.name))}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
            onOpenModal={onOpenModal}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}
