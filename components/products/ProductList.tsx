'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product, ProductVariant } from '@/lib/types'
import { Star, Heart, Eye, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { getCollection } from '@/lib/utils/firestore'

interface ProductListProps {
  products: Product[]
  onQuickView?: (product: Product) => void
}

export const ProductList: React.FC<ProductListProps> = ({ products, onQuickView }) => {
  const addItem = useCartStore(state => state.addItem)
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set())
  const [variantsMap, setVariantsMap] = useState<Record<string, ProductVariant>>({})

  // Fetch variants for all products
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const variants = await getCollection<ProductVariant>('productVariants')
        const activeVariants = variants.filter(v => v.active && v.stock > 0)
        
        // Create a map of productId -> first variant
        const map: Record<string, ProductVariant> = {}
        products.forEach(product => {
          const productVariants = activeVariants.filter(v => v.productId === product.id)
          if (productVariants.length > 0) {
            map[product.id] = productVariants[0]
          }
        })
        setVariantsMap(map)
      } catch (error) {
        console.error('Error fetching variants:', error)
      }
    }
    fetchVariants()
  }, [products])

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    const variant = variantsMap[product.id]
    if (!variant) {
      toast.error('Please select a variant on the product page')
      return
    }
    addItem(product, variant, 1)
    toast.success('Added to cart!')
  }

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    setWishlisted((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
        toast.success('Removed from wishlist')
      } else {
        next.add(productId)
        toast.success('Added to wishlist')
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const isWishlisted = wishlisted.has(product.id)
        const variant = variantsMap[product.id]
        const displayPrice = variant?.price ?? 0
        const displayOriginalPrice = variant?.originalPrice
        const discountPercentage = displayOriginalPrice && displayOriginalPrice > displayPrice
          ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
          : 0
        const hasPrice = variant !== undefined && displayPrice > 0

        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-64 h-64 md:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <Image
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {discountPercentage > 0 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                    -{discountPercentage}%
                  </div>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      if (onQuickView) onQuickView(product)
                    }}
                    className="p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                    title="Quick View"
                  >
                    <Eye size={16} className="text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => toggleWishlist(product.id, e)}
                    className={`p-2 rounded-full backdrop-blur-sm shadow-lg transition-all ${
                      isWishlisted
                        ? 'bg-red-500 text-white'
                        : 'bg-white/95 text-gray-700 hover:bg-white'
                    }`}
                    title="Wishlist"
                  >
                    <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wide">
                    {product.brand}
                  </p>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-semibold">{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    {hasPrice ? (
                      <>
                        <span className="text-2xl font-bold text-primary-600">Rs. {displayPrice.toLocaleString()}</span>
                        {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                          <span className="text-lg text-gray-400 line-through">
                            Rs. {displayOriginalPrice.toLocaleString()}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-lg text-gray-500">Price on request</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

