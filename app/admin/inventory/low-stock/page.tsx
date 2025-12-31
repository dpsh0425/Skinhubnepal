'use client'

import { useEffect, useState } from 'react'
import { getCollection, updateDocument } from '@/lib/utils/firestore'
import { ProductVariant, Product } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { AlertCircle, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LowStockAlertsPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [variantsData, productsData] = await Promise.all([
        getCollection<ProductVariant>('productVariants'),
        getCollection<Product>('products'),
      ])
      // Filter for low stock (less than 10) or out of stock
      const lowStockVariants = variantsData.filter(v => v.stock < 10)
      setVariants(lowStockVariants)
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load low stock alerts')
    } finally {
      setIsLoading(false)
    }
  }

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown'
  }

  const handleStockUpdate = async (variantId: string, newStock: number) => {
    try {
      await updateDocument('productVariants', variantId, {
        stock: newStock,
        updatedAt: new Date(),
      })
      toast.success('Stock updated')
      fetchData()
    } catch (error) {
      toast.error('Failed to update stock')
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const outOfStock = variants.filter(v => v.stock === 0)
  const lowStock = variants.filter(v => v.stock > 0 && v.stock < 10)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Low Stock Alerts</h1>
        <Link href="/admin/inventory/stock">
          <Button variant="outline">
            <Package size={16} className="mr-2" />
            Manage All Stock
          </Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-red-600" size={24} />
            <p className="text-sm font-semibold text-red-800">Out of Stock</p>
          </div>
          <p className="text-3xl font-bold text-red-600">{outOfStock.length}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-yellow-600" size={24} />
            <p className="text-sm font-semibold text-yellow-800">Low Stock (&lt;10)</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{lowStock.length}</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {outOfStock.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-red-600">Out of Stock</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Attributes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {outOfStock.map((variant) => (
                      <tr key={variant.id} className="hover:bg-red-50">
                        <td className="px-6 py-4 font-medium">{getProductName(variant.productId)}</td>
                        <td className="px-6 py-4 font-mono text-sm">{variant.sku}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-red-600">0</td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/inventory/stock`}>
                            <Button size="sm">Restock</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {lowStock.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-yellow-600">Low Stock</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-yellow-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase">Attributes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lowStock.map((variant) => (
                      <tr key={variant.id} className="hover:bg-yellow-50">
                        <td className="px-6 py-4 font-medium">{getProductName(variant.productId)}</td>
                        <td className="px-6 py-4 font-mono text-sm">{variant.sku}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-yellow-600">{variant.stock}</td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/inventory/stock`}>
                            <Button size="sm">Restock</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {variants.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="mx-auto text-green-500 mb-4" size={48} />
            <p className="text-xl font-semibold text-gray-700">All products are well stocked!</p>
            <p className="text-gray-500 mt-2">No low stock alerts at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
