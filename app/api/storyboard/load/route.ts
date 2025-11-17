import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Storyboard ID required" }, { status: 400 })
    }

    console.log("[v0] Loading storyboard:", id)

    // Get storyboard
    const storyboards = await sql`
      SELECT * FROM storyboards WHERE id = ${id}
    `

    if (storyboards.length === 0) {
      return NextResponse.json({ success: false, error: "Storyboard not found" }, { status: 404 })
    }

    // Get scenes
    const scenes = await sql`
      SELECT * FROM scenes 
      WHERE storyboard_id = ${id}
      ORDER BY scene_number ASC
    `

    console.log("[v0] Storyboard loaded:", { id, sceneCount: scenes.length })

    return NextResponse.json({
      success: true,
      storyboard: storyboards[0],
      scenes: scenes.map((scene) => ({
        id: scene.id,
        sceneNumber: scene.scene_number,
        title: scene.title,
        description: scene.description,
        imageUrl: scene.image_url,
        cameraAngle: scene.camera_angle,
        cameraMovement: scene.camera_movement,
        duration: scene.duration,
        notes: scene.notes,
      })),
    })
  } catch (error) {
    console.error("[v0] Error loading storyboard:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load storyboard",
      },
      { status: 500 },
    )
  }
}
