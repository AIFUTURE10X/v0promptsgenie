/**
 * lib/gemini-client.ts
 * Unified Gemini API client with retry, backoff, and fallback handling
 */

import { GoogleGenAI } from "@google/genai"

let client: GoogleGenAI | null = null

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }
    client = new GoogleGenAI({ apiKey })
  }
  return client
}

export type ImageSize = "1K" | "2K" | "4K"
export type GenerationModel = "gemini-2.5-flash-preview-image" | "gemini-3-pro-image-preview"

export interface GenerateImageOptions {
  prompt: string
  aspect_ratio?: string
  imageBase64?: string
  model?: string
  maxAttempts?: number
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isQuotaOrRateError(err: any): boolean {
  if (!err) return false
  const msg = err.message?.toLowerCase?.() || ""
  return msg.includes("quota") || msg.includes("rate") || msg.includes("resource exhausted") || err.status === 429
}

export type ReferenceMode = 'replicate' | 'inspire'

export async function generateImageWithRetry({
  prompt,
  aspectRatio = "1:1",
  referenceImage,
  referenceMode = "inspire",
  seed,
  model = "gemini-2.5-flash-preview-image",
  imageSize = "1K",
  disableSearch = false,
}: {
  prompt: string
  aspectRatio?: string
  referenceImage?: string
  referenceMode?: ReferenceMode
  seed?: number
  model?: GenerationModel
  imageSize?: ImageSize
  /** Disable Google Search grounding for creative generation (logos, art) */
  disableSearch?: boolean
}) {
  const maxAttempts = Number(process.env.GEMINI_MAX_ATTEMPTS || 3)
  let delay = Number(process.env.GEMINI_RETRY_BASE_DELAY || 1500)

  // Force 1K for Gemini 2.5 Flash (doesn't support higher resolutions)
  const effectiveImageSize = model === "gemini-2.5-flash-preview-image" ? "1K" : imageSize

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[v0 SERVER] Gemini attempt ${attempt}/${maxAttempts}`)
      console.log(`[v0 SERVER] Model: ${model}`)
      console.log(`[v0 SERVER] Aspect Ratio: ${aspectRatio}`)
      console.log(`[v0 SERVER] Image Size: ${effectiveImageSize}`)
      console.log(`[v0 SERVER] Has reference image: ${!!referenceImage}`)
      console.log(`[v0 SERVER] Seed: ${seed !== undefined ? seed : 'random'}`)

      const geminiClient = getClient()

      // Build content parts - for image-to-image, put the image FIRST with clear instructions
      const contentParts: any[] = []

      if (referenceImage) {
        // Image-to-image generation: put image first, then instruction
        contentParts.push({
          inlineData: {
            mimeType: "image/png",
            data: referenceImage,
          },
        })

        if (referenceMode === 'replicate') {
          // REPLICATE MODE: Generate an exact copy of the image
          contentParts.push({
            text: `Generate an EXACT replica of this image. Recreate every detail precisely - same subject, same colors, same composition, same style, same background. Do not add, remove, or change anything. Output should be visually identical to the input image.`
          })
          console.log(`[v0 SERVER] REPLICATE mode: generating exact copy`)
        } else {
          // INSPIRE MODE: Use as reference while incorporating user prompt
          contentParts.push({
            text: `Using the provided image as reference, generate a new image that maintains the same subject/object appearance. ${prompt}`
          })
          console.log(`[v0 SERVER] INSPIRE mode: using image as reference for prompt`)
        }
      } else {
        // Text-to-image: just the prompt
        contentParts.push({ text: prompt })
      }

      const imageConfig: any = {
        aspectRatio: aspectRatio,
      }

      // Add imageSize for Gemini 3 Pro Image model
      if (model === "gemini-3-pro-image-preview") {
        imageConfig.imageSize = effectiveImageSize
      }

      const config: any = {
        // Use IMAGE-only response for better quality (no text reasoning to split attention)
        responseModalities: ["IMAGE"],
        imageConfig,
      }

      if (seed !== undefined) {
        config.seed = seed
      }

      // Add Google Search Grounding for Gemini 3 Pro (disabled for creative generation like logos)
      // When disableSearch=true, model uses pure creative synthesis without web influence
      const tools = (model === "gemini-3-pro-image-preview" && !disableSearch)
        ? [{ googleSearch: {} }]
        : undefined

      const response = await geminiClient.models.generateContent({
        model: model,
        contents: contentParts,
        config,
        tools,
      })

      console.log(`[v0 SERVER] API response received`)
      console.log(`[v0 SERVER] Response object keys:`, Object.keys(response))

      // Check if Google Search grounding was used
      const groundingMetadata = (response.candidates?.[0] as any)?.groundingMetadata
      if (groundingMetadata) {
        console.log(`[v0 SERVER] Google Search grounding WAS USED`)
        console.log(`[v0 SERVER] Search queries:`, groundingMetadata.webSearchQueries)
        console.log(`[v0 SERVER] Grounding chunks:`, groundingMetadata.groundingChunks?.length || 0)
      } else {
        console.log(`[v0 SERVER] Google Search grounding was NOT used (model used its own knowledge)`)
      }

      let imageBase64 = null

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageBase64 = part.inlineData.data
            console.log("[v0 SERVER] Found image in part.inlineData.data")
            break
          }
          if ((part as any).inline_data?.data) {
            imageBase64 = (part as any).inline_data.data
            console.log("[v0 SERVER] Found image in part.inline_data.data")
            break
          }
        }
      }

      if (!imageBase64 && (response as any).response?.candidates?.[0]?.content?.parts) {
        for (const part of (response as any).response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            imageBase64 = part.inlineData.data
            console.log("[v0 SERVER] Found image in response.response.candidates")
            break
          }
          if (part.inline_data?.data) {
            imageBase64 = part.inline_data.data
            console.log("[v0 SERVER] Found image in response.response.candidates (snake_case)")
            break
          }
        }
      }

      if (!imageBase64) {
        console.error(`[v0 SERVER] Response structure:`, JSON.stringify(response, null, 2).substring(0, 1000))
        throw new Error("No image data returned from Gemini API")
      }

      console.log("[v0 SERVER] Image generation successful, base64 length:", imageBase64.length)
      return {
        success: true,
        imageBase64,
        seed, // Return the seed that was used (undefined if random)
      }
    } catch (err: any) {
      console.error(`[v0 SERVER] Attempt ${attempt} error:`, err.message)

      if (err.response) {
        console.error(`[v0 SERVER] Error response:`, JSON.stringify(err.response, null, 2).substring(0, 500))
      }

      if (isQuotaOrRateError(err) && attempt < maxAttempts) {
        console.warn(`[v0 SERVER] Quota/rate error, retrying after ${delay}ms`)
        await sleep(delay)
        delay *= 2
        continue
      }

      if (attempt === maxAttempts) {
        return {
          success: false,
          error: err.message || "Failed to generate image",
        }
      }
    }
  }

  return {
    success: false,
    error: "Failed after max retry attempts",
  }
}
