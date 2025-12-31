'use client'

import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { useCartStore } from '@/lib/store/cartStore'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const router = useRouter()
  const items = useCartStore(state => state.items)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const removeItem = useCartStore(state => state.removeItem)
  const getTotal = useCartStore(state => state.getTotal)
  const clearCart = useCartStore(state => state.clearCart)

  const total = getTotal()
  const shipping = total > 1000 ? 0 : 100 // Free shipping over Rs. 1000
  const finalTotal = total + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-skincare-light">
        <Header />
        <main className="container mx-auto px-4 py-12 pb-24 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link href="/products">
            <Button>Shop Now</Button>
          </Link>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-skincare-light">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-lg shadow p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.product.images[0] || '/placeholder-product.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{item.product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.product.brand}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 py-1 border rounded">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={item.quantity >= item.variant.stock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        Rs. {(item.variant.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={clearCart} className="w-full">
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`}</span>
                </div>
                {total < 1000 && (
                  <p className="text-sm text-primary-600">
                    Add Rs. {(1000 - total).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rs. {finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

