'use client'

import { useEffect, useState } from 'react'
import { getCollection, deleteDocument, setDocument } from '@/lib/utils/firestore'
import { Coupon } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Edit } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'percentage' as 'percentage' | 'fixed',
    minPurchase: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    active: true,
  })
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const data = await getCollection<Coupon>('coupons')
      setCoupons(data)
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const couponData: Omit<Coupon, 'id'> = {
        code: formData.code.toUpperCase(),
        discount: Number(formData.discount),
        type: formData.type,
        minPurchase: formData.minPurchase ? Number(formData.minPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        usedCount: editingCoupon?.usedCount || 0,
        active: formData.active,
      }

      const couponId = editingCoupon?.id || `COUPON-${Date.now()}`

      await setDocument('coupons', couponId, {
        ...couponData,
        validFrom: Timestamp.fromDate(couponData.validFrom),
        validUntil: Timestamp.fromDate(couponData.validUntil),
      })

      toast.success(editingCoupon ? 'Coupon updated!' : 'Coupon created!')
      setShowForm(false)
      setEditingCoupon(null)
      setFormData({
        code: '',
        discount: '',
        type: 'percentage',
        minPurchase: '',
        maxDiscount: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
        active: true,
      })
      fetchCoupons()
    } catch (error) {
      toast.error('Failed to save coupon')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount: coupon.discount.toString(),
      type: coupon.type,
      minPurchase: coupon.minPurchase?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit?.toString() || '',
      active: coupon.active,
    })
    setShowForm(true)
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      await deleteDocument('coupons', couponId)
      toast.success('Coupon deleted')
      fetchCoupons()
    } catch (error) {
      toast.error('Failed to delete coupon')
    }
  }

  if (isLoading && coupons.length === 0) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          {showForm ? 'Cancel' : 'Add Coupon'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Coupon Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (Rs.)</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Minimum Purchase (Rs.) - Optional"
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
              />
              <Input
                label="Max Discount (Rs.) - Optional"
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Valid From"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                required
              />
              <Input
                label="Valid Until"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>
            <Input
              label="Usage Limit - Optional"
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <span>Active</span>
            </label>
            <div className="flex gap-4">
              <Button type="submit" isLoading={isLoading}>
                {editingCoupon ? 'Update' : 'Create'} Coupon
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingCoupon(null)
                  setFormData({
                    code: '',
                    discount: '',
                    type: 'percentage',
                    minPurchase: '',
                    maxDiscount: '',
                    validFrom: '',
                    validUntil: '',
                    usageLimit: '',
                    active: true,
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-semibold">{coupon.code}</td>
                  <td className="px-6 py-4">
                    {coupon.type === 'percentage' ? `${coupon.discount}%` : `Rs. ${coupon.discount}`}
                  </td>
                  <td className="px-6 py-4 capitalize">{coupon.type}</td>
                  <td className="px-6 py-4">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(coupon.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {coupons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No coupons found</p>
          </div>
        )}
      </div>
    </div>
  )
}

