'use client'

import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const contactInfo = [
    { icon: Phone, label: 'تلفن', value: '۰۲۱-۱۲۳۴۵۶۷۸', href: 'tel:02112345678' },
    { icon: Mail, label: 'ایمیل', value: 'info@shoeland.ir', href: 'mailto:info@shoeland.ir' },
    { icon: MapPin, label: 'آدرس', value: 'تهران، خیابان ولیعصر، پلاک ۱۲۳۴', href: '#' },
  ]

  return (
    <div className="min-h-screen flex flex-col">

      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 text-center">تماس با ما</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-bold mb-6">اطلاعات تماس</h2>
                <div className="space-y-4">
                  {contactInfo.map((info) => (
                    <a
                      key={info.label}
                      href={info.href}
                      className="flex items-center gap-4 p-4 bg-fog rounded-lg hover:bg-line/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-brand rounded-lg flex items-center justify-center">
                        <info.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-mist">{info.label}</p>
                        <p className="font-bold">{info.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">ساعات کاری</h2>
                <div className="space-y-2 text-mist">
                  <p>شنبه تا چهارشنبه: ۹ صبح تا ۹ شب</p>
                  <p>پنجشنبه: ۹ صبح تا ۵ عصر</p>
                  <p>جمعه: تعطیل</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-6">پیام خود را بنویسید</h2>
              <form className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">نام</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="نام شما"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">ایمیل</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">موضوع</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="موضوع پیام"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">پیام</label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="پیام خود را بنویسید..."
                  />
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  ارسال پیام
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}