"use client"

import { History, X, Trash2, Download, RotateCcw, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useHistory, type HistoryItem } from '../hooks/useHistory'
import { useState } from 'react'

interface HistoryPanelProps {
  onReusePrompt: (prompt: string, aspectRatio: string) => void
  onImageClick: (images: string[], index: number) => void
}

export function HistoryPanel({ onReusePrompt, onImageClick }: HistoryPanelProps) {
  const { history, isLoading, deleteItem, clearAll } = useHistory()
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleSelect = (id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === history.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(history.map(h => h.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (!confirm(`Delete ${selectedItems.size} selected item(s)?`)) return
    
    setIsDeleting(true)
    try {
      for (const id of selectedItems) {
        await deleteItem(id)
      }
      setSelectedItems(new Set())
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c99850] mb-4"></div>
        <p className="text-sm text-zinc-400">Loading history...</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <History className="w-16 h-16 text-zinc-700 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
        <p className="text-sm text-zinc-400 max-w-md text-center">
          Your generated images will appear here. Start by uploading images and generating new ones!
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-6 h-6" />
              Generation History
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {selectedItems.size > 0 
                ? `${selectedItems.size} selected` 
                : `${history.length} generations saved`}
            </p>
          </div>
          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedItems.size === history.length && history.length > 0}
                onCheckedChange={handleSelectAll}
                className="border-[#c99850]"
              />
              <span className="text-xs text-zinc-400">Select All</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {selectedItems.size > 0 ? (
            <Button
              onClick={handleBulkDelete}
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedItems.size})
            </Button>
          ) : (
            <Button
              onClick={clearAll}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => {
          const thumbnailUrl = item.generated_images?.[0]?.image_url || '/placeholder.svg'
          const imageCount = item.generated_images?.length || 0
          const allImageUrls = item.generated_images?.map(img => img.image_url) || []

          return (
            <div
              key={item.id}
              className={`bg-zinc-900 rounded-xl overflow-hidden border transition-all hover:shadow-lg hover:shadow-[#c99850]/10 ${
                selectedItems.has(item.id) ? 'border-[#c99850] ring-2 ring-[#c99850]' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Thumbnail */}
              <div
                className="relative aspect-video bg-zinc-950 cursor-pointer group overflow-hidden"
                onClick={() => allImageUrls.length > 0 && onImageClick(allImageUrls, 0)}
              >
                <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => handleToggleSelect(item.id)}
                    className="bg-black/80 border-[#c99850] backdrop-blur-sm"
                  />
                </div>

                <img
                  src={thumbnailUrl || "/placeholder.svg"}
                  alt="Generated image"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {imageCount > 1 && (
                  <div className="absolute top-3 right-3 bg-black/80 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                    {imageCount} images
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <span className="text-white text-sm font-medium">Click to view</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-4">
                {/* Metadata badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-[#c99850] bg-[#c99850]/10 px-2 py-1 rounded-md">
                    {item.aspect_ratio}
                  </span>
                  {item.selected_style && (
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                      {item.selected_style}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500 ml-auto">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Prompt preview */}
                <p className="text-sm text-zinc-300 mb-4 line-clamp-2 leading-relaxed">
                  {item.main_prompt}
                </p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => onReusePrompt(item.main_prompt, item.aspect_ratio)}
                    size="sm"
                    className="flex-1 bg-linear-to-r from-[#c99850] to-[#dbb56e] hover:from-[#dbb56e] hover:to-[#c99850] text-black font-medium"
                  >
                    <RotateCcw className="w-3 h-3 mr-2" />
                    Reuse
                  </Button>
                  <Button
                    onClick={() => {
                      if (thumbnailUrl !== '/placeholder.svg') {
                        const link = document.createElement('a')
                        link.href = thumbnailUrl
                        link.download = `generated-${item.created_at}.png`
                        link.click()
                      }
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteItem(item.id)}
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
