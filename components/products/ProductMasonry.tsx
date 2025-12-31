'use client'

import { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'

interface ProductMasonryProps {
  products: Product[]
  onQuickView?: (product: Product) => void
}

export const ProductMasonry: React.FC<ProductMasonryProps> = ({ products, onQuickView }) => {
  // Create columns for masonry layout
  const columns = [[], [], [], []] as Product[][]

  products.forEach((product, index) => {
    columns[index % 4].push(product)
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="space-y-4">
          {column.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="default"
              onQuickView={onQuickView}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

