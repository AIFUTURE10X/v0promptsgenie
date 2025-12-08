"use client"

/**
 * Mockup Export Hook
 * Handles PNG, SVG, and PDF export using manual canvas drawing
 * Supports text effects, rotation, and multiple text items
 */

import { useState, useCallback } from 'react'
import jsPDF from 'jspdf'
import { toast } from 'sonner'
import { REAL_FONTS } from '@/app/image-studio/constants/real-fonts'
import { preloadImage, drawTShirtShape, CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_SCALE, CANVAS_Y_OFFSET } from './canvas-export'
import type { TShirtColor } from './tshirt-assets'
import type { TextEffect, TextItem } from './text-effects-config'

interface ExportConfig {
  logoUrl: string
  logoPosition: { x: number; y: number }
  logoScale: number
  selectedColor: TShirtColor
  showBrandName: boolean
  editableBrandName: string
  brandFont: string
  brandColor: string
  brandPosition: { x: number; y: number }
  brandScale: number
  brandEffect: TextEffect
  brandRotation: number
  textItems: TextItem[]
  onExport?: (format: 'png', dataUrl: string) => void
}

// Draw text with effect on canvas
function drawTextWithEffect(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  effect: TextEffect
) {
  ctx.save()

  switch (effect) {
    case '3d':
      // Draw multiple offset shadows for 3D effect
      for (let i = 4; i >= 1; i--) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + (4 - i) * 0.15})`
        ctx.fillText(text, x + i, y + i)
      }
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
      break

    case 'embossed':
      // Light shadow top-left
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.fillText(text, x - 1, y - 1)
      // Dark shadow bottom-right
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillText(text, x + 1, y + 1)
      // Main text
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
      break

    case 'floating':
      // Drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
      break

    case 'debossed':
      // Light shadow bottom-right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.fillText(text, x + 1, y + 1)
      // Dark shadow top-left
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillText(text, x - 1, y - 1)
      // Main text
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
      break

    default:
      // No effect
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
  }

  ctx.restore()
}

// Draw text with rotation
function drawRotatedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  rotation: number,
  color: string,
  effect: TextEffect
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((rotation * Math.PI) / 180)
  drawTextWithEffect(ctx, text, 0, 0, color, effect)
  ctx.restore()
}

export function useMockupExport(config: ExportConfig) {
  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const captureCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) { toast.error('Export failed: Canvas not supported'); return null }

      canvas.width = CANVAS_WIDTH * CANVAS_SCALE
      canvas.height = CANVAS_HEIGHT * CANVAS_SCALE
      ctx.scale(CANVAS_SCALE, CANVAS_SCALE)

      ctx.fillStyle = '#18181b'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const isDark = config.selectedColor.textColor === 'light'
      drawTShirtShape(ctx, config.selectedColor.hex, isDark)

      const logoImg = await preloadImage(config.logoUrl)
      const logoBaseW = 120 * config.logoScale
      const logoH = (logoImg.height / logoImg.width) * logoBaseW
      const logoX = (config.logoPosition.x / 100) * CANVAS_WIDTH - logoBaseW / 2
      const logoY = (config.logoPosition.y / 100) * CANVAS_HEIGHT - logoH / 2 + 25
      ctx.drawImage(logoImg, logoX, logoY, logoBaseW, logoH)

      // Draw main brand text (if not using multiple text items or no text selected)
      if (config.showBrandName && config.editableBrandName && config.textItems.length === 0) {
        const fontFamily = REAL_FONTS[config.brandFont]?.family || 'sans-serif'
        const fontSize = 8 * config.brandScale
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const textX = (config.brandPosition.x / 100) * CANVAS_WIDTH
        const textY = (config.brandPosition.y / 100) * CANVAS_HEIGHT + 40

        if (config.brandRotation !== 0) {
          drawRotatedText(ctx, config.editableBrandName.toUpperCase(), textX, textY, config.brandRotation, config.brandColor, config.brandEffect)
        } else {
          drawTextWithEffect(ctx, config.editableBrandName.toUpperCase(), textX, textY, config.brandColor, config.brandEffect)
        }
      }

      // Draw multiple text items
      if (config.showBrandName && config.textItems.length > 0) {
        for (const item of config.textItems) {
          const fontFamily = REAL_FONTS[item.font]?.family || 'sans-serif'
          const fontSize = 8 * item.scale
          ctx.font = `${fontSize}px ${fontFamily}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          const textX = (item.position.x / 100) * CANVAS_WIDTH
          const textY = (item.position.y / 100) * CANVAS_HEIGHT + 40

          if (item.rotation !== 0) {
            drawRotatedText(ctx, item.content.toUpperCase(), textX, textY, item.rotation, item.color, item.effect)
          } else {
            drawTextWithEffect(ctx, item.content.toUpperCase(), textX, textY, item.color, item.effect)
          }
        }
      }

      return canvas
    } catch (err) {
      console.error('Canvas capture failed:', err)
      toast.error(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return null
    }
  }, [config])

  const handleExportPNG = useCallback(async () => {
    setIsExporting(true); setShowExportMenu(false)
    try {
      const canvas = await captureCanvas()
      if (!canvas) { setIsExporting(false); return }
      canvas.toBlob((blob) => {
        if (!blob) { toast.error('Export failed'); setIsExporting(false); return }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `tshirt-mockup-${config.editableBrandName || 'brand'}.png`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('PNG exported!')
        config.onExport?.('png', url)
        setIsExporting(false)
      }, 'image/png', 0.95)
    } catch { setIsExporting(false) }
  }, [captureCanvas, config])

  const handleExportSVG = useCallback(async () => {
    setIsExporting(true); setShowExportMenu(false)
    try {
      const canvas = await captureCanvas()
      if (!canvas) { setIsExporting(false); return }
      const dataUrl = canvas.toDataURL('image/png')
      const svg = `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}">\n  <image xlink:href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>\n</svg>`
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tshirt-mockup-${config.editableBrandName || 'brand'}.svg`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('SVG exported!')
      setIsExporting(false)
    } catch { setIsExporting(false) }
  }, [captureCanvas, config])

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true); setShowExportMenu(false)
    try {
      const canvas = await captureCanvas()
      if (!canvas) { setIsExporting(false); return }
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const yPos = (pdfHeight - imgHeight) / 2
      pdf.addImage(imgData, 'PNG', 10, yPos > 10 ? yPos : 10, imgWidth, imgHeight)
      pdf.save(`tshirt-mockup-${config.editableBrandName || 'brand'}.pdf`)
      toast.success('PDF exported!')
      setIsExporting(false)
    } catch { setIsExporting(false) }
  }, [captureCanvas, config])

  return {
    isExporting,
    showExportMenu,
    setShowExportMenu,
    handleExportPNG,
    handleExportSVG,
    handleExportPDF,
  }
}
