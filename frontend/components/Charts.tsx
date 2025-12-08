'use client'

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Transaction } from '@/lib/storage'

interface ChartProps {
  transactions: Transaction[]
  currency: string
}

export function ExpenseIncomeChart({ transactions, currency }: ChartProps) {
  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const total = income + expense
  const balance = income - expense

  const data = [
    { name: 'Income', value: income },
    { name: 'Expense', value: expense },
  ]

  const hasData = data.some((item) => item.value > 0)

  const COLORS = ['#10b981', '#ef4444']

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-semibold">Income vs Expense</h3>
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          <span className="badge">Total {currency} {Number(total || 0).toFixed(2)}</span>
          <span className="badge badge-income">Income {currency} {Number(income || 0).toFixed(2)}</span>
          <span className="badge badge-expense">Expense {currency} {Number(expense || 0).toFixed(2)}</span>
        </div>
      </div>
      {!hasData ? (
        <p className="text-sm text-gray-500">Add a transaction to see this chart.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={55}
              outerRadius={95}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize={12} fontWeight={600}>
              Bal {currency} {Number(balance || 0).toFixed(0)}
            </text>
            <Tooltip formatter={(value) => `${currency} ${Number(value).toFixed(2)}`} />
            <Legend verticalAlign="bottom" height={36} formatter={(value) => value} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function CategoryBreakdown({ transactions, currency }: ChartProps) {
  const categoryData = transactions.reduce(
    (acc, tx) => {
      const existing = acc.find((c) => c.name === tx.category)
      if (existing) {
        existing.value += tx.amount
      } else {
        acc.push({ name: tx.category || 'Other', value: tx.amount })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>
  )

  if (categoryData.length === 0) return null

  const total = categoryData.reduce((sum, item) => sum + item.value, 0)
  const top = categoryData.reduce(
    (best, item) => (item.value > best.value ? item : best),
    { name: '—', value: 0 }
  )

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-lg font-semibold">By Category</h3>
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          <span className="badge">Total {currency} {Number(total || 0).toFixed(2)}</span>
          <span className="badge">Top: {top.name}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" interval={0} angle={-18} textAnchor="end" height={50} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => `${currency} ${Number(value).toFixed(2)}`} />
          <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} minPointSize={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
