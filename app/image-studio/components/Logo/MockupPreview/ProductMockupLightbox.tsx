"use client"

/**
 * ProductMockupLightbox Component
 *
 * Full-screen lightbox for viewing product mockups with settings
 */

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { GenericMockup } from './generic'
import { getMockupConfig } from './configs'
import type { MockupConfig } from './generic/mockup-types'

interface ProductMockupLightboxProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  logoUrl?: string
  brandName?: string
  logoFilter?: React.CSSProperties
  /** Optional config override for custom products */
  config?: MockupConfig
  /** Custom product image URL for custom uploads */
  customProductImageUrl?: string
  /** Pre-processed logo URL (already has BG removed) */
  processedLogoUrl?: string
}

export function ProductMockupLightbox({
  isOpen,
  onClose,
  productId,
  logoUrl,
  brandName = "Your Brand",
  logoFilter,
  config: configOverride,
  customProductImageUrl,
  processedLogoUrl,
}: ProductMockupLightboxProps) {
  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Use provided config or look up by productId
  const config = configOverride || getMockupConfig(productId)
  if (!config) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-zinc-800/80 text-white hover:bg-zinc-700 transition-colors"
        title="Close (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Product Name Header - Left side */}
      <div className="absolute top-4 left-4 z-50">
        <h2 className="text-xl font-semibold text-white bg-zinc-800/80 px-6 py-2 rounded-full">
          {config.name} Mockup
        </h2>
      </div>

      {/* Main Content - Larger mockup with settings */}
      <div className="w-full max-w-6xl max-h-[96vh] mx-4 mt-8 mb-1 overflow-auto rounded-2xl bg-zinc-900 border border-zinc-700">
        <GenericMockup
          config={config}
          logoUrl={logoUrl}
          brandName={brandName}
          logoFilter={logoFilter}
          hideControls={false}
          customProductImageUrl={customProductImageUrl}
          externalProcessedLogoUrl={processedLogoUrl}
        />
      </div>
    </div>
  )
}
