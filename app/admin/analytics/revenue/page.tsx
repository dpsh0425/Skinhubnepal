'use client'

import { useEffect, useState } from 'react'
import { getCollection } from '@/lib/utils/firestore'
import { Order } from '@/lib/types'
import { convertTimestamp } from '@/lib/utils/firestore'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

export default function RevenueAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await getCollection<Order>('orders')
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredOrders = () => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const startDate = subDays(new Date(), days)
    
    return orders.filter(order => {
      const orderDate = convertTimestamp(order.createdAt)
      return orderDate >= startDate && order.status !== 'cancelled'
    })
  }

  const filteredOrders = getFilteredOrders()
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
  const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0

  // Calculate daily revenue
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const startDate = subDays(new Date(), days)
  const dateRange = eachDayOfInterval({ start: startDate, end: new Date() })
  
  const dailyRevenue = dateRange.map(date => {
    const dayOrders = filteredOrders.filter(order => {
      const orderDate = convertTimestamp(order.createdAt)
      return format(orderDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })
    return {
      date: format(date, 'MMM dd'),
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
    }
  })

  // Payment method breakdown
  const paymentBreakdown = {
    cod: filteredOrders.filter(o => o.paymentMethod === 'cod').reduce((sum, o) => sum + o.total, 0),
    esewa: filteredOrders.filter(o => o.paymentMethod === 'esewa').reduce((sum, o) => sum + o.total, 0),
    khalti: filteredOrders.filter(o => o.paymentMethod === 'khalti').reduce((sum, o) => sum + o.total, 0),
    fonepay: filteredOrders.filter(o => o.paymentMethod === 'fonepay').reduce((sum, o) => sum + o.total, 0),
  }

  const totalPaymentMethods = Object.values(paymentBreakdown).reduce((sum, val) => sum + val, 0)

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Revenue Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={24} />
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold">Rs. {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-600" size={24} />
            <p className="text-sm text-gray-600">Average Order Value</p>
          </div>
          <p className="text-3xl font-bold">Rs. {averageOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-purple-600" size={24} />
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <p className="text-3xl font-bold">{filteredOrders.length}</p>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method Breakdown</h2>
        <div className="space-y-4">
          {Object.entries(paymentBreakdown).map(([method, revenue]) => {
            const percentage = totalPaymentMethods > 0 ? (revenue / totalPaymentMethods) * 100 : 0
            return (
              <div key={method}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium capitalize">{method}</span>
                  <span className="font-semibold">Rs. {revenue.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Daily Revenue Trend</h2>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-2 h-64">
            {dailyRevenue.map((day, index) => {
              const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue))
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full bg-primary-600 rounded-t hover:bg-primary-700 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: Rs. ${day.revenue.toFixed(2)}`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {day.date}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

