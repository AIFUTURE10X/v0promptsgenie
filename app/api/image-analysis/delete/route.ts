import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL!)

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM image_analysis_history WHERE id = ${Number.parseInt(id)}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image analysis history:", error)
    return NextResponse.json({ error: "Failed to delete image analysis history" }, { status: 500 })
  }
}
