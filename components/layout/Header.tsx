'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useCartStore } from '@/lib/store/cartStore'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Logo } from './Logo'

export const Header = () => {
  const { user, loading } = useAuth()
  const itemCount = useCartStore(state => state.getItemCount())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/home" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all" />
            </Link>
            <Link 
              href="/products" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all" />
            </Link>
            {!mounted || loading ? (
              // Show login link during SSR and initial load to prevent hydration mismatch
              <Link 
                href="/auth/login" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
              >
                Login
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all" />
              </Link>
            ) : user ? (
              <>
                <Link 
                  href="/orders" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
                >
                  Orders
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all" />
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
                >
                  Profile
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all" />
                </Link>
                <Link
                  href="/cart"
                  className="relative text-gray-700 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                >
                  <ShoppingCart size={22} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-600 to-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link 
                href="/auth/login" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
              >
                Login
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all" />
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-100 pt-4">
            <Link
              href="/home"
              className="block py-2.5 px-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block py-2.5 px-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            {!mounted || loading ? (
              // Show login link during SSR and initial load to prevent hydration mismatch
              <Link
                href="/auth/login"
                className="block py-2.5 px-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            ) : user ? (
              <>
                <Link
                  href="/orders"
                  className="block py-2.5 px-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/profile"
                  className="block py-2.5 px-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-2 py-2.5 px-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart size={20} />
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block py-2.5 px-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
