/**
 * lib/smart-bg-removal.ts
 * Smart background removal that preserves ALL logo content including text
 *
 * Unlike AI-based removal which tries to detect "subjects", this method:
 * 1. Detects the actual background color from the image edges
 * 2. Removes only pixels matching that background color
 * 3. Preserves ALL content including text that may be same color as background
 */

import sharp from 'sharp'
import {
  colorDistance,
  sampleEdgeColors,
  groupSimilarColors,
  type ColorSample
} from './smart-bg-utils'

export interface SmartRemovalOptions {
  /** Color tolerance for background matching (0-100, default 25) */
  tolerance?: number
  /** How many pixels deep to sample from edges (default 10) */
  sampleDepth?: number
  /** Apply edge smoothing for anti-aliased results */
  edgeSmoothing?: boolean
  /** Max dimension before downscaling (default 1500, prevents stack overflow) */
  maxDimension?: number
}

/**
 * Smart background removal that detects and removes actual background color
 * Preserves ALL logo content including text
 */
export async function removeBackgroundSmart(
  imageBase64: string,
  options: SmartRemovalOptions = {}
): Promise<string> {
  const {
    tolerance = 25,
    sampleDepth = 15,
    edgeSmoothing = false,  // Disabled - causes artifacts, flood-fill produces clean edges
    maxDimension = 1500     // Prevents stack overflow on large images
  } = options

  try {
    console.log('[Smart BG Removal] Starting smart background detection...')

    const inputBuffer = Buffer.from(imageBase64, 'base64')

    // Get original image dimensions
    const metadata = await sharp(inputBuffer).metadata()
    const origWidth = metadata.width || 1000
    const origHeight = metadata.height || 1000

    // Check if we need to downscale to prevent stack overflow
    const maxDim = Math.max(origWidth, origHeight)
    const needsDownscale = maxDim > maxDimension
    const scaleFactor = needsDownscale ? maxDimension / maxDim : 1

    let workingBuffer = inputBuffer
    if (needsDownscale) {
      const newWidth = Math.round(origWidth * scaleFactor)
      const newHeight = Math.round(origHeight * scaleFactor)
      console.log(`[Smart BG Removal] Downscaling from ${origWidth}x${origHeight} to ${newWidth}x${newHeight} to prevent stack overflow`)
      workingBuffer = await sharp(inputBuffer)
        .resize(newWidth, newHeight, { fit: 'inside' })
        .toBuffer()
    }

    const { data, info } = await sharp(workingBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = new Uint8ClampedArray(data)
    const { width, height } = info

    console.log(`[Smart BG Removal] Processing at ${width}x${height} (${(width * height).toLocaleString()} pixels)`)

    // Step 1: Sample colors from edges
    console.log('[Smart BG Removal] Sampling edge colors...')
    const edgeColors = sampleEdgeColors(pixels, width, height, sampleDepth)

    // Step 2: Group similar colors (handles gradients)
    const colorGroups = groupSimilarColors(edgeColors, 40)

    if (colorGroups.length === 0) {
      console.warn('[Smart BG Removal] No edge colors detected, returning original')
      return imageBase64
    }

    // The most common edge color(s) are likely the background
    const bgColors = colorGroups.slice(0, 3) // Top 3 color groups
    console.log('[Smart BG Removal] Detected background colors:', bgColors.map(c => `rgb(${c.r},${c.g},${c.b}) [${c.count}]`))

    // Check if background is dark and adjust settings accordingly
    const avgBrightness = bgColors.reduce((sum, c) => sum + (c.r + c.g + c.b) / 3, 0) / bgColors.length

    // For dark backgrounds, use more aggressive settings
    let effectiveTolerance = tolerance
    let effectiveBgColors = bgColors

    if (avgBrightness < 80) {
      // Dark background detected - use aggressive settings for gradient variations
      effectiveTolerance = Math.max(tolerance, 55)
      effectiveBgColors = colorGroups.slice(0, 8) // Use top 8 colors for dark gradients
      console.log(`[Smart BG Removal] Dark background detected (brightness: ${avgBrightness.toFixed(0)}), using enhanced settings: tolerance=${effectiveTolerance}, colors=${effectiveBgColors.length}`)
    } else if (avgBrightness > 200) {
      // Light/white background detected - increase tolerance for off-white variations
      effectiveTolerance = Math.max(tolerance, 35)
      effectiveBgColors = colorGroups.slice(0, 5) // Use top 5 colors instead of 3
      console.log(`[Smart BG Removal] Light background detected (brightness: ${avgBrightness.toFixed(0)}), using enhanced settings: tolerance=${effectiveTolerance}, colors=${effectiveBgColors.length}`)
    }

    // Step 3: Flood fill from edges, removing only background colors
    // Use Uint8Array instead of Set for memory efficiency on large images
    // 0 = not visited, 1 = visited (keep), 2 = visited (remove)
    const pixelState = new Uint8Array(width * height)
    let removeCount = 0

    // Scaled tolerance based on input (use effectiveTolerance for dark backgrounds)
    const colorThreshold = effectiveTolerance * 3 // Scale to reasonable range

    const isBackgroundColor = (idx: number): boolean => {
      const pixelColor = {
        r: pixels[idx],
        g: pixels[idx + 1],
        b: pixels[idx + 2]
      }

      // Check if pixel matches any of the background colors (use effectiveBgColors for dark backgrounds)
      for (const bgColor of effectiveBgColors) {
        if (colorDistance(pixelColor, bgColor) < colorThreshold) {
          return true
        }
      }
      return false
    }

    // Flood fill from edges using typed array for tracking
    const floodFill = (startX: number, startY: number) => {
      const stack: number[] = [startY * width + startX] // Use flat index

      while (stack.length > 0) {
        const flatIdx = stack.pop()!
        if (pixelState[flatIdx] !== 0) continue // Already visited

        const x = flatIdx % width
        const y = Math.floor(flatIdx / width)
        const pixelIndex = flatIdx * 4

        if (isBackgroundColor(pixelIndex)) {
          pixelState[flatIdx] = 2 // Mark as remove
          removeCount++
          // Add neighbors (8-connected) - only push unvisited pixels to prevent stack overflow
          if (x > 0 && pixelState[flatIdx - 1] === 0) stack.push(flatIdx - 1)           // Left
          if (x < width - 1 && pixelState[flatIdx + 1] === 0) stack.push(flatIdx + 1)   // Right
          if (y > 0 && pixelState[flatIdx - width] === 0) stack.push(flatIdx - width)   // Up
          if (y < height - 1 && pixelState[flatIdx + width] === 0) stack.push(flatIdx + width) // Down
          // Diagonals - critical for reaching enclosed background areas
          const tl = flatIdx - width - 1, tr = flatIdx - width + 1
          const bl = flatIdx + width - 1, br = flatIdx + width + 1
          if (x > 0 && y > 0 && pixelState[tl] === 0) stack.push(tl)                     // Top-left
          if (x < width - 1 && y > 0 && pixelState[tr] === 0) stack.push(tr)             // Top-right
          if (x > 0 && y < height - 1 && pixelState[bl] === 0) stack.push(bl)            // Bottom-left
          if (x < width - 1 && y < height - 1 && pixelState[br] === 0) stack.push(br)    // Bottom-right
        } else {
          pixelState[flatIdx] = 1 // Mark as keep
        }
      }
    }

    console.log('[Smart BG Removal] Running flood fill from edges...')

    // Start flood fill from all edges
    for (let x = 0; x < width; x++) {
      floodFill(x, 0)           // Top edge
      floodFill(x, height - 1)  // Bottom edge
    }
    for (let y = 0; y < height; y++) {
      floodFill(0, y)           // Left edge
      floodFill(width - 1, y)   // Right edge
    }

    // Step 4: Apply transparency based on pixelState
    for (let i = 0; i < pixelState.length; i++) {
      if (pixelState[i] === 2) {
        pixels[i * 4 + 3] = 0 // Set alpha to 0
      }
    }

    // Step 5: Edge smoothing for anti-aliased results (CONSERVATIVE)
    if (edgeSmoothing) {
      console.log('[Smart BG Removal] Applying edge smoothing...')

      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) continue // Skip fully transparent

        const x = (i / 4) % width
        const y = Math.floor((i / 4) / width)

        // Count transparent neighbors (only immediate 4-connected)
        let transparentNeighbors = 0
        const immediateNeighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]]

        for (const [dx, dy] of immediateNeighbors) {
          const nx = x + dx, ny = y + dy
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const ni = (ny * width + nx) * 4
            if (pixels[ni + 3] === 0) {
              transparentNeighbors++
            }
          }
        }

        // Only apply smoothing if pixel is VERY close to background AND has multiple transparent neighbors
        // This is much more conservative than before
        if (transparentNeighbors >= 2) {
          const pixelColor = { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] }

          for (const bgColor of bgColors) {
            const dist = colorDistance(pixelColor, bgColor)
            // Only smooth pixels that are within 50% of the threshold (very close to background)
            if (dist < colorThreshold * 0.5) {
              // Very light smoothing - only reduce alpha slightly for true edge pixels
              const alphaReduction = (1 - dist / (colorThreshold * 0.5)) * 0.3
              const newAlpha = Math.round(pixels[i + 3] * (1 - alphaReduction))
              pixels[i + 3] = Math.max(50, newAlpha) // Keep minimum alpha of 50 to avoid artifacts
              break
            }
          }
        }
      }
    }

    // Step 6: Cleanup pass - remove isolated semi-transparent pixels (artifacts)
    console.log('[Smart BG Removal] Cleaning up artifacts...')
    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3]
      // Skip fully opaque or fully transparent
      if (alpha === 255 || alpha === 0) continue

      const x = (i / 4) % width
      const y = Math.floor((i / 4) / width)

      // Count opaque neighbors
      let opaqueNeighbors = 0
      let transparentNeighbors = 0
      const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]

      for (const [dx, dy] of neighbors) {
        const nx = x + dx, ny = y + dy
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = (ny * width + nx) * 4
          if (pixels[ni + 3] === 255) opaqueNeighbors++
          if (pixels[ni + 3] === 0) transparentNeighbors++
        }
      }

      // If semi-transparent pixel is mostly surrounded by opaque pixels, make it opaque
      if (opaqueNeighbors >= 5) {
        pixels[i + 3] = 255
      }
      // If semi-transparent pixel is mostly surrounded by transparent pixels, make it transparent
      else if (transparentNeighbors >= 5) {
        pixels[i + 3] = 0
      }
    }

    // Step 7: Dark halo cleanup - remove dark pixels adjacent to transparency (background artifacts)
    // This catches shadow/glow remnants that weren't removed by flood fill
    if (avgBrightness < 80) {
      console.log('[Smart BG Removal] Cleaning up dark halo artifacts...')
      const darkThreshold = 50 // Pixels darker than this near transparency are likely background

      // Multiple passes to erode dark halos progressively
      for (let pass = 0; pass < 3; pass++) {
        let cleanedCount = 0
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] === 0) continue // Skip already transparent

          const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
          const brightness = (r + g + b) / 3

          // Only process dark pixels
          if (brightness > darkThreshold) continue

          const x = (i / 4) % width
          const y = Math.floor((i / 4) / width)

          // Check if adjacent to transparency
          let hasTransparentNeighbor = false
          const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]]

          for (const [dx, dy] of neighbors) {
            const nx = x + dx, ny = y + dy
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const ni = (ny * width + nx) * 4
              if (pixels[ni + 3] === 0) {
                hasTransparentNeighbor = true
                break
              }
            }
          }

          // Dark pixel next to transparency = likely background artifact
          if (hasTransparentNeighbor) {
            pixels[i + 3] = 0
            cleanedCount++
          }
        }
        console.log(`[Smart BG Removal] Halo cleanup pass ${pass + 1}: removed ${cleanedCount} dark edge pixels`)
        if (cleanedCount === 0) break // No more to clean
      }
    }

    // Create the processed image at working size
    let processedSharp = sharp(Buffer.from(pixels), {
      raw: { width, height, channels: 4 }
    })

    // If we downscaled, upscale back to original dimensions
    if (needsDownscale) {
      console.log(`[Smart BG Removal] Upscaling result back to ${origWidth}x${origHeight}`)
      processedSharp = processedSharp.resize(origWidth, origHeight, {
        fit: 'fill',
        kernel: 'lanczos3'  // High-quality upscaling
      })
    }

    const outputBuffer = await processedSharp
      .png({ compressionLevel: 6 })
      .toBuffer()

    console.log(`[Smart BG Removal] Complete! Removed ${removeCount} background pixels`)
    return outputBuffer.toString('base64')
  } catch (error) {
    console.error('[Smart BG Removal] Error:', error)
    throw error
  }
}

/**
 * Check if smart removal is suitable for an image
 * (i.e., if it has a detectable solid/gradient background)
 */
export async function canUseSmartRemoval(imageBase64: string): Promise<boolean> {
  try {
    const inputBuffer = Buffer.from(imageBase64, 'base64')

    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = new Uint8ClampedArray(data)
    const { width, height } = info

    // Sample edge colors
    const edgeColors = sampleEdgeColors(pixels, width, height, 5)
    const colorGroups = groupSimilarColors(edgeColors, 40)

    // If the top color group accounts for >50% of edge pixels, smart removal will work well
    if (colorGroups.length > 0) {
      const totalSamples = edgeColors.reduce((sum, c) => sum + c.count, 0)
      const topGroupPercent = colorGroups[0].count / totalSamples
      return topGroupPercent > 0.3 // At least 30% of edges are similar color
    }

    return false
  } catch {
    return false
  }
}
