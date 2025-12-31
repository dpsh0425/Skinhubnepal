'use client'

import { useEffect, useState } from 'react'
import { getCollection, updateDocument } from '@/lib/utils/firestore'
import { ProductVariant, Product } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Search, Package } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function StockManagementPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredVariants, setFilteredVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterVariants()
  }, [variants, searchQuery, stockFilter])

  const fetchData = async () => {
    try {
      const [variantsData, productsData] = await Promise.all([
        getCollection<ProductVariant>('productVariants'),
        getCollection<Product>('products'),
      ])
      setVariants(variantsData)
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load stock data')
    } finally {
      setIsLoading(false)
    }
  }

  const filterVariants = () => {
    let filtered = [...variants]

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getProductName(v.productId).toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (stockFilter === 'low') {
      filtered = filtered.filter(v => v.stock > 0 && v.stock < 10)
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(v => v.stock === 0)
    }

    setFilteredVariants(filtered)
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

  const lowStockCount = variants.filter(v => v.stock > 0 && v.stock < 10).length
  const outOfStockCount = variants.filter(v => v.stock === 0).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Stock Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Variants</p>
          <p className="text-2xl font-bold">{variants.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by SKU or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock (&lt;10)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attributes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Update Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVariants.map((variant) => {
                const StockEditor = () => {
                  const [newStock, setNewStock] = useState(variant.stock.toString())
                  return (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        min="0"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleStockUpdate(variant.id, Number(newStock))}
                      >
                        Update
                      </Button>
                    </div>
                  )
                }

                return (
                  <tr key={variant.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          variant.stock === 0
                            ? 'text-red-600'
                            : variant.stock < 10
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {variant.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StockEditor />
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          variant.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : variant.stock < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {variant.stock === 0
                          ? 'Out of Stock'
                          : variant.stock < 10
                          ? 'Low Stock'
                          : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredVariants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No variants found</p>
          </div>
        )}
      </div>
    </div>
  )
}
