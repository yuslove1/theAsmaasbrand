import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import ShareButton from '@/components/ui/ShareButton'

interface Props { params: { token?: string[] } }

async function getCollection(token?: string) {
  if (token) {
    const { data } = await supabase
      .from('featured_collections')
      .select('*, products:featured_collection_products(product:products(*))')
      .eq('share_token', token)
      .eq('active', true)
      .single()
    return data
  }
  // Default: get featured products directly
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_available', true)
    .limit(8)
  return { title: "This Week's Picks", products: data || [] }
}

export default async function FeaturedPage({ params }: Props) {
  const token = params.token?.[0]
  const collection = await getCollection(token)
  const products: Product[] = collection?.products?.map((p: any) => p.product || p) || []

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const shareUrl = token ? `${appUrl}/featured/${token}` : `${appUrl}/featured`

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Shareable header — clean, no navbar clutter */}
      <div className="bg-brand-navy py-12 text-center px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center opacity-5 text-[180px] select-none pointer-events-none leading-none"
          style={{ fontFamily: 'var(--font-amiri)', color: '#C9A84C' }}
        >
          مميز
        </div>
        <p
          className="text-brand-gold text-2xl mb-2 relative z-10 opacity-70"
          style={{ fontFamily: 'var(--font-amiri)' }}
        >
          The Asmaa&apos;s Brand
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-white font-light relative z-10">
          {collection?.title || "This Week's Picks"}
        </h1>
        {collection?.subtitle && (
          <p className="text-white/50 font-body text-sm mt-2 relative z-10">{collection.subtitle}</p>
        )}
        <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-4 relative z-10" />

        {/* CTA to visit full website */}
        <div className="mt-6 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <ShareButton shareUrl={shareUrl} />
          <Link
            href="/shop"
            className="text-white/60 hover:text-brand-gold text-xs tracking-widest uppercase font-body border border-white/20 px-4 py-2 hover:border-brand-gold transition-all"
          >
            Visit Full Store →
          </Link>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-brand-navy/30 font-display text-2xl">No featured items right now.</p>
            <Link href="/shop" className="btn-primary mt-6 inline-block">Browse All Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="product-card group"
              >
                <div className="relative aspect-[3/4] bg-brand-stone overflow-hidden">
                  <Image
                    src={product.images[0] || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <div className="p-4 border border-t-0 border-brand-stone">
                  <h3 className="font-display text-base text-brand-navy">{product.name}</h3>
                  <p className="text-brand-navy/40 text-xs font-body mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-body font-semibold text-brand-wine text-sm">
                      ₦{product.price.toLocaleString()}
                    </p>
                    <span className="text-brand-gold text-xs font-body tracking-wider">Order →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Sticky bottom CTA for social traffic */}
        <div className="mt-16 bg-brand-navy p-8 text-center">
          <p
            className="text-brand-gold text-xl mb-2 opacity-70"
            style={{ fontFamily: 'var(--font-amiri)' }}
          >
            تسوق الآن
          </p>
          <h3 className="font-display text-3xl text-white mb-2">Love what you see?</h3>
          <p className="text-white/50 font-body text-sm mb-6 max-w-md mx-auto">
            Explore our full collection of Islamic fashion, essentials, and gift items.
          </p>
          <Link href="/shop" className="btn-gold inline-block">
            Shop Full Collection
          </Link>
        </div>
      </div>
    </div>
  )
}
