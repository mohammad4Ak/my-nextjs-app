import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// اطلاعات حساب کاربر لاگینشده
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 })
  }

  return NextResponse.json(user)
}

// ویرایش اطلاعات حساب توسط خود کاربر (نام و تلفن)
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 })
  }

  const body = await request.json()
  const { name, phone } = body

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: 'نام نمیتواند خالی باشد' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone.trim() || null }),
    },
    select: { id: true, name: true, email: true, phone: true },
  })

  return NextResponse.json(user)
}