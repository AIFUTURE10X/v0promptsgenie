/**
 * lib/replicate-bg-removal.ts
 * AI-powered background removal using Replicate's BRIA RMBG 2.0 model
 *
 * Uses bria/remove-background - the official Bria AI model with:
 * - 256 levels of transparency (not binary masks)
 * - Better preservation of fine details, text, and edges
 * - Natural blending with any background
 *
 * Cost: ~$0.01 per image
 * Speed: 1-2 seconds
 */

import Replicate from "replicate"

/**
 * Remove background from an image using Replicate's Bria RMBG 2.0 model
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

  console.log("[Replicate BG Removal] Starting Bria RMBG 2.0 background removal...")

  const replicate = new Replicate({
    auth: apiToken,
  })

  // Use official Bria RMBG 2.0 - 256 levels of transparency, better for logos
  const output = await replicate.run(
    "bria/remove-background:4ed060b3587b7c3912353dd7d59000c883a6e1c5c9181ed7415c2624c2e8e392",
    {
      input: {
        image: `data:image/png;base64,${imageBase64}`,
        preserve_alpha: true  // Maintain original transparency levels
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
