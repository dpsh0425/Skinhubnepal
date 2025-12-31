'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, X, GripVertical, Eye, Save } from 'lucide-react'
import { getCollection } from '@/lib/utils/firestore'

interface ProductDetailsManagerProps {
  product: Product
  formData: any
  setFormData: (data: any) => void
}

export const ProductDetailsManager = ({ product, formData, setFormData }: ProductDetailsManagerProps) => {
  const [activeTab, setActiveTab] = useState<'about' | 'description' | 'info' | 'ingredients' | 'related'>('about')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Load products for related products selector
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getCollection<Product>('products')
        setAllProducts(data.filter(p => p.id !== product.id && p.status === 'published'))
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [product.id])

  const addAboutBullet = () => {
    const bullets = formData.aboutThisProduct || []
    setFormData({
      ...formData,
      aboutThisProduct: [...bullets, ''],
    })
  }

  const updateAboutBullet = (index: number, value: string) => {
    const bullets = [...(formData.aboutThisProduct || [])]
    bullets[index] = value
    setFormData({ ...formData, aboutThisProduct: bullets })
  }

  const removeAboutBullet = (index: number) => {
    const bullets = [...(formData.aboutThisProduct || [])]
    bullets.splice(index, 1)
    setFormData({ ...formData, aboutThisProduct: bullets })
  }

  const addInfoRow = () => {
    const info = formData.productInformation || {}
    setFormData({
      ...formData,
      productInformation: { ...info, '': '' },
    })
  }

  const updateInfoRow = (oldKey: string, newKey: string, value: string) => {
    const info = { ...(formData.productInformation || {}) }
    if (oldKey !== newKey) {
      delete info[oldKey]
    }
    info[newKey] = value
    setFormData({ ...formData, productInformation: info })
  }

  const removeInfoRow = (key: string) => {
    const info = { ...(formData.productInformation || {}) }
    delete info[key]
    setFormData({ ...formData, productInformation: info })
  }

  const toggleRelatedProduct = (productId: string) => {
    const related = formData.relatedProductIds || []
    const index = related.indexOf(productId)
    if (index > -1) {
      related.splice(index, 1)
    } else {
      related.push(productId)
    }
    setFormData({ ...formData, relatedProductIds: related })
  }

  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-primary-200">
      <h3 className="text-xl font-bold mb-4">Product Details Management</h3>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: 'about', label: 'About This Product', icon: '📋' },
          { id: 'description', label: 'Description', icon: '📝' },
          { id: 'info', label: 'Product Information', icon: '📊' },
          { id: 'ingredients', label: 'Ingredients & Usage', icon: '🧪' },
          { id: 'related', label: 'Related Products', icon: '🔗' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-700 bg-primary-50'
                : 'border-transparent text-gray-600 hover:text-primary-600 hover:bg-gray-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* About This Product Tab */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Add bullet points that highlight key features and benefits
              </p>
              <Button onClick={addAboutBullet} size="sm">
                <Plus size={16} className="mr-2" />
                Add Bullet
              </Button>
            </div>
            <div className="space-y-3">
              {(formData.aboutThisProduct || []).map((bullet: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <GripVertical className="text-gray-400 mt-2 cursor-move" size={20} />
                  <Input
                    value={bullet}
                    onChange={(e) => updateAboutBullet(index, e.target.value)}
                    placeholder="Enter bullet point..."
                    className="flex-1"
                  />
                  <button
                    onClick={() => removeAboutBullet(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              {(!formData.aboutThisProduct || formData.aboutThisProduct.length === 0) && (
                <p className="text-gray-500 text-center py-8">No bullet points added yet</p>
              )}
            </div>
          </div>
        )}

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[300px]"
              placeholder="Enter detailed product description..."
              required
            />
            <p className="text-xs text-gray-500">
              Rich text description. Use line breaks for paragraphs.
            </p>
          </div>
        )}

        {/* Product Information Tab */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Add key-value pairs for product specifications (e.g., Weight: 50ml, Type: Serum)
              </p>
              <Button onClick={addInfoRow} size="sm">
                <Plus size={16} className="mr-2" />
                Add Row
              </Button>
            </div>
            <div className="space-y-3">
              {Object.entries(formData.productInformation || {}).map(([key, value], index) => (
                <div key={index} className="flex items-center gap-3">
                  <GripVertical className="text-gray-400 cursor-move" size={20} />
                  <Input
                    value={key}
                    onChange={(e) => updateInfoRow(key, e.target.value, value as string)}
                    placeholder="Label (e.g., Weight)"
                    className="flex-1"
                  />
                  <Input
                    value={value as string}
                    onChange={(e) => updateInfoRow(key, key, e.target.value)}
                    placeholder="Value (e.g., 50ml)"
                    className="flex-1"
                  />
                  <button
                    onClick={() => removeInfoRow(key)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              {(!formData.productInformation || Object.keys(formData.productInformation).length === 0) && (
                <p className="text-gray-500 text-center py-8">No information rows added yet</p>
              )}
            </div>
          </div>
        )}

        {/* Ingredients & Usage Tab */}
        {activeTab === 'ingredients' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients (comma separated)
              </label>
              <textarea
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter ingredients separated by commas..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple ingredients with commas
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Instructions
              </label>
              <textarea
                value={formData.usageInstructions}
                onChange={(e) => setFormData({ ...formData, usageInstructions: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter detailed usage instructions..."
                rows={6}
              />
            </div>
          </div>
        )}

        {/* Related Products Tab */}
        {activeTab === 'related' && (
          <div className="space-y-4">
            <div>
              <Input
                label="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or brand..."
                className="mb-4"
              />
            </div>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
              {filteredProducts.length > 0 ? (
                <div className="space-y-2">
                  {filteredProducts.map((p) => {
                    const isSelected = (formData.relatedProductIds || []).includes(p.id)
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleRelatedProduct(p.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-sm text-gray-500">{p.brand} • {p.category}</p>
                          </div>
                          {isSelected && (
                            <div className="text-primary-600 font-bold">✓</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No products found</p>
              )}
            </div>
            {(formData.relatedProductIds || []).length > 0 && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                <p className="text-sm font-semibold text-primary-700 mb-2">
                  Selected: {(formData.relatedProductIds || []).length} product(s)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

