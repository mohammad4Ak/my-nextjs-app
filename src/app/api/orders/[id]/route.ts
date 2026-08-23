import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

class StatusError extends Error {}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'وضعیت نامعتبر است' }, { status: 400 })
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      })

      if (!existing) {
        throw new StatusError('سفارش یافت نشد')
      }

      const wasCancelled = existing.status === 'CANCELLED'
      const willBeCancelled = body.status === 'CANCELLED'

      // لغو سفارش -> برگشت موجودی به انبار
      if (!wasCancelled && willBeCancelled) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }

      // خروج از حالت لغو -> دوباره کسر موجودی (کاهش اتمیک ضد-رقابت)
      if (wasCancelled && !willBeCancelled) {
        for (const item of existing.items) {
          const decremented = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          })
          if (decremented.count === 0) {
            const p = await tx.product.findUnique({
              where: { id: item.productId },
              select: { name: true },
            })
            throw new StatusError(
              `موجودی «${p?.name ?? 'محصول'}» برای خروج از لغو کافی نیست`
            )
          }
        }
      }

      return tx.order.update({
        where: { id },
        data: { status: body.status },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      })
    })

    return NextResponse.json(order)
  } catch (e) {
    if (e instanceof StatusError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'خطا در تغییر وضعیت' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  const { id } = await params

  try {
    // اگر سفارش لغو نبوده، موجودی اقلامش قبل از حذف برمیگردد
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      })

      if (order && order.status !== 'CANCELLED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }

      await tx.orderItem.deleteMany({ where: { orderId: id } })
      await tx.order.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطا در حذف سفارش' }, { status: 500 })
  }
}