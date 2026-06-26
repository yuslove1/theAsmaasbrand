'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, StarOff, Share2, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

export default function AdminFeatured() {
  const [products, setProducts] = useState<Product[]>([])
  const [shareToken, setShareToken] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const data = await fetch('/api/products').then((r) => r.json())
    setProducts(Array.isArray(data) ? data : [])
    // Get or generate share token from localStorage for simplicity
    const token = localStorage.getItem('featured_token') || generateToken()
    localStorage.setItem('featured_token', token)
    setShareToken(token)
  }

  useEffect(() => { load() }, [])

  const generateToken = () => Math.random().toString(36).substring(2, 10)

  const featured = products.filter((p) => p.is_featured)
  const shareUrl = `${window?.location?.origin}/featured/${shareToken}`

  const toggleFeatured = async (product: Product) => {
    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({ id: product.id, is_featured: !product.is_featured }),
      })
      if (!res.ok) throw new Error()
      toast.success(product.is_featured ? 'Removed from featured' : 'Added to featured! ⭐')
      load()
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Share link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "The Asmaa's Brand — Featured Items",
        text: "Check out this week's picks from The Asmaa's Brand! 🌟",
        url: shareUrl,
      })
    } else {
      copyShareLink()
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl text-brand-navy">Featured Items</h1>
        <p className="text-brand-navy/50 text-sm font-body mt-1">
          Toggle which products appear in the &quot;Items of the Week&quot; section
        </p>
      </div>

      {/* Share panel */}
      <div className="bg-brand-navy p-4 sm:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-brand-gold text-xs tracking-widest uppercase font-body mb-1">
            Shareable Link
          </p>
          <p className="text-white font-display text-lg">
            {featured.length} item{featured.length !== 1 ? 's' : ''} featured this week
          </p>
          <p className="text-white/40 text-xs font-body mt-1 break-all max-w-sm">{shareUrl}</p>
        </div>
        <div className="flex gap-3 flex-shrink-0 flex-wrap">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 border border-white/20 text-white px-4 py-2 text-xs tracking-widest uppercase font-body hover:border-brand-gold hover:text-brand-gold transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-brand-gold text-brand-navy px-4 py-2 text-xs tracking-widest uppercase font-body hover:bg-brand-gold2 transition-all"
          >
            <Share2 size={14} /> Share to Socials
          </button>
        </div>
      </div>

      {/* Currently featured */}
      {featured.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-xl text-brand-navy mb-4">
            Currently Featured
            <span className="text-brand-gold ml-2 text-sm font-body">({featured.length})</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
              <div key={p.id} className="relative admin-card p-0 overflow-hidden group">
                <div className="relative aspect-[3/4] bg-brand-stone">
                  {p.images[0] && (
                    <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => toggleFeatured(p)}
                      disabled={loading}
                      className="bg-red-500 text-white px-3 py-1.5 text-xs font-body flex items-center gap-1.5 hover:bg-red-600 transition-colors"
                    >
                      <StarOff size={12} /> Remove
                    </button>
                  </div>
                </div>
                <div className="p-3 border-t border-brand-stone">
                  <p className="font-body text-xs font-medium text-brand-navy line-clamp-1">{p.name}</p>
                  <p className="text-brand-wine text-xs font-body">₦{p.price.toLocaleString()}</p>
                </div>
                <div className="absolute top-2 right-2">
                  <Star size={16} className="text-brand-gold fill-brand-gold" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All products toggle list */}
      <div className="admin-card">
        <h2 className="font-display text-xl text-brand-navy mb-4">All Products</h2>
        <p className="text-brand-navy/40 text-xs font-body mb-5">
          Toggle the star icon to add or remove a product from the featured section.
        </p>

        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 p-3 border border-brand-stone hover:border-brand-gold/50 transition-colors group"
            >
              <div className="relative w-12 h-14 bg-brand-stone flex-shrink-0 overflow-hidden">
                {p.images[0] && (
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-brand-navy truncate">{p.name}</p>
                <p className="text-brand-navy/40 text-xs font-body capitalize">
                  {p.category.join(', ')} · {p.subcategory}
                </p>
              </div>
              <p className="text-brand-wine text-sm font-body font-semibold flex-shrink-0">
                ₦{p.price.toLocaleString()}
              </p>
              <button
                onClick={() => toggleFeatured(p)}
                disabled={loading}
                className="flex-shrink-0 transition-transform hover:scale-110"
                title={p.is_featured ? 'Remove from featured' : 'Add to featured'}
              >
                <Star
                  size={22}
                  className={p.is_featured
                    ? 'text-brand-gold fill-brand-gold'
                    : 'text-brand-navy/20 hover:text-brand-gold transition-colors'}
                />
              </button>
            </div>
          ))}

          {products.length === 0 && (
            <p className="text-center text-brand-navy/30 py-8 font-body">
              No products yet. Add products first.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
