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

// One promotion: the message always goes in the top bar; adding a picture (optional)
// also shows it as a popup over the site. One switch turns the whole promotion on/off.
export default function AdminPromo() {
  const [message, setMessage] = useState('')
  const [image, setImage] = useState('')
  const [link, setLink] = useState('')
  const [repeatMinutes, setRepeatMinutes] = useState(5)
  const [isActive, setIsActive] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/promo?admin=1')
      .then((r) => r.json())
      .then((data) => {
        setMessage(data.message || '')
        setImage(data.popup_image_url || '')
        setLink(data.popup_link || '')
        setRepeatMinutes(data.popup_repeat_minutes || 5)
        setIsActive(!!data.is_active || !!data.popup_is_active)
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
      setImage(data.url)
      toast.success('Picture uploaded. Click Save to publish it.')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (isActive && !message.trim() && !image) {
      return toast.error('Add a message or a picture before turning the promotion on')
    }
    setSaving(true)
    try {
      const res = await fetch('/api/promo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          is_active: isActive && !!message.trim(),
          popup_image_url: image,
          popup_link: link,
          popup_is_active: isActive && !!image,
          popup_repeat_minutes: repeatMinutes,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      toast.success(isActive ? 'Promotion is live!' : 'Promotion saved (switched off)')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  const labelCls = 'block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1'
  const hint = 'text-brand-navy/40 text-xs font-body mt-1'

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl text-brand-navy">Promotion</h1>
        <p className="text-brand-navy/50 text-sm font-body mt-1">
          Announce a sale or promo. The message shows in the top bar of every page; add a picture
          if you also want it to pop up over the website.
        </p>
      </div>

      <div className="admin-card max-w-2xl space-y-6">
        {/* Message → top bar */}
        <div>
          <label className={labelCls}>Promo Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field"
            rows={2}
            placeholder="e.g. Ramadan Sale — 20% Off Storewide! Ends March 30"
          />
          <p className={hint}>Shown in the thin bar at the top of every page.</p>
          <div className="mt-3 bg-brand-navy text-brand-gold text-center py-1.5 text-xs tracking-widest uppercase font-body px-4">
            {isActive && message.trim() ? message : `Free delivery within Lagos · WhatsApp: ${CONTACT_WHATSAPP}`}
          </div>
        </div>

        {/* Optional picture → popup */}
        <div>
          <label className={labelCls}>Promo Picture (optional)</label>
          {image ? (
            <div className="relative w-fit max-w-full border border-brand-stone">
              <Image
                src={image}
                alt="Promo picture"
                width={1200}
                height={1200}
                className="block w-auto h-auto max-w-full max-h-72"
              />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600"
                aria-label="Remove picture"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <p className="text-brand-navy/40 text-sm font-body">
              No picture — the promotion will only show in the top bar.
            </p>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-outline mt-3 flex items-center gap-2 disabled:opacity-60"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : image ? 'Replace Picture' : 'Upload Picture'}
          </button>
          <p className={hint}>
            With a picture, the promo also pops up over the website every time someone opens it (never on
            the cart or checkout pages). Square or portrait flyers look best.
          </p>
        </div>

        {/* Popup-only settings */}
        {image && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-stone pt-5">
            <div>
              <label className={labelCls}>Picture Link (optional)</label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="input-field"
                placeholder="e.g. /shop?category=abayas"
              />
              <p className={hint}>Where visitors go when they tap the picture.</p>
            </div>
            <div>
              <label className={labelCls}>Pop Up Again</label>
              <select
                value={repeatMinutes}
                onChange={(e) => setRepeatMinutes(Number(e.target.value))}
                className="input-field"
              >
                {REPEAT_OPTIONS.map((o) => (
                  <option key={o.minutes} value={o.minutes}>{o.label}</option>
                ))}
              </select>
              <p className={hint}>After a visitor closes it, while they keep browsing.</p>
            </div>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer w-fit border-t border-brand-stone pt-5">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-brand-gold"
          />
          <span className="text-sm font-body font-medium text-brand-navy">Show this promotion on the site</span>
        </label>
      </div>

      <button onClick={handleSave} disabled={saving || uploading} className="btn-primary mt-6 disabled:opacity-60">
        {saving ? 'Saving...' : 'Save Promotion'}
      </button>
    </div>
  )
}
