'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X, Search } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const itemCount = useCart((s) => s.itemCount)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-stone'
          : 'bg-transparent'
      }`}
    >
      {/* Top bar */}
      <div className="bg-brand-navy text-brand-gold text-center py-1.5 text-xs tracking-widest uppercase font-body">
        <span className="arabic-accent mr-2 text-base">بسم الله</span>
        Free delivery within Lagos · WhatsApp: 08143378187
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span
              className="font-display text-2xl font-semibold text-brand-navy tracking-tight"
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
            <Link href="/shop?gender=women" className="nav-link">Women</Link>
            <Link href="/shop?gender=men" className="nav-link">Men</Link>
            <Link href="/featured" className="nav-link">Featured</Link>
            <Link href="/#about" className="nav-link">About</Link>
            <Link href="/#contact" className="nav-link">Contact</Link>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex text-brand-navy hover:text-brand-wine transition-colors">
              <Search size={20} />
            </button>

            <Link href="/cart" className="relative text-brand-navy hover:text-brand-wine transition-colors">
              <ShoppingBag size={22} />
              {itemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-wine text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </Link>

            {/* Mobile menu btn */}
            <button
              className="md:hidden text-brand-navy"
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
          {['Women', 'Men', 'Featured', 'About', 'Contact'].map((item) => (
            <Link
              key={item}
              href={
                item === 'Women' ? '/shop?gender=women' :
                item === 'Men'   ? '/shop?gender=men' :
                item === 'Featured' ? '/featured' :
                item === 'About' ? '/#about' : '/#contact'
              }
              className="block nav-link py-1"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
