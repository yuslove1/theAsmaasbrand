'use client'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface FormData {
  name: string
  email: string
  phone: string
  whatsapp: string
  address: string
  city: string
  state: string
  notes: string
}

const NIGERIA_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
]

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', whatsapp: '',
    address: '', city: '', state: '', notes: '',
  })

  const update = (k: keyof FormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) return toast.error('Your cart is empty')
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map(({ product, quantity, note }) => ({
            product_id: product.id,
            product_name: product.name,
            product_image: product.images[0] || '',
            price: product.price,
            quantity,
            note,
          })),
          subtotal: total(),
          total: total(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      clearCart()
      router.push(`/checkout/success?order=${data.order_number}`)
    } catch (err) {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-brand-cream pt-28 flex items-center justify-center">
        <p className="font-display text-2xl text-brand-navy">
          No items to checkout. <a href="/shop" className="text-brand-wine underline">Shop now</a>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-28">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-4xl text-brand-navy mb-2">Checkout</h1>
        <div className="w-12 h-0.5 bg-brand-gold mb-8" />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white border border-brand-stone p-6">
              <h3 className="font-display text-xl text-brand-navy mb-5">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase font-body font-semibold text-brand-navy mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase font-body font-semibold text-brand-navy mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="input-field"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase font-body font-semibold text-brand-navy mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="input-field"
                    placeholder="08012345678"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase font-body font-semibold text-brand-navy mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => update('whatsapp', e.target.value)}
                    className="input-field"
                    placeholder="08012345678"
                  />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white border border-brand-stone p-6">
              <h3 className="font-display text-xl text-brand-navy mb-5">Delivery Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase font-body font-semibold text-brand-navy mb-1">
                    Street Address *
                  </label>
                  <input
                    required
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    className="input-field"
                    placeholder="House number, street name..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase font-body font-semibold text-brand-navy mb-1">
                      City *
                    </label>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      className="input-field"
                      placeholder="Lagos"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase font-body font-semibold text-brand-navy mb-1">
                      State *
                    </label>
                    <select
                      required
                      value={form.state}
                      onChange={(e) => update('state', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select State</option>
                      {NIGERIA_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase font-body font-semibold text-brand-navy mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-brand-stone p-6">
              <h3 className="font-display text-xl text-brand-navy mb-3">Payment Method</h3>
              <div className="border border-brand-gold bg-brand-gold/5 p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-brand-gold flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
                </div>
                <div>
                  <p className="font-body font-semibold text-brand-navy text-sm">Bank Transfer</p>
                  <p className="text-brand-navy/50 text-xs font-body mt-1">
                    After placing your order, you will receive bank account details via email
                    to complete payment. Your order will be processed once payment is confirmed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white border border-brand-stone p-6 sticky top-28">
              <h3 className="font-display text-xl text-brand-navy mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(({ product, quantity, note }) => (
                  <div key={product.id} className="flex gap-3">
                    <div className="relative w-14 h-16 bg-brand-stone flex-shrink-0 overflow-hidden">
                      <Image
                        src={product.images[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-xs font-medium text-brand-navy">{product.name}</p>
                      {note && <p className="text-brand-navy/40 text-xs font-body">{note}</p>}
                      <p className="text-brand-wine text-xs font-body mt-0.5">
                        ₦{product.price.toLocaleString()} × {quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-brand-stone pt-3 space-y-1 text-sm font-body">
                <div className="flex justify-between text-brand-navy/60">
                  <span>Subtotal</span>
                  <span>₦{total().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-brand-navy/60">
                  <span>Delivery</span>
                  <span className="text-brand-gold text-xs">Confirmed after order</span>
                </div>
                <div className="flex justify-between font-semibold text-brand-navy border-t border-brand-stone pt-2">
                  <span>Total</span>
                  <span>₦{total().toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
