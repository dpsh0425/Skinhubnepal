'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  X, 
  Package, 
  ShoppingBag, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Plus,
  Database,
  FolderOpen,
  Tag,
  AlertCircle,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Megaphone,
  Ticket,
  CreditCard,
  UserCog,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react'
import { getCollection } from '@/lib/utils/firestore'
import { Product, Order, User } from '@/lib/types'

interface SearchResult {
  type: 'product' | 'order' | 'customer' | 'page'
  id: string
  title: string
  subtitle?: string
  href: string
  icon: any
  description?: string
}

// All menu items for quick access
const allMenuItems: SearchResult[] = [
  // Dashboard
  { type: 'page', id: 'dashboard', title: 'Dashboard', href: '/admin', icon: LayoutDashboard, description: 'Main dashboard' },
  
  // Inventory
  { type: 'page', id: 'products', title: 'Products', href: '/admin/inventory/products', icon: Package, description: 'View and manage all products' },
  { type: 'page', id: 'categories', title: 'Categories', href: '/admin/inventory/categories', icon: FolderOpen, description: 'Product categories' },
  { type: 'page', id: 'brands', title: 'Brands', href: '/admin/inventory/brands', icon: Tag, description: 'Product brands' },
  { type: 'page', id: 'stock', title: 'Stock Management', href: '/admin/inventory/stock', icon: AlertCircle, description: 'Manage inventory' },
  { type: 'page', id: 'low-stock', title: 'Low Stock Alerts', href: '/admin/inventory/low-stock', icon: AlertCircle, description: 'Restock alerts' },
  
  // Orders
  { type: 'page', id: 'orders', title: 'All Orders', href: '/admin/orders', icon: FileText, description: 'View all orders' },
  { type: 'page', id: 'pending-orders', title: 'Pending Orders', href: '/admin/orders/pending', icon: Clock, description: 'Pending orders' },
  { type: 'page', id: 'processing-orders', title: 'Processing Orders', href: '/admin/orders/processing', icon: Package, description: 'In processing' },
  { type: 'page', id: 'shipped-orders', title: 'Shipped Orders', href: '/admin/orders/shipped', icon: Truck, description: 'Shipped orders' },
  { type: 'page', id: 'delivered-orders', title: 'Delivered Orders', href: '/admin/orders/delivered', icon: CheckCircle, description: 'Delivered orders' },
  { type: 'page', id: 'cancelled-orders', title: 'Cancelled Orders', href: '/admin/orders/cancelled', icon: XCircle, description: 'Cancelled orders' },
  { type: 'page', id: 'cod-orders', title: 'COD Orders', href: '/admin/orders/cod', icon: DollarSign, description: 'Cash on delivery' },
  
  // Ads & Settings
  { type: 'page', id: 'banners', title: 'Banners', href: '/admin/ads/banners', icon: Settings, description: 'Homepage banners' },
  { type: 'page', id: 'promotions', title: 'Promotions', href: '/admin/ads/promotions', icon: Megaphone, description: 'Sales promotions' },
  { type: 'page', id: 'coupons', title: 'Coupons', href: '/admin/ads/coupons', icon: Ticket, description: 'Discount codes' },
  { type: 'page', id: 'store-settings', title: 'Store Settings', href: '/admin/settings/store', icon: Settings, description: 'Store configuration' },
  { type: 'page', id: 'payment-settings', title: 'Payment Settings', href: '/admin/settings/payment', icon: CreditCard, description: 'Payment methods' },
  { type: 'page', id: 'shipping-settings', title: 'Shipping Settings', href: '/admin/settings/shipping', icon: Truck, description: 'Delivery options' },
  { type: 'page', id: 'cms', title: 'CMS Pages', href: '/admin/settings/cms', icon: FileText, description: 'Content pages' },
  
  // Analytics & Accounts
  { type: 'page', id: 'analytics', title: 'Analytics Dashboard', href: '/admin/analytics', icon: BarChart3, description: 'Main dashboard' },
  { type: 'page', id: 'sales-reports', title: 'Sales Reports', href: '/admin/analytics/sales', icon: TrendingUp, description: 'Sales analytics' },
  { type: 'page', id: 'revenue', title: 'Revenue Analytics', href: '/admin/analytics/revenue', icon: DollarSign, description: 'Revenue insights' },
  { type: 'page', id: 'customers', title: 'Customers', href: '/admin/accounts/customers', icon: Users, description: 'Customer management' },
  { type: 'page', id: 'admins', title: 'Admin Accounts', href: '/admin/accounts/admins', icon: UserCog, description: 'Admin users' },
  { type: 'page', id: 'logs', title: 'Activity Logs', href: '/admin/accounts/logs', icon: FileText, description: 'System logs' },
]

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults(allMenuItems.slice(0, 8)) // Show first 8 quick access items
      return
    }

    const search = async () => {
      setIsSearching(true)
      const searchTerm = query.toLowerCase()
      const searchResults: SearchResult[] = []

      // Search menu items first
      const matchingMenuItems = allMenuItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.href.toLowerCase().includes(searchTerm)
      )
      searchResults.push(...matchingMenuItems)

      try {
        // Search products
        const products = await getCollection<Product>('products')
        products
          .filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
          )
          .slice(0, 5)
          .forEach(p => {
            searchResults.push({
              type: 'product',
              id: p.id,
              title: p.name,
              subtitle: `${p.brand} • ${p.category}`,
              href: `/admin/inventory/products/${p.id}`,
              icon: Package,
              description: 'Product',
            })
          })

        // Search orders
        const orders = await getCollection<Order>('orders')
        orders
          .filter(o => o.id.toLowerCase().includes(searchTerm))
          .slice(0, 3)
          .forEach(o => {
            searchResults.push({
              type: 'order',
              id: o.id,
              title: `Order #${o.id.split('-')[1] || o.id.substring(0, 8)}`,
              subtitle: `Rs. ${o.total.toFixed(2)} • ${o.status}`,
              href: `/admin/orders/${o.id}`,
              icon: ShoppingBag,
              description: 'Order',
            })
          })

        // Search customers
        const users = await getCollection<User>('users')
        users
          .filter(u => 
            u.role === 'customer' &&
            (u.name.toLowerCase().includes(searchTerm) ||
            u.email.toLowerCase().includes(searchTerm))
          )
          .slice(0, 3)
          .forEach(u => {
            searchResults.push({
              type: 'customer',
              id: u.id,
              title: u.name,
              subtitle: u.email,
              href: `/admin/accounts/customers/${u.id}`,
              icon: Users,
              description: 'Customer',
            })
          })
      } catch (error) {
        console.error('Search error:', error)
      }

      setResults(searchResults)
      setIsSearching(false)
    }

    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setIsOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search products, orders, customers, pages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-y-auto custom-scrollbar">
          {isSearching ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Search className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <div className="py-2">
              {!query && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quick Access
                </div>
              )}
              {query && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Results ({results.length})
                </div>
              )}
              <div className="divide-y divide-gray-100">
                {results.map((result, index) => {
                  const Icon = result.icon
                  return (
                    <button
                      key={`${result.type}-${result.id}-${index}`}
                      onClick={() => handleSelect(result)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${
                        result.type === 'product' ? 'bg-blue-100' :
                        result.type === 'order' ? 'bg-green-100' :
                        result.type === 'customer' ? 'bg-purple-100' :
                        'bg-gray-100'
                      } group-hover:scale-110 transition-transform`}>
                        <Icon 
                          size={18} 
                          className={
                            result.type === 'product' ? 'text-blue-600' :
                            result.type === 'order' ? 'text-green-600' :
                            result.type === 'customer' ? 'text-purple-600' :
                            'text-gray-600'
                          } 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-sm text-gray-500 truncate mt-0.5">{result.subtitle}</div>
                        )}
                        {result.description && !result.subtitle && (
                          <div className="text-xs text-gray-400 truncate mt-0.5">{result.description}</div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                          result.type === 'product' ? 'bg-blue-50 text-blue-700' :
                          result.type === 'order' ? 'bg-green-50 text-green-700' :
                          result.type === 'customer' ? 'bg-purple-50 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        } capitalize`}>
                          {result.type}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}
