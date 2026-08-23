'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: { name: string }
}

export default function NavSearch({ onClose }: { onClose: () => void }) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // فوکوس خودکار + بستن با Escape
  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // جستجوی زنده با debounce
  useEffect(() => {
    const q = term.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(q)}`)
        .then(async (r) => (r.ok ? r.json() : []))
        .then((data: SearchResult[]) => setResults(data.slice(0, 6)))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timer)
  }, [term])

  const goToListing = () => {
    if (!term.trim()) return
    onClose()
    router.push(`/products?q=${encodeURIComponent(term.trim())}`)
  }

  const goProduct = (slug: string) => {
    onClose()
    router.push(`/products/${encodeURIComponent(slug)}`)
  }

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <button
        aria-label="بستن جستجو"
        onClick={onClose}
        className="absolute inset-0 w-full bg-night/60 backdrop-blur-sm animate-fade-in cursor-default"
      />

      <div className="relative mx-auto mt-20 md:mt-28 max-w-xl px-4">
        <div className="bg-paper rounded-2xl shadow-2xl shadow-night/30 border border-line overflow-hidden animate-toast-in">
          {/* Input */}
          <div className="flex items-center gap-3 p-4 border-b border-line">
            <Search className="w-5 h-5 text-mist shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') goToListing()
              }}
              placeholder="جستجو در محصولات..."
              className="flex-1 bg-transparent outline-none text-lg font-medium text-night placeholder:text-mist/60"
            />
            <button
              onClick={onClose}
              aria-label="بستن"
              className="p-1.5 hover:bg-line/70 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-mist" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto">
            {loading && (
              <p className="px-5 py-6 text-sm text-mist">در حال جستجو...</p>
            )}

            {!loading && term.trim().length >= 2 && results.length === 0 && (
              <p className="px-5 py-6 text-sm text-mist">
                محصولی برای «{term}» پیدا نشد
              </p>
            )}

            {!loading &&
              results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => goProduct(product.slug)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-brand/5 transition-colors text-right border-b border-line/50 last:border-0"
                >
                  <img
                    src={product.images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-sm text-night truncate">
                      {product.name}
                    </span>
                    <span className="block text-xs text-mist">
                      {product.category?.name}
                    </span>
                  </span>
                  <span className="text-brand font-bold text-sm whitespace-nowrap">
                    {formatPrice(product.price)}
                  </span>
                </button>
              ))}
          </div>

          {/* Footer action */}
          {term.trim().length >= 2 && (
            <Link
              href={`/products?q=${encodeURIComponent(term.trim())}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-3.5 bg-fog hover:bg-line/50 text-sm font-bold text-night transition-colors"
            >
              مشاهده همه نتایج برای «{term.trim()}»
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
        </div>

        {!term && (
          <p className="text-center text-white/70 text-xs mt-4">
            حداقل ۲ حرف تایپ کنید — یا Enter بزنید تا در صفحه محصولات جستجو شود
          </p>
        )}
      </div>
    </div>
  )
}