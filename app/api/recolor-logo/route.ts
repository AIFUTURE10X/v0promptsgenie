/**
 * API Route: Recolor Logo
 *
 * Uses FLUX Kontext to intelligently recolor a logo with up to 4 colors.
 * The AI understands the logo structure and applies colors appropriately.
 */

import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import Replicate from "replicate"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, colors, preserveMetallic = true } = body

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return NextResponse.json({ error: "At least one color is required" }, { status: 400 })
    }

    const apiToken = process.env.REPLICATE_API_TOKEN
    if (!apiToken) {
      return NextResponse.json({ error: "Replicate API token not configured" }, { status: 500 })
    }

    console.log("[Recolor API] Starting recolor with colors:", colors)

    // Build the recolor instruction
    const colorNames = colors.filter(c => c).slice(0, 4)
    let instruction = `Recolor this logo to use ${colorNames.join(", ")}.`

    if (preserveMetallic) {
      instruction += " Maintain the metallic, 3D, and reflective qualities of the original. Keep the same level of detail and shading."
    }

    instruction += " Keep the exact same logo design, shape, and composition."

    console.log("[Recolor API] Instruction:", instruction)

    const replicate = new Replicate({ auth: apiToken })

    // Use FLUX Kontext for instruction-based image editing
    const output = await replicate.run(
      "black-forest-labs/flux-kontext-dev:85723d503c17da3f9fd9cecfb9987a8bf60ef747fd8f68a25d7636f88260eb59",
      {
        input: {
          prompt: instruction,
          input_image: imageUrl,
          guidance: 3.5,
          num_inference_steps: 28,
          aspect_ratio: "match_input_image",
          output_format: "png",
          output_quality: 95,
        }
      }
    )

    console.log("[Recolor API] Model completed, output:", typeof output)

    // Extract URL from output
    let outputUrl: string
    if (typeof output === 'string') {
      outputUrl = output
    } else if (Array.isArray(output) && output.length > 0) {
      outputUrl = typeof output[0] === 'string' ? output[0] : output[0].toString()
    } else if (output && typeof output === 'object') {
      const outputObj = output as Record<string, unknown>
      if ('url' in outputObj && typeof outputObj.url === 'function') {
        outputUrl = (outputObj as { url: () => string }).url()
      } else if (outputObj.toString && outputObj.toString() !== '[object Object]') {
        outputUrl = outputObj.toString()
      } else {
        throw new Error("Could not extract URL from output")
      }
    } else {
      throw new Error("No output from model")
    }

    console.log("[Recolor API] Output URL:", outputUrl)

    // Fetch and upload to Vercel Blob for persistence
    const response = await fetch(outputUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch result: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const filename = `logos/recolor-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`

    const blobResult = await put(filename, Buffer.from(buffer), {
      access: 'public',
      contentType: 'image/png'
    })

    console.log("[Recolor API] Uploaded to Blob:", blobResult.url)

    return NextResponse.json({
      success: true,
      image: blobResult.url,
      colors: colorNames,
    })

  } catch (error) {
    console.error("[Recolor API] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to recolor logo" },
      { status: 500 }
    )
  }
}
