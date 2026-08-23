import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()

  const orders = await prisma.order.findMany({
    where: session?.user?.role === 'ADMIN' ? {} : { userId: session?.user?.id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}

class OrderError extends Error {
  productId?: string
  outOfStock?: string[]

  constructor(message: string, opts?: { productId?: string; outOfStock?: string[] }) {
    super(message)
    this.productId = opts?.productId
    this.outOfStock = opts?.outOfStock
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json(
      { error: 'برای ثبت سفارش ابتدا وارد شوید' },
      { status: 401 }
    )
  }

  const body = await request.json()
  const { items, address, phone } = body

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'سبد خرید خالی است' }, { status: 400 })
  }

  if (!address || !phone) {
    return NextResponse.json(
      { error: 'آدرس و شماره تماس الزامی است' },
      { status: 400 }
    )
  }

  // پیشاعتبارسنجی: همه اقلام ناکافی را یکجا پیدا کن تا کاربر یکجا ببیند
  const failures: string[] = []
  const failureNames: string[] = []

  for (const item of items) {
    const quantity = Number(item.quantity)
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    })

    if (!product || !Number.isInteger(quantity) || quantity < 1 || product.stock < quantity) {
      if (!failures.includes(item.productId)) {
        failures.push(item.productId)
        failureNames.push(product?.name ?? 'محصول')
      }
    }
  }

  if (failures.length > 0) {
    return NextResponse.json(
      {
        error: `موجودی «${failureNames.join('» و «')}» کافی نیست - این اقلام از سبد شما حذف شدند`,
        outOfStock: failures,
      },
      { status: 400 }
    )
  }

  try {
    // همه چیز در یک تراکنش: کاهش اتمیک موجودی، ثبت سفارش
    const order = await prisma.$transaction(async (tx) => {
      let total = 0
      const orderItemsData = []

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (!product) {
          throw new OrderError('یکی از محصولات سبد دیگر موجود نیست')
        }

        const quantity = Number(item.quantity)
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new OrderError('تعداد نامعتبر است')
        }

        // کاهش اتمیک ضد-رقابت:
        // چک و کسر در یک دستور SQL انجام میشود
        // UPDATE ... WHERE stock >= quantity
        // اگر همزمان کاربر دیگری آخرین موجودی را برد، این شرط دیگر match نمیشود
        const decremented = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        })

        if (decremented.count === 0) {
          throw new OrderError(
            `موجودی «${product.name}» به پایان رسید یا کافی نیست - این قلم از سبد شما حذف شد`,
            { productId: product.id }
          )
        }

        total += product.price * quantity
        orderItemsData.push({
          productId: product.id,
          quantity,
          size: Number(item.size),
          color: item.color || '-',
          price: product.price,
        })
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          total,
          address,
          phone,
          items: { create: orderItemsData },
        },
        include: { items: true },
      })
    })

    return NextResponse.json(order, { status: 201 })
  } catch (e) {
    if (e instanceof OrderError) {
      return NextResponse.json(
        {
          error: e.message,
          ...(e.outOfStock ? { outOfStock: e.outOfStock } : {}),
          ...(e.productId ? { outOfStock: [e.productId] } : {}),
        },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'خطا در ثبت سفارش' }, { status: 500 })
  }
}