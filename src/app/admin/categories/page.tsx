'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Tags } from 'lucide-react'
import MultiImageInput from '@/components/admin/MultiImageInput'

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  _count: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', image: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      if (res.ok) setCategories(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const openCreateModal = () => {
    setEditingId(null)
    setForm({ name: '', slug: '', image: '' })
    setError('')
    setModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingId(category.id)
    setForm({ name: category.name, slug: category.slug, image: category.image ?? '' })
    setError('')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(editingId ? `/api/categories/${editingId}` : '/api/categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'خطا در ذخیره دسته بندی')
        return
      }

      setModalOpen(false)
      await loadCategories()
    } catch {
      setError('خطای ارتباط با سرور')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('این دسته بندی حذف شود؟')) return

    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    const data = res.ok ? null : await res.json()

    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } else {
      alert(data.error || 'خطا در حذف دسته بندی')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">مدیریت دسته بندی ها</h1>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          دسته بندی جدید
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-mist">در حال بارگذاری...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tags className="w-12 h-12 text-line mx-auto mb-4" />
            <p className="text-xl font-bold mb-2">هنوز دسته بندی ای ثبت نشده</p>
            <p className="text-mist mb-6">اولین دسته بندی را اضافه کنید</p>
            <button onClick={openCreateModal} className="btn-primary">
              افزودن دسته بندی
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
            <thead className="bg-night text-white">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">تصویر</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">نام</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">شناسه (slug)</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">تعداد محصولات</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-fog/30">
                  <td className="px-6 py-4">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 rounded-lg object-cover border border-line"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-line/50 flex items-center justify-center">
                        <Tags className="w-5 h-5 text-mist" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 font-bold">{category.name}</td>
                  <td className="px-4 py-3 md:px-6 md:py-4 font-mono text-mist" dir="ltr">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-brand/10 text-brand rounded-full text-sm">
                      {category._count.products} محصول
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 hover:bg-fog rounded-lg transition-colors"
                        title="ویرایش"
                      >
                        <Pencil className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={category._count.products > 0}
                        className={`p-2 rounded-lg transition-colors ${
                          category._count.products > 0
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:bg-fog'
                        }`}
                        title={
                          category._count.products > 0
                            ? 'ابتدا محصولات این دسته را حذف کنید'
                            : 'حذف'
                        }
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-night/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="text-xl font-bold">
                {editingId ? 'ویرایش دسته بندی' : 'دسته بندی جدید'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-fog rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">نام دسته بندی *</label>
                <input
                  required
                  className="input-field"
                  placeholder="مثال: بوت و نیمبوت"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">شناسه (اختیاری)</label>
                <input
                  className="input-field"
                  dir="ltr"
                  placeholder="boots"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
                <p className="text-xs text-mist mt-1">
                  اگر خالی بگذارید خودکار ساخته میشود
                </p>
              </div>

              <MultiImageInput
                multiple={false}
                label="تصویر دسته بندی (نمایش در صفحه اصلی)"
                images={form.image ? [form.image] : []}
                onChange={(imgs) => setForm((f) => ({ ...f, image: imgs[0] ?? '' }))}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                  {saving ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'افزودن'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1">
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