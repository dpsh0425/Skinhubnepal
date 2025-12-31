'use client'

import { X } from 'lucide-react'

interface FilterChip {
  label: string
  value: string
  type: 'brand' | 'category' | 'skinType' | 'price' | 'sort'
}

interface FilterChipsProps {
  chips: FilterChip[]
  onRemove: (chip: FilterChip) => void
  onClearAll: () => void
}

export const FilterChips: React.FC<FilterChipsProps> = ({ chips, onRemove, onClearAll }) => {
  if (chips.length === 0) return null

  const getChipColor = (type: string) => {
    switch (type) {
      case 'brand':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'category':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'skinType':
        return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'price':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'sort':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((chip, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all hover:scale-105 ${getChipColor(
            chip.type
          )}`}
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemove(chip)}
            className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

