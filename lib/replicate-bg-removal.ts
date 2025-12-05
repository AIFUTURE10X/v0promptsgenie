/**
 * lib/replicate-bg-removal.ts
 * AI-powered background removal using Replicate's BRIA-based model
 *
 * Uses lucataco/remove-bg which is based on BRIA AI's commercial
 * background removal - better at preserving fine details, text, and edges.
 *
 * Cost: ~$0.01 per image
 * Speed: 1-2 seconds
 */

import Replicate from "replicate"

/**
 * Remove background from an image using Replicate's BRIA-based model
 *
 * @param imageBase64 - Base64 encoded image (without data URL prefix)
 * @returns Base64 encoded PNG with transparent background
 */
export async function removeBackgroundWithReplicate(
  imageBase64: string
): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN

  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN environment variable is not set")
  }

  console.log("[Replicate BG Removal] Starting AI background removal...")

  const replicate = new Replicate({
    auth: apiToken,
  })

  // Use BRIA-based remove-bg model - better at preserving text and fine details
  // Works on any background color, not just white
  const output = await replicate.run(
    "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
    {
      input: {
        image: `data:image/png;base64,${imageBase64}`
      }
    }
  )

  console.log("[Replicate BG Removal] Model completed, fetching result...")
  console.log("[Replicate BG Removal] Output type:", typeof output, "Value:", output)

  // Output can be a string URL or a ReadableStream
  let outputUrl: string

  if (typeof output === 'string') {
    outputUrl = output
  } else if (output && typeof output === 'object') {
    // Handle FileOutput or other object types from newer Replicate SDK
    const outputObj = output as { url?: () => string } | { toString?: () => string }
    if ('url' in outputObj && typeof outputObj.url === 'function') {
      outputUrl = outputObj.url()
    } else if (output.toString && output.toString() !== '[object Object]') {
      outputUrl = output.toString()
    } else {
      // Try to get the URL from the object directly
      const maybeUrl = (output as Record<string, unknown>).url || (output as Record<string, unknown>)[0]
      if (typeof maybeUrl === 'string') {
        outputUrl = maybeUrl
      } else {
        console.error("[Replicate BG Removal] Unknown output format:", JSON.stringify(output, null, 2))
        throw new Error("Unexpected output format from Replicate")
      }
    }
  } else {
    throw new Error("No output URL returned from Replicate")
  }

  console.log("[Replicate BG Removal] Using URL:", outputUrl)

  // Fetch the result image and convert to base64
  const response = await fetch(outputUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch result image: ${response.status}`)
  }

  const buffer = await response.arrayBuffer()
  const resultBase64 = Buffer.from(buffer).toString('base64')

  console.log(`[Replicate BG Removal] Complete, output size: ${resultBase64.length}`)

  return resultBase64
}

/**
 * Check if Replicate background removal is available
 */
export function isReplicateBgRemovalAvailable(): boolean {
  return !!process.env.REPLICATE_API_TOKEN
}
