'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1800&q=85"
          alt="Islamic fashion and calligraphy"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/85 to-brand-navy/70" />
      </div>

      {/* Decorative Arabic text watermark */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 text-white/5 text-[180px] leading-none select-none pointer-events-none hidden lg:block"
        style={{ fontFamily: 'var(--font-amiri)' }}
      >
        أسماء
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          {/* Arabic accent */}
          <p
            className="text-brand-gold text-xl mb-3 opacity-80"
            style={{ fontFamily: 'var(--font-amiri)' }}
          >
            مرحباً بكم
          </p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl text-white font-light leading-tight mb-2">
            The Asmaa&apos;s{' '}
            <span className="text-gold-shimmer font-semibold italic">Brand</span>
          </h1>

          <p className="font-body text-white/50 tracking-[0.3em] uppercase text-sm mb-6">
            ...best of your choices
          </p>

          <p className="font-body text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-lg">
            Elegant Islamic fashion for women &amp; men. Abayas, Jalabias, Hijabs,
            Scarves, Islamic Essentials &amp; Gift Items curated with quality in mind.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop?gender=women" className="btn-gold flex items-center gap-2 w-fit">
              Shop Women&apos;s <ArrowRight size={16} />
            </Link>
            <Link href="/shop?gender=men" className="btn-outline border-white text-white hover:bg-white hover:text-brand-navy flex items-center gap-2 w-fit">
              Shop Men&apos;s <ArrowRight size={16} />
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 sm:gap-10 mt-14 border-t border-white/10 pt-8">
            {[
              { label: 'Products', value: '200+' },
              { label: 'Happy Customers', value: '1,000+' },
              { label: 'Locations', value: '2 in Lagos' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-display text-2xl sm:text-3xl text-brand-gold">{value}</p>
                <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest font-body mt-1">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
        <div className="w-px h-10 bg-white animate-pulse" />
        <p className="text-white text-[10px] tracking-widest uppercase font-body">Scroll</p>
      </div>
    </section>
  )
}
