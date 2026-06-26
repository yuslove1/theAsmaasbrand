'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Share2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

interface Props { product: Product; related: Product[] }

export default function ProductDetail({ product, related }: Props) {
  const [activeImage, setActiveImage] = useState(0)
  const [note, setNote] = useState('')
  const [quantity, setQuantity] = useState(1)
  const addItem = useCart((s) => s.addItem)

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) addItem(product, note)
    toast.success(`${product.name} added to cart!`, { icon: '🛍️' })
  }

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=700']

  return (
    <div className="min-h-screen bg-brand-cream pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          href="/shop"
          className="flex items-center gap-2 text-brand-navy/50 hover:text-brand-wine text-sm font-body mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-[3/4] bg-brand-stone overflow-hidden">
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.is_featured && (
                <span className="absolute top-4 left-4 bg-brand-wine text-white text-xs tracking-widest uppercase px-3 py-1 font-body">
                  Featured
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-brand-wine' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-brand-navy/40 text-xs tracking-widest uppercase font-body mb-2">
              {product.category.join(', ')} · {product.subcategory}
            </p>
            <h1 className="font-display text-4xl text-brand-navy mb-3">{product.name}</h1>
            <p className="font-body font-bold text-2xl text-brand-wine mb-4">
              ₦{product.price.toLocaleString()}
            </p>
            <div className="w-12 h-0.5 bg-brand-gold mb-5" />
            <p className="text-brand-navy/60 font-body text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-xs tracking-widest uppercase font-body font-semibold text-brand-navy mb-2">
                Custom Notes (Color, Size, etc.)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="e.g. I want this in Navy Blue, size Medium..."
                className="input-field resize-none"
              />
              <p className="text-brand-navy/30 text-xs font-body mt-1">
                Describe any preferences — color, size, or special requests.
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <label className="text-xs tracking-widest uppercase font-body font-semibold text-brand-navy">
                Qty
              </label>
              <div className="flex items-center border border-brand-stone">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-brand-stone transition-colors font-body"
                >
                  −
                </button>
                <span className="w-10 h-10 flex items-center justify-center font-body text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-brand-stone transition-colors font-body"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAdd} className="btn-primary flex items-center justify-center gap-2 flex-1">
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copied!')
                }}
                className="btn-outline flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> Share
              </button>
            </div>

            {/* Delivery note */}
            <div className="mt-6 p-4 border border-brand-stone bg-white">
              <p className="text-brand-navy/50 text-xs font-body leading-relaxed">
                🚚 We deliver to all states in Nigeria via bank transfer payment.
                Order confirmation will be sent to your email. WhatsApp: 08143378187
              </p>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl text-brand-navy mb-2">You May Also Like</h2>
            <div className="w-10 h-0.5 bg-brand-gold mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link key={p.id} href={`/shop/${p.slug}`} className="product-card group block">
                  <div className="relative aspect-[3/4] bg-brand-stone overflow-hidden">
                    <Image
                      src={p.images[0] || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400'}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 border border-t-0 border-brand-stone">
                    <p className="font-display text-base text-brand-navy">{p.name}</p>
                    <p className="text-brand-wine text-sm font-body font-semibold mt-1">
                      ₦{p.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
