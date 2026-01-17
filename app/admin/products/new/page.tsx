'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadMultipleImages } from '@/lib/utils/imgbb'
import { setDocument } from '@/lib/utils/firestore'
import { validateAndNormalizeSkinTypes } from '@/lib/utils/product'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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
  const [images, setImages] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Upload images to ImgBB
      const imageUrls = await uploadMultipleImages(images)

      if (imageUrls.length === 0) {
        toast.error('Please upload at least one image')
        setIsLoading(false)
        return
      }

      // Create product document
      const productData: Omit<Product, 'id'> = {
        name: formData.name,
        description: formData.description,
        images: imageUrls,
        brand: formData.brand,
        category: formData.category,
        skinType: validateAndNormalizeSkinTypes(formData.skinType),
        ingredients: formData.ingredients.split(',').map(i => i.trim()),
        usageInstructions: formData.usageInstructions,
        rating: 0,
        reviewCount: 0,
        featured: formData.featured,
        bestSeller: formData.bestSeller,
        status: 'draft',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Generate product ID
      const productId = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      await setDocument('products', productId, {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      toast.success('Product created successfully!')
      router.push('/admin/products')
    } catch (error) {
      toast.error('Failed to create product')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

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
            Product Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              setImages(files)
            }}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Selected: {images.length} image(s)
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
          <Button type="submit" isLoading={isLoading}>
            Create Product
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

