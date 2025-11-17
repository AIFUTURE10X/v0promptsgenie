import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      type, // 'generated' or 'analysis'
      imageUrl,
      prompt,
      settings,
      analysisResults
    } = body

    if (type === 'generated') {
      // Save generated image to database
      await sql`
        INSERT INTO image_analysis_history (
          image_url,
          prompt,
          settings,
          created_at
        ) VALUES (
          ${imageUrl},
          ${prompt},
          ${JSON.stringify(settings)},
          NOW()
        )
      `
    } else if (type === 'analysis') {
      // Save analysis results to database
      await sql`
        INSERT INTO image_analysis_history (
          image_url,
          analysis,
          created_at
        ) VALUES (
          ${imageUrl},
          ${JSON.stringify(analysisResults)},
          NOW()
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save to database:', error)
    return NextResponse.json(
      { error: 'Failed to save to database' },
      { status: 500 }
    )
  }
}
