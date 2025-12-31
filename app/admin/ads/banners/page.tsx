'use client'

import { useEffect, useState } from 'react'
import { getCollection, deleteDocument, setDocument } from '@/lib/utils/firestore'
import { Banner } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Edit } from 'lucide-react'
import Image from 'next/image'
import { uploadImageToImgBB } from '@/lib/utils/imgbb'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    order: '0',
    active: true,
  })
  const [image, setImage] = useState<File | null>(null)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const data = await getCollection<Banner>('banners')
      const sorted = data.sort((a, b) => a.order - b.order)
      setBanners(sorted)
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = editingBanner?.image || ''

      if (image) {
        const uploadedUrl = await uploadImageToImgBB(image)
        if (!uploadedUrl) {
          toast.error('Failed to upload image')
          setIsLoading(false)
          return
        }
        imageUrl = uploadedUrl
      }

      const bannerData: Omit<Banner, 'id'> = {
        title: formData.title,
        image: imageUrl,
        link: formData.link || undefined,
        active: formData.active,
        order: Number(formData.order),
        createdAt: editingBanner?.createdAt || new Date(),
      }

      const bannerId = editingBanner?.id || `BANNER-${Date.now()}`

      await setDocument('banners', bannerId, {
        ...bannerData,
        createdAt: editingBanner?.createdAt
          ? Timestamp.fromDate(editingBanner.createdAt)
          : Timestamp.now(),
      })

      toast.success(editingBanner ? 'Banner updated!' : 'Banner created!')
      setShowForm(false)
      setEditingBanner(null)
      setFormData({ title: '', link: '', order: '0', active: true })
      setImage(null)
      fetchBanners()
    } catch (error) {
      toast.error('Failed to save banner')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      link: banner.link || '',
      order: banner.order.toString(),
      active: banner.active,
    })
    setShowForm(true)
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      await deleteDocument('banners', bannerId)
      toast.success('Banner deleted')
      fetchBanners()
    } catch (error) {
      toast.error('Failed to delete banner')
    }
  }

  if (isLoading && banners.length === 0) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Banners</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          {showForm ? 'Cancel' : 'Add Banner'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBanner ? 'Edit Banner' : 'New Banner'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Link (Optional)"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="/products"
            />
            <Input
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border rounded-lg"
                required={!editingBanner}
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
                {editingBanner ? 'Update' : 'Create'} Banner
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingBanner(null)
                  setFormData({ title: '', link: '', order: '0', active: true })
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
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{banner.title}</h3>
              <p className="text-sm text-gray-600 mb-2">Order: {banner.order}</p>
              <p className="text-sm text-gray-600 mb-2">
                Status: {banner.active ? 'Active' : 'Inactive'}
              </p>
              {banner.link && (
                <p className="text-sm text-gray-600 mb-4">Link: {banner.link}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(banner)}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(banner.id)}
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

