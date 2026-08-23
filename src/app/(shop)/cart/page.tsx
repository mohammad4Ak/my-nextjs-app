'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCart()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <div className="py-16 px-4 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-24 h-24 bg-line/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-mist" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">سبد خرید شما خالی است</h2>
          <p className="text-mist mb-6">هنوز محصولی به سبد خرید اضافه نکردهاید</p>
          <Link href="/products" className="btn-primary inline-block">
            مشاهده محصولات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <nav className="flex items-center gap-2 text-sm text-mist mb-6">
          <Link href="/" className="hover:text-brand">خانه</Link>
          <span>/</span>
          <span className="text-night">سبد خرید</span>
        </nav>

        <h1 className="text-3xl font-bold mb-8">سبد خرید</h1>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="card p-4 flex gap-4">
              <Link href={`/products/${item.productId}`} className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 block">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </Link>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1 truncate">{item.name}</h3>
                <p className="text-mist text-sm mb-2">
                  سایز: {item.size} | رنگ: {item.color}
                </p>
                <p className="text-brand font-bold">
                  {formatPrice(item.price)} تومان
                </p>
              </div>

              <div className="flex flex-col items-end justify-between shrink-0">
                <button
                  onClick={() => removeItem(item.productId, item.size, item.color)}
                  aria-label={`حذف ${item.name}`}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex items-center border border-line rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                    className="px-3 py-1.5 hover:bg-line/50 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                    className="px-3 py-1.5 hover:bg-line/50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card p-6 mt-8">
          <h3 className="font-bold text-xl mb-4">خلاصه سفارش</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-mist">تعداد اقلام:</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mist">هزینه ارسال:</span>
              <span>رایگان</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t border-line pt-4">
              <span>مجموع:</span>
              <span className="text-brand">{formatPrice(total)} تومان</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center block">
            ادامه فرایند خرید
          </Link>
        </div>
      </div>
    </div>
  )
}