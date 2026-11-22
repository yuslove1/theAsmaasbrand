'use client'
import { CONTACT_WHATSAPP } from '@/lib/contact'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Share2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import type { Product } from '@/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'
import Price, { discountPercent, hasDiscount } from '@/components/ui/Price'

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
            <motion.div
              className="relative aspect-[3/4] bg-brand-stone overflow-hidden"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={activeImage}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={images[activeImage]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              {product.is_featured && (
                <span className="absolute top-4 left-4 bg-brand-wine text-white text-xs tracking-widest uppercase px-3 py-1 font-body">
                  Featured
                </span>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden border-2 transition-all duration-300 hover:opacity-100 ${
                      activeImage === i ? 'border-brand-wine opacity-100' : 'border-transparent opacity-70'
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-brand-navy/40 text-xs tracking-widest uppercase font-body mb-2">
              {[product.category.join(', '), product.subcategory?.replace(/-/g, ' ')].filter(Boolean).join(' · ')}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-brand-navy mb-3">{product.name}</h1>
            <div className="mb-4">
              <Price price={product.price} compareAt={product.compare_at_price} size="lg" />
              {hasDiscount(product.price, product.compare_at_price) && (
                <p className="inline-block mt-2 bg-brand-gold/15 text-brand-navy text-xs font-body font-semibold tracking-wide px-2 py-1">
                  You save ₦{(Number(product.compare_at_price) - Number(product.price)).toLocaleString()} ({discountPercent(product.price, product.compare_at_price)}% off)
                </p>
              )}
            </div>
            <div className="w-12 h-0.5 bg-brand-gold mb-5" />
            <p className="text-brand-navy/60 font-body text-sm leading-relaxed mb-8 whitespace-pre-line">
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
                We deliver to all states in Nigeria. Only bank transfer payment is currently accepted. Please make payment to the account details provided at checkout.
                Order confirmation will be sent to your email. WhatsApp: {CONTACT_WHATSAPP}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <Reveal>
              <h2 className="font-display text-3xl text-brand-navy mb-2">You May Also Like</h2>
              <div className="w-10 h-0.5 bg-brand-gold mb-8" />
            </Reveal>
            <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <StaggerItem key={p.id}>
                <Link href={`/shop/${p.slug}`} className="product-card group block">
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
                    <Price price={p.price} compareAt={p.compare_at_price} size="sm" className="mt-1" />
                  </div>
                </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}
      </div>
    </div>
  )
}
