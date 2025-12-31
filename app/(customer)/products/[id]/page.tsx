'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { StickyCart } from '@/components/layout/StickyCart'
import { ProductCard } from '@/components/products/ProductCard'
import { Product, ProductVariant, Review } from '@/lib/types'
import { getDocument, getCollection, updateDocument } from '@/lib/utils/firestore'
import { useCartStore } from '@/lib/store/cartStore'
import { Button } from '@/components/ui/Button'
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, Check, Truck, Shield, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { AmazonVariantSelector } from '@/components/products/AmazonVariantSelector'
import { AboutThisProduct } from '@/components/products/AboutThisProduct'
import { ProductDescription } from '@/components/products/ProductDescription'
import { ProductInformation } from '@/components/products/ProductInformation'
import { IngredientsAndUsage } from '@/components/products/IngredientsAndUsage'
import { ProductReviews } from '@/components/products/ProductReviews'
import toast from 'react-hot-toast'

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [imageZoom, setImageZoom] = useState(false)
  const addItem = useCartStore(state => state.addItem)

  useEffect(() => {
    const fetchData = async () => {
      const [productData, variantsData, allProducts] = await Promise.all([
        getDocument<Product>('products', productId),
        getCollection<ProductVariant>('productVariants'),
        getCollection<Product>('products'),
      ])
      
      if (productData) {
        setProduct(productData)
        // Get related products: manual links first, then same category/brand
        let related: Product[] = []
        
        // Check for manually linked products
        if (productData.relatedProductIds && productData.relatedProductIds.length > 0) {
          const manualRelated = allProducts.filter(p => 
            productData.relatedProductIds!.includes(p.id) && p.status === 'published'
          )
          related.push(...manualRelated)
        }
        
        // Add similar products (same category or brand) if not already included
        const similar = allProducts
          .filter(p => 
            p.id !== productId && 
            p.status === 'published' &&
            !related.find(r => r.id === p.id) &&
            (p.category === productData.category || p.brand === productData.brand)
          )
          .slice(0, 8 - related.length)
        related.push(...similar)
        
        setRelatedProducts(related.slice(0, 8))
      }
      
      const productVariants = variantsData.filter(v => v.productId === productId && v.active)
      setVariants(productVariants)
      
      if (productVariants.length > 0) {
        setSelectedVariant(productVariants[0])
      }
    }
    fetchData()
  }, [productId])

  const fetchReviews = async () => {
    const data = await getCollection<Review>('reviews')
    const productReviews = data.filter(r => r.productId === productId)
    setReviews(productReviews)
    
    // Update product rating based on reviews
    if (productReviews.length > 0) {
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      await updateDocument('products', productId, {
        rating: avgRating,
        reviewCount: productReviews.length,
      })
    } else if (product) {
      // Reset rating if no reviews
      await updateDocument('products', productId, {
        rating: 0,
        reviewCount: 0,
      })
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId, product])

  useEffect(() => {
    if (selectedVariant) {
      setSelectedImageIndex(0)
    }
  }, [selectedVariant])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    )
  }

  const currentImages = selectedVariant?.images.length 
    ? selectedVariant.images 
    : product.images

  // Products don't have price/stock directly - only variants do
  // If no variants exist, we need to handle this case
  const currentPrice = selectedVariant?.price ?? 0
  const currentOriginalPrice = selectedVariant?.originalPrice
  const currentStock = selectedVariant?.stock ?? 0

  const discountPercentage = currentOriginalPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    if (variants.length > 0) {
      if (!selectedVariant) {
        toast.error('Please select a variant')
        return
      }
      if (currentStock < quantity) {
        toast.error('Insufficient stock')
        return
      }
      if (currentStock === 0) {
        toast.error('This variant is out of stock')
        return
      }
      addItem(product, selectedVariant, quantity)
    } else {
      toast.error('This product is not available. Please contact us for availability.')
      return
    }
    toast.success('Added to cart!', {
      icon: '🛒',
    })
  }

  const handleBuyNow = () => {
    if (variants.length > 0) {
      if (!selectedVariant) {
        toast.error('Please select a variant')
        return
      }
      if (currentStock < quantity) {
        toast.error('Insufficient stock')
        return
      }
      if (currentStock === 0) {
        toast.error('This variant is out of stock')
        return
      }
      addItem(product, selectedVariant, quantity)
      router.push('/checkout')
    } else {
      toast.error('This product is not available. Please contact us for availability.')
    }
  }

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    setQuantity(1)
    setSelectedImageIndex(0) // Reset to first image when variant changes
  }

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent zoom toggle
    if (currentImages.length > 0) {
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : currentImages.length - 1))
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent zoom toggle
    if (currentImages.length > 0) {
      setSelectedImageIndex((prev) => (prev < currentImages.length - 1 ? prev + 1 : 0))
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div 
              className="relative aspect-square w-full bg-white rounded-3xl overflow-hidden shadow-xl cursor-zoom-in group"
              onClick={() => setImageZoom(!imageZoom)}
            >
              <Image
                src={currentImages[selectedImageIndex] || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover transition-transform duration-300 ${
                  imageZoom ? 'scale-150' : 'scale-100'
                }`}
              />
              
              {/* Amazon-style Navigation Buttons */}
              {currentImages.length > 1 && (
                <>
                  {/* Left Arrow Button */}
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white active:bg-white rounded-full p-2 md:p-3 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} className="md:w-6 md:h-6 text-gray-800" />
                  </button>
                  
                  {/* Right Arrow Button */}
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white active:bg-white rounded-full p-2 md:p-3 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} className="md:w-6 md:h-6 text-gray-800" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-medium px-2 md:px-3 py-1 md:py-1.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-10">
                    {selectedImageIndex + 1} / {currentImages.length}
                  </div>
                </>
              )}
              
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-xl z-10">
                  <Zap size={16} className="inline mr-1" />
                  {discountPercentage}% OFF
                </div>
              )}
              {product.bestSeller && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                  ⭐ Best Seller
                </div>
              )}
            </div>
            {currentImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-3 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary-600 scale-105 shadow-lg'
                        : 'border-gray-200 hover:border-primary-400'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, (max-width: 1200px) 12.5vw, 8vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">
                {product.brand}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                  <span className="ml-2 font-semibold text-lg">{averageRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Amazon-like Variant Selector */}
            {variants.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Select Variant</h3>
                <AmazonVariantSelector
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onSelect={handleVariantSelect}
                />
              </div>
            )}

            {/* Price */}
            {variants.length > 0 ? (
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-primary-600">
                  Rs. {currentPrice > 0 ? currentPrice.toLocaleString() : 'N/A'}
                </span>
                {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      Rs. {currentOriginalPrice.toLocaleString()}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      Save Rs. {(currentOriginalPrice - currentPrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-800 font-medium">
                  ⚠️ This product requires variant selection. Please contact us for pricing.
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm">
                <Truck className="text-primary-600" size={20} />
                <span className="text-sm font-medium">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm">
                <Shield className="text-primary-600" size={20} />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm">
                <Check className="text-primary-600" size={20} />
                <span className="text-sm font-medium">Authentic</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
              <span className="font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 rounded-l-xl transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={20} />
                </button>
                <span className="px-6 py-2 min-w-[3rem] text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2 hover:bg-gray-100 rounded-r-xl transition-colors"
                  disabled={quantity >= currentStock}
                >
                  <Plus size={20} />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                (Max: {currentStock})
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl text-lg py-6"
                disabled={variants.length > 0 && (currentStock === 0 || !selectedVariant)}
              >
                <ShoppingCart size={22} className="mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="flex-1 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 text-lg py-6"
                disabled={variants.length > 0 && (currentStock === 0 || !selectedVariant)}
              >
                Buy Now
              </Button>
              <button
                onClick={() => {
                  setIsWishlisted(!isWishlisted)
                  toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isWishlisted
                    ? 'bg-red-50 border-red-500 text-red-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                }`}
              >
                <Heart size={24} className={isWishlisted ? 'fill-current' : ''} />
              </button>
              <button
                onClick={() => {
                  navigator.share?.({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied to clipboard!')
                  })
                }}
                className="p-4 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <Share2 size={24} />
              </button>
            </div>

          </div>
        </div>

        {/* Amazon-like Product Details Sections */}
        <div className="mt-12 space-y-6">
          {/* About This Product */}
          {product.aboutThisProduct && product.aboutThisProduct.length > 0 && (
            <AboutThisProduct bullets={product.aboutThisProduct} />
          )}

          {/* Product Description */}
          <ProductDescription description={product.description} />

          {/* Product Information Table */}
          {product.productInformation && Object.keys(product.productInformation).length > 0 && (
            <ProductInformation information={product.productInformation} />
          )}

          {/* Ingredients & Usage (Tabbed) */}
          {(product.ingredients.length > 0 || product.usageInstructions) && (
            <IngredientsAndUsage
              ingredients={product.ingredients}
              usageInstructions={product.usageInstructions}
            />
          )}

          {/* Reviews Section */}
          <ProductReviews
            productId={productId}
            reviews={reviews}
            averageRating={averageRating}
            totalReviews={reviews.length}
            onReviewUpdate={fetchReviews}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
      <StickyCart />
    </div>
  )
}
