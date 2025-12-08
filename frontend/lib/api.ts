// API client for backend communication
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export interface Transaction {
  id: number
  date: string
  time?: string
  type: 'income' | 'expense'
  category: string
  amount: number
  notes?: string
}

export interface TransactionInput {
  date: string
  time?: string
  type: 'income' | 'expense'
  category: string
  amount: number
  notes?: string
}

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch(`${API_BASE}/api/transactions`)
    if (!res.ok) throw new Error('Failed to fetch transactions')
    return res.json()
  } catch (err) {
    console.error('Error fetching transactions:', err)
    throw err
  }
}

export async function createTransaction(data: TransactionInput): Promise<Transaction> {
  try {
    const res = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create transaction')
    return res.json()
  } catch (err) {
    console.error('Error creating transaction:', err)
    throw err
  }
}

export async function updateTransaction(id: number, data: Partial<TransactionInput>): Promise<Transaction> {
  try {
    const res = await fetch(`${API_BASE}/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update transaction')
    return res.json()
  } catch (err) {
    console.error('Error updating transaction:', err)
    throw err
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/transactions/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Failed to delete transaction')
  } catch (err) {
    console.error('Error deleting transaction:', err)
    throw err
  }
}
