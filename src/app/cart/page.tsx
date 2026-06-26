'use client'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, updateNote, total, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-cream pt-28 flex flex-col items-center justify-center text-center px-6">
        <p className="text-brand-gold text-7xl mb-4 opacity-30" style={{ fontFamily: 'var(--font-amiri)' }}>
          عربة التسوق
        </p>
        <ShoppingBag size={48} className="text-brand-navy/20 mb-4" />
        <h2 className="font-display text-3xl text-brand-navy mb-2">Your cart is empty</h2>
        <p className="text-brand-navy/50 font-body mb-8">Start shopping to add items.</p>
        <Link href="/shop" className="btn-primary">Browse Collection</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-28">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl sm:text-4xl text-brand-navy mb-2">Your Cart</h1>
        <div className="w-12 h-0.5 bg-brand-gold mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity, note }) => (
              <div key={product.id} className="bg-white border border-brand-stone p-3 sm:p-4 flex gap-3 sm:gap-4">
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0 bg-brand-stone overflow-hidden">
                  <Image
                    src={product.images[0] || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=200'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-display text-lg text-brand-navy">{product.name}</h3>
                      <p className="text-brand-navy/40 text-xs font-body uppercase tracking-wider">
                        {product.subcategory}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-brand-navy/30 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="font-body font-semibold text-brand-wine mt-1">
                    ₦{product.price.toLocaleString()}
                  </p>

                  {/* Note */}
                  <textarea
                    value={note}
                    onChange={(e) => updateNote(product.id, e.target.value)}
                    placeholder="Color, size, preferences..."
                    rows={2}
                    className="input-field text-xs mt-2 resize-none"
                  />

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-7 h-7 border border-brand-stone flex items-center justify-center hover:bg-brand-stone transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-body w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-7 h-7 border border-brand-stone flex items-center justify-center hover:bg-brand-stone transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <span className="text-brand-navy/40 text-xs font-body ml-2">
                      = ₦{(product.price * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-brand-navy/30 hover:text-red-500 text-xs font-body tracking-wider uppercase transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Summary */}
          <div className="bg-white border border-brand-stone p-6 h-fit">
            <h3 className="font-display text-xl text-brand-navy mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 text-sm font-body">
              <div className="flex justify-between text-brand-navy/60">
                <span>Subtotal</span>
                <span>₦{total().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-navy/60">
                <span>Delivery</span>
                <span className="text-brand-gold">To be confirmed</span>
              </div>
              <div className="border-t border-brand-stone pt-2 flex justify-between font-semibold text-brand-navy">
                <span>Total</span>
                <span>₦{total().toLocaleString()}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Checkout <ArrowRight size={16} />
            </Link>

            <Link href="/shop" className="block text-center text-brand-navy/40 hover:text-brand-wine text-xs font-body mt-4 tracking-wider transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
