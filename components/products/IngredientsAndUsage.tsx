'use client'

import { useState } from 'react'
import { Beaker, BookOpen } from 'lucide-react'

interface IngredientsAndUsageProps {
  ingredients: string[]
  usageInstructions: string
}

export const IngredientsAndUsage = ({ ingredients, usageInstructions }: IngredientsAndUsageProps) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'usage'>('ingredients')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('ingredients')}
          className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
            activeTab === 'ingredients'
              ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
          }`}
        >
          <Beaker size={20} className="inline mr-2" />
          Key Ingredients
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`flex-1 px-6 py-4 font-semibold text-center transition-colors ${
            activeTab === 'usage'
              ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
          }`}
        >
          <BookOpen size={20} className="inline mr-2" />
          How to Use
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-8">
        {activeTab === 'ingredients' ? (
          <div>
            {ingredients && ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No ingredients listed.</p>
            )}
          </div>
        ) : (
          <div>
            {usageInstructions ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {usageInstructions}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No usage instructions available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

