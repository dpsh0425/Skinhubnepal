'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product, ProductVariant } from '@/lib/types'
import { Star, Heart, Eye, ShoppingCart, Zap } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { getCollection } from '@/lib/utils/firestore'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  onQuickView?: (product: Product) => void
  priority?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'default',
  onQuickView,
  priority = false
}) => {
  const addItem = useCartStore(state => state.addItem)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [firstVariant, setFirstVariant] = useState<ProductVariant | null>(null)

  // Fetch first variant for price display
  useEffect(() => {
    const fetchVariant = async () => {
      try {
        const variants = await getCollection<ProductVariant>('productVariants')
        const productVariants = variants.filter(
          v => v.productId === product.id && v.active && v.stock > 0
        )
        if (productVariants.length > 0) {
          setFirstVariant(productVariants[0])
        }
      } catch (error) {
        console.error('Error fetching variant:', error)
      }
    }
    fetchVariant()
  }, [product.id])

  // Get price from first variant or show N/A
  const displayPrice = firstVariant?.price ?? 0
  const displayOriginalPrice = firstVariant?.originalPrice
  const hasPrice = firstVariant !== null && displayPrice > 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!firstVariant) {
      toast.error('Please select a variant on the product page')
      return
    }
    addItem(product, firstVariant, 1)
    toast.success('Added to cart!', {
      icon: '🛒',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView) {
      onQuickView(product)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      icon: isWishlisted ? '💔' : '❤️',
    })
  }

  const discountPercentage = displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0

  if (variant === 'compact') {
    return (
      <Link href={`/products/${product.id}`} className="group block">
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200">
          <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            )}
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                -{discountPercentage}%
              </div>
            )}
            <button
              onClick={handleWishlist}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          </div>
          <div className="p-3">
            <p className="text-xs text-gray-500 mb-1 font-medium">{product.brand}</p>
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {hasPrice ? (
                  <>
                    <span className="text-base font-bold text-primary-600">Rs. {displayPrice.toLocaleString()}</span>
                    {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                      <span className="text-xs text-gray-400 line-through ml-1">
                        Rs. {displayOriginalPrice.toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Price on request</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link href={`/products/${product.id}`} className="group block">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
          <div className="relative aspect-square w-full overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            )}
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              className={`object-cover transition-transform duration-700 group-hover:scale-125 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-xl transform rotate-[-5deg]">
                <Zap size={14} className="inline mr-1" />
                {discountPercentage}% OFF
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <button
                onClick={handleQuickView}
                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
                title="Quick View"
              >
                <Eye size={18} className="text-gray-700" />
              </button>
              <button
                onClick={handleWishlist}
                className={`p-2.5 rounded-full backdrop-blur-sm shadow-lg transition-all hover:scale-110 ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/95 text-gray-700 hover:bg-white'
                }`}
                title="Add to Wishlist"
              >
                <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-white text-gray-900 hover:bg-primary-600 hover:text-white shadow-xl"
                size="sm"
              >
                <ShoppingCart size={18} className="mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wide">
              {product.brand}
            </p>
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="ml-1 font-semibold text-sm">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {hasPrice ? (
                  <>
                    <span className="text-2xl font-bold text-primary-600">Rs. {displayPrice.toLocaleString()}</span>
                    {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        Rs. {displayOriginalPrice.toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Price on request</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gray-200" />
          )}
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={priority}
            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              -{discountPercentage}%
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button
              onClick={handleQuickView}
              className="p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
              title="Quick View"
            >
              <Eye size={16} className="text-gray-700" />
            </button>
            <button
              onClick={handleWishlist}
              className={`p-2 rounded-full backdrop-blur-sm shadow-lg transition-all hover:scale-110 ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/95 text-gray-700 hover:bg-white'
              }`}
              title="Add to Wishlist"
            >
              <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
            </button>
          </div>
          {product.bestSeller && (
            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              ⭐ Best Seller
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
            {product.brand}
          </p>
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              {hasPrice ? (
                <>
                  <span className="text-lg font-bold text-primary-600">Rs. {displayPrice.toLocaleString()}</span>
                  {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                    <span className="text-xs text-gray-400 line-through ml-2">
                      Rs. {displayOriginalPrice.toLocaleString()}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-500">Price on request</span>
              )}
            </div>
          </div>
          <Button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="sm"
          >
            <ShoppingCart size={16} className="mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  )
}
