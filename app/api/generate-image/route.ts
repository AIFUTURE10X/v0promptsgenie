import { type NextRequest, NextResponse } from "next/server"
import { generateImageWithRetry, type ImageSize, type GenerationModel } from "@/lib/gemini-client"

type AllowedRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3" | "21:9" | "5:4" | "4:5"

function normalizeAspectRatio(input: string): AllowedRatio {
  const allowed = new Set<AllowedRatio>(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9", "5:4", "4:5"])
  const trimmed = input.replace(/\s+/g, "") as AllowedRatio
  if (!allowed.has(trimmed)) {
    throw new Error(`Unsupported aspect ratio: ${input}`)
  }
  return trimmed
}

function normalizeImageSize(input: string | null): ImageSize {
  const allowed = new Set<ImageSize>(["1K", "2K", "4K"])
  const normalized = (input?.toUpperCase() || "1K") as ImageSize
  if (!allowed.has(normalized)) {
    return "1K"
  }
  return normalized
}

function normalizeModel(input: string | null): GenerationModel {
  // Support old model names for backwards compatibility with saved presets
  const migrations: Record<string, GenerationModel> = {
    'gemini-2.5-flash-preview-image': 'gemini-2.5-flash-image',
    'gemini-3-pro-image': 'gemini-3-pro-image-preview',
  }
  const migrated = input ? (migrations[input] || input) : null

  const allowed: GenerationModel[] = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"]
  if (migrated && allowed.includes(migrated as GenerationModel)) {
    return migrated as GenerationModel
  }
  return "gemini-2.5-flash-image"
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const count = parseInt(formData.get('count') as string) || 1
    const rawAspectRatio = (formData.get('aspectRatio') as string) || "1:1"
    const referenceImageFile = formData.get('referenceImage') as File | null
    const referenceMode = (formData.get('referenceMode') as string) || 'inspire'
    const seedParam = formData.get('seed') as string | null
    const seed = seedParam ? parseInt(seedParam) : undefined
    const imageSize = normalizeImageSize(formData.get('imageSize') as string | null)
    const model = normalizeModel(formData.get('model') as string | null)

    // Convert File to base64 if present
    let referenceImage: string | undefined
    if (referenceImageFile && referenceImageFile.size > 0) {
      const arrayBuffer = await referenceImageFile.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      referenceImage = base64
    }

    console.log("[v0 SERVER] Generate request:", {
      prompt: prompt?.substring(0, 100),
      count,
      aspectRatio: rawAspectRatio,
      model,
      imageSize,
      hasRef: !!referenceImage,
      referenceMode,
      seed,
    })

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const aspectRatio = normalizeAspectRatio(rawAspectRatio)
    const images: string[] = []

    for (let i = 0; i < count; i++) {
      try {
        console.log(`[v0 SERVER] Generating image ${i + 1}/${count}`)

        const result = await generateImageWithRetry({
          prompt,
          aspectRatio,
          referenceImage,
          referenceMode: referenceMode as 'replicate' | 'inspire',
          seed,
          model,
          imageSize,
        })

        if (result.success && result.imageBase64) {
          const dataUrl = `data:image/png;base64,${result.imageBase64}`
          images.push(dataUrl)
          console.log(`[v0 SERVER] Image ${i + 1} generated successfully`)
        } else {
          throw new Error(result.error || "Failed to generate image")
        }
      } catch (error: any) {
        console.error(`[v0 SERVER] Image ${i + 1} failed:`, error.message)
        if (i === 0) {
          return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
        }
      }
    }

    console.log(`[v0 SERVER] Success: ${images.length}/${count} images generated`)
    return NextResponse.json({ images })
  } catch (error) {
    console.error("[v0 SERVER] Route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 },
    )
  }
}
