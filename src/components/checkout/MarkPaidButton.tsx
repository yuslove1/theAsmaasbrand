'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function MarkPaidButton({ orderNumber }: { orderNumber: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleClick = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/orders/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
      toast.success("Thanks! We've been notified and will confirm shortly.")
    } catch {
      setStatus('idle')
      toast.error('Something went wrong. Please try again or contact us on WhatsApp.')
    }
  }

  if (status === 'done') {
    return (
      <p className="text-sm font-body text-green-600 font-medium">
        ✓ Payment reported — we&apos;ll confirm shortly
      </p>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      className="btn-primary disabled:opacity-60"
    >
      {status === 'loading' ? 'Reporting...' : "I've Made Payment"}
    </button>
  )
}
