"use client"

/**
 * Generic Mockup Component
 *
 * Config-driven mockup that works with any product type.
 * State management, drag/drop, and export are handled generically.
 */

import { useState, useRef, useEffect, useCallback, useMemo, ComponentType, MutableRefObject } from 'react'
import { Maximize2 } from 'lucide-react'
import { buildGoogleFontsUrl } from '@/app/image-studio/constants/real-fonts'
import { LogoDraggable } from '../LogoDraggable'
import { BrandTextDraggable } from '../BrandTextDraggable'
import { PhotoShape } from '../shapes/PhotoShape'
import { LogoSidebar, BrandSidebar } from '../shared'
import { MockupControls } from '../MockupControls'
import { useGenericDrag } from './useGenericDrag'
import { useGenericExport } from './useGenericExport'
import type { MockupConfig, ProductColor, Position, TextEffect, TextItem, MockupExportControls, ShapeRendererProps, MockupView } from './mockup-types'
import { createTextItem } from '../text-effects-config'

interface GenericMockupProps {
  /** Mockup configuration */
  config: MockupConfig
  /** Logo image URL (optional - shows blank product if not provided) */
  logoUrl?: string
  /** Initial brand name */
  brandName?: string
  /** Callback after export */
  onExport?: (format: 'png', dataUrl: string) => void
  /** Callback when controls are ready (for parent integration) */
  onControlsReady?: (controls: MockupExportControls) => void
  /** Hide bottom controls (parent handles them) */
  hideControls?: boolean
  /** CSS filter to apply to the logo */
  logoFilter?: React.CSSProperties
  /** Custom product image URL (for custom-upload product type) */
  customProductImageUrl?: string
  /** Callback when custom product image is uploaded */
  onCustomProductImageUpload?: (url: string) => void
  /** Pre-processed logo URL (already has BG removed) - allows sharing across instances */
  externalProcessedLogoUrl?: string
  /** Callback when logo BG is removed - allows parent to track processed URL */
  onProcessedLogoChange?: (url: string | null) => void
}

export function GenericMockup({
  config,
  logoUrl,
  brandName = 'Brand',
  onExport,
  onControlsReady,
  hideControls = false,
  logoFilter,
  customProductImageUrl,
  onCustomProductImageUpload,
  externalProcessedLogoUrl,
  onProcessedLogoChange,
}: GenericMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Use ref to always have latest callback (avoids stale closure in useCallback)
  const onProcessedLogoChangeRef = useRef(onProcessedLogoChange)
  useEffect(() => {
    onProcessedLogoChangeRef.current = onProcessedLogoChange
  }, [onProcessedLogoChange])

  // Reset processed logo when original logo changes
  useEffect(() => {
    setProcessedLogoUrl(null)
  }, [logoUrl])

  // Reset processed product when original product changes
  useEffect(() => {
    setProcessedProductUrl(null)
  }, [customProductImageUrl])

  // Use external processed URL (from parent), then local processed, then original
  const effectiveLogoUrl = externalProcessedLogoUrl || processedLogoUrl || logoUrl

  // Use processed product image if available
  const effectiveProductImageUrl = processedProductUrl || customProductImageUrl

  // Shape component from config
  const ShapeComponent = config.shapeComponent as ComponentType<ShapeRendererProps>

  // Photo URL computation (for photo-based rendering)
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false)
  const photoUrl = useMemo(() => {
    if (!config.photoAssets) return null
    const colorPhoto = config.photoAssets.colorMap[selectedColor.id]
    const photo = colorPhoto || config.photoAssets.fallbackPhoto
    if (!photo) return null
    return `${config.photoAssets.baseUrl}${photo}`
  }, [config.photoAssets, selectedColor.id])

  // Determine render mode: photo (if available and not failed) or svg
  const usePhotoRendering = config.renderMode === 'photo' && photoUrl && !photoLoadFailed

  // Reset photo load state when color changes
  useEffect(() => {
    setPhotoLoadFailed(false)
  }, [selectedColor.id])

  // Drag hook
  const drag = useGenericDrag({
    containerRef,
    logoPrintArea: config.logoPrintArea,
    textPrintArea: config.textPrintArea,
    logoPosition,
    onLogoPositionChange: setLogoPosition,
    brandPosition,
    onBrandPositionChange: setBrandPosition,
    textItems,
    onTextItemsChange: setTextItems,
    selectedTextId,
    onSelectedTextIdChange: setSelectedTextId,
  })

  // Export hook
  const exportState = useGenericExport({
    mockupConfig: config,
    logoUrl: effectiveLogoUrl,
    logoPosition,
    logoScale,
    selectedColor,
    showBrandName,
    brandName: editableBrandName,
    brandFont,
    brandColor,
    brandPosition,
    brandScale,
    brandEffect,
    brandRotation,
    textItems,
    onExport,
    // Photo rendering support
    photoUrl: usePhotoRendering ? photoUrl : null,
    // View support
    view: selectedView,
  })

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = buildGoogleFontsUrl()
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  // Reset handler
  const handleReset = useCallback(() => {
    console.log('[GenericMockup] Reset triggered - resetting all positions and settings')
    // Reset logo position and scale
    setLogoPosition(config.defaultLogoPosition)
    setLogoScale(config.defaultLogoScale)
    // Reset brand text (including the editable name)
    setEditableBrandName(brandName)
    setBrandPosition(config.defaultTextPosition)
    setBrandScale(config.defaultTextScale)
    setBrandFont('montserrat')
    setBrandColor('#ffffff')
    setBrandEffect('none')
    setBrandRotation(0)
    setBrandWeight(400)
    // Reset additional text items
    setTextItems([])
    setSelectedTextId(null)
    // Reset color to default
    const defaultColor = config.colors.find(c => c.id === config.defaultColorId) || config.colors[0]
    setSelectedColor(defaultColor)
    // Reset photo load state
    setPhotoLoadFailed(false)
    // Reset view to front
    setSelectedView('front')
  }, [config, brandName])

  // Text item handlers
  const handleAddText = useCallback(() => {
    const newItem = createTextItem({
      content: `Text ${textItems.length + 1}`,
      position: { x: 50, y: 65 + (textItems.length * 8) % 30 },
    })
    setTextItems(prev => [...prev, newItem])
    setSelectedTextId(newItem.id)
  }, [textItems.length])

  const handleRemoveText = useCallback((id: string) => {
    setTextItems(prev => prev.filter(item => item.id !== id))
    if (selectedTextId === id) setSelectedTextId(null)
  }, [selectedTextId])

  const handleSelectText = useCallback((id: string) => {
    setSelectedTextId(id)
    const item = textItems.find(t => t.id === id)
    if (item) {
      setEditableBrandName(item.content)
      setBrandFont(item.font)
      setBrandColor(item.color)
      setBrandScale(item.scale)
      setBrandEffect(item.effect)
      setBrandRotation(item.rotation)
      setBrandPosition(item.position)
    }
  }, [textItems])

  const handleUpdateSelectedText = useCallback((updates: Partial<TextItem>) => {
    if (!selectedTextId) return
    setTextItems(prev => prev.map(item =>
      item.id === selectedTextId ? { ...item, ...updates } : item
    ))
  }, [selectedTextId])

  const handleUpdateTextContent = useCallback((id: string, content: string) => {
    setTextItems(prev => prev.map(item =>
      item.id === id ? { ...item, content } : item
    ))
  }, [])

  // Remove background from logo or custom product image
  const handleRemoveBackground = useCallback(async () => {
    // Determine which image to process - logo first, then custom product
    const imageToProcess = effectiveLogoUrl || effectiveProductImageUrl
    const isProcessingProduct = !effectiveLogoUrl && !!effectiveProductImageUrl

    if (!imageToProcess || isRemovingBg) return

    setIsRemovingBg(true)
    try {
      // Fetch the image
      const response = await fetch(imageToProcess)
      const blob = await response.blob()
      const file = new File([blob], 'image.png', { type: 'image/png' })

      // Call the API with Replicate method
      const formData = new FormData()
      formData.append('image', file)
      formData.append('bgRemovalMethod', 'replicate')

      const result = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      })

      const data = await result.json()
      if (data.success && data.image) {
        console.log('[GenericMockup] Background removal succeeded, new URL:', data.image?.substring(0, 50))
        if (isProcessingProduct) {
          setProcessedProductUrl(data.image)
        } else {
          setProcessedLogoUrl(data.image)
          // Notify parent via ref (avoids stale closure)
          console.log('[GenericMockup] Calling onProcessedLogoChangeRef.current')
          onProcessedLogoChangeRef.current?.(data.image)
        }
      } else {
        console.error('[GenericMockup] Background removal failed:', data.error)
      }
    } catch (error) {
      console.error('[GenericMockup] Background removal error:', error)
    } finally {
      setIsRemovingBg(false)
    }
  }, [effectiveLogoUrl, effectiveProductImageUrl, isRemovingBg])

  // Pass controls to parent
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady({
        isExporting: exportState.isExporting,
        showExportMenu: exportState.showExportMenu,
        setShowExportMenu: exportState.setShowExportMenu,
        handleReset,
        handleExportPNG: exportState.handleExportPNG,
        handleExportSVG: exportState.handleExportSVG,
        handleExportPDF: exportState.handleExportPDF,
        captureCanvas: exportState.captureCanvas,
      })
    }
  }, [onControlsReady, exportState, handleReset])

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - scrollable */}
        <div className="overflow-y-auto shrink-0">
          <LogoSidebar
            productLabel={config.name}
            colors={config.colors}
            selectedColor={selectedColor}
            showColorPicker={showColorPicker}
            logoScale={logoScale}
            onColorSelect={(c) => { setSelectedColor(c); setShowColorPicker(false) }}
            onToggleColorPicker={() => setShowColorPicker(!showColorPicker)}
            onScaleIncrease={() => setLogoScale(Math.min(2, logoScale + 0.1))}
            onScaleDecrease={() => setLogoScale(Math.max(0.5, logoScale - 0.1))}
            onRemoveBackground={handleRemoveBackground}
            isRemovingBackground={isRemovingBg}
            hasLogo={!!effectiveLogoUrl || !!effectiveProductImageUrl}
            hasMultipleViews={hasMultipleViews}
            selectedView={selectedView}
            onViewChange={setSelectedView}
          />
        </div>

        {/* Center: Mockup Canvas */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden bg-zinc-900"
          style={{ aspectRatio: config.aspectRatio }}
          onClick={() => setSelectedTextId(null)}
        >
          <div className="absolute inset-0">
            {/* Render photo or SVG shape based on config and availability */}
            {usePhotoRendering ? (
              <PhotoShape
                photoUrl={photoUrl!}
                color={selectedColor}
                onError={() => setPhotoLoadFailed(true)}
              />
            ) : (
              <ShapeComponent
                color={selectedColor}
                view={selectedView}
                customImageUrl={effectiveProductImageUrl}
                onImageUpload={onCustomProductImageUpload}
              />
            )}
            {effectiveLogoUrl && (
              <LogoDraggable
                logoUrl={effectiveLogoUrl}
                position={logoPosition}
                scale={logoScale}
                isDragging={drag.isDragging}
                isDarkShirt={selectedColor.textColor === 'light'}
                onDragStart={drag.handleDragStart}
                logoFilter={logoFilter}
              />
            )}
            <BrandTextDraggable
              text={editableBrandName}
              font={brandFont}
              color={brandColor}
              position={brandPosition}
              scale={brandScale}
              weight={brandWeight}
              effect={brandEffect}
              rotation={brandRotation}
              isDragging={drag.isDraggingBrand}
              isVisible={showBrandName && !selectedTextId}
              onDragStart={drag.handleBrandDragStart}
              onResize={(scaleX, scaleY) => {
                setBrandScale((scaleX + scaleY) / 2)
              }}
            />
            {textItems.map(item => (
              <BrandTextDraggable
                key={item.id}
                id={item.id}
                text={item.content}
                font={item.font}
                color={item.color}
                position={item.position}
                scale={item.scale}
                scaleX={item.scaleX}
                scaleY={item.scaleY}
                effect={item.effect}
                rotation={item.rotation}
                isDragging={drag.isDraggingBrand && drag.draggingTextId === item.id}
                isVisible={showBrandName}
                isSelected={selectedTextId === item.id}
                onDragStart={drag.handleBrandDragStart}
                onClick={() => handleSelectText(item.id)}
                onResize={(scaleX, scaleY) => {
                  setTextItems(prev => prev.map(t =>
                    t.id === item.id ? { ...t, scaleX, scaleY, scale: (scaleX + scaleY) / 2 } : t
                  ))
                }}
              />
            ))}
            {/* Print area guide */}
            <div
              className="absolute border border-dashed border-purple-500/30 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
              style={{
                top: `${config.logoPrintArea.top}%`,
                left: `${config.logoPrintArea.left}%`,
                width: `${config.logoPrintArea.width}%`,
                height: `${config.logoPrintArea.height}%`,
              }}
            />
          </div>
        </div>

        {/* Right Sidebar - scrollable */}
        <div className="overflow-y-auto shrink-0">
          <BrandSidebar
          showBrandName={showBrandName}
          editableBrandName={editableBrandName}
          brandFont={brandFont}
          brandColor={brandColor}
          brandScale={brandScale}
          brandEffect={brandEffect}
          brandRotation={brandRotation}
          brandWeight={brandWeight}
          showFontPicker={showFontPicker}
          onToggleBrandName={() => setShowBrandName(!showBrandName)}
          onEditableBrandNameChange={(value) => {
            setEditableBrandName(value)
            if (selectedTextId) handleUpdateSelectedText({ content: value })
          }}
          onBrandFontChange={(f) => {
            setBrandFont(f)
            setShowFontPicker(false)
            if (selectedTextId) handleUpdateSelectedText({ font: f })
          }}
          onBrandColorChange={(c) => {
            setBrandColor(c)
            if (selectedTextId) handleUpdateSelectedText({ color: c })
          }}
          onBrandScaleIncrease={() => {
            const newScale = Math.min(8, brandScale + 0.1)
            setBrandScale(newScale)
            if (selectedTextId) handleUpdateSelectedText({ scale: newScale })
          }}
          onBrandScaleDecrease={() => {
            const newScale = Math.max(0.5, brandScale - 0.1)
            setBrandScale(newScale)
            if (selectedTextId) handleUpdateSelectedText({ scale: newScale })
          }}
          onBrandScaleChange={(scale) => {
            const clampedScale = Math.max(0.5, Math.min(8, scale))
            setBrandScale(clampedScale)
            if (selectedTextId) handleUpdateSelectedText({ scale: clampedScale })
          }}
          onBrandEffectChange={(e) => {
            setBrandEffect(e)
            if (selectedTextId) handleUpdateSelectedText({ effect: e })
          }}
          onBrandRotationChange={(r) => {
            setBrandRotation(r)
            if (selectedTextId) handleUpdateSelectedText({ rotation: r })
          }}
          onBrandWeightChange={(w) => {
            setBrandWeight(w)
          }}
          onToggleFontPicker={() => setShowFontPicker(!showFontPicker)}
          textItems={textItems}
          selectedTextId={selectedTextId}
          onAddText={handleAddText}
          onRemoveText={handleRemoveText}
          onSelectText={handleSelectText}
          onUpdateTextContent={handleUpdateTextContent}
        />
        </div>
      </div>

      {/* Bottom Controls */}
      {!hideControls && (
        <>
          <MockupControls
            isExporting={exportState.isExporting}
            showExportMenu={exportState.showExportMenu}
            onReset={handleReset}
            onToggleExportMenu={() => exportState.setShowExportMenu(!exportState.showExportMenu)}
            onExportPNG={exportState.handleExportPNG}
            onExportSVG={exportState.handleExportSVG}
            onExportPDF={exportState.handleExportPDF}
            showChangeButton={!!customProductImageUrl && !!onCustomProductImageUpload}
            onChangeProductImage={onCustomProductImageUpload}
          />
          <p className="text-[10px] text-zinc-500 text-center">
            Drag logo or brand to reposition | Use sidebar controls to resize
          </p>
        </>
      )}
    </div>
  )
}
