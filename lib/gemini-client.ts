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

export async function generateImageWithRetry({
  prompt,
  aspectRatio = "1:1",
  referenceImage,
  seed,
}: {
  prompt: string
  aspectRatio?: string
  referenceImage?: string
  seed?: number
}) {
  const maxAttempts = Number(process.env.GEMINI_MAX_ATTEMPTS || 3)
  let delay = Number(process.env.GEMINI_RETRY_BASE_DELAY || 1500)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[v0 SERVER] Gemini attempt ${attempt}/${maxAttempts}`)
      console.log(`[v0 SERVER] Aspect Ratio: ${aspectRatio}`)
      console.log(`[v0 SERVER] Has reference image: ${!!referenceImage}`)
      console.log(`[v0 SERVER] Seed: ${seed !== undefined ? seed : 'random'}`)

      const geminiClient = getClient()

      const contentParts: any[] = [{ text: prompt }]

      if (referenceImage) {
        contentParts.push({
          inlineData: {
            mimeType: "image/png",
            data: referenceImage,
          },
        })
      }

      const config: any = {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      }

      if (seed !== undefined) {
        config.seed = seed
      }

      const response = await geminiClient.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: contentParts,
        config,
      })

      console.log(`[v0 SERVER] API response received`)
      console.log(`[v0 SERVER] Response object keys:`, Object.keys(response))

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
