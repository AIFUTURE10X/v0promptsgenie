"use client"

import { useState, useEffect } from "react"
import { Trash2, Download, RotateCcw, ImageIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ThumbnailImage {
  id: number
  image_url: string
  aspect_ratio?: string
  style?: string
  width?: number
  height?: number
  file_size_mb?: number
}

interface HistoryItem {
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
  thumbnail_image?: ThumbnailImage | null
  image_count?: number
  generated_images?: Array<{
    id: number
    image_url: string
    aspect_ratio?: string
    style?: string
    width?: number
    height?: number
    file_size_mb?: number
  }>
}

interface HistoryGridProps {
  onReusePrompt: (prompt: string, aspectRatio: string) => void
  onImageClick: (images: string[], index: number) => void
  refreshTrigger?: number
}

export default function HistoryGrid({ onReusePrompt, onImageClick, refreshTrigger }: HistoryGridProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadHistory = async () => {
    console.log("[v0 HistoryGrid] Loading history from database")
    setIsLoading(true)
    try {
      const response = await fetch("/api/image-analysis/history")
      const data = await response.json()
      console.log("[v0 HistoryGrid] Loaded", data.history?.length || 0, "items")
      setHistory(data.history || [])
    } catch (error) {
      console.error("[v0 HistoryGrid] Failed to fetch history:", error)
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [refreshTrigger])

  const handleDelete = async (id: number) => {
    console.log("[v0 HistoryGrid] Deleting history item:", id)
    try {
      const response = await fetch(`/api/image-analysis/history?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        loadHistory()
      }
    } catch (error) {
      console.error("[v0 HistoryGrid] Failed to delete:", error)
    }
  }

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all history?")) {
      console.log("[v0 HistoryGrid] Clearing all history")
      try {
        const response = await fetch("/api/image-analysis/history", {
          method: "DELETE",
        })
        if (response.ok) {
          loadHistory()
        }
      } catch (error) {
        console.error("[v0 HistoryGrid] Failed to clear:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8C1A] mb-4"></div>
        <p className="text-sm text-zinc-400">Loading history...</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ImageIcon className="w-16 h-16 text-zinc-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
        <p className="text-sm text-zinc-400 max-w-md">
          Your generated images will appear here. Start by uploading images and generating new ones!
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Generation History</h2>
          <p className="text-sm text-zinc-400">{history.length} generations saved</p>
        </div>
        <Button
          onClick={handleClearAll}
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => {
          const thumbnailUrl = item.generated_images?.[0]?.image_url || item.thumbnail_image?.image_url || "/placeholder.svg"
          const imageCount = item.generated_images?.length || item.image_count || 0
          const allImageUrls = item.generated_images?.map(img => img.image_url) || (thumbnailUrl !== "/placeholder.svg" ? [thumbnailUrl] : [])

          return (
            <div
              key={item.id}
              className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              {/* Image preview */}
              <div
                className="relative aspect-video bg-zinc-950 cursor-pointer group"
                onClick={() => allImageUrls.length > 0 && onImageClick(allImageUrls, 0)}
              >
                <img
                  src={thumbnailUrl || "/placeholder.svg"}
                  alt="Generated image"
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                {imageCount > 1 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {imageCount} images
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-sm font-medium">Click to view</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-[#FF8C1A] bg-[#FF8C1A]/10 px-2 py-1 rounded">
                    {item.aspect_ratio}
                  </span>
                  <span className="text-xs text-zinc-500">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                <p className="text-sm text-zinc-300 mb-3 line-clamp-2">{item.main_prompt}</p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => onReusePrompt(item.main_prompt, item.aspect_ratio)}
                    size="sm"
                    className="flex-1 bg-[#FF8C1A] hover:bg-[#FF8C1A]/90 text-white"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reuse
                  </Button>
                  <Button
                    onClick={() => {
                      if (thumbnailUrl !== "/placeholder.svg") {
                        const link = document.createElement("a")
                        link.href = thumbnailUrl
                        link.download = `generated-${item.created_at}.png`
                        link.click()
                      }
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-zinc-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
