import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSettings } from '../lib/storage'

export default function Layout({ children }) {
  const [currency, setCurrency] = useState('₹')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const settings = getSettings()
    setCurrency(settings.currency)
  }, [])

  const NavLinks = ({ onClick }) => (
    <>
      <Link href="/dashboard" className="nav-link" onClick={onClick}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
        <span>Dashboard</span>
      </Link>
      <Link href="/add-transaction" className="nav-link" onClick={onClick}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
        <span>Add</span>
      </Link>
      <Link href="/transactions" className="nav-link" onClick={onClick}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z" /></svg>
        <span>Transactions</span>
      </Link>
      <Link href="/categories" className="nav-link" onClick={onClick}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 3C6.24 3 4 5.24 4 8s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5m0 9c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4m7-2v-3h-3V7h3V4h2v3h3v2h-3v3h-2z" /></svg>
        <span>Categories</span>
      </Link>
      <Link href="/settings" className="nav-link" onClick={onClick}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.39-1.03-.74-1.62-.99l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.25-1.13.61-1.62.99l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.39 1.03.74 1.62.99l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.25 1.13-.61 1.62-.99l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.1-.62l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
        <span>Settings</span>
      </Link>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="relative w-10 h-10 flex-shrink-0 hidden sm:block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur-md opacity-60"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-lg">
                  ₹
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">FinTrack</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLinks />
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Currency Badge */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 shadow-lg">
                <span className="text-xs font-semibold text-gray-700">Currency:</span>
                <span className="text-sm font-bold text-blue-600">{currency}</span>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-white/40 hover:bg-gradient-to-br hover:from-blue-500/30 hover:to-purple-500/30 transition-all flex items-center justify-center text-white shadow-lg"
                aria-label="Toggle navigation"
              >
                <div className="w-5 h-5 relative flex flex-col justify-center items-center gap-1.5">
                  <span className={`block h-0.5 w-5 bg-gray-900 transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                  <span className={`block h-0.5 w-5 bg-gray-900 transition-all ${mobileOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block h-0.5 w-5 bg-gray-900 transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileOpen && (
            <div className="lg:hidden pb-4 pt-3 px-2 bg-white/95 backdrop-blur-sm border-t border-slate-200 rounded-b-2xl shadow-xl">
              <nav className="flex flex-col gap-1">
                <NavLinks onClick={() => setMobileOpen(false)} />
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
