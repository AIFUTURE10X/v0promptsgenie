import { type NextRequest, NextResponse } from "next/server"
import { generateImageWithRetry, type GenerationModel } from "@/lib/gemini-client"
import { removeBackground, type BackgroundRemovalMethod } from "@/lib/background-removal"
import { removeBackgroundCloud, removeBackgroundPixian } from "@/lib/cloud-bg-removal"
import { removeBackgroundWithReplicate } from "@/lib/replicate-bg-removal"
import { removeBackgroundWithPixelcut } from "@/lib/pixelcut-bg-removal"
import { upscaleWithRealESRGAN, isReplicateAvailable } from "@/lib/replicate-upscaler"
import sharp from 'sharp'

// Logo concept styles - the "what" of the logo (design philosophy)
type LogoConcept = 'minimalist' | 'modern' | 'vintage' | 'playful' | 'elegant' | 'bold'

// Rendering styles - the "how" of the logo (material/effect)
type RenderStyle = 'flat' | '3d' | '3d-metallic' | '3d-crystal' | '3d-gradient' | 'neon'

// Concept prompts - define the design philosophy
const CONCEPT_PROMPTS: Record<LogoConcept, string> = {
  minimalist: `MINIMALIST design philosophy:
    - Maximum simplicity: reduce to essential elements only
    - Strategic use of negative space
    - Limited color palette (1-2 colors)
    - Perfect geometric shapes with mathematical precision
    - No unnecessary details or embellishments
    - Inspired by: Apple, Nike, Airbnb logos`,

  modern: `MODERN CONTEMPORARY design philosophy:
    - Sleek, clean lines with perfect proportions
    - Bold confident typography (sans-serif)
    - Strategic use of color for brand recognition
    - Sophisticated and premium appearance
    - Balanced composition with visual harmony
    - Inspired by: Tesla, Uber, Netflix, Stripe logos`,

  vintage: `VINTAGE/RETRO design philosophy:
    - Timeless design that feels established and trustworthy
    - Classic typography with serifs or hand-lettered style
    - Warm, nostalgic feel
    - Badge, emblem, or crest-style composition
    - Inspired by: Harley-Davidson, Jack Daniel's logos`,

  playful: `PLAYFUL/FUN design philosophy:
    - Friendly, approachable character
    - Rounded shapes and soft edges
    - Vibrant, cheerful colors
    - Whimsical or cartoon-like elements
    - Appeals to younger audiences
    - Inspired by: Mailchimp, Slack, Discord logos`,

  elegant: `ELEGANT/LUXURY design philosophy:
    - Refined, sophisticated aesthetics
    - Thin lines and delicate details
    - Premium typography (often serif or custom)
    - Gold, black, white color schemes
    - High-end, exclusive feeling
    - Inspired by: Chanel, Rolex, Louis Vuitton logos`,

  bold: `BOLD/POWERFUL design philosophy:
    - Strong, impactful presence
    - Heavy weights and thick strokes
    - High contrast colors
    - Commanding and authoritative feel
    - Makes a strong statement
    - Inspired by: ESPN, Netflix, Adobe logos`
}

// Rendering style prompts - define the material/effect
const RENDER_PROMPTS: Record<RenderStyle, string> = {
  flat: `FLAT 2D rendering style:
    - Bold, solid colors with high contrast
    - Clean vector-style with crisp hard edges
    - Simple iconic shapes that are instantly recognizable
    - Works at any size from favicon to billboard
    - Professional corporate quality like Uber, Airbnb logos`,

  '3d': `PROFESSIONAL 3D rendering style:
    - Rich depth and dimensionality with realistic lighting
    - Soft shadows creating floating/elevated effect
    - Glossy finish with subtle specular highlights
    - Professional corporate quality like tech company logos
    - Modern and sophisticated appearance
    - Smooth gradients that transition beautifully
    - Render with studio lighting quality`,

  '3d-metallic': `PREMIUM 3D METALLIC rendering style:
    - Hyper-realistic brushed metal texture (silver, gold, chrome, bronze, or copper)
    - Brilliant reflective surfaces catching dramatic studio lighting
    - Sharp beveled edges with luxurious metallic sheen
    - Subtle environmental reflections showing depth
    - Professional luxury car emblem quality (Mercedes-Benz, BMW, Lamborghini)
    - Premium, expensive, high-end appearance
    - Deep shadows and bright highlights for contrast
    - The metal should look REAL and TOUCHABLE
    - IMPORTANT: Render with photorealistic 3D metal materials, dramatic lighting`,

  '3d-crystal': `PREMIUM 3D CRYSTALLINE/GLASS rendering style:
    - Transparent glass or crystal material with realistic refraction
    - Light bending through surfaces creating caustic effects
    - Faceted surfaces catching and dispersing light beautifully
    - Prismatic rainbow color effects from light dispersion
    - Sharp geometric crystalline forms with depth
    - Diamond-like brilliance, sparkle, and clarity
    - Luxury jewelry quality rendering (Swarovski, Tiffany)
    - Ice-like or gem-like translucent quality
    - IMPORTANT: Render with photorealistic glass/crystal materials, studio lighting`,

  '3d-gradient': `VIBRANT 3D GRADIENT rendering style:
    - Beautiful smooth color gradient transitions (cyan→blue, orange→red, pink→purple)
    - Soft volumetric 3D depth and dimension
    - Glossy finish with soft shadows creating floating effect
    - Contemporary tech startup aesthetic
    - Vibrant, eye-catching color combinations that pop
    - Soft diffused lighting with subtle highlights
    - App icon quality rendering (Instagram, Firefox, Figma style)
    - Colors should flow and blend seamlessly
    - IMPORTANT: Use beautiful vibrant gradient colors with rich 3D depth`,

  neon: `ELECTRIC NEON GLOW rendering style:
    - Brilliant glowing neon tube appearance with realistic gas glow
    - Dramatic light bloom and multiple halo/glow layers
    - Electric, vibrant color palette (hot pink, electric blue, purple, green, cyan)
    - Retro-futuristic cyberpunk aesthetic
    - Multiple glow layers creating depth and atmosphere
    - The glow should illuminate the surrounding area
    - 80s synthwave / cyberpunk / Las Vegas sign inspiration
    - Inspired by: Tron, Blade Runner, Vegas neon signs
    - IMPORTANT: Render with dramatic glowing neon effect on dark background`
}

// Simplified professional logo design principles - focused essentials only
const UNIVERSAL_LOGO_PRINCIPLES = `
LOGO DESIGN ESSENTIALS:
1. SIMPLICITY: Reduce to essential elements - iconic logos are never complex
2. SCALABILITY: Must look perfect from 16px favicon to billboard size
3. MEMORABILITY: Create a unique, instantly recognizable mark
4. GOLDEN RATIO: Use 1.618 proportions for natural visual harmony
5. LIMIT COLORS: Maximum 2-3 colors for elegance and versatility`

// Background requirements - adapts based on render style
function getBackgroundRequirements(renderStyle: RenderStyle): string {
  // For neon style, use dark background
  if (renderStyle === 'neon') {
    return `
CRITICAL - BACKGROUND FOR NEON EFFECT:
- Place logo on PURE SOLID BLACK (#000000) background
- The dark background is essential for the neon glow effect
- NO gradients, patterns, textures in background
- Center the logo with equal padding on all sides
- Allow the neon glow to bloom naturally against the dark`
  }

  // For all other styles, use white background for easy extraction
  return `
CRITICAL - BACKGROUND FOR TRANSPARENT PNG EXPORT:
- Place logo on PURE SOLID WHITE (#FFFFFF) background ONLY
- NO gradients, patterns, textures anywhere in background
- NO shadows falling outside the logo bounds
- NO glow effects or halos around the logo
- NO decorative elements, mockups, or context
- Center the logo with equal padding on all sides
- The logo must have clean, well-defined edges for extraction`
}

// Parse combined style format: "concept+render" (e.g., "modern+3d-metallic")
function parseStyle(style: string): { concept: LogoConcept; render: RenderStyle } {
  if (style.includes('+')) {
    const [conceptPart, renderPart] = style.split('+')
    return {
      concept: (conceptPart as LogoConcept) || 'modern',
      render: (renderPart as RenderStyle) || '3d-metallic'
    }
  }
  // Legacy single style - map to new system
  const legacyMap: Record<string, { concept: LogoConcept; render: RenderStyle }> = {
    'minimalist': { concept: 'minimalist', render: 'flat' },
    'flat': { concept: 'modern', render: 'flat' },
    'modern': { concept: 'modern', render: 'flat' },
    'vintage': { concept: 'vintage', render: 'flat' },
    '3d': { concept: 'modern', render: '3d' },
    '3d-metallic': { concept: 'modern', render: '3d-metallic' },
    '3d-crystal': { concept: 'modern', render: '3d-crystal' },
    '3d-gradient': { concept: 'modern', render: '3d-gradient' },
    'neon': { concept: 'modern', render: 'neon' },
  }
  return legacyMap[style] || { concept: 'modern', render: '3d-metallic' }
}

// Simplified prompt for free-form generation (no background constraints)
function buildFreeFormLogoPrompt(userPrompt: string, style: string): string {
  const { concept, render } = parseStyle(style)
  const conceptDescription = CONCEPT_PROMPTS[concept] || CONCEPT_PROMPTS.modern
  const renderDescription = RENDER_PROMPTS[render] || RENDER_PROMPTS['3d-metallic']

  // Determine best background for the style
  const bgInstruction = render === 'neon'
    ? 'Place on a dark charcoal or black background to make the glow pop'
    : 'Place on a subtle dark gradient background (dark blue-gray to black) for premium presentation'

  // For free-form, we create stunning logos like professional design agencies
  return `Create a STUNNING, world-class professional logo design that looks like it was made by a top design agency:

BRAND/CONCEPT: ${userPrompt}

DESIGN PHILOSOPHY:
${conceptDescription}

RENDERING STYLE:
${renderDescription}

PROFESSIONAL LOGO REQUIREMENTS:
1. ICONIC SYMBOL + TEXT: Create a distinctive icon/symbol AND include the brand name in stylish typography
2. PERFECT COMPOSITION: Icon and text should be balanced and work together harmoniously
3. COLOR HARMONY: Use 2-3 complementary colors that create visual impact (gradients are encouraged for 3D styles)
4. DEPTH & DIMENSION: Add realistic shadows, highlights, and depth that make the logo pop
5. TYPOGRAPHY: Use modern, professional font styling that matches the brand personality
6. PREMIUM QUALITY: This should look like a $10,000 professional logo design

VISUAL STYLE INSPIRATION:
- Like logos you'd see for successful tech startups, real estate companies, or premium brands
- Rich 3D effects with realistic lighting and shadows
- Clean, memorable iconography that tells a story
- Professional typography integrated with the icon

BACKGROUND:
${bgInstruction}

Generate a single, breathtaking, production-ready logo that would win design awards. The logo should be BEAUTIFUL, PROFESSIONAL, and MEMORABLE.`
}

// Original prompt with background constraints (fallback for local BG removal)
function buildLogoPrompt(userPrompt: string, style: string): string {
  const { concept, render } = parseStyle(style)
  const conceptDescription = CONCEPT_PROMPTS[concept] || CONCEPT_PROMPTS.modern
  const renderDescription = RENDER_PROMPTS[render] || RENDER_PROMPTS['3d-metallic']
  const backgroundReqs = getBackgroundRequirements(render)

  // Detect if user is asking for specific logo types
  const lowerPrompt = userPrompt.toLowerCase()
  let logoTypeGuidance = ''

  if (lowerPrompt.includes('mascot') || lowerPrompt.includes('character')) {
    logoTypeGuidance = `
MASCOT/CHARACTER LOGO GUIDANCE:
- Create a friendly, memorable character with personality
- Simplify the character for logo use (not overly detailed)
- Ensure the character works as a standalone icon
- Make expressions clear and appealing`
  } else if (lowerPrompt.includes('wordmark') || lowerPrompt.includes('text') || lowerPrompt.includes('name')) {
    logoTypeGuidance = `
WORDMARK/TYPOGRAPHY LOGO GUIDANCE:
- Focus on custom lettering or distinctive typography
- Create unique letterforms that become the brand mark
- Ensure excellent readability at all sizes
- Consider custom ligatures or letter connections`
  } else if (lowerPrompt.includes('emblem') || lowerPrompt.includes('badge') || lowerPrompt.includes('crest')) {
    logoTypeGuidance = `
EMBLEM/BADGE LOGO GUIDANCE:
- Create a contained, unified badge or crest design
- Include text integrated within the emblem shape
- Add subtle decorative elements that enhance authority
- Design with a timeless, established feeling`
  } else if (lowerPrompt.includes('icon') || lowerPrompt.includes('symbol') || lowerPrompt.includes('mark')) {
    logoTypeGuidance = `
ICON/SYMBOL LOGO GUIDANCE:
- Create a pure symbolic mark without text
- Maximum simplicity - must be recognizable at tiny sizes
- Use meaningful symbolism related to the brand
- Design an iconic shape that becomes synonymous with the brand`
  }

  return `Create a STUNNING, world-class professional logo design that looks like it was made by a top design agency:

BRAND/CONCEPT: ${userPrompt}

DESIGN PHILOSOPHY:
${conceptDescription}

RENDERING STYLE:
${renderDescription}

${logoTypeGuidance}

PROFESSIONAL LOGO REQUIREMENTS:
1. ICONIC DESIGN: Create a distinctive, memorable visual that tells the brand story
2. PERFECT COMPOSITION: Balanced proportions using golden ratio principles
3. COLOR HARMONY: Use 2-3 complementary colors that create visual impact
4. DEPTH & DIMENSION: Add realistic shadows, highlights, and depth
5. TYPOGRAPHY: Include stylish, professional text if brand name is provided
6. PREMIUM QUALITY: This should look like a $10,000 professional logo

${UNIVERSAL_LOGO_PRINCIPLES}

${backgroundReqs}

Generate a single, breathtaking, production-ready logo that would win design awards. Make it BEAUTIFUL, PROFESSIONAL, and MEMORABLE.`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const negativePrompt = formData.get('negativePrompt') as string | null
    const style = (formData.get('style') as string) || 'modern+3d-metallic'
    const modelParam = formData.get('model') as string | null
    const referenceImageFile = formData.get('referenceImage') as File | null
    const bgRemovalMethod = (formData.get('bgRemovalMethod') as BackgroundRemovalMethod) || 'auto'
    const cloudApiKey = formData.get('cloudApiKey') as string | null
    const resolutionParam = formData.get('resolution') as string | null
    const seedParam = formData.get('seed') as string | null
    const seed = seedParam ? parseInt(seedParam, 10) : undefined
    // Skip background removal by default - user can remove it afterward
    const skipBgRemoval = formData.get('skipBgRemoval') !== 'false'

    // Validate and use resolution (default to 1K)
    const validResolutions = ['1K', '2K', '4K'] as const
    type ImageSize = typeof validResolutions[number]
    const resolution: ImageSize = validResolutions.includes(resolutionParam as ImageSize)
      ? (resolutionParam as ImageSize)
      : '1K'

    // Convert reference image to base64 if present
    let referenceImage: string | undefined
    if (referenceImageFile && referenceImageFile.size > 0) {
      const arrayBuffer = await referenceImageFile.arrayBuffer()
      referenceImage = Buffer.from(arrayBuffer).toString('base64')
    }

    console.log("[Logo API] Generate request:", {
      prompt: prompt?.substring(0, 100),
      negativePrompt: negativePrompt?.substring(0, 50),
      style,
      bgRemovalMethod,
      skipBgRemoval,
      resolution,
      seed: seed !== undefined ? seed : 'random',
      hasReference: !!referenceImage,
    })

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Use free-form generation (no background constraints) when:
    // 1. Skipping BG removal (user will remove it later if needed)
    // 2. Using AI-based removal that can handle any background
    const useCloudRemoval = bgRemovalMethod === 'pixelcut' || bgRemovalMethod === 'replicate' || ((bgRemovalMethod === 'pixian' || bgRemovalMethod === 'cloud') && cloudApiKey)
    const useFreeFormPrompt = skipBgRemoval || useCloudRemoval
    let enhancedPrompt = useFreeFormPrompt
      ? buildFreeFormLogoPrompt(prompt, style)
      : buildLogoPrompt(prompt, style)

    // Append negative prompt if provided
    if (negativePrompt?.trim()) {
      enhancedPrompt += `\n\nAVOID these elements in the design:\n${negativePrompt.trim()}`
    }

    console.log("[Logo API] Using free-form generation:", useCloudRemoval)
    console.log("[Logo API] Has negative prompt:", !!negativePrompt?.trim())
    console.log("[Logo API] Enhanced prompt:", enhancedPrompt.substring(0, 200) + "...")

    // Determine model - default to pro for quality, but allow override to flash for speed
    const model: GenerationModel = modelParam === 'gemini-2.5-flash-image'
      ? 'gemini-2.5-flash-image'
      : 'gemini-3-pro-image-preview'

    // Generate the logo image with Gemini
    // Gemini 3 Pro Image natively supports 1K, 2K, and 4K resolutions via image_size config
    // disableSearch: true prevents Google Search from injecting existing brand references
    // This ensures original, creative logo designs without web influence
    const result = await generateImageWithRetry({
      prompt: enhancedPrompt,
      aspectRatio: "1:1", // Logos are typically square
      model,
      imageSize: resolution, // Gemini 3 Pro natively supports 1K, 2K, 4K
      referenceImage,
      seed, // Pass seed for reproducible generation
      disableSearch: true, // Critical for original creative logo generation
    })

    if (!result.success || !result.imageBase64) {
      console.error("[Logo API] Generation failed:", result.error)
      return NextResponse.json(
        { error: result.error || "Failed to generate logo" },
        { status: 500 }
      )
    }

    // Conditionally remove background (skipped by default)
    let processedBase64: string = result.imageBase64

    if (!skipBgRemoval) {
      console.log(`[Logo API] Removing background with method: ${bgRemovalMethod}...`)

      // Remove background based on selected method
      if (bgRemovalMethod === 'pixelcut') {
        // Use Pixelcut API - optimized for logos with text preservation
        processedBase64 = await removeBackgroundWithPixelcut(result.imageBase64)
      } else if (bgRemovalMethod === 'replicate') {
        // Use Replicate AI - works on any background color
        processedBase64 = await removeBackgroundWithReplicate(result.imageBase64)
      } else if (bgRemovalMethod === 'pixian' && cloudApiKey) {
        // Use Pixian.ai API
        processedBase64 = await removeBackgroundPixian(result.imageBase64, cloudApiKey)
      } else if (bgRemovalMethod === 'cloud' && cloudApiKey) {
        // Use remove.bg cloud API
        processedBase64 = await removeBackgroundCloud(result.imageBase64, {
          apiKey: cloudApiKey
        })
      } else {
        // Use local methods (auto, simple, chromakey)
        processedBase64 = await removeBackground(result.imageBase64, {
          method: bgRemovalMethod,
          tolerance: 12, // Lower tolerance preserves design elements, only removes pure white background
          edgeSmoothing: true,
        })
      }

      console.log("[Logo API] Background removed successfully")
    } else {
      console.log("[Logo API] Skipping background removal (will be done later if needed)")
    }

    // Note: Gemini 3 Pro now generates at native resolution (1K/2K/4K)
    // This upscaling code is kept as a fallback in case the native generation doesn't produce expected size
    let finalBase64 = processedBase64
    if (resolution !== '1K') {
      // Check if we actually got a higher resolution image from Gemini
      // If so, skip upscaling. Otherwise, upscale as fallback.
      const checkBuffer = Buffer.from(processedBase64, 'base64')
      const checkMetadata = await sharp(checkBuffer).metadata()
      const currentSize = Math.max(checkMetadata.width || 0, checkMetadata.height || 0)
      const targetSize = resolution === '4K' ? 4096 : 2048

      console.log(`[Logo API] Current image size: ${checkMetadata.width}x${checkMetadata.height}`)
      console.log(`[Logo API] Target size for ${resolution}: ${targetSize}`)

      // Only upscale if the image is significantly smaller than target (less than 90%)
      if (currentSize < targetSize * 0.9) {
        console.log(`[Logo API] Image smaller than target, upscaling as fallback...`)
        console.log(`[Logo API] Replicate available: ${isReplicateAvailable()}`)

        try {
          const aiScale = resolution === '4K' ? 4 : 2

          // Try AI upscaling if available
          if (isReplicateAvailable()) {
            console.log(`[Logo API] Using AI upscaling (Real-ESRGAN ${aiScale}x)...`)
            finalBase64 = await upscaleWithRealESRGAN(processedBase64, aiScale as 2 | 4)
            console.log("[Logo API] AI upscale complete")
          } else {
            // Fallback to Sharp upscaling with enhanced sharpening
            console.log("[Logo API] Using Sharp upscaling (Replicate not available)...")
            const originalWidth = checkMetadata.width || 1024
            const originalHeight = checkMetadata.height || 1024
            const maxOriginalDim = Math.max(originalWidth, originalHeight)
            const scale = targetSize / maxOriginalDim
            const newWidth = Math.round(originalWidth * scale)
            const newHeight = Math.round(originalHeight * scale)

            // Use lanczos3 with sharpening to improve quality
            const upscaledBuffer = await sharp(checkBuffer)
              .resize(newWidth, newHeight, {
                kernel: 'lanczos3',
                fit: 'fill',
              })
              .sharpen({ sigma: 1.0 }) // Add sharpening to improve clarity
              .png({ quality: 100 })
              .toBuffer()

            finalBase64 = upscaledBuffer.toString('base64')
            console.log(`[Logo API] Sharp upscale complete: ${newWidth}x${newHeight}`)
          }
        } catch (upscaleError) {
          console.error("[Logo API] Upscale failed, using original:", upscaleError)
          // Continue with original image if upscaling fails
        }
      } else {
        console.log(`[Logo API] Gemini generated at native ${resolution} resolution, no upscaling needed`)
      }
    }

    // Return as data URL
    const dataUrl = `data:image/png;base64,${finalBase64}`

    return NextResponse.json({
      success: true,
      image: dataUrl,
      style,
      bgRemovalMethod,
      resolution,
      seed: result.seed, // Return seed for reproducibility
    })
  } catch (error) {
    console.error("[Logo API] Route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate logo" },
      { status: 500 }
    )
  }
}
