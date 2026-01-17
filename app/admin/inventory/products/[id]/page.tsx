'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getDocument, updateDocument, getCollection } from '@/lib/utils/firestore'
import { uploadMultipleImages, uploadImageToImgBB } from '@/lib/utils/imgbb'
import { validateAndNormalizeSkinTypes } from '@/lib/utils/product'
import { Product, Brand, Category } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'
import { ArrowLeft } from 'lucide-react'
import { VariantManager } from '@/components/admin/VariantManager'
import { ProductDetailsManager } from '@/components/admin/ProductDetailsManager'

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
    status: 'draft' as 'draft' | 'published',
    aboutThisProduct: [] as string[],
    productInformation: {} as Record<string, string>,
    relatedProductIds: [] as string[],
  })
  const [newImages, setNewImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [productData, brandsData, categoriesData] = await Promise.all([
        getDocument<Product>('products', productId),
        getCollection<Brand>('brands'),
        getCollection<Category>('categories'),
      ])
      
      if (productData) {
        setProduct(productData)
        setFormData({
          name: productData.name,
          description: productData.description,
          brand: productData.brand,
          category: productData.category,
          skinType: productData.skinType.join(', '),
          ingredients: productData.ingredients.join(', '),
          usageInstructions: productData.usageInstructions,
          featured: productData.featured,
          bestSeller: productData.bestSeller,
          status: productData.status || 'draft',
          aboutThisProduct: productData.aboutThisProduct || [],
          productInformation: productData.productInformation || {},
          relatedProductIds: productData.relatedProductIds || [],
        })
        setExistingImages(productData.images)
      }
      setBrands(brandsData)
      setCategories(categoriesData)
      setIsLoading(false)
    }
    fetchData()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let imageUrls = [...existingImages]

      if (newImages.length > 0) {
        const uploadedUrls = await uploadMultipleImages(newImages)
        imageUrls = [...imageUrls, ...uploadedUrls]
      }

      if (imageUrls.length === 0) {
        toast.error('Product must have at least one image')
        setIsSaving(false)
        return
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        images: imageUrls,
        brand: formData.brand,
        category: formData.category,
        skinType: validateAndNormalizeSkinTypes(formData.skinType),
        ingredients: formData.ingredients.split(',').map((i) => i.trim()).filter(Boolean),
        usageInstructions: formData.usageInstructions,
        featured: formData.featured,
        bestSeller: formData.bestSeller,
        status: formData.status,
        aboutThisProduct: formData.aboutThisProduct.filter(b => b.trim().length > 0),
        productInformation: Object.fromEntries(
          Object.entries(formData.productInformation).filter(([k, v]) => k.trim() && v.trim())
        ),
        relatedProductIds: formData.relatedProductIds,
        updatedAt: Timestamp.now(),
      }

      await updateDocument('products', productId, productData)
      toast.success('Product updated successfully!')
      router.push('/admin/inventory/products')
    } catch (error) {
      toast.error('Failed to update product')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((img) => img !== imageUrl))
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Product Name *"
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Note: Price and stock are managed through product variants. Only published products appear in the shop.
            </p>
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
            label="Skin Type (comma separated) *"
            value={formData.skinType}
            onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma separated)</label>
          <textarea
            value={formData.ingredients}
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usage Instructions</label>
          <textarea
            value={formData.usageInstructions}
            onChange={(e) => setFormData({ ...formData, usageInstructions: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Existing Images</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images</label>
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
          <p className="text-sm text-gray-500 mt-1">Selected: {newImages.length} new image(s)</p>
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

        <div className="flex gap-4 pt-4 border-t">
          <Button type="submit" isLoading={isSaving}>
            Update Product
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Product Details Management Section */}
      {product && (
        <div className="mt-8">
          <ProductDetailsManager
            product={product}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      )}

      {/* Variant Management Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <VariantManager productId={productId} />
      </div>
    </div>
  )
}

