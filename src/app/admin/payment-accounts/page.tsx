'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PaymentAccount } from '@/types'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

function headers() {
  return { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY }
}

const emptyForm = { bank_name: '', account_name: '', account_number: '' }

export default function AdminPaymentAccounts() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const data = await fetch('/api/payment-accounts', { headers: headers() }).then((r) => r.json())
    setAccounts(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.bank_name || !form.account_name || !form.account_number) {
      return toast.error('All fields are required')
    }
    setSaving(true)
    try {
      const res = await fetch('/api/payment-accounts', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Account added!')
      setShowForm(false)
      setForm(emptyForm)
      load()
    } catch {
      toast.error('Failed to add account')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (account: PaymentAccount) => {
    try {
      const res = await fetch('/api/payment-accounts', {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ id: account.id, is_active: !account.is_active }),
      })
      if (!res.ok) throw new Error()
      toast.success(account.is_active ? 'Account hidden from buyers' : 'Account shown to buyers')
      load()
    } catch {
      toast.error('Update failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this account? It will no longer show to buyers.')) return
    await fetch(`/api/payment-accounts?id=${id}`, { method: 'DELETE', headers: headers() })
    toast.success('Account deleted')
    load()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-brand-navy">Payment Accounts</h1>
          <p className="text-brand-navy/50 text-sm font-body mt-1">
            Bank accounts shown to buyers after they place an order
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus size={18} /> Add Account
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-brand-stone">
              <h2 className="font-display text-2xl text-brand-navy">New Account</h2>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-brand-navy/50" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                  Bank Name *
                </label>
                <input
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. GTBank, Access Bank..."
                />
              </div>
              <div>
                <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                  Account Name *
                </label>
                <input
                  value={form.account_name}
                  onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. The Asmaa's Brand"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                  Account Number *
                </label>
                <input
                  value={form.account_number}
                  onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 0123456789"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-brand-stone">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? 'Adding...' : 'Add Account'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Accounts list */}
      <div className="admin-card">
        {accounts.length === 0 ? (
          <p className="text-brand-navy/30 text-sm font-body py-4 text-center">
            No payment accounts yet. Add one above — buyers won&apos;t see any transfer details until you do.
          </p>
        ) : (
          <ul className="divide-y divide-brand-stone/50">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-body text-sm font-semibold text-brand-navy">{a.bank_name}</p>
                  <p className="font-body text-sm text-brand-navy/70">{a.account_name}</p>
                  <p className="font-mono text-xs text-brand-navy/50 mt-0.5">{a.account_number}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(a)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-full transition-colors ${
                      a.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {a.is_active ? 'Visible to buyers' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-brand-navy/20 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
