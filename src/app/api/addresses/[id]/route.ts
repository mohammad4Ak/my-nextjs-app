import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'آدرس یافت نشد' }, { status: 404 })
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (body.isDefault === true) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }

    return tx.address.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title?.trim() || null }),
        ...(body.address !== undefined && body.address.trim() && { address: body.address.trim() }),
        ...(body.phone !== undefined && body.phone.trim() && { phone: body.phone.trim() }),
        ...(body.isDefault !== undefined && { isDefault: Boolean(body.isDefault) }),
      },
    })
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'آدرس یافت نشد' }, { status: 404 })
  }

  await prisma.address.delete({ where: { id } })

  // اگر آدرس پیشفرض حذف شد، جدیدترین آدرس باقیمانده پیشفرض شود
  const remaining = await prisma.address.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  if (remaining && !remaining.isDefault) {
    const anyDefault = await prisma.address.findFirst({
      where: { userId: session.user.id, isDefault: true },
    })
    if (!anyDefault) {
      await prisma.address.update({
        where: { id: remaining.id },
        data: { isDefault: true },
      })
    }
  }

  return NextResponse.json({ success: true })
}