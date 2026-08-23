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
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
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
    <Link href={`/products/${product.slug}`} className="card overflow-hidden group block">
      <div className="relative aspect-square overflow-hidden bg-fog">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.category && (
          <span className="absolute top-3 right-3 bg-night/85 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-night mb-2 group-hover:text-brand transition-colors line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="text-brand font-bold text-lg whitespace-nowrap">
            {formatPrice(product.price)} تومان
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-night text-white px-4 py-2 rounded-lg text-sm hover:bg-brand transition-colors"
          >
            افزودن
          </button>
        </div>
      </div>
    </Link>
  )
}