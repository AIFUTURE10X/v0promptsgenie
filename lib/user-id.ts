/**
 * Unified User ID Management
 *
 * Consolidates all user ID generation into one shared utility.
 * Auto-migrates from legacy localStorage keys to prevent data orphaning.
 */

const USER_ID_KEY = 'genie-user-id'

// Legacy keys from different parts of the app - checked for migration
const LEGACY_KEYS = [
  'logo-history-user-id',   // Logo history system
  'user_id',                // Regular image history
  'anonymous-user-id',      // Favorites/generated images
]

/**
 * Get or create a unified user ID.
 *
 * On first call:
 * 1. Checks for existing unified ID
 * 2. If not found, migrates from any legacy key
 * 3. If no legacy ID, generates new one
 *
 * This ensures all systems use the same user ID and
 * existing data is not orphaned after code updates.
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server'

  // Try unified key first
  let userId = localStorage.getItem(USER_ID_KEY)

  // Migrate from legacy keys if unified doesn't exist
  if (!userId) {
    for (const legacyKey of LEGACY_KEYS) {
      const legacyId = localStorage.getItem(legacyKey)
      if (legacyId) {
        userId = legacyId
        // Migrate to unified key
        localStorage.setItem(USER_ID_KEY, userId)
        console.log(`[User ID] Migrated from '${legacyKey}' to unified key: ${userId}`)
        break
      }
    }
  }

  // Generate new if nothing found
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem(USER_ID_KEY, userId)
    console.log(`[User ID] Generated new user ID: ${userId}`)
  }

  return userId
}

/**
 * Get all known user IDs from localStorage (for debugging/recovery)
 */
export function getAllUserIds(): Record<string, string | null> {
  if (typeof window === 'undefined') return {}

  return {
    unified: localStorage.getItem(USER_ID_KEY),
    ...LEGACY_KEYS.reduce((acc, key) => {
      acc[key] = localStorage.getItem(key)
      return acc
    }, {} as Record<string, string | null>),
  }
}

/**
 * Force set a specific user ID (for recovery purposes)
 */
export function setUserId(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_ID_KEY, userId)
  console.log(`[User ID] Manually set user ID: ${userId}`)
}
