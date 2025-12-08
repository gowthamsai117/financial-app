import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getSettings } from '../lib/storage'
import { getTransactions } from '../lib/api'
import { ExpenseIncomeChart, CategoryBreakdown } from '../components/Charts'

const toNumber = (value) => (Number.isFinite(value) ? value : 0)

const sortByDateDesc = (items) => {
  return [...items].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [currency, setCurrency] = useState('₹')

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch(err => {
        console.error('Failed to load transactions:', err)
        setTransactions([])
      })
    const settings = getSettings()
    setCurrency(settings.currency)
  }, [])

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + toNumber(t.amount), 0)
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + toNumber(t.amount), 0)
    const balance = income - expense
    const lastFive = sortByDateDesc(transactions).slice(0, 5)
    return { income, expense, balance, lastFive }
  }, [transactions])

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-lg">
        <div>
          <p className="text-sm text-gray-600">Overview</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Track balance, income, and spending at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/add-transaction" className="btn btn-primary">Add Transaction</Link>
          <Link href="/transactions" className="btn">View All</Link>
          <span className="accent-pill">Currency {currency}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card glass-card">
            <div className="text-gray-600 text-sm mb-1">Balance</div>
            <div className={`text-3xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currency} {stats.balance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Income minus expenses to date.</p>
          </div>
          <div className="card glass-card">
            <div className="text-gray-600 text-sm mb-1">Total Income</div>
            <div className="text-3xl font-bold text-green-600">{currency} {stats.income.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">All tracked inflows.</p>
          </div>
          <div className="card glass-card">
            <div className="text-gray-600 text-sm mb-1">Total Expense</div>
            <div className="text-3xl font-bold text-red-600">{currency} {stats.expense.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">All tracked outflows.</p>
          </div>
        </div>

        <div className="lg:col-span-2 card glass-card bg-gradient-to-br from-blue-50/60 to-white border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-700">Highlights</p>
              <h3 className="text-lg font-semibold">Quick Snapshot</h3>
            </div>
            <span className="badge">Currency {currency}</span>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between"><span>Recent entries</span><span className="font-semibold">{stats.lastFive.length}</span></div>
            <div className="flex items-center justify-between"><span>Categories used</span><span className="font-semibold">{new Set(transactions.map((t) => t.category || 'Other')).size}</span></div>
            <div className="flex items-center justify-between"><span>Highest spend</span><span className="font-semibold">{currency} {Math.max(0, ...transactions.filter((t) => t.type === 'expense').map((t) => toNumber(t.amount))).toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ExpenseIncomeChart transactions={transactions} currency={currency} />
        <CategoryBreakdown transactions={transactions} currency={currency} />
      </div>

      <div className="card glass-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Recent</p>
            <h3 className="text-lg font-semibold">Last 5 Transactions</h3>
          </div>
          <Link href="/transactions" className="text-blue-600 hover:underline text-sm">View all</Link>
        </div>
        {stats.lastFive.length === 0 && <p className="text-gray-500">No transactions yet.</p>}
        <ul className="space-y-2">
          {stats.lastFive.map((tx) => (
            <li key={tx.id} className="flex justify-between items-start p-3 border border-gray-100 rounded-lg bg-white/60">
              <div>
                <div className="font-medium">{tx.notes || tx.category || 'Transaction'}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                    {tx.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                  <span>{tx.date || 'No date'}</span>
                  {tx.category && <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{tx.category}</span>}
                </div>
              </div>
              <div className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'income' ? '+' : '-'}{currency} {toNumber(tx.amount).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
