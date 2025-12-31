'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCollection, updateDocument } from '@/lib/utils/firestore'
import { Order } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { convertTimestamp } from '@/lib/utils/firestore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { DollarSign, ArrowLeft } from 'lucide-react'

export default function CODOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await getCollection<Order>('orders')
      const codOrders = data
        .filter(o => o.paymentMethod === 'cod')
        .sort((a, b) => {
          const dateA = convertTimestamp(a.createdAt)
          const dateB = convertTimestamp(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })
      setOrders(codOrders)
    } catch (error) {
      console.error('Error fetching COD orders:', error)
      toast.error('Failed to load COD orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentStatusUpdate = async (orderId: string, status: 'pending' | 'paid') => {
    try {
      await updateDocument('orders', orderId, {
        paymentStatus: status,
        updatedAt: new Date(),
      })
      toast.success('Payment status updated')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update payment status')
    }
  }

  const totalCOD = orders.reduce((sum, o) => sum + o.total, 0)
  const pendingCOD = orders
    .filter(o => o.paymentStatus === 'pending')
    .reduce((sum, o) => sum + o.total, 0)

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">COD Orders</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total COD Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total COD Amount</p>
          <p className="text-2xl font-bold text-primary-600">Rs. {totalCOD.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Pending Collection</p>
          <p className="text-2xl font-bold text-yellow-600">Rs. {pendingCOD.toFixed(2)}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
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
                        className="text-primary-600 hover:underline font-mono text-sm"
                      >
                        #{order.id.split('-')[1] || order.id.substring(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.userId}</td>
                    <td className="px-6 py-4 font-semibold">Rs. {order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          handlePaymentStatusUpdate(
                            order.id,
                            e.target.value as 'pending' | 'paid'
                          )
                        }
                        className="px-3 py-1 border rounded-lg text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{format(orderDate, 'MMM dd, yyyy')}</td>
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
        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No COD orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}

