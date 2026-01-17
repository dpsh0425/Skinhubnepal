'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { StickyCart } from '@/components/layout/StickyCart'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductList } from '@/components/products/ProductList'
import { ProductMasonry } from '@/components/products/ProductMasonry'
import { ProductQuickView } from '@/components/products/ProductQuickView'
import { ViewModeToggle, ViewMode } from '@/components/products/ViewModeToggle'
import { FilterChips } from '@/components/products/FilterChips'
import { Product, Brand, ProductVariant } from '@/lib/types'
import { getCollection } from '@/lib/utils/firestore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { 
  Filter, 
  X, 
  SlidersHorizontal, 
  Sparkles,
  TrendingUp,
  Star,
  DollarSign,
  Search
} from 'lucide-react'

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedSkinType, setSelectedSkinType] = useState(searchParams.get('skinType') || '')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const productsPerPage = 20
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [brandSearchQuery, setBrandSearchQuery] = useState('')
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [priceRange, setPriceRange] = useState<{ min: number | ''; max: number | '' }>({ min: '', max: '' })

  useEffect(() => {
    const fetchData = async () => {
      const [productsData, variantsData] = await Promise.all([
        getCollection<Product>('products'),
        getCollection<ProductVariant>('productVariants'),
      ])
      // Only show published products to customers
      const publishedProducts = productsData.filter(p => p.status === 'published')
      setProducts(publishedProducts)
      
      // Filter active variants with stock
      const activeVariants = variantsData.filter(v => v.active && v.stock > 0)
      setVariants(activeVariants)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchBrands = async () => {
      const data = await getCollection<Brand>('brands')
      setAllBrands(data)
    }
    fetchBrands()
  }, [])

  // Filter brands based on search query
  const filteredBrands = useMemo(() => {
    if (!brandSearchQuery.trim()) {
      return allBrands.filter(brand => 
        products.some(p => p.brand === brand.name && p.status === 'published')
      )
    }
    return allBrands.filter(brand => 
      brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase()) &&
      products.some(p => p.brand === brand.name && p.status === 'published')
    )
  }, [allBrands, brandSearchQuery, products])

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products])
  // Normalize skin types to lowercase and remove duplicates
  const skinTypes = useMemo(() => {
    const allTypes = products.flatMap(p => p.skinType.map(t => t.toLowerCase()))
    return Array.from(new Set(allTypes))
  }, [products])

  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand)
    }

    // Skin type filter (case-insensitive)
    if (selectedSkinType) {
      filtered = filtered.filter(p => 
        p.skinType.some(type => type.toLowerCase() === selectedSkinType.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Price filter - check if product has any variant within price range
    if (priceRange.min !== '' || priceRange.max !== '') {
      filtered = filtered.filter(product => {
        const productVariants = variants.filter(v => v.productId === product.id)
        if (productVariants.length === 0) return false
        
        // Check if any variant price falls within the range
        return productVariants.some(v => {
          const minCheck = priceRange.min === '' || v.price >= priceRange.min
          const maxCheck = priceRange.max === '' || v.price <= priceRange.max
          return minCheck && maxCheck
        })
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
        case 'price-high':
          // Price sorting not available at product level (variants have prices)
          // Fall through to name sorting
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'popular':
          return b.reviewCount - a.reviewCount
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
    setPage(1)
  }, [products, variants, searchQuery, selectedBrand, selectedSkinType, selectedCategory, priceRange, sortBy])

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * productsPerPage
    return filteredProducts.slice(start, start + productsPerPage)
  }, [filteredProducts, page])

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Default price range is blank
  const defaultPriceRange = { min: '' as const, max: '' as const }

  const activeFilters = useMemo(() => {
    const chips = []
    if (selectedBrand) chips.push({ label: `Brand: ${selectedBrand}`, value: selectedBrand, type: 'brand' as const })
    if (selectedCategory) chips.push({ label: `Category: ${selectedCategory}`, value: selectedCategory, type: 'category' as const })
    if (selectedSkinType) chips.push({ label: `Skin: ${selectedSkinType}`, value: selectedSkinType, type: 'skinType' as const })
    // Only show price filter chip if at least one value is set
    if (priceRange.min !== '' || priceRange.max !== '') {
      const minLabel = priceRange.min !== '' ? `Rs. ${priceRange.min}` : 'Any'
      const maxLabel = priceRange.max !== '' ? `Rs. ${priceRange.max}` : 'Any'
      chips.push({ label: `Price: ${minLabel} - ${maxLabel}`, value: `${priceRange.min}-${priceRange.max}`, type: 'price' as const })
    }
    if (sortBy !== 'name') {
      const sortLabels: Record<string, string> = {
        'price-low': 'Price: Low to High',
        'price-high': 'Price: High to Low',
        'rating': 'Rating',
        'newest': 'Newest',
        'popular': 'Popular',
      }
      chips.push({ label: sortLabels[sortBy] || sortBy, value: sortBy, type: 'sort' as const })
    }
    return chips
  }, [selectedBrand, selectedCategory, selectedSkinType, priceRange, defaultPriceRange, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBrand('')
    setSelectedSkinType('')
    setSelectedCategory('')
    setPriceRange(defaultPriceRange)
    setSortBy('name')
  }

  const removeFilter = (chip: { type: string; value: string }) => {
    switch (chip.type) {
      case 'brand':
        setSelectedBrand('')
        break
      case 'category':
        setSelectedCategory('')
        break
      case 'skinType':
        setSelectedSkinType('')
        break
      case 'price':
        setPriceRange(defaultPriceRange)
        break
      case 'sort':
        setSortBy('name')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
            Discover Your Perfect Skincare
          </h1>
          <p className="text-gray-600 text-lg">Explore our curated collection of premium products</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search products, brands, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-0"
            />
            <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <SlidersHorizontal size={18} className="mr-2" />
              Filters
            </Button>
            <span className="text-sm text-gray-600 font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Active Filters */}
        <FilterChips
          chips={activeFilters}
          onRemove={removeFilter}
          onClearAll={clearFilters}
        />

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <SlidersHorizontal size={20} />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Sort */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <Star size={16} />
                    Brand
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0"
                    />
                    {brandSearchQuery && (
                      <button
                        onClick={() => {
                          setBrandSearchQuery('')
                          setSelectedBrand('')
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {brandSearchQuery && (
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {filteredBrands.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2">No brands found</p>
                      ) : (
                        filteredBrands.map((brand) => (
                          <button
                            key={brand.id}
                            onClick={() => {
                              setSelectedBrand(brand.name)
                              setBrandSearchQuery(brand.name)
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                              selectedBrand === brand.name
                                ? 'bg-primary-100 text-primary-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {brand.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  {selectedBrand && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-600">Selected:</span>
                      <span className="text-sm font-medium text-primary-600">{selectedBrand}</span>
                      <button
                        onClick={() => {
                          setSelectedBrand('')
                          setBrandSearchQuery('')
                        }}
                        className="ml-auto text-xs text-red-600 hover:text-red-700"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skin Type Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Skin Type</label>
                  <div className="space-y-2">
                    {skinTypes.map((skinType) => (
                      <label key={skinType} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="skinType"
                          value={skinType}
                          checked={selectedSkinType === skinType}
                          onChange={(e) => setSelectedSkinType(e.target.checked ? skinType : '')}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-primary-600 capitalize">{skinType}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                    <DollarSign size={16} />
                    Price Range
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rs.</span>
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value)
                            setPriceRange({ ...priceRange, min: value === '' ? '' : Math.max(0, value) })
                          }}
                          className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0"
                          placeholder="Min"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center text-gray-400">-</div>
                      <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rs.</span>
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => {
                            const value = e.target.value === '' ? '' : Number(e.target.value)
                            const minValue = priceRange.min === '' ? 0 : priceRange.min
                            setPriceRange({ ...priceRange, max: value === '' ? '' : Math.max(minValue, value) })
                          }}
                          className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0"
                          placeholder="Max"
                          min={priceRange.min === '' ? 0 : priceRange.min}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Products Display */}
          <div className="md:col-span-3">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-semibold text-gray-700 mb-2">No products found</p>
                <p className="text-gray-500 mb-6">Try adjusting your filters</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                    {paginatedProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        variant="default"
                        onQuickView={setQuickViewProduct}
                        priority={index < 6}
                      />
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <ProductList
                    products={paginatedProducts}
                    onQuickView={setQuickViewProduct}
                  />
                )}

                {viewMode === 'masonry' && (
                  <ProductMasonry
                    products={paginatedProducts}
                    onQuickView={setQuickViewProduct}
                  />
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                page === pageNum
                                  ? 'bg-primary-600 text-white shadow-lg'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        } else if (pageNum === page - 2 || pageNum === page + 2) {
                          return <span key={pageNum} className="px-2">...</span>
                        }
                        return null
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <StickyCart />
      <BottomNav />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-skincare-light">
        <Header />
        <main className="container mx-auto px-4 py-12 pb-24 text-center">
          <p>Loading...</p>
        </main>
        <BottomNav />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}
