"use client"

import { useState, useEffect } from 'react'
import { Heart, X, Download, RotateCcw, Trash2, Check } from 'lucide-react'
import { NeonStatusBadge } from './NeonStatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { addFavorite, getAllFavorites, removeFavorite, clearAllFavorites, type FavoriteImage } from '@/lib/db/dbService'

interface FavoriteButtonProps {
  imageUrl: string
  isFavorite: boolean
  onToggle: () => void
  size?: 'sm' | 'lg'
}

export function FavoriteButton({ imageUrl, isFavorite, onToggle, size = 'sm' }: FavoriteButtonProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isToggling) return
    
    setIsToggling(true)
    try {
      await onToggle()
      if (!isFavorite) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 1500)
      }
    } finally {
      setTimeout(() => setIsToggling(false), 300)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        disabled={isToggling}
        className={`
          ${size === 'lg' ? 'p-3' : 'p-2'}
          rounded-full
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-[#c99850]
          ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
          ${isFavorite 
            ? 'bg-red-500 hover:bg-red-600 scale-100' 
            : 'bg-white/90 hover:bg-white hover:scale-110'
          }
        `}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart 
          className={`
            ${size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'}
            transition-all duration-300
            ${isFavorite 
              ? 'fill-white text-white animate-heart-beat' 
              : 'text-gray-800 hover:fill-gray-300'
            }
          `} 
        />
      </button>
      
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-success-pop">
          <div className="bg-green-500 rounded-full p-2 shadow-lg">
            <Check className="w-6 h-6 text-white stroke-3" />
          </div>
        </div>
      )}
    </div>
  )
}

interface FavoritesModalProps {
  favorites: FavoriteImage[]
  onClose: () => void
  onRemove: (url: string) => void
  onClearAll: () => void
  onRestoreParameters?: (params: any) => void
}

export function FavoritesModal({ favorites, onClose, onRemove, onClearAll, onRestoreParameters }: FavoritesModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleSelect = (url: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(url)) {
        newSet.delete(url)
      } else {
        newSet.add(url)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === favorites.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(favorites.map(f => f.url)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (!confirm(`Delete ${selectedItems.size} selected image(s)?`)) return
    
    setIsDeleting(true)
    try {
      for (const url of selectedItems) {
        await onRemove(url)
      }
      setSelectedItems(new Set())
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        cache: 'no-cache'
      })
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `favorite-${index + 1}-${Date.now()}.png`
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

  const handleRestore = (fav: FavoriteImage) => {
    console.log('[v0] Favorite metadata:', fav.metadata)
    console.log('[v0] Has params?', !!fav.metadata?.params)

    if (fav.metadata?.params && onRestoreParameters) {
      console.log('[v0] Restoring params from favorite:', fav.id)
      onRestoreParameters(fav.metadata.params)
      onClose()
    } else {
      console.log('[v0] No parameters to restore or no restore handler')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <Card className="bg-zinc-900 border-[#c99850]/30 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Favorites</h2>
                <p className="text-xs text-zinc-400">
                  {selectedItems.size > 0
                    ? `${selectedItems.size} selected`
                    : `${favorites.length} saved images`}
                </p>
              </div>
              <NeonStatusBadge endpoint="/api/favorites/test-connection" />
            </div>
            {favorites.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedItems.size === favorites.length && favorites.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="border-[#c99850]"
                />
                <span className="text-xs text-zinc-400">Select All</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {selectedItems.size > 0 && (
              <Button
                onClick={handleBulkDelete}
                size="sm"
                disabled={isDeleting}
                className="bg-red-900/20 hover:bg-red-900/30 text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedItems.size})
              </Button>
            )}
            {favorites.length > 0 && selectedItems.size === 0 && (
              <Button
                onClick={onClearAll}
                size="sm"
                className="bg-red-900/20 hover:bg-red-900/30 text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400">No favorites yet</p>
              <p className="text-xs text-zinc-500 mt-2">Click the heart button on generated images to save them</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {favorites.map((fav, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute top-2 left-2 z-20">
                    <div className="relative">
                      <Checkbox
                        checked={selectedItems.has(fav.url)}
                        onCheckedChange={() => handleToggleSelect(fav.url)}
                        className="bg-black/80 border-[#c99850] backdrop-blur-sm data-[state=checked]:bg-[#c99850] data-[state=checked]:border-[#c99850]"
                      />
                      {selectedItems.has(fav.url) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Check className="w-3 h-3 text-black stroke-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  <img
                    src={fav.url || "/placeholder.svg"}
                    alt={`Favorite ${idx + 1}`}
                    className={`w-full aspect-square object-cover rounded-lg transition-all ${
                      selectedItems.has(fav.url) ? 'ring-2 ring-[#c99850]' : ''
                    }`}
                  />
                  
                  {fav.metadata && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-wrap gap-1">
                        {fav.metadata.ratio && (
                          <span className="text-xs px-2 py-0.5 bg-[#c99850] text-black font-medium rounded">
                            {fav.metadata.ratio}
                          </span>
                        )}
                        {fav.metadata.style && (
                          <span className="text-xs px-2 py-0.5 bg-[#c99850] text-black font-medium rounded">
                            {fav.metadata.style}
                          </span>
                        )}
                        {fav.metadata.dimensions && (
                          <span className="text-xs px-2 py-0.5 bg-[#c99850] text-black font-medium rounded">
                            {fav.metadata.dimensions}
                          </span>
                        )}
                        {fav.metadata.params && (
                          <span className="text-xs px-2 py-0.5 bg-green-600 text-white font-medium rounded">
                            Has Parameters
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2 flex gap-1 transition-opacity z-20">
                    {fav.metadata?.params && onRestoreParameters && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestore(fav)
                        }}
                        size="sm"
                        className="bg-[#c99850] hover:bg-[#dbb56e] text-black backdrop-blur-sm h-8 px-3"
                        title="Restore Parameters"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restore
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(fav.url, idx)
                      }}
                      size="sm"
                      className="bg-black/80 hover:bg-black/90 text-white backdrop-blur-sm h-8 px-2"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(fav.url)
                      }}
                      size="sm"
                      className="bg-red-500/80 hover:bg-red-600/90 text-white backdrop-blur-sm h-8 px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div
                    className="absolute inset-0 cursor-pointer z-10"
                    onClick={() => {
                      if (fav.metadata?.params) {
                        handleRestore(fav)
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingUrls, setTogglingUrls] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setIsLoading(true)
    console.log('[v0] Loading favorites via service layer')
    
    try {
      const loaded = await getAllFavorites()
      console.log('[v0] Loaded favorites:', loaded.length)
      setFavorites(loaded)
    } catch (error) {
      console.error('[v0] Error loading favorites:', error)
      setFavorites([])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (url: string, metadata?: FavoriteImage['metadata']) => {
    if (togglingUrls.has(url)) {
      console.log('[v0] Already toggling this URL, ignoring duplicate request')
      return
    }

    setTogglingUrls(prev => new Set(prev).add(url))

    try {
      const currentFavorites = await getAllFavorites()
      const exists = currentFavorites.find(f => f.url === url)
      
      console.log('[v0] Toggle favorite:', { url, exists: !!exists, alreadyFavorited: !!exists })
      
      if (exists) {
        console.log('[v0] Removing favorite (already exists)')
        await removeFavorite(exists.id)
        setFavorites(prev => prev.filter(f => f.id !== exists.id))
      } else {
        console.log('[v0] Adding new favorite')
        const newFavorite = await addFavorite(url, metadata)
        setFavorites(prev => [...prev, newFavorite])
      }
    } catch (error) {
      console.error('[v0] Error toggling favorite:', error)
    } finally {
      setTogglingUrls(prev => {
        const newSet = new Set(prev)
        newSet.delete(url)
        return newSet
      })
    }
  }

  const isFavorite = (url: string) => {
    return favorites.some(f => f.url === url)
  }

  const isToggling = (url: string) => {
    return togglingUrls.has(url)
  }

  const clearAll = async () => {
    try {
      console.log('[v0] Clearing all favorites via service layer')
      await clearAllFavorites()
      setFavorites([])
    } catch (error) {
      console.error('[v0] Error clearing favorites:', error)
    }
  }

  return { favorites, toggleFavorite, isFavorite, isToggling, clearAll, isLoading }
}
