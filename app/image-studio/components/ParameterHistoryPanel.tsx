"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Clock, Trash2, RotateCcw, RefreshCw, Download, Check } from 'lucide-react'
import { NeonStatusBadge } from './NeonStatusBadge'
import { getHistory, deleteHistoryItem, clearHistory, syncHistoryFromNeon, type HistoryItem } from '@/lib/history'
import { toast } from 'sonner'

interface ParameterHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  onRestoreParameters: (params: any) => void
}

export function ParameterHistoryPanel({ isOpen, onClose, onRestoreParameters }: ParameterHistoryPanelProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen])

  const loadHistory = () => {
    const items = getHistory()
    console.log('[v0] Loaded history:', items.length, 'items')
    setHistory(items)
  }

  const handleToggleSelect = (id: string) => {
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
        deleteHistoryItem(id)
      }
      setSelectedItems(new Set())
      loadHistory()
    } finally {
      setIsDeleting(false)
    }
  }

  const syncFromNeon = async () => {
    setLoading(true)
    try {
      console.log('[v0] Syncing history from Neon...')
      const result = await syncHistoryFromNeon()
      setHistory(result.data)

      if (result.success) {
        if (result.syncedCount === 0) {
          toast.info('No history found in cloud database')
        } else {
          toast.success(`Synced ${result.syncedCount} items from cloud`)
        }
        console.log('[v0] Synced', result.syncedCount, 'items from Neon')
      } else {
        toast.error(`Sync failed: ${result.error}`)
        console.error('[v0] Sync failed:', result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Sync failed: ${errorMessage}`)
      console.error('[v0] Failed to sync history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this history item?')) {
      deleteHistoryItem(id)
      loadHistory()
    }
  }

  const handleClearAll = () => {
    if (confirm('Clear all history? This cannot be undone.')) {
      clearHistory()
      loadHistory()
    }
  }

  const handleRestore = (item: HistoryItem) => {
    console.log('[v0] Restoring parameters from history item:', item.id)
    onRestoreParameters({
      mainPrompt: item.prompt,
      aspectRatio: item.aspectRatio,
      imageUrls: item.imageUrls,
    })
    onClose()
  }

  const handleDownloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl, {
        mode: 'cors',
        cache: 'no-cache'
      })
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `history-image-${index + 1}-${Date.now()}.png`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (error) {
      console.error('[v0] Download failed:', error)
    }
  }

  const calculateFileSize = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      const contentLength = response.headers.get('content-length')
      
      if (contentLength) {
        const sizeInBytes = parseInt(contentLength)
        const sizeInMB = sizeInBytes / (1024 * 1024)
        return `~${sizeInMB.toFixed(1)} MB`
      }
      
      return ''
    } catch (error) {
      console.error('[v0] Error calculating file size:', error)
      return ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] bg-zinc-900 border-[#c99850]/30 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c99850] to-[#dbb56e] flex items-center justify-center">
              <Clock className="w-5 h-5 text-black" />
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Parameter History</h2>
                <p className="text-sm text-zinc-400">
                  {selectedItems.size > 0
                    ? `${selectedItems.size} selected`
                    : `${history.length} ${history.length === 1 ? 'item' : 'items'} saved`}
                </p>
              </div>
              <NeonStatusBadge endpoint="/api/history/test-connection" />
            </div>
            {history.length > 0 && (
              <div className="flex items-center gap-2 ml-4">
                <Checkbox
                  checked={selectedItems.size === history.length && history.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-[#c99850] data-[state=checked]:bg-[#c99850] data-[state=checked]:border-[#c99850]"
                />
                <span className="text-xs text-zinc-400">Select All</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={syncFromNeon}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="text-[#c99850] hover:text-[#dbb56e] hover:bg-[#c99850]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync from Cloud
            </Button>
            {selectedItems.size > 0 ? (
              <Button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedItems.size})
              </Button>
            ) : history.length > 0 ? (
              <Button
                onClick={handleClearAll}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            ) : null}
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Clock className="w-16 h-16 text-zinc-600 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-400 mb-2">No History Yet</h3>
              <p className="text-sm text-zinc-500 max-w-md">
                Generate images to start building your parameter history. Previous generations will appear here with thumbnails for quick restoration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <Card
                  key={item.id}
                  className={`bg-zinc-800 border-zinc-700 hover:border-[#c99850]/50 transition-all cursor-pointer group overflow-hidden ${
                    selectedItems.has(item.id) ? 'ring-2 ring-[#c99850] border-[#c99850]' : ''
                  }`}
                  onClick={() => handleRestore(item)}
                >
                  {/* Image Preview */}
                  <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                    <div 
                      className="absolute top-2 left-2 z-10" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative w-5 h-5">
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => handleToggleSelect(item.id)}
                          className="bg-black/80 border-[#c99850] data-[state=checked]:bg-[#c99850] data-[state=checked]:border-[#c99850] backdrop-blur-sm"
                        />
                        {selectedItems.has(item.id) && (
                          <Check className="absolute inset-0 w-5 h-5 text-black pointer-events-none" strokeWidth={3} />
                        )}
                      </div>
                    </div>

                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <>
                        <img
                          src={item.imageUrls[0] || "/placeholder.svg"}
                          alt="Generated preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.imageUrls.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            +{item.imageUrls.length - 1} more
                          </div>
                        )}
                        
                        {item.metadata && (
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-wrap gap-1">
                              {item.aspectRatio && (
                                <span className="text-xs px-2 py-0.5 bg-[#c99850] text-black font-medium rounded">
                                  {item.aspectRatio}
                                </span>
                              )}
                              {item.metadata.style && (
                                <span className="text-xs px-2 py-0.5 bg-[#c99850] text-black font-medium rounded">
                                  {item.metadata.style}
                                </span>
                              )}
                              {item.metadata.dimensions && (
                                <span className="text-xs px-2 py-0.5 bg-[#c99850] text-black font-medium rounded">
                                  {item.metadata.dimensions}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadImage(item.imageUrls[0], 0)
                            }}
                            size="sm"
                            className="bg-[#c99850] hover:bg-[#dbb56e] text-black"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#c99850] hover:bg-[#dbb56e] text-black"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Clock className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    {/* Prompt */}
                    <p className="text-sm text-white mb-3 line-clamp-2 min-h-[2.5rem]">
                      {item.prompt}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                      <span className="px-2 py-1 bg-zinc-900 rounded">
                        {item.aspectRatio}
                      </span>
                      <span className="text-zinc-500">
                        {new Date(item.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRestore(item)}
                        size="sm"
                        className="flex-1 bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850] border border-[#c99850]/30"
                      >
                        <RotateCcw className="w-3 h-3 mr-2" />
                        Restore
                      </Button>
                      <Button
                        onClick={(e) => handleDelete(item.id, e)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
