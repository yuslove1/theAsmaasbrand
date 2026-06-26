'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X, Search } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const itemCount = useCart((s) => s.itemCount)
  const pathname = usePathname()

  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (isAdmin) return null

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-stone'
          : 'bg-transparent'
      }`}
    >
      {/* Top bar */}
      <div className="bg-brand-navy text-brand-gold text-center py-1.5 text-[10px] sm:text-xs tracking-widest uppercase font-body px-4">
        <span className="arabic-accent mr-2 text-base hidden sm:inline">بسم الله</span>
        Free delivery within Lagos · WhatsApp: 08143378187
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span
              className={`font-display text-2xl font-semibold tracking-tight transition-colors duration-500 ${
                scrolled ? 'text-brand-navy' : 'text-white'
              }`}
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              The Asmaa&apos;s Brand
            </span>
            <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-body">
              ...best of your choices
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Women', href: '/shop?gender=women' },
              { label: 'Men', href: '/shop?gender=men' },
              { label: 'Featured', href: '/featured' },
              { label: 'About', href: '/#about' },
              { label: 'Contact', href: '/#contact' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`text-sm font-body font-medium tracking-widest uppercase transition-colors duration-300 relative
                  after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:transition-all after:duration-300 hover:after:w-full ${
                  scrolled
                    ? 'text-brand-navy/80 hover:text-brand-wine after:bg-brand-wine'
                    : 'text-white/80 hover:text-white after:bg-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <button className={`hidden md:flex transition-colors ${
              scrolled ? 'text-brand-navy hover:text-brand-wine' : 'text-white/80 hover:text-white'
            }`}>
              <Search size={20} />
            </button>

            <Link href="/cart" className={`relative transition-colors ${
              scrolled ? 'text-brand-navy hover:text-brand-wine' : 'text-white/80 hover:text-white'
            }`}>
              <ShoppingBag size={22} />
              {itemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-wine text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </Link>

            {/* Mobile menu btn */}
            <button
              className={`md:hidden transition-colors ${
                scrolled ? 'text-brand-navy' : 'text-white'
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-brand-stone px-6 py-4 space-y-4">
          {[
            { label: 'Women', href: '/shop?gender=women' },
            { label: 'Men', href: '/shop?gender=men' },
            { label: 'Featured', href: '/featured' },
            { label: 'About', href: '/#about' },
            { label: 'Contact', href: '/#contact' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="block text-sm font-body font-medium tracking-widest uppercase text-brand-navy/80 hover:text-brand-wine transition-colors py-1"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
