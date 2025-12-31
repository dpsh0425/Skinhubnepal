'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { getAuthInstance } from '@/lib/firebase/config'
import { getUserData } from '@/lib/utils/auth'
import { User } from '@/lib/types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Package,
  ShoppingBag,
  Image as ImageIcon,
  Settings,
  BarChart3,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FolderOpen,
  Tag,
  AlertCircle,
  FileText,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  CreditCard,
  Truck as ShippingIcon,
  UserCog,
  Megaphone,
  Ticket,
  Database,
  Menu,
  X,
  Search,
  Plus,
} from 'lucide-react'
import { logout as logoutUser } from '@/lib/utils/auth'
import { User as FirebaseUser } from 'firebase/auth'
import { GlobalSearch } from '@/components/admin/GlobalSearch'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(['inventory', 'orders'])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  useEffect(() => {
    const auth = getAuthInstance()
    if (!auth) {
      router.push('/auth/login')
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/auth/login')
        setIsLoading(false)
        return
      }

      setUser(firebaseUser)

      if (firebaseUser.email === 'admin@skinhubnepal.com') {
        setUserData({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: 'Admin',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User)
        setIsLoading(false)
        
        try {
          const data = await getUserData(firebaseUser.uid)
          if (data) setUserData(data)
        } catch (error) {
          console.log('Could not fetch userData')
        }
      } else {
        try {
          const data = await getUserData(firebaseUser.uid)
          if (data && data.role === 'admin') {
            setUserData(data)
            setIsLoading(false)
          } else {
            router.push('/home')
            setIsLoading(false)
          }
        } catch (error) {
          router.push('/home')
          setIsLoading(false)
        }
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await logoutUser()
    router.push('/auth/login')
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  const isSectionActive = (paths: string[]) => {
    return paths.some((p) => pathname?.startsWith(p))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuSections = [
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-50',
      activeBgColor: 'bg-blue-100',
      items: [
        { href: '/admin/inventory/products', label: 'Products', icon: Package, description: 'View and manage all products' },
        { href: '/admin/inventory/categories', label: 'Categories', icon: FolderOpen, description: 'Product categories' },
        { href: '/admin/inventory/brands', label: 'Brands', icon: Tag, description: 'Product brands' },
        { href: '/admin/inventory/stock', label: 'Stock Management', icon: AlertCircle, description: 'Manage inventory' },
        { href: '/admin/inventory/low-stock', label: 'Low Stock Alerts', icon: AlertCircle, description: 'Restock alerts' },
      ],
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-50',
      activeBgColor: 'bg-green-100',
      items: [
        { href: '/admin/orders', label: 'All Orders', icon: FileText, description: 'View all orders' },
        { href: '/admin/orders/pending', label: 'Pending', icon: Clock, description: 'Pending orders' },
        { href: '/admin/orders/processing', label: 'Processing', icon: Package, description: 'In processing' },
        { href: '/admin/orders/shipped', label: 'Shipped', icon: Truck, description: 'Shipped orders' },
        { href: '/admin/orders/delivered', label: 'Delivered', icon: CheckCircle, description: 'Delivered orders' },
        { href: '/admin/orders/cancelled', label: 'Cancelled', icon: XCircle, description: 'Cancelled orders' },
        { href: '/admin/orders/cod', label: 'COD Orders', icon: DollarSign, description: 'Cash on delivery' },
      ],
    },
    {
      id: 'ads-settings',
      label: 'Ads & Settings',
      icon: ImageIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-50',
      activeBgColor: 'bg-purple-100',
      items: [
        { href: '/admin/ads/banners', label: 'Banners', icon: ImageIcon, description: 'Homepage banners' },
        { href: '/admin/ads/promotions', label: 'Promotions', icon: Megaphone, description: 'Sales promotions' },
        { href: '/admin/ads/coupons', label: 'Coupons', icon: Ticket, description: 'Discount codes' },
        { href: '/admin/settings/store', label: 'Store Settings', icon: Settings, description: 'Store configuration' },
        { href: '/admin/settings/payment', label: 'Payment Settings', icon: CreditCard, description: 'Payment methods' },
        { href: '/admin/settings/shipping', label: 'Shipping Settings', icon: ShippingIcon, description: 'Delivery options' },
        { href: '/admin/settings/cms', label: 'CMS Pages', icon: FileText, description: 'Content pages' },
      ],
    },
    {
      id: 'analytics-accounts',
      label: 'Analytics & Accounts',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-50',
      activeBgColor: 'bg-orange-100',
      items: [
        { href: '/admin/analytics', label: 'Dashboard', icon: LayoutDashboard, description: 'Main dashboard' },
        { href: '/admin/analytics/sales', label: 'Sales Reports', icon: TrendingUp, description: 'Sales analytics' },
        { href: '/admin/analytics/revenue', label: 'Revenue Analytics', icon: DollarSign, description: 'Revenue insights' },
        { href: '/admin/accounts/customers', label: 'Customers', icon: Users, description: 'Customer management' },
        { href: '/admin/accounts/admins', label: 'Admin Accounts', icon: UserCog, description: 'Admin users' },
        { href: '/admin/accounts/logs', label: 'Activity Logs', icon: FileText, description: 'System logs' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link href="/admin" className="flex items-center gap-2 group flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-200 group-hover:shadow-xl transition-shadow">
                  <LayoutDashboard className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent hidden sm:inline">
                  SkinHub CRM
                </span>
              </Link>
              {userData && (
                <span className="hidden md:inline text-sm text-gray-600 font-medium">
                  Welcome, <span className="text-primary-600 font-semibold">{userData.name}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Desktop Search */}
              <div className="hidden lg:block flex-1 max-w-xl">
                <GlobalSearch />
              </div>
              {/* Mobile Search Button */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search size={20} className="text-gray-600" />
              </button>
              <Link
                href="/home"
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <span>View Store</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Modal */}
      {mobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSearchOpen(false)}>
          <div className="absolute top-0 left-0 right-0 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <GlobalSearch />
                </div>
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex relative">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl border-r border-gray-200 transition-transform duration-300 ease-in-out lg:transition-none`}
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          <nav className="p-4 h-full overflow-y-auto custom-scrollbar">
            {/* Dashboard Link */}
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-4 transition-all group ${
                pathname === '/admin'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={20} className={pathname === '/admin' ? 'text-white' : 'text-gray-600'} />
              <span className="font-semibold">Dashboard</span>
            </Link>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>

            {/* Menu Sections */}
            <div className="space-y-1">
              {menuSections.map((section) => {
                const Icon = section.icon
                const isExpanded = expandedSections.includes(section.id)
                const isActive = isSectionActive(section.items.map((i) => i.href))

                return (
                  <div key={section.id} className="space-y-1">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                        isActive
                          ? `${section.bgColor} ${section.color} font-semibold shadow-sm`
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={isActive ? section.color : 'text-gray-500 group-hover:text-gray-700'} />
                        <span className="font-medium">{section.label}</span>
                      </div>
                      <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : ''}`}>
                        {isExpanded ? (
                          <ChevronDown size={16} className={isActive ? section.color : 'text-gray-400'} />
                        ) : (
                          <ChevronRight size={16} className={isActive ? section.color : 'text-gray-400'} />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon
                          const isItemActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                                isItemActive
                                  ? `${section.activeBgColor} ${section.color} font-medium shadow-sm`
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <ItemIcon 
                                size={16} 
                                className={isItemActive ? section.color : 'text-gray-400 group-hover:text-gray-600'} 
                              />
                              <div className="flex-1">
                                <div className="font-medium">{item.label}</div>
                                {item.description && (
                                  <div className={`text-xs mt-0.5 ${
                                    isItemActive ? 'text-gray-600' : 'text-gray-400'
                                  }`}>
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
            style={{ top: '64px' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
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
