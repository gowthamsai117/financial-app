import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { createTransaction } from '../lib/api'
import { addCategory as addCategoryToStorage, getCategories, getSettings } from '../lib/storage'

const today = () => new Date().toISOString().slice(0, 10)

const formatDateWithDay = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayName = days[date.getDay()]
  const [year, month, day] = dateStr.split('-')
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${dayName}, ${day}/${month}/${year}`
}

const typeOptions = [
  { value: 'expense', label: 'Expense', tone: 'text-red-600', pill: 'bg-red-50 border-red-200' },
  { value: 'income', label: 'Income', tone: 'text-green-600', pill: 'bg-green-50 border-green-200' },
]

export default function AddTransaction() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [currency, setCurrency] = useState('₹')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [form, setForm] = useState({
    date: today(),
    time: new Date().toTimeString().slice(0, 5),
    type: 'expense',
    category: '',
    amount: '',
    notes: '',
  })

  useEffect(() => {
    setCategories(getCategories())
    setCurrency(getSettings().currency)
  }, [])

  const amountInvalid = useMemo(() => Number(form.amount) <= 0 || Number.isNaN(Number(form.amount)), [form.amount])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (amountInvalid) {
      setError('Enter an amount greater than 0')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        date: form.date,
        time: form.time,
        type: form.type,
        category: form.category,
        amount: Number(form.amount),
        notes: form.notes || undefined,
      }
      await createTransaction(payload)
      setSuccess('✅ Transaction saved successfully!')
      setForm({
        date: today(),
        time: new Date().toTimeString().slice(0, 5),
        type: 'expense',
        category: '',
        amount: '',
        notes: '',
      })
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error creating transaction:', err)
      setError(err?.message || 'Failed to save transaction')
      setLoading(false)
    }
  }

  const handleTypeSelect = (value) => setForm((prev) => ({ ...prev, type: value }))

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    const updated = addCategoryToStorage(newCategory)
    setCategories(updated)
    setForm((prev) => ({ ...prev, category: newCategory.trim() }))
    setNewCategory('')
  }

  const presetCategories = ['Salary', 'Food', 'Groceries', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Travel', 'Subscriptions']

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">New entry</p>
          <h1 className="text-3xl font-bold">Add Transaction</h1>
        </div>
        <div className="rounded-full bg-blue-50 border border-blue-100 px-4 py-2 text-sm text-blue-700">
          Currency: <span className="font-semibold">{currency}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 space-y-4">
          {/* Date & Type Selection Card */}
          <div className="card shadow-sm bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">📅 When & What</h3>
                <div className="flex gap-2">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleTypeSelect(option.value)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        form.type === option.value
                          ? `${option.pill} ${option.tone} shadow-sm`
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">📆 Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={form.date} 
                    onChange={handleChange} 
                    className="px-3 py-2 border border-purple-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    required 
                  />
                  <div className="px-3 py-2 bg-white/60 border border-purple-100 rounded-lg text-sm font-semibold text-purple-700">
                    {formatDateWithDay(form.date)}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">⏰ Time</label>
                  <input 
                    type="time" 
                    name="time" 
                    value={form.time} 
                    onChange={handleChange} 
                    className="px-3 py-2 border border-purple-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    required 
                  />
                  <div className="px-3 py-2 bg-white/60 border border-purple-100 rounded-lg text-sm font-semibold text-purple-700 text-center">
                    {form.time || '--:--'}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">🏷️ Category</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="px-3 py-2 border border-purple-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Add new category"
                      className="flex-1 px-3 py-2 border border-purple-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {presetCategories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          const updated = addCategoryToStorage(c)
                          setCategories(updated)
                          setForm((prev) => ({ ...prev, category: c }))
                        }}
                        className={`px-3 py-1 rounded-full border text-xs font-medium transition ${
                          form.category === c
                            ? 'bg-purple-100 border-purple-300 text-purple-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-purple-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="card shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Quick capture</p>
                <h2 className="text-xl font-semibold">Details</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700">Notes</span>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="input-field" placeholder="Lunch with team, ride share, subscription..." />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700">Amount ({currency})</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    className={`input-field ${amountInvalid && form.amount ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
                    required
                  />
                </label>
              </div>

              {categories.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  No categories yet. Add one in Settings to keep things organized.
                </p>
              )}

              {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-green-600 text-sm bg-green-50 border border-green-200 px-3 py-2 rounded-lg">{success}</p>}

              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto">
                  {loading ? 'Saving...' : 'Save transaction'}
                </button>
                <button type="button" onClick={() => router.push('/transactions')} className="btn w-full sm:w-auto">
                  View All
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-2 card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Guides</p>
              <h3 className="text-lg font-semibold">Faster entries</h3>
            </div>
            <span className="badge">Tip</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3"><span className="badge badge-income">Income</span><span>Use Income type for salary, refunds, or transfers in.</span></li>
            <li className="flex gap-3"><span className="badge badge-expense">Expense</span><span>Pick Expense for bills, food, travel, or transfers out.</span></li>
            <li className="flex gap-3"><span className="badge">Categories</span><span>Keep categories short and re-usable. Update them in Settings.</span></li>
            <li className="flex gap-3"><span className="badge">Notes</span><span>Add a note for context. It helps when reviewing later.</span></li>
          </ul>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
            Totals update instantly on the Dashboard and Transactions pages.
          </div>
        </div>
      </div>
    </div>
  )
}
