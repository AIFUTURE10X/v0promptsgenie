"use client"

import { useState } from 'react'
import { Pipette } from 'lucide-react'
import { Input } from '@/components/ui/input'

// ============================================
// TYPES
// ============================================

export interface ColorOption {
  name: string
  value: string
  hex: string
}

export type ColorCategory = 'primary' | 'metallic' | 'neon' | 'pastel' | 'earth' | 'gradient'

// ============================================
// EXPANDED COLOR PALETTES
// ============================================

export const COLOR_CATEGORIES: { id: ColorCategory; label: string; icon: string }[] = [
  { id: 'primary', label: 'Primary', icon: '🎨' },
  { id: 'metallic', label: 'Metallic', icon: '✨' },
  { id: 'neon', label: 'Neon', icon: '💡' },
  { id: 'pastel', label: 'Pastel', icon: '🌸' },
  { id: 'earth', label: 'Earth', icon: '🌿' },
  { id: 'gradient', label: 'Gradient', icon: '🌈' },
]

export const EXPANDED_COLOR_PRESETS: Record<ColorCategory, ColorOption[]> = {
  primary: [
    { name: 'Red', value: 'red', hex: '#EF4444' },
    { name: 'Crimson', value: 'crimson', hex: '#DC143C' },
    { name: 'Orange', value: 'orange', hex: '#F97316' },
    { name: 'Amber', value: 'amber', hex: '#F59E0B' },
    { name: 'Yellow', value: 'yellow', hex: '#EAB308' },
    { name: 'Lime', value: 'lime', hex: '#84CC16' },
    { name: 'Green', value: 'green', hex: '#22C55E' },
    { name: 'Emerald', value: 'emerald', hex: '#10B981' },
    { name: 'Teal', value: 'teal', hex: '#14B8A6' },
    { name: 'Cyan', value: 'cyan', hex: '#06B6D4' },
    { name: 'Sky', value: 'sky', hex: '#0EA5E9' },
    { name: 'Blue', value: 'blue', hex: '#3B82F6' },
    { name: 'Indigo', value: 'indigo', hex: '#6366F1' },
    { name: 'Violet', value: 'violet', hex: '#8B5CF6' },
    { name: 'Purple', value: 'purple', hex: '#A855F7' },
    { name: 'Fuchsia', value: 'fuchsia', hex: '#D946EF' },
    { name: 'Pink', value: 'pink', hex: '#EC4899' },
    { name: 'Rose', value: 'rose', hex: '#F43F5E' },
    { name: 'White', value: 'white', hex: '#FFFFFF' },
    { name: 'Black', value: 'black', hex: '#000000' },
  ],
  metallic: [
    { name: 'Chrome', value: 'chrome', hex: '#C0C0C0' },
    { name: 'Silver', value: 'silver', hex: '#E8E8E8' },
    { name: 'Gold', value: 'gold', hex: '#FFD700' },
    { name: 'Rose Gold', value: 'rose-gold', hex: '#B76E79' },
    { name: 'Bronze', value: 'bronze', hex: '#CD7F32' },
    { name: 'Copper', value: 'copper', hex: '#B87333' },
    { name: 'Platinum', value: 'platinum', hex: '#E5E4E2' },
    { name: 'Titanium', value: 'titanium', hex: '#878681' },
    { name: 'Brass', value: 'brass', hex: '#B5A642' },
    { name: 'Pewter', value: 'pewter', hex: '#96A8A1' },
  ],
  neon: [
    { name: 'Neon Pink', value: 'neon-pink', hex: '#FF10F0' },
    { name: 'Neon Magenta', value: 'neon-magenta', hex: '#FF00FF' },
    { name: 'Neon Red', value: 'neon-red', hex: '#FF3131' },
    { name: 'Neon Orange', value: 'neon-orange', hex: '#FF6600' },
    { name: 'Neon Yellow', value: 'neon-yellow', hex: '#FFFF00' },
    { name: 'Neon Green', value: 'neon-green', hex: '#39FF14' },
    { name: 'Neon Cyan', value: 'neon-cyan', hex: '#00FFFF' },
    { name: 'Neon Blue', value: 'neon-blue', hex: '#4D4DFF' },
    { name: 'Neon Purple', value: 'neon-purple', hex: '#BC13FE' },
    { name: 'Electric Blue', value: 'electric-blue', hex: '#7DF9FF' },
  ],
  pastel: [
    { name: 'Blush', value: 'blush', hex: '#FFB6C1' },
    { name: 'Peach', value: 'peach', hex: '#FFDAB9' },
    { name: 'Cream', value: 'cream', hex: '#FFFDD0' },
    { name: 'Mint', value: 'mint', hex: '#98FF98' },
    { name: 'Seafoam', value: 'seafoam', hex: '#93E9BE' },
    { name: 'Sky Blue', value: 'sky-blue', hex: '#87CEEB' },
    { name: 'Periwinkle', value: 'periwinkle', hex: '#CCCCFF' },
    { name: 'Lavender', value: 'lavender', hex: '#E6E6FA' },
    { name: 'Lilac', value: 'lilac', hex: '#DCD0FF' },
    { name: 'Baby Pink', value: 'baby-pink', hex: '#F4C2C2' },
  ],
  earth: [
    { name: 'Terracotta', value: 'terracotta', hex: '#E2725B' },
    { name: 'Rust', value: 'rust', hex: '#B7410E' },
    { name: 'Sienna', value: 'sienna', hex: '#A0522D' },
    { name: 'Chocolate', value: 'chocolate', hex: '#7B3F00' },
    { name: 'Coffee', value: 'coffee', hex: '#6F4E37' },
    { name: 'Olive', value: 'olive', hex: '#808000' },
    { name: 'Forest', value: 'forest', hex: '#228B22' },
    { name: 'Sage', value: 'sage', hex: '#9DC183' },
    { name: 'Sand', value: 'sand', hex: '#C2B280' },
    { name: 'Charcoal', value: 'charcoal', hex: '#36454F' },
  ],
  gradient: [
    { name: 'Sunset', value: 'sunset-gradient', hex: '#FF6B6B' },
    { name: 'Ocean', value: 'ocean-gradient', hex: '#667EEA' },
    { name: 'Aurora', value: 'aurora-gradient', hex: '#A8EDEA' },
    { name: 'Fire', value: 'fire-gradient', hex: '#F12711' },
    { name: 'Galaxy', value: 'galaxy-gradient', hex: '#8E2DE2' },
    { name: 'Tropical', value: 'tropical-gradient', hex: '#11998E' },
    { name: 'Cotton Candy', value: 'cotton-candy-gradient', hex: '#FFECD2' },
    { name: 'Midnight', value: 'midnight-gradient', hex: '#232526' },
  ],
}

// Gradient definitions for gradient category
export const GRADIENT_DEFINITIONS: Record<string, string> = {
  'sunset-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #FFA07A 50%, #FFD93D 100%)',
  'ocean-gradient': 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #6B8DD6 100%)',
  'aurora-gradient': 'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 50%, #D299C2 100%)',
  'fire-gradient': 'linear-gradient(135deg, #F12711 0%, #F5AF19 100%)',
  'galaxy-gradient': 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 50%, #1A1A2E 100%)',
  'tropical-gradient': 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',
  'cotton-candy-gradient': 'linear-gradient(135deg, #FFECD2 0%, #FCB69F 50%, #FF9A9E 100%)',
  'midnight-gradient': 'linear-gradient(135deg, #232526 0%, #414345 50%, #1a1a2e 100%)',
}

// ============================================
// COMPONENT PROPS
// ============================================

interface ExpandedColorPickerProps {
  label: string
  selectedColor: ColorOption | null
  onSelectColor: (color: ColorOption | null) => void
  customColor?: string | null
  onCustomColorChange?: (hex: string | null) => void
  showCustomInput?: boolean
}

// ============================================
// COMPONENT
// ============================================

export function ExpandedColorPicker({
  label,
  selectedColor,
  onSelectColor,
  customColor,
  onCustomColorChange,
  showCustomInput = true,
}: ExpandedColorPickerProps) {
  const [activeCategory, setActiveCategory] = useState<ColorCategory>('primary')
  const [customHex, setCustomHex] = useState(customColor || '')

  const handleColorClick = (color: ColorOption) => {
    if (selectedColor?.value === color.value) {
      onSelectColor(null)
    } else {
      onSelectColor(color)
      if (onCustomColorChange) {
        onCustomColorChange(null) // Clear custom when preset selected
      }
    }
  }

  const handleCustomHexChange = (hex: string) => {
    setCustomHex(hex)
    // Validate hex and update
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      if (onCustomColorChange) {
        onCustomColorChange(hex)
      }
      onSelectColor(null) // Clear preset when custom entered
    }
  }

  const isGradientCategory = activeCategory === 'gradient'

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="text-sm font-medium text-zinc-300">{label}</label>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1">
        {COLOR_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-10 gap-1.5 p-2 bg-zinc-800/50 rounded-lg">
        {EXPANDED_COLOR_PRESETS[activeCategory].map((color) => {
          const isGradient = isGradientCategory && GRADIENT_DEFINITIONS[color.value]
          return (
            <button
              key={color.value}
              onClick={() => handleColorClick(color)}
              className={`relative w-7 h-7 rounded-md transition-all hover:scale-110 ${
                selectedColor?.value === color.value
                  ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-zinc-900'
                  : 'border border-zinc-600 hover:border-zinc-400'
              }`}
              style={{
                background: isGradient
                  ? GRADIENT_DEFINITIONS[color.value]
                  : color.hex
              }}
              title={color.name}
            />
          )
        })}
      </div>

      {/* Custom Color Input */}
      {showCustomInput && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Pipette className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={customHex}
              onChange={(e) => handleCustomHexChange(e.target.value)}
              placeholder="#FF5500"
              className="pl-8 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-8 text-sm font-mono"
            />
          </div>
          {customHex && /^#[0-9A-Fa-f]{6}$/.test(customHex) && (
            <div
              className="w-8 h-8 rounded-md border border-zinc-600"
              style={{ backgroundColor: customHex }}
            />
          )}
        </div>
      )}

      {/* Selected Color Display */}
      {(selectedColor || (customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor))) && (
        <div className="flex items-center justify-between p-2 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-zinc-600"
              style={{
                background: selectedColor
                  ? (GRADIENT_DEFINITIONS[selectedColor.value] || selectedColor.hex)
                  : customColor || undefined
              }}
            />
            <span className="text-xs text-zinc-300">
              {selectedColor ? selectedColor.name : `Custom: ${customColor}`}
            </span>
          </div>
          <button
            onClick={() => {
              onSelectColor(null)
              if (onCustomColorChange) onCustomColorChange(null)
              setCustomHex('')
            }}
            className="text-xs text-zinc-500 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
