"use client"

/**
 * Generic Mockup Export Hook
 *
 * Handles PNG, SVG, and PDF export for any mockup type.
 * The shape drawing function comes from the mockup config.
 */

import { useState, useCallback } from 'react'
import jsPDF from 'jspdf'
import { toast } from 'sonner'
import { REAL_FONTS } from '@/app/image-studio/constants/real-fonts'
import type { MockupConfig, ProductColor, Position, TextEffect, TextItem, MockupView } from './mockup-types'

// ============ Utility Functions ============

/**
 * Preload image utility - waits for image to fully load
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'  // Set BEFORE src for CORS
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image failed to load'))
    img.src = url
  })
}

/**
 * Draw text with effect on canvas
 */
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
      for (let i = 4; i >= 1; i--) {
        ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + (4 - i) * 0.15})`
        ctx.fillText(text, x + i, y + i)
      }
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
      break

    case 'embossed':
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.fillText(text, x - 1, y - 1)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillText(text, x + 1, y + 1)
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
      break

    case 'floating':
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 4
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
      break

    case 'debossed':
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.fillText(text, x + 1, y + 1)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillText(text, x - 1, y - 1)
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
      break

    default:
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
  }

  ctx.restore()
}

/**
 * Draw text with rotation
 */
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

// ============ Export Hook ============

interface UseGenericExportConfig {
  /** Mockup configuration */
  mockupConfig: MockupConfig
  /** Logo image URL (optional - can show blank product) */
  logoUrl?: string
  /** Logo position (percentage) */
  logoPosition: Position
  /** Logo scale */
  logoScale: number
  /** Selected product color */
  selectedColor: ProductColor
  /** Whether to show brand name */
  showBrandName: boolean
  /** Brand name text */
  brandName: string
  /** Brand font key */
  brandFont: string
  /** Brand text color */
  brandColor: string
  /** Brand text position */
  brandPosition: Position
  /** Brand text scale */
  brandScale: number
  /** Brand text effect */
  brandEffect: TextEffect
  /** Brand text rotation */
  brandRotation: number
  /** Multiple text items */
  textItems: TextItem[]
  /** Optional callback after export */
  onExport?: (format: 'png', dataUrl: string) => void
  /** Photo URL for photo-based rendering (null = use SVG) */
  photoUrl?: string | null
  /** Current view (front/back) */
  view?: MockupView
}

export function useGenericExport(config: UseGenericExportConfig) {
  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const { mockupConfig } = config
  const canvasWidth = mockupConfig.canvasWidth
  const canvasHeight = mockupConfig.canvasHeight
  const scale = mockupConfig.exportConfig.scale || 2
  const yOffset = mockupConfig.exportConfig.yOffset || 0

  const captureCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        toast.error('Export failed: Canvas not supported')
        return null
      }

      // Set up canvas with HiDPI support
      canvas.width = canvasWidth * scale
      canvas.height = canvasHeight * scale
      ctx.scale(scale, scale)

      // Background
      ctx.fillStyle = '#18181b'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Draw product shape using photo or SVG
      if (config.photoUrl) {
        // Photo-based rendering
        try {
          const photoImg = await preloadImage(config.photoUrl)
          // Calculate aspect-fit dimensions
          const imgAspect = photoImg.width / photoImg.height
          const canvasAspect = canvasWidth / canvasHeight
          let drawWidth: number, drawHeight: number, drawX: number, drawY: number

          if (imgAspect > canvasAspect) {
            drawWidth = canvasWidth
            drawHeight = canvasWidth / imgAspect
            drawX = 0
            drawY = (canvasHeight - drawHeight) / 2
          } else {
            drawHeight = canvasHeight
            drawWidth = canvasHeight * imgAspect
            drawX = (canvasWidth - drawWidth) / 2
            drawY = 0
          }
          ctx.drawImage(photoImg, drawX, drawY, drawWidth, drawHeight)
        } catch {
          // Fallback to SVG if photo fails
          mockupConfig.exportConfig.drawShape(ctx, config.selectedColor, canvasWidth, canvasHeight, config.view)
        }
      } else {
        // SVG-based rendering (fallback)
        mockupConfig.exportConfig.drawShape(ctx, config.selectedColor, canvasWidth, canvasHeight, config.view)
      }

      // Draw logo with blend mode for realistic integration (if provided)
      if (config.logoUrl) {
        const logoImg = await preloadImage(config.logoUrl)
        const logoBaseW = 120 * config.logoScale
        const logoH = (logoImg.height / logoImg.width) * logoBaseW
        const logoX = (config.logoPosition.x / 100) * canvasWidth - logoBaseW / 2
        const logoY = (config.logoPosition.y / 100) * canvasHeight - logoH / 2 + (yOffset > 0 ? 25 : 0)

        // Apply blend mode for photo-based rendering (multiply for light, screen for dark)
        if (config.photoUrl) {
          const isDarkProduct = config.selectedColor.textColor === 'light'
          ctx.globalCompositeOperation = isDarkProduct ? 'screen' : 'multiply'
        }
        ctx.drawImage(logoImg, logoX, logoY, logoBaseW, logoH)
        // Reset blend mode
        ctx.globalCompositeOperation = 'source-over'
      }

      // Draw main brand text (if not using multiple text items)
      if (config.showBrandName && config.brandName && config.textItems.length === 0) {
        const fontFamily = REAL_FONTS[config.brandFont]?.family || 'sans-serif'
        const fontSize = 8 * config.brandScale
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const textX = (config.brandPosition.x / 100) * canvasWidth
        const textY = (config.brandPosition.y / 100) * canvasHeight + (yOffset > 0 ? 40 : 0)

        if (config.brandRotation !== 0) {
          drawRotatedText(ctx, config.brandName.toUpperCase(), textX, textY, config.brandRotation, config.brandColor, config.brandEffect)
        } else {
          drawTextWithEffect(ctx, config.brandName.toUpperCase(), textX, textY, config.brandColor, config.brandEffect)
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

          const textX = (item.position.x / 100) * canvasWidth
          const textY = (item.position.y / 100) * canvasHeight + (yOffset > 0 ? 40 : 0)

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
  }, [config, mockupConfig, canvasWidth, canvasHeight, scale, yOffset])

  const handleExportPNG = useCallback(async () => {
    setIsExporting(true)
    setShowExportMenu(false)
    try {
      const canvas = await captureCanvas()
      if (!canvas) {
        setIsExporting(false)
        return
      }
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Export failed')
          setIsExporting(false)
          return
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${mockupConfig.id}-mockup-${config.brandName || 'brand'}.png`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('PNG exported!')
        config.onExport?.('png', url)
        setIsExporting(false)
      }, 'image/png', 0.95)
    } catch {
      setIsExporting(false)
    }
  }, [captureCanvas, mockupConfig, config])

  const handleExportSVG = useCallback(async () => {
    setIsExporting(true)
    setShowExportMenu(false)
    try {
      const canvas = await captureCanvas()
      if (!canvas) {
        setIsExporting(false)
        return
      }
      const dataUrl = canvas.toDataURL('image/png')
      const svg = `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}">\n  <image xlink:href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>\n</svg>`
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${mockupConfig.id}-mockup-${config.brandName || 'brand'}.svg`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('SVG exported!')
      setIsExporting(false)
    } catch {
      setIsExporting(false)
    }
  }, [captureCanvas, mockupConfig, config])

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true)
    setShowExportMenu(false)
    try {
      const canvas = await captureCanvas()
      if (!canvas) {
        setIsExporting(false)
        return
      }
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const yPos = (pdfHeight - imgHeight) / 2
      pdf.addImage(imgData, 'PNG', 10, yPos > 10 ? yPos : 10, imgWidth, imgHeight)
      pdf.save(`${mockupConfig.id}-mockup-${config.brandName || 'brand'}.pdf`)
      toast.success('PDF exported!')
      setIsExporting(false)
    } catch {
      setIsExporting(false)
    }
  }, [captureCanvas, mockupConfig, config])

  return {
    isExporting,
    showExportMenu,
    setShowExportMenu,
    handleExportPNG,
    handleExportSVG,
    handleExportPDF,
    captureCanvas,
  }
}
