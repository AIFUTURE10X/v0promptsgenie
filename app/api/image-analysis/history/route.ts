import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!)

export async function GET() {
  try {
    console.log("[v0 API] Fetching image analysis history")
    
    const history = await sql`
      SELECT 
        id,
        subject_image_url,
        scene_image_url,
        style_image_url,
        subject_analysis,
        scene_analysis,
        style_analysis,
        main_prompt,
        selected_style,
        aspect_ratio,
        created_at
      FROM image_analysis_history
      ORDER BY created_at DESC
      LIMIT 20
    `

    console.log("[v0 API] Found", history.length, "history records")
    
    const historyWithImages = await Promise.all(
      history.map(async (item) => {
        const images = await sql`
          SELECT 
            id,
            image_url,
            aspect_ratio,
            style,
            width,
            height,
            file_size_mb
          FROM generated_images
          WHERE analysis_id = ${item.id}
          ORDER BY created_at
          LIMIT 4
        `
        
        return {
          ...item,
          generated_images: images,
          image_count: images.length
        }
      })
    )

    return NextResponse.json({ success: true, history: historyWithImages })
  } catch (error) {
    console.error("[v0 API] Failed to fetch history:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch history",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0 API] Received history save request:", JSON.stringify(body, null, 2))

    const {
      subjectImageUrl,
      sceneImageUrl,
      styleImageUrl,
      subjectAnalysis,
      sceneAnalysis,
      styleAnalysis,
      main_prompt,  // Changed from 'prompt' to 'main_prompt'
      negative_prompt,  // Changed from 'negativePrompt' to 'negative_prompt'
      aspect_ratio,  // Changed from 'aspectRatio' to 'aspect_ratio'
      selected_style,  // Changed from 'stylePreset' to 'selected_style'
      style_strength,  // Added
      camera_angle,  // Changed from 'cameraAngle' to 'camera_angle'
      camera_lens,  // Changed from 'cameraLens' to 'camera_lens'
      prompt_mode,  // Changed from 'promptMode' to 'prompt_mode'
      image_count,  // Changed from 'imageCount' to 'image_count'
      generated_images,  // Changed from 'generatedImages' to 'generated_images'
    } = body

    const [analysis] = await sql`
      INSERT INTO image_analysis_history (
        subject_image_url,
        scene_image_url,
        style_image_url,
        subject_analysis,
        scene_analysis,
        style_analysis,
        main_prompt,
        selected_style,
        aspect_ratio
      ) VALUES (
        ${subjectImageUrl || null},
        ${sceneImageUrl || null},
        ${styleImageUrl || null},
        ${subjectAnalysis || null},
        ${sceneAnalysis || null},
        ${styleAnalysis || null},
        ${main_prompt},
        ${selected_style || "Realistic"},
        ${aspect_ratio || "1:1"}
      )
      RETURNING id
    `

    console.log("[v0 API] Created analysis history with id:", analysis.id)

    if (generated_images && generated_images.length > 0) {
      console.log("[v0 API] Inserting", generated_images.length, "generated images")
      for (const img of generated_images) {
        await sql`
          INSERT INTO generated_images (
            analysis_id,
            image_url,
            width,
            height,
            file_size_mb
          ) VALUES (
            ${analysis.id},
            ${img.image_url},
            ${img.width || null},
            ${img.height || null},
            ${img.file_size_mb || null}
          )
        `
      }
      console.log("[v0 API] Successfully inserted all images")
    }

    return NextResponse.json({ success: true, analysisId: analysis.id })
  } catch (error) {
    console.error("[v0 API] Failed to save history:", error)
    return NextResponse.json(
      {
        error: "Failed to save history",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // Delete single item
      console.log("[v0 API] Deleting history item:", id)
      await sql`DELETE FROM generated_images WHERE analysis_id = ${id}`
      await sql`DELETE FROM image_analysis_history WHERE id = ${id}`
      return NextResponse.json({ success: true })
    } else {
      // Clear all history
      console.log("[v0 API] Clearing all history")
      await sql`DELETE FROM generated_images`
      await sql`DELETE FROM image_analysis_history`
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("[v0 API] Failed to delete history:", error)
    return NextResponse.json(
      { error: "Failed to delete history" },
      { status: 500 }
    )
  }
}
