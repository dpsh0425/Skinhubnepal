'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
  }

  return (
    <Link href="/home" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-blue-400 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl p-2 md:p-2.5 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
          <Sparkles className="text-white" size={size === 'sm' ? 18 : size === 'md' ? 22 : 28} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold bg-gradient-to-r from-primary-600 via-blue-600 to-primary-600 bg-clip-text text-transparent ${sizeClasses[size]} leading-tight`}>
          SkinHub
        </span>
        <span className={`text-gray-600 font-medium ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs md:text-sm' : 'text-sm md:text-base'} -mt-0.5`}>
          Nepal
        </span>
      </div>
    </Link>
  )
}
