import { useState } from 'react'

export interface GenerationOptions {
  prompt: string
  count: number
  aspectRatio: string
  seed?: number | null
  referenceImage?: File
}

export interface GeneratedImage {
  url: string
  prompt: string
  timestamp: number
}

export function useImageGeneration(onImagesUpdate?: (images: GeneratedImage[]) => void) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const generateImages = async (options: GenerationOptions) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('prompt', options.prompt)
      formData.append('count', options.count.toString())
      formData.append('aspectRatio', options.aspectRatio)
      
      if (options.seed !== null && options.seed !== undefined) {
        formData.append('seed', options.seed.toString())
      }
      
      if (options.referenceImage) {
        formData.append('referenceImage', options.referenceImage)
      }
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to generate images (${response.status})`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
        throw new Error('No images returned from API')
      }
      
      const newImages: GeneratedImage[] = data.images.map((img: any) => ({
        url: typeof img === 'string' ? img : img.url,
        prompt: options.prompt,
        timestamp: Date.now()
      }))
      
      if (onImagesUpdate) {
        onImagesUpdate(newImages)
      }
      
      return newImages
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate images'
      console.error('[v0] Generation error:', err)
      setError(message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }
  
  const clearImages = () => {
    setError(null)
    onImagesUpdate?.([])
  }
  
  return {
    isGenerating,
    error,
    generateImages,
    clearImages
  }
}
