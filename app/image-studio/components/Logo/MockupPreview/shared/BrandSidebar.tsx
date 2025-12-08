"use client"

/**
 * Brand Sidebar Component
 *
 * Right sidebar with brand text settings: visibility, content, font, color,
 * effects, rotation, and size controls. Supports multiple text items.
 */

import { useState } from 'react'
import { Eye, EyeOff, ZoomIn, ZoomOut, Plus, Trash2, GripVertical, Pencil, ChevronDown } from 'lucide-react'
import { REAL_FONTS } from '@/app/image-studio/constants/real-fonts'
import { TEXT_EFFECTS, ROTATION_PRESETS, type TextEffect, type TextItem } from '../text-effects-config'
import { TextColorPicker } from './TextColorPicker'

interface BrandSidebarProps {
  showBrandName: boolean
  editableBrandName: string
  brandFont: string
  brandColor: string
  brandScale: number
  brandEffect: TextEffect
  brandRotation: number
  brandWeight?: number
  showFontPicker: boolean
  onToggleBrandName: () => void
  onEditableBrandNameChange: (value: string) => void
  onBrandFontChange: (font: string) => void
  onBrandColorChange: (color: string) => void
  onBrandScaleIncrease: () => void
  onBrandScaleDecrease: () => void
  onBrandScaleChange?: (scale: number) => void
  onBrandEffectChange: (effect: TextEffect) => void
  onBrandRotationChange: (rotation: number) => void
  onBrandWeightChange?: (weight: number) => void
  onToggleFontPicker: () => void
  // Multiple text support
  textItems?: TextItem[]
  selectedTextId?: string | null
  onAddText?: () => void
  onRemoveText?: (id: string) => void
  onSelectText?: (id: string) => void
  onUpdateTextContent?: (id: string, content: string) => void
}

// Popular fonts for quick access
const POPULAR_FONTS = ['montserrat', 'poppins', 'raleway', 'playfair-display', 'bebas-neue', 'orbitron', 'great-vibes', 'pacifico']

// Font weight options with labels
const WEIGHT_OPTIONS = [
  { value: 300, label: 'Fine' },
  { value: 400, label: 'Normal' },
  { value: 600, label: 'Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'X-Bold' },
]

// Get display label for a weight value
function getWeightLabel(weight: number): string {
  const option = WEIGHT_OPTIONS.find(o => o.value === weight)
  return option?.label || `${weight}`
}

export function BrandSidebar({
  showBrandName,
  editableBrandName,
  brandFont,
  brandColor,
  brandScale,
  brandEffect,
  brandRotation,
  brandWeight = 400,
  showFontPicker,
  onToggleBrandName,
  onEditableBrandNameChange,
  onBrandFontChange,
  onBrandColorChange,
  onBrandScaleIncrease,
  onBrandScaleDecrease,
  onBrandScaleChange,
  onBrandEffectChange,
  onBrandRotationChange,
  onBrandWeightChange,
  onToggleFontPicker,
  textItems,
  selectedTextId,
  onAddText,
  onRemoveText,
  onSelectText,
  onUpdateTextContent,
}: BrandSidebarProps) {
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false)
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3 w-52 shrink-0 p-3 items-center justify-start max-h-[720px] overflow-y-auto scrollbar-hide">
      <div className="text-[10px] text-zinc-500 font-extralight uppercase tracking-widest text-center w-full">
        Brand Settings
      </div>

      {/* Show/Hide Toggle */}
      <button
        onClick={onToggleBrandName}
        className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border text-xs font-extralight transition-all ${
          showBrandName
            ? 'text-purple-400 bg-purple-500/10 border-purple-500/30'
            : 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50 hover:text-white hover:bg-zinc-700/50'
        }`}
      >
        {showBrandName ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        <span>{showBrandName ? 'On' : 'Off'}</span>
      </button>

      {showBrandName && (
        <>
          {/* Text Items List */}
          {textItems && (
            <div className="w-full space-y-1.5">
              <div className="text-[9px] text-zinc-500 font-extralight uppercase">Text Items</div>
              {textItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-extralight transition-all ${
                    selectedTextId === item.id
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 border border-zinc-700/50'
                  }`}
                >
                  <GripVertical className="w-3 h-3 text-zinc-600 cursor-grab shrink-0" />
                  {editingTextId === item.id ? (
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => onUpdateTextContent?.(item.id, e.target.value)}
                      onBlur={() => setEditingTextId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingTextId(null)}
                      autoFocus
                      className="flex-1 bg-transparent border-none outline-none text-white px-1"
                    />
                  ) : (
                    <span onClick={() => onSelectText?.(item.id)} className="flex-1 truncate cursor-pointer">
                      {item.content || `Text ${index + 1}`}
                    </span>
                  )}
                  <button onClick={() => setEditingTextId(item.id)} className="p-0.5 hover:text-purple-400" title="Edit">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onRemoveText?.(item.id) }} className="p-0.5 hover:text-red-400" title="Remove">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {onAddText && (
                <button
                  onClick={onAddText}
                  className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-[11px] text-emerald-400 font-extralight border border-emerald-500/20"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Text</span>
                </button>
              )}
            </div>
          )}

          {/* Text Content */}
          <div className="w-full space-y-1.5">
            <div className="text-[9px] text-zinc-500 font-extralight uppercase">Text Content</div>
            <input
              type="text"
              value={editableBrandName}
              onChange={(e) => onEditableBrandNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs text-white font-extralight focus:outline-none focus:border-purple-500/50"
              placeholder="Enter text..."
            />
          </div>

          {/* Font Dropdown */}
          <div className="w-full space-y-1.5">
            <button
              onClick={() => { setIsFontDropdownOpen(!isFontDropdownOpen); setIsColorDropdownOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-500 font-extralight uppercase">Font</span>
                <span
                  className="text-xs text-white font-extralight truncate max-w-[100px]"
                  style={{ fontFamily: REAL_FONTS[brandFont]?.family || 'sans-serif' }}
                >
                  {REAL_FONTS[brandFont]?.name || 'Select'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isFontDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFontDropdownOpen && (
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 space-y-2">
                <div className="grid grid-cols-2 gap-1">
                  {POPULAR_FONTS.map((fontKey) => {
                    const font = REAL_FONTS[fontKey]
                    if (!font) return null
                    return (
                      <button
                        key={fontKey}
                        onClick={() => { onBrandFontChange(fontKey); setIsFontDropdownOpen(false) }}
                        className={`px-2 py-1.5 rounded-md text-[10px] font-extralight transition-all truncate ${
                          brandFont === fontKey
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/50 hover:bg-zinc-600/50'
                        }`}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={onToggleFontPicker}
                  className="w-full text-[9px] text-zinc-500 hover:text-zinc-300 font-extralight py-1 border-t border-zinc-700 pt-2"
                >
                  {showFontPicker ? 'Show less' : 'More fonts...'}
                </button>
                {showFontPicker && (
                  <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                    {Object.keys(REAL_FONTS).filter(k => !POPULAR_FONTS.includes(k)).map((fontKey) => {
                      const font = REAL_FONTS[fontKey]
                      if (!font) return null
                      return (
                        <button
                          key={fontKey}
                          onClick={() => { onBrandFontChange(fontKey); setIsFontDropdownOpen(false) }}
                          className={`px-2 py-1.5 rounded-md text-[10px] font-extralight transition-all truncate ${
                            brandFont === fontKey
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/50 hover:bg-zinc-600/50'
                          }`}
                          style={{ fontFamily: font.family }}
                        >
                          {font.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Font Weight Selector - only show if font has multiple weights */}
          {REAL_FONTS[brandFont]?.weights && REAL_FONTS[brandFont].weights.length > 1 && onBrandWeightChange && (
            <div className="w-full space-y-1.5">
              <div className="text-[9px] text-zinc-500 font-extralight uppercase">Weight</div>
              <div className="grid grid-cols-4 gap-1">
                {REAL_FONTS[brandFont].weights.map((weight) => (
                  <button
                    key={weight}
                    onClick={() => onBrandWeightChange(weight)}
                    className={`px-2 py-1.5 rounded-md text-[9px] font-extralight transition-all ${
                      brandWeight === weight
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50'
                    }`}
                  >
                    {getWeightLabel(weight)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Picker */}
          <TextColorPicker
            brandColor={brandColor}
            isOpen={isColorDropdownOpen}
            onToggle={() => { setIsColorDropdownOpen(!isColorDropdownOpen); setIsFontDropdownOpen(false) }}
            onColorChange={onBrandColorChange}
          />

          {/* Effect Grid */}
          <div className="w-full space-y-1.5">
            <div className="text-[9px] text-zinc-500 font-extralight uppercase">Effect</div>
            <div className="grid grid-cols-3 gap-1">
              {(Object.keys(TEXT_EFFECTS) as TextEffect[]).map((effectKey) => (
                <button
                  key={effectKey}
                  onClick={() => onBrandEffectChange(effectKey)}
                  className={`px-2 py-1.5 rounded-md text-[9px] font-extralight transition-all ${
                    brandEffect === effectKey
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50'
                  }`}
                >
                  {TEXT_EFFECTS[effectKey].label}
                </button>
              ))}
            </div>
          </div>

          {/* Rotation Presets + Slider */}
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-extralight uppercase">Rotation</span>
              <span className="text-[10px] text-zinc-400 font-extralight">{brandRotation}°</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {ROTATION_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => onBrandRotationChange(preset.value)}
                  className={`px-1 py-1.5 rounded-md text-[9px] font-extralight transition-all ${
                    brandRotation === preset.value
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {/* Rotation Slider */}
            <input
              type="range"
              min="-180"
              max="180"
              value={brandRotation}
              onChange={(e) => onBrandRotationChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Size Controls */}
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-extralight uppercase">Size</span>
              <span className="text-[10px] text-zinc-400 font-extralight">{Math.round(brandScale * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onBrandScaleDecrease}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-md border border-zinc-700/50"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 text-center text-xs text-zinc-300 font-extralight">
                {Math.round(brandScale * 100)}%
              </div>
              <button
                onClick={onBrandScaleIncrease}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-md border border-zinc-700/50"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Size Slider */}
            {onBrandScaleChange && (
              <input
                type="range"
                min="50"
                max="800"
                value={Math.round(brandScale * 100)}
                onChange={(e) => onBrandScaleChange(parseInt(e.target.value) / 100)}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
