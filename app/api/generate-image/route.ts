import { type NextRequest, NextResponse } from "next/server"
import { generateImageWithRetry } from "@/lib/gemini-client"

type AllowedRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3"

function normalizeAspectRatio(input: string): AllowedRatio {
  const allowed = new Set<AllowedRatio>(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"])
  const trimmed = input.replace(/\s+/g, "") as AllowedRatio
  if (!allowed.has(trimmed)) {
    throw new Error(`Unsupported aspect ratio: ${input}`)
  }
  return trimmed
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const count = parseInt(formData.get('count') as string) || 1
    const rawAspectRatio = (formData.get('aspectRatio') as string) || "1:1"
    const referenceImageFile = formData.get('referenceImage') as File | null
    const seedParam = formData.get('seed') as string | null
    const seed = seedParam ? parseInt(seedParam) : undefined
    
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
      hasRef: !!referenceImage,
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
          seed,
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
