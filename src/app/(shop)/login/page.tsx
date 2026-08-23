'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('ایمیل یا رمز عبور اشتباه است')
        setLoading(false)
        return
      }

      // بررسی نقش کاربر برای هدایت
      const res = await fetch('/api/auth/session')
      const session = await res.json()

      if (session?.user?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/')
      }
      router.refresh()
    } catch {
      setError('خطای ارتباط با سرور')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">

      <div className="py-16 px-4 flex items-center justify-center min-h-[70vh]">
        <div className="card p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">ک</span>
            </div>
            <h1 className="text-2xl font-bold">خوش آمدید</h1>
            <p className="text-mist">برای ادامه وارد حساب خود شوید</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">ایمیل</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                dir="ltr"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-2">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                dir="ltr"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>
          </form>

          <div className="mt-6 bg-fog/70 border border-line rounded-lg p-4 text-sm text-mist space-y-1" dir="ltr">
            <p><strong>Admin:</strong> admin@shoeland.ir / admin123</p>
            <p><strong>User:</strong> user@test.com / user123</p>
          </div>

          <p className="text-center mt-6 text-mist">
            حساب ندارید؟{' '}
            <Link href="/register" className="text-brand font-medium hover:underline">
              ثبت نام کنید
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}