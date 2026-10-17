import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import CarTableRow from './CarTableRow'
import AddCarModal from './AddCarModal'

const initialForm = {
  name: '',
  brand: '',
  category: 'sport',
  power: '',
  stat: '',
  price: '',
  image: null,
}

// Конвертируем файл в base64 строку
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function AdminCarsPage() {
  const [cars, setCars] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const q = firestoreQuery(collection(db, 'cars'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setCars(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }, () => setCars([]))
    return () => unsub()
  }, [])

  const openModal = () => {
    setMessage('')
    setForm(initialForm)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setMessage('')
  }

  const handleChange = (event) => {
    const { name, value, files } = event.target
    if (name === 'image') {
      setForm((prev) => ({ ...prev, image: files[0] || null }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDelete = async (id) => {
    if (!id) return
    if (!window.confirm('Удалить автомобиль из каталога?')) return
    try {
      await deleteDoc(doc(db, 'cars', id))
    } catch (error) {
      alert(error.message)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name || !form.brand || !form.image) {
      setMessage('Заполните название, бренд и выберите фото')
      return
    }
    try {
      setLoading(true)
      setMessage('')

      // Конвертируем изображение в base64 и сохраняем в Firestore
      const imageBase64 = await fileToBase64(form.image)

      await addDoc(collection(db, 'cars'), {
        name: form.name,
        brand: form.brand,
        category: form.category,
        badge: form.category.toUpperCase(),
        power: form.power,
        stat: form.stat,
        price: form.price,
        image: imageBase64,
        inStock: true,
        createdAt: serverTimestamp(),
      })
      setForm(initialForm)
      setMessage('Автомобиль успешно добавлен')
      setTimeout(() => closeModal(), 700)
    } catch (error) {
      setMessage(error.message || 'Ошибка при добавлении')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <p className="small-title">УПРАВЛЕНИЕ КАТАЛОГОМ</p>
          <h2>Автомобили</h2>
        </div>
        <button type="button" className="primary-btn" onClick={openModal}>
          + Добавить авто
        </button>
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <h3>Все автомобили ({cars.length})</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Модель</th>
                <th>Бренд</th>
                <th>Категория</th>
                <th>Статус</th>
                <th>Цена</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {cars.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">Автомобили ещё не добавлены.</td>
                </tr>
              ) : (
                cars.map((car) => (
                  <CarTableRow key={car.id} car={car} onDelete={handleDelete} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCarModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        form={form}
        onChange={handleChange}
        loading={loading}
        message={message}
      />
    </section>
  )
}
