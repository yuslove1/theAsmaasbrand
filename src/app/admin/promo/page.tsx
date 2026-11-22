'use client'
import { CONTACT_WHATSAPP } from '@/lib/contact'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

const REPEAT_OPTIONS = [
  { minutes: 1, label: 'Every 1 minute' },
  { minutes: 2, label: 'Every 2 minutes' },
  { minutes: 3, label: 'Every 3 minutes' },
  { minutes: 5, label: 'Every 5 minutes' },
  { minutes: 10, label: 'Every 10 minutes' },
  { minutes: 15, label: 'Every 15 minutes' },
  { minutes: 30, label: 'Every 30 minutes' },
]

export default function AdminPromo() {
  // Top bar
  const [message, setMessage] = useState('')
  const [isActive, setIsActive] = useState(false)
  // Popup ad
  const [popupImage, setPopupImage] = useState('')
  const [popupLink, setPopupLink] = useState('')
  const [popupActive, setPopupActive] = useState(false)
  const [repeatMinutes, setRepeatMinutes] = useState(5)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/promo?admin=1')
      .then((r) => r.json())
      .then((data) => {
        setMessage(data.message || '')
        setIsActive(!!data.is_active)
        setPopupImage(data.popup_image_url || '')
        setPopupLink(data.popup_link || '')
        setPopupActive(!!data.popup_is_active)
        setRepeatMinutes(data.popup_repeat_minutes || 5)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('kind', 'promo')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
      setPopupImage(data.url)
      toast.success('Image uploaded. Click Save to publish it.')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (isActive && !message.trim()) {
      return toast.error('Add a message before turning the top bar on')
    }
    if (popupActive && !popupImage) {
      return toast.error('Upload a promo picture before turning the popup on')
    }
    setSaving(true)
    try {
      const res = await fetch('/api/promo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          is_active: isActive,
          popup_image_url: popupImage,
          popup_link: popupLink,
          popup_is_active: popupActive,
          popup_repeat_minutes: repeatMinutes,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      toast.success('Promotions updated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  const labelCls = 'block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1'

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl text-brand-navy">Promotions</h1>
        <p className="text-brand-navy/50 text-sm font-body mt-1">
          Announce sales in the top bar and show a promo picture as a popup on the site
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* ─── Popup ad ─────────────────────────────────────── */}
        <div className="admin-card space-y-5">
          <div>
            <h2 className="font-display text-xl text-brand-navy">Promo Popup</h2>
            <p className="text-brand-navy/50 text-xs font-body mt-1">
              Pops up every time someone opens the website, a few seconds after they arrive. They close it with
              the ✕ button, and while they keep browsing it pops up again after the time you choose below.
              It never shows on the cart or checkout pages.
            </p>
          </div>

          <div>
            <label className={labelCls}>Promo Picture</label>
            {popupImage ? (
              <div className="relative w-fit max-w-full border border-brand-stone">
                <Image
                  src={popupImage}
                  alt="Promo picture"
                  width={1200}
                  height={1200}
                  className="block w-auto h-auto max-w-full max-h-72"
                />
                <button
                  type="button"
                  onClick={() => { setPopupImage(''); setPopupActive(false) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600"
                  aria-label="Remove picture"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <p className="text-brand-navy/40 text-sm font-body">No picture yet.</p>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-outline mt-3 flex items-center gap-2 disabled:opacity-60"
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : popupImage ? 'Replace Picture' : 'Upload Picture'}
            </button>
            <p className="text-brand-navy/40 text-xs font-body mt-2">
              Square or portrait pictures look best (e.g. a flyer made for Instagram).
            </p>
          </div>

          <div>
            <label className={labelCls}>Link (optional)</label>
            <input
              value={popupLink}
              onChange={(e) => setPopupLink(e.target.value)}
              className="input-field"
              placeholder="e.g. /shop?category=abayas"
            />
            <p className="text-brand-navy/40 text-xs font-body mt-1">
              Where visitors go when they tap the picture. Leave empty for no link.
            </p>
          </div>

          <div>
            <label className={labelCls}>Show Again</label>
            <select
              value={repeatMinutes}
              onChange={(e) => setRepeatMinutes(Number(e.target.value))}
              className="input-field"
            >
              {REPEAT_OPTIONS.map((o) => (
                <option key={o.minutes} value={o.minutes}>{o.label}</option>
              ))}
            </select>
            <p className="text-brand-navy/40 text-xs font-body mt-1">
              How long to wait before showing it again to someone who closed it and is still on the site.
              Anyone who opens the website again later sees it straight away.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={popupActive}
              onChange={(e) => setPopupActive(e.target.checked)}
              className="w-4 h-4 accent-brand-gold"
            />
            <span className="text-sm font-body font-medium text-brand-navy">Show the popup on the site</span>
          </label>
        </div>

        {/* ─── Top bar ──────────────────────────────────────── */}
        <div className="admin-card space-y-5">
          <div>
            <h2 className="font-display text-xl text-brand-navy">Top Bar Message</h2>
            <p className="text-brand-navy/50 text-xs font-body mt-1">The thin bar at the top of every page.</p>
          </div>

          <div>
            <label className={labelCls}>Banner Message</label>
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
            <span className="text-sm font-body font-medium text-brand-navy">Show this message in the top bar</span>
          </label>

          <p className="text-brand-navy/40 text-xs font-body">
            When off, the site shows the usual &ldquo;Free delivery within Lagos&rdquo; bar instead.
          </p>

          <div>
            <p className={labelCls}>Preview</p>
            <div className="bg-brand-navy text-brand-gold text-center py-1.5 text-xs tracking-widest uppercase font-body px-4">
              {isActive && message.trim() ? message : `Free delivery within Lagos · WhatsApp: ${CONTACT_WHATSAPP}`}
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving || uploading} className="btn-primary mt-6 disabled:opacity-60">
        {saving ? 'Saving...' : 'Save Promotions'}
      </button>
    </div>
  )
}
