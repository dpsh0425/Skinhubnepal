'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export const dynamic = 'force-dynamic'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Order } from '@/lib/types'
import { getCollection, convertTimestamp } from '@/lib/utils/firestore'
import { query, where } from 'firebase/firestore'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (loading) return
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchOrders = async () => {
      try {
        const { where } = await import('firebase/firestore')
        const data = await getCollection<Order>('orders', [
          where('userId', '==', user.uid),
        ])
        // Sort by created date (newest first)
        const sortedOrders = data.sort((a, b) => {
          const dateA = convertTimestamp(a.createdAt)
          const dateB = convertTimestamp(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })
        setOrders(sortedOrders)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user, router, loading])

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect handled in useEffect, but show loading if no user
  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="text-green-600" />
      case 'cancelled':
        return <XCircle className="text-red-600" />
      case 'shipped':
        return <Truck className="text-blue-600" />
      default:
        return <Package className="text-gray-600" />
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-skincare-light">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <Link href="/products">
              <Button>Shop Now</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderDate = convertTimestamp(order.createdAt)
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold">Order #{order.id.split('-')[1]}</p>
                        <p className="text-sm text-gray-500">
                          {format(orderDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">Rs. {order.total.toFixed(2)}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} •{' '}
                      {order.paymentMethod.toUpperCase()} •{' '}
                      {order.shippingAddress.city}, {order.shippingAddress.district}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}

