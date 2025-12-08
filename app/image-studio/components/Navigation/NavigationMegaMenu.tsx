"use client"

/**
 * NavigationMegaMenu Component
 *
 * Main navigation dropdown with sub-options for each major section.
 * Replaces simple tab navigation with rich mega menu.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ChevronDown,
  ImageIcon,
  Layers,
  Package,
  Wand2,
  Upload,
  Palette,
  Grid3X3,
  Box,
  Sparkles,
  Settings2,
  Shirt,
  Coffee,
  CreditCard,
  FileText,
  Smartphone,
  Check
} from 'lucide-react'

// ============ Types ============

export type MainTab = 'generate' | 'logo' | 'mockups'

export interface SubMenuItem {
  id: string
  label: string
  description: string
  icon: typeof ImageIcon
  /** Action identifier for parent to handle */
  action?: string
}

export interface MenuSection {
  id: MainTab
  label: string
  icon: typeof ImageIcon
  gradient: string
  subItems: SubMenuItem[]
}

// ============ Menu Configuration ============

export const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'generate',
    label: 'Image Generator',
    icon: ImageIcon,
    gradient: 'from-[#c99850] to-[#dbb56e]',
    subItems: [
      {
        id: 'text-to-image',
        label: 'Text to Image',
        description: 'Generate images from text prompts',
        icon: Wand2,
        action: 'generate:text-to-image'
      },
      {
        id: 'image-to-image',
        label: 'Image to Image',
        description: 'Transform existing images with AI',
        icon: ImageIcon,
        action: 'generate:image-to-image'
      },
      {
        id: 'style-transfer',
        label: 'Style Transfer',
        description: 'Apply artistic styles to images',
        icon: Palette,
        action: 'generate:style-transfer'
      },
      {
        id: 'upscale',
        label: 'Upscale & Enhance',
        description: 'Improve image quality and resolution',
        icon: Sparkles,
        action: 'generate:upscale'
      },
    ],
  },
  {
    id: 'logo',
    label: 'Logo Generator',
    icon: Layers,
    gradient: 'from-purple-500 to-pink-500',
    subItems: [
      {
        id: 'logo-wizard',
        label: 'Logo Wizard',
        description: 'Guided step-by-step logo creation',
        icon: Wand2,
        action: 'logo:wizard'
      },
      {
        id: 'dot-matrix',
        label: '3D Dot Matrix',
        description: 'Stunning 3D dot matrix logos',
        icon: Grid3X3,
        action: 'logo:dot-matrix'
      },
      {
        id: 'logo-presets',
        label: 'Style Presets',
        description: 'Quick-start with pro templates',
        icon: Settings2,
        action: 'logo:presets'
      },
      {
        id: 'logo-3d',
        label: '3D & Metallic',
        description: 'Premium 3D metallic effects',
        icon: Box,
        action: 'logo:3d-metallic'
      },
    ],
  },
  {
    id: 'mockups',
    label: 'Product Mockups',
    icon: Package,
    gradient: 'from-purple-500 to-pink-500',
    subItems: [
      {
        id: 'apparel',
        label: 'Apparel',
        description: 'T-shirts, hoodies, and more',
        icon: Shirt,
        action: 'mockups:apparel'
      },
      {
        id: 'drinkware',
        label: 'Drinkware',
        description: 'Mugs, tumblers, bottles',
        icon: Coffee,
        action: 'mockups:drinkware'
      },
      {
        id: 'business',
        label: 'Business Cards',
        description: 'Professional card mockups',
        icon: CreditCard,
        action: 'mockups:business'
      },
      {
        id: 'stationery',
        label: 'Stationery',
        description: 'Letterheads, envelopes',
        icon: FileText,
        action: 'mockups:stationery'
      },
      {
        id: 'digital',
        label: 'Digital Devices',
        description: 'Phone cases, app icons',
        icon: Smartphone,
        action: 'mockups:digital'
      },
    ],
  },
]

// ============ Component Props ============

interface NavigationMegaMenuProps {
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  onAction?: (action: string) => void
}

// ============ Component ============

export function NavigationMegaMenu({
  activeTab,
  onTabChange,
  onAction
}: NavigationMegaMenuProps) {
  const [openMenuId, setOpenMenuId] = useState<MainTab | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  // Handle mouse enter with delay
  const handleMouseEnter = useCallback((sectionId: MainTab) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setOpenMenuId(sectionId)
  }, [])

  // Handle mouse leave with delay
  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenuId(null)
    }, 150)
  }, [])

  // Handle sub-item click
  const handleSubItemClick = useCallback((section: MenuSection, item: SubMenuItem) => {
    onTabChange(section.id)
    if (item.action && onAction) {
      onAction(item.action)
    }
    setOpenMenuId(null)
  }, [onTabChange, onAction])

  // Handle main button click (no dropdown, just switch tab)
  const handleMainClick = useCallback((sectionId: MainTab) => {
    onTabChange(sectionId)
    setOpenMenuId(null)
  }, [onTabChange])

  return (
    <div ref={menuRef} className="flex gap-1 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800">
      {MENU_SECTIONS.map((section) => {
        const isActive = activeTab === section.id
        const isOpen = openMenuId === section.id
        const IconComponent = section.icon

        return (
          <div
            key={section.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(section.id)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main Tab Button */}
            <button
              onClick={() => handleMainClick(section.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                isActive
                  ? `bg-linear-to-r ${section.gradient} text-black`
                  : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              {section.label}
              <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              {section.id === 'logo' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20">PNG</span>
              )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                onMouseEnter={() => handleMouseEnter(section.id)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Section Header */}
                <div className={`px-4 py-3 bg-linear-to-r ${section.gradient} bg-opacity-10`}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">{section.label}</span>
                  </div>
                </div>

                {/* Sub Items */}
                <div className="p-2">
                  {section.subItems.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSubItemClick(section, item)}
                        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-zinc-800 group"
                      >
                        <div className="p-1.5 rounded-md bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                          <ItemIcon className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white">{item.label}</div>
                          <div className="text-xs text-zinc-500 group-hover:text-zinc-400 truncate">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
