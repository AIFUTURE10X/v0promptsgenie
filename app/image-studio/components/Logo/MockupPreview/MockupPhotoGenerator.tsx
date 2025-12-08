"use client"

/**
 * MockupPhotoGenerator Component
 *
 * Admin UI for generating AI product photos for realistic mockups.
 * Generates photos and saves them to public/mockups folder.
 */

import { useState, useCallback } from 'react'
import { Loader2, Check, X, Image, RefreshCw, Download } from 'lucide-react'
import { toast } from 'sonner'

interface ProductConfig {
  id: string
  colors: string[]
}

interface GenerationStatus {
  [key: string]: 'idle' | 'generating' | 'success' | 'error'
}

const PRODUCTS: ProductConfig[] = [
  { id: 'tshirt', colors: ['black', 'white', 'navy', 'red', 'gray'] },
  { id: 'hoodie', colors: ['black', 'white', 'navy', 'gray'] },
  { id: 'mug', colors: ['white', 'black', 'cream'] },
  { id: 'phone-case', colors: ['black', 'white', 'clear'] },
  { id: 'hat', colors: ['black', 'white', 'navy'] },
  { id: 'tote-bag', colors: ['natural', 'black', 'white'] },
  { id: 'pillow', colors: ['white', 'cream', 'gray'] },
  { id: 'wall-art', colors: ['white', 'black'] },
  { id: 'stickers', colors: ['white'] },
]

interface MockupPhotoGeneratorProps {
  onClose?: () => void
}

export function MockupPhotoGenerator({ onClose }: MockupPhotoGeneratorProps) {
  const [status, setStatus] = useState<GenerationStatus>({})
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({})

  const getKey = (product: string, color: string) => `${product}-${color}`

  const generatePhoto = useCallback(async (product: string, color: string) => {
    const key = getKey(product, color)
    setStatus(prev => ({ ...prev, [key]: 'generating' }))

    try {
      const response = await fetch('/api/generate-mockup-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, color, saveToFile: true }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate')
      }

      setStatus(prev => ({ ...prev, [key]: 'success' }))
      setGeneratedImages(prev => ({ ...prev, [key]: data.dataUrl }))
      toast.success(`Generated ${product} - ${color}`)
      return true
    } catch (error) {
      setStatus(prev => ({ ...prev, [key]: 'error' }))
      toast.error(`Failed: ${product} - ${color}`)
      return false
    }
  }, [])

  const generateAll = useCallback(async () => {
    setIsGeneratingAll(true)
    let successCount = 0
    let totalCount = 0

    for (const product of PRODUCTS) {
      for (const color of product.colors) {
        totalCount++
        const success = await generatePhoto(product.id, color)
        if (success) successCount++
        // Small delay between generations to avoid rate limits
        await new Promise(r => setTimeout(r, 1000))
      }
    }

    setIsGeneratingAll(false)
    toast.success(`Generated ${successCount}/${totalCount} photos`)
  }, [generatePhoto])

  const getStatusIcon = (product: string, color: string) => {
    const key = getKey(product, color)
    const s = status[key]

    switch (s) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
      case 'success':
        return <Check className="w-4 h-4 text-green-400" />
      case 'error':
        return <X className="w-4 h-4 text-red-400" />
      default:
        return <Image className="w-4 h-4 text-zinc-500" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Generate Mockup Photos</h2>
            <p className="text-xs text-zinc-400">AI-generate product photos for realistic mockups</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateAll}
              disabled={isGeneratingAll}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
            >
              {isGeneratingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Generate All
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          <div className="space-y-4">
            {PRODUCTS.map(product => (
              <div key={product.id} className="bg-zinc-800/50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-white mb-2 capitalize">
                  {product.id.replace('-', ' ')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => {
                    const key = getKey(product.id, color)
                    const isGenerating = status[key] === 'generating'
                    const hasImage = generatedImages[key]

                    return (
                      <button
                        key={color}
                        onClick={() => generatePhoto(product.id, color)}
                        disabled={isGenerating || isGeneratingAll}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          status[key] === 'success'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : status[key] === 'error'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border border-zinc-600'
                        } disabled:opacity-50`}
                      >
                        {getStatusIcon(product.id, color)}
                        <span className="capitalize">{color}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
          <p className="text-xs text-zinc-500">
            Photos are saved to <code className="text-zinc-400">public/mockups/</code>.
            After generating, set <code className="text-zinc-400">renderMode: 'photo'</code> in configs.
          </p>
        </div>
      </div>
    </div>
  )
}
