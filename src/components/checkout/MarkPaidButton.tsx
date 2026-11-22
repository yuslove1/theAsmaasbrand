'use client'
import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

type Status = 'pending' | 'reported' | 'confirmed'

const MAX_BYTES = 4 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_DIMENSION = 2000

// Phone screenshots/photos can be several MB; shrink them before upload so they
// fit Vercel's request size limit and upload quickly on mobile data.
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size < 1.5 * 1024 * 1024) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85))
    if (!blob) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export default function MarkPaidButton({
  orderNumber,
  orderId,
  initialStatus = 'pending',
}: {
  orderNumber: string
  orderId: string
  initialStatus?: Status
}) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    setPreparing(true)
    try {
      const ready = await shrinkImage(picked)
      if (!ALLOWED.includes(ready.type)) {
        toast.error('Please upload a photo/screenshot (JPG or PNG) or a PDF of your receipt')
        return
      }
      if (ready.size > MAX_BYTES) {
        toast.error('That file is too large. Please upload a screenshot or a file under 4MB.')
        return
      }
      setFile(ready)
      setPreview(ready.type.startsWith('image/') ? URL.createObjectURL(ready) : null)
    } finally {
      setPreparing(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
  }

  const submit = async () => {
    if (!file) return toast.error('Please upload your payment receipt first')
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('order_number', orderNumber)
      fd.append('order_id', orderId)
      fd.append('receipt', file)
      const res = await fetch('/api/orders/mark-paid', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error)
      setStatus(data.already === 'confirmed' ? 'confirmed' : 'reported')
      toast.success("Thanks! We've received your receipt and will confirm shortly.")
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try again or contact us on WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'confirmed') {
    return <p className="text-sm font-body text-green-600 font-medium">✓ Your payment has been confirmed</p>
  }
  if (status === 'reported') {
    return (
      <p className="text-sm font-body text-green-600 font-medium">
        ✓ Receipt received — we&apos;ll confirm your payment shortly
      </p>
    )
  }

  return (
    <div className="bg-white border border-brand-stone p-5 text-left">
      <p className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1 text-center">
        Upload Payment Receipt
      </p>
      <p className="text-brand-navy/50 text-xs font-body mb-4 text-center">
        After transferring, upload a screenshot or PDF of your transfer receipt, then tap &ldquo;I&apos;ve Made Payment&rdquo;.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={pickFile}
      />

      {file ? (
        <div className="flex items-center gap-3 border border-brand-stone p-2 mb-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Receipt preview" className="w-14 h-14 object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 flex items-center justify-center bg-brand-cream flex-shrink-0">
              <FileText size={22} className="text-brand-wine" />
            </div>
          )}
          <p className="flex-1 min-w-0 text-sm font-body text-brand-navy truncate">{file.name}</p>
          <button
            type="button"
            onClick={clearFile}
            disabled={submitting}
            aria-label="Remove receipt"
            className="p-1.5 text-brand-navy/50 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={preparing}
          className="w-full border-2 border-dashed border-brand-stone hover:border-brand-gold py-6 mb-4 flex flex-col items-center gap-1 text-brand-navy/60 font-body text-sm transition-colors disabled:opacity-60"
        >
          <Upload size={20} />
          {preparing ? 'Preparing...' : 'Choose receipt (photo, screenshot or PDF)'}
        </button>
      )}

      <button
        onClick={submit}
        disabled={!file || submitting || preparing}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Uploading...' : "I've Made Payment"}
      </button>
    </div>
  )
}
