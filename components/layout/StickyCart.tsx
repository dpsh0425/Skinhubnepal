'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/store/cartStore'
import { ShoppingCart } from 'lucide-react'

export const StickyCart = () => {
  const itemCount = useCartStore(state => state.getItemCount())
  const total = useCartStore(state => state.getTotal())

  if (itemCount === 0) return null

  return (
    <Link
      href="/cart"
      className="fixed bottom-20 right-4 md:bottom-4 bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 hover:bg-primary-700 transition-colors z-40"
    >
      <ShoppingCart size={20} />
      <div className="flex flex-col">
        <span className="text-xs">{itemCount} items</span>
        <span className="font-semibold">Rs. {total.toFixed(2)}</span>
      </div>
    </Link>
  )
}

