import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.NEON_DATABASE_URL!)

// GET /api/logo-history/debug - List all logos with user counts
export async function GET() {
  try {
    // Get count by user
    const userCounts = await sql`
      SELECT user_id, COUNT(*) as count, MAX(created_at) as last_created
      FROM public.logo_history
      GROUP BY user_id
      ORDER BY last_created DESC
    `

    // Get total count
    const totalResult = await sql`SELECT COUNT(*) as total FROM public.logo_history`
    const total = totalResult[0]?.total || 0

    // Get last 10 logos (any user)
    const recentLogos = await sql`
      SELECT id, user_id, prompt, created_at, blob_url
      FROM public.logo_history
      ORDER BY created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      total,
      userCounts: userCounts.map(u => ({
        userId: u.user_id,
        count: parseInt(u.count),
        lastCreated: u.last_created
      })),
      recentLogos: recentLogos.map(l => ({
        id: l.id,
        userId: l.user_id,
        prompt: l.prompt?.substring(0, 50) + '...',
        createdAt: l.created_at,
        hasBlob: !!l.blob_url
      }))
    })
  } catch (error) {
    console.error('[Debug] Failed:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// POST /api/logo-history/debug - Merge all user IDs into one target user
export async function POST(request: NextRequest) {
  try {
    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId required' }, { status: 400 })
    }

    // Get all distinct user IDs
    const users = await sql`
      SELECT DISTINCT user_id FROM public.logo_history WHERE user_id != ${targetUserId}
    `

    const userIdsToMerge = users.map(u => u.user_id)

    if (userIdsToMerge.length === 0) {
      return NextResponse.json({ message: 'No other users to merge', merged: 0 })
    }

    // Update all logos to target user
    const result = await sql`
      UPDATE public.logo_history
      SET user_id = ${targetUserId}
      WHERE user_id != ${targetUserId}
      RETURNING id
    `

    console.log(`[Merge] Merged ${result.length} logos from ${userIdsToMerge.length} users into ${targetUserId}`)

    return NextResponse.json({
      success: true,
      merged: result.length,
      mergedFrom: userIdsToMerge,
      targetUserId
    })
  } catch (error) {
    console.error('[Merge] Failed:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
