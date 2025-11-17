import { useState } from 'react'

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  suggestions?: {
    prompt: string
    negativePrompt?: string
    cameraAngle: string
    cameraLens: string
    style: string
    styleStrength?: 'subtle' | 'moderate' | 'strong'
    aspectRatio?: string
  }
}

export function useAIHelper() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  const compressImageIfNeeded = async (blob: Blob): Promise<Blob> => {
    if (blob.size <= 4 * 1024 * 1024) return blob

    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        const maxDimension = 2048
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (compressed) => resolve(compressed || blob),
          'image/jpeg',
          0.85
        )
      }
      img.src = URL.createObjectURL(blob)
    })
  }

  const saveMessage = async (
    role: 'user' | 'assistant',
    content: string,
    suggestions?: any,
    images?: string[],
    imageAnalysis?: string
  ) => {
    console.log('[v0] AI Helper message save disabled - session only')
    return
    
    /* ORIGINAL CODE - commented out to save Neon bandwidth
    try {
      await fetch('/api/ai-helper/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          role,
          content,
          suggestions,
          images,
          imageAnalysis
        })
      })
    } catch (error) {
      console.error('[v0] Failed to save message:', error)
    }
    */
  }

  const sendMessage = async (userInput: string, currentPromptSettings: any) => {
    const displayMessage = userInput.trim() || '📷 [Image uploaded]'
    const userMessage: AIMessage = { role: 'user', content: displayMessage }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    const currentImages = [...uploadedImages]
    await saveMessage('user', displayMessage, undefined, currentImages.length > 0 ? currentImages : undefined)

    let imageAnalysisContext = ''
    
    // Analyze uploaded images if any
    if (currentImages.length > 0) {
      const analyses: Array<{ index: number; analysis: string; error?: boolean }> = []

      for (let index = 0; index < currentImages.length; index++) {
        try {
          const imageUrl = currentImages[index]
          const response = await fetch(imageUrl)
          const originalBlob = await response.blob()
          const blob = await compressImageIfNeeded(originalBlob)
          const file = new File([blob], `reference-image-${index + 1}.jpg`, { type: blob.type })

          const formData = new FormData()
          formData.append('image', file)
          formData.append('type', 'subject')
          formData.append('mode', 'quality')

          const analysisResponse = await fetch('/api/analyze-image', {
            method: 'POST',
            body: formData
          })

          if (analysisResponse.ok) {
            const data = await analysisResponse.json()
            if (data.analysis) {
              analyses.push({
                index: index + 1,
                analysis: data.analysis,
                error: false
              })
            }
          }
        } catch (error) {
          console.error(`[v0] Image ${index + 1} analysis failed:`, error)
        }
      }

      if (analyses.length > 0) {
        const successfulAnalyses = analyses.filter(a => !a.error)
        if (successfulAnalyses.length > 0) {
          imageAnalysisContext = `\n\n=== REFERENCE IMAGES ANALYSIS ===\n${successfulAnalyses
            .map(a => `\n[IMAGE ${a.index}] - DETAILED CHARACTER/SUBJECT DESCRIPTION:\n${a.analysis}`)
            .join('\n\n')}\n\nCRITICAL INSTRUCTIONS: The user has uploaded ${successfulAnalyses.length} reference image(s). When they mention "this character", "the image", etc., they want you to REPLICATE THE EXACT CHARACTER/SUBJECT from the analysis above.`
        }
      }

      setUploadedImages([])
    }

    const fullMessage = userInput + imageAnalysisContext

    try {
      const response = await fetch('/api/generate-prompt-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullMessage,
          ...currentPromptSettings,
          conversationHistory: messages
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: data.message,
          suggestions: data.suggestions
        }
        setMessages(prev => [...prev, assistantMessage])
        await saveMessage('assistant', data.message, data.suggestions)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage: AIMessage = {
          role: 'assistant',
          content: `Error: ${errorData.error}. Please try again.`
        }
        setMessages(prev => [...prev, errorMessage])
        await saveMessage('assistant', errorMessage.content)
      }
    } catch (error) {
      console.error('[v0] AI Helper error:', error)
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
      await saveMessage('assistant', errorMessage.content)
    } finally {
      setIsLoading(false)
    }
  }

  const addImage = (imageDataUrl: string) => {
    setUploadedImages(prev => [...prev, imageDataUrl])
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const clearHistory = async () => {
    console.log('[v0] Clearing local history only')
    setMessages([])
    setUploadedImages([])
    
    /* ORIGINAL CODE - commented out to save Neon bandwidth
    try {
      await fetch(`/api/ai-helper/delete?session_id=${sessionId}`, {
        method: 'DELETE'
      })
      setMessages([])
      setUploadedImages([])
    } catch (error) {
      console.error('[v0] Failed to clear history:', error)
    }
    */
  }

  return {
    messages,
    uploadedImages,
    isLoading,
    sendMessage,
    addImage,
    removeImage,
    clearHistory
  }
}
