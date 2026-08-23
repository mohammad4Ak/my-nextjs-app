'use client'

import { Fragment, useState, useEffect, useCallback } from 'react'
import { Trash2, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Order {
  id: string
  total: number
  status: string
  address: string
  phone: string
  createdAt: string
  user: { name: string; email: string }
  items: { id: string; quantity: number; size: number; color: string; price: number; product: { name: string } }[]
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-700' },
  PROCESSING: { label: 'در حال پردازش', color: 'bg-blue-100 text-blue-700' },
  SHIPPED: { label: 'ارسال شده', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'تحویل شده', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'لغو شده', color: 'bg-red-100 text-red-700' },
}

const allStatuses = Object.keys(statusLabels)

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (res.ok) setOrders(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    } else {
      alert('خطا در تغییر وضعیت')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('این سفارش حذف شود؟')) return

    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id))
    } else {
      alert('خطا در حذف سفارش')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">مدیریت سفارشها</h1>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-mist">در حال بارگذاری...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xl font-bold mb-2">هنوز سفارشی ثبت نشده</p>
            <p className="text-mist mb-6">سفارشها پس از خرید مشتریان اینجا نمایش داده میشوند</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
            <thead className="bg-night text-white">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">شماره</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">مشتری</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">اقلام</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">مبلغ</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">وضعیت</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">تاریخ</th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <Fragment key={order.id}>
                  <tr className="hover:bg-fog/30">
                    <td className="px-4 py-3 md:px-6 md:py-4 font-mono">#{order.id.slice(-6)}</td>
                    <td className="px-4 py-3 md:px-6 md:py-4 font-medium">{order.user.name}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        className="flex items-center gap-1 hover:text-brand"
                      >
                        {order.items.length} قلم
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 font-bold">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-2 rounded-full text-sm border-none cursor-pointer ${statusLabels[order.status].color}`}
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>{statusLabels[s].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-mist">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-2 hover:bg-fog rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </td>
                  </tr>
                  {expandedId === order.id && (
                    <tr className="bg-fog/50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-2 text-sm">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between">
                              <span>
                                {item.product.name} — سایز {item.size} — رنگ {item.color} × {item.quantity}
                              </span>
                              <span>{formatPrice(item.price * item.quantity)} تومان</span>
                            </div>
                          ))}
                          <div className="border-t border-line pt-2 flex justify-between text-mist">
                            <span>آدرس: {order.address} | تلفن: {order.phone}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                   )}
                 </Fragment>
               ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}