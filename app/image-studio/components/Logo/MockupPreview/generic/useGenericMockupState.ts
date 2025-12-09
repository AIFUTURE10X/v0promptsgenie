"use client"

/**
 * Generic Mockup State Hook
 *
 * Manages all state for the GenericMockup component.
 * Extracted to keep the main component under 300 lines.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { MockupConfig, ProductColor, Position, TextEffect, TextItem, MockupView, BrandSettings } from './mockup-types'

export interface UseGenericMockupStateConfig {
  config: MockupConfig
  brandName: string
  externalProcessedLogoUrl?: string
  logoUrl?: string
  customProductImageUrl?: string
  onProcessedLogoChange?: (url: string | null) => void
  /** Saved brand settings to restore when loading a preset */
  savedBrandSettings?: BrandSettings | null
}

export function useGenericMockupState({
  config,
  brandName,
  externalProcessedLogoUrl,
  logoUrl,
  customProductImageUrl,
  onProcessedLogoChange,
  savedBrandSettings,
}: UseGenericMockupStateConfig) {
  // Product color
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    config.colors.find(c => c.id === config.defaultColorId) || config.colors[0]
  )
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Logo state
  const [logoPosition, setLogoPosition] = useState<Position>(config.defaultLogoPosition)
  const [logoScale, setLogoScale] = useState(config.defaultLogoScale)

  // Brand text state
  const [showBrandName, setShowBrandName] = useState(true)
  const [editableBrandName, setEditableBrandName] = useState(brandName)
  const [brandPosition, setBrandPosition] = useState<Position>(config.defaultTextPosition)
  const [brandScale, setBrandScale] = useState(config.defaultTextScale)
  const [brandFont, setBrandFont] = useState<string>('montserrat')
  const [brandColor, setBrandColor] = useState<string>('#ffffff')
  const [brandEffect, setBrandEffect] = useState<TextEffect>('none')
  const [brandRotation, setBrandRotation] = useState(0)
  const [brandWeight, setBrandWeight] = useState(400)
  const [showFontPicker, setShowFontPicker] = useState(false)

  // Multiple text items
  const [textItems, setTextItems] = useState<TextItem[]>([])
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)

  // Background removal state
  const [isRemovingBg, setIsRemovingBg] = useState(false)
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | null>(null)
  const [processedProductUrl, setProcessedProductUrl] = useState<string | null>(null)

  // View state (front/back for apparel)
  const [selectedView, setSelectedView] = useState<MockupView>('front')
  const hasMultipleViews = (config.features?.multipleViews?.length ?? 0) > 1

  // Photo URL state
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false)

  // Use ref to always have latest callback - update SYNCHRONOUSLY during render
  // (useEffect updates happen AFTER render, causing stale closure issues)
  const onProcessedLogoChangeRef = useRef(onProcessedLogoChange)
  // Update ref synchronously on every render to avoid timing issues
  onProcessedLogoChangeRef.current = onProcessedLogoChange

  // Reset processed logo when original logo changes
  // BUT don't reset if we have an external processed URL (from parent/lightbox)
  // This prevents clearing the BG-removed state when opening the lightbox
  useEffect(() => {
    if (!externalProcessedLogoUrl) {
      setProcessedLogoUrl(null)
    }
  }, [logoUrl, externalProcessedLogoUrl])

  // Reset processed product when original product changes
  useEffect(() => {
    setProcessedProductUrl(null)
  }, [customProductImageUrl])

  // Reset photo load state when color changes
  useEffect(() => {
    setPhotoLoadFailed(false)
  }, [selectedColor.id])

  // Use external processed URL (from parent), then local processed, then original
  // Priority: externalProcessedLogoUrl > processedLogoUrl > logoUrl
  const effectiveLogoUrl = externalProcessedLogoUrl || processedLogoUrl || logoUrl

  // Debug logging for effectiveLogoUrl computation (helps diagnose lightbox issues)
  console.log('[useGenericMockupState] effectiveLogoUrl computed:', {
    hasExternal: !!externalProcessedLogoUrl,
    hasLocal: !!processedLogoUrl,
    hasOriginal: !!logoUrl,
    using: externalProcessedLogoUrl ? 'EXTERNAL (parent BG-removed)' :
           processedLogoUrl ? 'LOCAL (this component BG-removed)' :
           logoUrl ? 'ORIGINAL (no BG removal)' : 'NONE',
    url: effectiveLogoUrl?.substring(0, 60),
  })

  // Use processed product image if available
  const effectiveProductImageUrl = processedProductUrl || customProductImageUrl

  // Reset handler
  const handleReset = useCallback(() => {
    console.log('[GenericMockup] Reset triggered - resetting all positions and settings')
    setLogoPosition(config.defaultLogoPosition)
    setLogoScale(config.defaultLogoScale)
    setEditableBrandName(brandName)
    setBrandPosition(config.defaultTextPosition)
    setBrandScale(config.defaultTextScale)
    setBrandFont('montserrat')
    setBrandColor('#ffffff')
    setBrandEffect('none')
    setBrandRotation(0)
    setBrandWeight(400)
    setTextItems([])
    setSelectedTextId(null)
    const defaultColor = config.colors.find(c => c.id === config.defaultColorId) || config.colors[0]
    setSelectedColor(defaultColor)
    setPhotoLoadFailed(false)
    setSelectedView('front')
  }, [config, brandName])

  // Get current brand settings for preset saving
  const getBrandSettings = useCallback((): BrandSettings => ({
    editableBrandName,
    brandPosition,
    brandScale,
    brandFont,
    brandColor,
    brandEffect,
    brandRotation,
    brandWeight,
    showBrandName,
    textItems,
  }), [editableBrandName, brandPosition, brandScale, brandFont, brandColor, brandEffect, brandRotation, brandWeight, showBrandName, textItems])

  // Restore brand settings when loading a saved preset
  useEffect(() => {
    if (savedBrandSettings) {
      console.log('[useGenericMockupState] Restoring brand settings from preset:', savedBrandSettings)
      setEditableBrandName(savedBrandSettings.editableBrandName)
      setBrandPosition(savedBrandSettings.brandPosition)
      setBrandScale(savedBrandSettings.brandScale)
      setBrandFont(savedBrandSettings.brandFont)
      setBrandColor(savedBrandSettings.brandColor)
      setBrandEffect(savedBrandSettings.brandEffect)
      setBrandRotation(savedBrandSettings.brandRotation)
      setBrandWeight(savedBrandSettings.brandWeight)
      setShowBrandName(savedBrandSettings.showBrandName)
      setTextItems(savedBrandSettings.textItems || [])
    }
  }, [savedBrandSettings])

  return {
    // Color state
    selectedColor,
    setSelectedColor,
    showColorPicker,
    setShowColorPicker,
    // Logo state
    logoPosition,
    setLogoPosition,
    logoScale,
    setLogoScale,
    // Brand text state
    showBrandName,
    setShowBrandName,
    editableBrandName,
    setEditableBrandName,
    brandPosition,
    setBrandPosition,
    brandScale,
    setBrandScale,
    brandFont,
    setBrandFont,
    brandColor,
    setBrandColor,
    brandEffect,
    setBrandEffect,
    brandRotation,
    setBrandRotation,
    brandWeight,
    setBrandWeight,
    showFontPicker,
    setShowFontPicker,
    // Text items
    textItems,
    setTextItems,
    selectedTextId,
    setSelectedTextId,
    // Background removal
    isRemovingBg,
    setIsRemovingBg,
    processedLogoUrl,
    setProcessedLogoUrl,
    processedProductUrl,
    setProcessedProductUrl,
    // View state
    selectedView,
    setSelectedView,
    hasMultipleViews,
    // Photo state
    photoLoadFailed,
    setPhotoLoadFailed,
    // Computed values
    effectiveLogoUrl,
    effectiveProductImageUrl,
    // Refs
    onProcessedLogoChangeRef,
    // Handlers
    handleReset,
    getBrandSettings,
  }
}
