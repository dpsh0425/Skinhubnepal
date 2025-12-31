'use client'

import { useEffect, useState } from 'react'
import { getCollection, convertTimestamp } from '@/lib/utils/firestore'
import { Order } from '@/lib/types'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function DeliveredOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await getCollection<Order>('orders')
      const delivered = data.filter((o) => o.status === 'delivered')
      const sorted = delivered.sort((a, b) => {
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
          <CheckCircle className="text-green-600" size={32} />
          Delivered Orders
        </h1>
        <p className="text-gray-600 mt-1">Successfully delivered orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="text-gray-400 mx-auto mb-4" size={48} />
          <p className="text-lg font-semibold text-gray-600">No delivered orders yet</p>
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

