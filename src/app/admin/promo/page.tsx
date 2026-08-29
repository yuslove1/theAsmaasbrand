'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

function headers() {
  return { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY }
}

export default function AdminPromoBanner() {
  const [message, setMessage] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/promo', { headers: headers() })
      .then((r) => r.json())
      .then((data) => {
        setMessage(data.message || '')
        setIsActive(!!data.is_active)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (isActive && !message.trim()) {
      return toast.error('Add a message before turning the banner on')
    }
    setSaving(true)
    try {
      const res = await fetch('/api/promo', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ message, is_active: isActive }),
      })
      if (!res.ok) throw new Error()
      toast.success('Promo banner updated!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl text-brand-navy">Promo Banner</h1>
        <p className="text-brand-navy/50 text-sm font-body mt-1">
          Announce a sale or promo in the top bar shown on every page
        </p>
      </div>

      <div className="admin-card max-w-xl space-y-5">
        <div>
          <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
            Banner Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field"
            rows={3}
            placeholder="e.g. Ramadan Sale — 20% Off Storewide! Ends March 30"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-brand-gold"
          />
          <span className="text-sm font-body font-medium text-brand-navy">
            Show this banner on the site
          </span>
        </label>

        <p className="text-brand-navy/40 text-xs font-body">
          When off, the site shows the usual &ldquo;Free delivery within Lagos&rdquo; bar instead.
        </p>

        <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Live preview */}
      <div className="mt-8">
        <p className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-3">
          Preview
        </p>
        <div className="bg-brand-navy text-brand-gold text-center py-1.5 text-xs tracking-widest uppercase font-body px-4 max-w-xl">
          {isActive && message.trim() ? message : 'Free delivery within Lagos · WhatsApp: 08143378187'}
        </div>
      </div>
    </div>
  )
}
