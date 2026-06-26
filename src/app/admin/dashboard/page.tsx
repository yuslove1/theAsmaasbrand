import { supabaseAdmin } from '@/lib/supabase'
import { Package, ShoppingCart, Star, FolderOpen } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const db = supabaseAdmin()
  const [products, orders, featured, categories] = await Promise.all([
    db.from('products').select('id', { count: 'exact' }),
    db.from('orders').select('id,total,order_status', { count: 'exact' }),
    db.from('products').select('id', { count: 'exact' }).eq('is_featured', true),
    db.from('categories').select('id', { count: 'exact' }),
  ])

  const pendingOrders = orders.data?.filter((o) => o.order_status === 'pending').length || 0
  const revenue = orders.data
    ?.filter((o) => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0) || 0

  return {
    products: products.count || 0,
    orders: orders.count || 0,
    featured: featured.count || 0,
    categories: categories.count || 0,
    pendingOrders,
    revenue,
  }
}

async function getRecentOrders() {
  const db = supabaseAdmin()
  const { data } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()])

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: Package, href: '/admin/products', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, href: '/admin/orders', color: 'bg-green-50 text-green-600', badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : undefined },
    { label: 'Featured Items', value: stats.featured, icon: Star, href: '/admin/featured', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Categories', value: stats.categories, icon: FolderOpen, href: '/admin/categories', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-brand-navy">Dashboard</h1>
        <p className="text-brand-navy/50 font-body text-sm mt-1">
          Welcome back. Here&apos;s what&apos;s happening with The Asmaa&apos;s Brand.
        </p>
      </div>

      {/* Revenue */}
      <div className="bg-brand-navy text-white p-4 sm:p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-xs tracking-widest uppercase font-body">Total Revenue</p>
          <p className="font-display text-2xl sm:text-4xl text-brand-gold mt-1">₦{stats.revenue.toLocaleString()}</p>
        </div>
        <p className="arabic-accent text-3xl sm:text-5xl opacity-20 hidden sm:block" style={{ fontFamily: 'var(--font-amiri)' }}>
          بركة
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, href, color, badge }) => (
          <Link key={label} href={href} className="admin-card hover:border-brand-gold transition-colors group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="font-display text-3xl text-brand-navy">{value}</p>
            <p className="text-brand-navy/50 text-xs font-body mt-1">{label}</p>
            {badge && (
              <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-body mt-2 inline-block">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-brand-navy">Recent Orders</h2>
          <Link href="/admin/orders" className="text-brand-wine text-xs font-body hover:underline">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-brand-stone">
                <th className="text-left py-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider">Order</th>
                <th className="text-left py-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left py-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider">Amount</th>
                <th className="text-left py-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-brand-stone/50 hover:bg-brand-cream/50 transition-colors">
                  <td className="py-3 font-mono text-xs text-brand-wine">{order.order_number}</td>
                  <td className="py-3">{order.customer_name}</td>
                  <td className="py-3 font-semibold">₦{order.total?.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full ${
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="py-3 text-brand-navy/50 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-NG')}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-navy/30">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
