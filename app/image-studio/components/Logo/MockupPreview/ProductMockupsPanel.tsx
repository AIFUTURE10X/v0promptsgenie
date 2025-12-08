"use client"

/**
 * ProductMockupsPanel Component
 *
 * Mega menu based product mockup selector with two-header layout.
 * Header 1: Exit + MegaMenu + View Larger + Generate Photos
 * Header 2: Selected product label + Upload New Products
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Wand2, Maximize2, Upload, X, Package } from 'lucide-react'
import { toast } from 'sonner'
import { GenericMockup, type MockupExportControls } from './generic'
import { MOCKUP_CONFIGS, getMockupConfig, customUploadConfig } from './configs'
import { MEGA_MENU_CATEGORIES, getSubCategoryById, getParentCategory, DEFAULT_SUB_CATEGORY_ID, DEFAULT_MOCKUP_ID } from './categories'
import { MockupControls } from './MockupControls'
import { MockupPhotoGenerator } from './MockupPhotoGenerator'
import { ProductMockupLightbox } from './ProductMockupLightbox'
import { AddCustomProductModal, type CustomProduct } from './AddCustomProductModal'
import { MegaMenu } from './MegaMenu'
import { getUserId } from '../LogoHistory/useLogoHistoryData'

const CUSTOM_PRODUCTS_KEY = 'image-studio-custom-products'

interface ProductMockupsPanelProps {
  logoUrl?: string
  brandName?: string
  logoFilter?: React.CSSProperties
  onClose?: () => void
  /** Called when logo URL changes (e.g., after background removal) */
  onLogoUrlChange?: (url: string) => void
}

export function ProductMockupsPanel({
  logoUrl,
  brandName,
  logoFilter,
  onClose,
  onLogoUrlChange,
}: ProductMockupsPanelProps) {
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(DEFAULT_SUB_CATEGORY_ID)
  const [selectedMockupId, setSelectedMockupId] = useState<string>(DEFAULT_MOCKUP_ID)
  const [controls, setControls] = useState<MockupExportControls | null>(null)
  const [showPhotoGenerator, setShowPhotoGenerator] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([])
  const [isSavingToHistory, setIsSavingToHistory] = useState(false)
  const [processedLogoUrl, setProcessedLogoUrlInternal] = useState<string | null>(null)

  // Use ref to always have latest callback (avoids stale closure issues)
  const onLogoUrlChangeRef = useRef(onLogoUrlChange)
  useEffect(() => {
    onLogoUrlChangeRef.current = onLogoUrlChange
  }, [onLogoUrlChange])

  // Wrapper that updates state AND notifies parent immediately (no stale closure)
  const setProcessedLogoUrl = useCallback((url: string | null) => {
    console.log('[ProductMockupsPanel] setProcessedLogoUrl called with:', url)
    setProcessedLogoUrlInternal(url)
    if (url && onLogoUrlChangeRef.current) {
      console.log('[ProductMockupsPanel] Calling onLogoUrlChange via ref')
      onLogoUrlChangeRef.current(url)
    }
  }, [])

  // Load custom products from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
      if (saved) {
        setCustomProducts(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load custom products:', e)
    }
  }, [])

  // Save custom products to localStorage
  const saveCustomProducts = useCallback((products: CustomProduct[]) => {
    setCustomProducts(products)
    try {
      localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(products))
    } catch (e) {
      console.error('Failed to save custom products:', e)
    }
  }, [])

  // Add a new custom product
  const handleAddCustomProduct = useCallback((product: Omit<CustomProduct, 'id'>) => {
    const newProduct: CustomProduct = {
      ...product,
      id: `custom-${Date.now()}`,
    }
    saveCustomProducts([...customProducts, newProduct])
    // Select the new custom product
    setSelectedSubCategoryId(newProduct.id)
    setSelectedMockupId(newProduct.id)
  }, [customProducts, saveCustomProducts])

  // Remove a custom product
  const handleRemoveCustomProduct = useCallback((productId: string) => {
    const updated = customProducts.filter(p => p.id !== productId)
    saveCustomProducts(updated)
    // If removed product was selected, reset to default
    if (selectedMockupId === productId) {
      setSelectedSubCategoryId(DEFAULT_SUB_CATEGORY_ID)
      setSelectedMockupId(DEFAULT_MOCKUP_ID)
    }
  }, [customProducts, saveCustomProducts, selectedMockupId])

  // Get product config (handles both built-in and custom)
  const getProductConfig = useCallback((mockupId: string) => {
    // Check built-in configs first
    const builtIn = getMockupConfig(mockupId)
    if (builtIn) return builtIn

    // Check custom products
    const custom = customProducts.find(p => p.id === mockupId)
    if (custom) {
      return { ...customUploadConfig, id: custom.id, name: custom.name }
    }
    return undefined
  }, [customProducts])

  // Get current product config
  const currentConfig = getProductConfig(selectedMockupId)

  // Get current custom product (if selected product is custom)
  const currentCustomProduct = customProducts.find(p => p.id === selectedMockupId)

  // Handle sub-category selection from MegaMenu
  const handleSelectSubCategory = useCallback((subCategoryId: string, mockupId: string) => {
    setSelectedSubCategoryId(subCategoryId)
    setSelectedMockupId(mockupId)
  }, [])

  // Get selected label for Header 2
  const getSelectedLabel = useCallback(() => {
    const subCategory = getSubCategoryById(selectedSubCategoryId)
    if (subCategory) {
      return subCategory.label + (subCategory.hasFrontBack ? ' (Front & Back)' : '')
    }
    // Check custom products
    const custom = customProducts.find(p => p.id === selectedMockupId)
    if (custom) {
      return custom.name
    }
    return 'Select Product'
  }, [selectedSubCategoryId, selectedMockupId, customProducts])

  // Handle controls ready from GenericMockup
  const handleControlsReady = useCallback((newControls: MockupExportControls) => {
    setControls(newControls)
  }, [])

  // Save mockup to history
  const handleSaveToHistory = useCallback(async () => {
    if (!controls || isSavingToHistory) return

    setIsSavingToHistory(true)
    try {
      // Capture the mockup as a canvas
      const canvas = await controls.captureCanvas()
      if (!canvas) {
        toast.error('Failed to capture mockup')
        return
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png')

      // Get product name
      const productName = currentConfig?.name || 'Product'

      // Save to history via API
      const response = await fetch('/api/logo-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getUserId(),
          imageUrl: dataUrl,
          prompt: `${productName} mockup - ${brandName || 'Brand'}`,
          style: 'mockup',
          config: {
            mockupType: selectedMockupId,
            subCategory: selectedSubCategoryId,
            productName,
            brandName: brandName || 'Brand',
          },
        }),
      })

      const data = await response.json()
      if (data.historyItem) {
        toast.success('Saved to history!')
      } else {
        toast.error('Failed to save to history')
      }
    } catch (error) {
      console.error('Failed to save mockup to history:', error)
      toast.error('Failed to save to history')
    } finally {
      setIsSavingToHistory(false)
    }
  }, [controls, isSavingToHistory, currentConfig, brandName, selectedMockupId, selectedSubCategoryId])

  return (
    <div className="flex flex-col h-full">
      {/* Header 1: Exit + MegaMenu + View Larger + Generate Photos */}
      <div className="relative flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
        {/* Exit Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shrink-0"
            title="Exit Products"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* MegaMenu Dropdown */}
        <MegaMenu
          selectedSubCategoryId={selectedSubCategoryId}
          onSelectSubCategory={handleSelectSubCategory}
        />

        {/* View Larger Button - Centered over t-shirt collar */}
        <button
          onClick={() => setShowLightbox(true)}
          className="absolute left-[47%] -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap text-white hover:text-white hover:bg-zinc-700 bg-zinc-800 border border-zinc-700"
          title="View mockup in fullscreen with all settings"
        >
          <Maximize2 className="w-4 h-4" />
          View Larger
        </button>

        {/* Spacer to push Generate Photos to the right */}
        <div className="flex-1" />

        {/* Generate Photos Button */}
        <button
          onClick={() => setShowPhotoGenerator(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
          title="Generate AI product photos for realistic mockups"
        >
          <Wand2 className="w-4 h-4" />
          Generate Photos
        </button>
      </div>

      {/* Header 2: Selected Product Label + Upload New Products (absolutely centered) */}
      <div className="relative flex items-center px-4 py-2 border-b border-zinc-700/50">
        {/* Selected Product Label - Left */}
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-zinc-300">
            Selected: <span className="font-medium text-white">{getSelectedLabel()}</span>
          </span>
        </div>

        {/* Upload New Products Button - Centered over t-shirt collar */}
        <button
          onClick={() => setShowAddProductModal(true)}
          className="absolute left-[47%] -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
          title="Upload your own product photos"
        >
          <Upload className="w-4 h-4" />
          Upload New Products
        </button>
      </div>

      {/* Product Mockup Canvas */}
      <div className="flex-1 overflow-auto relative">
        {currentConfig ? (
          <GenericMockup
            config={currentConfig}
            logoUrl={logoUrl}
            brandName={brandName || 'Your Brand'}
            onControlsReady={handleControlsReady}
            hideControls={true}
            logoFilter={logoFilter}
            customProductImageUrl={currentCustomProduct?.imageUrl}
            externalProcessedLogoUrl={processedLogoUrl || undefined}
            onProcessedLogoChange={setProcessedLogoUrl}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Select a product to preview
          </div>
        )}
      </div>

      {/* Export Controls Footer */}
      {controls && (
        <div className="flex items-center justify-end px-4 py-2 border-t border-zinc-800">
          <MockupControls
            isExporting={controls.isExporting}
            showExportMenu={controls.showExportMenu}
            onReset={controls.handleReset}
            onToggleExportMenu={() => controls.setShowExportMenu(!controls.showExportMenu)}
            onExportPNG={controls.handleExportPNG}
            onExportSVG={controls.handleExportSVG}
            onExportPDF={controls.handleExportPDF}
            onSaveToHistory={handleSaveToHistory}
            isSavingToHistory={isSavingToHistory}
          />
        </div>
      )}

      {/* Photo Generator Modal */}
      {showPhotoGenerator && (
        <MockupPhotoGenerator onClose={() => setShowPhotoGenerator(false)} />
      )}

      {/* Fullscreen Lightbox */}
      <ProductMockupLightbox
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        productId={selectedMockupId}
        logoUrl={logoUrl}
        brandName={brandName}
        logoFilter={logoFilter}
        config={currentConfig}
        customProductImageUrl={currentCustomProduct?.imageUrl}
        processedLogoUrl={processedLogoUrl || undefined}
      />

      {/* Add Custom Product Modal */}
      {showAddProductModal && (
        <AddCustomProductModal
          onClose={() => setShowAddProductModal(false)}
          onAdd={handleAddCustomProduct}
          defaultCategory={getParentCategory(selectedSubCategoryId)?.id || 'tshirts-tops'}
        />
      )}
    </div>
  )
}
