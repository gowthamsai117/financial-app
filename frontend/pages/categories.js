import { useEffect, useState } from 'react'
import { addCategory, deleteCategory, getCategories } from '../lib/storage'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setCategories(getCategories())
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Category name required')
      return
    }
    const next = addCategory(trimmed)
    setCategories(next)
    setName('')
  }

  const handleDelete = (cat) => {
    const next = deleteCategory(cat)
    setCategories(next)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <label>
              <div className="text-sm font-medium mb-1">Category Name</div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" className="input-field" />
            </label>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" className="btn btn-primary w-full">Add Category</button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Existing Categories</h2>
          {categories.length === 0 && <p className="text-gray-500">No categories.</p>}
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200">
                <span className="font-medium">{cat}</span>
                <button type="button" onClick={() => handleDelete(cat)} className="btn btn-danger text-xs">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
