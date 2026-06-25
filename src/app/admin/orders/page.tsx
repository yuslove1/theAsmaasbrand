'use client'
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Phone, Mail, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Order } from '@/types'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

const PAYMENT_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  failed:    'bg-red-100 text-red-700',
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'confirmed', 'failed']

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const data = await fetch('/api/orders').then((r) => r.json())
    setOrders(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, field: 'order_status' | 'payment_status', value: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({ id, [field]: value }),
      })
      if (!res.ok) throw new Error()
      toast.success('Status updated!')
      load()
    } catch {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.order_status === filter)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-brand-navy">Orders</h1>
        <p className="text-brand-navy/50 text-sm font-body mt-1">
          {orders.length} total orders · {orders.filter((o) => o.order_status === 'pending').length} pending
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 text-xs tracking-widest uppercase font-body transition-colors capitalize ${
              filter === s
                ? 'bg-brand-navy text-white'
                : 'border border-brand-stone text-brand-navy hover:border-brand-navy'
            }`}
          >
            {s} {s !== 'all' && `(${orders.filter((o) => o.order_status === s).length})`}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.map((order) => (
          <div key={order.id} className="admin-card p-0 overflow-hidden">
            {/* Order header */}
            <button
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-brand-cream/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs text-brand-wine font-bold">{order.order_number}</span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full ${STATUS_COLORS[order.order_status]}`}>
                    {order.order_status}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full ${PAYMENT_COLORS[order.payment_status]}`}>
                    Payment: {order.payment_status}
                  </span>
                </div>
                <p className="font-body text-sm font-medium text-brand-navy mt-1">{order.customer_name}</p>
                <p className="text-brand-navy/40 text-xs font-body">{order.customer_email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-body font-bold text-brand-wine">₦{order.total?.toLocaleString()}</p>
                <p className="text-brand-navy/40 text-xs font-body mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('en-NG', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
              {expanded === order.id ? (
                <ChevronUp size={18} className="text-brand-navy/40 flex-shrink-0" />
              ) : (
                <ChevronDown size={18} className="text-brand-navy/40 flex-shrink-0" />
              )}
            </button>

            {/* Expanded detail */}
            {expanded === order.id && (
              <div className="border-t border-brand-stone p-5 bg-brand-cream/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Customer */}
                  <div>
                    <p className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-3">
                      Customer
                    </p>
                    <div className="space-y-1.5 text-sm font-body text-brand-navy/70">
                      <p className="font-medium text-brand-navy">{order.customer_name}</p>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-brand-navy/40" />
                        <a href={`mailto:${order.customer_email}`} className="hover:text-brand-wine">
                          {order.customer_email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-brand-navy/40" />
                        <a href={`tel:${order.customer_phone}`} className="hover:text-brand-wine">
                          {order.customer_phone}
                        </a>
                      </div>
                      {order.customer_whatsapp && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-brand-navy/40">WA</span>
                          <a
                            href={`https://wa.me/234${order.customer_whatsapp.slice(1)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-brand-wine"
                          >
                            {order.customer_whatsapp}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery */}
                  <div>
                    <p className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-3">
                      Delivery Address
                    </p>
                    <div className="flex gap-1.5 text-sm font-body text-brand-navy/70">
                      <MapPin size={14} className="text-brand-navy/40 mt-0.5 flex-shrink-0" />
                      <p>
                        {order.delivery_address}<br />
                        {order.delivery_city}, {order.delivery_state}
                      </p>
                    </div>
                    {order.notes && (
                      <p className="text-brand-navy/50 text-xs font-body mt-2 italic">&ldquo;{order.notes}&rdquo;</p>
                    )}
                  </div>

                  {/* Status controls */}
                  <div>
                    <p className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-3">
                      Update Status
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-brand-navy/50 font-body mb-1 block">Order Status</label>
                        <select
                          value={order.order_status}
                          onChange={(e) => updateStatus(order.id, 'order_status', e.target.value)}
                          disabled={loading}
                          className="input-field text-xs py-2"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-brand-navy/50 font-body mb-1 block">Payment Status</label>
                        <select
                          value={order.payment_status}
                          onChange={(e) => updateStatus(order.id, 'payment_status', e.target.value)}
                          disabled={loading}
                          className="input-field text-xs py-2"
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-3">
                    Items Ordered
                  </p>
                  <div className="border border-brand-stone overflow-hidden">
                    <table className="w-full text-sm font-body">
                      <thead className="bg-brand-navy text-white">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs">Item</th>
                          <th className="text-center px-4 py-2 text-xs">Qty</th>
                          <th className="text-center px-4 py-2 text-xs">Price</th>
                          <th className="text-right px-4 py-2 text-xs">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((item: any, i: number) => (
                          <tr key={i} className="border-b border-brand-stone/50">
                            <td className="px-4 py-3">
                              <p className="font-medium">{item.product_name}</p>
                              {item.note && (
                                <p className="text-brand-navy/40 text-xs italic mt-0.5">{item.note}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-center">₦{item.price?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-semibold text-brand-wine">
                              ₦{(item.price * item.quantity)?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-brand-cream">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total:</td>
                          <td className="px-4 py-3 text-right font-bold text-brand-wine">
                            ₦{order.total?.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="admin-card text-center py-16">
            <p className="text-brand-navy/30 font-display text-2xl">No orders found</p>
            <p className="text-brand-navy/20 text-sm font-body mt-2">
              {filter !== 'all' ? `No ${filter} orders` : 'Orders will appear here once customers start shopping.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
