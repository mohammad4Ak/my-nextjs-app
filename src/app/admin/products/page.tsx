'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, X } from 'lucide-react'
import MultiImageInput from '@/components/admin/MultiImageInput'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  type: 'SNEAKER' | 'FORMAL'
  sizes: number[]
  colors: string[]
  stock: number
  featured: boolean
  categoryId: string
  category: { name: string }
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  images: [] as string[],
  categoryId: '',
  sizes: '40, 41, 42, 43',
  colors: 'مشکی, سفید',
  stock: '',
  featured: false,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) setProducts(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
    fetch('/api/categories')
      .then(async (r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(data))
      .catch(() => {})
  }, [loadProducts])

  const openCreateModal = () => {
    setEditingId(null)
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? '' })
    setMessage(null)
    setModalOpen(true)
  }


  const openEditModal = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      images: product.images,
      categoryId: product.categoryId,
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      stock: String(product.stock),
      featured: product.featured,
    })
    setMessage(null)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      images: form.images,
      categoryId: form.categoryId,
      sizes: form.sizes.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)),
      colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
      stock: Number(form.stock) || 0,
      featured: form.featured,
    }

    try {
      const res = await fetch(editingId ? `/api/products/${editingId}` : '/api/products', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: data.error || 'خطا در ذخیره محصول', error: true })
        return
      }

      setMessage({ text: editingId ? 'محصول ویرایش شد ✓' : 'محصول اضافه شد ✓', error: false })
      setModalOpen(false)
      await loadProducts()
    } catch {
      setMessage({ text: 'خطای ارتباط با سرور', error: true })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('این محصول حذف شود؟')) return

    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } else {
      alert('خطا در حذف محصول')
    }
  }

  const filtered = products.filter((p) => p.name.includes(searchQuery))

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">مدیریت محصولات</h1>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          محصول جدید
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <input
          type="text"
          placeholder="جستجو در محصولات..."
          className="input-field"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-mist">در حال بارگذاری...</div>
        ) : (
          <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
            <thead className="bg-night text-white">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">نام محصول</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">دسته بندی</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">قیمت</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">موجودی</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">ویژه</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-fog/30">
                  <td className="px-4 py-3 md:px-6 md:py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-brand/10 text-brand rounded-full text-sm">
                      {product.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">{formatPrice(product.price)} تومان</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    {product.featured && <span className="text-green-600 font-bold">✓</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="p-2 hover:bg-fog rounded-lg transition-colors"
                        title="مشاهده در فروشگاه"
                      >
                        <Eye className="w-5 h-5 text-night" />
                      </Link>
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 hover:bg-fog rounded-lg transition-colors"
                        title="ویرایش"
                      >
                        <Pencil className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-fog rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-mist">
                    محصولی پیدا نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-night/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="text-xl font-bold">
                {editingId ? 'ویرایش محصول' : 'محصول جدید'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-fog rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block font-bold mb-2">نام محصول *</label>
                <input
                  required
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">توضیحات</label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">قیمت (تومان) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    className="input-field"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">موجودی</label>
                  <input
                    type="number"
                    min={0}
                    className="input-field"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">دسته بندی *</label>
                  <select
                    required
                    className="input-field"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    <option value="" disabled>
                      انتخاب دسته بندی
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-mist mt-1">
                    بهعنوان برچسب روی کارت محصول نمایش داده میشود
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">سایزها (با کاما جدا کنید)</label>
                  <input
                    className="input-field"
                    dir="ltr"
                    value={form.sizes}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">رنگها (با کاما جدا کنید)</label>
                  <input
                    className="input-field"
                    value={form.colors}
                    onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  />
                </div>
              </div>

              <MultiImageInput
                images={form.images}
                onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))}
              />


              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-5 h-5 accent-[#4F46E5]"
                />
                <span className="font-medium">نمایش در محصولات ویژه صفحه اصلی</span>
              </label>

              {message && (
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.error
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-green-50 border border-green-200 text-green-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {saving ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'افزودن محصول'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-outline flex-1"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}