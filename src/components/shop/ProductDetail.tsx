'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { toast } from '@/lib/toast'
import { formatPrice } from '@/lib/utils'

interface ApiProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  sizes: number[]
  colors: string[]
  stock: number
  category: { name: string }
}

export default function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ApiProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [activeColor, setActiveColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const addItem = useCart((state) => state.addItem)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((data: ApiProduct) => {
        if (cancelled) return
        setProduct(data)
        setSelectedSize(
          data.sizes?.includes(42) ? 42 : (data.sizes?.[0] ?? null)
        )
        setActiveColor(data.colors?.[0] ?? '')
      })
      .catch(() => {
        if (!cancelled) setProduct(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-white rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-line/50 rounded animate-pulse" />
            <div className="h-10 w-1/3 bg-line/50 rounded animate-pulse" />
            <div className="h-24 bg-line/50 rounded animate-pulse" />
            <div className="h-12 bg-line/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex-1 py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">محصول پیدا نشد</h2>
          <p className="text-mist mb-6">محصولی که دنبالش بودید وجود ندارد</p>
          <Link href="/products" className="btn-primary inline-block">
            مشاهده محصولات
          </Link>
        </div>
      </div>
    )
  }

  const outOfStock = product.stock <= 0

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: activeColor,
      quantity: quantity,
    })
    toast('محصول به سبد خرید اضافه شد', product.name)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-mist mb-8">
        <Link href="/" className="hover:text-brand">خانه</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand">محصولات</Link>
        <span>/</span>
        <span className="text-night">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-4">
            <img
              src={product.images[activeImage] ?? product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`نمایش تصویر ${i + 1}`}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === i
                      ? 'border-brand opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-night text-fog px-3 py-1 rounded-full text-sm font-bold">
              {product.category?.name}
            </span>
            {outOfStock && (
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                ناموجود
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <p className="text-3xl font-bold text-brand mb-2">
            {formatPrice(product.price)} تومان
          </p>

          {product.stock > 0 && (
            <p className="text-mist text-sm mb-6">
              موجودی انبار: <span className="font-bold text-night">{formatPrice(product.stock)}</span> عدد
            </p>
          )}
          {!product.stock && <div className="mb-6" />}

          {product.description && (
            <p className="text-mist leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3">سایز</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg border-2 font-bold transition-all ${
                      selectedSize === size
                        ? 'border-brand bg-brand text-white'
                        : 'border-line hover:border-brand'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold mb-3">رنگ</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      activeColor === color
                        ? 'border-brand bg-brand text-white'
                        : 'border-line hover:border-brand'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center border border-line rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={outOfStock}
                className="px-4 py-3 hover:bg-line/50 transition-colors disabled:opacity-40"
              >
                -
              </button>
              <span className="px-4 py-3 font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(Math.max(product.stock, 1), quantity + 1))}
                disabled={outOfStock || quantity >= product.stock}
                className="px-4 py-3 hover:bg-line/50 transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-primary flex-1 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {outOfStock ? 'ناموجود' : 'افزودن به سبد خرید'}
            </button>
          </div>

          {!outOfStock && quantity >= product.stock && product.stock > 0 ? (
            <p className="text-mist text-xs mb-6">بیشتر از این مقدار موجود نیست</p>
          ) : (
            <div className="mb-8" />
          )}

          <Link href="/cart" className="block text-center text-brand font-medium hover:underline mb-8">
            مشاهده سبد خرید ←
          </Link>

          {/* Features */}
          <div className="border-t border-line pt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>۷ روز ضمانت بازگشت</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>ضمانت اصالت کالا</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span>ارسال سریع در ۴۸ ساعت</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}