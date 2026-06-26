'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Upload, X, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product, Category } from '@/types'

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ''

function headers() {
  return { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY }
}

interface ProductFormData {
  name: string
  description: string
  price: string
  category: ('women' | 'men')[]
  subcategory: string
  is_featured: boolean
  is_available: boolean
  images: string[]
}

const emptyForm: ProductFormData = {
  name: '', description: '', price: '', category: ['women'],
  subcategory: '', is_featured: false, is_available: true, images: [],
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ProductFormData>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const [p, c] = await Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
    setProducts(Array.isArray(p) ? p : [])
    setCategories(Array.isArray(c) ? c : [])
  }

  useEffect(() => { load() }, [])

  const subcats = categories.filter((c) => c.gender.some((g) => form.category.includes(g)))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'x-admin-key': ADMIN_KEY },
          body: fd,
        })
        const data = await res.json()
        if (data.url) urls.push(data.url)
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
      toast.success(`${urls.length} image(s) uploaded`)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.price || form.category.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price) }
      const method = editId ? 'PUT' : 'POST'
      const body = editId ? { ...payload, id: editId } : payload
      const res = await fetch('/api/products', {
        method,
        headers: headers(),
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success(editId ? 'Product updated!' : 'Product added!')
      setShowForm(false)
      setForm(emptyForm)
      setEditId(null)
      load()
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/products?id=${id}`, { method: 'DELETE', headers: headers() })
    toast.success('Product deleted')
    load()
  }

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      category: p.category, subcategory: p.subcategory,
      is_featured: p.is_featured, is_available: p.is_available, images: p.images,
    })
    setEditId(p.id)
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-brand-navy">Products</h1>
          <p className="text-brand-navy/50 text-sm font-body mt-1">{products.length} products total</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl my-2 sm:my-8 relative">
            <div className="flex items-center justify-between p-6 border-b border-brand-stone">
              <h2 className="font-display text-2xl text-brand-navy">
                {editId ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-brand-navy/50" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                    Product Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Premium Black Abaya"
                  />
                </div>

                <div>
                  <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                    Category *
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    {(['women', 'men'] as const).map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.category.includes(g)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...form.category, g]
                              : form.category.filter((v) => v !== g)
                            setForm({ ...form, category: next, subcategory: '' })
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
                    Subcategory
                  </label>
                  <select
                    value={form.subcategory}
                    onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select subcategory</option>
                    {subcats.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input-field"
                    placeholder="5000"
                  />
                </div>

                <div className="flex items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="w-4 h-4 accent-brand-gold"
                    />
                    <span className="text-xs font-body font-semibold tracking-widest uppercase text-brand-navy">
                      Featured (Item of Week)
                    </span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Describe the product, available colors, material quality..."
                  />
                </div>

                {/* Image upload */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-body font-semibold tracking-widest uppercase text-brand-navy mb-1">
                    Product Images
                  </label>
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="border-2 border-dashed border-brand-stone w-full py-6 text-brand-navy/40 hover:border-brand-gold hover:text-brand-gold transition-colors flex flex-col items-center gap-2 font-body text-sm"
                  >
                    <Upload size={24} />
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </button>

                  {form.images.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <Image src={img} alt="" fill className="object-cover" />
                          <button
                            onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-brand-stone">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="admin-card overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-sm font-body min-w-[600px]">
          <thead>
            <tr className="border-b border-brand-stone">
              <th className="text-left py-3 px-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider">Product</th>
              <th className="text-left py-3 px-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
              <th className="text-left py-3 px-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider">Price</th>
              <th className="text-left py-3 px-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Featured</th>
              <th className="text-left py-3 px-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-2 text-brand-navy/50 font-medium text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-brand-stone/50 hover:bg-brand-cream/50 transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-12 bg-brand-stone flex-shrink-0 overflow-hidden">
                      {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-brand-navy truncate">{p.name}</p>
                      <p className="text-brand-navy/40 text-xs truncate">{p.subcategory}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 capitalize hidden sm:table-cell">{p.category.join(', ')}</td>
                <td className="py-3 px-2 font-semibold text-brand-wine whitespace-nowrap">₦{p.price.toLocaleString()}</td>
                <td className="py-3 px-2 hidden md:table-cell">
                  {p.is_featured ? <Star size={16} className="text-brand-gold fill-brand-gold" /> : '—'}
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full ${
                    p.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {p.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="text-brand-navy/50 hover:text-brand-blue transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-brand-navy/50 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-brand-navy/30">
                  No products yet. Add your first product!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
