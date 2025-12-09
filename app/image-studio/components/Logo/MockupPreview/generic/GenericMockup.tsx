"use client"

/**
 * Generic Mockup Component
 *
 * Config-driven mockup that works with any product type.
 * State, drag/drop, and export are handled by extracted hooks.
 */

import { useRef, useEffect, useMemo, ComponentType } from 'react'
import { buildGoogleFontsUrl } from '@/app/image-studio/constants/real-fonts'
import { LogoDraggable } from '../LogoDraggable'
import { BrandTextDraggable } from '../BrandTextDraggable'
import { PhotoShape } from '../shapes/PhotoShape'
import { LogoSidebar, BrandSidebar } from '../shared'
import { MockupControls } from '../MockupControls'
import { useGenericDrag } from './useGenericDrag'
import { useGenericExport } from './useGenericExport'
import { useGenericMockupState } from './useGenericMockupState'
import { useTextItemHandlers } from './useTextItemHandlers'
import { useBackgroundRemoval } from './useBackgroundRemoval'
import type { MockupConfig, MockupExportControls, ShapeRendererProps, BrandSettings } from './mockup-types'

interface GenericMockupProps {
  config: MockupConfig
  logoUrl?: string
  brandName?: string
  onExport?: (format: 'png', dataUrl: string) => void
  onControlsReady?: (controls: MockupExportControls) => void
  hideControls?: boolean
  logoFilter?: React.CSSProperties
  customProductImageUrl?: string
  onCustomProductImageUpload?: (url: string) => void
  externalProcessedLogoUrl?: string
  onProcessedLogoChange?: (url: string | null) => void
  /** Saved brand settings to restore when loading a preset */
  savedBrandSettings?: BrandSettings | null
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
  savedBrandSettings,
}: GenericMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // State management hook
  const state = useGenericMockupState({
    config,
    brandName,
    externalProcessedLogoUrl,
    logoUrl,
    customProductImageUrl,
    onProcessedLogoChange,
    savedBrandSettings,
  })

  // Text item handlers
  const textHandlers = useTextItemHandlers({
    textItems: state.textItems,
    setTextItems: state.setTextItems,
    selectedTextId: state.selectedTextId,
    setSelectedTextId: state.setSelectedTextId,
    setEditableBrandName: state.setEditableBrandName,
    setBrandFont: state.setBrandFont,
    setBrandColor: state.setBrandColor,
    setBrandScale: state.setBrandScale,
    setBrandEffect: state.setBrandEffect,
    setBrandRotation: state.setBrandRotation,
    setBrandPosition: state.setBrandPosition,
  })

  // Background removal handler
  const { handleRemoveBackground } = useBackgroundRemoval({
    effectiveLogoUrl: state.effectiveLogoUrl,
    effectiveProductImageUrl: state.effectiveProductImageUrl,
    isRemovingBg: state.isRemovingBg,
    setIsRemovingBg: state.setIsRemovingBg,
    setProcessedLogoUrl: state.setProcessedLogoUrl,
    setProcessedProductUrl: state.setProcessedProductUrl,
    onProcessedLogoChangeRef: state.onProcessedLogoChangeRef,
  })

  // Shape component from config
  const ShapeComponent = config.shapeComponent as ComponentType<ShapeRendererProps>

  // Photo URL computation
  const photoUrl = useMemo(() => {
    if (!config.photoAssets) return null
    const colorPhoto = config.photoAssets.colorMap[state.selectedColor.id]
    const photo = colorPhoto || config.photoAssets.fallbackPhoto
    if (!photo) return null
    return `${config.photoAssets.baseUrl}${photo}`
  }, [config.photoAssets, state.selectedColor.id])

  const usePhotoRendering = config.renderMode === 'photo' && photoUrl && !state.photoLoadFailed

  // Drag hook
  const drag = useGenericDrag({
    containerRef,
    logoPrintArea: config.logoPrintArea,
    textPrintArea: config.textPrintArea,
    logoPosition: state.logoPosition,
    onLogoPositionChange: state.setLogoPosition,
    brandPosition: state.brandPosition,
    onBrandPositionChange: state.setBrandPosition,
    textItems: state.textItems,
    onTextItemsChange: state.setTextItems,
    selectedTextId: state.selectedTextId,
    onSelectedTextIdChange: state.setSelectedTextId,
  })

  // Export hook
  const exportState = useGenericExport({
    mockupConfig: config,
    logoUrl: state.effectiveLogoUrl,
    logoPosition: state.logoPosition,
    logoScale: state.logoScale,
    selectedColor: state.selectedColor,
    showBrandName: state.showBrandName,
    brandName: state.editableBrandName,
    brandFont: state.brandFont,
    brandColor: state.brandColor,
    brandPosition: state.brandPosition,
    brandScale: state.brandScale,
    brandEffect: state.brandEffect,
    brandRotation: state.brandRotation,
    textItems: state.textItems,
    onExport,
    photoUrl: usePhotoRendering ? photoUrl : null,
    view: state.selectedView,
  })

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = buildGoogleFontsUrl()
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  // Pass controls to parent
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady({
        isExporting: exportState.isExporting,
        showExportMenu: exportState.showExportMenu,
        setShowExportMenu: exportState.setShowExportMenu,
        handleReset: state.handleReset,
        handleExportPNG: exportState.handleExportPNG,
        handleExportSVG: exportState.handleExportSVG,
        handleExportPDF: exportState.handleExportPDF,
        captureCanvas: exportState.captureCanvas,
        getBrandSettings: state.getBrandSettings,
      })
    }
  }, [onControlsReady, exportState, state.handleReset, state.getBrandSettings])

  return (
    <div className="h-full flex flex-col overflow-x-hidden">
      <div className="flex flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
        {/* Left Sidebar */}
        <div className="overflow-y-auto shrink-0">
          <LogoSidebar
            productLabel={config.name}
            colors={config.colors}
            selectedColor={state.selectedColor}
            showColorPicker={state.showColorPicker}
            logoScale={state.logoScale}
            onColorSelect={(c) => { state.setSelectedColor(c); state.setShowColorPicker(false) }}
            onToggleColorPicker={() => state.setShowColorPicker(!state.showColorPicker)}
            onScaleIncrease={() => state.setLogoScale(Math.min(2, state.logoScale + 0.1))}
            onScaleDecrease={() => state.setLogoScale(Math.max(0.5, state.logoScale - 0.1))}
            onRemoveBackground={handleRemoveBackground}
            isRemovingBackground={state.isRemovingBg}
            hasLogo={!!state.effectiveLogoUrl || !!state.effectiveProductImageUrl}
            hasMultipleViews={state.hasMultipleViews}
            selectedView={state.selectedView}
            onViewChange={state.setSelectedView}
          />
        </div>

        {/* Center: Mockup Canvas */}
        <div
          ref={containerRef}
          className="relative flex-1 shrink-0 overflow-hidden bg-zinc-900"
          style={{ aspectRatio: config.aspectRatio }}
          onClick={() => state.setSelectedTextId(null)}
        >
          <div className="absolute inset-0">
            {usePhotoRendering ? (
              <PhotoShape
                photoUrl={photoUrl!}
                color={state.selectedColor}
                onError={() => state.setPhotoLoadFailed(true)}
              />
            ) : (
              <ShapeComponent
                color={state.selectedColor}
                view={state.selectedView}
                customImageUrl={state.effectiveProductImageUrl}
                onImageUpload={onCustomProductImageUpload}
              />
            )}
            {state.effectiveLogoUrl && (
              <LogoDraggable
                logoUrl={state.effectiveLogoUrl}
                position={state.logoPosition}
                scale={state.logoScale}
                isDragging={drag.isDragging}
                isDarkShirt={state.selectedColor.textColor === 'light'}
                onDragStart={drag.handleDragStart}
                logoFilter={logoFilter}
              />
            )}
            <BrandTextDraggable
              text={state.editableBrandName}
              font={state.brandFont}
              color={state.brandColor}
              position={state.brandPosition}
              scale={state.brandScale}
              weight={state.brandWeight}
              effect={state.brandEffect}
              rotation={state.brandRotation}
              isDragging={drag.isDraggingBrand}
              isVisible={state.showBrandName && !state.selectedTextId}
              onDragStart={drag.handleBrandDragStart}
              onResize={(scaleX, scaleY) => state.setBrandScale((scaleX + scaleY) / 2)}
            />
            {state.textItems.map(item => (
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
                isVisible={state.showBrandName}
                isSelected={state.selectedTextId === item.id}
                onDragStart={drag.handleBrandDragStart}
                onClick={() => textHandlers.handleSelectText(item.id)}
                onResize={(scaleX, scaleY) => {
                  state.setTextItems(prev => prev.map(t =>
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

        {/* Right Sidebar */}
        <div className="overflow-y-auto overflow-x-hidden shrink-0">
          <BrandSidebar
            showBrandName={state.showBrandName}
            editableBrandName={state.editableBrandName}
            brandFont={state.brandFont}
            brandColor={state.brandColor}
            brandScale={state.brandScale}
            brandEffect={state.brandEffect}
            brandRotation={state.brandRotation}
            brandWeight={state.brandWeight}
            showFontPicker={state.showFontPicker}
            onToggleBrandName={() => state.setShowBrandName(!state.showBrandName)}
            onEditableBrandNameChange={(value) => {
              state.setEditableBrandName(value)
              if (state.selectedTextId) textHandlers.handleUpdateSelectedText({ content: value })
            }}
            onBrandFontChange={(f) => {
              state.setBrandFont(f)
              state.setShowFontPicker(false)
              if (state.selectedTextId) textHandlers.handleUpdateSelectedText({ font: f })
            }}
            onBrandColorChange={(c) => {
              state.setBrandColor(c)
              if (state.selectedTextId) textHandlers.handleUpdateSelectedText({ color: c })
            }}
            onBrandScaleIncrease={() => {
              const newScale = Math.min(8, state.brandScale + 0.1)
              state.setBrandScale(newScale)
              if (state.selectedTextId) textHandlers.handleUpdateSelectedText({ scale: newScale })
            }}
            onBrandScaleDecrease={() => {
              const newScale = Math.max(0.5, state.brandScale - 0.1)
              state.setBrandScale(newScale)
              if (state.selectedTextId) textHandlers.handleUpdateSelectedText({ scale: newScale })
            }}
            onBrandScaleChange={(scale) => {
              const clampedScale = Math.max(0.5, Math.min(8, scale))
              state.setBrandScale(clampedScale)
              if (state.selectedTextId) textHandlers.handleUpdateSelectedText({ scale: clampedScale })
            }}
            onBrandEffectChange={(e) => {
              state.setBrandEffect(e)
              if (state.selectedTextId) textHandlers.handleUpdateSelectedText({ effect: e })
            }}
            onBrandRotationChange={(r) => {
              state.setBrandRotation(r)
              if (state.selectedTextId) textHandlers.handleUpdateSelectedText({ rotation: r })
            }}
            onBrandWeightChange={state.setBrandWeight}
            onToggleFontPicker={() => state.setShowFontPicker(!state.showFontPicker)}
            textItems={state.textItems}
            selectedTextId={state.selectedTextId}
            onAddText={textHandlers.handleAddText}
            onRemoveText={textHandlers.handleRemoveText}
            onSelectText={textHandlers.handleSelectText}
            onUpdateTextContent={textHandlers.handleUpdateTextContent}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      {!hideControls && (
        <>
          <MockupControls
            isExporting={exportState.isExporting}
            showExportMenu={exportState.showExportMenu}
            onReset={state.handleReset}
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
