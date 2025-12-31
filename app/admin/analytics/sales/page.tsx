'use client'

import { useEffect, useState } from 'react'
import { getCollection } from '@/lib/utils/firestore'
import { Order, Product, ProductVariant } from '@/lib/types'
import { convertTimestamp } from '@/lib/utils/firestore'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { TrendingUp, DollarSign, ShoppingBag, Package } from 'lucide-react'

export default function SalesReportsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersData, productsData, variantsData] = await Promise.all([
        getCollection<Order>('orders'),
        getCollection<Product>('products'),
        getCollection<ProductVariant>('productVariants'),
      ])
      setOrders(ordersData)
      setProducts(productsData)
      setVariants(variantsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredOrders = () => {
    if (dateRange === 'all') return orders

    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const cutoffDate = subDays(new Date(), days)

    return orders.filter(order => {
      const orderDate = convertTimestamp(order.createdAt)
      return orderDate >= cutoffDate
    })
  }

  const filteredOrders = getFilteredOrders()
  const totalRevenue = filteredOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)
  const totalOrders = filteredOrders.length
  const codRevenue = filteredOrders
    .filter(o => o.paymentMethod === 'cod' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)
  const onlineRevenue = filteredOrders
    .filter(o => o.paymentMethod !== 'cod' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)

  // Best selling products
  const productSales: Record<string, number> = {}
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity
    })
  })

  const bestSellingProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([productId, quantity]) => ({
      product: products.find(p => p.id === productId),
      quantity,
    }))
    .filter(item => item.product)

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={24} />
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold">Rs. {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="text-blue-600" size={24} />
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-yellow-600" size={24} />
            <p className="text-sm text-gray-600">COD Revenue</p>
          </div>
          <p className="text-2xl font-bold">Rs. {codRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-purple-600" size={24} />
            <p className="text-sm text-gray-600">Online Revenue</p>
          </div>
          <p className="text-2xl font-bold">Rs. {onlineRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Best Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bestSellingProducts.map((item, index) => (
                <tr key={item.product?.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-semibold">#{index + 1}</span>
                      <span className="font-medium">{item.product?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{item.quantity} units</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bestSellingProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No sales data available</p>
          </div>
        )}
      </div>
    </div>
  )
}

