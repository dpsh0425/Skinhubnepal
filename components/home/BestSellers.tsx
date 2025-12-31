'use client'

import { useEffect, useState } from 'react'
import { getCollection } from '@/lib/utils/firestore'
import { Product } from '@/lib/types'
import { ProductCard } from '@/components/products/ProductCard'
import { Trophy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getCollection<Product>('products')
      const bestSellers = data
        .filter(p => p.status === 'published' && p.bestSeller)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8)
      setProducts(bestSellers)
    }
    fetchProducts()
  }, [])

  if (products.length === 0) return null

  return (
    <section className="mb-16 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-500" size={32} />
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Best Sellers
            </span>
          </h2>
          <p className="text-gray-600 text-lg">Customer favorites that keep coming back for more</p>
        </div>
        <Link
          href="/products?sortBy=rating"
          className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold group"
        >
          View All
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard product={product} variant="default" />
          </div>
        ))}
      </div>
      <Link
        href="/products?sortBy=rating"
        className="md:hidden mt-6 flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
      >
        View All Best Sellers
        <ArrowRight size={20} />
      </Link>
    </section>
  )
}
