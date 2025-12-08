const STORAGE_KEYS = {
  transactions: 'financial-tracker:transactions',
  categories: 'financial-tracker:categories',
  settings: 'financial-tracker:settings',
}

const defaultCategories = ['Salary', 'Food', 'Transport', 'Utilities', 'Other']
const defaultSettings = { currency: '₹' }

const safeParse = (raw, fallback) => {
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

const load = (key, fallback) => {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  return safeParse(raw, fallback)
}

const persist = (key, value) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

// Transactions
export const getTransactions = () => load(STORAGE_KEYS.transactions, [])

export const saveTransactions = (items) => {
  persist(STORAGE_KEYS.transactions, items)
  return items
}

export const addTransaction = (tx) => {
  const items = getTransactions()
  const entry = { ...tx, id: tx.id ?? Date.now() }
  return saveTransactions([entry, ...items])
}

export const updateTransaction = (id, changes) => {
  const items = getTransactions()
  const next = items.map((item) => (item.id === id ? { ...item, ...changes, id } : item))
  return saveTransactions(next)
}

export const deleteTransaction = (id) => {
  const items = getTransactions()
  const next = items.filter((item) => item.id !== id)
  return saveTransactions(next)
}

// Categories
export const getCategories = () => {
  const stored = load(STORAGE_KEYS.categories, null)
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    persist(STORAGE_KEYS.categories, defaultCategories)
    return defaultCategories
  }
  return stored
}

export const addCategory = (name) => {
  const trimmed = name.trim()
  if (!trimmed) return getCategories()
  const categories = getCategories()
  if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    return categories
  }
  const next = [...categories, trimmed]
  persist(STORAGE_KEYS.categories, next)
  return next
}

export const deleteCategory = (name) => {
  const categories = getCategories()
  const next = categories.filter((c) => c !== name)
  persist(STORAGE_KEYS.categories, next)
  return next
}

// Settings
export const getSettings = () => {
  const stored = load(STORAGE_KEYS.settings, null)
  if (!stored || typeof stored !== 'object') {
    persist(STORAGE_KEYS.settings, defaultSettings)
    return defaultSettings
  }
  return { currency: stored.currency || defaultSettings.currency }
}

export const saveSettings = (settings) => {
  const next = { ...defaultSettings, ...settings }
  persist(STORAGE_KEYS.settings, next)
  return next
}
