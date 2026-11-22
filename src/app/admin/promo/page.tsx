'use client'
import { CONTACT_WHATSAPP } from '@/lib/contact'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, CheckCircle2, AlertTriangle, CircleDot, CircleOff } from 'lucide-react'
import toast from 'react-hot-toast'
import PromoTicker from '@/components/layout/PromoTicker'

const REPEAT_OPTIONS = [
  { minutes: 1, label: 'Every 1 minute' },
  { minutes: 2, label: 'Every 2 minutes' },
  { minutes: 3, label: 'Every 3 minutes' },
  { minutes: 5, label: 'Every 5 minutes' },
  { minutes: 10, label: 'Every 10 minutes' },
  { minutes: 15, label: 'Every 15 minutes' },
  { minutes: 30, label: 'Every 30 minutes' },
]

type PromoForm = {
  message: string
  image: string
  link: string
  repeatMinutes: number
  isActive: boolean
}

type SaveResult = { ok: true; at: Date } | { ok: false; error: string } | null

// What visitors actually see for a given (saved) promotion
function describeLive(p: PromoForm): string {
  if (!p.isActive) return 'Visitors see the usual “Free delivery within Lagos” bar. No promotion is showing.'
  const hasMsg = !!p.message.trim()
  if (hasMsg && p.image) return 'Your message is scrolling in the top bar AND the picture pops up over the website.'
  if (p.image) return 'The picture pops up over the website (no top-bar message).'
  return 'Your message is scrolling in the top bar (no popup, because there is no picture).'
}

const sameForm = (a: PromoForm, b: PromoForm) =>
  a.message === b.message && a.image === b.image && a.link === b.link &&
  a.repeatMinutes === b.repeatMinutes && a.isActive === b.isActive

// One promotion: the message always goes in the top bar; adding a picture (optional)
// also shows it as a popup over the site. One switch turns the whole promotion on/off.
export default function AdminPromo() {
  const [form, setForm] = useState<PromoForm>({ message: '', image: '', link: '', repeatMinutes: 5, isActive: false })
  const [saved, setSaved] = useState<PromoForm | null>(null) // what is live right now
  const [result, setResult] = useState<SaveResult>(null)
  const [justSaved, setJustSaved] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const set = <K extends keyof PromoForm>(key: K, value: PromoForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setResult(null) // an old "saved" message would be misleading once something changes
  }

  useEffect(() => {
    fetch('/api/promo?admin=1')
      .then((r) => r.json())
      .then((data) => {
        const loaded: PromoForm = {
          message: data.message || '',
          image: data.popup_image_url || '',
          link: data.popup_link || '',
          repeatMinutes: data.popup_repeat_minutes || 5,
          isActive: !!data.is_active || !!data.popup_is_active,
        }
        setForm(loaded)
        setSaved(loaded)
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
      set('image', data.url)
      toast.success('Picture uploaded — click Save Promotion to publish it.')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const showResult = (r: SaveResult) => {
    setResult(r)
    // Bring the message into view (the button can be far down the page on a phone)
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  const handleSave = async () => {
    if (form.isActive && !form.message.trim() && !form.image) {
      return showResult({ ok: false, error: 'Add a message or a picture before turning the promotion on.' })
    }
    setSaving(true)
    setResult(null)
    try {
      const res = await fetch('/api/promo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: form.message,
          is_active: form.isActive && !!form.message.trim(),
          popup_image_url: form.image,
          popup_link: form.link,
          popup_is_active: form.isActive && !!form.image,
          popup_repeat_minutes: form.repeatMinutes,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'The promotion could not be saved.')
      setSaved(form)
      showResult({ ok: true, at: new Date() })
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2500)
    } catch (err: any) {
      showResult({ ok: false, error: err.message || 'The promotion could not be saved.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  const dirty = !!saved && !sameForm(form, saved)
  const labelCls = 'block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1'
  const hint = 'text-brand-navy/40 text-xs font-body mt-1'

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl text-brand-navy">Promotion</h1>
        <p className="text-brand-navy/50 text-sm font-body mt-1">
          Announce a sale or promo. The message scrolls in the top bar of every page; add a picture
          if you also want it to pop up over the website.
        </p>
      </div>

      {/* ─── What's live right now ─────────────────────────── */}
      {saved && (
        <div
          className={`max-w-2xl mb-6 border-l-4 p-4 flex gap-3 items-start ${
            saved.isActive ? 'border-green-600 bg-green-50' : 'border-brand-navy/30 bg-white'
          }`}
        >
          {saved.isActive ? (
            <CircleDot size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CircleOff size={20} className="text-brand-navy/40 flex-shrink-0 mt-0.5" />
          )}
          <div className="font-body">
            <p className="text-xs font-bold tracking-widest uppercase">
              {saved.isActive ? (
                <span className="text-green-700">Live on the website now</span>
              ) : (
                <span className="text-brand-navy/60">Promotion is off</span>
              )}
            </p>
            <p className="text-sm text-brand-navy/70 mt-1">{describeLive(saved)}</p>
          </div>
        </div>
      )}

      <div className="admin-card max-w-2xl space-y-6">
        {/* Message → top bar */}
        <div>
          <label className={labelCls}>Promo Message</label>
          <textarea
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            className="input-field"
            rows={2}
            placeholder="e.g. Ramadan Sale — 20% Off Storewide! Ends March 30"
          />
          <p className={hint}>Scrolls across the thin bar at the top of every page. Preview:</p>
          <div className="mt-2 bg-brand-navy text-brand-gold py-1.5 text-xs tracking-widest uppercase font-body">
            {form.isActive && form.message.trim() ? (
              <PromoTicker message={form.message} />
            ) : (
              <div className="text-center px-4">Free delivery within Lagos · WhatsApp: {CONTACT_WHATSAPP}</div>
            )}
          </div>
        </div>

        {/* Optional picture → popup */}
        <div>
          <label className={labelCls}>Promo Picture (optional)</label>
          {form.image ? (
            <div className="relative w-fit max-w-full border border-brand-stone">
              <Image
                src={form.image}
                alt="Promo picture"
                width={1200}
                height={1200}
                className="block w-auto h-auto max-w-full max-h-72"
              />
              <button
                type="button"
                onClick={() => set('image', '')}
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
            {uploading ? 'Uploading...' : form.image ? 'Replace Picture' : 'Upload Picture'}
          </button>
          <p className={hint}>
            With a picture, the promo also pops up over the website every time someone opens it (never on
            the cart or checkout pages). Square or portrait flyers look best.
          </p>
        </div>

        {/* Popup-only settings */}
        {form.image && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-stone pt-5">
            <div>
              <label className={labelCls}>Picture Link (optional)</label>
              <input
                value={form.link}
                onChange={(e) => set('link', e.target.value)}
                className="input-field"
                placeholder="e.g. /shop?category=abayas"
              />
              <p className={hint}>Where visitors go when they tap the picture.</p>
            </div>
            <div>
              <label className={labelCls}>Pop Up Again</label>
              <select
                value={form.repeatMinutes}
                onChange={(e) => set('repeatMinutes', Number(e.target.value))}
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
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="w-4 h-4 accent-brand-gold"
          />
          <span className="text-sm font-body font-medium text-brand-navy">Show this promotion on the site</span>
        </label>
      </div>

      {/* ─── Save + result ─────────────────────────────────── */}
      <div className="max-w-2xl mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className={`btn-primary flex items-center gap-2 disabled:opacity-60 ${
              justSaved ? '!bg-green-600 !border-green-600' : ''
            }`}
          >
            {saving ? 'Saving...' : justSaved ? (<><CheckCircle2 size={18} /> Saved</>) : 'Save Promotion'}
          </button>
          {dirty && !saving && (
            <span className="flex items-center gap-1.5 text-amber-700 text-sm font-body">
              <AlertTriangle size={16} /> You have unsaved changes
            </span>
          )}
        </div>

        <div ref={resultRef} aria-live="polite">
          {result?.ok === true && saved && (
            <div className="border border-green-300 bg-green-50 p-4 flex gap-3 items-start">
              <CheckCircle2 size={22} className="text-green-600 flex-shrink-0" />
              <div className="font-body">
                <p className="font-semibold text-green-800">
                  Promotion saved at {result.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
                <p className="text-sm text-green-800/80 mt-1">{describeLive(saved)}</p>
              </div>
            </div>
          )}
          {result?.ok === false && (
            <div className="border border-red-300 bg-red-50 p-4 flex gap-3 items-start">
              <AlertTriangle size={22} className="text-red-600 flex-shrink-0" />
              <div className="font-body">
                <p className="font-semibold text-red-800">Not saved</p>
                <p className="text-sm text-red-800/80 mt-1">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
