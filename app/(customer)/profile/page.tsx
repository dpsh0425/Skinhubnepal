'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuthInstance } from '@/lib/firebase/config'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { User, Address } from '@/lib/types'
import { getUserData, logout as logoutUser } from '@/lib/utils/auth'
import { updateDocument } from '@/lib/utils/firestore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { User as UserIcon, MapPin, LogOut, Plus, Trash2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = getAuthInstance()
  const [user] = useAuthState(auth as any)
  const [userData, setUserData] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    district: '',
    postalCode: '',
    isDefault: false,
  })
  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchUserData = async () => {
      const data = await getUserData(user.uid)
      if (data) {
        setUserData(data)
        setFormData({
          name: data.name,
          phone: data.phone || '',
        })
      }
    }
    fetchUserData()
  }, [user, router])

  const handleUpdateProfile = async () => {
    if (!user) return

    try {
      await updateDocument('users', user.uid, {
        name: formData.name,
        phone: formData.phone,
      })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      const updatedData = await getUserData(user.uid)
      if (updatedData) setUserData(updatedData)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleAddAddress = async () => {
    if (!user) return

    try {
      const addresses = userData?.addresses || []
      const newAddressData: Address = {
        id: Date.now().toString(),
        ...newAddress,
      }

      // If this is set as default, unset other defaults
      if (newAddress.isDefault) {
        addresses.forEach(addr => {
          addr.isDefault = false
        })
      }

      await updateDocument('users', user.uid, {
        addresses: [...addresses, newAddressData],
      })

      toast.success('Address added successfully!')
      setShowAddressForm(false)
      setNewAddress({
        name: '',
        phone: '',
        street: '',
        city: '',
        district: '',
        postalCode: '',
        isDefault: false,
      })
      const updatedData = await getUserData(user.uid)
      if (updatedData) setUserData(updatedData)
    } catch (error) {
      toast.error('Failed to add address')
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return

    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const addresses = (userData?.addresses || []).filter(a => a.id !== addressId)
      await updateDocument('users', user.uid, {
        addresses,
      })
      toast.success('Address deleted successfully!')
      const updatedData = await getUserData(user.uid)
      if (updatedData) setUserData(updatedData)
    } catch (error) {
      toast.error('Failed to delete address')
    }
  }

  const handleLogout = async () => {
    await logoutUser()
    router.push('/auth/login')
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-skincare-light">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-4 ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600'
            }`}
          >
            <UserIcon size={20} className="inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-2 px-4 ${
              activeTab === 'addresses'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600'
            }`}
          >
            <MapPin size={20} className="inline mr-2" />
            Addresses
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              {!isEditing && (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Email"
                  value={user.email || ''}
                  disabled
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProfile}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-semibold">{userData.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-semibold">{user.email}</p>
                </div>
                {userData.phone && (
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-semibold">{userData.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Saved Addresses</h2>
              <Button
                size="sm"
                onClick={() => setShowAddressForm(!showAddressForm)}
              >
                <Plus size={16} className="mr-2" />
                Add Address
              </Button>
            </div>

            {showAddressForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">Add New Address</h3>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    value={newAddress.name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, name: e.target.value })
                    }
                  />
                  <Input
                    label="Phone"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                  />
                  <Input
                    label="Street Address"
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                    />
                    <Input
                      label="District"
                      value={newAddress.district}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, district: e.target.value })
                      }
                    />
                  </div>
                  <Input
                    label="Postal Code"
                    value={newAddress.postalCode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, postalCode: e.target.value })
                    }
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, isDefault: e.target.checked })
                      }
                    />
                    <span>Set as default address</span>
                  </label>
                  <div className="flex gap-2">
                    <Button onClick={handleAddAddress}>Save Address</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddressForm(false)
                        setNewAddress({
                          name: '',
                          phone: '',
                          street: '',
                          city: '',
                          district: '',
                          postalCode: '',
                          isDefault: false,
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {userData.addresses && userData.addresses.length > 0 ? (
              <div className="space-y-4">
                {userData.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-white rounded-lg shadow p-6 flex justify-between"
                  >
                    <div>
                      {address.isDefault && (
                        <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded mb-2">
                          Default
                        </span>
                      )}
                      <p className="font-semibold">{address.name}</p>
                      <p className="text-sm text-gray-600">{address.phone}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {address.street}, {address.city}, {address.district} -{' '}
                        {address.postalCode}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No addresses saved</p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <div className="mt-8">
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut size={20} className="mr-2" />
            Logout
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

