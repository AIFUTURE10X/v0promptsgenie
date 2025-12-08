"use client"

/**
 * Logo Sidebar Component
 *
 * Left sidebar with product color picker and logo scale controls.
 * Generic version that accepts colors from mockup config.
 */

import { ZoomIn, ZoomOut, Eraser, Loader2, FlipHorizontal } from 'lucide-react'
import type { ProductColor, MockupView } from '../generic/mockup-types'

interface LogoSidebarProps {
  /** Current product label (e.g., "T-Shirt", "Hoodie") */
  productLabel: string
  /** Available colors for this product */
  colors: ProductColor[]
  /** Currently selected color */
  selectedColor: ProductColor
  /** Whether to show extended color picker */
  showColorPicker: boolean
  /** Current logo scale (1.0 = 100%) */
  logoScale: number
  /** Called when a color is selected */
  onColorSelect: (color: ProductColor) => void
  /** Called to toggle extended color picker */
  onToggleColorPicker: () => void
  /** Called to increase logo scale */
  onScaleIncrease: () => void
  /** Called to decrease logo scale */
  onScaleDecrease: () => void
  /** Called to remove background from logo */
  onRemoveBackground?: () => void
  /** Whether background removal is in progress */
  isRemovingBackground?: boolean
  /** Whether a logo is present */
  hasLogo?: boolean
  /** Whether this product supports multiple views (front/back) */
  hasMultipleViews?: boolean
  /** Currently selected view */
  selectedView?: MockupView
  /** Called when view changes */
  onViewChange?: (view: MockupView) => void
}

export function LogoSidebar({
  productLabel,
  colors,
  selectedColor,
  showColorPicker,
  logoScale,
  onColorSelect,
  onToggleColorPicker,
  onScaleIncrease,
  onScaleDecrease,
  onRemoveBackground,
  isRemovingBackground,
  hasLogo,
  hasMultipleViews,
  selectedView = 'front',
  onViewChange,
}: LogoSidebarProps) {
  // Show first 12 colors by default
  const visibleColors = showColorPicker ? colors : colors.slice(0, 12)
  const hasMoreColors = colors.length > 12

  return (
    <div className="flex flex-col gap-3 w-40 shrink-0 p-3 items-center justify-start max-h-[520px] overflow-y-auto scrollbar-hide">
      <div className="text-[10px] text-zinc-500 font-extralight uppercase tracking-widest text-center w-full">
        Logo Settings
      </div>

      {/* Product Color Grid */}
      <div className="w-full space-y-2">
        <div className="text-[9px] text-zinc-500 font-extralight uppercase">
          {productLabel} Color
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {visibleColors.map((color) => (
            <button
              key={color.id}
              onClick={() => onColorSelect(color)}
              className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
                selectedColor.id === color.id
                  ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/30'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
        {hasMoreColors && (
          <button
            onClick={onToggleColorPicker}
            className="w-full text-[9px] text-zinc-500 hover:text-zinc-300 font-extralight py-1"
          >
            {showColorPicker ? 'Show less' : `+${colors.length - 12} more colors`}
          </button>
        )}
      </div>

      {/* View Toggle (Front/Back) */}
      {hasMultipleViews && onViewChange && (
        <div className="w-full space-y-2">
          <div className="text-[9px] text-zinc-500 font-extralight uppercase flex items-center gap-1">
            <FlipHorizontal className="w-3 h-3" />
            View
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onViewChange('front')}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-extralight transition-all ${
                selectedView === 'front'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700/50'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => onViewChange('back')}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-extralight transition-all ${
                selectedView === 'back'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700/50'
              }`}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Logo Scale Controls */}
      <div className="w-full space-y-2">
        <div className="text-[9px] text-zinc-500 font-extralight uppercase">Logo Size</div>
        <div className="flex items-center gap-2">
          <button
            onClick={onScaleDecrease}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-md border border-zinc-700/50"
            title="Decrease size"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 text-center text-xs text-zinc-300 font-extralight">
            {Math.round(logoScale * 100)}%
          </div>
          <button
            onClick={onScaleIncrease}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-md border border-zinc-700/50"
            title="Increase size"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Remove Background Button */}
      {onRemoveBackground && (
        <div className="w-full">
          <button
            onClick={onRemoveBackground}
            disabled={!hasLogo || isRemovingBackground}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-extralight transition-all bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove logo background"
          >
            {isRemovingBackground ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Eraser className="w-3.5 h-3.5" />
                <span>Remove BG</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
