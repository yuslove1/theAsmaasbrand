'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Search, Filter } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import type { Product, Category } from '@/types'

interface Props {
  products: Product[]
  categories: Category[]
  searchParams: { gender?: string; category?: string; q?: string }
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem)

  return (
    <div className="product-card group">
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-stone">
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="bg-brand-wine text-white text-[10px] tracking-widest uppercase px-2 py-0.5 font-body w-fit">
              Featured
            </span>
          )}
          <span className="bg-brand-navy/80 text-white text-[10px] tracking-wider capitalize px-2 py-0.5 font-body w-fit">
            {product.category.join(' · ')}
          </span>
        </div>

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-4 gap-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              addItem(product)
              toast.success(`${product.name} added to cart!`, { icon: '🛍️' })
            }}
            className="btn-gold text-xs py-2 flex items-center gap-1"
          >
            <ShoppingBag size={14} /> Add to Cart
          </button>
          <Link
            href={`/shop/${product.slug}`}
            className="text-white/80 hover:text-white text-[10px] tracking-widest uppercase font-body transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
      <div className="p-3 sm:p-4 border border-t-0 border-brand-stone">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-base sm:text-lg text-brand-navy hover:text-brand-wine transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-brand-navy/40 text-[10px] sm:text-xs font-body mt-1 uppercase tracking-wider line-clamp-1">
          {product.subcategory}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="font-body font-semibold text-brand-wine">
            ₦{product.price.toLocaleString()}
          </p>
          {product.images.length > 1 && (
            <span className="text-brand-navy/30 text-[10px] font-body">
              {product.images.length} photos
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopClient({ products, categories, searchParams }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.q || '')
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams as Record<string, string>)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/shop?${params.toString()}`)
  }

  const womenCats = categories.filter((c) => c.gender.includes('women'))
  const menCats = categories.filter((c) => c.gender.includes('men'))

  return (
    <div className="min-h-screen bg-brand-cream pt-24">
      {/* Page header */}
      <div className="bg-brand-navy py-16 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center opacity-5 text-[200px] select-none pointer-events-none"
          style={{ fontFamily: 'var(--font-amiri)', color: '#C9A84C' }}
        >
          متجر
        </div>
        <h1 className="font-display text-3xl sm:text-5xl text-white font-light relative z-10">
          {searchParams.gender === 'women' ? 'Women\'s Collection' :
           searchParams.gender === 'men'   ? 'Men\'s Collection' : 'All Collections'}
        </h1>
        <p className="text-brand-gold text-sm tracking-widest uppercase font-body mt-2 relative z-10">
          {products.length} items available
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-navy/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateFilter('q', search)}
              placeholder="Search products..."
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Gender tabs */}
            {['all', 'women', 'men'].map((g) => (
              <button
                key={g}
                onClick={() => updateFilter('gender', g === 'all' ? '' : g)}
                className={`px-3 sm:px-4 py-2 text-xs tracking-widest uppercase font-body transition-colors ${
                  (g === 'all' && !searchParams.gender) || searchParams.gender === g
                    ? 'bg-brand-navy text-white'
                    : 'border border-brand-stone text-brand-navy hover:border-brand-navy'
                }`}
              >
                {g === 'all' ? 'All' : g === 'women' ? 'Women' : 'Men'}
              </button>
            ))}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-brand-stone px-4 py-2 text-xs tracking-widest uppercase font-body hover:border-brand-navy transition-colors"
            >
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Category filters */}
        {showFilters && (
          <div className="mb-8 p-4 sm:p-5 border border-brand-stone bg-white grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-3">
                Women&apos;s Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {womenCats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateFilter('category', c.slug)}
                    className={`px-3 py-1 text-xs font-body border transition-colors ${
                      searchParams.category === c.slug
                        ? 'bg-brand-wine text-white border-brand-wine'
                        : 'border-brand-stone hover:border-brand-wine'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-3">
                Men&apos;s Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {menCats.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateFilter('category', c.slug)}
                    className={`px-3 py-1 text-xs font-body border transition-colors ${
                      searchParams.category === c.slug
                        ? 'bg-brand-wine text-white border-brand-wine'
                        : 'border-brand-stone hover:border-brand-wine'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="text-center py-24">
            <p
              className="text-brand-gold text-6xl mb-4 opacity-30"
              style={{ fontFamily: 'var(--font-amiri)' }}
            >
              لا توجد منتجات
            </p>
            <p className="text-brand-navy/40 font-body">No products found. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
