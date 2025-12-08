"use client"

/**
 * MenuSectionCard Component
 *
 * Reusable card for mega menu sections.
 * Gold gradient style icons with button-like items.
 */

import { Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItemConfig {
  id: string
  label: string
  description: string
  icon: LucideIcon
}

interface MenuSectionCardProps {
  title: string
  items: MenuItemConfig[]
  activeItemId?: string
  onSelect: (id: string) => void
}

export function MenuSectionCard({
  title,
  items,
  activeItemId,
  onSelect
}: MenuSectionCardProps) {
  return (
    <div className="flex flex-col">
      {/* Section Header */}
      <div className="px-3 py-2 border-b border-zinc-700/50">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {title}
        </span>
      </div>

      {/* Items */}
      <div className="p-2 space-y-2">
        {items.map((item) => {
          const isActive = item.id === activeItemId
          const IconComponent = item.icon

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all group border ${
                isActive
                  ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] border-[#dbb56e] shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700/80 hover:border-zinc-600'
              }`}
            >
              {/* Gold gradient icon container */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-black/20'
                    : ''
                }`}
                style={!isActive ? {
                  background: "linear-gradient(135deg, #c99850 0%, #dbb56e 50%, #c99850 100%)",
                } : undefined}
              >
                <IconComponent className={`w-4 h-4 ${
                  isActive ? 'text-black' : 'text-black'
                }`} />
              </div>

              {/* Label and description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    isActive ? 'text-black' : 'text-white group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && <Check className="w-4 h-4 text-black" />}
                </div>
                <p className={`text-xs mt-0.5 ${
                  isActive ? 'text-black/70' : 'text-zinc-400 group-hover:text-zinc-300'
                }`}>
                  {item.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
