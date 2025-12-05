/**
 * lib/background-removal.ts
 * Multi-method background removal utility for transparent PNG output
 */

import sharp from 'sharp'

export type BackgroundRemovalMethod = 'auto' | 'ai-local' | 'simple' | 'chromakey' | 'cloud' | 'pixian' | 'replicate' | 'smart' | 'pixelcut' | 'photoroom'

export interface RemoveBackgroundOptions {
  method?: BackgroundRemovalMethod
  tolerance?: number // How close to white a pixel must be (0-255, default 30)
  edgeSmoothing?: boolean // Apply edge smoothing for better results
  decontaminate?: boolean // Replace white edge colors with nearby non-white colors
  chromaColor?: { r: number; g: number; b: number } // For chromakey method
}

/**
 * Find a nearby non-white color to replace white edge pixels
 */
function findNearbyNonWhiteColor(
  pixels: Uint8ClampedArray,
  pixelIndex: number,
  width: number,
  height: number
): { r: number; g: number; b: number } {
  const x = (pixelIndex / 4) % width
  const y = Math.floor((pixelIndex / 4) / width)

  // Search in expanding squares around the pixel
  const searchRadius = 5
  let bestColor = { r: 0, g: 0, b: 0 }
  let foundNonWhite = false

  for (let radius = 1; radius <= searchRadius && !foundNonWhite; radius++) {
    for (let dy = -radius; dy <= radius && !foundNonWhite; dy++) {
      for (let dx = -radius; dx <= radius && !foundNonWhite; dx++) {
        // Only check perimeter of the square
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue

        const nx = x + dx
        const ny = y + dy

        // Bounds check
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

        const ni = (ny * width + nx) * 4
        const nr = pixels[ni]
        const ng = pixels[ni + 1]
        const nb = pixels[ni + 2]
        const na = pixels[ni + 3]

        // Look for opaque, non-white pixels
        if (na > 200 && (nr < 200 || ng < 200 || nb < 200)) {
          bestColor = { r: nr, g: ng, b: nb }
          foundNonWhite = true
        }
      }
    }
  }

  // If no non-white found, return black as fallback
  return foundNonWhite ? bestColor : { r: 0, g: 0, b: 0 }
}

/**
 * Convert RGB to HSV
 */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s, v }
}

/**
 * Flood-fill based background removal - only removes white connected to edges
 * This preserves interior light-colored elements that are part of the design
 */
export async function removeBackgroundFloodFill(
  imageBase64: string,
  options: RemoveBackgroundOptions = {}
): Promise<string> {
  const { tolerance = 15 } = options // Lower tolerance for more precision

  try {
    const inputBuffer = Buffer.from(imageBase64, 'base64')

    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = new Uint8ClampedArray(data)
    const { width, height } = info
    const threshold = 255 - tolerance

    // Track which pixels to make transparent
    const toRemove = new Set<number>()
    const visited = new Set<number>()

    // Check if pixel is "white enough" to be background
    const isWhite = (idx: number) => {
      const r = pixels[idx]
      const g = pixels[idx + 1]
      const b = pixels[idx + 2]
      return r > threshold && g > threshold && b > threshold
    }

    // Flood fill from a starting point
    const floodFill = (startX: number, startY: number) => {
      const stack: [number, number][] = [[startX, startY]]

      while (stack.length > 0) {
        const [x, y] = stack.pop()!
        if (x < 0 || x >= width || y < 0 || y >= height) continue

        const pixelIndex = (y * width + x) * 4
        if (visited.has(pixelIndex)) continue
        visited.add(pixelIndex)

        if (isWhite(pixelIndex)) {
          toRemove.add(pixelIndex)
          // Add neighbors (4-connected for speed)
          stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
        }
      }
    }

    // Start flood fill from all edges
    for (let x = 0; x < width; x++) {
      floodFill(x, 0)           // Top edge
      floodFill(x, height - 1)  // Bottom edge
    }
    for (let y = 0; y < height; y++) {
      floodFill(0, y)           // Left edge
      floodFill(width - 1, y)   // Right edge
    }

    // Apply transparency to marked pixels
    for (const idx of toRemove) {
      pixels[idx + 3] = 0 // Set alpha to 0
    }

    // Apply edge smoothing for anti-aliased edges
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) continue // Skip transparent

      // Check if this pixel borders a transparent one
      const x = (i / 4) % width
      const y = Math.floor((i / 4) / width)
      let bordersTrans = false

      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = (ny * width + nx) * 4
          if (pixels[ni + 3] === 0) {
            bordersTrans = true
            break
          }
        }
      }

      // If bordering transparent and somewhat white, apply partial transparency
      if (bordersTrans) {
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
        const brightness = (r + g + b) / 3
        if (brightness > 200) {
          // Fade based on how white it is
          const alpha = Math.round(((255 - brightness) / 55) * 255)
          pixels[i + 3] = Math.min(pixels[i + 3], Math.max(alpha, 50))
        }
      }
    }

    const outputBuffer = await sharp(Buffer.from(pixels), {
      raw: { width, height, channels: 4 }
    })
      .png({ compressionLevel: 6 })
      .toBuffer()

    console.log(`[Background Removal FloodFill] Removed ${toRemove.size} background pixels`)
    return outputBuffer.toString('base64')
  } catch (error) {
    console.error('[Background Removal FloodFill] Error:', error)
    throw error
  }
}

/**
 * Simple/Fast background removal using color threshold (legacy method)
 */
export async function removeBackgroundSimple(
  imageBase64: string,
  options: RemoveBackgroundOptions = {}
): Promise<string> {
  const { tolerance = 15, edgeSmoothing = true, decontaminate = true } = options

  try {
    const inputBuffer = Buffer.from(imageBase64, 'base64')

    // Get image metadata first
    const metadata = await sharp(inputBuffer).metadata()
    const { width = 0, height = 0 } = metadata

    if (!width || !height) {
      throw new Error('Could not determine image dimensions')
    }

    // Convert to raw RGBA pixel data
    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = new Uint8ClampedArray(data)
    const threshold = 255 - tolerance

    // Pass 1: Process each pixel for transparency
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]

      // Check if pixel is white/near-white
      if (r > threshold && g > threshold && b > threshold) {
        // Make fully transparent
        pixels[i + 3] = 0
      } else if (edgeSmoothing) {
        // For edge pixels (somewhat white), apply partial transparency
        const avgBrightness = (r + g + b) / 3
        if (avgBrightness > threshold - 30) {
          // Calculate alpha based on how close to white
          const alpha = Math.round(((255 - avgBrightness) / (255 - threshold + 30)) * 255)
          pixels[i + 3] = Math.min(pixels[i + 3], alpha)
        }
      }
    }

    // Pass 2: Color decontamination - replace white edge colors with nearby non-white colors
    if (decontaminate) {
      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3]

        // Only process semi-transparent edge pixels (not fully opaque, not fully transparent)
        if (alpha > 0 && alpha < 250) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]

          // If pixel color is still whitish, replace with nearby non-white color
          if (r > 180 && g > 180 && b > 180) {
            const nearbyColor = findNearbyNonWhiteColor(pixels, i, info.width, info.height)
            pixels[i] = nearbyColor.r
            pixels[i + 1] = nearbyColor.g
            pixels[i + 2] = nearbyColor.b
          }
        }
      }
    }

    // Convert back to PNG with transparency
    const outputBuffer = await sharp(Buffer.from(pixels), {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png({ compressionLevel: 6 })
      .toBuffer()

    return outputBuffer.toString('base64')
  } catch (error) {
    console.error('[Background Removal Simple] Error:', error)
    throw error
  }
}

/**
 * AI-based background removal using @imgly/background-removal-node
 * Higher quality but slower (2-5s first run, <1s after model cached)
 * Note: First run downloads ~50MB ML model which may take time
 */
export async function removeBackgroundAI(imageBase64: string): Promise<string> {
  try {
    console.log('[Background Removal AI] Starting AI-based removal...')
    console.log('[Background Removal AI] Note: First run downloads ML model (~50MB)')

    // Dynamic import to avoid loading the large model unless needed
    const { removeBackground: imglyRemove } = await import('@imgly/background-removal-node')

    console.log('[Background Removal AI] Module loaded successfully')

    const inputBuffer = Buffer.from(imageBase64, 'base64')

    // Create a Blob from the buffer for imgly
    const blob = new Blob([inputBuffer], { type: 'image/png' })

    console.log('[Background Removal AI] Running model...')

    // Run AI-based background removal
    const resultBlob = await imglyRemove(blob, {
      model: 'medium', // 'small', 'medium', or 'large'
      output: {
        format: 'image/png',
        quality: 0.9
      }
    })

    // Convert result back to base64
    const arrayBuffer = await resultBlob.arrayBuffer()
    const outputBase64 = Buffer.from(arrayBuffer).toString('base64')

    console.log('[Background Removal AI] Completed successfully')
    return outputBase64
  } catch (error: any) {
    console.error('[Background Removal AI] Error:', error?.message || error)
    console.error('[Background Removal AI] Stack:', error?.stack)
    // Re-throw with more context
    throw new Error(`AI background removal failed: ${error?.message || 'Unknown error'}. Try using "Fast" or "Auto" method instead.`)
  }
}

/**
 * Chromakey background removal - removes specific color (default: magenta)
 * Best when generating images on a solid color background
 */
export async function removeBackgroundChromakey(
  imageBase64: string,
  options: RemoveBackgroundOptions = {}
): Promise<string> {
  const {
    chromaColor = { r: 255, g: 0, b: 255 }, // Default to magenta
    tolerance = 40
  } = options

  try {
    console.log('[Background Removal Chromakey] Starting chromakey removal...')

    const inputBuffer = Buffer.from(imageBase64, 'base64')

    // Convert to raw RGBA pixel data
    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = new Uint8ClampedArray(data)

    // Get HSV of the chroma color for better matching
    const chromaHsv = rgbToHsv(chromaColor.r, chromaColor.g, chromaColor.b)
    const hueTolerance = tolerance // degrees of hue tolerance

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]

      const pixelHsv = rgbToHsv(r, g, b)

      // Calculate hue difference (accounting for circular nature of hue)
      let hueDiff = Math.abs(pixelHsv.h - chromaHsv.h)
      if (hueDiff > 180) hueDiff = 360 - hueDiff

      // Check if pixel matches chroma color
      if (hueDiff < hueTolerance && pixelHsv.s > 0.3 && pixelHsv.v > 0.3) {
        // Calculate alpha based on how close to chroma color
        const matchStrength = 1 - (hueDiff / hueTolerance)
        const satMatch = Math.min(1, pixelHsv.s / chromaHsv.s)
        const alpha = Math.round((1 - matchStrength * satMatch) * 255)
        pixels[i + 3] = Math.min(pixels[i + 3], alpha)
      }
    }

    // Convert back to PNG
    const outputBuffer = await sharp(Buffer.from(pixels), {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png({ compressionLevel: 6 })
      .toBuffer()

    console.log('[Background Removal Chromakey] Completed successfully')
    return outputBuffer.toString('base64')
  } catch (error) {
    console.error('[Background Removal Chromakey] Error:', error)
    throw error
  }
}

/**
 * Main entry point - removes background using specified method
 * @param imageBase64 - Base64 encoded image (without data URL prefix)
 * @param options - Configuration options including method selection
 * @returns Base64 encoded PNG with transparent background
 */
export async function removeBackground(
  imageBase64: string,
  options: RemoveBackgroundOptions = {}
): Promise<string> {
  const { method = 'auto' } = options

  console.log(`[Background Removal] Using method: ${method}`)

  switch (method) {
    case 'ai-local':
      // AI Local disabled - causes segfault on Windows due to ONNX Runtime issues
      // Fall back to flood-fill method
      console.warn('[Background Removal] AI Local disabled (ONNX compatibility issue), using flood-fill method')
      return removeBackgroundFloodFill(imageBase64, options)

    case 'chromakey':
      return removeBackgroundChromakey(imageBase64, options)

    case 'simple':
      // Legacy simple method - use flood-fill instead for better results
      return removeBackgroundFloodFill(imageBase64, options)

    case 'auto':
    default:
      // Auto mode: use flood-fill for best local results
      // This preserves interior design elements while removing edge backgrounds
      console.log('[Background Removal] Auto mode using flood-fill method')
      return removeBackgroundFloodFill(imageBase64, options)
  }
}

/**
 * Checks if an image already has transparency
 * @param imageBase64 - Base64 encoded image
 * @returns true if image has any transparent pixels
 */
export async function hasTransparency(imageBase64: string): Promise<boolean> {
  try {
    const inputBuffer = Buffer.from(imageBase64, 'base64')

    const { data } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = new Uint8ClampedArray(data)

    // Check alpha channel of each pixel
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 255) {
        return true
      }
    }

    return false
  } catch {
    return false
  }
}
