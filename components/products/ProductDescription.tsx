'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface ProductDescriptionProps {
  description: string
}

export const ProductDescription = ({ description }: ProductDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = description.length > 300
  const displayText = isExpanded || !isLong ? description : description.substring(0, 300) + '...'

  if (!description) return null

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Product Description</h2>
      <div className="prose prose-sm max-w-none">
        <p className={`text-gray-700 leading-relaxed whitespace-pre-line ${!isExpanded && isLong ? 'line-clamp-6' : ''}`}>
          {displayText}
        </p>
      </div>
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 transition-colors"
        >
          {isExpanded ? (
            <>
              Show Less
              <ChevronUp size={18} />
            </>
          ) : (
            <>
              Read More
              <ChevronDown size={18} />
            </>
          )}
        </button>
      )}
    </div>
  )
}

