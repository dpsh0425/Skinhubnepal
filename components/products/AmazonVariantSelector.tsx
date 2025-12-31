'use client'

import { ProductVariant } from '@/lib/types'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface AmazonVariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onSelect: (variant: ProductVariant) => void
}

export const AmazonVariantSelector = ({
  variants,
  selectedVariant,
  onSelect,
}: AmazonVariantSelectorProps) => {
  // Group variants by attribute type (Size, Type, Pack, etc.)
  const attributeGroups: Record<string, { values: string[]; variants: ProductVariant[] }> = {}

  variants.forEach((variant) => {
    Object.entries(variant.attributes).forEach(([key, value]) => {
      if (!attributeGroups[key]) {
        attributeGroups[key] = { values: [], variants: [] }
      }
      if (!attributeGroups[key].values.includes(value)) {
        attributeGroups[key].values.push(value)
        attributeGroups[key].variants.push(variant)
      }
    })
  })

  // Get unique variants for each attribute value
  const getVariantsForAttribute = (attrKey: string, attrValue: string): ProductVariant[] => {
    return variants.filter(
      (v) => v.attributes[attrKey] === attrValue && v.active && v.stock > 0
    )
  }

  const handleAttributeSelect = (attrKey: string, attrValue: string) => {
    const matchingVariants = getVariantsForAttribute(attrKey, attrValue)
    if (matchingVariants.length > 0) {
      // If we have a selected variant, try to keep other attributes the same
      if (selectedVariant) {
        const otherAttributes = { ...selectedVariant.attributes }
        delete otherAttributes[attrKey]
        otherAttributes[attrKey] = attrValue

        // Find variant that matches all attributes
        const exactMatch = variants.find((v) => {
          return Object.entries(otherAttributes).every(
            ([k, val]) => v.attributes[k] === val
          ) && v.active && v.stock > 0
        })

        if (exactMatch) {
          onSelect(exactMatch)
          return
        }
      }

      // Otherwise, select the first available variant with this attribute
      onSelect(matchingVariants[0])
    }
  }

  const isAttributeValueSelected = (attrKey: string, attrValue: string): boolean => {
    return selectedVariant?.attributes[attrKey] === attrValue
  }

  const isAttributeValueAvailable = (attrKey: string, attrValue: string): boolean => {
    return getVariantsForAttribute(attrKey, attrValue).length > 0
  }

  return (
    <div className="space-y-6">
      {Object.entries(attributeGroups).map(([attrKey, { values }]) => (
        <div key={attrKey} className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-900 capitalize">
              {attrKey}:
            </label>
            {selectedVariant && selectedVariant.attributes[attrKey] && (
              <span className="text-sm text-primary-600 font-medium">
                {selectedVariant.attributes[attrKey]}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const isSelected = isAttributeValueSelected(attrKey, value)
              const isAvailable = isAttributeValueAvailable(attrKey, value)
              const matchingVariants = getVariantsForAttribute(attrKey, value)
              const lowestPrice = matchingVariants.length > 0
                ? Math.min(...matchingVariants.map((v) => v.price))
                : 0

              return (
                <button
                  key={value}
                  onClick={() => isAvailable && handleAttributeSelect(attrKey, value)}
                  disabled={!isAvailable}
                  className={`
                    relative px-4 py-2.5 rounded-lg border-2 font-medium text-sm
                    transition-all duration-200 min-w-[80px]
                    ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md scale-105'
                        : isAvailable
                        ? 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  {isSelected && (
                    <CheckCircle
                      size={16}
                      className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full"
                    />
                  )}
                  <div className="flex flex-col items-center">
                    <span>{value}</span>
                    {isAvailable && matchingVariants.length > 0 && (
                      <span className="text-xs text-gray-500 mt-0.5">
                        Rs. {lowestPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">Selected Variant:</p>
              <p className="text-sm text-gray-600 mb-2">
                {Object.entries(selectedVariant.attributes)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(' • ')}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-500">SKU: </span>
                  <span className="font-mono font-semibold">{selectedVariant.sku}</span>
                </div>
                <div>
                  <span className="text-gray-500">Stock: </span>
                  <span
                    className={`font-semibold ${
                      selectedVariant.stock === 0
                        ? 'text-red-600'
                        : selectedVariant.stock < 10
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {selectedVariant.stock > 0
                      ? `${selectedVariant.stock} available`
                      : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>
            {selectedVariant.stock > 0 && selectedVariant.stock < 10 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertCircle size={16} />
                <span className="text-xs font-medium">Low Stock</span>
              </div>
            )}
            {selectedVariant.stock === 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle size={16} />
                <span className="text-xs font-medium">Out of Stock</span>
              </div>
            )}
          </div>
        </div>
      )}

      {variants.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            ⚠️ No variants available. Please contact us for availability.
          </p>
        </div>
      )}
    </div>
  )
}

