import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!)

export async function GET() {
  try {
    try {
      const storyboards = await sql`
        SELECT s.*, COUNT(sc.id) as scene_count
        FROM storyboards s
        LEFT JOIN scenes sc ON s.id = sc.storyboard_id
        GROUP BY s.id
        ORDER BY s.updated_at DESC
      `

      return NextResponse.json({
        success: true,
        storyboards: storyboards.map((sb) => ({
          id: sb.id,
          title: sb.title,
          description: sb.description,
          sceneCount: Number.parseInt(sb.scene_count),
          createdAt: sb.created_at,
          updatedAt: sb.updated_at,
        })),
      })
    } catch (tableError: any) {
      if (tableError?.code === "42P01" || tableError?.message?.includes("does not exist")) {
        return NextResponse.json({
          success: true,
          storyboards: [],
        })
      }
      throw tableError
    }
  } catch (error) {
    console.error("[v0] Error fetching storyboards:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch storyboards",
      },
      { status: 500 },
    )
  }
}
