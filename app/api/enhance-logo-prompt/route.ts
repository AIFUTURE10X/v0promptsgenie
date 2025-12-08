import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const ENHANCE_SYSTEM_PROMPT = `You are a logo design expert. Take the user's basic description and expand it into a detailed, professional prompt for AI logo generation.

Include in your enhanced prompt:
- Visual style (geometric, organic, minimalist, realistic, etc.)
- Composition and positioning (facing direction, angle, placement)
- Key design elements (shapes, lines, features)
- Style appropriate for logo use (clean, scalable, professional)
- Color hints if relevant (or mention "suitable for any color scheme")

Rules:
- Keep response under 100 words
- Only return the enhanced prompt text, no explanations or prefixes
- Make it specific and descriptive but still flexible for logo generation
- Focus on visual elements that work well as logos
- IMPORTANT: If the user mentions a brand name, company name, or specific text (like "Prompts Genie"), PRESERVE IT in the enhanced prompt - the logo should feature that text/name
- Describe how the brand name should be styled (typography, integration with imagery)

Example input: "a lion logo for TechCorp"
Example output: "A majestic lion head in profile view facing right with 'TechCorp' in bold geometric sans-serif typography below, angular style with clean lines forming the mane, minimalist silhouette, professional branding suitable for any color scheme"

Example input: "a genie for Prompts Genie"
Example output: "Elegant genie lamp with magical swirling smoke forming into creative sparks, 'Prompts Genie' text integrated in flowing script typography, whimsical yet professional style, clean scalable design with sense of magic and creativity"`

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    console.log("[Enhance Logo Prompt] Input:", prompt.substring(0, 50))

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const fullPrompt = `${ENHANCE_SYSTEM_PROMPT}

User's basic description: "${prompt}"

Enhanced prompt:`

    const result = await model.generateContent(fullPrompt)
    const responseText = result.response.text().trim()

    // Clean up the response - remove any quotes or prefixes
    let enhancedPrompt = responseText
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^Enhanced prompt:\s*/i, '') // Remove "Enhanced prompt:" prefix
      .trim()

    console.log("[Enhance Logo Prompt] Output length:", enhancedPrompt.length)

    return NextResponse.json({
      enhancedPrompt,
      originalPrompt: prompt,
    })
  } catch (error) {
    console.error("[Enhance Logo Prompt] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to enhance prompt",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
