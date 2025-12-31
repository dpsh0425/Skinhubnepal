'use client'

import { useEffect, useState } from 'react'
import { getCollection, deleteDocument, setDocument } from '@/lib/utils/firestore'
import { Brand } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Edit } from 'lucide-react'
import { uploadImageToImgBB } from '@/lib/utils/imgbb'
import toast from 'react-hot-toast'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
  })
  const [logo, setLogo] = useState<File | null>(null)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const data = await getCollection<Brand>('brands')
      setBrands(data)
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let logoUrl = editingBrand?.logo || ''

      if (logo) {
        const uploadedUrl = await uploadImageToImgBB(logo)
        if (!uploadedUrl) {
          toast.error('Failed to upload logo')
          setIsLoading(false)
          return
        }
        logoUrl = uploadedUrl
      }

      const brandData: Omit<Brand, 'id'> = {
        name: formData.name,
        logo: logoUrl || undefined,
      }

      const brandId = editingBrand?.id || `BRAND-${Date.now()}`

      await setDocument('brands', brandId, brandData)

      toast.success(editingBrand ? 'Brand updated!' : 'Brand created!')
      setShowForm(false)
      setEditingBrand(null)
      setFormData({ name: '' })
      setLogo(null)
      fetchBrands()
    } catch (error) {
      toast.error('Failed to save brand')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
    })
    setShowForm(true)
  }

  const handleDelete = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return

    try {
      await deleteDocument('brands', brandId)
      toast.success('Brand deleted')
      fetchBrands()
    } catch (error) {
      toast.error('Failed to delete brand')
    }
  }

  if (isLoading && brands.length === 0) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Brands</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          {showForm ? 'Cancel' : 'Add Brand'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBrand ? 'Edit Brand' : 'New Brand'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Brand Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" isLoading={isLoading}>
                {editingBrand ? 'Update' : 'Create'} Brand
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingBrand(null)
                  setFormData({ name: '' })
                  setLogo(null)
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{brand.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(brand)}
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(brand.id)}
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
        {brands.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No brands found</p>
          </div>
        )}
      </div>
    </div>
  )
}
