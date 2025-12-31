'use client'

import { useEffect, useState } from 'react'
import { getDocument, setDocument } from '@/lib/utils/firestore'
import { StoreSettings } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'

export default function StoreSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    codEnabled: true,
    codMinimumOrder: '0',
    deliveryCharges: '0',
    freeDeliveryThreshold: '0',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const settings = await getDocument<StoreSettings>('settings', 'store')
      if (settings) {
        setFormData({
          storeName: settings.storeName || '',
          storeEmail: settings.storeEmail || '',
          storePhone: settings.storePhone || '',
          storeAddress: settings.storeAddress || '',
          codEnabled: settings.codEnabled ?? true,
          codMinimumOrder: settings.codMinimumOrder?.toString() || '0',
          deliveryCharges: settings.deliveryCharges?.toString() || '0',
          freeDeliveryThreshold: settings.freeDeliveryThreshold?.toString() || '0',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const settingsData: Omit<StoreSettings, 'id'> = {
        storeName: formData.storeName,
        storeEmail: formData.storeEmail,
        storePhone: formData.storePhone,
        storeAddress: formData.storeAddress,
        codEnabled: formData.codEnabled,
        codMinimumOrder: Number(formData.codMinimumOrder),
        deliveryCharges: Number(formData.deliveryCharges),
        freeDeliveryThreshold: Number(formData.freeDeliveryThreshold),
        updatedAt: new Date(),
      }

      await setDocument('settings', 'store', {
        ...settingsData,
        updatedAt: Timestamp.now(),
      })

      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Store Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Store Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Store Name"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              required
            />
            <Input
              label="Store Email"
              type="email"
              value={formData.storeEmail}
              onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })}
              required
            />
            <Input
              label="Store Phone"
              value={formData.storePhone}
              onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Address
              </label>
              <textarea
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Payment & Delivery</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.codEnabled}
                onChange={(e) => setFormData({ ...formData, codEnabled: e.target.checked })}
              />
              <span>Enable Cash on Delivery (COD)</span>
            </label>
            <Input
              label="COD Minimum Order (Rs.)"
              type="number"
              value={formData.codMinimumOrder}
              onChange={(e) => setFormData({ ...formData, codMinimumOrder: e.target.value })}
            />
            <Input
              label="Delivery Charges (Rs.)"
              type="number"
              value={formData.deliveryCharges}
              onChange={(e) => setFormData({ ...formData, deliveryCharges: e.target.value })}
            />
            <Input
              label="Free Delivery Threshold (Rs.)"
              type="number"
              value={formData.freeDeliveryThreshold}
              onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: e.target.value })}
              placeholder="0 = no free delivery"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" isLoading={isSaving}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  )
}

