'use client'

import { Grid, List, LayoutGrid } from 'lucide-react'

export type ViewMode = 'grid' | 'list' | 'masonry'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => onChange('grid')}
        className={`p-2 rounded-lg transition-all ${
          mode === 'grid'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Grid View"
      >
        <Grid size={18} />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-2 rounded-lg transition-all ${
          mode === 'list'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="List View"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => onChange('masonry')}
        className={`p-2 rounded-lg transition-all ${
          mode === 'masonry'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Masonry View"
      >
        <LayoutGrid size={18} />
      </button>
    </div>
  )
}

