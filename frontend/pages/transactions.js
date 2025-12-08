import { useEffect, useMemo, useState } from 'react'
import {
  deleteTransaction as deleteTransactionAPI,
  getTransactions as fetchTransactions,
  updateTransaction as updateTransactionAPI,
} from '../lib/api'
import {
  getCategories,
  getSettings,
} from '../lib/storage'

const today = () => new Date().toISOString().slice(0, 10)

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const getAvailableMonths = (transactions) => {
  const months = new Set()
  transactions.forEach(tx => {
    if (tx.date) {
      months.add(tx.date.slice(0, 7))
    }
  })
  return Array.from(months).sort().reverse()
}

const getAvailableMonthsForYear = (transactions, year) => {
  const months = new Set()
  transactions.forEach(tx => {
    if (tx.date && tx.date.startsWith(year)) {
      months.add(tx.date.slice(5, 7))
    }
  })
  return Array.from(months).sort()
}

const getAvailableYears = (transactions) => {
  const years = new Set()
  transactions.forEach(tx => {
    if (tx.date) {
      years.add(tx.date.slice(0, 4))
    }
  })
  return Array.from(years).sort().reverse()
}

const getAvailableCategories = (transactions) => {
  const categories = new Set()
  transactions.forEach(tx => {
    if (tx.category && tx.category.trim()) {
      categories.add(tx.category.trim())
    }
  })
  return Array.from(categories).sort()
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [currency, setCurrency] = useState('₹')
  const [editingId, setEditingId] = useState(null)
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editForm, setEditForm] = useState({ date: today(), time: '', type: 'expense', category: '', amount: '', notes: '' })

  useEffect(() => {
    fetchTransactions().then(data => {
      setTransactions(data)
      // Extract categories from transactions
      const txCategories = getAvailableCategories(data)
      // Merge with stored categories
      const storedCategories = getCategories()
      const allCategories = Array.from(new Set([...storedCategories, ...txCategories])).sort()
      setCategories(allCategories)
    }).catch(err => {
      console.error('Failed to load transactions:', err)
      setTransactions([])
      setCategories(getCategories())
    })
    setCurrency(getSettings().currency)
  }, [])

  // Auto-select a valid month when year changes (only if not showing all)
  useEffect(() => {
    if (selectedYear === 'all') {
      setSelectedMonth('all')
    } else if (selectedMonth !== 'all') {
      const availableMonthsForYear = getAvailableMonthsForYear(transactions, selectedYear)
      if (availableMonthsForYear.length > 0 && !availableMonthsForYear.includes(selectedMonth)) {
        setSelectedMonth(availableMonthsForYear[0])
      }
    }
  }, [selectedYear, transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Year filter
      const yearMatch = selectedYear === 'all' || (tx.date && tx.date.startsWith(selectedYear))
      
      // Month filter
      let monthMatch = true
      if (selectedMonth !== 'all' && selectedYear !== 'all') {
        const filterMonth = `${selectedYear}-${selectedMonth}`
        const txMonth = tx.date ? tx.date.slice(0, 7) : ''
        monthMatch = txMonth === filterMonth
      }
      
      // Category filter
      const categoryMatch = selectedCategory === 'all' || (tx.category || '').toLowerCase() === selectedCategory.toLowerCase()
      
      return yearMatch && monthMatch && categoryMatch
    })
  }, [transactions, selectedYear, selectedMonth, selectedCategory])

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + (t.amount || 0), 0)
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + (t.amount || 0), 0)
    return { income, expense, balance: income - expense }
  }, [filteredTransactions])

  const availableYears = useMemo(() => getAvailableYears(transactions), [transactions])
  const availableMonthsForSelectedYear = useMemo(() => getAvailableMonthsForYear(transactions, selectedYear), [transactions, selectedYear])
  const availableCategoriesInTransactions = useMemo(() => getAvailableCategories(transactions), [transactions])
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const startEdit = (tx) => {
    setEditingId(tx.id)
    setEditForm({
      date: tx.date || today(),
      time: tx.time || '',
      type: tx.type || 'expense',
      category: tx.category || '',
      amount: String(tx.amount ?? ''),
      notes: tx.notes || '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ date: today(), time: '', type: 'expense', category: '', amount: '', notes: '' })
  }

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    if (!editingId) return
    try {
      await updateTransactionAPI(editingId, {
        date: editForm.date,
        time: editForm.time || undefined,
        type: editForm.type,
        category: editForm.category,
        amount: Number(editForm.amount),
        notes: editForm.notes || undefined,
      })
      const updated = await fetchTransactions()
      setTransactions(updated)
      cancelEdit()
    } catch (err) {
      console.error('Failed to update transaction:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTransactionAPI(id)
      const updated = await fetchTransactions()
      setTransactions(updated)
      if (editingId === id) {
        cancelEdit()
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">History</p>
          <h1 className="text-3xl font-bold">All Transactions</h1>
        </div>
        <div className="flex gap-2">
          <a href="/add-transaction" className="btn btn-primary">Add Transaction</a>
          <span className="badge">{transactions.length} total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex flex-col gap-4">
          {/* Filter Header */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📅 Filter by Period</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              {/* Year Selector */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All time</option>
                  {availableYears.length > 0 ? (
                    availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))
                  ) : (
                    <option value={selectedYear}>{selectedYear}</option>
                  )}
                </select>
              </div>

              {/* Month Selector */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={selectedYear === 'all'}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">All months</option>
                  {availableMonthsForSelectedYear.length > 0 ? (
                    availableMonthsForSelectedYear.map(monthNum => (
                      <option key={monthNum} value={monthNum}>
                        {monthNames[parseInt(monthNum) - 1]}
                      </option>
                    ))
                  ) : (
                    <option value={selectedMonth} disabled>No data available</option>
                  )}
                </select>
              </div>

              {/* Category Selector */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All categories ({availableCategoriesInTransactions.length})</option>
                  {availableCategoriesInTransactions.length > 0 ? (
                    availableCategoriesInTransactions.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  ) : (
                    <option disabled>No categories</option>
                  )}
                </select>
              </div>

              {/* Summary Badge */}
              <div className="bg-white/70 border border-blue-200 rounded-lg px-4 py-2 text-center">
                <p className="text-xs text-gray-600 font-medium">Transactions</p>
                <p className="text-lg font-bold text-blue-600">{filteredTransactions.length}</p>
              </div>
            </div>
          </div>

          {/* Statistics Row */}
          {filteredTransactions.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-blue-200">
              <div className="text-center p-3 rounded-lg bg-white/80 border border-green-200">
                <p className="text-xs text-gray-600 font-medium">Income</p>
                <p className="text-lg font-bold text-green-600">+{stats.income.toFixed(2)}</p>
              </div>
              <div className={`text-center p-3 rounded-lg bg-white/80 border ${stats.balance >= 0 ? 'border-blue-200' : 'border-red-200'}`}>
                <p className="text-xs text-gray-600 font-medium">Balance</p>
                <p className={`text-lg font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {stats.balance >= 0 ? '+' : ''}{stats.balance.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-white/80 border border-red-200">
                <p className="text-xs text-gray-600 font-medium">Expense</p>
                <p className="text-lg font-bold text-red-600">-{stats.expense.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm">
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-600 font-medium">
              {selectedYear === 'all' ? 'No transactions found' : 
               selectedMonth === 'all' ? `No transactions for ${selectedYear}` :
               `No transactions for ${monthNames[parseInt(selectedMonth) - 1]} ${selectedYear}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or add new transactions</p>
          </div>
        )}

        {filteredTransactions.length > 0 && (
          <div className="space-y-4">
            {/* Mobile stacked cards */}
            <div className="grid gap-3 md:hidden">
              {filteredTransactions.map((tx) => {
                const isEditing = editingId === tx.id
                return (
                  <div key={tx.id} className="border border-slate-200 rounded-lg p-3 shadow-sm bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-semibold flex items-center gap-2">
                          <span>{tx.category || 'Uncategorized'}</span>
                          <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                            {tx.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{tx.date || '—'}</span>
                          {tx.time && <span className="text-xs">⏰ {tx.time}</span>}
                        </div>
                        {tx.notes && <p className="text-sm text-gray-700">{tx.notes}</p>}
                      </div>
                      <div className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}{currency} {Number(tx.amount || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {isEditing && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input type="date" name="date" value={editForm.date} onChange={handleChange} className="input-field text-sm" />
                          <input type="time" name="time" value={editForm.time} onChange={handleChange} className="input-field text-sm" placeholder="Time" />
                          <select name="type" value={editForm.type} onChange={handleChange} className="input-field text-sm">
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                          <select name="category" value={editForm.category} onChange={handleChange} className="input-field text-sm">
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <input type="number" step="0.01" name="amount" value={editForm.amount} onChange={handleChange} className="input-field text-sm" />
                          <input name="notes" value={editForm.notes} onChange={handleChange} className="input-field text-sm sm:col-span-2" placeholder="Notes" />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button type="button" onClick={handleSave} className="btn btn-primary text-xs">Save</button>
                            <button type="button" onClick={cancelEdit} className="btn btn-secondary text-xs">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => startEdit(tx)} className="btn btn-primary text-xs">Edit</button>
                            <button type="button" onClick={() => handleDelete(tx.id)} className="btn btn-danger text-xs">Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Time</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Amount ({currency})</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Notes</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="table-row">
                      <td className="px-4 py-2">
                        {editingId === tx.id ? (
                          <input type="date" name="date" value={editForm.date} onChange={handleChange} className="input-field text-sm" />
                        ) : (
                          tx.date || '—'
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === tx.id ? (
                          <input type="time" name="time" value={editForm.time} onChange={handleChange} className="input-field text-sm" placeholder="Time" />
                        ) : (
                          <span className="text-xs text-gray-600">{tx.time || '—'}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === tx.id ? (
                          <select name="type" value={editForm.type} onChange={handleChange} className="input-field text-sm">
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        ) : (
                          <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{tx.type}</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === tx.id ? (
                          <select name="category" value={editForm.category} onChange={handleChange} className="input-field text-sm">
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          tx.category || 'Uncategorized'
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === tx.id ? (
                          <input type="number" step="0.01" name="amount" value={editForm.amount} onChange={handleChange} className="input-field text-sm" />
                        ) : (
                          `${currency} ${Number(tx.amount || 0).toFixed(2)}`
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === tx.id ? (
                          <input name="notes" value={editForm.notes} onChange={handleChange} className="input-field text-sm" />
                        ) : (
                          tx.notes || '—'
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === tx.id ? (
                          <div className="flex gap-2">
                            <button type="button" onClick={handleSave} className="btn btn-primary text-xs">Save</button>
                            <button type="button" onClick={cancelEdit} className="btn btn-secondary text-xs">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEdit(tx)} className="btn btn-primary text-xs">Edit</button>
                            <button type="button" onClick={() => handleDelete(tx.id)} className="btn btn-danger text-xs">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
