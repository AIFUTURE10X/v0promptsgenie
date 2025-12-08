"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, ImageIcon, CreditCard, ZoomIn, Eye, EyeOff, Palette, RotateCcw, ChevronDown } from 'lucide-react'
import { GeneratedLogo } from '../../hooks/useLogoGeneration'
import { transparencyGridStyle } from '../../constants/logo-constants'
import { LogoLightbox, LightboxBackground } from './LogoLightbox'

// Color presets using hue-rotate CSS filter
// Base logo is purple (~270° hue), so we calculate rotation relative to that
// Target hue - 270 = rotation needed
const COLOR_PRESETS = [
  // Original (no rotation)
  { name: 'Original', hue: 0, saturate: 100, label: 'Original', color: '#a855f7' },
  // Reds (target ~0°, rotation = -270 = 90)
  { name: 'Red', hue: 90, saturate: 120, label: 'Red', color: '#ef4444' },
  { name: 'Crimson', hue: 80, saturate: 130, label: 'Crimson', color: '#dc2626' },
  { name: 'Rose', hue: 60, saturate: 110, label: 'Rose', color: '#f43f5e' },
  // Oranges (target ~30°, rotation = -240 = 120)
  { name: 'Orange', hue: 120, saturate: 130, label: 'Orange', color: '#f97316' },
  { name: 'Tangerine', hue: 110, saturate: 140, label: 'Tangerine', color: '#fb923c' },
  { name: 'Coral', hue: 100, saturate: 120, label: 'Coral', color: '#f87171' },
  // Yellows & Golds (target ~50°, rotation = -220 = 140)
  { name: 'Yellow', hue: 140, saturate: 130, label: 'Yellow', color: '#facc15' },
  { name: 'Gold', hue: 125, saturate: 150, label: 'Gold', color: '#f59e0b' },
  { name: 'Amber', hue: 120, saturate: 140, label: 'Amber', color: '#d97706' },
  // Greens (target ~120°, rotation = -150 = 210)
  { name: 'Lime', hue: 170, saturate: 120, label: 'Lime', color: '#84cc16' },
  { name: 'Green', hue: 210, saturate: 110, label: 'Green', color: '#22c55e' },
  { name: 'Emerald', hue: 220, saturate: 110, label: 'Emerald', color: '#10b981' },
  { name: 'Mint', hue: 230, saturate: 90, label: 'Mint', color: '#34d399' },
  { name: 'Forest', hue: 200, saturate: 80, label: 'Forest', color: '#166534' },
  // Cyans & Teals (target ~180°, rotation = -90 = 270)
  { name: 'Teal', hue: 250, saturate: 100, label: 'Teal', color: '#14b8a6' },
  { name: 'Cyan', hue: 270, saturate: 110, label: 'Cyan', color: '#22d3d4' },
  { name: 'Aqua', hue: 260, saturate: 120, label: 'Aqua', color: '#06b6d4' },
  // Blues (target ~220°, rotation = -50 = 310)
  { name: 'Sky Blue', hue: 290, saturate: 110, label: 'Sky Blue', color: '#38bdf8' },
  { name: 'Ocean Blue', hue: 310, saturate: 120, label: 'Ocean Blue', color: '#3b82f6' },
  { name: 'Royal Blue', hue: 320, saturate: 130, label: 'Royal Blue', color: '#4f46e5' },
  { name: 'Navy', hue: 330, saturate: 100, label: 'Navy', color: '#1e3a8a' },
  // Indigos (target ~250°, rotation = -20 = 340)
  { name: 'Indigo', hue: 340, saturate: 110, label: 'Indigo', color: '#6366f1' },
  // Pinks & Magentas (target ~320°, rotation = 50)
  { name: 'Pink', hue: 40, saturate: 110, label: 'Pink', color: '#ec4899' },
  { name: 'Hot Pink', hue: 50, saturate: 130, label: 'Hot Pink', color: '#f472b6' },
  { name: 'Magenta', hue: 20, saturate: 120, label: 'Magenta', color: '#d946ef' },
  { name: 'Fuchsia', hue: 30, saturate: 130, label: 'Fuchsia', color: '#c026d3' },
  // Neutrals (desaturate)
  { name: 'Silver', hue: 0, saturate: 20, label: 'Silver', color: '#94a3b8' },
  { name: 'Warm Gray', hue: 90, saturate: 30, label: 'Warm Gray', color: '#78716c' },
  { name: 'Cool Gray', hue: 310, saturate: 30, label: 'Cool Gray', color: '#64748b' },
] as const

type ColorPreset = typeof COLOR_PRESETS[number]

// Export the type for use in other components
export type LogoFilterStyle = React.CSSProperties

interface LogoPreviewPanelProps {
  generatedLogo: GeneratedLogo | null
  onClearLogo: () => void
  onPreviewMockups?: () => void
  onFilterChange?: (filter: LogoFilterStyle) => void
}

export function LogoPreviewPanel({ generatedLogo, onClearLogo, onPreviewMockups, onFilterChange }: LogoPreviewPanelProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxBackground, setLightboxBackground] = useState<LightboxBackground>('transparent')
  const [showOriginal, setShowOriginal] = useState(false)
  const [colorPreset, setColorPreset] = useState<ColorPreset>(COLOR_PRESETS[0])
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generate CSS filter string from preset
  const getFilterStyle = (preset: ColorPreset): LogoFilterStyle => {
    if (preset.hue === 0 && preset.saturate === 100) return {}
    return {
      filter: `hue-rotate(${preset.hue}deg) saturate(${preset.saturate}%)`,
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setColorDropdownOpen(false)
      }
    }
    if (colorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [colorDropdownOpen])

  // Notify parent when filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(getFilterStyle(colorPreset))
    }
  }, [colorPreset, onFilterChange])

  const filterStyle = getFilterStyle(colorPreset)

  const openLightbox = (bg: LightboxBackground) => {
    setLightboxBackground(bg)
    setLightboxOpen(true)
  }

  // Check if we have an original (before BG removal) version
  const hasOriginal = !!(generatedLogo?.originalUrl)
  // Determine which URL to display
  const displayUrl = showOriginal && hasOriginal ? generatedLogo?.originalUrl : generatedLogo?.url
  if (!generatedLogo) {
    return (
      <div className="w-[500px] shrink-0">
        <div
          className="h-full min-h-[280px] rounded-lg border border-dashed border-zinc-700 flex flex-col items-center justify-center p-4"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <ImageIcon className="w-10 h-10 text-zinc-700 mb-2" />
          <p className="text-xs text-zinc-600 text-center">
            Your generated logo will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[500px] shrink-0">
      <div className="space-y-2">
        {/* Preview on Mockups Button */}
        {onPreviewMockups && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewMockups}
            className="w-full h-8 bg-linear-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-cyan-400 border border-cyan-500/30 text-xs"
          >
            <CreditCard className="w-3 h-3 mr-1.5" />
            Preview on Mockups (Business Card, Letterhead, App Icon)
          </Button>
        )}

        {/* Before/After Toggle - Prominent placement below mockups button */}
        {hasOriginal && (
          <div className="flex rounded-lg overflow-hidden border border-zinc-700">
            <button
              onClick={() => setShowOriginal(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium transition-all ${
                showOriginal
                  ? 'bg-amber-500/30 text-amber-300 border-r border-amber-500/50'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border-r border-zinc-700'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              Before (Original)
            </button>
            <button
              onClick={() => setShowOriginal(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium transition-all ${
                !showOriginal
                  ? 'bg-blue-500/30 text-blue-300'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              After (PNG)
            </button>
          </div>
        )}

        {/* Color Presets Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-purple-400 font-medium">Color Shift - Preview different color variations</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
              className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <div
                  className="w-4 h-4 rounded-full border border-zinc-600"
                  style={{ backgroundColor: colorPreset.color }}
                />
                <span className="text-xs text-zinc-300">{colorPreset.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${colorDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {colorPreset.name !== 'Original' && (
              <button
                onClick={() => setColorPreset(COLOR_PRESETS[0])}
                className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-500 hover:text-white transition-colors"
                title="Reset to original"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown Menu */}
          {colorDropdownOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-[300px] overflow-y-auto">
              <div className="p-1 grid grid-cols-4 gap-1">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setColorPreset(preset)
                      setColorDropdownOpen(false)
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                      colorPreset.name === preset.name
                        ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500/50'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                    title={preset.label}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">Generated Logo</label>
            {!hasOriginal && (
              <span className="text-[10px] text-zinc-600 italic">
                (Use Remove BG for before/after)
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearLogo}
            className="h-5 px-1.5 text-zinc-500 hover:text-white text-[10px]"
          >
            <Trash2 className="w-3 h-3 mr-0.5" />
            Clear
          </Button>
        </div>

        {/* Logo on transparency grid - Clickable for lightbox */}
        <div
          className="relative rounded-lg overflow-hidden border border-zinc-700 cursor-pointer group"
          style={transparencyGridStyle}
          onClick={() => openLightbox('transparent')}
        >
          <div className="h-[420px] flex items-center justify-center relative p-4">
            <img
              src={displayUrl}
              alt="Generated logo"
              className="max-w-full max-h-full object-contain transition-all group-hover:scale-[1.02]"
              style={filterStyle}
            />
            {/* Hover overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-3">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Lightbox */}
        <LogoLightbox
          logoUrl={generatedLogo?.url || ''}
          originalUrl={generatedLogo?.originalUrl}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          initialBackground={lightboxBackground}
          logoFilter={filterStyle}
        />

        {/* Preview on different backgrounds - Clickable for lightbox */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div
            className="h-32 rounded-lg bg-white flex items-center justify-center border border-zinc-700 cursor-pointer group hover:border-purple-500 hover:scale-[1.02] transition-all overflow-hidden"
            onClick={() => openLightbox('white')}
            title="Click to enlarge"
          >
            <img src={displayUrl} alt="On white" className="w-full h-full object-contain group-hover:scale-[1.6] transition-all" style={{ transform: 'scale(1.5)', ...filterStyle }} />
          </div>
          <div
            className="h-32 rounded-lg bg-black flex items-center justify-center border border-zinc-700 cursor-pointer group hover:border-purple-500 hover:scale-[1.02] transition-all overflow-hidden"
            onClick={() => openLightbox('black')}
            title="Click to enlarge"
          >
            <img src={displayUrl} alt="On black" className="w-full h-full object-contain group-hover:scale-[1.6] transition-all" style={{ transform: 'scale(1.5)', ...filterStyle }} />
          </div>
          <div
            className="h-32 rounded-lg flex items-center justify-center border border-zinc-700 cursor-pointer group hover:border-purple-500 hover:scale-[1.02] transition-all overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            onClick={() => openLightbox('gradient')}
            title="Click to enlarge"
          >
            <img src={displayUrl} alt="On gradient" className="w-full h-full object-contain group-hover:scale-[1.6] transition-all" style={{ transform: 'scale(1.5)', ...filterStyle }} />
          </div>
        </div>
      </div>
    </div>
  )
}
