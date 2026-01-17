'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { uploadMultipleImages } from '@/lib/utils/imgbb'
import { setDocument, getCollection } from '@/lib/utils/firestore'
import { validateAndNormalizeSkinTypes, VALID_SKIN_TYPES } from '@/lib/utils/product'
import { Product, Brand, Category } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'
import { ArrowLeft } from 'lucide-react'

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
    tags: '',
    featured: false,
    bestSeller: false,
    status: 'draft' as 'draft' | 'published',
    aboutThisProduct: [] as string[],
    productInformation: {} as Record<string, string>,
    relatedProductIds: [] as string[],
  })
  const [images, setImages] = useState<File[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [brandsData, categoriesData] = await Promise.all([
        getCollection<Brand>('brands'),
        getCollection<Category>('categories'),
      ])
      setBrands(brandsData)
      setCategories(categoriesData)
    }
    fetchData()
  }, [])

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
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        usageInstructions: formData.usageInstructions,
        rating: 0,
        reviewCount: 0,
        featured: formData.featured,
        bestSeller: formData.bestSeller,
        status: formData.status,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        aboutThisProduct: formData.aboutThisProduct.filter(b => b.trim().length > 0),
        productInformation: Object.fromEntries(
          Object.entries(formData.productInformation).filter(([k, v]) => k.trim() && v.trim())
        ),
        relatedProductIds: formData.relatedProductIds,
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
      router.push(`/admin/inventory/products/${productId}`)
    } catch (error) {
      toast.error('Failed to create product')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <select
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select a brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
            {brands.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No brands found. <a href="/admin/inventory/brands" className="text-primary-600 hover:underline">Add a brand first</a>
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No categories found. <a href="/admin/inventory/categories" className="text-primary-600 hover:underline">Add a category first</a>
              </p>
            )}
          </div>
          <Input
            label="Skin Type (comma separated: oily, dry, etc.)"
            value={formData.skinType}
            onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
            required
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma separated)
          </label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="organic, vegan, cruelty-free"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images (Default images - variants can have their own)
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
