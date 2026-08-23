import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  const body = await request.json()
  const { name, email, password, phone, role } = body

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json(
      { error: 'نام، ایمیل و رمز عبور الزامی هستند' },
      { status: 400 }
    )
  }

  if (String(password).length < 6) {
    return NextResponse.json(
      { error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' },
      { status: 400 }
    )
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'ایمیل نامعتبر است' }, { status: 400 })
  }

  if (role !== undefined && !['USER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'نقش نامعتبر است' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
  if (existing) {
    return NextResponse.json(
      { error: 'این ایمیل قبلاً ثبت شده است' },
      { status: 400 }
    )
  }

  const hashed = await bcrypt.hash(String(password), 10)

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      password: hashed,
      ...(phone?.trim() && { phone: phone.trim() }),
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
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

  return NextResponse.json(user, { status: 201 })
}