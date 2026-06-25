'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Star,
  ShoppingCart,
  FolderOpen,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: FolderOpen, label: 'Categories' },
  { href: '/admin/featured', icon: Star, label: 'Featured Items' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-brand-navy min-h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <p className="font-display text-xl text-brand-gold">The Asmaa&apos;s Brand</p>
        <p className="text-white/30 text-xs font-body tracking-widest uppercase mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-body transition-all duration-200 ${
                active
                  ? 'bg-brand-gold text-brand-navy font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white text-sm font-body transition-colors"
        >
          <LogOut size={18} />
          Back to Site
        </Link>
      </div>
    </aside>
  )
}
