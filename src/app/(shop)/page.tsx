import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import { prisma } from '@/lib/prisma'

const faNumber = new Intl.NumberFormat('fa-IR')

function faPrice(n: number) {
  return faNumber.format(n)
}

interface HeroProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
}

function HeroCard({ product, className }: { product: HeroProduct; className?: string }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`absolute w-60 md:w-72 group transition-all duration-500 hover:rotate-0 hover:scale-[1.04] hover:z-40 ${className ?? ''}`}
    >
      <div className="bg-white rounded-2xl p-3 shadow-2xl shadow-black/40">
        <div className="aspect-square rounded-xl overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex items-center justify-between gap-2 px-2 pt-3 pb-1">
          <span className="text-night text-sm font-bold truncate">{product.name}</span>
          <span className="text-brand text-sm font-black whitespace-nowrap">
            {faPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  )
}

const marqueeItems = [
  'ارسال سریع ۴۸ ساعته',
  'ضمانت اصالت کالا',
  '۷ روز مهلت بازگشت',
  'پرداخت امن زرینپال',
  'چرم طبیعی درجه یک',
]

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
  ])

  const fallbackImages: Record<string, string> = {
    sneaker: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900&q=80',
    formal: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=900&q=80',
  }

  return (
    <div className="min-h-screen">
      {/* ---------- Hero (زیر ناوبار شناور میرود تا نوار روشن دیده نشود) ---------- */}
      <section className="relative bg-night text-fog overflow-hidden -mt-[72px] md:-mt-20">
        {/* خط دوخت دور صفحه - امضای بصری */}
        <div className="absolute inset-4 border border-dashed border-line/25 rounded-[2rem] pointer-events-none" aria-hidden />

        <div className="container mx-auto px-4 pt-24 pb-24 md:pt-32 md:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* متن */}
            <div>
              <span className="fade-up inline-block bg-brand text-white text-sm px-4 py-1.5 rounded-full mb-8">
                مجموعه جدید — پاییز ۱۴۰۴
              </span>

              <h1 className="fade-up fade-up-d1 text-5xl md:text-7xl font-black leading-[1.15] tracking-tight mb-6">
                استایلت
                <br />
                از <span className="text-line">پا</span> شروع
                <br />
                میشود.
              </h1>

              <div className="stitch w-40 mb-8 opacity-70" aria-hidden />

              <p className="fade-up fade-up-d2 text-lg text-fog/70 leading-relaxed max-w-md mb-10">
                کتانی و رسمی، با چرم طبیعی و ساخت حرفهای؛
                برای قدمهایی که دیده میشوند.
              </p>

              <div className="fade-up fade-up-d3 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="bg-brand hover:bg-brand/90 text-white px-8 py-4 rounded-xl font-bold transition-colors inline-flex items-center gap-2"
                >
                  مشاهده فروشگاه
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link
                  href="#categories"
                  className="border-2 border-dashed border-line/50 hover:border-line hover:bg-line/10 text-fog px-8 py-4 rounded-xl font-bold transition-colors"
                >
                  دسته بندی ها
                </Link>
              </div>
            </div>

            {/* کارتهای محصول چرخیده */}
            <div className="relative h-[440px] md:h-[480px] hidden sm:block">
              {featured[0] && (
                <HeroCard product={featured[0]} className="right-0 top-2 -rotate-6 z-10" />
              )}
              {featured[1] && (
                <HeroCard product={featured[1]} className="left-0 top-28 rotate-3 z-20" />
              )}
              {featured[2] && (
                <HeroCard product={featured[2]} className="right-20 bottom-0 rotate-[10deg] z-30" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Marquee ---------- */}
      <div className="bg-brand text-white overflow-hidden py-4" dir="ltr">
        <div className="flex w-max animate-marquee gap-0">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {marqueeItems.map((item) => (
                <span key={`${copy}-${item}`} className="flex items-center text-sm font-bold tracking-wide">
                  <span className="mx-6">{item}</span>
                  <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.6h7.6L12 2z" />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Categories ---------- */}
      <section id="categories" className="py-20 px-4 scroll-mt-20">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand font-bold text-sm mb-2">دو دنیای متفاوت</p>
              <h2 className="text-4xl font-black">دسته بندی ها</h2>
            </div>
            <div className="stitch flex-1 mx-8 mb-3 opacity-50 hidden md:block" aria-hidden />
            <Link href="/products" className="text-mist hover:text-brand font-medium text-sm whitespace-nowrap">
              همه محصولات ←
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?cat=${category.id}`}
                className="group relative block h-80 rounded-3xl overflow-hidden bg-line/40"
              >
                <img
                  src={category.image || fallbackImages[category.slug] || fallbackImages.sneaker}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />

                {/* قاب دوخت داخلی */}
                <div className="absolute inset-3 border border-dashed border-fog/30 rounded-[1.4rem] pointer-events-none group-hover:border-fog/60 transition-colors" aria-hidden />

                <div className="absolute bottom-0 right-0 left-0 p-8 flex items-end justify-between text-fog">
                  <div>
                    <h3 className="text-3xl font-black mb-1">{category.name}</h3>
                    <p className="text-fog/70 text-sm">{faNumber.format(category._count.products)} محصول موجود</p>
                  </div>
                  <span className="w-12 h-12 rounded-full bg-fog/15 backdrop-blur flex items-center justify-center group-hover:bg-brand transition-colors">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Featured Products ---------- */}
      <section id="products" className="py-20 px-4 bg-white border-y border-line/50">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand font-bold text-sm mb-2">انتخاب سردبیر</p>
              <h2 className="text-4xl font-black">محصولات ویژه</h2>
            </div>
            <div className="stitch flex-1 mx-8 mb-3 opacity-50 hidden md:block" aria-hidden />
            <Link href="/products" className="text-mist hover:text-brand font-medium text-sm whitespace-nowrap">
              مشاهده همه ←
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image: product.images[0],
                    category: product.category?.name ?? '',
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-mist py-8">هنوز محصول ویژهای ثبت نشده است</p>
          )}
        </div>
      </section>

      {/* ---------- Stats Band ---------- */}
      <section className="bg-line/40 py-16 px-4">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { value: `${faNumber.format(Math.max(categories.reduce((sum, c) => sum + c._count.products, 0), 0))}+`, label: 'محصول فعال' },
            { value: '+۵۰K', label: 'مشتری راضی' },
            { value: '۴۸h', label: 'زمان ارسال' },
            { value: '۹', label: 'سال تجربه' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl md:text-5xl font-black text-night mb-2">{stat.value}</p>
              <p className="text-mist text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="relative bg-night rounded-3xl py-16 px-8 text-center text-fog overflow-hidden">
            <div className="absolute inset-4 border border-dashed border-line/25 rounded-[1.8rem] pointer-events-none" aria-hidden />
            <h2 className="text-3xl md:text-4xl font-black mb-4">قدم بعدی را با ما بردارید</h2>
            <p className="text-fog/70 mb-10 max-w-md mx-auto leading-relaxed">
              همین حالا سفارش دهید؛ بقیهاش با ما — ارسال سریع، پرداخت امن، ضمانت بازگشت.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-10 py-4 rounded-xl font-bold transition-colors"
            >
              شروع خرید
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}