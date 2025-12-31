'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuthInstance } from '@/lib/firebase/config'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Order } from '@/lib/types'
import { getDocument, convertTimestamp, updateDocument } from '@/lib/utils/firestore'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const auth = getAuthInstance()
  const [user] = useAuthState(mounted && auth ? (auth as any) : undefined)
  const orderId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchOrder = async () => {
      const data = await getDocument<Order>('orders', orderId)
      if (data && data.userId === user.uid) {
        setOrder(data)
      } else {
        router.push('/orders')
      }
      setIsLoading(false)
    }

    fetchOrder()
  }, [orderId, user, router])

  const handleCancelOrder = async () => {
    if (!order) return

    if (!['pending', 'confirmed'].includes(order.status)) {
      toast.error('This order cannot be cancelled')
      return
    }

    if (!confirm('Are you sure you want to cancel this order?')) {
      return
    }

    setIsCancelling(true)
    try {
      await updateDocument('orders', orderId, {
        status: 'cancelled',
      })
      toast.success('Order cancelled successfully')
      setOrder({ ...order, status: 'cancelled' })
    } catch (error) {
      toast.error('Failed to cancel order')
      console.error(error)
    } finally {
      setIsCancelling(false)
    }
  }

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const orderDate = convertTimestamp(order.createdAt)

  return (
    <div className="min-h-screen bg-skincare-light">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:underline mb-4"
          >
            ← Back to Orders
          </button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.product.images[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">{item.product.brand}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} × Rs. {item.variant.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        Rs. {(item.variant.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
              <div className="text-gray-700">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.phone}</p>
                <p className="mt-2">
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.district}
                  <br />
                  {order.shippingAddress.postalCode}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Order ID</span>
                  <span className="text-sm">#{order.id.split('-')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="text-sm">{format(orderDate, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-semibold capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span className="font-semibold uppercase">{order.paymentMethod}</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span>Tracking</span>
                    <span className="text-sm">{order.trackingNumber}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rs. {order.total.toFixed(2)}</span>
                </div>
              </div>

              {['pending', 'confirmed'].includes(order.status) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelOrder}
                  isLoading={isCancelling}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

