import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { id, title, description, scenes } = await request.json()

    console.log("[v0] Saving storyboard:", { id, title, sceneCount: scenes.length })

    try {
      await sql`SELECT 1 FROM storyboards LIMIT 1`
    } catch (tableError) {
      console.log("[v0] Tables don't exist, creating them...")

      // Create tables with RLS enabled
      await sql`
        CREATE TABLE IF NOT EXISTS storyboards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS scenes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          storyboard_id UUID NOT NULL REFERENCES storyboards(id) ON DELETE CASCADE,
          scene_number INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          camera_angle TEXT,
          camera_movement TEXT,
          duration TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

      await sql`CREATE INDEX IF NOT EXISTS idx_scenes_storyboard_id ON scenes(storyboard_id)`
      await sql`CREATE INDEX IF NOT EXISTS idx_scenes_scene_number ON scenes(storyboard_id, scene_number)`

      // Enable RLS
      await sql`ALTER TABLE storyboards ENABLE ROW LEVEL SECURITY`
      await sql`ALTER TABLE scenes ENABLE ROW LEVEL SECURITY`

      // Create RLS policies (without IF NOT EXISTS which isn't supported)
      try {
        await sql`
          CREATE POLICY allow_public_storyboards
          ON storyboards FOR ALL
          USING (true)
          WITH CHECK (true)
        `
      } catch (policyError) {
        // Policy might already exist, ignore
        console.log("[v0] Storyboards policy already exists or error:", policyError)
      }

      try {
        await sql`
          CREATE POLICY allow_public_scenes
          ON scenes FOR ALL
          USING (true)
          WITH CHECK (true)
        `
      } catch (policyError) {
        // Policy might already exist, ignore
        console.log("[v0] Scenes policy already exists or error:", policyError)
      }

      console.log("[v0] Tables and RLS policies created successfully")
    }

    // If id exists, update existing storyboard, otherwise create new
    let storyboardId = id

    if (storyboardId) {
      // Update existing storyboard
      await sql`
        UPDATE storyboards 
        SET title = ${title}, description = ${description}, updated_at = NOW()
        WHERE id = ${storyboardId}
      `

      // Delete existing scenes
      await sql`DELETE FROM scenes WHERE storyboard_id = ${storyboardId}`
    } else {
      // Create new storyboard
      const result = await sql`
        INSERT INTO storyboards (title, description)
        VALUES (${title}, ${description})
        RETURNING id
      `
      storyboardId = result[0].id
    }

    // Insert all scenes
    for (const scene of scenes) {
      await sql`
        INSERT INTO scenes (
          storyboard_id, scene_number, title, description, 
          image_url, camera_angle, camera_movement, duration, notes
        )
        VALUES (
          ${storyboardId}, ${scene.sceneNumber}, ${scene.title}, ${scene.description},
          ${scene.imageUrl || null}, ${scene.cameraAngle}, ${scene.cameraMovement}, 
          ${scene.duration}, ${scene.notes || null}
        )
      `
    }

    console.log("[v0] Storyboard saved successfully:", storyboardId)

    return NextResponse.json({
      success: true,
      storyboardId,
      message: "Storyboard saved successfully",
    })
  } catch (error) {
    console.error("[v0] Error saving storyboard:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save storyboard",
      },
      { status: 500 },
    )
  }
}
