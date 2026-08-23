import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// همه مسیرها فقط برای کاربر لاگینشده و فقط روی آدرسهای خودش
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 })
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(addresses)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 })
  }

  const body = await request.json()
  const { title, address, phone, isDefault } = body

  if (!address?.trim() || !phone?.trim()) {
    return NextResponse.json(
      { error: 'متن آدرس و شماره تماس الزامی است' },
      { status: 400 }
    )
  }

  const count = await prisma.address.count({ where: { userId: session.user.id } })
  const makeDefault = isDefault === true || count === 0

  const created = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }
    return tx.address.create({
      data: {
        userId: session.user.id,
        title: title?.trim() || null,
        address: address.trim(),
        phone: phone.trim(),
        isDefault: makeDefault,
      },
    })
  })

  return NextResponse.json(created, { status: 201 })
}