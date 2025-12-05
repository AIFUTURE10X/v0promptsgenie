/**
 * lib/photoroom-bg-removal.ts
 * Background removal using PhotoRoom API - professional-grade quality
 *
 * PhotoRoom offers fast, high-quality background removal with excellent edge detection.
 * Supports HD mode for high-resolution images (≥2K).
 *
 * Cost: $0.02 per image (10 free credits/month)
 * Speed: ~350ms median latency
 *
 * @see https://docs.photoroom.com/remove-background-api-basic-plan
 */

/**
 * Remove background from an image using PhotoRoom API
 *
 * @param imageBase64 - Base64 encoded image (without data URL prefix)
 * @param apiKey - PhotoRoom API key (from env or user-provided)
 * @param useHD - Enable HD mode for high-resolution images (≥2K)
 * @returns Base64 encoded PNG with transparent background
 */
export async function removeBackgroundWithPhotoRoom(
  imageBase64: string,
  apiKey?: string,
  useHD: boolean = false
): Promise<string> {
  const token = apiKey || process.env.PHOTOROOM_API_KEY

  if (!token) {
    throw new Error("PHOTOROOM_API_KEY environment variable is not set and no API key provided")
  }

  console.log("[PhotoRoom BG Removal] Starting professional background removal...")

  // Convert base64 to binary blob for multipart upload
  const imageBuffer = Buffer.from(imageBase64, 'base64')
  const blob = new Blob([imageBuffer], { type: 'image/png' })

  // Create form data with binary image
  const formData = new FormData()
  formData.append('image_file', blob, 'image.png')
  formData.append('format', 'png')

  try {
    const headers: Record<string, string> = {
      'x-api-key': token,  // lowercase as per PhotoRoom docs
      'Accept': 'image/png', // Request binary PNG directly
    }

    // Add HD header for high-resolution images
    if (useHD) {
      headers['pr-hd-background-removal'] = 'auto'
      console.log("[PhotoRoom BG Removal] HD mode enabled for high-resolution output")
    }

    const response = await fetch('https://sdk.photoroom.com/v1/segment', {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `PhotoRoom API error: ${response.status}`

      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.message) {
          errorMessage = `PhotoRoom: ${errorJson.message}`
        } else if (errorJson.error) {
          errorMessage = `PhotoRoom: ${errorJson.error}`
        }

        // Handle specific error codes
        if (response.status === 401) {
          errorMessage = 'PhotoRoom: Invalid API key. Please check your PHOTOROOM_API_KEY.'
        } else if (response.status === 402) {
          errorMessage = 'PhotoRoom: Insufficient credits. Please add more credits to your account.'
        } else if (response.status === 413) {
          errorMessage = 'PhotoRoom: Image file too large. Please use a smaller image.'
        } else if (response.status === 429) {
          errorMessage = 'PhotoRoom: Rate limit exceeded. Please try again later.'
        }
      } catch {
        // Not JSON, use raw text
        errorMessage = `PhotoRoom API error: ${errorText}`
      }

      throw new Error(errorMessage)
    }

    // Response is binary PNG data
    const resultBuffer = await response.arrayBuffer()
    const resultBase64 = Buffer.from(resultBuffer).toString('base64')

    console.log("[PhotoRoom BG Removal] Success! Professional-grade background removal complete")
    return resultBase64
  } catch (error) {
    console.error('[PhotoRoom BG Removal] API Error:', error)
    throw error
  }
}

/**
 * Check if PhotoRoom background removal is available
 */
export function isPhotoRoomBgRemovalAvailable(): boolean {
  return !!process.env.PHOTOROOM_API_KEY
}
