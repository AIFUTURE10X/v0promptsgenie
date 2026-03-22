import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

function getSQL() {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
  if (!url) throw new Error("No database connection string configured")
  return neon(url)
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const sql = getSQL()
    await sql`DELETE FROM ai_helper_history WHERE session_id = ${sessionId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting AI helper history:", error)
    return NextResponse.json({ error: "Failed to delete AI helper history" }, { status: 500 })
  }
}
