const STORAGE_KEYS = {
  transactions: 'financial-tracker:transactions',
  categories: 'financial-tracker:categories',
  settings: 'financial-tracker:settings',
}

export interface Transaction {
  id: number
  date: string
  type: 'income' | 'expense'
  category: string
  amount: number
  notes: string
}

export interface Settings {
  currency: string
}

const defaultCategories = ['Salary', 'Food', 'Transport', 'Utilities', 'Other']
const defaultSettings: Settings = { currency: '₹' }

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  try {
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed as T
  } catch (err) {
    return fallback
  }
}

const load = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage.getItem(key)
  return safeParse(raw, fallback)
}

const persist = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

// Transactions
export const getTransactions = (): Transaction[] => load(STORAGE_KEYS.transactions, [])

export const saveTransactions = (items: Transaction[]): Transaction[] => {
  persist(STORAGE_KEYS.transactions, items)
  return items
}

export const addTransaction = (tx: Omit<Transaction, 'id'>): Transaction[] => {
  const items = getTransactions()
  const entry: Transaction = { ...tx, id: Date.now() }
  return saveTransactions([entry, ...items])
}

export const updateTransaction = (id: number, changes: Partial<Transaction>): Transaction[] => {
  const items = getTransactions()
  const next = items.map((item) => (item.id === id ? { ...item, ...changes, id } : item))
  return saveTransactions(next)
}

export const deleteTransaction = (id: number): Transaction[] => {
  const items = getTransactions()
  const next = items.filter((item) => item.id !== id)
  return saveTransactions(next)
}

// Categories
export const getCategories = (): string[] => {
  const stored = load<string[] | null>(STORAGE_KEYS.categories, null)
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    persist(STORAGE_KEYS.categories, defaultCategories)
    return defaultCategories
  }
  return stored
}

export const addCategory = (name: string): string[] => {
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

export const deleteCategory = (name: string): string[] => {
  const categories = getCategories()
  const next = categories.filter((c) => c !== name)
  persist(STORAGE_KEYS.categories, next)
  return next
}

// Settings
export const getSettings = (): Settings => {
  const stored = load<Settings | null>(STORAGE_KEYS.settings, null)
  if (!stored || typeof stored !== 'object') {
    persist(STORAGE_KEYS.settings, defaultSettings)
    return defaultSettings
  }
  return { currency: stored.currency || defaultSettings.currency }
}

export const saveSettings = (settings: Partial<Settings>): Settings => {
  const next = { ...defaultSettings, ...settings }
  persist(STORAGE_KEYS.settings, next)
  return next
}
