import { useState, useEffect } from 'react'

interface HistoryImage {
  id: number
  image_url: string
  aspect_ratio?: string
  style?: string
  width?: number
  height?: number
  file_size_mb?: number
}

export interface HistoryItem {
  id: number
  subject_image_url?: string
  scene_image_url?: string
  style_image_url?: string
  subject_analysis?: string
  scene_analysis?: string
  style_analysis?: string
  main_prompt: string
  selected_style?: string
  aspect_ratio: string
  created_at: string
  generated_images?: HistoryImage[]
  image_count?: number
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const loadHistory = async () => {
    console.log('[v0] History loading disabled - using localStorage only')
    setHistory([])
    setIsLoading(false)
    return
    
    /* ORIGINAL CODE - commented out to save Neon bandwidth
    console.log('[v0] Loading history from Neon database')
    setIsLoading(true)
    try {
      const response = await fetch('/api/image-analysis/history')
      if (!response.ok) {
        throw new Error('Failed to fetch history')
      }
      const data = await response.json()
      console.log('[v0] Loaded', data.history?.length || 0, 'history items')
      setHistory(data.history || [])
    } catch (error) {
      console.error('[v0] Failed to fetch history:', error)
      setHistory([])
    } finally {
      setIsLoading(false)
    }
    */
  }

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this history entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/image-analysis/history?id=${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        console.log('[v0] Deleted history item:', id)
        loadHistory()
      }
    } catch (error) {
      console.error('[v0] Failed to delete history:', error)
    }
  }

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all history?')) {
      return
    }

    try {
      const response = await fetch('/api/image-analysis/history', {
        method: 'DELETE'
      })
      if (response.ok) {
        console.log('[v0] Cleared all history')
        loadHistory()
      }
    } catch (error) {
      console.error('[v0] Failed to clear history:', error)
    }
  }

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  useEffect(() => {
    loadHistory()
  }, [refreshTrigger])

  return {
    history,
    isLoading,
    deleteItem,
    clearAll,
    refresh,
    loadHistory
  }
}
