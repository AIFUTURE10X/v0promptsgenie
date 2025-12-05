/**
 * lib/vectorization.ts
 * PNG to SVG vectorization using @neplex/vectorizer
 */

import sharp from 'sharp'
import { vectorize, ColorMode, Hierarchical, PathSimplifyMode } from '@neplex/vectorizer'

export type VectorizationMode = 'auto' | 'color' | 'monochrome'

export interface VectorizationOptions {
  mode?: VectorizationMode
  colorCount?: number
  filterSpeckle?: number
  pathPrecision?: number
}

/**
 * Detect if image is primarily monochrome or color
 */
async function detectImageType(imageBuffer: Buffer): Promise<'color' | 'monochrome'> {
  try {
    const { data } = await sharp(imageBuffer)
      .resize(100, 100, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = new Uint8ClampedArray(data)
    let colorVariance = 0
    let sampleCount = 0

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]

      // Skip transparent pixels
      if (a < 128) continue

      // Calculate color variance (difference between RGB channels)
      const maxC = Math.max(r, g, b)
      const minC = Math.min(r, g, b)
      colorVariance += (maxC - minC)
      sampleCount++
    }

    if (sampleCount === 0) return 'color'

    const avgVariance = colorVariance / sampleCount
    console.log('[Vectorize] Color variance:', avgVariance)

    // Low variance = monochrome (grayscale or single color)
    return avgVariance < 25 ? 'monochrome' : 'color'
  } catch (error) {
    console.error('[Vectorize] Detection error:', error)
    return 'color' // Default to color on error
  }
}

/**
 * Preprocess image with Sharp for optimal vectorization
 */
async function preprocessImage(
  imageBuffer: Buffer,
  mode: 'color' | 'monochrome'
): Promise<Buffer> {
  let pipeline = sharp(imageBuffer).ensureAlpha()

  // For monochrome, increase contrast for cleaner edges
  if (mode === 'monochrome') {
    pipeline = pipeline
      .normalize() // Stretch histogram for better contrast
  }

  // Output as PNG for consistent input
  return pipeline.png().toBuffer()
}

/**
 * Convert a PNG logo to SVG vector format
 *
 * @param imageBuffer - PNG image buffer (can be base64 string or Buffer)
 * @param options - Vectorization options
 * @returns SVG string
 */
export async function vectorizeLogo(
  imageBuffer: Buffer | string,
  options: VectorizationOptions = {}
): Promise<string> {
  const {
    mode = 'auto',
    colorCount = 16,
    filterSpeckle = 4,
    pathPrecision = 5,
  } = options

  // Convert base64 string to buffer if needed
  const buffer = typeof imageBuffer === 'string'
    ? Buffer.from(imageBuffer, 'base64')
    : imageBuffer

  // Auto-detect mode if needed
  let effectiveMode: 'color' | 'monochrome' = mode === 'auto'
    ? await detectImageType(buffer)
    : mode as 'color' | 'monochrome'

  console.log('[Vectorize] Using mode:', effectiveMode)

  // Preprocess with Sharp
  const processedBuffer = await preprocessImage(buffer, effectiveMode)

  // Calculate color precision from colorCount
  // colorPrecision is 1-8, representing 2^n colors
  const colorPrecision = Math.min(8, Math.max(1, Math.ceil(Math.log2(colorCount))))

  console.log('[Vectorize] Settings:', {
    colorPrecision,
    filterSpeckle,
    pathPrecision,
    colorCount,
  })

  // Vectorize using @neplex/vectorizer
  const svg = await vectorize(processedBuffer, {
    colorMode: effectiveMode === 'monochrome' ? ColorMode.Binary : ColorMode.Color,
    colorPrecision,
    filterSpeckle,
    spliceThreshold: 45,
    cornerThreshold: 60,
    hierarchical: Hierarchical.Stacked,
    mode: PathSimplifyMode.Spline,
    layerDifference: effectiveMode === 'monochrome' ? 10 : 5,
    lengthThreshold: 5,
    maxIterations: 2,
    pathPrecision,
  })

  console.log('[Vectorize] SVG generated, length:', svg.length)

  return svg
}

/**
 * Get recommended settings based on logo type
 */
export function getRecommendedSettings(logoType: 'flat' | 'gradient' | 'detailed' | 'text'): VectorizationOptions {
  switch (logoType) {
    case 'flat':
      return { colorCount: 8, filterSpeckle: 4, pathPrecision: 4 }
    case 'gradient':
      return { colorCount: 24, filterSpeckle: 2, pathPrecision: 6 }
    case 'detailed':
      return { colorCount: 32, filterSpeckle: 1, pathPrecision: 6 }
    case 'text':
      return { colorCount: 4, filterSpeckle: 2, pathPrecision: 5, mode: 'monochrome' }
    default:
      return { colorCount: 16, filterSpeckle: 4, pathPrecision: 5 }
  }
}
