'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Product, ProductVariant } from '@/lib/types'
import { X, Star, ShoppingCart, Heart, Minus, Plus, Zap } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { Button } from '@/components/ui/Button'
import { getCollection } from '@/lib/utils/firestore'
import toast from 'react-hot-toast'

interface ProductQuickViewProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [firstVariant, setFirstVariant] = useState<ProductVariant | null>(null)
  const addItem = useCartStore(state => state.addItem)

  // Fetch first variant for price display
  useEffect(() => {
    if (!product) return
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
  }, [product?.id])

  useEffect(() => {
    if (isOpen && product) {
      setSelectedImageIndex(0)
      setQuantity(1)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, product])

  if (!product || !isOpen) return null

  const handleAddToCart = () => {
    if (!firstVariant) {
      toast.error('Please select a variant on the product page')
      return
    }
    addItem(product, firstVariant, quantity)
    toast.success(`Added ${quantity} item(s) to cart!`, {
      icon: '🛒',
    })
  }

  const displayPrice = firstVariant?.price ?? 0
  const displayOriginalPrice = firstVariant?.originalPrice
  const discountPercentage = displayOriginalPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden">
              <Image
                src={product.images[selectedImageIndex] || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-xl">
                  <Zap size={14} className="inline mr-1" />
                  {discountPercentage}% OFF
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary-600 scale-105'
                        : 'border-gray-200 hover:border-primary-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wide">
                {product.brand}
              </p>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  <Star size={18} className="fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {firstVariant ? (
                <>
                  <span className="text-3xl font-bold text-primary-600">
                    Rs. {displayPrice.toLocaleString()}
                  </span>
                  {displayOriginalPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      Rs. {displayOriginalPrice.toLocaleString()}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-lg text-gray-500">Price not available</span>
              )}
            </div>

            <div className="border-t border-b py-4 space-y-2">
              <div>
                <span className="font-semibold">Skin Type:</span>{' '}
                <span className="text-gray-600">{product.skinType.join(', ')}</span>
              </div>
              <div>
                <span className="font-semibold">Category:</span>{' '}
                <span className="text-gray-600">{product.category}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 rounded-l-xl transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 py-2 min-w-[3rem] text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100 rounded-r-xl transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg"
              >
                <ShoppingCart size={20} className="mr-2" />
                Add to Cart
              </Button>
              <button
                onClick={() => {
                  setIsWishlisted(!isWishlisted)
                  toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
                }}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isWishlisted
                    ? 'bg-red-50 border-red-500 text-red-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                }`}
              >
                <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Description */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm line-clamp-3">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

