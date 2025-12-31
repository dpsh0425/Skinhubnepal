'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ShoppingCart, User, Package } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'

export const BottomNav = () => {
  const pathname = usePathname()
  const itemCount = useCartStore(state => state.getItemCount())

  const navItems = [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/products', icon: ShoppingBag, label: 'Shop' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
    { href: '/orders', icon: Package, label: 'Orders' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-inset-bottom shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href || (href !== '/home' && pathname?.startsWith(href))
          const hasBadge = badge !== undefined && badge > 0
          
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative ${
                isActive 
                  ? 'text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative mb-1">
                <Icon 
                  size={22} 
                  className={`transition-all duration-200 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Facebook-style notification badge */}
                {hasBadge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 shadow-lg border-2 border-white">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium transition-all duration-200 ${
                isActive ? 'font-semibold' : 'font-normal'
              }`}>
                {label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
