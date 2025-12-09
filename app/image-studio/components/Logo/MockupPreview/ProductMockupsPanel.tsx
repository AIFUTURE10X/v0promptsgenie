"use client"

/**
 * ProductMockupsPanel Component
 *
 * Mega menu based product mockup selector with two-header layout.
 * Header 1: Exit + MegaMenu + View Larger + Generate Photos
 * Header 2: Selected product label + Upload New Products
 * Refactored: State logic extracted to useProductMockupsState.ts
 */

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Wand2, Maximize2, Upload, X, Package, Save, FolderOpen, Trash2, ChevronDown, History } from 'lucide-react'
import { toast } from 'sonner'
import type { SavedMockup } from './useProductMockupsState'
import { GenericMockup } from './generic'
import { getParentCategory } from './categories'
import { MockupControls } from './MockupControls'
import { MockupPhotoGenerator } from './MockupPhotoGenerator'
import { AddCustomProductModal } from './AddCustomProductModal'
import { MegaMenu } from './MegaMenu'
import { useProductMockupsState } from './useProductMockupsState'
import { LogoHistoryPanel, LogoHistoryItem } from '../LogoHistory'

interface ProductMockupsPanelProps {
  logoUrl?: string
  brandName?: string
  logoFilter?: React.CSSProperties
  onClose?: () => void
  onLogoUrlChange?: (url: string) => void
  /** Callback when mockup is saved to history (so parent can refresh history panel) */
  onSaveToHistory?: () => void
}

export interface ProductMockupsPanelRef {
  loadMockupFromHistory: (imageUrl: string) => void
}

export const ProductMockupsPanel = forwardRef<ProductMockupsPanelRef, ProductMockupsPanelProps>(function ProductMockupsPanel({
  logoUrl,
  brandName,
  logoFilter,
  onClose,
  onLogoUrlChange,
  onSaveToHistory,
}, ref) {
  const [showSavedMockupsDropdown, setShowSavedMockupsDropdown] = useState(false)
  const [showSavePresetModal, setShowSavePresetModal] = useState(false)
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false)
  const [presetName, setPresetName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const historyDropdownRef = useRef<HTMLDivElement>(null)
  const historyRefreshRef = useRef<(() => void) | null>(null)
  const presetInputRef = useRef<HTMLInputElement>(null)
  const state = useProductMockupsState({ brandName, onLogoUrlChange })

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    loadMockupFromHistory: (imageUrl: string) => {
      state.setLoadedLogoUrl(imageUrl)
      toast.success('Mockup loaded from history!')
    }
  }), [state])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSavedMockupsDropdown(false)
      }
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(event.target as Node)) {
        setShowHistoryDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ESC key handler for fullscreen exit
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.isExpanded) {
        state.setIsExpanded(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [state.isExpanded, state.setIsExpanded])

  // Use loaded logo from saved mockup, or prop
  const effectiveLogoUrl = state.loadedLogoUrl || logoUrl

  return (
    <div className="flex flex-col h-full">
      {/* Header 1: Exit + MegaMenu + View Larger + Generate Photos - Hidden when fullscreen */}
      {!state.isExpanded && (
      <div className="relative flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shrink-0"
            title="Exit Products"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <MegaMenu
          selectedSubCategoryId={state.selectedSubCategoryId}
          onSelectSubCategory={state.handleSelectSubCategory}
        />

        {/* History Dropdown */}
        <div ref={historyDropdownRef} className="relative">
          <button
            onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showHistoryDropdown
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
            }`}
            title="View mockup history"
          >
            <History className="w-4 h-4" />
            Mockup History
            <ChevronDown className={`w-4 h-4 transition-transform ${showHistoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showHistoryDropdown && (
            <div className="absolute left-0 top-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden p-4 min-w-[874px]">
              <LogoHistoryPanel
                filterStyle="mockup"
                compact={true}
                alwaysExpanded={true}
                refreshRef={historyRefreshRef}
                onLoadImage={(item: LogoHistoryItem) => {
                  state.setLoadedLogoUrl(item.imageUrl)
                  setShowHistoryDropdown(false)
                  toast.success('Mockup loaded from history!')
                }}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => state.setIsExpanded(!state.isExpanded)}
          className="absolute left-[47%] -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap text-white hover:text-white hover:bg-zinc-700 bg-zinc-800 border border-zinc-700"
          title={state.isExpanded ? "Collapse mockup view" : "Expand mockup with all settings"}
        >
          <Maximize2 className="w-4 h-4" />
          {state.isExpanded ? 'Collapse' : 'Expand'}
        </button>

        <div className="flex-1" />

        {/* Save Preset Button - opens modal to name the preset */}
        <button
          onClick={() => {
            setPresetName(state.getSelectedLabel())
            setShowSavePresetModal(true)
            setTimeout(() => presetInputRef.current?.focus(), 100)
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap text-green-400 hover:text-green-300 hover:bg-green-500/10 border border-green-500/30"
          title="Save current mockup preset for quick reload"
        >
          <Save className="w-4 h-4" />
          Save Preset
        </button>

        {/* Load Preset Dropdown - Always visible */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowSavedMockupsDropdown(!showSavedMockupsDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/30"
            title="Load a saved mockup preset"
          >
            <FolderOpen className="w-4 h-4" />
            Load Preset ({state.savedMockups.length})
            <ChevronDown className={`w-3 h-3 transition-transform ${showSavedMockupsDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showSavedMockupsDropdown && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
              {/* Delete All Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700 bg-zinc-900/50">
                <span className="text-xs text-zinc-400 font-medium">Saved Presets</span>
                {state.savedMockups.length > 0 && (
                  <button
                    onClick={() => {
                      state.savedMockups.forEach(m => state.handleDeleteSavedMockup(m.id))
                      setShowSavedMockupsDropdown(false)
                    }}
                    className="text-xs text-red-400 hover:text-red-300 hover:underline"
                  >
                    Delete All
                  </button>
                )}
              </div>
              {state.savedMockups.length === 0 ? (
                <div className="px-3 py-4 text-center text-zinc-500 text-sm">
                  No saved presets yet
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {state.savedMockups.map((mockup: SavedMockup) => (
                    <div
                      key={mockup.id}
                      className="flex items-center gap-2 p-2 hover:bg-zinc-700 cursor-pointer group"
                      onClick={() => {
                        console.log('[Preset Click] Loading mockup:', mockup.id, mockup.name)
                        state.handleLoadMockup(mockup)
                        setShowSavedMockupsDropdown(false)
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="w-10 h-10 bg-zinc-900 rounded overflow-hidden shrink-0">
                        {mockup.thumbnail ? (
                          <img src={mockup.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{mockup.name || mockup.brandName}</div>
                        <div className="text-xs text-zinc-400">
                          {new Date(mockup.timestamp).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          state.handleDeleteSavedMockup(mockup.id)
                        }}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete saved mockup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => state.setShowPhotoGenerator(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
          title="Generate AI product photos for realistic mockups"
        >
          <Wand2 className="w-4 h-4" />
          Generate Photos
        </button>
      </div>
      )}

      {/* Header 2: Selected Product Label + Upload New Products - Hidden when fullscreen */}
      {!state.isExpanded && (
      <div className="relative flex items-center px-4 py-2 border-b border-zinc-700/50">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-zinc-300">
            Selected: <span className="font-medium text-white">{state.getSelectedLabel()}</span>
          </span>
        </div>

        <button
          onClick={() => state.setShowAddProductModal(true)}
          className="absolute left-[47%] -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
          title="Upload your own product photos"
        >
          <Upload className="w-4 h-4" />
          Upload New Products
        </button>
      </div>
      )}

      {/* Product Mockup Canvas - Fixed fullscreen when expanded */}
      <div className={state.isExpanded
        ? 'fixed inset-0 z-50 bg-zinc-950 flex flex-col'
        : 'flex-1 overflow-auto relative'
      }>
          {/* Fullscreen Header Bar - only when expanded */}
          {state.isExpanded && (
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 shrink-0 bg-zinc-900 relative">
              {/* Product Name - left */}
              <span className="text-base font-semibold text-white">
                {state.getSelectedLabel()}
              </span>

              {/* Center buttons - Upload + Exit grouped together */}
              {/* Left sidebar = 160px, Right sidebar = 208px, offset = (160-208)/2 = -24px */}
              <div className="absolute left-1/2 -translate-x-1/2 ml-[-24px] flex items-center gap-3">
                <button
                  onClick={() => state.setShowAddProductModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                  title="Upload your own product photos"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Products
                </button>

                <button
                  onClick={() => state.setIsExpanded(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 hover:text-red-300 transition-colors"
                  title="Exit fullscreen (ESC)"
                >
                  <X className="w-4 h-4" />
                  Exit Fullscreen
                </button>
              </div>

              {/* Spacer for right side */}
              <div />
            </div>
          )}

          {/* GenericMockup - takes remaining space */}
          <div className={state.isExpanded ? 'flex-1 min-h-0 pt-4' : 'h-full'}>
            {state.currentConfig ? (
              <GenericMockup
                config={state.currentConfig}
                logoUrl={effectiveLogoUrl}
                brandName={brandName || 'Your Brand'}
                onControlsReady={state.handleControlsReady}
                hideControls={!state.isExpanded}
                logoFilter={logoFilter}
                customProductImageUrl={state.currentCustomProduct?.imageUrl}
                externalProcessedLogoUrl={state.processedLogoUrl || undefined}
                onProcessedLogoChange={state.setProcessedLogoUrl}
                savedBrandSettings={state.loadedBrandSettings}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Select a product to preview
              </div>
            )}
          </div>
      </div>

      {/* Export Controls Footer - Hidden when fullscreen */}
      {state.controls && !state.isExpanded && (
        <div className="flex items-center justify-end px-4 py-2 border-t border-zinc-800">
          <MockupControls
            isExporting={state.controls.isExporting}
            showExportMenu={state.controls.showExportMenu}
            onReset={() => {
              state.controls!.handleReset()
              state.clearLoadedMockup()
              // If custom product is selected, go back to default T-shirt
              if (state.currentCustomProduct) {
                state.handleSelectSubCategory('tshirt', 'tshirt')
              }
            }}
            onToggleExportMenu={() => state.controls!.setShowExportMenu(!state.controls!.showExportMenu)}
            onExportPNG={state.controls.handleExportPNG}
            onExportSVG={state.controls.handleExportSVG}
            onExportPDF={state.controls.handleExportPDF}
            onSaveToHistory={async () => {
              await state.handleSaveToHistory()
              // Refresh history dropdown
              historyRefreshRef.current?.()
              // Notify parent to refresh history panel
              onSaveToHistory?.()
            }}
            isSavingToHistory={state.isSavingToHistory}
          />
        </div>
      )}

      {/* Photo Generator Modal */}
      {state.showPhotoGenerator && (
        <MockupPhotoGenerator onClose={() => state.setShowPhotoGenerator(false)} />
      )}

      {/* Add Custom Product Modal */}
      {state.showAddProductModal && (
        <AddCustomProductModal
          onClose={() => state.setShowAddProductModal(false)}
          onAdd={state.handleAddCustomProduct}
          defaultCategory={getParentCategory(state.selectedSubCategoryId)?.id || 'tshirts-tops'}
        />
      )}

      {/* Save Preset Modal */}
      {showSavePresetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Save Preset</h3>
            <label className="block text-sm text-zinc-400 mb-2">Preset Name</label>
            <input
              ref={presetInputRef}
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && presetName.trim()) {
                  const brandSettings = state.controls?.getBrandSettings?.()
                  // Capture a small thumbnail (scaled down to reduce localStorage size)
                  const canvas = await state.controls?.captureCanvas()
                  let thumbnail: string | undefined
                  if (canvas) {
                    // Create a smaller thumbnail (max 150px) to avoid localStorage quota issues
                    const thumbCanvas = document.createElement('canvas')
                    const maxSize = 150
                    const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height)
                    thumbCanvas.width = canvas.width * scale
                    thumbCanvas.height = canvas.height * scale
                    const ctx = thumbCanvas.getContext('2d')
                    ctx?.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
                    thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7) // Use JPEG for smaller size
                  }
                  // Save original logo URL (not the full canvas) for proper restoration
                  state.handleSaveMockup(effectiveLogoUrl || '', presetName.trim(), thumbnail, brandSettings)
                  setShowSavePresetModal(false)
                  setPresetName('')
                } else if (e.key === 'Escape') {
                  setShowSavePresetModal(false)
                }
              }}
              placeholder="Enter preset name..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowSavePresetModal(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (presetName.trim()) {
                    const brandSettings = state.controls?.getBrandSettings?.()
                    // Capture a small thumbnail (scaled down to reduce localStorage size)
                    const canvas = await state.controls?.captureCanvas()
                    let thumbnail: string | undefined
                    if (canvas) {
                      // Create a smaller thumbnail (max 150px) to avoid localStorage quota issues
                      const thumbCanvas = document.createElement('canvas')
                      const maxSize = 150
                      const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height)
                      thumbCanvas.width = canvas.width * scale
                      thumbCanvas.height = canvas.height * scale
                      const ctx = thumbCanvas.getContext('2d')
                      ctx?.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
                      thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7) // Use JPEG for smaller size
                    }
                    // Save original logo URL (not the full canvas) for proper restoration
                    state.handleSaveMockup(effectiveLogoUrl || '', presetName.trim(), thumbnail, brandSettings)
                    setShowSavePresetModal(false)
                    setPresetName('')
                  }
                }}
                disabled={!presetName.trim()}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
