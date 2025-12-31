'use client'

import { useEffect, useState } from 'react'
import { getCollection } from '@/lib/utils/firestore'
import { Order, Product, ProductVariant } from '@/lib/types'
import { convertTimestamp } from '@/lib/utils/firestore'
import { format } from 'date-fns'
import Link from 'next/link'
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Eye, 
  Image as ImageIcon,
  ArrowRight,
  Activity,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalVariants: 0,
    lowStockVariants: 0,
    pendingOrders: 0,
    codOrders: 0,
    totalCustomers: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orders, products, variants, users] = await Promise.all([
          getCollection<Order>('orders'),
          getCollection<Product>('products'),
          getCollection<ProductVariant>('productVariants'),
          getCollection<any>('users'),
        ])

        const totalSales = orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, order) => sum + order.total, 0)

        const lowStockVariants = variants.filter(v => v.stock < 10 && v.active).length
        const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length
        const codOrders = orders.filter(o => o.paymentMethod === 'cod' && o.paymentStatus === 'pending').length
        const totalCustomers = users.filter((u: any) => u.role === 'customer').length

        setStats({
          totalSales,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalVariants: variants.length,
          lowStockVariants,
          pendingOrders,
          codOrders,
          totalCustomers,
        })

        // Get recent orders (last 5)
        const sortedOrders = orders
          .sort((a, b) => {
            const dateA = convertTimestamp(a.createdAt)
            const dateB = convertTimestamp(b.createdAt)
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, 5)
        setRecentOrders(sortedOrders)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Sales',
      value: `Rs. ${stats.totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      href: '/admin/analytics/revenue',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      href: '/admin/orders',
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      href: '/admin/inventory/products',
    },
    {
      title: 'Variants',
      value: stats.totalVariants.toString(),
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      href: '/admin/inventory/variants',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      iconBg: 'bg-pink-100',
      href: '/admin/accounts/customers',
    },
    {
      title: 'Low Stock',
      value: stats.lowStockVariants.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      href: '/admin/inventory/low-stock',
    },
  ]

  const quickActions = [
    { title: 'Add Product', href: '/admin/inventory/products/new', icon: Package, color: 'bg-primary-600' },
    { title: 'View Orders', href: '/admin/orders', icon: ShoppingBag, color: 'bg-green-600' },
    { title: 'Manage Banners', href: '/admin/ads/banners', icon: ImageIcon, color: 'bg-blue-600' },
    { title: 'Analytics', href: '/admin/analytics/sales', icon: TrendingUp, color: 'bg-purple-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics/sales">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              View Reports
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              href={stat.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Alerts & Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-primary-600" />
            Alerts & Notifications
          </h2>
          <div className="space-y-3">
            {stats.pendingOrders > 0 && (
              <Link
                href="/admin/orders/pending"
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="text-yellow-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{stats.pendingOrders} Pending Orders</p>
                    <p className="text-sm text-gray-600">Requires attention</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" size={18} />
              </Link>
            )}
            {stats.codOrders > 0 && (
              <Link
                href="/admin/orders/cod"
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{stats.codOrders} COD Orders</p>
                    <p className="text-sm text-gray-600">Payment pending</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" size={18} />
              </Link>
            )}
            {stats.lowStockVariants > 0 && (
              <Link
                href="/admin/inventory/low-stock"
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{stats.lowStockVariants} Low Stock Items</p>
                    <p className="text-sm text-gray-600">Restock needed</p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" size={18} />
              </Link>
            )}
            {stats.pendingOrders === 0 && stats.codOrders === 0 && stats.lowStockVariants === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                <p>All good! No alerts at this time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <div className={`${action.color} p-3 rounded-lg mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{action.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary-600" />
            Recent Orders
          </h2>
          <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All
            <ArrowRight size={16} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag className="mx-auto text-gray-300 mb-3" size={48} />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const orderDate = convertTimestamp(order.createdAt)
                  const statusColors = {
                    delivered: 'bg-green-100 text-green-800',
                    cancelled: 'bg-red-100 text-red-800',
                    shipped: 'bg-blue-100 text-blue-800',
                    processing: 'bg-yellow-100 text-yellow-800',
                    pending: 'bg-gray-100 text-gray-800',
                    confirmed: 'bg-purple-100 text-purple-800',
                  }
                  return (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          #{order.id.split('-')[1] || order.id.substring(0, 8)}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{order.userId.substring(0, 12)}...</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">Rs. {order.total.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${
                          order.paymentMethod === 'cod' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                          statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {format(orderDate, 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/orders/${order.id}`}>
                          <button className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 transition-colors">
                            <Eye size={18} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
