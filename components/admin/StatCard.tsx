'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
  bgColor?: string
  iconBg?: string
  href?: string
}

export function StatCard({ title, value, icon: Icon, color = 'text-primary-600', bgColor = 'bg-primary-50', iconBg = 'bg-primary-100', href }: StatCardProps) {
  const content = (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all ${href ? 'hover:border-primary-300 cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${iconBg} p-3 rounded-xl`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href}>
        {content}
      </a>
    )
  }

  return content
}

