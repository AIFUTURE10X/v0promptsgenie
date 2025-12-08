// Logo concept styles - the "what" of the logo
export type LogoConcept = 'minimalist' | 'modern' | 'vintage' | 'playful' | 'elegant' | 'bold'

export const LOGO_CONCEPTS: Array<{
  value: LogoConcept
  label: string
  icon: string
  color: string
}> = [
  { value: 'minimalist', label: 'Minimal', icon: '○', color: '#a1a1aa' },      // zinc-400
  { value: 'modern', label: 'Modern', icon: '◆', color: '#3b82f6' },          // blue-500
  { value: 'vintage', label: 'Vintage', icon: '◈', color: '#d97706' },        // amber-600
  { value: 'playful', label: 'Playful', icon: '★', color: '#facc15' },        // yellow-400
  { value: 'elegant', label: 'Elegant', icon: '♦', color: '#a855f7' },        // purple-500
  { value: 'bold', label: 'Bold', icon: '■', color: '#ef4444' },              // red-500
]

// Rendering styles - the "how" of the logo (can combine with any concept)
export type RenderStyle = 'flat' | '3d' | '3d-metallic' | '3d-crystal' | '3d-gradient' | 'neon'

export const RENDER_STYLES: Array<{
  value: RenderStyle
  label: string
  icon: string
  description: string
  color: string
  gradient?: string
}> = [
  { value: 'flat', label: 'Flat', icon: '□', description: '2D, solid colors', color: '#71717a' },
  { value: '3d', label: '3D', icon: '◇', description: 'Subtle depth', color: '#6366f1' },
  { value: '3d-metallic', label: 'Metal', icon: '⬡', description: 'Chrome, gold', color: '#d4af37' },
  { value: '3d-crystal', label: 'Crystal', icon: '💎', description: 'Glass, diamond', color: '#67e8f9' },
  { value: '3d-gradient', label: 'Gradient', icon: '●', description: 'Colorful 3D', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)' },
  { value: 'neon', label: 'Neon', icon: '✦', description: 'Glowing', color: '#22d3ee' },
]

// Background removal methods
import { BgRemovalMethod } from '../hooks/useLogoGeneration'

export const BG_REMOVAL_METHODS: Array<{
  value: BgRemovalMethod
  label: string
  description: string
  badge?: string
}> = [
  {
    value: 'pixelcut',
    label: 'Pixelcut AI',
    description: 'Logo-optimized, preserves fine lines & text',
    badge: 'Recommended'
  },
  {
    value: 'replicate',
    label: 'Replicate AI',
    description: 'High-quality ML model, works on any background',
    badge: 'AI'
  },
  {
    value: 'smart',
    label: 'Smart (Local)',
    description: 'Free, detects background color, keeps ALL logo content',
  },
]

// Resolution options
export type LogoResolution = '1K' | '2K' | '4K'

export const RESOLUTION_OPTIONS: Array<{ value: LogoResolution; label: string }> = [
  { value: '1K', label: '1K (1024px)' },
  { value: '2K', label: '2K (2048px)' },
  { value: '4K', label: '4K (4096px)' },
]

export const GOLD_GRADIENT = "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)"

// CSS for transparency checkerboard pattern
export const transparencyGridStyle = {
  backgroundImage: `
    linear-gradient(45deg, #404040 25%, transparent 25%),
    linear-gradient(-45deg, #404040 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #404040 75%),
    linear-gradient(-45deg, transparent 75%, #404040 75%)
  `,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  backgroundColor: '#2a2a2a'
}
