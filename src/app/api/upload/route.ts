import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // ۵ مگابایت

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(request: Request) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'فایلی ارسال نشد' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'فقط تصویر JPG، PNG، WebP یا GIF مجاز است' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'حجم فایل حداکثر ۵ مگابایت است' },
      { status: 400 }
    )
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const ext = EXT_MAP[file.type] || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`

  // در پروداکشن (Vercel): ذخیره در Vercel Blob
  // فایلسیستم سرورلس موندگار نیست، پس دیسک فقط برای لوکال است
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob')
      const blob = await put(`products/${filename}`, bytes, {
        access: 'public',
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      return NextResponse.json({ url: blob.url }, { status: 201 })
    } catch {
      return NextResponse.json({ error: 'خطا در آپلود به Blob' }, { status: 500 })
    }
  }

  // حالت لوکال: ذخیره روی دیسک
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(path.join(uploadsDir, filename), bytes)

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 })
}