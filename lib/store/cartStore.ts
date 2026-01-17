import { create } from 'zustand'
import { CartItem, Product, ProductVariant } from '../types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

// Initialize cart from localStorage only on client side
const getInitialItems = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('skinhub-cart')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: getInitialItems(),
  addItem: (product, variant, quantity = 1) => {
    const items = get().items
    const existingItem = items.find(item => item.variantId === variant.id)

    let newItems: CartItem[]
    if (existingItem) {
      newItems = items.map(item =>
        item.variantId === variant.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      newItems = [...items, { 
        productId: product.id, 
        variantId: variant.id,
        product, 
        variant,
        quantity 
      }]
    }
    
    set({ items: newItems })
    if (typeof window !== 'undefined') {
      localStorage.setItem('skinhub-cart', JSON.stringify(newItems))
    }
  },
  removeItem: (variantId) => {
    const newItems = get().items.filter(item => item.variantId !== variantId)
    set({ items: newItems })
    if (typeof window !== 'undefined') {
      localStorage.setItem('skinhub-cart', JSON.stringify(newItems))
    }
  },
  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(variantId)
      return
    }
    const newItems = get().items.map(item =>
      item.variantId === variantId ? { ...item, quantity } : item
    )
    set({ items: newItems })
    if (typeof window !== 'undefined') {
      localStorage.setItem('skinhub-cart', JSON.stringify(newItems))
    }
  },
  clearCart: () => {
    set({ items: [] })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('skinhub-cart')
    }
  },
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.variant.price * item.quantity,
      0
    )
  },
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
}))

