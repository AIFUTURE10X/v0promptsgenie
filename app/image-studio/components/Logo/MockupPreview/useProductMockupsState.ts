"use client"

/**
 * Product Mockups Panel State Hook
 *
 * Manages custom products, selection state, and save-to-history logic.
 * Extracted from ProductMockupsPanel.tsx to keep files under 300 lines.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getMockupConfig, customUploadConfig } from './configs'
import { getSubCategoryById, getParentCategory, DEFAULT_SUB_CATEGORY_ID, DEFAULT_MOCKUP_ID } from './categories'
import type { MockupExportControls, BrandSettings } from './generic'
import type { CustomProduct } from './AddCustomProductModal'
import { getUserId } from '../LogoHistory/useLogoHistoryData'

const CUSTOM_PRODUCTS_KEY = 'image-studio-custom-products'
const SAVED_MOCKUPS_KEY = 'image-studio-saved-mockups'
const MAX_SAVED_MOCKUPS = 10

/** Saved mockup configuration for quick reload */
export interface SavedMockup {
  id: string
  name: string
  logoUrl: string
  processedLogoUrl: string | null
  brandName: string
  productId: string
  subCategoryId: string
  timestamp: number
  thumbnail?: string
  /** Brand text settings (text, font, color, position, etc.) */
  brandSettings?: BrandSettings
}

interface UseProductMockupsStateProps {
  brandName?: string
  onLogoUrlChange?: (url: string) => void
}

export function useProductMockupsState({ brandName, onLogoUrlChange }: UseProductMockupsStateProps) {
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(DEFAULT_SUB_CATEGORY_ID)
  const [selectedMockupId, setSelectedMockupId] = useState<string>(DEFAULT_MOCKUP_ID)
  const [controls, setControls] = useState<MockupExportControls | null>(null)
  const [showPhotoGenerator, setShowPhotoGenerator] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([])
  const [isSavingToHistory, setIsSavingToHistory] = useState(false)
  const [processedLogoUrl, setProcessedLogoUrlInternal] = useState<string | null>(null)
  const [savedMockups, setSavedMockups] = useState<SavedMockup[]>([])
  const [loadedLogoUrl, setLoadedLogoUrl] = useState<string | null>(null)
  const [loadedBrandSettings, setLoadedBrandSettings] = useState<BrandSettings | null>(null)

  // Use ref to always have latest callback - update SYNCHRONOUSLY during render
  // (useEffect updates happen AFTER render, causing stale closure issues)
  const onLogoUrlChangeRef = useRef(onLogoUrlChange)
  // Update ref synchronously on every render to avoid timing issues
  onLogoUrlChangeRef.current = onLogoUrlChange

  // Wrapper that updates state AND notifies parent immediately (no stale closure)
  const setProcessedLogoUrl = useCallback((url: string | null) => {
    console.log('[ProductMockupsState] setProcessedLogoUrl called with:', url?.substring(0, 60))
    setProcessedLogoUrlInternal(url)
    if (url && onLogoUrlChangeRef.current) {
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

  // Load saved mockups from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_MOCKUPS_KEY)
      if (saved) {
        setSavedMockups(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Failed to load saved mockups:', e)
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
    setSelectedSubCategoryId(newProduct.id)
    setSelectedMockupId(newProduct.id)
  }, [customProducts, saveCustomProducts])

  // Remove a custom product
  const handleRemoveCustomProduct = useCallback((productId: string) => {
    const updated = customProducts.filter(p => p.id !== productId)
    saveCustomProducts(updated)
    if (selectedMockupId === productId) {
      setSelectedSubCategoryId(DEFAULT_SUB_CATEGORY_ID)
      setSelectedMockupId(DEFAULT_MOCKUP_ID)
    }
  }, [customProducts, saveCustomProducts, selectedMockupId])

  // Save a mockup to localStorage
  const handleSaveMockup = useCallback(async (logoUrl: string, name: string, thumbnail?: string, brandSettings?: BrandSettings) => {
    console.log('[handleSaveMockup] Called with logoUrl:', logoUrl?.substring(0, 60), 'name:', name)
    console.log('[handleSaveMockup] Current savedMockups count:', savedMockups.length)
    console.log('[handleSaveMockup] Brand settings:', brandSettings)
    const newMockup: SavedMockup = {
      id: `mockup-${Date.now()}`,
      name: name || `Preset ${savedMockups.length + 1}`,
      logoUrl,
      processedLogoUrl,
      brandName: brandName || 'Brand',
      productId: selectedMockupId,
      subCategoryId: selectedSubCategoryId,
      timestamp: Date.now(),
      thumbnail,
      brandSettings,
    }
    console.log('[handleSaveMockup] New mockup created:', newMockup.id)
    // Add to front, limit to MAX_SAVED_MOCKUPS
    const updated = [newMockup, ...savedMockups].slice(0, MAX_SAVED_MOCKUPS)
    console.log('[handleSaveMockup] Updated mockups count:', updated.length)
    setSavedMockups(updated)
    try {
      localStorage.setItem(SAVED_MOCKUPS_KEY, JSON.stringify(updated))
      console.log('[handleSaveMockup] Saved to localStorage successfully')
      toast.success('Mockup saved!')
    } catch (e) {
      console.error('Failed to save mockup:', e)
      toast.error('Failed to save mockup')
    }
  }, [savedMockups, processedLogoUrl, brandName, selectedMockupId, selectedSubCategoryId])

  // Load a saved mockup
  const handleLoadMockup = useCallback((mockup: SavedMockup) => {
    console.log('[handleLoadMockup] Loading mockup:', mockup.name)
    console.log('[handleLoadMockup] Brand settings:', mockup.brandSettings)
    setSelectedSubCategoryId(mockup.subCategoryId)
    setSelectedMockupId(mockup.productId)
    setLoadedLogoUrl(mockup.logoUrl)
    setProcessedLogoUrlInternal(mockup.processedLogoUrl)
    setLoadedBrandSettings(mockup.brandSettings || null)
    if (mockup.processedLogoUrl && onLogoUrlChangeRef.current) {
      onLogoUrlChangeRef.current(mockup.processedLogoUrl)
    }
    toast.success('Mockup loaded!')
  }, [])

  // Delete a saved mockup
  const handleDeleteSavedMockup = useCallback((mockupId: string) => {
    const updated = savedMockups.filter(m => m.id !== mockupId)
    setSavedMockups(updated)
    try {
      localStorage.setItem(SAVED_MOCKUPS_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to delete saved mockup:', e)
    }
  }, [savedMockups])

  // Clear the loaded mockup (called by Reset button)
  const clearLoadedMockup = useCallback(() => {
    setLoadedLogoUrl(null)
    setProcessedLogoUrlInternal(null)
    setLoadedBrandSettings(null)
  }, [])

  // Get product config (handles both built-in and custom)
  const getProductConfig = useCallback((mockupId: string) => {
    const builtIn = getMockupConfig(mockupId)
    if (builtIn) return builtIn
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
      const canvas = await controls.captureCanvas()
      if (!canvas) {
        toast.error('Failed to capture mockup')
        return
      }

      const dataUrl = canvas.toDataURL('image/png')
      const productName = currentConfig?.name || 'Product'

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

  return {
    // Selection state
    selectedSubCategoryId,
    selectedMockupId,
    handleSelectSubCategory,
    getSelectedLabel,

    // Controls
    controls,
    handleControlsReady,

    // Modal states
    showPhotoGenerator,
    setShowPhotoGenerator,
    isExpanded,
    setIsExpanded,
    showAddProductModal,
    setShowAddProductModal,

    // Custom products
    customProducts,
    handleAddCustomProduct,
    handleRemoveCustomProduct,
    currentCustomProduct,

    // Config
    currentConfig,
    getProductConfig,

    // History
    isSavingToHistory,
    handleSaveToHistory,

    // Logo processing
    processedLogoUrl,
    setProcessedLogoUrl,

    // Saved mockups
    savedMockups,
    handleSaveMockup,
    handleLoadMockup,
    handleDeleteSavedMockup,
    loadedLogoUrl,
    setLoadedLogoUrl,
    loadedBrandSettings,
    clearLoadedMockup,
  }
}
