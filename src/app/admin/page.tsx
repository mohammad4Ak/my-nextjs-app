'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import { formatPrice } from '@/lib/utils'

interface Stats {
  totals: { products: number; users: number; orders: number; revenue: number }
  salesByDay: { day: string; revenue: number; orders: number }[]
  statusBreakdown: { status: string; label: string; count: number }[]
  topProducts: { name: string; sold: number }[]
}

const CHART_COLORS = ['#4F46E5', '#64748B', '#0F172A', '#94A3B8', '#C7D2FE']

const statusColors: Record<string, string> = {
  PENDING: '#EAB308',
  PROCESSING: '#3B82F6',
  SHIPPED: '#8B5CF6',
  DELIVERED: '#22C55E',
  CANCELLED: '#EF4444',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/stats')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: Stats) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const statCards = stats
    ? [
        { label: 'کل محصولات', value: String(stats.totals.products), Icon: Package, color: 'bg-blue-500', href: '/admin/products' },
        { label: 'سفارشها', value: String(stats.totals.orders), Icon: ShoppingBag, color: 'bg-green-500', href: '/admin/orders' },
        { label: 'کاربران', value: String(stats.totals.users), Icon: Users, color: 'bg-purple-500', href: '/admin/users' },
        { label: 'درآمد کل', value: `${formatPrice(stats.totals.revenue)} ت`, Icon: TrendingUp, color: 'bg-brand', href: '/admin/orders' },
      ]
    : []

  const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid #E4E7EC',
    fontFamily: 'inherit',
    fontSize: '13px',
    direction: 'rtl' as const,
  }

  const hasOrders = stats && stats.statusBreakdown.some((s) => s.count > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">داشبورد</h1>
        <Link href="/admin/orders" className="text-brand text-sm font-medium hover:underline flex items-center gap-1">
          همه سفارشها
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-14 bg-line/40 rounded-lg animate-pulse" />
              </div>
            ))
          : statCards.map((stat) => (
              <Link key={stat.label} href={stat.href} className="card p-6 block hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-mist text-sm">{stat.label}</p>
                  </div>
                </div>
              </Link>
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Area Chart */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-bold text-lg mb-6">فروش ۷ روز اخیر</h2>
          {stats && (
            <div dir="ltr" className="h-72 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesByDay} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" strokeOpacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={{ stroke: '#E4E7EC' }}
                    tickLine={false}
                    reversed
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                    }
                    orientation="right"
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => {
                      if (name === 'revenue') return [`${formatPrice(Number(value))} تومان`, 'فروش']
                      if (name === 'orders') return [String(value), 'سفارش']
                      return [String(value), String(name)]
                    }}
                    labelFormatter={(label) => `${label}`}
                    offset={20}
                    position={{ y: -30 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ r: 3.5, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 5.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status Donut */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-6">وضعیت سفارشها</h2>
          {hasOrders ? (
            <div dir="ltr" className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.statusBreakdown.filter((s) => s.count > 0)}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    cornerRadius={6}
                  >
                    {stats?.statusBreakdown
                      .filter((s) => s.count > 0)
                      .map((entry) => (
                        <Cell key={entry.status} fill={statusColors[entry.status] ?? '#999'} />
                      ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} سفارش`, String(name)]} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', direction: 'rtl', fontFamily: 'inherit' }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-center text-mist text-sm px-4">
              هنوز سفارشی ثبت نشده؛ با اولین خرید، اینجا نمودار وضعیتها ساخته میشود.
            </div>
          )}
        </div>
      </div>

      {/* Top Products Bar Chart */}
      <div className="card p-6">
        <h2 className="font-bold text-lg mb-6">پرفروشترین محصولات</h2>
        {stats && stats.topProducts.length > 0 ? (
          <div dir="ltr" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...stats.topProducts].reverse()} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 11, fill: '#0F172A' }}
                  axisLine={false}
                  tickLine={false}
                  orientation="right"
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(228,231,236,0.15)' }}
                  formatter={(value) => [`${value} عدد`, 'فروش']}
                  position={{ x: 120, y: 0 }}
                />
                <Bar dataKey="sold" fill="#4F46E5" radius={[6, 0, 0, 6]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-mist text-sm">
            پس از ثبت سفارش، پرفروشترین محصولات اینجا نمایش داده میشوند.
          </div>
        )}
      </div>
    </div>
  )
}