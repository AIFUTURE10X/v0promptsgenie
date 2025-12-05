"use client"

import { useState } from 'react'
import { X, Palette } from 'lucide-react'

// ============================================
// TYPES
// ============================================

export interface LetterColorConfig {
  position: number  // 1-based letter position
  color: ColorOption
}

export interface ColorOption {
  name: string
  value: string
  hex: string
}

// ============================================
// EXPANDED COLOR PALETTE
// ============================================

export const LETTER_COLOR_PALETTE: ColorOption[] = [
  // Metallics
  { name: 'Gold', value: 'gold', hex: '#FFD700' },
  { name: 'Silver', value: 'silver', hex: '#C0C0C0' },
  { name: 'Rose Gold', value: 'rose-gold', hex: '#B76E79' },
  { name: 'Bronze', value: 'bronze', hex: '#CD7F32' },
  { name: 'Copper', value: 'copper', hex: '#B87333' },
  { name: 'Platinum', value: 'platinum', hex: '#E5E4E2' },

  // Primary
  { name: 'Red', value: 'red', hex: '#EF4444' },
  { name: 'Blue', value: 'blue', hex: '#3B82F6' },
  { name: 'Green', value: 'green', hex: '#22C55E' },
  { name: 'Yellow', value: 'yellow', hex: '#EAB308' },
  { name: 'Orange', value: 'orange', hex: '#F97316' },
  { name: 'Purple', value: 'purple', hex: '#8B5CF6' },

  // Neon
  { name: 'Neon Pink', value: 'neon-pink', hex: '#FF10F0' },
  { name: 'Neon Cyan', value: 'neon-cyan', hex: '#00FFFF' },
  { name: 'Neon Green', value: 'neon-green', hex: '#39FF14' },
  { name: 'Neon Orange', value: 'neon-orange', hex: '#FF6600' },

  // Pastels
  { name: 'Blush', value: 'blush', hex: '#FFB6C1' },
  { name: 'Sky', value: 'sky', hex: '#87CEEB' },
  { name: 'Mint', value: 'mint', hex: '#98FF98' },
  { name: 'Lavender', value: 'lavender', hex: '#E6E6FA' },

  // Darks
  { name: 'Black', value: 'black', hex: '#1a1a1a' },
  { name: 'Charcoal', value: 'charcoal', hex: '#36454F' },
  { name: 'Navy', value: 'navy', hex: '#000080' },
  { name: 'Burgundy', value: 'burgundy', hex: '#800020' },
]

// ============================================
// COMPONENT PROPS
// ============================================

interface LetterColorPickerProps {
  brandName: string
  letterColors: LetterColorConfig[]
  onLetterColorsChange: (colors: LetterColorConfig[]) => void
}

// ============================================
// COMPONENT
// ============================================

export function LetterColorPicker({
  brandName,
  letterColors,
  onLetterColorsChange,
}: LetterColorPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)

  // Remove spaces for letter display
  const letters = brandName.replace(/\s/g, '').split('')

  const getColorForPosition = (position: number): ColorOption | undefined => {
    return letterColors.find(lc => lc.position === position)?.color
  }

  const handleLetterClick = (position: number) => {
    if (selectedPosition === position) {
      setSelectedPosition(null)
    } else {
      setSelectedPosition(position)
    }
  }

  const handleColorSelect = (color: ColorOption) => {
    if (selectedPosition === null) return

    const existingIndex = letterColors.findIndex(lc => lc.position === selectedPosition)

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...letterColors]
      updated[existingIndex] = { position: selectedPosition, color }
      onLetterColorsChange(updated)
    } else {
      // Add new
      onLetterColorsChange([...letterColors, { position: selectedPosition, color }])
    }
  }

  const handleRemoveColor = (position: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onLetterColorsChange(letterColors.filter(lc => lc.position !== position))
  }

  const handleClearAll = () => {
    onLetterColorsChange([])
    setSelectedPosition(null)
  }

  if (!brandName.trim()) {
    return (
      <div className="p-4 bg-zinc-800/50 rounded-lg text-center text-zinc-500 text-sm">
        Enter a brand name to customize letter colors
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />
          Per-Letter Color
        </label>
        {letterColors.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Instructions */}
      <p className="text-xs text-zinc-500">
        Click a letter to assign a unique color. Great for highlighting specific characters.
      </p>

      {/* Letter Selection */}
      <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-800/50 rounded-lg">
        {letters.map((letter, index) => {
          const position = index + 1
          const assignedColor = getColorForPosition(position)
          const isSelected = selectedPosition === position

          return (
            <button
              key={index}
              onClick={() => handleLetterClick(position)}
              className={`relative w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                isSelected
                  ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-zinc-900 scale-110'
                  : 'hover:scale-105'
              } ${
                assignedColor
                  ? 'border-2'
                  : 'border border-zinc-600 bg-zinc-700 text-white hover:border-zinc-500'
              }`}
              style={assignedColor ? {
                backgroundColor: assignedColor.hex,
                color: isLightColor(assignedColor.hex) ? '#000' : '#fff',
                borderColor: assignedColor.hex
              } : undefined}
            >
              {letter.toUpperCase()}

              {/* Position indicator */}
              <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-zinc-900 text-[9px] text-zinc-400 flex items-center justify-center border border-zinc-700">
                {position}
              </span>

              {/* Remove button for assigned colors */}
              {assignedColor && (
                <button
                  onClick={(e) => handleRemoveColor(position, e)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </button>
          )
        })}
      </div>

      {/* Color Palette (shown when letter selected) */}
      {selectedPosition !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Select color for letter #{selectedPosition}:
              <span className="font-bold text-white ml-1">
                {letters[selectedPosition - 1]?.toUpperCase()}
              </span>
            </span>
            <button
              onClick={() => setSelectedPosition(null)}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-8 gap-1.5 p-2 bg-zinc-800 rounded-lg">
            {LETTER_COLOR_PALETTE.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color)}
                className="w-7 h-7 rounded-md border-2 border-transparent hover:border-white transition-all hover:scale-110"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary of assigned colors */}
      {letterColors.length > 0 && (
        <div className="p-2 bg-zinc-800/30 rounded-lg">
          <div className="text-[10px] text-zinc-500 mb-1.5">Assigned Colors:</div>
          <div className="flex flex-wrap gap-1">
            {letterColors
              .sort((a, b) => a.position - b.position)
              .map((lc) => (
                <span
                  key={lc.position}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: `${lc.color.hex}33`,
                    color: lc.color.hex
                  }}
                >
                  #{lc.position} {letters[lc.position - 1]?.toUpperCase()}: {lc.color.name}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to determine if a color is light (for text contrast)
function isLightColor(hex: string): boolean {
  const c = hex.substring(1)
  const rgb = parseInt(c, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > 150
}
