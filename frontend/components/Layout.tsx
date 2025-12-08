'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSettings } from '@/lib/storage'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState('₹')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const settings = getSettings()
    setCurrency(settings.currency)
  }, [])

  if (!mounted) return <>{children}</>

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link href="/dashboard" className="font-bold text-xl tracking-tight">
              💰 Financial Tracker
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/add-transaction" className="text-slate-300 hover:text-white px-3 py-2 rounded-md transition-colors text-sm font-medium">
                Add
              </Link>
              <Link href="/transactions" className="text-slate-300 hover:text-white px-3 py-2 rounded-md transition-colors text-sm font-medium">
                All
              </Link>
              <Link href="/categories" className="text-slate-300 hover:text-white px-3 py-2 rounded-md transition-colors text-sm font-medium">
                Categories
              </Link>
              <Link href="/settings" className="text-slate-300 hover:text-white px-3 py-2 rounded-md transition-colors text-sm font-medium">
                Settings
              </Link>
              <span className="bg-slate-700 text-slate-100 px-2 py-1 rounded-full text-xs font-medium">
                {currency}
              </span>
            </div>
          </div>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
