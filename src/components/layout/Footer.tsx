'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="bg-brand-navy text-white">
      {/* Arabic calligraphy accent */}
      <div className="text-center py-6 border-b border-white/10">
        <p className="arabic-accent text-3xl opacity-60" style={{ fontFamily: 'var(--font-amiri)' }}>
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
        <p className="text-white/30 text-xs mt-1 font-body tracking-wider">
          In the name of Allah, the Most Gracious, the Most Merciful
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl text-brand-gold mb-2">The Asmaa&apos;s Brand</h3>
          <p className="text-white/40 text-xs tracking-widest uppercase mb-4 font-body">
            ...best of your choices
          </p>
          <p className="text-white/60 text-sm leading-relaxed font-body max-w-xs">
            Dealer in all kinds of Scarves, Abayas, Jalabias, Inner Caps, Hijabs, Hijab Pins,
            Islamic Essentials, Islamic Art & Signs, and Gift Items.
          </p>
          <div className="flex gap-4 mt-6">
            {['Instagram', 'TikTok', 'Facebook'].map((s) => (
              <a
                key={s}
                href="#"
                className="text-white/40 hover:text-brand-gold text-xs tracking-wider uppercase transition-colors font-body"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-body font-semibold tracking-widest text-xs uppercase text-brand-gold mb-4">
            Shop
          </h4>
          <ul className="space-y-2">
            {['Women\'s Collection', 'Men\'s Collection', 'Featured Items', 'New Arrivals'].map((item) => (
              <li key={item}>
                <Link href="/shop" className="text-white/60 hover:text-white text-sm transition-colors font-body">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-body font-semibold tracking-widest text-xs uppercase text-brand-gold mb-4">
            Contact
          </h4>
          <ul className="space-y-3 text-sm text-white/60 font-body">
            <li>13 Shoyinka Street, Fadeyi, Lagos</li>
            <li>Lagos State University, Ojo, Lagos</li>
            <li>
              <a href="mailto:asmaurufai37@gmail.com" className="hover:text-white transition-colors">
                asmaurufai37@gmail.com
              </a>
            </li>
            <li>
              <a href="https://wa.me/2348143378187" className="hover:text-white transition-colors">
                WhatsApp: 08143378187
              </a>
            </li>
            <li>
              <a href="tel:08024928389" className="hover:text-white transition-colors">
                Tel: 08024928389
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 text-center py-4 text-white/30 text-xs font-body tracking-wider">
        © {new Date().getFullYear()} The Asmaa&apos;s Brand · All rights reserved · Built with care
      </div>
    </footer>
  )
}
