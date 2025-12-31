'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface AboutThisProductProps {
  bullets: string[]
}

export const AboutThisProduct = ({ bullets }: AboutThisProductProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayBullets = isExpanded ? bullets : bullets.slice(0, 5)

  if (!bullets || bullets.length === 0) return null

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">About This Product</h2>
      <ul className="space-y-3">
        {displayBullets.map((bullet, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-primary-600 font-bold mt-1 flex-shrink-0">•</span>
            <span className="text-gray-700 leading-relaxed">{bullet}</span>
          </li>
        ))}
      </ul>
      {bullets.length > 5 && (
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
              Show More ({bullets.length - 5} more)
              <ChevronDown size={18} />
            </>
          )}
        </button>
      )}
    </div>
  )
}

