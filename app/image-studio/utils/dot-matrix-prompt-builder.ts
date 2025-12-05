/**
 * Dot Matrix Prompt Builder
 * Compiles DotMatrixConfig settings into an optimized prompt string
 *
 * Enhanced to support: Fancy Fonts, Per-Letter Colors, Materials, Text Effects, Icons
 */

import {
  DotMatrixConfig,
  DotSize,
  DotSpacing,
  DotShape,
  PatternStyle,
  PatternCoverage,
  BackgroundColor,
  MetallicFinish,
  FontStyle,
  TextWeight,
  LetterSpacing,
  BrandPosition,
  LogoOrientation,
  SwooshStyle,
  SwooshPosition,
  SparkleIntensity,
  ShadowStyle,
  DepthLevel,
  LightingDirection,
  BevelStyle,
  Perspective,
  IconStyle,
} from '../constants/dot-matrix-config'

// Import helpers from new components
import { getFontById } from '../components/Logo/FancyFontGrid'
import { getMaterialById } from '../components/Logo/MaterialSelector'
import { getIconPromptDescription } from '../components/Logo/IconSelector'
import {
  getTextOutlinePrompt,
  getGlowEffectPrompt,
  getTextTexturePrompt,
  getLetterEffectPrompt,
  TextOutline,
  GlowEffect,
  TextTexture,
  LetterEffect,
} from '../components/Logo/TextEffectsPanel'
import { getDepthPromptDescription } from '../components/Logo/DepthSlider'

// ============================================
// HELPER MAPPERS
// ============================================

const dotSizeDescriptions: Record<DotSize, string> = {
  'tiny': 'TINY fine-detailed',
  'small': 'SMALL subtle',
  'medium': 'MEDIUM-SIZED',
  'large': 'LARGE bold',
  'extra-large': 'EXTRA-LARGE chunky prominent',
}

const dotSpacingDescriptions: Record<DotSpacing, string> = {
  'tight': 'TIGHTLY packed dense',
  'normal': 'NORMAL spacing',
  'loose': 'LOOSELY spaced airy',
  'very-loose': 'VERY LOOSELY scattered widely spaced',
}

const dotShapeDescriptions: Record<DotShape, string> = {
  'circle': 'circular',
  'square': 'square-shaped',
  'diamond': 'diamond-shaped',
  'hexagon': 'hexagonal',
}

const patternStyleDescriptions: Record<PatternStyle, string> = {
  'uniform': 'uniform grid pattern',
  'halftone': 'halftone gradient pattern with varying dot sizes',
  'scatter': 'randomly scattered organic pattern',
  'radial': 'radial pattern radiating from center',
}

const patternCoverageDescriptions: Record<PatternCoverage, string> = {
  'full': 'filling the entire letters',
  'partial-fade': 'gradually fading at edges',
  'edge-only': 'concentrated on letter edges',
  'center-only': 'concentrated in letter centers',
}

const backgroundDescriptions: Record<BackgroundColor, string> = {
  'dark-navy': 'dark navy blue background',
  'black': 'pure black background',
  'dark-gray': 'dark charcoal gray background',
  'gradient': 'navy-to-black gradient background',
  'transparent': 'transparent background',
}

const metallicDescriptions: Record<MetallicFinish, string> = {
  'chrome': 'brushed chrome/silver metallic',
  'gold': 'luxurious gold metallic',
  'bronze': 'warm bronze metallic',
  'rose-gold': 'elegant rose gold metallic',
  'platinum': 'premium platinum metallic',
  'copper': 'rich copper metallic',
}

const fontStyleDescriptions: Record<FontStyle, string> = {
  'sans-serif-bold': 'bold sans-serif typography',
  'serif-elegant': 'elegant serif typography',
  'modern-geometric': 'modern geometric futuristic font',
  'tech-digital': 'tech digital cyber font',
}

const textWeightDescriptions: Record<TextWeight, string> = {
  'light': 'light weight',
  'regular': 'regular weight',
  'bold': 'bold weight',
  'extra-bold': 'extra bold heavy weight',
}

const letterSpacingDescriptions: Record<LetterSpacing, string> = {
  'tight': 'tightly spaced letters',
  'normal': 'normal letter spacing',
  'wide': 'wide letter spacing',
  'very-wide': 'very wide dramatic letter spacing',
}

const brandPositionDescriptions: Record<BrandPosition, string> = {
  'above': 'positioned above the icon',
  'below': 'positioned below the icon',
  'left': 'positioned to the left of the icon',
  'right': 'positioned to the right of the icon',
  'integrated': 'integrated with the design',
}

const orientationDescriptions: Record<LogoOrientation, string> = {
  'horizontal': 'horizontal layout',
  'vertical': 'vertical stacked layout',
  'square': 'square compact layout',
}

const swooshDescriptions: Record<SwooshStyle, string> = {
  'none': '',
  'circular': 'CIRCULAR arc swoosh element',
  'dynamic': 'DYNAMIC flowing curved swoosh',
  'ribbon': 'thick RIBBON band swoosh',
  'orbit': 'elliptical ORBIT path swoosh',
}

const swooshPositionDescriptions: Record<SwooshPosition, string> = {
  'around': 'wrapping around the letters',
  'above': 'arcing above the text',
  'below': 'sweeping below the text',
  'wrapping': 'passing through and around the design',
}

const sparkleDescriptions: Record<SparkleIntensity, string> = {
  'none': '',
  'subtle': 'with subtle sparkle accents',
  'medium': 'with medium sparkle and shine effects',
  'dramatic': 'with dramatic sparkling star burst effects',
}

const shadowDescriptions: Record<ShadowStyle, string> = {
  'none': '',
  'soft-drop': 'soft drop shadow',
  'hard': 'hard crisp shadow',
  'long-cast': 'long dramatic cast shadow',
}

const depthDescriptions: Record<DepthLevel, string> = {
  'flat': 'flat 2D',
  'subtle': 'subtle 3D depth',
  'medium': 'medium 3D extrusion',
  'deep': 'deep 3D extrusion with significant depth',
  'extreme': 'extreme 3D with dramatic depth and perspective',
}

const lightingDescriptions: Record<LightingDirection, string> = {
  'top-left': 'dramatic studio lighting from top-left',
  'top': 'dramatic overhead lighting from top',
  'top-right': 'dramatic studio lighting from top-right',
  'side': 'dramatic side lighting',
}

const bevelDescriptions: Record<BevelStyle, string> = {
  'none': '',
  'soft': 'with soft beveled edges',
  'sharp': 'with sharp beveled edges',
  'embossed': 'with embossed raised edges',
}

const perspectiveDescriptions: Record<Perspective, string> = {
  'straight': 'straight-on view',
  'slight-angle': 'slight angular perspective',
  'isometric': 'isometric 3D perspective',
}

const iconDescriptions: Record<IconStyle, string> = {
  'none': '',
  'globe': 'with a globe/world icon element',
  'arrow': 'with an upward arrow icon element',
  'abstract': 'with an abstract geometric icon element',
  'geometric': 'with a hexagonal geometric icon element',
  'star': 'with a star icon element',
}

// ============================================
// MAIN PROMPT BUILDER
// ============================================

export function buildDotMatrixPrompt(config: DotMatrixConfig): string {
  const parts: string[] = []

  // 1. Brand name (with text case applied)
  const displayName = formatBrandName(config)
  parts.push(`"${displayName}" corporate logo`)

  // 2. Core letter styling with metallic finish OR material type
  if (config.materialType) {
    const material = getMaterialById(config.materialType as any)
    if (material) {
      parts.push(`with elegant 3D letters featuring ${material.promptDescription}`)
    }
  } else if (config.metallicFinish) {
    parts.push(`with elegant 3D ${metallicDescriptions[config.metallicFinish]} letters`)
  } else {
    parts.push('with elegant 3D metallic letters')
  }

  // 3. Dot matrix pattern - THE KEY FEATURE
  const dotDescription = buildDotPatternDescription(config)
  if (dotDescription) parts.push(dotDescription)

  // 4. Typography details (enhanced with fancy fonts)
  const typographyDesc = buildTypographyDescription(config)
  if (typographyDesc) parts.push(typographyDesc)

  // 5. Per-letter colors (NEW)
  if (config.letterColors && config.letterColors.length > 0) {
    const colorDescriptions = config.letterColors
      .map(lc => `letter ${lc.position} in ${lc.color.name.toLowerCase()}`)
      .join(', ')
    parts.push(`with individual letter coloring: ${colorDescriptions}`)
  }

  // 6. Text effects (NEW)
  const textEffectsDesc = buildTextEffectsDescription(config)
  if (textEffectsDesc) parts.push(textEffectsDesc)

  // 7. Swoosh/arc element
  const swooshDesc = buildSwooshDescription(config)
  if (swooshDesc) parts.push(swooshDesc)

  // 8. Icon integration (ENHANCED)
  if (config.extendedIconStyle && config.extendedIconStyle !== 'none') {
    const iconPrompt = getIconPromptDescription(
      config.extendedIconStyle as any,
      config.iconPosition as any
    )
    if (iconPrompt) parts.push(iconPrompt)
  } else if (config.iconStyle && config.iconStyle !== 'none') {
    parts.push(iconDescriptions[config.iconStyle])
  }

  // 9. Tagline
  if (config.tagline.trim()) {
    parts.push(`Include tagline "${config.tagline.trim()}" in smaller matching typography`)
  }

  // 10. Tilt/angle
  if (config.tiltAngle !== 0) {
    const direction = config.tiltAngle > 0 ? 'clockwise' : 'counter-clockwise'
    parts.push(`Apply a ${Math.abs(config.tiltAngle)}-degree ${direction} TILT for dynamic energy`)
  }

  // 11. 3D effects (ENHANCED with depth slider)
  const threeDDesc = build3DDescription(config)
  if (threeDDesc) parts.push(threeDDesc)

  // 12. Sparkle effects
  if (config.sparkleIntensity && config.sparkleIntensity !== 'none') {
    parts.push(sparkleDescriptions[config.sparkleIntensity])
  }

  // 13. Shadow
  if (config.shadowStyle && config.shadowStyle !== 'none') {
    parts.push(shadowDescriptions[config.shadowStyle])
  }

  // 14. Reflection
  if (config.hasReflection) {
    parts.push('with mirror reflection below')
  }

  // 15. Lighting
  if (config.lightingDirection) {
    parts.push(lightingDescriptions[config.lightingDirection])
  }

  // 16. Background
  if (config.backgroundColor) {
    parts.push(backgroundDescriptions[config.backgroundColor])
  }

  // 17. Professional quality tag
  parts.push('Professional premium quality corporate branding')

  return parts.filter(p => p.length > 0).join('. ')
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatBrandName(config: DotMatrixConfig): string {
  let name = config.brandName.trim()

  if (config.useInitials && name) {
    // Extract initials from brand name
    const words = name.split(/\s+/)
    name = words.map(w => w.charAt(0).toUpperCase()).join('')
  }

  // Apply text case (only if textCase is selected)
  if (!config.textCase) return name

  switch (config.textCase) {
    case 'uppercase':
      return name.toUpperCase()
    case 'lowercase':
      return name.toLowerCase()
    case 'titlecase':
      return name.split(/\s+/).map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    default:
      return name
  }
}

function buildDotPatternDescription(config: DotMatrixConfig): string {
  const parts: string[] = ['filled with']

  if (config.dotSize) {
    parts.push(dotSizeDescriptions[config.dotSize])
  }
  if (config.dotShape) {
    parts.push(dotShapeDescriptions[config.dotShape])
  }

  parts.push('DOT MATRIX')

  if (config.patternStyle) {
    parts.push(patternStyleDescriptions[config.patternStyle])
  }

  parts.push('texture')

  if (config.dotColor) {
    parts.push(`in ${config.dotColor.name.toLowerCase()} (${config.dotColor.hex})`)
  }

  if (config.dotSpacing) {
    parts.push('with')
    parts.push(dotSpacingDescriptions[config.dotSpacing])
    parts.push('between dots')
  }

  if (config.patternCoverage) {
    parts.push(patternCoverageDescriptions[config.patternCoverage])
  }

  if (config.dotGradient) {
    parts.push('with dots gradually fading in size')
  }

  return parts.join(' ')
}

function buildTypographyDescription(config: DotMatrixConfig): string {
  const parts: string[] = []

  // Check for fancy font first (NEW)
  if (config.fancyFontId) {
    const fancyFont = getFontById(config.fancyFontId)
    if (fancyFont) {
      parts.push(fancyFont.promptDescription)
    }
  } else if (config.fontStyle) {
    parts.push(fontStyleDescriptions[config.fontStyle])
  }

  if (config.textWeight && config.textWeight !== 'regular') {
    parts.push(textWeightDescriptions[config.textWeight])
  }

  if (config.letterSpacing && config.letterSpacing !== 'normal') {
    parts.push(letterSpacingDescriptions[config.letterSpacing])
  }

  return parts.join(' ')
}

// NEW: Build text effects description
function buildTextEffectsDescription(config: DotMatrixConfig): string {
  const parts: string[] = []

  // Text outline
  const outlinePrompt = getTextOutlinePrompt(config.textOutline as TextOutline | null)
  if (outlinePrompt) parts.push(outlinePrompt)

  // Glow effect
  const glowPrompt = getGlowEffectPrompt(
    config.glowEffect as GlowEffect | null,
    config.glowIntensity || 50
  )
  if (glowPrompt) parts.push(glowPrompt)

  // Text texture
  const texturePrompt = getTextTexturePrompt(config.textTexture as TextTexture | null)
  if (texturePrompt) parts.push(texturePrompt)

  // Letter effect
  const letterPrompt = getLetterEffectPrompt(config.letterEffect as LetterEffect | null)
  if (letterPrompt) parts.push(letterPrompt)

  return parts.join(', ')
}

function buildSwooshDescription(config: DotMatrixConfig): string {
  if (!config.swooshStyle || config.swooshStyle === 'none') return ''

  const swooshPart = swooshDescriptions[config.swooshStyle]
  const positionPart = config.swooshPosition ? swooshPositionDescriptions[config.swooshPosition] : ''

  return `Include a ${swooshPart} ${positionPart}`.trim()
}

function build3DDescription(config: DotMatrixConfig): string {
  const parts: string[] = []

  // Use depthAmount for more granular control (NEW)
  if (config.depthAmount !== undefined && config.depthAmount > 0) {
    parts.push(getDepthPromptDescription(config.depthAmount))
  } else if (config.depthLevel) {
    parts.push(depthDescriptions[config.depthLevel])
  }

  if (config.bevelStyle && config.bevelStyle !== 'none') {
    parts.push(bevelDescriptions[config.bevelStyle])
  }

  if (config.perspective && config.perspective !== 'straight') {
    parts.push(perspectiveDescriptions[config.perspective])
  }

  return parts.join(' ')
}

// ============================================
// NEGATIVE PROMPT BUILDER
// ============================================

export function buildDotMatrixNegativePrompt(config: DotMatrixConfig): string {
  const negatives = [
    'solid fill',
    'flat colors',
    'no texture',
    'simple',
    'cartoon',
    '2D flat',
    'low quality',
    'blurry',
    'amateur',
    'clip art',
    'comic style',
  ]

  // Add specific negatives based on settings
  if (config.depthLevel && config.depthLevel !== 'flat') {
    negatives.push('no 3D effect')
  }

  if (config.metallicFinish) {
    negatives.push('matte finish')
    negatives.push('no metallic')
  }

  if (config.swooshStyle && config.swooshStyle !== 'none') {
    negatives.push('no decorative elements')
  }

  return negatives.join(', ')
}

// ============================================
// PROMPT PREVIEW (for UI display)
// ============================================

export function buildPromptPreview(config: DotMatrixConfig): string {
  const highlights: string[] = []

  // Material type (NEW) or metallic finish
  if (config.materialType) {
    const material = getMaterialById(config.materialType as any)
    if (material) highlights.push(material.name)
  } else if (config.metallicFinish) {
    highlights.push(`${config.metallicFinish} text`)
  }

  // Fancy font (NEW)
  if (config.fancyFontId) {
    const font = getFontById(config.fancyFontId)
    if (font) highlights.push(font.name)
  }

  // Dot pattern
  if (config.dotColor && config.dotSize) {
    highlights.push(`${config.dotColor.name.toLowerCase()} dots (${config.dotSize})`)
  } else if (config.dotColor) {
    highlights.push(`${config.dotColor.name.toLowerCase()} dots`)
  } else if (config.dotSize) {
    highlights.push(`${config.dotSize} dots`)
  }

  // Per-letter colors (NEW)
  if (config.letterColors && config.letterColors.length > 0) {
    highlights.push(`${config.letterColors.length} colored letters`)
  }

  // Icon (NEW)
  if (config.extendedIconStyle && config.extendedIconStyle !== 'none') {
    highlights.push(`icon: ${config.extendedIconStyle}`)
  }

  // Text effects (NEW)
  if (config.glowEffect && config.glowEffect !== 'none') {
    highlights.push(`${config.glowEffect} glow`)
  }
  if (config.textOutline && config.textOutline !== 'none') {
    highlights.push(`${config.textOutline} outline`)
  }

  // Swoosh
  if (config.swooshStyle && config.swooshStyle !== 'none') {
    highlights.push(`${config.swooshStyle} swoosh`)
  }

  // Tilt
  if (config.tiltAngle !== 0) {
    highlights.push(`${config.tiltAngle}° tilt`)
  }

  // Background
  if (config.backgroundColor) {
    highlights.push(config.backgroundColor.replace('-', ' '))
  }

  // 3D depth (enhanced)
  if (config.depthAmount && config.depthAmount > 0) {
    highlights.push(`${config.depthAmount}% depth`)
  } else if (config.depthLevel && config.depthLevel !== 'flat') {
    highlights.push(`${config.depthLevel} 3D`)
  }

  return highlights.length > 0 ? highlights.join(' • ') : 'No options selected yet'
}
