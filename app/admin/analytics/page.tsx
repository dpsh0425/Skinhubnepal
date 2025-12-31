'use client'

import { useEffect, useState } from 'react'
import { getCollection } from '@/lib/utils/firestore'
import { Order, Product } from '@/lib/types'
import { convertTimestamp } from '@/lib/utils/firestore'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { TrendingUp, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    weekSales: 0,
    weekOrders: 0,
    monthSales: 0,
    monthOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  })
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [orders, products] = await Promise.all([
          getCollection<Order>('orders'),
          getCollection<Product>('products'),
        ])

        const now = new Date()
        const todayStart = startOfDay(now)
        const weekStart = startOfDay(subDays(now, 7))
        const monthStart = startOfDay(subDays(now, 30))

        const todayOrders = orders.filter((o) => {
          const orderDate = convertTimestamp(o.createdAt)
          return orderDate >= todayStart && o.status !== 'cancelled'
        })

        const weekOrders = orders.filter((o) => {
          const orderDate = convertTimestamp(o.createdAt)
          return orderDate >= weekStart && o.status !== 'cancelled'
        })

        const monthOrders = orders.filter((o) => {
          const orderDate = convertTimestamp(o.createdAt)
          return orderDate >= monthStart && o.status !== 'cancelled'
        })

        const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0)
        const weekSales = weekOrders.reduce((sum, o) => sum + o.total, 0)
        const monthSales = monthOrders.reduce((sum, o) => sum + o.total, 0)

        const allSales = orders.filter((o) => o.status !== 'cancelled')
        const totalSales = allSales.reduce((sum, o) => sum + o.total, 0)
        const averageOrderValue = allSales.length > 0 ? totalSales / allSales.length : 0

        // Get unique customers
        const uniqueCustomers = new Set(orders.map((o) => o.userId))

        // Calculate top products
        const productSales: Record<string, { product: Product; quantity: number; revenue: number }> = {}
        orders.forEach((order) => {
          if (order.status !== 'cancelled') {
            order.items.forEach((item) => {
              if (!productSales[item.productId]) {
                productSales[item.productId] = {
                  product: item.product,
                  quantity: 0,
                  revenue: 0,
                }
              }
              productSales[item.productId].quantity += item.quantity
              productSales[item.productId].revenue += item.variant.price * item.quantity
            })
          }
        })

        const topProductsList = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)

        setStats({
          todaySales,
          todayOrders: todayOrders.length,
          weekSales,
          weekOrders: weekOrders.length,
          monthSales,
          monthOrders: monthOrders.length,
          totalCustomers: uniqueCustomers.size,
          averageOrderValue,
        })
        setTopProducts(topProductsList)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return <div className="text-center py-12">Loading analytics...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      {/* Time Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Today</h3>
            <DollarSign className="text-green-600" size={24} />
          </div>
          <p className="text-2xl font-bold">Rs. {stats.todaySales.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.todayOrders} orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">This Week</h3>
            <TrendingUp className="text-blue-600" size={24} />
          </div>
          <p className="text-2xl font-bold">Rs. {stats.weekSales.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.weekOrders} orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">This Month</h3>
            <ShoppingCart className="text-purple-600" size={24} />
          </div>
          <p className="text-2xl font-bold">Rs. {stats.monthSales.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.monthOrders} orders</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Total Customers</h3>
            <Users className="text-indigo-600" size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalCustomers}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Average Order Value</h3>
            <Package className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-bold">Rs. {stats.averageOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
        {topProducts.length === 0 ? (
          <p className="text-gray-500">No sales data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>
                  <th className="text-left py-2">Quantity Sold</th>
                  <th className="text-left py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((item, index) => (
                  <tr key={item.product.id} className="border-b">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-400">#{index + 1}</span>
                        <span>{item.product.name}</span>
                      </div>
                    </td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2 font-semibold">Rs. {item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

