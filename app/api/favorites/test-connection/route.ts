import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET() {
  try {
    console.log('[v0] Testing Neon connection...')
    
    // Test basic query
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`
    console.log('[v0] Connection successful:', result[0])
    
    // Test table access
    const tableTest = await sql`SELECT COUNT(*) as row_count FROM public.favorites`
    console.log('[v0] Favorites table accessible, rows:', tableTest[0].row_count)
    
    // Test insert capability
    const testInsert = await sql`
      INSERT INTO public.favorites (user_id, image_url)
      VALUES ('test-user', 'https://test.com/image.png')
      RETURNING id
    `
    console.log('[v0] Test insert successful, ID:', testInsert[0].id)
    
    // Clean up test
    await sql`DELETE FROM public.favorites WHERE user_id = 'test-user'`
    console.log('[v0] Test cleanup complete')
    
    return NextResponse.json({ 
      success: true,
      message: 'Neon connection working correctly',
      connection: result[0]
    })
  } catch (error: any) {
    console.error('[v0] Neon test failed:', error)
    return NextResponse.json({ 
      error: error.message,
      code: error.code,
      details: error
    }, { status: 500 })
  }
}
