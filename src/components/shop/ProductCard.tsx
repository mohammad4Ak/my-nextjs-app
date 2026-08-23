'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { toast } from '@/lib/toast'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
  stock?: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem)

  const outOfStock = product.stock !== undefined && product.stock <= 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: 42,
      color: '-',
      quantity: 1,
    })
    toast('محصول به سبد خرید اضافه شد', product.name)
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`card overflow-hidden group block ${outOfStock ? 'opacity-80' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden bg-fog">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            outOfStock ? 'grayscale opacity-60' : ''
          }`}
        />

        {/* برچسب دسته بندی */}
        {product.category && (
          <span className="absolute top-3 right-3 bg-night/85 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
            {product.category}
          </span>
        )}

        {/* برچسب ناموجود */}
        {outOfStock && (
          <span className="absolute top-3 left-3 bg-red-500/95 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
            ناموجود
          </span>
        )}
      </div>

      <div className={`p-4 ${outOfStock ? 'opacity-70' : ''}`}>
        <h3 className={`font-bold text-lg mb-2 transition-colors line-clamp-2 ${
          outOfStock ? 'text-mist' : 'text-night group-hover:text-brand'
        }`}>
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className={`font-bold text-lg whitespace-nowrap ${outOfStock ? 'text-mist line-through decoration-red-400/60' : 'text-brand'}`}>
            {formatPrice(product.price)} تومان
          </span>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-disabled={outOfStock}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              outOfStock
                ? 'bg-line text-mist cursor-not-allowed'
                : 'bg-night text-white hover:bg-brand'
            }`}
          >
            {outOfStock ? 'ناموجود' : 'افزودن'}
          </button>
        </div>
      </div>
    </Link>
  )
}