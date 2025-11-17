# Working Image Generation Configuration - DO NOT MODIFY

**Last Working Date:** January 10, 2025
**Git Commit:** 7b4b89f (or your latest commit hash)

## Working Setup

### Model
- `gemini-2.5-flash-image` (Nano Banana)

### SDK
- `@google/genai` (direct Google SDK)
- Class: `GoogleGenAI`

### Critical Configuration Structure
\`\`\`typescript
const response = await client.models.generateContent({
  model: "gemini-2.5-flash-image",
  contents: parts,
  config: {
    response_modalities: ["IMAGE"],
    image_config: {
      aspect_ratio: aspectRatio // e.g., "1:1", "16:9"
    }
  }
});
\`\`\`

### Response Parsing
\`\`\`typescript
for (const part of response.candidates[0].content.parts) {
  if (part.inlineData?.data) {
    return part.inlineData.data; // base64 string
  }
}
\`\`\`

### Key Files
- `lib/gemini-client.ts` - Image generation client
- `app/api/generate-image/route.ts` - API endpoint

### API Key Config
- Tier 1 paid account
- Vertex AI APIs enabled
- Project: "Prompts Genie Pro Suite"

## What Was Broken Before
- Wrong config structure (`generationConfig` instead of `config`)
- Wrong property names (`inline_data` instead of `inlineData`)
- Incorrect SDK class name (`GoogleGenerativeAI` instead of `GoogleGenAI`)
- Missing Vertex AI API enablement

## DO NOT:
- Change the SDK from `@google/genai` to Vercel AI SDK for generation
- Modify the `config` structure without testing
- Change property names from camelCase
