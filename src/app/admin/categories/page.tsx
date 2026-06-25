'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Category } from '@/types'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

function headers() {
  return { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY }
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', gender: ['women'] as ('women' | 'men')[], description: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const data = await fetch('/api/categories').then((r) => r.json())
    setCategories(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.name) return toast.error('Category name is required')
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Category added!')
      setShowForm(false)
      setForm({ name: '', gender: ['women'], description: '' })
      load()
    } catch {
      toast.error('Failed to add category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in it will lose their subcategory.')) return
    await fetch(`/api/categories?id=${id}`, { method: 'DELETE', headers: headers() })
    toast.success('Category deleted')
    load()
  }

  const womenCats = categories.filter((c) => c.gender.includes('women'))
  const menCats = categories.filter((c) => c.gender.includes('men'))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-brand-navy">Categories</h1>
          <p className="text-brand-navy/50 text-sm font-body mt-1">
            Organise your products into categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-brand-stone">
              <h2 className="font-display text-2xl text-brand-navy">New Category</h2>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-brand-navy/50" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                  Category Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Abayas, Jalabias, Hijabs..."
                />
              </div>
              <div>
                <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                  Gender *
                </label>
                <div className="flex items-center gap-4 mt-2">
                  {(['women', 'men'] as const).map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.gender.includes(g)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...form.gender, g]
                            : form.gender.filter((v) => v !== g)
                          setForm({ ...form, gender: next })
                        }}
                        className="w-4 h-4 accent-brand-gold"
                      />
                      <span className="text-sm font-body font-medium text-brand-navy capitalize">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                  Description (optional)
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field"
                  placeholder="Brief description..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-brand-stone">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? 'Adding...' : 'Add Category'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Categories display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Women */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-brand-stone">
            <div className="w-3 h-3 rounded-full bg-brand-wine" />
            <h2 className="font-display text-xl text-brand-navy">Women&apos;s Categories</h2>
            <span className="text-brand-navy/30 text-xs font-body ml-auto">{womenCats.length}</span>
          </div>
          {womenCats.length === 0 ? (
            <p className="text-brand-navy/30 text-sm font-body py-4">
              No categories yet. Add one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {womenCats.map((c) => (
                <li key={c.id} className="flex items-center justify-between group py-2 border-b border-brand-stone/50 last:border-0">
                  <div>
                    <p className="font-body text-sm font-medium text-brand-navy">{c.name}</p>
                    <p className="text-brand-navy/30 text-xs font-body">/{c.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-brand-navy/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Men */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-brand-stone">
            <div className="w-3 h-3 rounded-full bg-brand-blue" />
            <h2 className="font-display text-xl text-brand-navy">Men&apos;s Categories</h2>
            <span className="text-brand-navy/30 text-xs font-body ml-auto">{menCats.length}</span>
          </div>
          {menCats.length === 0 ? (
            <p className="text-brand-navy/30 text-sm font-body py-4">
              No categories yet. Add one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {menCats.map((c) => (
                <li key={c.id} className="flex items-center justify-between group py-2 border-b border-brand-stone/50 last:border-0">
                  <div>
                    <p className="font-body text-sm font-medium text-brand-navy">{c.name}</p>
                    <p className="text-brand-navy/30 text-xs font-body">/{c.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-brand-navy/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
