'use client'

import Link from 'next/link'
import { Send, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const links = [
    {
      title: 'دسترسی سریع',
      items: [
        { href: '/products', label: 'محصولات' },
        { href: '/cart', label: 'سبد خرید' },
        { href: '/about', label: 'درباره ما' },
        { href: '/contact', label: 'تماس با ما' },
      ],
    },
    {
      title: 'خدمات مشتریان',
      items: [
        { href: '#', label: 'پیگیری سفارش' },
        { href: '#', label: 'روشهای ارسال' },
        { href: '#', label: 'شرایط تعویض' },
        { href: '#', label: 'سوالات متداول' },
      ],
    },
  ]

  const contactItems = [
    { href: 'tel:02112345678', label: '۰۲۱-۱۲۳۴۵۶۷۸', Icon: Phone },
    { href: 'mailto:info@shoeland.ir', label: 'info@shoeland.ir', Icon: Mail },
    { href: '#', label: 'تهران، خیابان ولیعصر', Icon: MapPin },
  ]

  return (
    <footer className="bg-night text-fog mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ک</span>
              </div>
              <span className="text-2xl font-bold">کفش لند</span>
            </div>
            <p className="text-fog/70 text-sm leading-relaxed">
              فروشگاه تخصصی کفش کتانی و رسمی با کیفیتترین محصولات و بهترین قیمت
            </p>
          </div>

          {/* Links */}
          {links.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-lg mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-fog/70 hover:text-brand transition-colors flex items-center gap-2"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4">اطلاعات تماس</h4>
            <ul className="space-y-3">
              {contactItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-fog/70 hover:text-brand transition-colors flex items-center gap-2"
                  >
                    <item.Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-fog/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-fog/60 text-sm">
            © ۱۴۰۴ کفش لند. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 bg-fog/10 rounded-lg hover:bg-brand transition-colors flex items-center justify-center w-10 h-10">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="p-2 bg-fog/10 rounded-lg hover:bg-brand transition-colors flex items-center justify-center w-10 h-10">
              <Send className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}