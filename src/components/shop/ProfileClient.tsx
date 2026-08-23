'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  User,
  MapPin,
  Package,
  Pencil,
  Trash2,
  Plus,
  Star,
  ChevronDown,
  Check,
  X,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface SessionUser {
  name: string
  email: string
  role: string
}

interface Address {
  id: string
  title: string | null
  address: string
  phone: string
  isDefault: boolean
}

interface OrderItem {
  id: string
  quantity: number
  size: number
  color: string
  price: number
  product: { name: string }
}

interface Order {
  id: string
  total: number
  status: string
  address: string
  phone: string
  createdAt: string
  items: OrderItem[]
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-700' },
  PROCESSING: { label: 'در حال پردازش', color: 'bg-blue-100 text-blue-700' },
  SHIPPED: { label: 'ارسال شده', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'تحویل شده', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'لغو شده', color: 'bg-red-100 text-red-700' },
}

const emptyAddrForm = { title: '', address: '', phone: '' }

export default function ProfileClient({ user }: { user: SessionUser }) {
  const [tab, setTab] = useState<'orders' | 'addresses' | 'account'>('orders')

  // حساب من
  const [accForm, setAccForm] = useState({ name: user.name, phone: '' })
  const [accSaving, setAccSaving] = useState(false)
  const [accMsg, setAccMsg] = useState('')

  // آدرسها
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addrLoading, setAddrLoading] = useState(true)
  const [addrModal, setAddrModal] = useState(false)
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null)
  const [addrForm, setAddrForm] = useState(emptyAddrForm)
  const [addrIsDefault, setAddrIsDefault] = useState(false)
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrError, setAddrError] = useState('')

  // سفارشها
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadAddresses = useCallback(async () => {
    setAddrLoading(true)
    try {
      const res = await fetch('/api/addresses')
      if (res.ok) setAddresses(await res.json())
    } finally {
      setAddrLoading(false)
    }
  }, [])

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (res.ok) setOrders(await res.json())
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAddresses()
    loadOrders()
    // پر کردن تلفن از اولین آدرس یا رکورد کاربر
    fetch('/api/profile')
      .then(async (r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (u?.phone) setAccForm((f) => ({ ...f, phone: u.phone }))
      })
      .catch(() => {})
  }, [loadAddresses, loadOrders])

  /* ---------- Account ---------- */
  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccSaving(true)
    setAccMsg('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accForm),
      })
      if (res.ok) {
        setAccMsg('اطلاعات حساب ذخیره شد ✓')
        setTimeout(() => setAccMsg(''), 3000)
      } else {
        const d = await res.json()
        setAccMsg(d.error || 'خطا در ذخیره')
      }
    } catch {
      setAccMsg('خطای ارتباط با سرور')
    } finally {
      setAccSaving(false)
    }
  }

  /* ---------- Addresses ---------- */
  const openAddrModal = (addr?: Address) => {
    if (addr) {
      setEditingAddrId(addr.id)
      setAddrForm({ title: addr.title ?? '', address: addr.address, phone: addr.phone })
      setAddrIsDefault(addr.isDefault)
    } else {
      setEditingAddrId(null)
      setAddrForm(emptyAddrForm)
      setAddrIsDefault(addresses.length === 0)
    }
    setAddrError('')
    setAddrModal(true)
  }

  const handleAddrSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddrSaving(true)
    setAddrError('')
    try {
      const payload = { ...addrForm, isDefault: addrIsDefault }
      const res = await fetch(editingAddrId ? `/api/addresses/${editingAddrId}` : '/api/addresses', {
        method: editingAddrId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddrError(data.error || 'خطا در ذخیره آدرس')
        return
      }
      setAddrModal(false)
      await loadAddresses()
    } catch {
      setAddrError('خطای ارتباط با سرور')
    } finally {
      setAddrSaving(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    loadAddresses()
  }

  const handleAddrDelete = async (id: string) => {
    if (!confirm('این آدرس حذف شود؟')) return
    const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    if (res.ok) setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  const tabs = [
    { key: 'orders' as const, label: 'سفارشهای من', Icon: Package, count: orders.length },
    { key: 'addresses' as const, label: 'آدرسهای من', Icon: MapPin, count: addresses.length },
    { key: 'account' as const, label: 'حساب کاربری', Icon: User },
  ]

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand font-black text-2xl flex items-center justify-center">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black">{user.name}</h1>
            <p className="text-mist text-sm" dir="ltr">{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none">
          {tabs.map(({ key, label, Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                tab === key
                  ? 'bg-night text-white'
                  : 'bg-paper border border-line text-mist hover:text-night'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && (
                <span className={`text-xs px-1.5 rounded-full ${tab === key ? 'bg-white/20' : 'bg-line'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ---------- Orders ---------- */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="card p-10 text-center text-mist">در حال بارگذاری...</div>
            ) : orders.length === 0 ? (
              <div className="card p-10 text-center">
                <Package className="w-12 h-12 text-line mx-auto mb-4" />
                <p className="text-xl font-bold mb-2">هنوز سفارشی ندارید</p>
                <p className="text-mist mb-6">اولین خرید خود را انجام دهید</p>
                <a href="/products" className="btn-primary">مشاهده محصولات</a>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="card overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="w-full p-5 flex items-center justify-between gap-3 text-right hover:bg-fog/40 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-sm">
                        سفارش <span className="font-mono">#{order.id.slice(-6)}</span>
                      </p>
                      <p className="text-xs text-mist mt-1">
                        {new Date(order.createdAt).toLocaleDateString('fa-IR')} ·{' '}
                        {order.items.length} قلم · {formatPrice(order.total)} تومان
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusLabels[order.status]?.color ?? ''}`}>
                        {statusLabels[order.status]?.label ?? order.status}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-mist transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {expandedId === order.id && (
                    <div className="px-5 pb-5 pt-1 border-t border-line/60 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-night">
                            {item.product.name} — سایز {item.size} × {item.quantity}
                          </span>
                          <span className="text-mist">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <p className="text-xs text-mist pt-2 border-t border-line/60">
                        ارسال به: {order.address}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ---------- Addresses ---------- */}
        {tab === 'addresses' && (
          <div>
            <button onClick={() => openAddrModal()} className="btn-primary flex items-center gap-2 mb-5">
              <Plus className="w-4 h-4" />
              افزودن آدرس جدید
            </button>

            {addrLoading ? (
              <div className="card p-10 text-center text-mist">در حال بارگذاری...</div>
            ) : addresses.length === 0 ? (
              <div className="card p-10 text-center">
                <MapPin className="w-12 h-12 text-line mx-auto mb-4" />
                <p className="text-xl font-bold mb-2">آدرسی ثبت نشده</p>
                <p className="text-mist mb-6">برای سرعت گرفتن تسویه، آدرس خود را اضافه کنید</p>
                <button onClick={() => openAddrModal()} className="btn-primary">افزودن آدرس</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`card p-5 ${addr.isDefault ? 'ring-2 ring-brand/40' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-bold flex items-center gap-2">
                        {addr.title || 'آدرس'}
                        {addr.isDefault && (
                          <span className="bg-brand/10 text-brand text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            پیشفرض
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-sm text-night leading-relaxed">{addr.address}</p>
                    <p className="text-xs text-mist mt-2" dir="ltr">{addr.phone}</p>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line/60">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-xs font-bold text-mist hover:text-brand flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          پیشفرض کن
                        </button>
                      )}
                      <span className="flex-1" />
                      <button
                        onClick={() => openAddrModal(addr)}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleAddrDelete(addr.id)}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------- Account ---------- */}
        {tab === 'account' && (
          <form onSubmit={handleAccountSave} className="card p-6 space-y-5 max-w-xl">
            <h3 className="font-bold text-lg">اطلاعات حساب</h3>

            <div>
              <label className="block font-bold mb-2">ایمیل</label>
              <input disabled dir="ltr" className="input-field bg-fog/60" value={user.email} />
              <p className="text-xs text-mist mt-1">ایمیل قابل تغییر نیست</p>
            </div>

            <div>
              <label className="block font-bold mb-2">نام</label>
              <input
                required
                className="input-field"
                value={accForm.name}
                onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-bold mb-2">شماره تماس</label>
              <input
                type="tel"
                dir="ltr"
                className="input-field"
                placeholder="09123456789"
                value={accForm.phone}
                onChange={(e) => setAccForm({ ...accForm, phone: e.target.value })}
              />
            </div>

            {accMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {accMsg}
              </div>
            )}

            <button type="submit" disabled={accSaving} className="btn-primary disabled:opacity-50">
              {accSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </form>
        )}
      </div>

      {/* Address Modal */}
      {addrModal && (
        <div className="fixed inset-0 bg-night/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-paper rounded-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="text-xl font-bold">
                {editingAddrId ? 'ویرایش آدرس' : 'افزودن آدرس'}
              </h2>
              <button
                onClick={() => setAddrModal(false)}
                className="p-2 hover:bg-fog rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddrSave} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">عنوان (اختیاری)</label>
                <input
                  className="input-field"
                  placeholder="خانه، محل کار..."
                  value={addrForm.title}
                  onChange={(e) => setAddrForm({ ...addrForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">آدرس کامل *</label>
                <textarea
                  required
                  rows={3}
                  className="input-field"
                  placeholder="شهر، خیابان، پلاک، کدپستی"
                  value={addrForm.address}
                  onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">شماره تماس *</label>
                <input
                  required
                  type="tel"
                  dir="ltr"
                  className="input-field"
                  placeholder="09123456789"
                  value={addrForm.phone}
                  onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="w-5 h-5 accent-[#4F46E5]"
                />
                <span className="font-medium">آدرس پیشفرض من باشد</span>
              </label>

              {addrError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {addrError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={addrSaving} className="btn-primary flex-1 disabled:opacity-50">
                  {addrSaving ? 'در حال ذخیره...' : 'ذخیره آدرس'}
                </button>
                <button type="button" onClick={() => setAddrModal(false)} className="btn-outline flex-1">
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