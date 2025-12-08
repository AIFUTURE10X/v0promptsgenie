/**
 * AI Logo Knowledge - Single Source of Truth for AI Helper Logo Suggestions
 *
 * IMPORTANT: When adding new settings to DotMatrixConfigurator, UPDATE THIS FILE
 * so the AI Helper can suggest these options!
 *
 * This file is imported by:
 * - /api/generate-prompt-suggestion/route.ts (for logo mode system prompt)
 * - /api/analyze-image/route.ts (for logo analysis prompt)
 */

import {
  DotMatrixConfig,
  DOT_SIZE_OPTIONS,
  DOT_SPACING_OPTIONS,
  DOT_SHAPE_OPTIONS,
  PATTERN_STYLE_OPTIONS,
  PATTERN_COVERAGE_OPTIONS,
  DOT_COLOR_PRESETS,
  TEXT_COLOR_PRESETS,
  METALLIC_FINISH_OPTIONS,
  BACKGROUND_OPTIONS,
  FONT_STYLE_OPTIONS,
  TEXT_WEIGHT_OPTIONS,
  LETTER_SPACING_OPTIONS,
  TEXT_CASE_OPTIONS,
  SWOOSH_STYLE_OPTIONS,
  SWOOSH_POSITION_OPTIONS,
  SPARKLE_OPTIONS,
  SHADOW_STYLE_OPTIONS,
  DEPTH_LEVEL_OPTIONS,
  LIGHTING_OPTIONS,
  BEVEL_OPTIONS,
  PERSPECTIVE_OPTIONS,
  ICON_STYLE_OPTIONS,
  INDUSTRY_PRESETS,
} from './dot-matrix-config'

// Material types from MaterialSelector component
export const MATERIAL_TYPES = [
  { id: 'none', label: 'None', description: 'No special material' },
  { id: 'glass', label: 'Glass', description: 'Transparent, reflective glass' },
  { id: 'crystal', label: 'Crystal', description: 'Faceted crystal with light refraction' },
  { id: 'plastic', label: 'Plastic', description: 'Smooth, glossy plastic' },
  { id: 'matte-plastic', label: 'Matte Plastic', description: 'Non-reflective plastic' },
  { id: 'ceramic', label: 'Ceramic', description: 'Smooth ceramic finish' },
  { id: 'wood', label: 'Wood', description: 'Natural wood texture' },
  { id: 'stone', label: 'Stone', description: 'Marble or granite texture' },
  { id: 'fabric', label: 'Fabric', description: 'Textile/cloth appearance' },
  { id: 'neon', label: 'Neon', description: 'Glowing neon tube effect' },
  { id: 'holographic', label: 'Holographic', description: 'Rainbow iridescent finish' },
  { id: 'carbon-fiber', label: 'Carbon Fiber', description: 'Woven carbon fiber pattern' },
]

// Text outline effects from TextEffectsPanel
export const TEXT_OUTLINE_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'thin', label: 'Thin Outline', description: '1px outline' },
  { id: 'medium', label: 'Medium Outline', description: '2px outline' },
  { id: 'thick', label: 'Thick Outline', description: '3-4px outline' },
  { id: 'double', label: 'Double Outline', description: 'Two concentric outlines' },
]

// Glow effects from TextEffectsPanel
export const GLOW_EFFECT_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'soft', label: 'Soft Glow', description: 'Subtle ambient glow' },
  { id: 'neon', label: 'Neon Glow', description: 'Bright neon sign effect' },
  { id: 'electric', label: 'Electric', description: 'Intense electric glow' },
  { id: 'aurora', label: 'Aurora', description: 'Multi-color aurora effect' },
]

// Text texture options from TextEffectsPanel
export const TEXT_TEXTURE_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'brushed', label: 'Brushed Metal', description: 'Brushed metallic texture' },
  { id: 'hammered', label: 'Hammered', description: 'Hammered metal look' },
  { id: 'scratched', label: 'Scratched', description: 'Worn scratched surface' },
  { id: 'polished', label: 'Polished', description: 'Mirror-like polished finish' },
]

// Letter effects from TextEffectsPanel
export const LETTER_EFFECT_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'stagger', label: 'Staggered', description: 'Letters at different heights' },
  { id: 'wave', label: 'Wave', description: 'Wavy letter arrangement' },
  { id: 'arc', label: 'Arc', description: 'Letters along an arc' },
  { id: 'perspective', label: 'Perspective', description: '3D perspective distortion' },
]

// Extended icon styles from IconSelector
export const EXTENDED_ICON_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'globe-3d', label: '3D Globe', description: 'Detailed 3D earth globe' },
  { id: 'globe-wireframe', label: 'Wireframe Globe', description: 'Globe with grid lines' },
  { id: 'globe-connected', label: 'Connected Globe', description: 'Globe with network nodes' },
  { id: 'arrow-dynamic', label: 'Dynamic Arrow', description: 'Swooping motion arrow' },
  { id: 'arrow-circular', label: 'Circular Arrow', description: 'Recycling/cycle arrow' },
  { id: 'star-burst', label: 'Starburst', description: 'Radiant star effect' },
  { id: 'star-ring', label: 'Star Ring', description: 'Stars in a ring' },
  { id: 'abstract-flow', label: 'Abstract Flow', description: 'Flowing abstract shape' },
  { id: 'abstract-geometric', label: 'Abstract Geometric', description: 'Geometric abstract form' },
  { id: 'tech-circuit', label: 'Circuit Pattern', description: 'Tech/circuit board lines' },
  { id: 'tech-hexagon', label: 'Hexagon Grid', description: 'Hexagonal tech pattern' },
]

export const ICON_POSITION_OPTIONS = [
  { id: 'left', label: 'Left of Text' },
  { id: 'right', label: 'Right of Text' },
  { id: 'above', label: 'Above Text' },
  { id: 'below', label: 'Below Text' },
  { id: 'behind', label: 'Behind Text' },
  { id: 'integrated', label: 'Integrated with Text' },
]

// Fancy font categories
export const FANCY_FONT_CATEGORIES = [
  { id: 'display', label: 'Display', description: 'Bold, attention-grabbing fonts' },
  { id: 'script', label: 'Script', description: 'Handwritten, elegant fonts' },
  { id: 'serif', label: 'Serif', description: 'Classic, traditional fonts' },
  { id: 'sans-serif', label: 'Sans-Serif', description: 'Clean, modern fonts' },
  { id: 'decorative', label: 'Decorative', description: 'Unique, artistic fonts' },
  { id: 'tech', label: 'Tech/Digital', description: 'Futuristic, digital fonts' },
]

/**
 * Build the system prompt for AI logo suggestions
 * This dynamically includes all available options from the config
 */
export function buildLogoSystemPrompt(): string {
  return `You are an expert logo designer assistant specialized in creating Dot Matrix 3D logos.
You help users design logos by suggesting specific configuration settings.

AVAILABLE CONFIGURATION OPTIONS:

=== DOT PATTERN SETTINGS ===
Dot Sizes: ${DOT_SIZE_OPTIONS.map(o => `"${o.value}" (${o.description})`).join(', ')}
Dot Spacing: ${DOT_SPACING_OPTIONS.map(o => `"${o.value}" (${o.description})`).join(', ')}
Dot Shapes: ${DOT_SHAPE_OPTIONS.map(o => `"${o.value}"`).join(', ')}
Pattern Styles: ${PATTERN_STYLE_OPTIONS.map(o => `"${o.value}" (${o.description})`).join(', ')}
Pattern Coverage: ${PATTERN_COVERAGE_OPTIONS.map(o => `"${o.value}"`).join(', ')}

=== COLOR OPTIONS ===
Dot Colors: ${DOT_COLOR_PRESETS.map(c => `"${c.value}" (${c.hex})`).join(', ')}
Metallic Finishes: ${METALLIC_FINISH_OPTIONS.map(o => `"${o.value}"`).join(', ')}
Backgrounds: ${BACKGROUND_OPTIONS.map(o => `"${o.value}"`).join(', ')}

=== TYPOGRAPHY ===
Font Styles: ${FONT_STYLE_OPTIONS.map(o => `"${o.value}" (${o.description})`).join(', ')}
Text Weights: ${TEXT_WEIGHT_OPTIONS.map(o => `"${o.value}"`).join(', ')}
Letter Spacing: ${LETTER_SPACING_OPTIONS.map(o => `"${o.value}"`).join(', ')}
Text Case: ${TEXT_CASE_OPTIONS.map(o => `"${o.value}"`).join(', ')}

=== MATERIALS ===
Material Types: ${MATERIAL_TYPES.map(m => `"${m.id}" (${m.description})`).join(', ')}

=== 3D EFFECTS ===
Depth Levels: ${DEPTH_LEVEL_OPTIONS.map(o => `"${o.value}"`).join(', ')}
Lighting Direction: ${LIGHTING_OPTIONS.map(o => `"${o.value}"`).join(', ')}
Bevel Styles: ${BEVEL_OPTIONS.map(o => `"${o.value}"`).join(', ')}
Perspectives: ${PERSPECTIVE_OPTIONS.map(o => `"${o.value}"`).join(', ')}

=== DECORATIVE EFFECTS ===
Swoosh Styles: ${SWOOSH_STYLE_OPTIONS.map(o => `"${o.value}" (${o.description})`).join(', ')}
Swoosh Positions: ${SWOOSH_POSITION_OPTIONS.map(o => `"${o.value}"`).join(', ')}
Sparkle Intensity: ${SPARKLE_OPTIONS.map(o => `"${o.value}"`).join(', ')}
Shadow Styles: ${SHADOW_STYLE_OPTIONS.map(o => `"${o.value}"`).join(', ')}

=== TEXT EFFECTS ===
Text Outlines: ${TEXT_OUTLINE_OPTIONS.map(o => `"${o.id}"`).join(', ')}
Glow Effects: ${GLOW_EFFECT_OPTIONS.map(o => `"${o.id}" (${o.description || ''})`).join(', ')}
Text Textures: ${TEXT_TEXTURE_OPTIONS.map(o => `"${o.id}"`).join(', ')}
Letter Effects: ${LETTER_EFFECT_OPTIONS.map(o => `"${o.id}" (${o.description || ''})`).join(', ')}

=== ICONS ===
Icon Styles: ${EXTENDED_ICON_OPTIONS.map(o => `"${o.id}" (${o.description || ''})`).join(', ')}
Icon Positions: ${ICON_POSITION_OPTIONS.map(o => `"${o.id}"`).join(', ')}

=== INDUSTRY PRESETS (for reference) ===
${INDUSTRY_PRESETS.map(p => `"${p.id}" - ${p.name}: ${p.description}`).join('\n')}

RESPONSE FORMAT:
When suggesting logo settings, ALWAYS respond with a JSON object in this format:
{
  "message": "Your friendly explanation of the suggested design",
  "logoConfig": {
    // Include ONLY the settings you want to change
    "dotSize": "medium",
    "dotColor": { "name": "Cyan", "value": "cyan", "hex": "#06B6D4" },
    "metallicFinish": "chrome",
    // ... other relevant settings
  }
}

IMPORTANT:
- For color values (dotColor, textColor, accentColor), use the ColorOption format: { "name": "...", "value": "...", "hex": "..." }
- Only include settings that are relevant to the user's request
- Be creative but practical with your suggestions
- Explain WHY you chose certain settings to help the user understand the design rationale
- If the user uploads a reference image, try to match the style as closely as possible`
}

/**
 * Build the prompt for analyzing logo reference images
 */
export function buildLogoAnalysisPrompt(): string {
  return `You are an expert logo analyst. Analyze this logo/design image with EXTREME PRECISION and DETAIL for recreation. Examine every single visual element carefully.

## CRITICAL INSTRUCTIONS:
- Be SPECIFIC with exact values, not vague descriptions
- Use the EXACT option values provided in brackets
- Analyze the ACTUAL image content, don't make assumptions
- If uncertain about a value, state your confidence level

## ANALYSIS CATEGORIES:

### 1. INDUSTRY IDENTIFICATION (REQUIRED)
Examine the logo's visual language, iconography, and style to determine the industry:
- [tech] - Circuit patterns, digital elements, geometric shapes, tech iconography
- [luxury] - Premium materials (gold, diamonds), elegant serif fonts, ornate details
- [nature] - Leaves, organic shapes, green tones, eco-friendly imagery
- [food] - Culinary imagery, warm colors, appetizing elements
- [finance] - Shields, growth arrows, professional styling, trust symbols
- [creative] - Artistic brushes, cameras, palettes, expressive designs
- [sports] - Dynamic motion, energy lines, athletic imagery
- [realestate] - Houses, keys, buildings, property symbols
- [corporate] - Professional, clean, business-oriented

**Detected Industry:** [state the industry ID from above]
**Confidence:** [high/medium/low]
**Reasoning:** [brief explanation]

### 2. STYLE AESTHETIC (REQUIRED)
Analyze the overall design approach:
- [modern] - Clean lines, minimalist, contemporary, geometric
- [elegant] - Sophisticated, refined, premium, luxurious
- [bold] - Strong, powerful, impactful, heavy weights
- [playful] - Fun, creative, colorful, whimsical
- [organic] - Natural, flowing, hand-drawn feel

**Detected Style:** [state the style ID]
**Secondary Style:** [if mixed styles present]

### 3. COLOR ANALYSIS (REQUIRED - Be PRECISE)
List ALL colors detected with their approximate hex values:
- [blue] #3B82F6 - Tech, trust, corporate
- [cyan] #06B6D4 - Digital, futuristic, fresh
- [purple] #8B5CF6 - Creative, premium, innovative
- [gold] #D4AF37 - Luxury, premium, classic
- [green] #22C55E - Nature, growth, eco
- [red] #EF4444 - Energy, passion, urgency
- [pink] #EC4899 - Creative, feminine, modern
- [orange] #F97316 - Energetic, friendly, warm
- [black] #000000 - Professional, bold, elegant
- [silver] #C0C0C0 - Tech, modern, metallic
- [white] #FFFFFF - Clean, minimal, pure

**Primary Color:** [color name and hex]
**Secondary Color:** [color name and hex if present]
**Accent Color:** [color name and hex if present]
**Background Color:** [color or description]

### 4. 3D DEPTH & EFFECTS (REQUIRED)
Analyze the dimensional qualities:
- [flat] - Completely 2D, no depth
- [subtle] - Slight shadow or minimal depth
- [medium] - Clear 3D appearance, moderate extrusion
- [deep] - Strong 3D effect, significant depth
- [extreme] - Dramatic 3D, heavy extrusion

**Depth Level:** [state the depth ID]
**Has Shadow:** [yes/no] - Type: [soft-drop/hard/long-cast/none]
**Has Bevel:** [yes/no] - Type: [soft/sharp/embossed/none]

### 5. METALLIC & MATERIAL ANALYSIS
Examine surface qualities:
- Metallic finishes: [chrome/gold/bronze/rose-gold/platinum/copper/none]
- Material appearance: [glass/crystal/metal/plastic/neon/holographic/matte]
- Surface texture: [polished/brushed/matte/glossy/textured]

**Metallic Finish:** [state if present and type]
**Material Type:** [primary material appearance]
**Surface Quality:** [describe finish]

### 6. GLOW & LIGHTING EFFECTS
- Glow presence: [none/soft/neon/electric/aurora]
- Glow color: [describe if present]
- Lighting direction: [top-left/top/top-right/side/bottom]
- Light intensity: [subtle/moderate/strong]

**Glow Effect:** [describe]
**Lighting:** [describe direction and intensity]

### 7. TYPOGRAPHY ANALYSIS (if text present)
- Font category: [sans-serif-bold/serif-elegant/modern-geometric/tech-digital/rounded-friendly/handwritten-casual]
- Font weight: [light/regular/bold/extra-bold]
- Letter spacing: [tight/normal/wide/very-wide]
- Text case: [uppercase/lowercase/titlecase]
- Text effects: [outline/glow/gradient/shadow/none]

**Font Style:** [describe with category]
**Font Weight:** [state weight]
**Text Treatment:** [any special effects]

### 8. PATTERN & TEXTURE ANALYSIS
- Dot matrix pattern: [yes/no]
- Pattern style: [uniform/halftone/scatter/radial/circuit/neural/grid]
- Pattern coverage: [full/partial-fade/edge-only/center-only]
- Texture type: [smooth/textured/gradient/pixelated]

**Pattern Present:** [describe any patterns]
**Pattern Style:** [if present, which type]

### 9. DECORATIVE ELEMENTS
- Swoosh/arc: [none/circular/dynamic/ribbon/orbit]
- Sparkle effects: [none/subtle/medium/dramatic]
- Icons present: [describe any icons/symbols]
- Geometric shapes: [describe any shapes]

**Decorative Elements:** [list all found]

### 10. PRESET RECOMMENDATION
Based on ALL the above analysis, recommend the best matching presets:
1. **Best Match:** [preset name] - Confidence: [percentage]
2. **Second Choice:** [preset name] - Confidence: [percentage]
3. **Third Choice:** [preset name] - Confidence: [percentage]

Available presets:
- tech-circuit, tech-ai, tech-cube (Technology)
- luxury-crown, luxury-diamond (Luxury)
- nature-leaf (Nature/Eco)
- food-restaurant, food-coffee (Food & Beverage)
- finance-growth, finance-shield (Finance)
- creative-studio, creative-camera (Creative)
- sports-fitness (Sports)
- real-estate-house, real-estate-key (Real Estate)
- corporate-dotmatrix, corporate-swoosh, corporate-globe (Corporate)

## FINAL SUMMARY
Provide a JSON-formatted summary with your findings:
\`\`\`json
{
  "industry": "[industry ID]",
  "style": "[style ID]",
  "colors": ["primary", "secondary", "accent"],
  "depth": "[depth ID]",
  "effects": ["effect1", "effect2"],
  "metallic": "[metallic type or none]",
  "glow": "[glow type or none]",
  "fontStyle": "[font category]",
  "fontWeight": "[weight]",
  "pattern": "[pattern type or none]",
  "iconType": "[icon type or none]",
  "presetMatch": "[best preset ID]",
  "confidence": [0-100]
}
\`\`\`

Be thorough and precise. The accuracy of the logo recreation depends on your analysis.`
}

/**
 * Export the knowledge base for potential future use
 */
export const LOGO_AI_KNOWLEDGE = {
  dotSizes: DOT_SIZE_OPTIONS,
  dotSpacing: DOT_SPACING_OPTIONS,
  dotShapes: DOT_SHAPE_OPTIONS,
  patternStyles: PATTERN_STYLE_OPTIONS,
  patternCoverage: PATTERN_COVERAGE_OPTIONS,
  dotColors: DOT_COLOR_PRESETS,
  textColors: TEXT_COLOR_PRESETS,
  metallicFinishes: METALLIC_FINISH_OPTIONS,
  backgrounds: BACKGROUND_OPTIONS,
  fontStyles: FONT_STYLE_OPTIONS,
  textWeights: TEXT_WEIGHT_OPTIONS,
  letterSpacing: LETTER_SPACING_OPTIONS,
  textCase: TEXT_CASE_OPTIONS,
  materials: MATERIAL_TYPES,
  depthLevels: DEPTH_LEVEL_OPTIONS,
  lighting: LIGHTING_OPTIONS,
  bevels: BEVEL_OPTIONS,
  perspectives: PERSPECTIVE_OPTIONS,
  swooshStyles: SWOOSH_STYLE_OPTIONS,
  swooshPositions: SWOOSH_POSITION_OPTIONS,
  sparkle: SPARKLE_OPTIONS,
  shadows: SHADOW_STYLE_OPTIONS,
  textOutlines: TEXT_OUTLINE_OPTIONS,
  glowEffects: GLOW_EFFECT_OPTIONS,
  textTextures: TEXT_TEXTURE_OPTIONS,
  letterEffects: LETTER_EFFECT_OPTIONS,
  icons: EXTENDED_ICON_OPTIONS,
  iconPositions: ICON_POSITION_OPTIONS,
  fontCategories: FANCY_FONT_CATEGORIES,
  industryPresets: INDUSTRY_PRESETS,
}
