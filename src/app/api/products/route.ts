import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const categoryId = searchParams.get('categoryId')?.trim()

  const products = await prisma.product.findMany({
    where: {
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
    },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  const body = await request.json()

  const {
    name,
    slug,
    description,
    price,
    images,
    categoryId,
    sizes,
    colors,
    stock,
    featured,
  } = body

  if (!name || !price || !categoryId) {
    return NextResponse.json(
      { error: 'نام، قیمت و دسته بندی الزامی است' },
      { status: 400 }
    )
  }

  const cat = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!cat) {
    return NextResponse.json({ error: 'دسته بندی نامعتبر است' }, { status: 400 })
  }
  const resolvedCategoryId = cat.id

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug:
          slug ||
          `${Date.now()}-${name.replace(/\s+/g, '-').slice(0, 30)}`,
        description: description || '',
        price: Number(price),
        images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80'],
        categoryId: resolvedCategoryId,
        sizes: Array.isArray(sizes) ? sizes.map(Number) : [],
        colors: Array.isArray(colors) ? colors : [],
        stock: Number(stock) || 0,
        featured: Boolean(featured),
      },
      include: { category: true },
    })
    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'خطا در ایجاد محصول (slug تکراری؟)' },
      { status: 400 }
    )
  }
}