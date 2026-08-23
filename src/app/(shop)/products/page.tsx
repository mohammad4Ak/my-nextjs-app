'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/shop/ProductCard'

interface ApiProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  categoryId: string
  category: { name: string }
}

interface Category {
  id: string
  name: string
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q')?.trim() ?? ''
  const initialCat = searchParams.get('cat')?.trim() ?? ''

  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState<string>(initialCat || 'ALL')
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      fetch('/api/products').then(async (r) => (r.ok ? r.json() : [])),
      fetch('/api/categories').then(async (r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, c]) => {
        if (!cancelled) {
          setProducts(p)
          setCategories(c)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // تغییر دسته از روی URL (مثلا کلیک از صفحه اصلی)
  useEffect(() => {
    setActiveCat(initialCat || 'ALL')
    setQuery(initialQuery)
  }, [initialCat, initialQuery])

  const filtered = products.filter((p) => {
    if (activeCat !== 'ALL' && p.categoryId !== activeCat) return false
    if (query && !p.name.includes(query)) return false
    return true
  })

  const activeCategoryName = categories.find((c) => c.id === activeCat)?.name

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        <nav className="flex items-center gap-2 text-sm text-mist mb-6">
          <Link href="/" className="hover:text-brand">خانه</Link>
          <span>/</span>
          <span className="text-night">محصولات</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">محصولات</h1>
        {!loading && (
          <p className="text-mist text-sm mb-6">
            {filtered.length} محصول
            {query && (
              <>
                {' '}برای «<span className="font-bold text-night">{query}</span>»
                <button
                  onClick={() => setQuery('')}
                  className="inline-flex items-center gap-1 mr-2 bg-line/70 hover:bg-line text-night text-xs px-2.5 py-1 rounded-full transition-colors align-middle"
                >
                  حذف جستجو
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
          </p>
        )}

        {/* Category chips */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          <button
            onClick={() => setActiveCat('ALL')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
              activeCat === 'ALL'
                ? 'bg-night text-white'
                : 'bg-paper border border-line hover:border-brand hover:text-brand text-mist'
            }`}
          >
            همه
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(activeCat === c.id ? 'ALL' : c.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
                activeCat === c.id
                  ? 'bg-night text-white'
                  : 'bg-paper border border-line hover:border-brand hover:text-brand text-mist'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-square bg-sand/40 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-1/3 bg-sand/40 rounded animate-pulse" />
                  <div className="h-6 w-2/3 bg-sand/40 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
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
          <div className="text-center py-16">
            <p className="text-xl font-bold mb-2">محصولی پیدا نشد</p>
            <p className="text-mist mb-6">
              {products.length === 0
                ? 'هنوز محصولی ثبت نشده است'
                : activeCategoryName
                  ? `در دسته بندی «${activeCategoryName}» محصولی نیست`
                  : 'فیلترها را تغییر دهید'}
            </p>
            {(activeCat !== 'ALL' || query) && products.length > 0 && (
              <button
                onClick={() => { setActiveCat('ALL'); setQuery('') }}
                className="btn-primary"
              >
                نمایش همه محصولات
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-8 px-4 container mx-auto">در حال بارگذاری...</div>}>
      <ProductsContent />
    </Suspense>
  )
}