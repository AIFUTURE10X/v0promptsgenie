import { neon } from '@neondatabase/serverless'
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

const sql = neon(process.env.NEON_DATABASE_URL!)

// GET /api/favorites?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('[v0] API: Loading favorites for user:', userId)

    const result = await sql`
      SELECT * FROM public.favorites
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    console.log('[v0] API: Loaded from Neon:', result.length)

    const favorites = result.map(fav => ({
      id: fav.id.toString(),
      url: fav.blob_url || fav.image_url,
      blobUrl: fav.blob_url,
      timestamp: new Date(fav.created_at).getTime(),
      metadata: {
        ratio: fav.aspect_ratio,
        style: fav.style_preset,
        dimensions: fav.dimensions,
        fileSize: fav.file_size,
        params: fav.parameters
      }
    }))

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('[v0] API: Load failed:', error)
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 })
  }
}

// POST /api/favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, imageUrl, metadata } = body

    console.log('[v0] API: POST request received')
    console.log('[v0] API: userId:', userId)
    console.log('[v0] API: imageUrl:', imageUrl)
    console.log('[v0] API: metadata:', JSON.stringify(metadata))

    if (!userId || !imageUrl) {
      return NextResponse.json({ error: 'User ID and image URL required' }, { status: 400 })
    }

    console.log('[v0] API: Adding favorite:', { userId, imageUrl })

    // Upload to Blob Storage first
    const tempId = `temp-${Date.now()}`
    let blobUrl: string

    try {
      console.log('[v0] API: Fetching image from URL...')
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      console.log('[v0] API: Image fetched, size:', blob.size, 'bytes')
      
      const fileName = `favorites/${tempId}.png`
      console.log('[v0] API: Uploading to Blob as:', fileName)
      const uploadResult = await put(fileName, blob, {
        access: 'public',
        contentType: 'image/png'
      })
      
      blobUrl = uploadResult.url
      console.log('[v0] API: Image uploaded to Blob:', blobUrl)
    } catch (error) {
      console.error('[v0] API: Blob upload failed:', error)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // Save to Neon
    console.log('[v0] API: Inserting into Neon database...')
    
    const result = await sql`
      INSERT INTO public.favorites (
        user_id, image_url, blob_url, prompt, aspect_ratio, 
        style_preset, dimensions, file_size, parameters
      )
      VALUES (
        ${userId}, ${blobUrl}, ${blobUrl}, ${metadata?.params?.mainPrompt || null},
        ${metadata?.ratio || null}, ${metadata?.style || null}, ${metadata?.dimensions || null},
        ${metadata?.fileSize || null}, ${JSON.stringify(metadata?.params || null)}
      )
      ON CONFLICT (user_id, image_url) DO NOTHING
      RETURNING *
    `

    console.log('[v0] API: Insert result rows:', result.length)

    if (result.length === 0) {
      console.log('[v0] API: Favorite already exists, fetching existing')
      const existing = await sql`
        SELECT * FROM public.favorites 
        WHERE user_id = ${userId} AND image_url = ${blobUrl}
      `
      
      if (existing[0]) {
        const favorite = {
          id: existing[0].id.toString(),
          url: existing[0].blob_url || existing[0].image_url,
          blobUrl: existing[0].blob_url,
          timestamp: new Date(existing[0].created_at).getTime(),
          metadata
        }
        console.log('[v0] API: Returning existing favorite:', favorite.id)
        return NextResponse.json({ favorite })
      }
    }

    console.log('[v0] API: Saved to Neon with ID:', result[0].id)
    
    const favorite = {
      id: result[0].id.toString(),
      url: blobUrl,
      blobUrl: blobUrl,
      timestamp: new Date(result[0].created_at).getTime(),
      metadata
    }

    console.log('[v0] API: Returning new favorite:', favorite.id)
    return NextResponse.json({ favorite })
  } catch (error) {
    console.error('[v0] API: Save failed with error:', error)
    console.error('[v0] API: Error message:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ 
      error: 'Failed to save favorite', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE /api/favorites?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    console.log('[v0] API: Removing favorite:', id)

    await sql`
      DELETE FROM public.favorites WHERE id = ${parseInt(id)}
    `

    console.log('[v0] API: Removed from Neon')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] API: Delete failed:', error)
    return NextResponse.json({ error: 'Failed to delete favorite' }, { status: 500 })
  }
}
