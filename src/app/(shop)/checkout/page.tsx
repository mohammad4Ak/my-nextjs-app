'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { toast } from '@/lib/toast'
import { formatPrice } from '@/lib/utils'
import { Star, Plus } from 'lucide-react'

interface SavedAddress {
  id: string
  title: string | null
  address: string
  phone: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart, removeItem } = useCart()
  const total = getTotal()
  const router = useRouter()

  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    name: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // آدرسهای ذخیرهشده پروفایل
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddrId, setSelectedAddrId] = useState<string>('')
  const [newAddressMode, setNewAddressMode] = useState(false)
  const [saveToProfile, setSaveToProfile] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // دریافت آدرسهای پروفایل (اگر لاگین باشد)
  useEffect(() => {
    fetch('/api/addresses')
      .then(async (r) => {
        setIsLoggedIn(r.ok)
        if (!r.ok) return []
        return r.json()
      })
      .then((list: SavedAddress[]) => {
        setSavedAddresses(list)
        if (list.length > 0) {
          setSelectedAddrId(list[0].id)
          setFormData((f) => ({
            ...f,
            address: list[0].address,
            phone: list[0].phone,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const selectAddress = (addr: SavedAddress) => {
    setSelectedAddrId(addr.id)
    setNewAddressMode(false)
    setFormData((f) => ({ ...f, address: addr.address, phone: addr.phone }))
  }

  const startNewAddress = () => {
    setSelectedAddrId('')
    setNewAddressMode(true)
    setFormData((f) => ({ ...f, address: '', phone: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: formData.address,
          phone: formData.phone,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
        }),
      })

      const data = await res.json()

      if (res.status === 401) {
        setError('برای ثبت سفارش ابتدا باید وارد حساب خود شوید')
        setLoading(false)
        return
      }

      if (!res.ok) {
        // اقلام ناموجود را از سبد حذف کن تا کاربر در لوپ خطا گیر نکند
        const outOfStock: string[] = data.outOfStock ?? []
        let removed = false

        for (const pid of outOfStock) {
          for (const line of items.filter((i) => i.productId === pid)) {
            removeItem(pid, line.size, line.color)
            removed = true
          }
        }

        if (removed) {
          // اعلان شفاف: کدام محصول ناموجود شد (بعد از ناوبری هم میماند)
          toast('اقلام ناموجود از سبد خرید حذف شدند', data.error)
        }

        setError(
          removed
            ? `${data.error} — برای ادامه، سبد خرید خود را بازبینی کنید`
            : data.error || 'خطا در ثبت سفارش'
        )
        setLoading(false)
        return
      }

      // ذخیره آدرس جدید در پروفایل در صورت انتخاب کاربر
      if (newAddressMode && saveToProfile && isLoggedIn && formData.address.trim()) {
        try {
          await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'آدرس من',
              address: formData.address,
              phone: formData.phone,
            }),
          })
        } catch {
          // عدم موفقیت در ذخیره آدرس نباید سفارش را خراب کند
        }
      }

      // سفارش ثبت شد - اینجا به زرینپال هدایت میشود
      clearCart()
      router.push('/')
    } catch {
      setError('خطای ارتباط با سرور')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-16 px-4 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">سبد خرید شما خالی است</p>
          <p className="text-mist mb-6">برای تکمیل خرید ابتدا محصولی اضافه کنید</p>
          <Link href="/products" className="btn-primary">مشاهده محصولات</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <nav className="flex items-center gap-2 text-sm text-mist mb-6">
          <Link href="/" className="hover:text-brand">خانه</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-brand">سبد خرید</Link>
          <span>/</span>
          <span className="text-night">تکمیل خرید</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">تکمیل خرید</h1>

        {/* Order Summary */}
        <div className="card p-6 mb-8">
          <h3 className="font-bold text-lg mb-4">خلاصه سفارش</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                <span>{item.name} ×{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)} تومان</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>مجموع:</span>
            <span className="text-brand">{formatPrice(total)} تومان</span>
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}{' '}
              {error.includes('وارد') && (
                <Link href="/login" className="underline font-bold">
                  ورود به حساب
                </Link>
              )}
            </div>
          )}

          <div>
            <label className="block font-bold mb-2">نام و نام خانوادگی</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="مثال: محمد محمدی"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Address selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-bold">آدرس تحویل سفارش *</label>
              {newAddressMode && savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => selectAddress(savedAddresses[0])}
                  className="text-xs font-bold text-brand hover:underline"
                >
                  انتخاب از آدرسهای ذخیرهشده
                </button>
              )}
            </div>

            {savedAddresses.length > 0 && !newAddressMode ? (
              <>
                <div className="space-y-2.5">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => selectAddress(addr)}
                      className={`w-full text-right p-4 rounded-xl border-2 transition-all ${
                        selectedAddrId === addr.id
                          ? 'border-brand bg-brand/5'
                          : 'border-line hover:border-brand/40'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm flex items-center gap-1.5">
                          {addr.title || 'آدرس'}
                          {addr.isDefault && (
                            <span className="bg-brand/10 text-brand text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              پیشفرض
                            </span>
                          )}
                        </span>
                        <span dir="ltr" className="text-xs text-mist">
                          {addr.phone}
                        </span>
                      </span>
                      <span className="block text-sm text-night mt-1 leading-relaxed">
                        {addr.address}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={startNewAddress}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  افزودن آدرس جدید
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">آدرس کامل *</label>
                  <textarea
                    required
                    className="input-field"
                    placeholder="شهر، خیابان، پلاک، کدپستی"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">شماره تماس *</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    className="input-field"
                    placeholder="0912 345 6789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {isLoggedIn && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className="w-5 h-5 accent-[#4F46E5]"
                    />
                    <span className="font-medium text-sm">این آدرس در پروفایلم ذخیره شود</span>
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="bg-brand/5 border border-brand/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="font-bold text-night">پرداخت امن با زرینپال</p>
                <p className="text-sm text-mist">با اطمینان از پرداخت امن درگاه اینترنتی زرینپال</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50"
          >
            {loading ? 'در حال پردازش...' : 'ثبت سفارش و پرداخت'}
          </button>
        </form>
      </div>
    </div>
  )
}
