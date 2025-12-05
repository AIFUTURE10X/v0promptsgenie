"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva'
import Konva from 'konva'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Type,
  Download,
  X,
  Plus,
  Trash2,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'
import { LOGO_FONTS, loadGoogleFont, waitForFont } from '@/lib/font-loader'

const GOLD_GRADIENT = "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)"

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  fill: string
  fontStyle: 'normal' | 'bold'
  align: 'left' | 'center' | 'right'
}

interface TextOverlayEditorProps {
  logoUrl: string
  onClose: () => void
  onExport: (dataUrl: string) => void
}

const CANVAS_SIZE = 400

export function TextOverlayEditor({ logoUrl, onClose, onExport }: TextOverlayEditorProps) {
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  // Load logo image
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = logoUrl
    img.onload = () => setLogoImage(img)
  }, [logoUrl])

  // Preload common fonts
  useEffect(() => {
    const preloadFonts = async () => {
      await Promise.all([
        loadGoogleFont('Montserrat'),
        loadGoogleFont('Bebas Neue'),
        loadGoogleFont('Playfair Display'),
        loadGoogleFont('Poppins'),
      ])
      setFontsLoaded(true)
    }
    preloadFonts()
  }, [])

  // Update transformer when selection changes
  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`)
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode])
        transformerRef.current.getLayer()?.batchDraw()
      }
    }
  }, [selectedId])

  const addTextElement = useCallback(() => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: 'Your Text',
      x: CANVAS_SIZE / 2 - 50,
      y: CANVAS_SIZE - 80,
      fontSize: 32,
      fontFamily: 'Montserrat',
      fill: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }
    setTextElements(prev => [...prev, newElement])
    setSelectedId(newElement.id)
  }, [])

  const updateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements(prev =>
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    )
  }, [])

  const deleteTextElement = useCallback((id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  const handleFontChange = async (fontFamily: string) => {
    if (selectedId) {
      await waitForFont(fontFamily, selectedElement?.fontSize || 32)
      updateTextElement(selectedId, { fontFamily })
    }
  }

  const handleExport = useCallback(() => {
    if (stageRef.current) {
      // Deselect to hide transformer
      setSelectedId(null)

      // Wait a frame for transformer to hide
      setTimeout(() => {
        const dataUrl = stageRef.current?.toDataURL({ pixelRatio: 2 })
        if (dataUrl) {
          onExport(dataUrl)
        }
      }, 50)
    }
  }, [onExport])

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Click on stage background deselects
    if (e.target === e.target.getStage()) {
      setSelectedId(null)
    }
  }

  const selectedElement = textElements.find(el => el.id === selectedId)

  return (
    <Card className="bg-zinc-900/95 border border-zinc-800 p-4 w-full max-w-lg">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-[#dbb56e]" />
            <h3 className="text-sm font-semibold text-white">Add Text to Logo</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Canvas Area */}
        <div
          className="rounded-lg overflow-hidden border border-zinc-700 mx-auto"
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundImage: `
              linear-gradient(45deg, #404040 25%, transparent 25%),
              linear-gradient(-45deg, #404040 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #404040 75%),
              linear-gradient(-45deg, transparent 75%, #404040 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            backgroundColor: '#2a2a2a'
          }}
        >
          <Stage
            ref={stageRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onClick={handleStageClick}
          >
            <Layer>
              {/* Logo Image */}
              {logoImage && (
                <KonvaImage
                  image={logoImage}
                  x={(CANVAS_SIZE - Math.min(logoImage.width, CANVAS_SIZE * 0.8)) / 2}
                  y={(CANVAS_SIZE - Math.min(logoImage.height, CANVAS_SIZE * 0.8)) / 2 - 20}
                  width={Math.min(logoImage.width, CANVAS_SIZE * 0.8)}
                  height={Math.min(logoImage.height, CANVAS_SIZE * 0.8)}
                />
              )}

              {/* Text Elements */}
              {textElements.map((el) => (
                <Text
                  key={el.id}
                  id={el.id}
                  text={el.text}
                  x={el.x}
                  y={el.y}
                  fontSize={el.fontSize}
                  fontFamily={el.fontFamily}
                  fill={el.fill}
                  fontStyle={el.fontStyle}
                  align={el.align}
                  draggable
                  onClick={() => setSelectedId(el.id)}
                  onTap={() => setSelectedId(el.id)}
                  onDragEnd={(e) => {
                    updateTextElement(el.id, {
                      x: e.target.x(),
                      y: e.target.y()
                    })
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target
                    const scaleX = node.scaleX()
                    updateTextElement(el.id, {
                      x: node.x(),
                      y: node.y(),
                      fontSize: Math.round(el.fontSize * scaleX)
                    })
                    node.scaleX(1)
                    node.scaleY(1)
                  }}
                />
              ))}

              {/* Transformer */}
              <Transformer
                ref={transformerRef}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 20 || newBox.height < 20) {
                    return oldBox
                  }
                  return newBox
                }}
              />
            </Layer>
          </Stage>
        </div>

        {/* Add Text Button */}
        <Button
          onClick={addTextElement}
          variant="outline"
          className="w-full h-8 text-xs border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Text Element
        </Button>

        {/* Text Controls - Show when text is selected */}
        {selectedElement && (
          <div className="space-y-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            {/* Text Input */}
            <input
              type="text"
              value={selectedElement.text}
              onChange={(e) => updateTextElement(selectedId!, { text: e.target.value })}
              className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-[#c99850]"
              placeholder="Enter text..."
            />

            {/* Font Family */}
            <select
              value={selectedElement.fontFamily}
              onChange={(e) => handleFontChange(e.target.value)}
              className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-[#c99850]"
            >
              {LOGO_FONTS.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name}
                </option>
              ))}
            </select>

            {/* Size and Color Row */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 block mb-0.5">Size</label>
                <input
                  type="range"
                  min="12"
                  max="120"
                  value={selectedElement.fontSize}
                  onChange={(e) => updateTextElement(selectedId!, { fontSize: parseInt(e.target.value) })}
                  className="w-full accent-[#c99850]"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-0.5">Color</label>
                <input
                  type="color"
                  value={selectedElement.fill}
                  onChange={(e) => updateTextElement(selectedId!, { fill: e.target.value })}
                  className="w-8 h-7 rounded cursor-pointer bg-transparent"
                />
              </div>
            </div>

            {/* Style Buttons */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateTextElement(selectedId!, {
                  fontStyle: selectedElement.fontStyle === 'bold' ? 'normal' : 'bold'
                })}
                className={`h-7 px-2 ${selectedElement.fontStyle === 'bold' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
              >
                <Bold className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateTextElement(selectedId!, { align: 'left' })}
                className={`h-7 px-2 ${selectedElement.align === 'left' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
              >
                <AlignLeft className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateTextElement(selectedId!, { align: 'center' })}
                className={`h-7 px-2 ${selectedElement.align === 'center' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
              >
                <AlignCenter className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateTextElement(selectedId!, { align: 'right' })}
                className={`h-7 px-2 ${selectedElement.align === 'right' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}
              >
                <AlignRight className="w-3 h-3" />
              </Button>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTextElement(selectedId!)}
                className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={handleExport}
          className="w-full h-9 text-sm font-semibold text-black"
          style={{ background: GOLD_GRADIENT }}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export Logo with Text
        </Button>

        <p className="text-[10px] text-zinc-500 text-center">
          Click on text to edit. Drag to position. Corners to resize.
        </p>
      </div>
    </Card>
  )
}
