/**
 * Logo Preview Panel Color Presets
 *
 * Color presets using hue-rotate CSS filter for logo color shifting.
 * Extracted from LogoPreviewPanel.tsx to keep files under 300 lines.
 */

// Color presets using hue-rotate CSS filter
// Base logo is purple (~270° hue), so we calculate rotation relative to that
// Target hue - 270 = rotation needed
export const COLOR_PRESETS = [
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

export type ColorPreset = typeof COLOR_PRESETS[number]

// Export the type for use in other components
export type LogoFilterStyle = React.CSSProperties

/**
 * Generate CSS filter string from preset
 */
export function getFilterStyle(preset: ColorPreset): LogoFilterStyle {
  if (preset.hue === 0 && preset.saturate === 100) return {}
  return {
    filter: `hue-rotate(${preset.hue}deg) saturate(${preset.saturate}%)`,
  }
}
