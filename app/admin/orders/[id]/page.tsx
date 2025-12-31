'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDocument, updateDocument, convertTimestamp } from '@/lib/utils/firestore'
import { Order } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react'

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await getDocument<Order>('orders', orderId)
      if (data) {
        setOrder(data)
        setTrackingNumber(data.trackingNumber || '')
      }
      setIsLoading(false)
    }
    fetchOrder()
  }, [orderId])

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return

    setIsUpdating(true)
    try {
      const updateData: any = { status: newStatus }
      if (newStatus === 'shipped' && trackingNumber) {
        updateData.trackingNumber = trackingNumber
      }
      
      await updateDocument('orders', orderId, updateData)
      setOrder({ ...order, ...updateData })
      toast.success('Order status updated')
    } catch (error) {
      toast.error('Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p>Order not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const orderDate = convertTimestamp(order.createdAt)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="relative w-24 h-24 flex-shrink-0">
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
                      Quantity: {item.quantity} × Rs. {item.product.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      Rs. {(item.product.price * item.quantity).toFixed(2)}
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

        {/* Order Actions */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Management</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Order ID</label>
                <p className="text-sm text-gray-600">#{order.id.split('-')[1]}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <p className="text-sm text-gray-600">{format(orderDate, 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment</label>
                <p className="text-sm text-gray-600 uppercase">{order.paymentMethod}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total</label>
                <p className="text-lg font-bold">Rs. {order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Update Status</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value as Order['status'])}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={isUpdating}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Tracking Number */}
            {order.status === 'shipped' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tracking Number</label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleStatusUpdate('shipped')}
                  isLoading={isUpdating}
                >
                  Update Tracking
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={order.status !== 'pending' || isUpdating}
              >
                <Package size={16} className="mr-2" />
                Confirm Order
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleStatusUpdate('shipped')}
                disabled={!['confirmed', 'processing'].includes(order.status) || isUpdating}
              >
                <Truck size={16} className="mr-2" />
                Mark as Shipped
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleStatusUpdate('delivered')}
                disabled={order.status !== 'shipped' || isUpdating}
              >
                <CheckCircle size={16} className="mr-2" />
                Mark as Delivered
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

