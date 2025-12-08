"use client"

/**
 * LogoHistoryPanel Component
 *
 * Collapsible panel showing logo generation history with filters
 */

import { useState } from 'react'
import {
  History,
  ChevronDown,
  ChevronUp,
  Heart,
  Trash2,
  GitCompare,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HistoryItem } from './HistoryItem'
import { useLogoHistory, LogoHistoryItem } from './useLogoHistory'

interface LogoHistoryPanelProps {
  onUseSettings: (item: LogoHistoryItem) => void
  onLoadImage?: (item: LogoHistoryItem) => void
  onCompare: (items: LogoHistoryItem[]) => void
}

export function LogoHistoryPanel({
  onUseSettings,
  onLoadImage,
  onCompare
}: LogoHistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const {
    items,
    totalCount,
    favoritesCount,
    isLoading,
    isSyncing,
    toggleFavorite,
    setRating,
    removeFromHistory,
    clearAllHistory,
    syncFromCloud,
    selectedForComparison,
    toggleComparisonSelection,
    clearComparisonSelection,
    getComparisonItems,
    canAddToComparison,
    selectAll,
    deleteSelected
  } = useLogoHistory()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const displayItems = showFavoritesOnly
    ? items.filter(i => i.isFavorited)
    : items

  const handleCompare = () => {
    const comparisonItems = getComparisonItems()
    if (comparisonItems.length >= 2) {
      onCompare(comparisonItems)
    }
  }

  return (
    <div className="space-y-2">
      {/* Header Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <span>Generation History</span>
          <span className="text-xs text-zinc-500">({totalCount})</span>
          {favoritesCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <Heart className="w-3 h-3 fill-current" />
              {favoritesCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3 space-y-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Select All checkbox */}
              <button
                onClick={() => {
                  if (selectedForComparison.length === displayItems.length) {
                    clearComparisonSelection()
                  } else {
                    selectAll()
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title={selectedForComparison.length === displayItems.length ? 'Deselect all' : 'Select all'}
              >
                {selectedForComparison.length === displayItems.length && displayItems.length > 0 ? (
                  <CheckSquare className="w-3 h-3 text-purple-400" />
                ) : (
                  <Square className="w-3 h-3" />
                )}
                {selectedForComparison.length > 0 ? `${selectedForComparison.length} selected` : 'Select All'}
              </button>

              {/* Favorites filter */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  showFavoritesOnly
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                <Heart className={`w-3 h-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </button>

              {/* Delete Selected button */}
              {selectedForComparison.length > 0 && (
                <>
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-1 bg-red-500/10 rounded px-2 py-1 border border-red-500/30">
                      <span className="text-[10px] text-red-400">Delete {selectedForComparison.length}?</span>
                      <Button
                        onClick={async () => {
                          setIsDeleting(true)
                          await deleteSelected()
                          setIsDeleting(false)
                          setShowDeleteConfirm(false)
                        }}
                        disabled={isDeleting}
                        size="sm"
                        className="h-5 px-2 text-[10px] bg-red-500 hover:bg-red-600 text-white"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes'}
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        size="sm"
                        variant="ghost"
                        className="h-5 px-2 text-[10px] text-zinc-400"
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      size="sm"
                      className="h-6 px-2 text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete Selected
                    </Button>
                  )}
                </>
              )}

              {/* Compare button */}
              {selectedForComparison.length >= 2 && selectedForComparison.length <= 4 && (
                <Button
                  onClick={handleCompare}
                  size="sm"
                  className="h-6 px-2 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
                >
                  <GitCompare className="w-3 h-3 mr-1" />
                  Compare
                </Button>
              )}

              {selectedForComparison.length > 0 && (
                <button
                  onClick={clearComparisonSelection}
                  className="text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sync and Clear */}
            <div className="flex items-center gap-2">
              {/* Sync button */}
              <button
                onClick={syncFromCloud}
                disabled={isSyncing}
                className={`p-1 rounded transition-colors ${
                  isSyncing ? 'text-blue-400 animate-spin' : 'text-zinc-500 hover:text-blue-400'
                }`}
                title="Sync from cloud"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Clear history */}
              <div className="relative">
                {showClearConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">Clear all?</span>
                    <Button
                      onClick={() => {
                        clearAllHistory()
                        setShowClearConfirm(false)
                      }}
                      size="sm"
                      className="h-5 px-2 text-[10px] bg-red-500/20 text-red-400"
                    >
                      Yes
                    </Button>
                    <Button
                      onClick={() => setShowClearConfirm(false)}
                      size="sm"
                      variant="ghost"
                      className="h-5 px-2 text-[10px] text-zinc-400"
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Selection hint */}
          {selectedForComparison.length > 0 && selectedForComparison.length < 2 && (
            <p className="text-[10px] text-zinc-500">
              Select at least 2 logos to compare (max 4)
            </p>
          )}

          {/* History grid */}
          {displayItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {displayItems.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  isSelected={selectedForComparison.includes(item.id)}
                  onToggleSelect={() => toggleComparisonSelection(item.id)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                  onSetRating={(rating) => setRating(item.id, rating)}
                  onDelete={() => removeFromHistory(item.id)}
                  onUseSettings={() => onUseSettings(item)}
                  onLoadImage={onLoadImage ? () => onLoadImage(item) : undefined}
                  canSelect={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-zinc-500">
                {showFavoritesOnly ? 'No favorites yet' : 'No history yet'}
              </p>
              {showFavoritesOnly && (
                <button
                  onClick={() => setShowFavoritesOnly(false)}
                  className="text-xs text-blue-400 hover:underline mt-1"
                >
                  Show all history
                </button>
              )}
            </div>
          )}

          {/* Footer info */}
          <p className="text-[10px] text-zinc-600 text-center">
            History synced to cloud. Favorite logos for quick access.
          </p>
        </div>
      )}
    </div>
  )
}
