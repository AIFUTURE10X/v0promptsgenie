import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
  if (!url) {
    console.error("[v0 API] No database URL found in environment variables")
    throw new Error("Database URL not configured")
  }
  return url
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, role, content, suggestions, images, imageAnalysis } = body

    console.log("[v0 API] AI Helper save request:", {
      sessionId,
      role,
      contentLength: content?.length,
      hasSuggestions: !!suggestions,
      hasImages: !!images,
      hasImageAnalysis: !!imageAnalysis,
    })

    if (!sessionId || !role || !content) {
      console.error("[v0 API] Missing required fields:", {
        sessionId: !!sessionId,
        role: !!role,
        content: !!content,
      })
      return NextResponse.json(
        { error: "Missing required fields: sessionId, role, and content are required" },
        { status: 400 },
      )
    }

    const sql = neon(getDatabaseUrl())

    await sql`
      INSERT INTO ai_helper_history (
        session_id,
        role,
        content,
        suggestions,
        images,
        image_analysis
      ) VALUES (
        ${sessionId},
        ${role},
        ${content},
        ${suggestions ? JSON.stringify(suggestions) : null},
        ${images ? JSON.stringify(images) : null},
        ${imageAnalysis ? JSON.stringify(imageAnalysis) : null}
      )
    `

    console.log("[v0 API] Successfully saved AI helper message")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0 API] Failed to save AI helper message:", error)
    return NextResponse.json(
      { error: "Failed to save message", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
