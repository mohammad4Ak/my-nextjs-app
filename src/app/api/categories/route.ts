import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  const body = await request.json()
  const { name, slug } = body

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'نام دسته بندی الزامی است' }, { status: 400 })
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug:
          (typeof slug === 'string' && slug.trim()) ||
          `cat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        ...(typeof body.image === 'string' && body.image.trim() && { image: body.image.trim() }),
      },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json(category, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'خطا در ایجاد دسته بندی (نام یا slug تکراری است)' },
      { status: 400 }
    )
  }
}