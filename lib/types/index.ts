export interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'admin'
  phone?: string
  addresses?: Address[]
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  name: string
  phone: string
  street: string
  city: string
  district: string
  postalCode: string
  isDefault: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  images: string[] // Default/Common images (Image URLs)
  brand: string
  category: string
  skinType: string[]
  ingredients: string[]
  usageInstructions: string
  rating: number
  reviewCount: number
  featured: boolean
  bestSeller: boolean
  status: 'draft' | 'published'
  tags: string[]
  // Amazon-like product details
  aboutThisProduct?: string[] // Bullet points for "About This Product"
  productInformation?: Record<string, string> // Key-value pairs for product info table
  relatedProductIds?: string[] // Manual related product links
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  attributes: Record<string, string> // e.g., { size: '50ml', type: 'Normal' }
  price: number
  originalPrice?: number
  stock: number
  images: string[] // Variant-specific images (Image URLs)
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  productId: string
  variantId: string
  product: Product
  variant: ProductVariant
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  shippingAddress: Address
  paymentMethod: 'esewa' | 'khalti' | 'fonepay' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed'
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface Banner {
  id: string
  title: string
  image: string // Image URL
  link?: string
  active: boolean
  order: number
  createdAt: Date
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  photos?: string[] // Review photos (Image URLs)
  verified?: boolean // Verified purchase badge
  createdAt: Date
  updatedAt?: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
}

export interface Brand {
  id: string
  name: string
  logo?: string
}

export interface Coupon {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minPurchase?: number
  maxDiscount?: number
  validFrom: Date
  validUntil: Date
  active: boolean
  usageLimit?: number
  usedCount: number
}

export interface Promotion {
  id: string
  title: string
  description: string
  type: 'flash_sale' | 'banner' | 'category'
  discount?: number
  startDate: Date
  endDate: Date
  active: boolean
  productIds?: string[]
  categoryIds?: string[]
  image?: string
}

export interface StoreSettings {
  id: string
  codEnabled: boolean
  codMinimumOrder: number
  deliveryCharges: number
  freeDeliveryThreshold: number
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  updatedAt: Date
}

export interface OrderNote {
  id: string
  orderId: string
  note: string
  createdBy: string
  createdAt: Date
}

export interface ActivityLog {
  id: string
  action: string
  entityType: string
  entityId: string
  userId: string
  userName: string
  details: Record<string, any>
  createdAt: Date
}

