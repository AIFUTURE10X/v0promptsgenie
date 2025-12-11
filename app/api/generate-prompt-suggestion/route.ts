import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { buildLogoSystemPrompt } from "@/app/image-studio/constants/ai-logo-knowledge"

// Initialize Gemini with API key check
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error("[v0 API] GEMINI_API_KEY is not set in environment variables")
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function POST(request: Request) {
  try {
    const {
      message,
      currentPrompt,
      currentNegativePrompt,
      currentStyle,
      currentCameraAngle,
      currentCameraLens,
      currentAspectRatio,
      styleStrength,
      promptMode,
      conversationHistory,
      mode, // NEW: 'image' | 'logo'
      logoAnalysis, // NEW: analysis from reference logo image
    } = await request.json()

    console.log("[v0 API] Generate Prompt Suggestion called:", {
      messageLength: message?.length,
      hasImageAnalysis: message?.includes("REFERENCE IMAGES ANALYSIS"),
      currentPromptLength: currentPrompt?.length,
      mode: mode || 'image',
    })

    // Check if Gemini is available
    if (!genAI) {
      console.error("[v0 API] Gemini API not initialized - missing GEMINI_API_KEY")
      return NextResponse.json(
        { error: "AI service not configured", details: "GEMINI_API_KEY environment variable is not set" },
        { status: 500 }
      )
    }

    // Handle logo mode separately
    if (mode === 'logo') {
      return handleLogoMode(message, conversationHistory, logoAnalysis)
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Build conversation context
    const contextMessages = conversationHistory
      ?.slice(-5) // Last 5 messages for context
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    const hasImageAnalysis = message?.includes("REFERENCE IMAGES ANALYSIS")

    const systemPrompt = `You are an expert AI image prompt assistant. Help users create detailed, effective prompts for AI image generation.

Current Settings:
- Prompt: ${currentPrompt || "None"}
- Negative Prompt: ${currentNegativePrompt || "None"}
- Style: ${currentStyle || "None"}
- Camera Angle: ${currentCameraAngle || "None"}
- Camera Lens: ${currentCameraLens || "None"}
- Aspect Ratio: ${currentAspectRatio || "None"}
- Style Strength: ${styleStrength || "None"}
- Prompt Mode: ${promptMode || "None"}

Recent Conversation:
${contextMessages || "None"}

User Request: ${message}

${
  hasImageAnalysis
    ? `
IMPORTANT: The user has provided image analysis data above. You MUST:
1. Extract ALL specific visual details from the "REFERENCE IMAGES ANALYSIS" section
2. Create a detailed prompt that EXACTLY replicates the character/subject described
3. Include ALL unique features: facial features, clothing, accessories, pose, expression
4. Be extremely specific and detailed - this is for recreating an existing character
5. Do NOT give generic advice - use the specific details from the analysis

Your response should acknowledge the image analysis and provide a detailed prompt based on it.
`
    : ""
}

Based on the user's request${hasImageAnalysis ? " and the provided image analysis" : ""} and current settings, provide:
1. A conversational response explaining your suggestions${hasImageAnalysis ? " (acknowledge you've analyzed their reference image)" : ""}
2. An improved main prompt (detailed, descriptive${hasImageAnalysis ? ", using specifics from the image analysis" : ""})
3. An improved negative prompt
4. Recommended style preset (MUST be one of the available styles listed below)
5. Recommended camera angle (use "None" if not applicable)
6. Recommended camera lens (use "None" if not applicable)
7. Recommended aspect ratio
8. Style strength (subtle, moderate, or strong - how much to apply the style)

Format your response as JSON:
{
  "message": "Your conversational response here",
  "suggestions": {
    "prompt": "improved prompt",
    "negativePrompt": "improved negative prompt",
    "style": "style_preset_value",
    "cameraAngle": "camera_angle_value or None",
    "cameraLens": "camera_lens_value or None",
    "aspectRatio": "aspect_ratio_value",
    "styleStrength": "moderate"
  }
}

Available styles (MUST use exact values): Realistic, Cartoon Style, Pixar, PhotoReal, Anime, Oil Painting, Watercolor, 3D Render, Sketch, Comic Book, Studio Ghibli, Makoto Shinkai, Disney Modern 3D, Sony Spider-Verse, Laika Stop-Motion, Cartoon Saloon, Studio Trigger, Ufotable, Kyoto Animation
Available camera angles: eye-level, high-angle, low-angle, birds-eye, overhead, dutch-angle, worms-eye, over-the-shoulder, point-of-view, None
Available camera lenses: standard, wide-angle, telephoto, fisheye, macro, portrait, tilt-shift, None
Available aspect ratios: 1:1, 16:9, 9:16, 4:3, 3:4, 21:9
Available style strengths: subtle, moderate, strong`

    console.log("[v0 API] Calling Gemini API with prompt length:", systemPrompt.length)

    const result = await model.generateContent(systemPrompt)
    const responseText = result.response.text()

    console.log("[v0 API] Gemini response received, length:", responseText.length)

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonResponse = JSON.parse(jsonMatch[0])
      console.log("[v0 API] Successfully parsed JSON response")
      return NextResponse.json(jsonResponse)
    }

    console.warn("[v0 API] Failed to parse JSON, using fallback response")
    return NextResponse.json({
      message: responseText,
      suggestions: {
        prompt: currentPrompt || "",
        negativePrompt: currentNegativePrompt || "",
        style: currentStyle || "Realistic",
        cameraAngle: currentCameraAngle || "None",
        cameraLens: currentCameraLens || "None",
        aspectRatio: currentAspectRatio || "1:1",
        styleStrength: styleStrength || "moderate",
      },
    })
  } catch (error: any) {
    console.error("[v0 API] Error generating prompt suggestion:", error)

    // Check for specific Gemini API errors
    const errorMessage = error?.message || String(error)
    const isRateLimit = errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate")
    const isAuthError = errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("API key")

    if (isRateLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded", details: "Please wait a moment and try again" },
        { status: 429 }
      )
    }

    if (isAuthError) {
      return NextResponse.json(
        { error: "API authentication failed", details: "Check your GEMINI_API_KEY configuration" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to generate suggestion", details: errorMessage },
      { status: 500 },
    )
  }
}

/**
 * Handle logo mode requests - suggests DotMatrixConfig settings
 */
async function handleLogoMode(
  message: string,
  conversationHistory: any[],
  logoAnalysis?: string
) {
  try {
    // Check if Gemini is available
    if (!genAI) {
      console.error("[v0 API] Logo mode - Gemini API not initialized")
      return NextResponse.json(
        { error: "AI service not configured", details: "GEMINI_API_KEY environment variable is not set" },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Build conversation context
    const contextMessages = conversationHistory
      ?.slice(-5)
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    // Get the dynamic system prompt from ai-logo-knowledge.ts
    const logoSystemPrompt = buildLogoSystemPrompt()

    const fullPrompt = `${logoSystemPrompt}

${logoAnalysis ? `
=== REFERENCE LOGO ANALYSIS ===
The user has uploaded a reference logo. Here is the analysis:
${logoAnalysis}

IMPORTANT: Use this analysis to suggest settings that will recreate a similar look.
Match the colors, materials, effects, and style as closely as possible.
` : ''}

${contextMessages ? `
Recent Conversation:
${contextMessages}
` : ''}

User Request: ${message}

Based on the user's request${logoAnalysis ? ' and the reference logo analysis' : ''}, suggest appropriate Dot Matrix 3D logo settings.
Remember to respond with a JSON object containing "message" and "logoConfig" as specified above.`

    console.log("[v0 API] Logo mode - calling Gemini with dynamic system prompt")

    const result = await model.generateContent(fullPrompt)
    const responseText = result.response.text()

    console.log("[v0 API] Logo mode - Gemini response received, length:", responseText.length)

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const jsonResponse = JSON.parse(jsonMatch[0])
        console.log("[v0 API] Logo mode - Successfully parsed JSON response with config keys:",
          jsonResponse.logoConfig ? Object.keys(jsonResponse.logoConfig) : 'none')
        return NextResponse.json({
          message: jsonResponse.message || "Here are my logo design suggestions.",
          logoConfig: jsonResponse.logoConfig || {},
          mode: 'logo'
        })
      } catch (parseError) {
        console.error("[v0 API] Logo mode - JSON parse error:", parseError)
      }
    }

    // Fallback response
    console.warn("[v0 API] Logo mode - Failed to parse JSON, using fallback")
    return NextResponse.json({
      message: responseText,
      logoConfig: {},
      mode: 'logo'
    })
  } catch (error: any) {
    console.error("[v0 API] Logo mode error:", error)

    // Check for specific Gemini API errors
    const errorMessage = error?.message || String(error)
    const isRateLimit = errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate")
    const isAuthError = errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("API key")

    if (isRateLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded", details: "Please wait a moment and try again" },
        { status: 429 }
      )
    }

    if (isAuthError) {
      return NextResponse.json(
        { error: "API authentication failed", details: "Check your GEMINI_API_KEY configuration" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Failed to generate logo suggestions", details: errorMessage },
      { status: 500 },
    )
  }
}
