import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

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

  // نقش اختیاری است - فقط اگر ارسال شده باشد اعتبارسنجی میشود
  if (body.role !== undefined && !['USER', 'ADMIN'].includes(body.role)) {
    return NextResponse.json({ error: 'نقش نامعتبر است' }, { status: 400 })
  }

  if (body.role !== undefined && session.user.id === id && body.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'نمیتوانید نقش خودتان را تغییر دهید' },
      { status: 400 }
    )
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(body.role !== undefined && { role: body.role }),
      ...(body.name !== undefined && body.name.trim() && { name: body.name.trim() }),
      ...(body.phone !== undefined && { phone: body.phone.trim() || null }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      _count: { select: { orders: true } },
    },
  })

  return NextResponse.json(user)
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

  if (session.user.id === id) {
    return NextResponse.json(
      { error: 'نمیتوانید حساب خودتان را حذف کنید' },
      { status: 400 }
    )
  }

  try {
    await prisma.orderItem.deleteMany({
      where: { order: { userId: id } },
    })
    await prisma.order.deleteMany({ where: { userId: id } })
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطا در حذف کاربر' }, { status: 400 })
  }
}