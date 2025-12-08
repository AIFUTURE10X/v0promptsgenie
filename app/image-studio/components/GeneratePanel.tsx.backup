"use client"

import { useState, useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles, Loader2, ChevronDown, Upload, X, Download, Copy, Check, Edit } from 'lucide-react'
import { UploadedImage, AnalysisResult } from '../types'
import { usePromptBuilder } from '../hooks/usePromptBuilder'
import { useImageGeneration } from '../hooks/useImageGeneration'
import { GeneratedImageCard } from './GeneratedImageCard'
import { useGenerationHistory } from '../hooks/useGenerationHistory'
import { SeedControlDropdown } from './SeedControlDropdown'

const GOLD_GRADIENT = "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)"

type ImageSize = '1K' | '2K' | '4K'
type GenerationModel = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'

interface GeneratePanelProps {
  subjectImages: UploadedImage[]
  sceneAnalysis: AnalysisResult | null
  styleAnalysis: AnalysisResult | null
  analysisResults: {
    subjects: any[]
    scene: any | null
    style: any | null
  }
  onClearSubjectAnalysis: () => void
  onClearSceneAnalysis: () => void
  onClearStyleAnalysis: () => void
  aspectRatio: string
  setAspectRatio: (ratio: string) => void
  selectedStylePreset: string
  setSelectedStylePreset: (preset: string) => void
  imageCount: number
  setImageCount: (count: number) => void
  selectedCameraAngle: string
  selectedCameraLens: string
  styleStrength: 'subtle' | 'moderate' | 'strong'
  negativePrompt: string
  setNegativePrompt: (prompt: string) => void
  referenceImage: any | null
  setReferenceImage: (image: any) => void
  mainPrompt: string
  setMainPrompt: (prompt: string) => void
  isFavorite: (url: string) => boolean
  toggleFavorite: (url: string, metadata: any) => void
  onParametersSave?: (params: any) => void
  onClearPrompt?: () => void
  onRestoreParameters?: (params: any) => void
  generatedImages: Array<{ url: string; prompt?: string; timestamp?: number }>
  setGeneratedImages: (images: Array<{ url: string; prompt?: string; timestamp?: number }>) => void
  onOpenLightbox: (index: number) => void
  seed?: number | null
  setSeed?: (seed: number | null) => void
  imageSize?: ImageSize
  setImageSize?: (size: ImageSize) => void
  selectedModel?: GenerationModel
  setSelectedModel?: (model: GenerationModel) => void
}

const STYLE_PRESETS = [
  { 
    value: "Realistic", 
    label: "Realistic", 
    description: "Hyper-realistic photography",
    thumbnail: "/realistic-photograph.jpg"
  },
  { 
    value: "Cartoon Style", 
    label: "Cartoon Style", 
    description: "Vibrant animated style",
    thumbnail: "/cartoon-style.jpg"
  },
  { 
    value: "Pixar", 
    label: "Pixar", 
    description: "3D animation style",
    thumbnail: "/pixar-3d-animation.jpg"
  },
  { 
    value: "PhotoReal", 
    label: "PhotoReal", 
    description: "Ultra-realistic CGI",
    thumbnail: "/photorealistic-cgi.jpg"
  },
  { 
    value: "Anime", 
    label: "Anime", 
    description: "Japanese animation",
    thumbnail: "/anime-style-character.png"
  },
  { 
    value: "Oil Painting", 
    label: "Oil Painting", 
    description: "Traditional oil paint",
    thumbnail: "/abstract-oil-painting.png"
  },
  { 
    value: "Watercolor", 
    label: "Watercolor", 
    description: "Soft watercolor wash",
    thumbnail: "/watercolor-painting-still-life.png"
  },
  { 
    value: "3D Render", 
    label: "3D Render", 
    description: "Modern 3D CGI",
    thumbnail: "/abstract-3d-render.png"
  },
  { 
    value: "Sketch", 
    label: "Sketch", 
    description: "Hand-drawn pencil",
    thumbnail: "/pencil-sketch.png"
  },
  { 
    value: "Comic Book", 
    label: "Comic Book", 
    description: "Bold ink lines",
    thumbnail: "/comic-book-art.png"
  },
  { 
    value: "Studio Ghibli", 
    label: "Studio Ghibli", 
    description: "Hand-painted pastoral",
    thumbnail: "/studio-ghibli-style.jpg"
  },
  { 
    value: "Makoto Shinkai", 
    label: "Makoto Shinkai", 
    description: "Soft 3D realism",
    thumbnail: "/makoto-shinkai-anime.jpg"
  },
  { 
    value: "Disney Modern 3D", 
    label: "Disney Modern 3D", 
    description: "High-finish character",
    thumbnail: "/disney-3d-animation.jpg"
  },
  { 
    value: "Sony Spider-Verse", 
    label: "Sony Spider-Verse", 
    description: "Mixed media comic",
    thumbnail: "/spider-verse-style.jpg"
  },
  { 
    value: "Laika", 
    label: "Laika", 
    description: "Tactile handcrafted",
    thumbnail: "/laika-stop-motion.jpg"
  },
  { 
    value: "Cartoon Saloon", 
    label: "Cartoon Saloon", 
    description: "Storybook flat shapes",
    thumbnail: "/cartoon-saloon-style.jpg"
  },
  { 
    value: "Studio Trigger", 
    label: "Studio Trigger", 
    description: "Exaggerated silhouettes",
    thumbnail: "/studio-trigger-anime.jpg"
  },
  { 
    value: "Ufotable", 
    label: "Ufotable", 
    description: "Hyper-polished VFX",
    thumbnail: "/ufotable-anime.jpg"
  },
  { 
    value: "Kyoto Animation", 
    label: "Kyoto Animation", 
    description: "Polished slice-of-life",
    thumbnail: "/kyoto-animation.jpg"
  },
]

export const GeneratePanel = forwardRef<{ triggerGenerate: () => void, isGenerating: boolean }, GeneratePanelProps>(function GeneratePanel({
  subjectImages,
  sceneAnalysis,
  styleAnalysis,
  analysisResults,
  onClearSubjectAnalysis,
  onClearSceneAnalysis,
  onClearStyleAnalysis,
  aspectRatio,
  setAspectRatio,
  selectedStylePreset,
  setSelectedStylePreset,
  imageCount,
  setImageCount,
  selectedCameraAngle,
  selectedCameraLens,
  styleStrength,
  negativePrompt,
  setNegativePrompt,
  referenceImage,
  setReferenceImage,
  mainPrompt,
  setMainPrompt,
  isFavorite,
  toggleFavorite,
  onParametersSave,
  onClearPrompt,
  onRestoreParameters,
  generatedImages,
  setGeneratedImages,
  onOpenLightbox,
  seed: controlledSeedProp,
  setSeed: setControlledSeedProp,
  imageSize: controlledImageSize = '1K',
  setImageSize: setControlledImageSize,
  selectedModel: controlledSelectedModel = 'gemini-2.5-flash-image',
  setSelectedModel: setControlledSelectedModel,
}, ref) {
  const { combinedPrompt, hasPrompt } = usePromptBuilder(subjectImages, analysisResults)
  const { isGenerating, error, generateImages, clearImages } = useImageGeneration(setGeneratedImages)
  const { saveToHistory } = useGenerationHistory()
  
  const [manualPrompt, setManualPrompt] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [includePromptInFilename, setIncludePromptInFilename] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  
  const [editingSubject, setEditingSubject] = useState(false)
  const [editingScene, setEditingScene] = useState(false)
  const [editingStyle, setEditingStyle] = useState(false)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedScene, setEditedScene] = useState('')
  const [editedStyle, setEditedStyle] = useState('')
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedScene, setCopiedScene] = useState(false)
  const [copiedStyle, setCopiedStyle] = useState(false)
  
  const [editingCombined, setEditingCombined] = useState(false)
  const [editedCombined, setEditedCombined] = useState('')
  const [copiedCombined, setCopiedCombined] = useState(false)
  
  const [internalSeed, setInternalSeed] = useState<number | null>(controlledSeedProp ?? null)

  useEffect(() => {
    if (controlledSeedProp !== undefined) {
      setInternalSeed(controlledSeedProp)
    }
  }, [controlledSeedProp])

  const seed = controlledSeedProp !== undefined ? controlledSeedProp : internalSeed
  const setSeed = setControlledSeedProp ?? setInternalSeed

  const referenceInputRef = useRef<HTMLInputElement>(null)
  const generatedImagesRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (generatedImages.length > 0 && generatedImagesRef.current) {
      setTimeout(() => {
        generatedImagesRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
    }
  }, [generatedImages.length])
  
  const handleCopyPrompt = () => {
    const finalPrompt = manualPrompt.trim() || combinedPrompt
    navigator.clipboard.writeText(finalPrompt)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }
  
  const handleCopySubject = () => {
    navigator.clipboard.writeText(subjectAnalysisText)
    setCopiedSubject(true)
    setTimeout(() => setCopiedSubject(false), 2000)
  }
  
  const handleCopyScene = () => {
    navigator.clipboard.writeText(sceneAnalysisText)
    setCopiedScene(true)
    setTimeout(() => setCopiedScene(false), 2000)
  }
  
  const handleCopyStyle = () => {
    navigator.clipboard.writeText(styleAnalysisText)
    setCopiedStyle(true)
    setTimeout(() => setCopiedStyle(false), 2000)
  }
  
  const handleCopyCombined = () => {
    const textToCopy = editingCombined ? editedCombined : combinedPrompt
    navigator.clipboard.writeText(textToCopy)
    setCopiedCombined(true)
    setTimeout(() => setCopiedCombined(false), 2000)
  }
  
  const handleClearSubject = () => {
    setEditedSubject('')
    setEditingSubject(false)
    onClearSubjectAnalysis()
  }
  
  const handleClearScene = () => {
    setEditedScene('')
    setEditingScene(false)
    onClearSceneAnalysis()
  }
  
  const handleClearStyle = () => {
    setEditedStyle('')
    setEditingStyle(false)
    onClearStyleAnalysis()
  }
  
  const handleClearCombined = () => {
    setEditedCombined('')
    setEditingCombined(false)
    setMainPrompt('')
  }
  
  const handleGenerate = async () => {
    const finalPrompt = mainPrompt.trim() || combinedPrompt.trim() || 'a beautiful scene'
    
    console.log('[v0] handleGenerate called')
    console.log('[v0] mainPrompt:', mainPrompt)
    console.log('[v0] combinedPrompt:', combinedPrompt)
    console.log('[v0] finalPrompt:', finalPrompt)
    
    if (onParametersSave) {
      onParametersSave({
        mainPrompt: finalPrompt,
        aspectRatio,
        selectedStylePreset,
        imageCount,
        negativePrompt,
        selectedCameraAngle,
        selectedCameraLens,
        styleStrength,
        seed,
      })
    }

    let enhancedPrompt = finalPrompt
    
    if (selectedStylePreset !== 'Realistic') {
      enhancedPrompt += `. Style: ${selectedStylePreset}`
    }
    
    if (selectedCameraAngle) {
      enhancedPrompt += `. Camera angle: ${selectedCameraAngle}`
    }
    if (selectedCameraLens) {
      enhancedPrompt += `. Camera lens: ${selectedCameraLens}`
    }
    
    const strengthModifier = {
      subtle: 'subtle style influence',
      moderate: 'moderate style influence',
      strong: 'strong style influence'
    }[styleStrength]
    enhancedPrompt += `. ${strengthModifier}`
    
    if (negativePrompt.trim()) {
      enhancedPrompt += `\n\nIMPORTANT: Do NOT include any of these elements: ${negativePrompt.trim()}`
    }
    
    console.log('[v0] Final prompt being sent:', enhancedPrompt)
    console.log('[v0] Negative prompt applied:', negativePrompt.trim() || 'none')
    
    try {
      const newImages = await generateImages({
        prompt: enhancedPrompt,
        count: imageCount,
        aspectRatio,
        seed,
        referenceImage: referenceImage?.file,
        model: controlledSelectedModel,
        imageSize: controlledImageSize,
      })

      console.log('[v0] ⭐ generateImages returned:', newImages?.length || 0, 'images')
      console.log('[v0] ⭐ newImages data:', newImages ? JSON.stringify(newImages.map(img => ({ url: img.url?.substring(0, 50) + '...', prompt: img.prompt?.substring(0, 30) }))) : 'null')

      if (newImages && newImages.length > 0) {
        const imageUrls = newImages.map(img => img.url)
        
        const dimensionsMap: Record<string, string> = {
          '1:1': '1024×1024',
          '16:9': '1344×768',
          '9:16': '768×1344',
          '4:3': '1152×896',
          '3:4': '896×1152',
        }

        console.log('[v0] ⭐ Starting getImageMetadata for', imageUrls.length, 'images')
        const metadataPromises = imageUrls.map(url => getImageMetadata(url))
        const metadataResults = await Promise.all(metadataPromises)
        console.log('[v0] ⭐ getImageMetadata completed:', JSON.stringify(metadataResults))

        console.log('[v0] About to save history for', imageUrls.length, 'images')

        // Save all images to history with proper await
        for (let i = 0; i < imageUrls.length; i++) {
          const url = imageUrls[i]
          const metadata = metadataResults[i]

          console.log('[v0] Calling saveToHistory for image', i + 1)
          try {
            await saveToHistory(
              finalPrompt,
              aspectRatio,
              [url],
              {
                style: selectedStylePreset || 'Realistic',
                dimensions: metadata.dimensions,
                fileSize: metadata.fileSize,
              }
            )
            console.log('[v0] saveToHistory completed for image', i + 1)
          } catch (saveError) {
            console.error('[v0] saveToHistory failed for image', i + 1, saveError)
          }
        }
      }
    } catch (err) {
      console.error('[v0] Image generation error:', err)
    }
  }
  
  const handleDownloadImage = (imageUrl: string, index: number, prompt?: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    
    if (includePromptInFilename && prompt) {
      const sanitizedPrompt = prompt.substring(0, 50).replace(/[^a-z0-9]/gi, '-').toLowerCase()
      link.download = `${sanitizedPrompt}-${Date.now()}.png`
    } else {
      link.download = `generated-image-${index + 1}-${Date.now()}.png`
    }
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const subjectAnalysisText = useMemo(() => {
    if (editingSubject) return editedSubject
    
    const selectedSubjectIds = subjectImages
      .filter(img => img.selected)
      .map(img => img.id)
    
    const analyses = analysisResults.subjects
      .filter(subj => selectedSubjectIds.includes(subj.id) && subj.analysis?.trim())
      .map(subj => subj.analysis)
    
    return analyses.join('\n\n')
  }, [subjectImages, analysisResults.subjects, editingSubject, editedSubject])

  const sceneAnalysisText = useMemo(() => {
    if (editingScene) return editedScene
    return analysisResults.scene?.analysis || ''
  }, [analysisResults.scene, editingScene, editedScene])

  const styleAnalysisText = useMemo(() => {
    if (editingStyle) return editedStyle
    return analysisResults.style?.analysis || ''
  }, [analysisResults.style, editingStyle, editedStyle])
  
  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file')
      e.target.value = ''  // Reset input to allow re-selecting
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB')
      e.target.value = ''  // Reset input to allow re-selecting
      return
    }

    const preview = URL.createObjectURL(file)
    setReferenceImage({ file, preview })
    e.target.value = ''  // Reset input to allow re-selecting same file
  }
  
  const handleRemoveReferenceImage = () => {
    if (referenceImage?.preview) {
      URL.revokeObjectURL(referenceImage.preview)
    }
    setReferenceImage(null)
    // Reset file input to allow re-selecting the same file
    if (referenceInputRef.current) {
      referenceInputRef.current.value = ''
    }
  }
  
  const getImageMetadata = async (url: string) => {
    return new Promise<{ dimensions: string; fileSize: string }>((resolve) => {
      const img = new Image()
      img.onload = async () => {
        const dimensions = `${img.width}×${img.height}`

        // Calculate file size - handle data URLs vs HTTP URLs differently
        let fileSize = '~2 MB'
        try {
          if (url.startsWith('data:')) {
            // For data URLs, calculate from base64 length
            const base64Data = url.split(',')[1]
            if (base64Data) {
              const bytes = Math.ceil((base64Data.length * 3) / 4)
              const mb = bytes / (1024 * 1024)
              fileSize = `~${mb.toFixed(1)} MB`
            }
          } else {
            // For HTTP URLs, use HEAD request
            const response = await fetch(url, { method: 'HEAD' })
            const contentLength = response.headers.get('content-length')
            if (contentLength) {
              const bytes = parseInt(contentLength, 10)
              const mb = bytes / (1024 * 1024)
              fileSize = `~${mb.toFixed(1)} MB`
            }
          }
        } catch (error) {
          console.error('[v0] Failed to get file size:', error)
        }

        resolve({ dimensions, fileSize })
      }
      img.onerror = () => {
        resolve({ dimensions: 'Unknown', fileSize: 'Unknown' })
      }
      img.src = url
    })
  }

  useImperativeHandle(ref, () => ({
    triggerGenerate: handleGenerate,
    isGenerating
  }), [handleGenerate, isGenerating]) // Added dependency array for useImperativeHandle

  const handleClearAll = () => {
    clearImages()
    if (onClearPrompt) {
      onClearPrompt()
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Cards Row - Collapsible */}
      <Card className="bg-zinc-900 border-[#c99850]/30">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowAdvanced(!showAdvanced)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setShowAdvanced(!showAdvanced)
            }
          }}
          className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors rounded-t-lg cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#c99850]">Analysis Cards</span>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleGenerate()
              }}
              size="sm"
              type="button"
              disabled={isGenerating}
              className={`bg-[#c99850] text-black hover:bg-[#dbb56e] transition-all ${
                isGenerating ? 'animate-pulse cursor-not-allowed opacity-80' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#c99850] transition-transform ${
              showAdvanced ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
        
        {showAdvanced && (
          <div className="p-4 pt-0">
            <div className="grid grid-cols-4 gap-4">
              {/* Subject Analysis Card */}
              <Card className="bg-zinc-800 border-2 border-[#c99850]/50 hover:border-[#c99850] transition-colors rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Subject</h3>
                    <p className="text-xs text-white/70">Analyzes the main subject</p>
                  </div>
                  {subjectAnalysisText && (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => {
                          if (editingSubject) {
                            setEditingSubject(false)
                          } else {
                            setEditedSubject(subjectAnalysisText)
                            setEditingSubject(true)
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                      >
                        {editingSubject ? 'Save' : 'Edit'}
                      </Button>
                      <Button
                        onClick={handleCopySubject}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                      >
                        {copiedSubject ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                      <Button
                        onClick={handleClearSubject}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-red-900/20 hover:bg-red-900/30 text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <textarea
                  value={subjectAnalysisText}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  placeholder="Subject analysis will appear here..."
                  className="w-full h-32 px-3 py-2 rounded-lg text-xs bg-zinc-900 text-white placeholder:text-white/50 border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none"
                  readOnly={!editingSubject}
                />
              </Card>
              
              {/* Scene Analysis Card */}
              <Card className="bg-zinc-800 border-2 border-[#c99850]/50 hover:border-[#c99850] transition-colors rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Scene</h3>
                    <p className="text-xs text-white/70">Analyzes the environment</p>
                  </div>
                  {sceneAnalysisText && (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => {
                          if (editingScene) {
                            setEditingScene(false)
                          } else {
                            setEditedScene(sceneAnalysisText)
                            setEditingScene(true)
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                      >
                        {editingScene ? 'Save' : 'Edit'}
                      </Button>
                      <Button
                        onClick={handleCopyScene}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                      >
                        {copiedScene ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                      <Button
                        onClick={handleClearScene}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-red-900/20 hover:bg-red-900/30 text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <textarea
                  value={sceneAnalysisText}
                  onChange={(e) => setEditedScene(e.target.value)}
                  placeholder="Scene analysis will appear here..."
                  className="w-full h-32 px-3 py-2 rounded-lg text-xs bg-zinc-900 text-white placeholder:text-white/50 border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none"
                  readOnly={!editingScene}
                />
              </Card>
              
              {/* Style Analysis Card */}
              <Card className="bg-zinc-800 border-2 border-[#c99850]/50 hover:border-[#c99850] transition-colors rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Style</h3>
                    <p className="text-xs text-white/70">Identifies artistic style</p>
                  </div>
                  {styleAnalysisText && (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => {
                          if (editingStyle) {
                            setEditingStyle(false)
                          } else {
                            setEditedStyle(styleAnalysisText)
                            setEditingStyle(true)
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                      >
                        {editingStyle ? 'Save' : 'Edit'}
                      </Button>
                      <Button
                        onClick={handleCopyStyle}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                      >
                        {copiedStyle ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                      <Button
                        onClick={handleClearStyle}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-red-900/20 hover:bg-red-900/30 text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <textarea
                  value={styleAnalysisText}
                  onChange={(e) => setEditedStyle(e.target.value)}
                  placeholder="Style analysis will appear here..."
                  className="w-full h-32 px-3 py-2 rounded-lg text-xs bg-zinc-900 text-white placeholder:text-white/50 border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none"
                  readOnly={!editingStyle}
                />
              </Card>
              
              {/* Combined Prompt Card */}
              <Card className="bg-zinc-800 border-2 border-[#c99850]/50 hover:border-[#c99850] transition-colors rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Combined Prompt</h3>
                    <p className="text-xs text-white/70">
                      {hasPrompt ? "Combined analysis ready" : "Upload images to auto-generate"}
                    </p>
                  </div>
                  {hasPrompt && (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => {
                          if (editingCombined) {
                            setEditingCombined(false)
                          } else {
                            setEditedCombined(combinedPrompt)
                            setEditingCombined(true)
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                      >
                        {editingCombined ? 'Save' : 'Edit'}
                      </Button>
                      <Button
                        onClick={handleCopyCombined}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                      >
                        {copiedCombined ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                      <Button
                        onClick={handleClearCombined}
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] bg-red-900/20 hover:bg-red-900/30 text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {editingCombined ? (
                  <textarea
                    value={editedCombined}
                    onChange={(e) => setEditedCombined(e.target.value)}
                    className="w-full h-32 px-3 py-2 rounded-lg text-xs bg-zinc-900 text-white placeholder:text-white/50 border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none"
                  />
                ) : (
                  <div className="h-32 overflow-y-auto text-xs text-white/80 leading-relaxed px-1 bg-zinc-900 rounded-lg p-3 border border-[#c99850]/30">
                    {hasPrompt ? combinedPrompt : (
                      <div className="text-center py-8">
                        <p className="text-xs text-white/70">Upload images to auto-generate prompts</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </Card>
      
      {/* Generator Controls - Collapsible */}
      <Card className="bg-zinc-900 border-[#c99850]/30">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowAdvanced(!showAdvanced)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setShowAdvanced(!showAdvanced)
            }
          }}
          className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors rounded-t-lg cursor-pointer"
        >
          <span className="text-xs font-bold text-[#c99850]">Generation Controls</span>
          <ChevronDown
            className={`w-4 h-4 text-[#c99850] transition-transform ${
              showAdvanced ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
        
        {showAdvanced && (
          <div className="p-4 pt-0 space-y-4">
            {/* Main and Negative Prompts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white mb-2 block">
                  Main Prompt (type here or use combined analysis)
                </label>
                <textarea
                  value={mainPrompt}
                  onChange={(e) => setMainPrompt(e.target.value)}
                  placeholder="Describe the image you want... or leave empty to use combined analysis"
                  className="w-full h-24 px-4 py-3 rounded-lg text-sm bg-zinc-800 text-white placeholder:text-white/50 border-2 border-[#c99850]/50 hover:border-[#c99850] focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-white mb-2 block">
                  Negative Prompt (exclude unwanted elements)
                </label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g. blurry, low quality, distorted"
                  className="w-full h-24 px-4 py-3 rounded-lg text-sm bg-zinc-800 text-white placeholder:text-white/50 border-2 border-[#c99850]/50 hover:border-[#c99850] focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none"
                />
              </div>
            </div>

            {/* Model and Resolution Controls */}
            <div className="grid grid-cols-2 gap-4">
              {/* Model Selector */}
              <div className="bg-zinc-800 rounded-lg p-3 border-2 border-[#c99850]/50">
                <label className="text-xs font-bold text-white mb-2 block">
                  AI Model
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setControlledSelectedModel?.('gemini-2.5-flash-image')
                      // Reset to 1K when switching to Flash (doesn't support higher)
                      if (controlledImageSize !== '1K') {
                        setControlledImageSize?.('1K')
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      controlledSelectedModel === 'gemini-2.5-flash-image'
                        ? 'bg-[#c99850] text-black'
                        : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
                    }`}
                  >
                    <div className="font-bold">Gemini 2.5 Flash</div>
                    <div className="text-[10px] opacity-70">Fast, 1K only</div>
                  </button>
                  <button
                    onClick={() => setControlledSelectedModel?.('gemini-3-pro-image-preview')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      controlledSelectedModel === 'gemini-3-pro-image-preview'
                        ? 'bg-[#c99850] text-black'
                        : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
                    }`}
                  >
                    <div className="font-bold">Gemini 3 Pro</div>
                    <div className="text-[10px] opacity-70">Quality, 2K/4K</div>
                  </button>
                </div>
              </div>

              {/* Resolution Selector */}
              <div className="bg-zinc-800 rounded-lg p-3 border-2 border-[#c99850]/50">
                <label className="text-xs font-bold text-white mb-2 block">
                  Resolution
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setControlledImageSize?.('1K')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      controlledImageSize === '1K'
                        ? 'bg-[#c99850] text-black'
                        : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
                    }`}
                  >
                    <div className="font-bold">1K</div>
                    <div className="text-[10px] opacity-70">~1024px</div>
                  </button>
                  <button
                    onClick={() => setControlledImageSize?.('2K')}
                    disabled={controlledSelectedModel === 'gemini-2.5-flash-image'}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      controlledImageSize === '2K'
                        ? 'bg-[#c99850] text-black'
                        : controlledSelectedModel === 'gemini-2.5-flash-image'
                          ? 'bg-zinc-900/50 text-white/30 cursor-not-allowed border border-zinc-700'
                          : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
                    }`}
                  >
                    <div className="font-bold">2K</div>
                    <div className="text-[10px] opacity-70">~2048px</div>
                  </button>
                  <button
                    onClick={() => setControlledImageSize?.('4K')}
                    disabled={controlledSelectedModel === 'gemini-2.5-flash-image'}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      controlledImageSize === '4K'
                        ? 'bg-[#c99850] text-black'
                        : controlledSelectedModel === 'gemini-2.5-flash-image'
                          ? 'bg-zinc-900/50 text-white/30 cursor-not-allowed border border-zinc-700'
                          : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
                    }`}
                  >
                    <div className="font-bold">4K</div>
                    <div className="text-[10px] opacity-70">~4096px</div>
                  </button>
                </div>
                {controlledSelectedModel === 'gemini-2.5-flash-image' && (
                  <p className="text-[10px] text-white/50 mt-2">
                    Switch to Gemini 3 Pro for 2K/4K resolution
                  </p>
                )}
              </div>
            </div>

            {/* SeedControlDropdown */}
            <SeedControlDropdown seed={seed} onSeedChange={setSeed} />

            {/* Reference Image */}
            <div className="bg-zinc-800 rounded-lg p-3 border-2 border-[#c99850]/50">
              <label className="text-xs font-bold text-white mb-2 block">
                Reference Image (optional - for image-to-image generation)
              </label>
              {referenceImage ? (
                <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-2 border border-[#c99850]/30">
                  <img
                    src={referenceImage.preview || "/placeholder.svg"}
                    alt="Reference"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-[10px] text-white font-medium">{referenceImage.file.name}</p>
                    <p className="text-[8px] text-white/60">
                      {(referenceImage.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    onClick={handleRemoveReferenceImage}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => referenceInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#c99850]/50 hover:border-[#c99850] rounded-lg p-3 bg-zinc-900 hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#c99850] to-[#dbb56e] border-2 border-[#f4d698] flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-[10px] text-white/70">Click to upload reference image</p>
                  <p className="text-[8px] text-white/60">JPEG, PNG, WebP (max 10MB)</p>
                </button>
              )}
              <input
                ref={referenceInputRef}
                type="file"
                accept="image/*"
                onChange={handleReferenceImageUpload}
                className="hidden"
              />
            </div>

            {/* Generation controls row */}
            <div className="flex items-center gap-4 flex-wrap pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 ml-auto">
                {generatedImages.length > 0 && (
                  <Button
                    onClick={handleClearAll}
                    variant="ghost"
                    size="sm"
                    className="bg-zinc-800 text-[#c99850] hover:bg-zinc-700"
                    disabled={isGenerating}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Generated Images Section */}
      {generatedImages.length > 0 && (
        <Card ref={generatedImagesRef} className="bg-zinc-900 border-[#c99850]/30 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Generated Images ({generatedImages.length})</h3>
          <div className="grid grid-cols-2 gap-4">
            {generatedImages.map((img, index) => (
              <GeneratedImageCard
                key={index}
                imageUrl={img.url}
                imagePrompt={img.prompt}
                imageTimestamp={img.timestamp}
                index={index}
                aspectRatio={aspectRatio}
                selectedStylePreset={selectedStylePreset}
                parameters={{
                  mainPrompt: img.prompt,
                  aspectRatio,
                  selectedStylePreset,
                  imageCount,
                  negativePrompt,
                  selectedCameraAngle,
                  selectedCameraLens,
                  styleStrength,
                }}
                isFavorite={isFavorite(img.url)}
                onToggleFavorite={async () => {
                  const freshMetadata = await getImageMetadata(img.url)
                  toggleFavorite(img.url, {
                    ratio: aspectRatio,
                    style: selectedStylePreset,
                    dimensions: freshMetadata.dimensions,
                    fileSize: freshMetadata.fileSize,
                    prompt: img.prompt,
                    timestamp: img.timestamp,
                    parameters: {
                      mainPrompt: img.prompt,
                      aspectRatio,
                      selectedStylePreset,
                      imageCount,
                      negativePrompt,
                      selectedCameraAngle,
                      selectedCameraLens,
                      styleStrength,
                    }
                  })
                }}
                onDownload={() => handleDownloadImage(img.url, index, img.prompt)}
                onOpenLightbox={() => onOpenLightbox(index)}
                onRestoreParameters={onRestoreParameters}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Error display */}
      {error && (
        <Card className="bg-red-900/20 border-red-900/50 p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}
    </div>
  )
})
