import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const statusLabels: Record<string, string> = {
  PENDING: 'در انتظار پرداخت',
  PROCESSING: 'در حال پردازش',
  SHIPPED: 'ارسال شده',
  DELIVERED: 'تحویل شده',
  CANCELLED: 'لغو شده',
}

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  // ابتدای ۶ روز قبل (امروز + ۶ روز = ۷ روز)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setHours(0, 0, 0, 0)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

  const [
    totalProducts,
    totalUsers,
    totalOrders,
    revenueAgg,
    recentOrders,
    statusGroups,
    topItems,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, total: true, status: true },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ])

  // فروش ۷ روز اخیر
  const dayFormatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' })
  const salesByDay = []
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(sevenDaysAgo)
    dayStart.setDate(dayStart.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const dayOrders = recentOrders.filter(
      (o) =>
        o.createdAt >= dayStart &&
        o.createdAt < dayEnd &&
        o.status !== 'CANCELLED'
    )

    salesByDay.push({
      day: dayFormatter.format(dayStart),
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
    })
  }

  const statusBreakdown = statusGroups.map((g) => ({
    status: g.status,
    label: statusLabels[g.status] ?? g.status,
    count: g._count._all,
  }))

  // پرفروشترین محصولات
  const topProductIds = topItems.map((t) => t.productId)
  const topProductsData = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  })

  const topProducts = topItems.map((t) => ({
    name:
      topProductsData.find((p) => p.id === t.productId)?.name.slice(0, 20) ??
      'نامشخص',
    sold: t._sum.quantity ?? 0,
  }))

  return NextResponse.json({
    totals: {
      products: totalProducts,
      users: totalUsers,
      orders: totalOrders,
      revenue: revenueAgg._sum.total ?? 0,
    },
    salesByDay,
    statusBreakdown,
    topProducts,
  })
}