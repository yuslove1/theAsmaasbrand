import Link from 'next/link'
import Image from 'next/image'

const categories = [
  {
    title: 'Women\'s Collection',
    subtitle: 'Abayas · Hijabs · Scarves · Pins',
    href: '/shop?gender=women',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    arabic: 'مجموعة النساء',
  },
  {
    title: 'Men\'s Collection',
    subtitle: 'Jalabias · Inner Caps · Islamic Essentials',
    href: '/shop?gender=men',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    arabic: 'مجموعة الرجال',
  },
  {
    title: 'Islamic Art & Gifts',
    subtitle: 'Signs · Art · Gift Items',
    href: '/shop',
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80',
    arabic: 'هدايا إسلامية',
  },
]

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="arabic-accent text-2xl mb-2" style={{ fontFamily: 'var(--font-amiri)' }}>
            تسوق الآن
          </p>
          <h2 className="section-heading">Shop by Collection</h2>
          <div className="gold-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative overflow-hidden aspect-[3/4] block"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p
                  className="text-brand-gold/60 text-lg mb-1"
                  style={{ fontFamily: 'var(--font-amiri)' }}
                >
                  {cat.arabic}
                </p>
                <h3 className="font-display text-2xl text-white font-medium">{cat.title}</h3>
                <p className="text-white/50 text-xs tracking-wider mt-1 font-body">{cat.subtitle}</p>
                <div className="mt-4 flex items-center gap-2 text-brand-gold text-sm font-body tracking-widest uppercase">
                  <span>Explore</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
