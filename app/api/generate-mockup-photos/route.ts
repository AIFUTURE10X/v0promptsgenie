import { type NextRequest, NextResponse } from "next/server"
import { generateImageWithRetry } from "@/lib/gemini-client"
import { removeBackgroundWithReplicate } from "@/lib/replicate-bg-removal"
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

/**
 * API to generate product mockup photos for realistic mockup rendering
 *
 * This is a utility endpoint to generate and save product photos.
 * Run once to populate the public/mockups folder.
 */

// Product photo prompts for each product type and color
const PRODUCT_PROMPTS: Record<string, Record<string, string>> = {
  tshirt: {
    black: "product photography, blank black t-shirt on invisible mannequin, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view, cotton fabric texture visible",
    white: "product photography, blank white t-shirt on invisible mannequin, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view, cotton fabric texture visible",
    navy: "product photography, blank navy blue t-shirt on invisible mannequin, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view, cotton fabric texture visible",
    red: "product photography, blank red t-shirt on invisible mannequin, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view, cotton fabric texture visible",
    gray: "product photography, blank heather gray t-shirt on invisible mannequin, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view, cotton fabric texture visible",
  },
  hoodie: {
    black: "product photography, blank black hoodie with hood down on invisible mannequin, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
    white: "product photography, blank white hoodie with hood down on invisible mannequin, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
    navy: "product photography, blank navy blue hoodie with hood down on invisible mannequin, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
    gray: "product photography, blank heather gray hoodie with hood down on invisible mannequin, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
  },
  mug: {
    white: "product photography of a COMPLETELY BLANK white ceramic coffee mug, absolutely no logos no text no designs no prints no patterns, solid white color only, pure white studio background, professional product shot, high resolution, mug fills 80% of frame height, perfectly centered, handle on right side, straight-on side view, consistent scale, empty surface ready for printing",
    black: "product photography of a COMPLETELY BLANK black ceramic coffee mug, absolutely no logos no text no designs no prints no patterns, solid black color only, pure white studio background, professional product shot, high resolution, mug fills 80% of frame height, perfectly centered, handle on right side, straight-on side view, consistent scale, empty surface ready for printing",
    cream: "product photography of a COMPLETELY BLANK cream colored ceramic coffee mug, absolutely no logos no text no designs no prints no patterns, solid cream color only, pure white studio background, professional product shot, high resolution, mug fills 80% of frame height, perfectly centered, handle on right side, straight-on side view, consistent scale, empty surface ready for printing",
  },
  'phone-case': {
    black: "product photography, blank black iPhone phone case, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
    white: "product photography, blank white iPhone phone case, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
    clear: "product photography, blank clear transparent iPhone phone case, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
  },
  hat: {
    black: "product photography, blank black baseball cap, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front angled view",
    white: "product photography, blank white baseball cap, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front angled view",
    navy: "product photography, blank navy blue baseball cap, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front angled view",
  },
  'tote-bag': {
    natural: "product photography, blank natural canvas tote bag, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
    black: "product photography, blank black canvas tote bag, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
    white: "product photography, blank white canvas tote bag, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
  },
  pillow: {
    white: "product photography, blank white throw pillow, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
    cream: "product photography, blank cream throw pillow, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
    gray: "product photography, blank gray throw pillow, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view",
  },
  'wall-art': {
    white: "product photography, blank white canvas wall art in black frame, pure white background, studio lighting, centered, no image on canvas, professional mockup, high resolution, clean minimal style, front view",
    black: "product photography, blank black canvas wall art in white frame, pure white background, studio lighting, centered, no image on canvas, professional mockup, high resolution, clean minimal style, front view",
  },
  stickers: {
    white: "product photography, blank white die-cut sticker sheet, pure white background, studio lighting, centered, no logos, no text, professional mockup, high resolution, clean minimal style, front view, rounded rectangle shapes",
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product, color, saveToFile = false } = body

    // Validate inputs
    if (!product || !PRODUCT_PROMPTS[product]) {
      return NextResponse.json(
        { error: `Invalid product. Available: ${Object.keys(PRODUCT_PROMPTS).join(', ')}` },
        { status: 400 }
      )
    }

    if (!color || !PRODUCT_PROMPTS[product][color]) {
      return NextResponse.json(
        { error: `Invalid color for ${product}. Available: ${Object.keys(PRODUCT_PROMPTS[product]).join(', ')}` },
        { status: 400 }
      )
    }

    const prompt = PRODUCT_PROMPTS[product][color]
    console.log(`[Mockup Photo] Generating ${product}/${color}...`)

    // Generate the image
    const result = await generateImageWithRetry({
      prompt,
      aspectRatio: '1:1',
      imageSize: '2K',
      model: 'gemini-3-pro-image-preview',
    })

    if (!result.success || !result.imageBase64) {
      throw new Error(result.error || 'Failed to generate image')
    }

    // Auto-remove background for transparent PNG using AI
    let finalBase64 = result.imageBase64
    try {
      console.log(`[Mockup Photo] Removing background with AI (Replicate)...`)
      finalBase64 = await removeBackgroundWithReplicate(result.imageBase64)
      console.log(`[Mockup Photo] Background removed successfully`)
    } catch (bgError) {
      console.error('[Mockup Photo] BG removal failed, using original:', bgError)
      // Continue with original image if BG removal fails
    }

    const dataUrl = `data:image/png;base64,${finalBase64}`

    // Optionally save to file system
    if (saveToFile) {
      try {
        const publicDir = path.join(process.cwd(), 'public', 'mockups', product)
        await mkdir(publicDir, { recursive: true })

        const filePath = path.join(publicDir, `${color}.png`)
        const buffer = Buffer.from(finalBase64, 'base64')
        await writeFile(filePath, buffer)

        console.log(`[Mockup Photo] Saved to ${filePath}`)

        return NextResponse.json({
          success: true,
          product,
          color,
          savedPath: `/mockups/${product}/${color}.png`,
          dataUrl,
        })
      } catch (fsError) {
        console.error('[Mockup Photo] Failed to save file:', fsError)
        // Still return success with dataUrl even if file save fails
      }
    }

    return NextResponse.json({
      success: true,
      product,
      color,
      dataUrl,
    })
  } catch (error) {
    console.error('[Mockup Photo] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate mockup photo' },
      { status: 500 }
    )
  }
}

// GET endpoint to list available products and colors
export async function GET() {
  return NextResponse.json({
    products: Object.entries(PRODUCT_PROMPTS).map(([id, colors]) => ({
      id,
      colors: Object.keys(colors),
    })),
  })
}
