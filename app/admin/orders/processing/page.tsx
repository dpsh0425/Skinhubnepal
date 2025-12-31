'use client'

import { useEffect, useState } from 'react'
import { getCollection, convertTimestamp } from '@/lib/utils/firestore'
import { Order } from '@/lib/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Package } from 'lucide-react'

export default function ProcessingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await getCollection<Order>('orders')
      const processing = data.filter((o) => o.status === 'processing' || o.status === 'confirmed')
      const sorted = processing.sort((a, b) => {
        const dateA = convertTimestamp(a.createdAt)
        const dateB = convertTimestamp(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
      setOrders(sorted)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="text-blue-600" size={32} />
          Processing Orders
        </h1>
        <p className="text-gray-600 mt-1">Orders being prepared for shipment</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="text-gray-400 mx-auto mb-4" size={48} />
          <p className="text-lg font-semibold text-gray-600">No processing orders</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const orderDate = convertTimestamp(order.createdAt)
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-primary-600 hover:underline font-medium"
                        >
                          #{order.id.split('-')[1]}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{order.userId.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-semibold">Rs. {order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{format(orderDate, 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

