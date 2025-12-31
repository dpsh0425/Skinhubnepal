'use client'

import { useState, useEffect } from 'react'
import { getCollection, getDocument, setDocument, updateDocument, deleteDocument } from '@/lib/utils/firestore'
import { ProductVariant, Product } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { uploadMultipleImages } from '@/lib/utils/imgbb'
import { Plus, Edit, Trash2, Eye, X, Save, AlertCircle, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'

interface VariantManagerProps {
  productId: string
}

export const VariantManager = ({ productId }: VariantManagerProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    price: '',
    originalPrice: '',
    stock: '',
    active: true,
  })
  const [attributes, setAttributes] = useState<Array<{ key: string; value: string }>>([
    { key: 'Size', value: '' },
  ])
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [previewVariant, setPreviewVariant] = useState<ProductVariant | null>(null)

  useEffect(() => {
    fetchData()
  }, [productId])

  const fetchData = async () => {
    try {
      const [variantsData, productData] = await Promise.all([
        getCollection<ProductVariant>('productVariants'),
        getDocument<Product>('products', productId),
      ])
      const productVariants = variantsData.filter(v => v.productId === productId)
      setVariants(productVariants)
      setProduct(productData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate SKU based on brand name and variant number
  const generateSKU = (): string => {
    if (!product) return ''
    
    // Clean brand name: uppercase, remove spaces and special chars, max 10 chars
    let brandCode = product.brand
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10)
    
    // If brand code is empty after cleaning, use a default
    if (!brandCode) {
      brandCode = 'PROD'
    }
    
    // Get next variant number (existing variants + 1)
    const nextVariantNumber = variants.length + 1
    
    // Format: BRAND-VAR-001
    return `${brandCode}-VAR-${String(nextVariantNumber).padStart(3, '0')}`
  }

  const resetForm = () => {
    // Auto-generate SKU for new variants
    const autoSKU = editingVariant ? '' : generateSKU()
    setFormData({
      sku: autoSKU,
      price: '',
      originalPrice: '',
      stock: '',
      active: true,
    })
    setAttributes([{ key: 'Size', value: '' }])
    setImages([])
    setExistingImages([])
    setEditingVariant(null)
    setShowForm(false)
  }

  const handleShowForm = () => {
    // Generate SKU when opening form for new variant
    if (!editingVariant && product) {
      const autoSKU = generateSKU()
      setFormData({
        sku: autoSKU,
        price: '',
        originalPrice: '',
        stock: '',
        active: true,
      })
      setAttributes([{ key: 'Size', value: '' }])
      setImages([])
      setExistingImages([])
    }
    setShowForm(true)
  }

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant)
    setFormData({
      sku: variant.sku,
      price: variant.price.toString(),
      originalPrice: variant.originalPrice?.toString() || '',
      stock: variant.stock.toString(),
      active: variant.active,
    })
    setAttributes(
      Object.entries(variant.attributes).map(([key, value]) => ({ key, value }))
    )
    setExistingImages(variant.images)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Build attributes object
      const attributesObj: Record<string, string> = {}
      attributes.forEach((attr) => {
        if (attr.key && attr.value) {
          attributesObj[attr.key] = attr.value
        }
      })

      if (Object.keys(attributesObj).length === 0) {
        toast.error('Please add at least one attribute')
        setIsLoading(false)
        return
      }

      let imageUrls = [...existingImages]

      // Upload new images
      if (images.length > 0) {
        const uploadedUrls = await uploadMultipleImages(images)
        imageUrls = [...imageUrls, ...uploadedUrls]
      }

      if (imageUrls.length === 0) {
        toast.error('Please upload at least one image')
        setIsLoading(false)
        return
      }

      // Use generated SKU if empty
      const finalSKU = formData.sku.trim() || generateSKU()
      
      const variantData = {
        productId,
        sku: finalSKU,
        attributes: attributesObj,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        images: imageUrls,
        active: formData.active,
        updatedAt: Timestamp.now(),
      }

      if (editingVariant) {
        await updateDocument('productVariants', editingVariant.id, variantData)
        toast.success('Variant updated!')
      } else {
        const variantId = `VAR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        await setDocument('productVariants', variantId, {
          ...variantData,
          createdAt: Timestamp.now(),
        })
        toast.success('Variant created!')
      }

      resetForm()
      fetchData()
    } catch (error) {
      toast.error('Failed to save variant')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return

    try {
      await deleteDocument('productVariants', variantId)
      toast.success('Variant deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete variant')
    }
  }

  const addAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }])
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const updateAttribute = (index: number, field: 'key' | 'value', value: string) => {
    const newAttributes = [...attributes]
    newAttributes[index][field] = value
    setAttributes(newAttributes)
  }

  const removeImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter(img => img !== imageUrl))
  }

  const getAttributeDisplay = (variant: ProductVariant) => {
    return Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ')
  }

  if (isLoading && variants.length === 0) {
    return <div className="text-center py-8">Loading variants...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Variants</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage different sizes, types, and options for this product
          </p>
        </div>
        <Button onClick={() => showForm ? resetForm() : handleShowForm()}>
          <Plus size={20} className="mr-2" />
          {showForm ? 'Cancel' : 'Add Variant'}
        </Button>
      </div>

      {/* Variant Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary-200">
          <h3 className="text-xl font-bold mb-4">
            {editingVariant ? 'Edit Variant' : 'New Variant'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="SKU *"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Auto-generated based on brand"
                  required
                />
                {!editingVariant && product && (
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated: {generateSKU()} (you can edit if needed)
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Active (visible to customers)</span>
                </label>
              </div>
            </div>

            {/* Attributes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant Attributes (Size, Type, Pack, etc.) *
              </label>
              {attributes.map((attr, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={attr.key}
                    onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                    placeholder="Attribute (e.g., Size)"
                    className="flex-1"
                  />
                  <Input
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    placeholder="Value (e.g., 50ml)"
                    className="flex-1"
                  />
                  {attributes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addAttribute}
                className="mt-2"
              >
                <Plus size={16} className="mr-2" />
                Add Attribute
              </Button>
            </div>

            {/* Price & Stock */}
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Price (Rs.) *"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                label="Original Price (Rs.)"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="For discount display"
              />
              <Input
                label="Stock Quantity *"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant Images *
              </label>
              {existingImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={imageUrl}
                        alt={`Variant ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(imageUrl)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setImages(files)
                }}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                {images.length > 0 && `${images.length} new image(s) selected`}
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" isLoading={isLoading}>
                <Save size={16} className="mr-2" />
                {editingVariant ? 'Update Variant' : 'Create Variant'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Variants Table */}
      {variants.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No variants yet. Create your first variant to get started.</p>
          <Button onClick={handleShowForm}>
            <Plus size={20} className="mr-2" />
            Add First Variant
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attributes</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variants.map((variant) => {
                  const isLowStock = variant.stock > 0 && variant.stock < 10
                  const isOutOfStock = variant.stock === 0
                  
                  return (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {variant.images[0] ? (
                          <Image
                            src={variant.images[0]}
                            alt={variant.sku}
                            width={60}
                            height={60}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{variant.sku}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{getAttributeDisplay(variant)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary-600">
                            Rs. {variant.price.toLocaleString()}
                          </span>
                          {variant.originalPrice && variant.originalPrice > variant.price && (
                            <span className="text-xs text-gray-400 line-through">
                              Rs. {variant.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {variant.stock}
                          </span>
                          {isLowStock && (
                            <AlertCircle size={16} className="text-yellow-500" />
                          )}
                          {isOutOfStock && (
                            <X size={16} className="text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          variant.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {variant.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewVariant(variant)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Preview"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(variant)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(variant.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Variant Preview Modal */}
      {previewVariant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Variant Preview</h3>
              <button
                onClick={() => setPreviewVariant(null)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {previewVariant.images[0] && (
                    <Image
                      src={previewVariant.images[0]}
                      alt={previewVariant.sku}
                      width={400}
                      height={400}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">SKU</p>
                    <p className="font-mono font-semibold">{previewVariant.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Attributes</p>
                    <p className="font-medium">{getAttributeDisplay(previewVariant)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-2xl font-bold text-primary-600">
                      Rs. {previewVariant.price.toLocaleString()}
                    </p>
                    {previewVariant.originalPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        Rs. {previewVariant.originalPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className={`font-semibold ${
                      previewVariant.stock === 0 ? 'text-red-600' : 
                      previewVariant.stock < 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {previewVariant.stock} units
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      previewVariant.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {previewVariant.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

