import { type NextRequest, NextResponse } from "next/server"
import { removeBackground, type BackgroundRemovalMethod } from "@/lib/background-removal"
import { removeBackgroundCloud, removeBackgroundPixian } from "@/lib/cloud-bg-removal"
import { removeBackgroundWithReplicate } from "@/lib/replicate-bg-removal"
import { removeBackgroundSmart } from "@/lib/smart-bg-removal"
import { removeBackgroundWithPixelcut } from "@/lib/pixelcut-bg-removal"
import { removeBackgroundWithPhotoRoom } from "@/lib/photoroom-bg-removal"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null
    const bgRemovalMethod = (formData.get('bgRemovalMethod') as BackgroundRemovalMethod) || 'auto'
    const cloudApiKey = formData.get('cloudApiKey') as string | null

    console.log("[Remove BG API] Request received:", {
      hasImage: !!imageFile,
      imageSize: imageFile?.size,
      bgRemovalMethod,
      hasApiKey: !!cloudApiKey,
    })

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64')

    console.log(`[Remove BG API] Removing background with method: ${bgRemovalMethod}...`)

    // Remove background based on selected method
    let transparentBase64: string

    if (bgRemovalMethod === 'smart') {
      // Use Smart removal - detects background color and preserves ALL content including text
      transparentBase64 = await removeBackgroundSmart(imageBase64, {
        tolerance: 25,
        edgeSmoothing: false,  // Disabled - causes artifacts
      })
    } else if (bgRemovalMethod === 'replicate') {
      // Use Replicate AI - works on any background color
      transparentBase64 = await removeBackgroundWithReplicate(imageBase64)
    } else if (bgRemovalMethod === 'pixelcut') {
      // Use Pixelcut API - logo-optimized, preserves text and fine details
      transparentBase64 = await removeBackgroundWithPixelcut(imageBase64, cloudApiKey || undefined)
    } else if (bgRemovalMethod === 'photoroom') {
      // Use PhotoRoom API - professional-grade with fast processing
      transparentBase64 = await removeBackgroundWithPhotoRoom(imageBase64, cloudApiKey || undefined)
    } else if (bgRemovalMethod === 'pixian' && cloudApiKey) {
      // Use Pixian.ai API
      transparentBase64 = await removeBackgroundPixian(imageBase64, cloudApiKey)
    } else if (bgRemovalMethod === 'cloud' && cloudApiKey) {
      // Use remove.bg cloud API
      transparentBase64 = await removeBackgroundCloud(imageBase64, {
        apiKey: cloudApiKey
      })
    } else {
      // Use local methods (auto, simple, chromakey)
      transparentBase64 = await removeBackground(imageBase64, {
        method: bgRemovalMethod,
        tolerance: 12,
        edgeSmoothing: true,
      })
    }

    console.log("[Remove BG API] Background removed successfully")

    // Return as data URL
    const dataUrl = `data:image/png;base64,${transparentBase64}`

    return NextResponse.json({
      success: true,
      image: dataUrl,
      bgRemovalMethod,
    })
  } catch (error) {
    console.error("[Remove BG API] Route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove background" },
      { status: 500 }
    )
  }
}
