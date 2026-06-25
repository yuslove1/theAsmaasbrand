'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Share2, ArrowRight, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

interface Props {
  products: Product[]
  shareToken: string
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card group">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-card-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            href={`/shop/${product.slug}`}
            className="btn-gold w-full text-center block text-xs py-2"
          >
            View Item
          </Link>
        </div>

        {/* Featured badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-brand-wine text-white text-[10px] tracking-widest uppercase px-2 py-1 font-body">
            Featured
          </span>
        </div>
      </div>

      <div className="p-4 border border-t-0 border-brand-stone">
        <h3 className="font-display text-lg text-brand-navy">{product.name}</h3>
        <p className="text-brand-navy/50 text-xs mt-1 font-body line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <p className="font-body font-semibold text-brand-wine">
            ₦{product.price.toLocaleString()}
          </p>
          <Link
            href={`/shop/${product.slug}`}
            className="text-brand-gold text-xs tracking-wider font-body hover:text-brand-wine transition-colors"
          >
            Order →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FeaturedSection({ products, shareToken }: Props) {
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/featured/${shareToken}`

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "The Asmaa's Brand — Featured Items",
        text: 'Check out these amazing pieces from The Asmaa\'s Brand! 🌟',
        url: shareUrl,
      })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  if (!products.length) return null

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="arabic-accent text-2xl mb-2" style={{ fontFamily: 'var(--font-amiri)' }}>
              عروض هذا الأسبوع
            </p>
            <h2 className="section-heading">Items of the Week</h2>
            <div className="gold-divider mx-0 mt-3" />
            <p className="text-brand-navy/50 text-sm font-body mt-3 max-w-md">
              Handpicked favourites updated every week. Be the first to grab them.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 border border-brand-gold text-brand-gold px-4 py-2 text-xs tracking-widest uppercase font-body hover:bg-brand-gold hover:text-white transition-all duration-300"
            >
              <Share2 size={14} />
              Share This Week&apos;s Picks
            </button>
            <Link
              href="/featured"
              className="flex items-center gap-2 bg-brand-navy text-white px-4 py-2 text-xs tracking-widest uppercase font-body hover:bg-brand-wine transition-colors"
            >
              View All <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            Browse Full Collection <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
