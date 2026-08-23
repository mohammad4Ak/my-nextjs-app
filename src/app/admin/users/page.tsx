'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, Trash2, Pencil, X, Plus, UserPlus, KeyRound } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  _count: { orders: number }
}

const emptyCreateForm = { name: '', email: '', password: '', phone: '', role: 'USER' as 'USER' | 'ADMIN' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', role: 'USER' as 'USER' | 'ADMIN' })
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  // فرم ایجاد کاربر جدید
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        setUsers(await res.json())
        setError('')
      } else if (res.status === 401) {
        setError('برای مدیریت کاربران باید با حساب مدیر وارد شوید')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setForm({
      name: user.name,
      phone: user.phone ?? '',
      role: user.role,
    })
    setNewPassword('')
    setModalError('')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setSaving(true)
    setModalError('')

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ...(newPassword !== '' && { newPassword }),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setModalError(data.error || 'خطا در ذخیره تغییرات')
        return
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: data.name, phone: data.phone, role: data.role }
            : u
        )
      )
      setModalOpen(false)
    } catch {
      setModalError('خطای ارتباط با سرور')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError('')

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })

      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error || 'خطا در ایجاد کاربر')
        return
      }

      setUsers((prev) => [data, ...prev])
      setCreateOpen(false)
      setCreateForm(emptyCreateForm)
    } catch {
      setCreateError('خطای ارتباط با سرور')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('این کاربر حذف شود؟ سفارشهای او هم حذف میشوند.')) return

    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    const data = res.ok ? null : await res.json()

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } else {
      alert(data.error || 'خطا در حذف کاربر')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">مدیریت کاربران</h1>
        <button
          onClick={() => { setCreateForm(emptyCreateForm); setCreateError(''); setCreateOpen(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          کاربر جدید
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          {error} —{' '}
          <a href="/login" className="underline font-bold">
            ورود مدیر
          </a>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-mist">در حال بارگذاری...</div>
        ) : (
          <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
            <thead className="bg-night text-white">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">نام</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">ایمیل</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">تلفن</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">سفارشها</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">نقش</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-fog/30">
                  <td className="px-6 py-4">
                    <span className="font-medium flex items-center gap-2">
                      {user.name}
                      {user.role === 'ADMIN' && (
                        <span title="مدیر">
                          <Shield className="w-4 h-4 text-purple-600" />
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-mist">{user.email}</td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-mist" dir="ltr">
                    {user.phone || '—'}
                  </td>
                  <td className="px-6 py-4">{user._count.orders}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'مدیر' : 'کاربر'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 hover:bg-fog rounded-lg transition-colors"
                        title="ویرایش کاربر"
                      >
                        <Pencil className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === 'ADMIN'}
                        className={`p-2 rounded-lg transition-colors ${
                          user.role === 'ADMIN'
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:bg-fog'
                        }`}
                        title={user.role === 'ADMIN' ? 'کاربران مدیر قابل حذف نیستند' : 'حذف کاربر'}
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

      {/* Edit Modal */}
      {modalOpen && editingUser && (
        <div className="fixed inset-0 bg-night/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="text-xl font-bold">ویرایش کاربر</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-fog rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">ایمیل</label>
                <input className="input-field bg-fog/60" dir="ltr" value={editingUser.email} disabled />
              </div>

              <div>
                <label className="block font-bold mb-2">نام</label>
                <input
                  required
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">تلفن</label>
                <input
                  className="input-field"
                  dir="ltr"
                  placeholder="09123456789"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">نقش</label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as 'USER' | 'ADMIN' })}
                >
                  <option value="USER">کاربر</option>
                  <option value="ADMIN">مدیر</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-brand" />
                  رمز عبور جدید
                </label>
                <input
                  type="password"
                  dir="ltr"
                  className="input-field"
                  placeholder="خالی = بدون تغییر"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-mist mt-1">
                  فقط اگر بخوای رمز جدید ست کنی پر کن (حداقل ۶ کاراکتر)
                </p>
              </div>

              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {modalError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                  {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-outline flex-1">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-night/50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand" />
                کاربر جدید
              </h2>
              <button
                onClick={() => setCreateOpen(false)}
                className="p-2 hover:bg-fog rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">نام و نام خانوادگی *</label>
                <input
                  required
                  className="input-field"
                  placeholder="محمد محمدی"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">ایمیل *</label>
                <input
                  required
                  type="email"
                  dir="ltr"
                  className="input-field"
                  placeholder="email@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">رمز عبور *</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  dir="ltr"
                  className="input-field"
                  placeholder="حداقل ۶ کاراکتر"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">تلفن</label>
                  <input
                    type="tel"
                    dir="ltr"
                    className="input-field"
                    placeholder="09123456789"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">نقش</label>
                  <select
                    className="input-field"
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value as 'USER' | 'ADMIN' })
                    }
                  >
                    <option value="USER">کاربر</option>
                    <option value="ADMIN">مدیر</option>
                  </select>
                </div>
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating} className="btn-primary flex-1 disabled:opacity-50">
                  {creating ? 'در حال ایجاد...' : 'ایجاد کاربر'}
                </button>
                <button type="button" onClick={() => setCreateOpen(false)} className="btn-outline flex-1">
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