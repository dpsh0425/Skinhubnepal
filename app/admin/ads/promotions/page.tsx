'use client'

import { useEffect, useState } from 'react'
import { getCollection, deleteDocument, setDocument } from '@/lib/utils/firestore'
import { Promotion } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Edit } from 'lucide-react'
import { uploadImageToImgBB } from '@/lib/utils/imgbb'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'banner' as 'flash_sale' | 'banner' | 'category',
    discount: '',
    startDate: '',
    endDate: '',
    active: true,
  })
  const [image, setImage] = useState<File | null>(null)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const data = await getCollection<Promotion>('promotions')
      setPromotions(data)
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = editingPromotion?.image || ''

      if (image) {
        const uploadedUrl = await uploadImageToImgBB(image)
        if (!uploadedUrl) {
          toast.error('Failed to upload image')
          setIsLoading(false)
          return
        }
        imageUrl = uploadedUrl
      }

      const promotionData: Omit<Promotion, 'id'> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        discount: formData.discount ? Number(formData.discount) : undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        active: formData.active,
        image: imageUrl || undefined,
      }

      const promotionId = editingPromotion?.id || `PROMO-${Date.now()}`

      await setDocument('promotions', promotionId, {
        ...promotionData,
        startDate: Timestamp.fromDate(promotionData.startDate),
        endDate: Timestamp.fromDate(promotionData.endDate),
      })

      toast.success(editingPromotion ? 'Promotion updated!' : 'Promotion created!')
      setShowForm(false)
      setEditingPromotion(null)
      setFormData({
        title: '',
        description: '',
        type: 'banner',
        discount: '',
        startDate: '',
        endDate: '',
        active: true,
      })
      setImage(null)
      fetchPromotions()
    } catch (error) {
      toast.error('Failed to save promotion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      discount: promotion.discount?.toString() || '',
      startDate: new Date(promotion.startDate).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate).toISOString().split('T')[0],
      active: promotion.active,
    })
    setShowForm(true)
  }

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      await deleteDocument('promotions', promotionId)
      toast.success('Promotion deleted')
      fetchPromotions()
    } catch (error) {
      toast.error('Failed to delete promotion')
    }
  }

  if (isLoading && promotions.length === 0) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Promotions</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          {showForm ? 'Cancel' : 'Add Promotion'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingPromotion ? 'Edit Promotion' : 'New Promotion'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="banner">Banner</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="category">Category</option>
              </select>
            </div>
            <Input
              label="Discount (%)"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border rounded-lg"
                required={!editingPromotion}
              />
            </div>
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
                {editingPromotion ? 'Update' : 'Create'} Promotion
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingPromotion(null)
                  setFormData({
                    title: '',
                    description: '',
                    type: 'banner',
                    discount: '',
                    startDate: '',
                    endDate: '',
                    active: true,
                  })
                  setImage(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {promotions.map((promotion) => (
          <div key={promotion.id} className="bg-white rounded-lg shadow overflow-hidden">
            {promotion.image && (
              <div className="relative h-48 w-full">
                <img src={promotion.image} alt={promotion.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold mb-2">{promotion.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{promotion.description}</p>
              <div className="flex gap-2 mb-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {promotion.type}
                </span>
                {promotion.discount && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {promotion.discount}% OFF
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    promotion.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {promotion.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                {new Date(promotion.startDate).toLocaleDateString()} -{' '}
                {new Date(promotion.endDate).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(promotion)}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(promotion.id)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

