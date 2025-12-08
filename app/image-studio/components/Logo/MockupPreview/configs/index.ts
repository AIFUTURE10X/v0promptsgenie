/**
 * Mockup Configurations - Barrel Exports
 *
 * Each config file defines a product mockup's properties:
 * colors, print areas, dimensions, and rendering functions.
 */

import { tshirtConfig, TSHIRT_COLORS } from './tshirt.config'
import { hoodieConfig, HOODIE_COLORS } from './hoodie.config'
import { hatConfig, HAT_COLORS } from './hat.config'
import { phoneCaseConfig, PHONE_CASE_COLORS } from './phone-case.config'
import { mugConfig, MUG_COLORS } from './mug.config'
import { toteBagConfig, TOTE_BAG_COLORS } from './tote-bag.config'
import { pillowConfig, PILLOW_COLORS } from './pillow.config'
import { wallArtConfig, WALLART_COLORS } from './wall-art.config'
import { stickersConfig, STICKER_COLORS } from './stickers.config'
import { customUploadConfig, CUSTOM_UPLOAD_COLORS } from './custom-upload.config'
import type { MockupConfig } from '../generic/mockup-types'

// Re-export individual configs
export { tshirtConfig, TSHIRT_COLORS }
export { hoodieConfig, HOODIE_COLORS }
export { hatConfig, HAT_COLORS }
export { phoneCaseConfig, PHONE_CASE_COLORS }
export { mugConfig, MUG_COLORS }
export { toteBagConfig, TOTE_BAG_COLORS }
export { pillowConfig, PILLOW_COLORS }
export { wallArtConfig, WALLART_COLORS }
export { stickersConfig, STICKER_COLORS }
export { customUploadConfig, CUSTOM_UPLOAD_COLORS }

/**
 * Registry of all mockup configurations by ID
 */
export const MOCKUP_CONFIGS: Record<string, MockupConfig> = {
  tshirt: tshirtConfig,
  hoodie: hoodieConfig,
  hat: hatConfig,
  'phone-case': phoneCaseConfig,
  mug: mugConfig,
  'tote-bag': toteBagConfig,
  pillow: pillowConfig,
  'wall-art': wallArtConfig,
  stickers: stickersConfig,
  'custom-upload': customUploadConfig,
}

/**
 * Get mockup config by ID
 */
export function getMockupConfig(id: string): MockupConfig | undefined {
  return MOCKUP_CONFIGS[id]
}

/**
 * Get all available mockup IDs
 */
export function getAvailableMockupIds(): string[] {
  return Object.keys(MOCKUP_CONFIGS)
}
