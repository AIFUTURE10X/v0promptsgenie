"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Download, Type, RotateCcw } from 'lucide-react'
import { FontControls } from './FontControls'
import { LogoTextPreview } from './LogoTextPreview'
import { REAL_FONTS, buildGoogleFontsUrlForFonts } from '@/app/image-studio/constants/real-fonts'
import type { TextPosition, TextTransform, RealFontOverlayProps } from './types'

export function RealFontOverlay({
  isOpen,
  onClose,
  logoUrl,
  brandName: initialBrandName,
  tagline: initialTagline,
  onExport,
}: RealFontOverlayProps) {
  // Text state
  const [brandName, setBrandName] = useState(initialBrandName)
  const [tagline, setTagline] = useState(initialTagline || '')

  // Font state
  const [selectedFont, setSelectedFont] = useState('montserrat')
  const [fontSize, setFontSize] = useState(32)
  const [fontWeight, setFontWeight] = useState(600)
  const [fontColor, setFontColor] = useState('#ffffff')
  const [textTransform, setTextTransform] = useState<TextTransform>('none')
  const [letterSpacing, setLetterSpacing] = useState(0)

  // Position state
  const [position, setPosition] = useState<TextPosition>('below')
  const [taglineFontSize, setTaglineFontSize] = useState(16)

  // Loaded fonts tracking
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load font dynamically when selected
  useEffect(() => {
    if (loadedFonts.has(selectedFont)) return

    const font = REAL_FONTS[selectedFont]
    if (!font) return

    const link = document.createElement('link')
    link.href = buildGoogleFontsUrlForFonts([selectedFont])
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    link.onload = () => {
      setLoadedFonts((prev) => new Set([...prev, selectedFont]))
    }
  }, [selectedFont, loadedFonts])

  // Helper function to draw text with letter spacing
  const drawTextWithSpacing = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    spacing: number,
    align: 'left' | 'center' | 'right' = 'center'
  ) => {
    if (spacing === 0) {
      ctx.fillText(text, x, y)
      return
    }

    // Calculate total text width with spacing
    const chars = text.split('')
    let totalWidth = 0
    chars.forEach((char, i) => {
      totalWidth += ctx.measureText(char).width
      if (i < chars.length - 1) totalWidth += spacing
    })

    // Calculate starting position based on alignment
    let startX = x
    if (align === 'center') {
      startX = x - totalWidth / 2
    } else if (align === 'right') {
      startX = x - totalWidth
    }

    // Draw each character with spacing
    let currentX = startX
    chars.forEach((char, i) => {
      ctx.fillText(char, currentX + ctx.measureText(char).width / 2, y)
      currentX += ctx.measureText(char).width + (i < chars.length - 1 ? spacing : 0)
    })
  }

  // Export combined image
  const handleExport = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Wait for fonts to be fully loaded
    await document.fonts.ready

    // Verify selected font is loaded
    const font = REAL_FONTS[selectedFont]
    if (font && !document.fonts.check(`${fontSize}px "${font.name}"`)) {
      console.warn('Font not fully loaded, export may use fallback font')
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const padding = 40
      const textHeight = fontSize + (tagline ? taglineFontSize + 10 : 0) + 20

      let canvasWidth = img.width
      let canvasHeight = img.height

      if (position === 'below' || position === 'above') {
        canvasHeight = img.height + textHeight + padding
      } else if (position === 'left' || position === 'right') {
        canvasWidth = img.width + 300
      }

      canvas.width = canvasWidth
      canvas.height = canvasHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate logo position
      let logoX = 0, logoY = 0
      if (position === 'below') {
        logoX = (canvasWidth - img.width) / 2
        logoY = 0
      } else if (position === 'above') {
        logoX = (canvasWidth - img.width) / 2
        logoY = textHeight
      } else if (position === 'left') {
        logoX = canvasWidth - img.width - padding
        logoY = (canvasHeight - img.height) / 2
      } else if (position === 'right') {
        logoX = padding
        logoY = (canvasHeight - img.height) / 2
      } else {
        logoX = (canvasWidth - img.width) / 2
        logoY = (canvasHeight - img.height) / 2
      }

      ctx.drawImage(img, logoX, logoY)

      // Set font properties
      ctx.font = `${fontWeight} ${fontSize}px ${font?.name || 'sans-serif'}`
      ctx.fillStyle = fontColor
      ctx.textAlign = 'center'

      let displayText = brandName
      if (textTransform === 'uppercase') displayText = brandName.toUpperCase()
      if (textTransform === 'lowercase') displayText = brandName.toLowerCase()

      // Calculate text position
      let textX = canvasWidth / 2, textY = 0
      if (position === 'below') textY = img.height + padding + fontSize
      else if (position === 'above') textY = fontSize + 10
      else if (position === 'left') { textX = padding + 100; textY = canvasHeight / 2 }
      else if (position === 'right') { textX = img.width + padding + 100; textY = canvasHeight / 2 }
      else textY = canvasHeight / 2 + img.height / 2 + fontSize

      // Draw brand name with letter spacing
      drawTextWithSpacing(ctx, displayText, textX, textY, letterSpacing, 'center')

      // Draw tagline with letter spacing
      if (tagline) {
        ctx.font = `400 ${taglineFontSize}px ${font?.name || 'sans-serif'}`
        let taglineText = textTransform === 'uppercase' ? tagline.toUpperCase()
          : textTransform === 'lowercase' ? tagline.toLowerCase() : tagline
        drawTextWithSpacing(ctx, taglineText, textX, textY + taglineFontSize + 8, letterSpacing / 2, 'center')
      }

      onExport(canvas.toDataURL('image/png'))
      onClose()
    }

    img.src = logoUrl
  }, [logoUrl, brandName, tagline, selectedFont, fontSize, fontWeight, fontColor, textTransform, letterSpacing, position, taglineFontSize, onExport, onClose])

  // Reset to defaults
  const handleReset = () => {
    setBrandName(initialBrandName)
    setTagline(initialTagline || '')
    setSelectedFont('montserrat')
    setFontSize(32)
    setFontWeight(600)
    setFontColor('#ffffff')
    setTextTransform('none')
    setLetterSpacing(0)
    setPosition('below')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-linear-to-r from-purple-500 to-pink-500">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Real Font Overlay</h2>
              <p className="text-xs text-zinc-400">Add professional typography to your logo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <LogoTextPreview
            logoUrl={logoUrl}
            brandName={brandName}
            tagline={tagline}
            selectedFont={selectedFont}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontColor={fontColor}
            textTransform={textTransform}
            letterSpacing={letterSpacing}
            position={position}
            taglineFontSize={taglineFontSize}
            loadedFonts={loadedFonts}
          />

          <FontControls
            brandName={brandName}
            setBrandName={setBrandName}
            tagline={tagline}
            setTagline={setTagline}
            selectedFont={selectedFont}
            setSelectedFont={setSelectedFont}
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontWeight={fontWeight}
            setFontWeight={setFontWeight}
            fontColor={fontColor}
            setFontColor={setFontColor}
            textTransform={textTransform}
            setTextTransform={setTextTransform}
            letterSpacing={letterSpacing}
            setLetterSpacing={setLetterSpacing}
            position={position}
            setPosition={setPosition}
            taglineFontSize={taglineFontSize}
            setTaglineFontSize={setTaglineFontSize}
            loadedFonts={loadedFonts}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-lg text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              Export Logo
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
