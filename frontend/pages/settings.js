import { useEffect, useState } from 'react'
import { getSettings, saveSettings } from '../lib/storage'

const currencyOptions = ['₹', '$', '€', '£', '¥', '₩', '₦', '฿']

export default function Settings() {
  const [currency, setCurrency] = useState('₹')
  const [message, setMessage] = useState('')
  const [customCurrency, setCustomCurrency] = useState('')

  useEffect(() => {
    const settings = getSettings()
    setCurrency(settings.currency)
    setCustomCurrency(settings.currency)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const value = customCurrency || currency
    saveSettings({ currency: value })
    setMessage('Saved')
    setTimeout(() => setMessage(''), 1500)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">Personalize</p>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="card max-w-xl shadow-sm space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Display</p>
          <h2 className="text-xl font-semibold">Currency</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Choose a symbol</span>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value)
                  setCustomCurrency(e.target.value)
                }}
                className="input-field"
              >
                {currencyOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="custom">Custom…</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Custom symbol</span>
              <input
                value={customCurrency}
                onChange={(e) => setCustomCurrency(e.target.value)}
                placeholder="Type any symbol"
                className="input-field"
                maxLength={3}
              />
              <span className="text-xs text-gray-500">If you need something else, type it here.</span>
            </label>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge">Current: {customCurrency || currency}</span>
            <span className="badge">Example: {customCurrency || currency} 1,234.56</span>
          </div>

          <button type="submit" className="btn btn-primary w-full sm:w-auto">Save Settings</button>
          {message && <div className="badge" style={{ width: '100%', textAlign: 'center' }}>{message}</div>}
        </form>
      </div>
    </div>
  )
}
