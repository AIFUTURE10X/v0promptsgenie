import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
  if (!url) {
    console.error("[v0 API] No database URL found in environment variables")
    throw new Error("Database URL not configured")
  }
  return url
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0 API] Fetching AI helper history")

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const sql = neon(getDatabaseUrl())

    const results = await sql`
      SELECT * FROM ai_helper_history
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    console.log("[v0 API] Found", results.length, "history records")
    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error("[v0 API] Error fetching AI helper history:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch AI helper history",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
