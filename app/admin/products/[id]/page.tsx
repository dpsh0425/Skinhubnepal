'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDocument, updateDocument } from '@/lib/utils/firestore'
import { uploadMultipleImages, uploadImageToImgBB } from '@/lib/utils/imgbb'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category: '',
    skinType: '',
    ingredients: '',
    usageInstructions: '',
    featured: false,
    bestSeller: false,
  })
  const [newImages, setNewImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await getDocument<Product>('products', productId)
      if (data) {
        setProduct(data)
        setFormData({
          name: data.name,
          description: data.description,
          brand: data.brand,
          category: data.category,
          skinType: data.skinType.join(', '),
          ingredients: data.ingredients.join(', '),
          usageInstructions: data.usageInstructions,
          featured: data.featured,
          bestSeller: data.bestSeller,
        })
        setExistingImages(data.images)
      }
      setIsLoading(false)
    }
    fetchProduct()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let imageUrls = [...existingImages]

      // Upload new images
      if (newImages.length > 0) {
        const uploadedUrls = await uploadMultipleImages(newImages)
        imageUrls = [...imageUrls, ...uploadedUrls]
      }

      if (imageUrls.length === 0) {
        toast.error('Product must have at least one image')
        setIsSaving(false)
        return
      }

      // Update product document
      const productData = {
        name: formData.name,
        description: formData.description,
        images: imageUrls,
        brand: formData.brand,
        category: formData.category,
        skinType: formData.skinType.split(',').map(s => s.trim()),
        ingredients: formData.ingredients.split(',').map(i => i.trim()),
        usageInstructions: formData.usageInstructions,
        featured: formData.featured,
        bestSeller: formData.bestSeller,
        updatedAt: Timestamp.now(),
      }

      await updateDocument('products', productId, productData)

      toast.success('Product updated successfully!')
      router.push('/admin/products')
    } catch (error) {
      toast.error('Failed to update product')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter(img => img !== imageUrl))
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
          <Input
            label="Skin Type (comma separated: oily, dry, etc.)"
            value={formData.skinType}
            onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingredients (comma separated)
          </label>
          <textarea
            value={formData.ingredients}
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usage Instructions
          </label>
          <textarea
            value={formData.usageInstructions}
            onChange={(e) =>
              setFormData({ ...formData, usageInstructions: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Existing Images
          </label>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(imageUrl)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add New Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              setNewImages(files)
            }}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Selected: {newImages.length} new image(s)
          </p>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            />
            <span>Featured Product</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.bestSeller}
              onChange={(e) => setFormData({ ...formData, bestSeller: e.target.checked })}
            />
            <span>Best Seller</span>
          </label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" isLoading={isSaving}>
            Update Product
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

