import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

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

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'دسته بندی یافت نشد' }, { status: 404 })
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined && body.name.trim() && { name: body.name.trim() }),
        ...(body.slug !== undefined && body.slug.trim() && { slug: body.slug.trim() }),
        ...(body.image !== undefined && { image: body.image.trim() || null }),
      },
      include: { _count: { select: { products: true } } },
    })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json(
      { error: 'خطا در ویرایش دسته بندی (نام یا slug تکراری است)' },
      { status: 400 }
    )
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

  const productsCount = await prisma.product.count({ where: { categoryId: id } })

  if (productsCount > 0) {
    return NextResponse.json(
      {
        error: `این دسته بندی ${productsCount} محصول دارد. ابتدا محصولات آن را حذف یا منتقل کنید.`,
      },
      { status: 400 }
    )
  }

  try {
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطا در حذف دسته بندی' }, { status: 400 })
  }
}