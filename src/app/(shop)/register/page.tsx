'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند')
      return
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد')
      return
    }

    setLoading(true)

    try {
      // ثبتنام در دیتابیس
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'خطا در ثبتنام')
        setLoading(false)
        return
      }

      // ورود خودکار پس از ثبتنام
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      router.push('/')
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
            <h1 className="text-2xl font-bold">ثبتنام</h1>
            <p className="text-mist">خانواده کفش لند به شما خوش آمد میگوید</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">نام کامل</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="محمد محمدی"
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-2">ایمیل</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                dir="ltr"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block font-bold mb-2">تکرار رمز عبور</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
              {loading ? 'در حال ثبتنام...' : 'ثبتنام'}
            </button>
          </form>

          <p className="text-center mt-6 text-mist">
            قبلاً ثبتنام کردهاید؟{' '}
            <Link href="/login" className="text-brand font-medium hover:underline">
              وارد شوید
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}