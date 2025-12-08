"use client"

import { useCallback } from 'react'
import type { GeneratedImage } from './useImageStudioState'

interface UseLightboxHandlersOptions {
  generatedImages: GeneratedImage[]
  setLightboxOpen: (open: boolean) => void
  setLightboxIndex: (index: number | ((prev: number) => number)) => void
  lightboxIndex: number
}

export interface LightboxHandlers {
  openLightbox: (index: number) => void
  closeLightbox: () => void
  navigateLightbox: (direction: 'prev' | 'next') => void
  handleDownloadFromLightbox: () => void
}

export function useLightboxHandlers({
  generatedImages,
  setLightboxOpen,
  setLightboxIndex,
  lightboxIndex,
}: UseLightboxHandlersOptions): LightboxHandlers {

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [setLightboxIndex, setLightboxOpen])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [setLightboxOpen])

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex((prev: number) => (prev > 0 ? prev - 1 : generatedImages.length - 1))
    } else {
      setLightboxIndex((prev: number) => (prev < generatedImages.length - 1 ? prev + 1 : 0))
    }
  }, [generatedImages.length, setLightboxIndex])

  const handleDownloadFromLightbox = useCallback(() => {
    const imageUrl = generatedImages[lightboxIndex]?.url
    if (!imageUrl) return

    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `generated-image-${lightboxIndex + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [generatedImages, lightboxIndex])

  return {
    openLightbox,
    closeLightbox,
    navigateLightbox,
    handleDownloadFromLightbox,
  }
}
