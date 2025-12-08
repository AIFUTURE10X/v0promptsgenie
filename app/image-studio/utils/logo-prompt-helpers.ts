/**
 * Logo Prompt Helpers
 * Utility functions for processing logo generation prompts
 */

/**
 * Check if a prompt indicates text-only logo (no icons/symbols)
 */
export function isTextOnlyLogo(prompt: string): boolean {
  const promptLower = prompt.toLowerCase()
  return promptLower.includes('text only') ||
    promptLower.includes('text logo') ||
    promptLower.includes('no icon') ||
    promptLower.includes('no image') ||
    promptLower.includes('no symbol') ||
    promptLower.includes('just text') ||
    promptLower.includes('typography only') ||
    promptLower.includes('wordmark')
}

/**
 * Build negative prompt for text-only logos
 */
export function buildTextOnlyNegativePrompt(existingNegative: string): string {
  const textOnlyNegatives = 'icon, symbol, mascot, illustration, graphic, image, picture, clipart, drawing, cartoon, animal, object, shape, emblem, badge, crest'
  return existingNegative
    ? `${existingNegative}, ${textOnlyNegatives}`
    : textOnlyNegatives
}

/**
 * Default replication prompt for reference-based logos
 */
export const REPLICATION_PROMPT = 'Faithfully replicate this exact logo. Preserve all visual elements exactly: colors, typography, iconography, shapes, layout, proportions, and style. Create an exact reproduction without modifications.'

/**
 * Default inspire prompt for reference-based logos
 */
export const INSPIRE_PROMPT = 'Recreate this logo with the same style and design elements'
