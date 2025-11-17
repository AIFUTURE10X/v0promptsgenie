export type HistoryItem = {
  id: string
  prompt: string
  aspectRatio: string
  imageUrls: string[]
  timestamp: number
  metadata?: {
    style?: string
    dimensions?: string
    fileSize?: string
  }
}

const HISTORY_KEY = "image_generation_history"
const MAX_HISTORY_ITEMS = 100

export async function saveToHistory(
  prompt: string,
  aspectRatio: string,
  imageUrls: string[],
  metadata?: { style?: string; dimensions?: string; fileSize?: string }
): Promise<void> {
  try {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      prompt,
      aspectRatio,
      imageUrls,
      timestamp: Date.now(),
      metadata,
    }

    console.log("[v0] Saving history item:", newItem)

    // Save to localStorage immediately for fast access
    const history = getHistory()
    history.unshift(newItem)
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory))
    console.log("[v0] History saved to localStorage. Total items:", trimmedHistory.length)

    // Also save to Neon for persistence
    try {
      const userId = getUserId()
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          prompt,
          aspectRatio,
          imageUrls,
          metadata
        })
      })

      if (response.ok) {
        console.log('[v0] History saved to Neon database')
      } else {
        console.error('[v0] Failed to save history to Neon:', await response.text())
      }
    } catch (error) {
      console.error('[v0] API save failed, using localStorage only:', error)
    }
  } catch (error) {
    console.error("[v0] Error saving to history:", error)
  }
}

export function getHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (!stored) {
      console.log("[v0] No history found in localStorage")
      return []
    }
    const parsed = JSON.parse(stored) as HistoryItem[]
    console.log("[v0] History retrieved from localStorage:", parsed.length, "items")
    return parsed
  } catch (error) {
    console.error("[v0] Error loading history:", error)
    return []
  }
}

export async function syncHistoryFromNeon(): Promise<HistoryItem[]> {
  try {
    const userId = getUserId()
    const response = await fetch(`/api/history?userId=${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch history from Neon')
    }
    
    const data = await response.json()
    const neonHistory = data.history as HistoryItem[]
    
    console.log('[v0] Synced history from Neon:', neonHistory.length, 'items')
    
    // Merge with localStorage and update
    const localHistory = getHistory()
    const mergedHistory = mergeHistories(neonHistory, localHistory)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(mergedHistory))
    
    return mergedHistory
  } catch (error) {
    console.error('[v0] Failed to sync from Neon:', error)
    return getHistory()
  }
}

function mergeHistories(neonHistory: HistoryItem[], localHistory: HistoryItem[]): HistoryItem[] {
  const merged = [...neonHistory]
  const existingUrls = new Set(neonHistory.flatMap(h => h.imageUrls))
  
  // Add local items that don't exist in Neon
  for (const item of localHistory) {
    const hasMatch = item.imageUrls.some(url => existingUrls.has(url))
    if (!hasMatch) {
      merged.push(item)
    }
  }
  
  // Sort by timestamp and limit
  return merged
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_HISTORY_ITEMS)
}

export function deleteHistoryItem(id: string): void {
  try {
    const history = getHistory()
    const filtered = history.filter((item) => item.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("[v0] Error deleting history item:", error)
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.error("[v0] Error clearing history:", error)
  }
}

function getUserId(): string {
  let userId = localStorage.getItem('user_id')
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('user_id', userId)
  }
  return userId
}
