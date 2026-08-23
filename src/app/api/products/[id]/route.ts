import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // بعضی مواقع پارامتر انکودشده میرسد - هر دو حالت را امتحان میکنیم
  let decodedId = id
  try {
    decodedId = decodeURIComponent(id)
  } catch {
    decodedId = id
  }

  const product =
    (await prisma.product.findUnique({
      where: { id: decodedId },
      include: { category: true },
    })) ??
    (await prisma.product.findFirst({
      where: { slug: decodedId },
      include: { category: true },
    })) ??
    (await prisma.product.findFirst({
      where: { slug: id },
      include: { category: true },
    }))

  if (!product) {
    return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const {
    name,
    description,
    price,
    images,
    sizes,
    colors,
    stock,
    featured,
  } = body

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })
  }

  let categoryId = existing.categoryId
  if (body.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: body.categoryId } })
    if (!cat) {
      return NextResponse.json({ error: 'دسته بندی نامعتبر است' }, { status: 400 })
    }
    categoryId = cat.id
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(images !== undefined && Array.isArray(images) && images.length > 0 && { images }),
      ...(categoryId !== undefined && { categoryId }),
      ...(sizes !== undefined && { sizes: sizes.map(Number) }),
      ...(colors !== undefined && { colors }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(featured !== undefined && { featured: Boolean(featured) }),
    },
    include: { category: true },
  })

  return NextResponse.json(product)
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
    // حذف آیتمهای سفارش مرتبط قبل از حذف محصول
    await prisma.orderItem.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'خطا در حذف محصول' },
      { status: 400 }
    )
  }
}