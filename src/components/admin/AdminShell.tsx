'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Store,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const adminNav = [
  { href: '/admin', label: 'داشبورد', Icon: LayoutDashboard },
  { href: '/admin/products', label: 'محصولات', Icon: Package },
  { href: '/admin/categories', label: 'دسته بندی ها', Icon: Tags },
  { href: '/admin/orders', label: 'سفارشها', Icon: ShoppingBag },
  { href: '/admin/users', label: 'کاربران', Icon: Users },
]

export default function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode
  userName?: string | null
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-fog/50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-night/95 backdrop-blur text-white border-b border-white/10">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">ک</span>
            </span>
            <span className="font-black">پنل مدیریت</span>
            <span className="hidden md:inline text-white/40 text-sm font-medium">
              · کفش لند
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {userName && (
              <span className="hidden sm:flex w-9 h-9 rounded-full bg-white/10 items-center justify-center font-bold text-sm" title={userName}>
                {userName.trim().charAt(0)}
              </span>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 text-sm bg-white/10 hover:bg-brand px-4 py-2 rounded-full transition-colors"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">فروشگاه</span>
            </Link>
            <button
              onClick={() => signOut({ redirectTo: '/' })}
              aria-label="خروج از حساب"
              title="خروج از حساب"
              className="p-2.5 hover:bg-red-500/80 rounded-full transition-colors border border-white/10"
            >
              <LogOut className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile horizontal nav */}
      <nav
        aria-label="ناوبری پنل"
        className="lg:hidden sticky top-16 z-40 bg-fog/90 backdrop-blur border-b border-line overflow-x-auto scrollbar-none"
      >
        <div className="flex gap-2 px-4 py-3 w-max">
          {adminNav.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-night text-white'
                    : 'bg-paper border border-line text-mist hover:text-night'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="flex">
        {/* Desktop sticky sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-paper border-l border-line p-4">
            <p className="text-[11px] font-black text-mist tracking-wide px-3 mb-2 mt-1">
              منوی مدیریت
            </p>
            <nav className="space-y-1">
              {adminNav.map(({ href, label, Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                      active
                        ? 'bg-brand text-white shadow-md shadow-brand/25'
                        : 'text-mist hover:text-night hover:bg-fog'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? '' : 'opacity-70'}`} />
                    {label}
                  </Link>
                )
              })}
            </nav>

            {/* Footer info */}
            <div className="mt-8 pt-4 border-t border-line px-3">
              <p className="text-[11px] text-mist leading-relaxed">
                کفش لند · نسخه ۱.۰
              </p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  )
}