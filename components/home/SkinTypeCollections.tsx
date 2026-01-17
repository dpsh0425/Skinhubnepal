'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCollection } from '@/lib/utils/firestore'
import { Product } from '@/lib/types'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'

const skinTypes = [
  { 
    name: 'Oily Skin', 
    slug: 'oily', 
    gradient: 'from-blue-400 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    icon: '💧'
  },
  { 
    name: 'Dry Skin', 
    slug: 'dry', 
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50',
    icon: '🌿'
  },
  { 
    name: 'Combination', 
    slug: 'combination', 
    gradient: 'from-purple-400 to-indigo-500',
    bgGradient: 'from-purple-50 to-indigo-50',
    icon: '✨'
  },
  { 
    name: 'Sensitive', 
    slug: 'sensitive', 
    gradient: 'from-pink-400 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-50',
    icon: '🌸'
  },
]

export const SkinTypeCollections = () => {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getCollection<Product>('products')
      // Only show published products
      const publishedProducts = data.filter(p => p.status === 'published')
      setProducts(publishedProducts)
    }
    fetchProducts()
  }, [])

  const getProductsBySkinType = (skinType: string) => {
    return products.filter(p => 
      p.skinType.some(type => type.toLowerCase() === skinType.toLowerCase())
    )
  }

  // Only show skin types that have products
  const availableSkinTypes = skinTypes.filter(type => {
    const typeProducts = getProductsBySkinType(type.slug)
    return typeProducts.length > 0
  })

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="text-primary-600" size={32} />
          <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
            Shop by Skin Type
          </span>
        </h2>
        <p className="text-gray-600 text-lg">Find products perfect for your unique skin</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {availableSkinTypes.map((type, index) => {
          const typeProducts = getProductsBySkinType(type.slug)
          const featuredProduct = typeProducts[0]

          return (
            <Link
              key={type.slug}
              href={`/products?skinType=${type.slug}`}
              className={`group relative bg-gradient-to-br ${type.bgGradient} rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {type.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{type.name}</h3>
                {featuredProduct && featuredProduct.images[0] && (
                  <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Image
                      src={featuredProduct.images[0]}
                      alt={featuredProduct.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    {typeProducts.length} {typeProducts.length === 1 ? 'product' : 'products'}
                  </p>
                  <ArrowRight 
                    size={18} 
                    className="text-gray-600 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" 
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
