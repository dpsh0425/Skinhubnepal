'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { Save, Bell, Mail, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'SkinHub Nepal',
    storeEmail: 'admin@skinhubnepal.com',
    storePhone: '+977-1-XXXXXXX',
    lowStockThreshold: 10,
    enableNotifications: true,
    enableEmailAlerts: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Save settings to Firestore
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Store Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Mail size={20} />
            Store Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Store Name"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            />
            <Input
              label="Store Email"
              type="email"
              value={settings.storeEmail}
              onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
            />
            <Input
              label="Store Phone"
              value={settings.storePhone}
              onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
            />
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield size={20} />
            Inventory Settings
          </h2>
          <div className="space-y-4">
            <Input
              label="Low Stock Threshold"
              type="number"
              value={settings.lowStockThreshold.toString()}
              onChange={(e) =>
                setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-sm text-gray-500">
              Products with stock below this number will be marked as low stock
            </p>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell size={20} />
            Notification Settings
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, enableNotifications: e.target.checked })
                }
                className="rounded"
              />
              <span>Enable browser notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enableEmailAlerts}
                onChange={(e) =>
                  setSettings({ ...settings, enableEmailAlerts: e.target.checked })
                }
                className="rounded"
              />
              <span>Enable email alerts for new orders</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save size={16} className="mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

