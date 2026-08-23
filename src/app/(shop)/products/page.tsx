'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { X, ArrowUpDown } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'

interface ApiProduct {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  stock: number
  categoryId: string
  category: { name: string }
}

interface Category {
  id: string
  name: string
}

type SortKey = 'newest' | 'cheap' | 'expensive'

function ProductsContent() {
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [activeCat, setActiveCat] = useState(searchParams.get('cat') || 'ALL')
  const [query, setQuery] = useState(searchParams.get('q')?.trim() ?? '')
  const [sort, setSort] = useState<SortKey>((searchParams.get('sort') as SortKey) || 'newest')
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('min') ?? '')
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('max') ?? '')
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('stock') === '1')

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

  // سینک با تغییرات بیرونی URL (مثل کلیک دسته از صفحه اصلی)
  useEffect(() => {
    setActiveCat(searchParams.get('cat') || 'ALL')
    setQuery(searchParams.get('q')?.trim() ?? '')
  }, [searchParams])

  // نگه داشتن فیلترها در آدرس برای اشتراکگذاری لینک
  useEffect(() => {
    const sp = new URLSearchParams()
    if (query) sp.set('q', query)
    if (activeCat !== 'ALL') sp.set('cat', activeCat)
    if (sort !== 'newest') sp.set('sort', sort)
    if (minPrice !== '') sp.set('min', minPrice)
    if (maxPrice !== '') sp.set('max', maxPrice)
    if (inStockOnly) sp.set('stock', '1')
    const qs = sp.toString()
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`
    window.history.replaceState(null, '', url)
  }, [query, activeCat, sort, minPrice, maxPrice, inStockOnly])

  const filtered = useMemo(() => {
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)

    const list = products.filter((p) => {
      if (activeCat !== 'ALL' && p.categoryId !== activeCat) return false
      if (query && !p.name.includes(query)) return false
      if (min !== null && !isNaN(min) && p.price < min) return false
      if (max !== null && !isNaN(max) && p.price > max) return false
      if (inStockOnly && p.stock <= 0) return false
      return true
    })

    switch (sort) {
      case 'cheap':
        return [...list].sort((a, b) => a.price - b.price)
      case 'expensive':
        return [...list].sort((a, b) => b.price - a.price)
      default:
        return list // جدیدترین = ترتیب API بر اساس createdAt desc
    }
  }, [products, activeCat, query, sort, minPrice, maxPrice, inStockOnly])

  const activeCategoryName = categories.find((c) => c.id === activeCat)?.name

  const hasActiveFilters =
    activeCat !== 'ALL' || query !== '' || sort !== 'newest' || minPrice !== '' || maxPrice !== '' || inStockOnly

  const clearAllFilters = () => {
    setActiveCat('ALL')
    setQuery('')
    setSort('newest')
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        <nav className="flex items-center gap-2 text-sm text-mist mb-6">
          <Link href="/" className="hover:text-brand">خانه</Link>
          <span>/</span>
          <span className="text-night">محصولات</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">محصولات</h1>
            {!loading && (
              <p className="text-mist text-sm">
                {filtered.length} محصول از {products.length}
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
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
            >
              <X className="w-4 h-4" />
              پاکسازی همه فیلترها
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2.5 mb-5">
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

        {/* Sort & Price & Stock */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-paper border border-line rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-mist" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="مرتبسازی"
              className="input-field !py-2 !w-auto text-sm font-medium"
            >
              <option value="newest">جدیدترین</option>
              <option value="cheap">ارزانترین</option>
              <option value="expensive">گرانترین</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-night">قیمت:</span>
            <input
              type="number"
              min={0}
              placeholder="از"
              dir="ltr"
              aria-label="حداقل قیمت"
              className="input-field !py-2 !w-28 text-sm"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="text-mist">—</span>
            <input
              type="number"
              min={0}
              placeholder="تا"
              dir="ltr"
              aria-label="حداکثر قیمت"
              className="input-field !py-2 !w-28 text-sm"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <span className="text-xs text-mist">تومان</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-[#4F46E5]"
            />
            <span className="text-sm font-medium text-night">فقط کالاهای موجود</span>
          </label>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-square bg-line/40 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-1/3 bg-line/40 rounded animate-pulse" />
                  <div className="h-6 w-2/3 bg-line/40 rounded animate-pulse" />
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
                  stock: product.stock,
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
                  ? `در دسته بندی «${activeCategoryName}» با این فیلترها محصولی نیست`
                  : 'با این فیلترها محصولی مطابقت ندارد'}
            </p>
            {hasActiveFilters && products.length > 0 && (
              <button onClick={clearAllFilters} className="btn-primary">
                پاکسازی فیلترها
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