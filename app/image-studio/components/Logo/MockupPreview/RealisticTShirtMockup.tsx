"use client"

/**
 * Realistic T-Shirt Mockup Component
 * Composes sub-components for mockup display, drag, and export
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Maximize2 } from 'lucide-react'
import { TSHIRT_COLORS, type TShirtColor } from './tshirt-assets'
import { buildGoogleFontsUrl } from '@/app/image-studio/constants/real-fonts'
import { TShirtCanvas } from './TShirtCanvas'
import { LogoDraggable } from './LogoDraggable'
import { BrandTextDraggable } from './BrandTextDraggable'
import { LogoSidebar, BrandSidebar } from './MockupSidebars'
import { MockupControls } from './MockupControls'
import { useMockupExport } from './useMockupExport'
import { useTShirtDrag, PRINT_AREA } from './useTShirtDrag'
import { TShirtLightbox } from './TShirtLightbox'
import { type TextEffect, type TextItem, createTextItem } from './text-effects-config'

export interface MockupExportControls {
  isExporting: boolean
  showExportMenu: boolean
  setShowExportMenu: (show: boolean) => void
  handleExportPNG: () => Promise<void>
  handleExportSVG: () => Promise<void>
  handleExportPDF: () => Promise<void>
  handleReset: () => void
}

interface RealisticTShirtMockupProps {
  logoUrl: string
  brandName?: string
  onExport?: (format: 'png', dataUrl: string) => void
  onControlsReady?: (controls: MockupExportControls) => void
  hideControls?: boolean
}

export function RealisticTShirtMockup({ logoUrl, brandName = 'Brand', onExport, onControlsReady, hideControls = false }: RealisticTShirtMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  // T-shirt color
  const [selectedColor, setSelectedColor] = useState<TShirtColor>(TSHIRT_COLORS[0])
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Logo state
  const [logoPosition, setLogoPosition] = useState({ x: 50, y: 35 })
  const [logoScale, setLogoScale] = useState(1)

  // Brand state
  const [showBrandName, setShowBrandName] = useState(true)
  const [editableBrandName, setEditableBrandName] = useState(brandName)
  const [isEditingName, setIsEditingName] = useState(false)
  const [brandPosition, setBrandPosition] = useState({ x: 50, y: 78 })
  const [brandScale, setBrandScale] = useState(1)
  const [brandFont, setBrandFont] = useState<string>('montserrat')
  const [brandColor, setBrandColor] = useState<string>('#ffffff')
  const [brandEffect, setBrandEffect] = useState<TextEffect>('none')
  const [brandRotation, setBrandRotation] = useState(0)
  const [brandWeight, setBrandWeight] = useState(400)
  const [showFontPicker, setShowFontPicker] = useState(false)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showEffectPicker, setShowEffectPicker] = useState(false)

  // Multiple text items state
  const [textItems, setTextItems] = useState<TextItem[]>([])
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)

  // Lightbox state
  const [showLightbox, setShowLightbox] = useState(false)

  // Drag hook
  const { isDragging, isDraggingBrand, draggingTextId, handleDragStart, handleBrandDragStart } = useTShirtDrag({
    containerRef,
    logoPosition, onLogoPositionChange: setLogoPosition,
    brandPosition, onBrandPositionChange: setBrandPosition,
    textItems, onTextItemsChange: setTextItems,
    selectedTextId, onSelectedTextIdChange: setSelectedTextId,
  })

  // Export hook
  const exportState = useMockupExport({
    logoUrl, logoPosition, logoScale, selectedColor,
    showBrandName, editableBrandName, brandFont, brandColor, brandPosition, brandScale,
    brandEffect, brandRotation, textItems, onExport,
  })

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = buildGoogleFontsUrl()
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  // ============ Reset ============
  const handleReset = () => {
    setLogoPosition({ x: 50, y: 35 })
    setLogoScale(1)
    setBrandPosition({ x: 50, y: 78 })
    setBrandScale(1)
    setBrandFont('montserrat')
    setBrandColor('#ffffff')
    setBrandEffect('none')
    setBrandRotation(0)
    setBrandWeight(400)
    setTextItems([])
    setSelectedTextId(null)
  }

  // ============ Multiple Text Handlers ============
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

  // Pass controls to parent if requested
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady({
        isExporting: exportState.isExporting,
        showExportMenu: exportState.showExportMenu,
        setShowExportMenu: exportState.setShowExportMenu,
        handleExportPNG: exportState.handleExportPNG,
        handleExportSVG: exportState.handleExportSVG,
        handleExportPDF: exportState.handleExportPDF,
        handleReset,
      })
    }
  }, [onControlsReady, exportState.isExporting, exportState.showExportMenu, exportState.setShowExportMenu, exportState.handleExportPNG, exportState.handleExportSVG, exportState.handleExportPDF, handleReset])

  return (
    <div>
      <div className="flex">
        {/* Left Sidebar */}
        <LogoSidebar
          selectedColor={selectedColor}
          showColorPicker={showColorPicker}
          logoScale={logoScale}
          onColorSelect={(c) => { setSelectedColor(c); setShowColorPicker(false) }}
          onToggleColorPicker={() => setShowColorPicker(!showColorPicker)}
          onScaleIncrease={() => setLogoScale(Math.min(2, logoScale + 0.1))}
          onScaleDecrease={() => setLogoScale(Math.max(0.5, logoScale - 0.1))}
        />

        {/* Center: Mockup */}
        <div
          ref={containerRef}
          className="relative flex-1 aspect-square overflow-hidden bg-zinc-900"
          onClick={() => setSelectedTextId(null)}
        >
          {/* Expand Button - Opens Lightbox */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowLightbox(true) }}
            className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-purple-600/90 text-white hover:bg-purple-500 transition-colors shadow-lg"
            title="Expand to fullscreen with zoom"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-[10px] font-medium">Zoom</span>
          </button>
          <div className="absolute inset-0">
            <TShirtCanvas color={selectedColor} />
            <LogoDraggable
              ref={logoRef}
              logoUrl={logoUrl}
              position={logoPosition}
              scale={logoScale}
              isDragging={isDragging}
              isDarkShirt={selectedColor.textColor === 'light'}
              onDragStart={handleDragStart}
            />
            <BrandTextDraggable
              text={editableBrandName}
              font={brandFont}
              color={brandColor}
              position={brandPosition}
              scale={brandScale}
              weight={brandWeight}
              effect={brandEffect}
              rotation={brandRotation}
              isDragging={isDraggingBrand}
              isVisible={showBrandName && !selectedTextId}
              onDragStart={handleBrandDragStart}
              onResize={(scaleX, scaleY) => {
                setBrandScale((scaleX + scaleY) / 2)
              }}
            />
            {/* Render multiple text items */}
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
                isDragging={isDraggingBrand && draggingTextId === item.id}
                isVisible={showBrandName}
                isSelected={selectedTextId === item.id}
                onDragStart={handleBrandDragStart}
                onClick={() => handleSelectText(item.id)}
                onResize={(scaleX, scaleY) => {
                  setTextItems(prev => prev.map(t =>
                    t.id === item.id ? { ...t, scaleX, scaleY, scale: (scaleX + scaleY) / 2 } : t
                  ))
                }}
              />
            ))}
            <div
              className="absolute border border-dashed border-purple-500/30 rounded pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
              style={{ top: `${PRINT_AREA.top}%`, left: `${PRINT_AREA.left}%`, width: `${PRINT_AREA.width}%`, height: `${PRINT_AREA.height}%` }}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <BrandSidebar
          showBrandName={showBrandName}
          editableBrandName={editableBrandName}
          isEditingName={isEditingName}
          brandFont={brandFont}
          brandColor={brandColor}
          brandScale={brandScale}
          brandEffect={brandEffect}
          brandRotation={brandRotation}
          brandWeight={brandWeight}
          showFontPicker={showFontPicker}
          showTextColorPicker={showTextColorPicker}
          showEffectPicker={showEffectPicker}
          onToggleBrandName={() => setShowBrandName(!showBrandName)}
          onEditableBrandNameChange={(value) => {
            setEditableBrandName(value)
            if (selectedTextId) handleUpdateSelectedText({ content: value })
          }}
          onStartEditingName={() => setIsEditingName(true)}
          onStopEditingName={() => setIsEditingName(false)}
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
            setShowEffectPicker(false)
            if (selectedTextId) handleUpdateSelectedText({ effect: e })
          }}
          onBrandRotationChange={(r) => {
            setBrandRotation(r)
            if (selectedTextId) handleUpdateSelectedText({ rotation: r })
          }}
          onBrandWeightChange={(w) => {
            setBrandWeight(w)
          }}
          onToggleFontPicker={() => { setShowFontPicker(!showFontPicker); setShowTextColorPicker(false); setShowEffectPicker(false) }}
          onToggleTextColorPicker={() => { setShowTextColorPicker(!showTextColorPicker); setShowFontPicker(false); setShowEffectPicker(false) }}
          onToggleEffectPicker={() => { setShowEffectPicker(!showEffectPicker); setShowFontPicker(false); setShowTextColorPicker(false) }}
          textItems={textItems}
          selectedTextId={selectedTextId}
          onAddText={handleAddText}
          onRemoveText={handleRemoveText}
          onSelectText={handleSelectText}
          onUpdateTextContent={handleUpdateTextContent}
        />
      </div>

      {/* Bottom Controls - hidden when parent handles them */}
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
          />
          <p className="text-[10px] text-zinc-500 text-center">
            Drag logo or brand to reposition | Use sidebar controls to resize
          </p>
        </>
      )}

      {/* Lightbox */}
      <TShirtLightbox
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        logoUrl={logoUrl}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        logoPosition={logoPosition}
        onLogoPositionChange={setLogoPosition}
        logoScale={logoScale}
        onLogoScaleChange={setLogoScale}
        showBrandName={showBrandName}
        onToggleBrandName={() => setShowBrandName(!showBrandName)}
        editableBrandName={editableBrandName}
        onEditableBrandNameChange={setEditableBrandName}
        brandFont={brandFont}
        onBrandFontChange={setBrandFont}
        brandColor={brandColor}
        onBrandColorChange={setBrandColor}
        brandPosition={brandPosition}
        onBrandPositionChange={setBrandPosition}
        brandScale={brandScale}
        onBrandScaleChange={setBrandScale}
        brandEffect={brandEffect}
        onBrandEffectChange={setBrandEffect}
        brandRotation={brandRotation}
        onBrandRotationChange={setBrandRotation}
        brandWeight={brandWeight}
        onBrandWeightChange={setBrandWeight}
        textItems={textItems}
        onTextItemsChange={setTextItems}
        selectedTextId={selectedTextId}
        onSelectedTextIdChange={setSelectedTextId}
      />
    </div>
  )
}
