'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuthInstance } from '@/lib/firebase/config'

export const dynamic = 'force-dynamic'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { useCartStore } from '@/lib/store/cartStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getUserData } from '@/lib/utils/auth'
import { User, Address } from '@/lib/types'
import { setDocument } from '@/lib/utils/firestore'
import { Timestamp } from 'firebase/firestore'
import { Order } from '@/lib/types'
import toast from 'react-hot-toast'
import { CreditCard, Wallet, Smartphone, Banknote } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const auth = getAuthInstance()
  const [user] = useAuthState(auth as any)
  const items = useCartStore(state => state.items)
  const getTotal = useCartStore(state => state.getTotal)
  const clearCart = useCartStore(state => state.clearCart)
  const [userData, setUserData] = useState<User | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'fonepay' | 'cod'>('cod')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchUserData = async () => {
      const data = await getUserData(user.uid)
      if (data) {
        setUserData(data)
        const defaultAddress = data.addresses?.find(a => a.isDefault) || data.addresses?.[0]
        setSelectedAddress(defaultAddress || null)
      }
    }
    fetchUserData()
  }, [user, router])

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const total = getTotal()
  const shipping = total > 1000 ? 0 : 100
  const finalTotal = total + shipping

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsProcessing(true)

    try {
      // Create order document
      const orderData: Omit<Order, 'id'> = {
        userId: user.uid,
        items,
        total: finalTotal,
        shippingAddress: selectedAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Generate order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Save order to Firestore
      await setDocument('orders', orderId, {
        ...orderData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      // Handle payment based on method
      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!')
        clearCart()
        router.push(`/orders/${orderId}`)
      } else {
        // For online payments, redirect to payment gateway
        // This is a placeholder - implement actual payment gateway integration
        toast.success('Redirecting to payment...')
        // TODO: Implement payment gateway redirect
        clearCart()
        router.push(`/orders/${orderId}`)
      }
    } catch (error) {
      toast.error('Failed to place order. Please try again.')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-skincare-light">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
              {userData.addresses && userData.addresses.length > 0 ? (
                <div className="space-y-2">
                  {userData.addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer ${
                        selectedAddress?.id === address.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress?.id === address.id}
                        onChange={() => setSelectedAddress(address)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-semibold">{address.name}</p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.district} - {address.postalCode}
                        </p>
                      </div>
                    </label>
                  ))}
                  <Link href="/profile?tab=addresses">
                    <Button variant="outline" size="sm" className="mt-2">
                      Manage Addresses
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">No addresses saved. Please add one.</p>
                  <Link href="/profile?tab=addresses">
                    <Button>Add Address</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Banknote size={24} className="mb-2" />
                  <p className="font-semibold">Cash on Delivery</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('esewa')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    paymentMethod === 'esewa'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Wallet size={24} className="mb-2" />
                  <p className="font-semibold">eSewa</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('khalti')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    paymentMethod === 'khalti'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone size={24} className="mb-2" />
                  <p className="font-semibold">Khalti</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('fonepay')}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    paymentMethod === 'fonepay'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard size={24} className="mb-2" />
                  <p className="font-semibold">Fonepay</p>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Items ({items.length})</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rs. {finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handlePlaceOrder}
                isLoading={isProcessing}
                disabled={!selectedAddress || items.length === 0}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

