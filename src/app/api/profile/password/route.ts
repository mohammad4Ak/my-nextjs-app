import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// تغییر رمز عبور توسط خود کاربر - با تأیید رمز فعلی
export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'ابتدا وارد شوید' }, { status: 401 })
  }

  const body = await request.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'رمز فعلی و رمز جدید الزامی هستند' },
      { status: 400 }
    )
  }

  if (String(newPassword).length < 6) {
    return NextResponse.json(
      { error: 'رمز جدید باید حداقل ۶ کاراکتر باشد' },
      { status: 400 }
    )
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: 'رمز جدید نباید با رمز فعلی یکسان باشد' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 })
  }

  const valid = await bcrypt.compare(String(currentPassword), user.password)
  if (!valid) {
    return NextResponse.json({ error: 'رمز فعلی اشتباه است' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(String(newPassword), 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  })

  return NextResponse.json({ success: true })
}