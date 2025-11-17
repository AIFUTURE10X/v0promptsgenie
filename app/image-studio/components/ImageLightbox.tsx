"use client"

import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ImageLightboxProps {
  isOpen: boolean
  images: Array<{ url: string; prompt?: string }>
  currentIndex: number
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
  onDownload?: () => void
}

export function ImageLightbox({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
  onDownload
}: ImageLightboxProps) {
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        onNavigate('prev')
      } else if (e.key === 'ArrowRight') {
        onNavigate('next')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNavigate])

  const currentImage = images[currentIndex]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[90vw] !max-h-[90vh] w-[90vw] h-[90vh] p-0 bg-black border-zinc-800 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Download button */}
          {onDownload && (
            <button
              onClick={onDownload}
              className="absolute top-4 right-16 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Download image"
            >
              <Download className="w-6 h-6" />
            </button>
          )}

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={() => onNavigate('prev')}
              className="absolute left-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <img
              src={currentImage?.url || '/placeholder.svg'}
              alt={currentImage?.prompt || `Image ${currentIndex + 1}`}
              className="max-w-full max-h-[calc(100%-60px)] object-contain"
            />
            
            {/* Image info */}
            {currentImage?.prompt && (
              <div className="mt-4 max-w-3xl text-center">
                <p className="text-sm text-zinc-400 line-clamp-2">
                  {currentImage.prompt}
                </p>
              </div>
            )}
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={() => onNavigate('next')}
              className="absolute right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
