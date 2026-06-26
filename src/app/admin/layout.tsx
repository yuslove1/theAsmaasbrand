'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-brand-navy flex items-center justify-between px-4 h-14">
        <p className="font-display text-lg text-brand-gold">The Asmaa&apos;s Brand</p>
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white/70 hover:text-white p-1"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-[4.5rem] lg:pt-8">{children}</main>
    </div>
  )
}
