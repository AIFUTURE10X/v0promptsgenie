"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Wand2, Heart, X, Settings, ChevronLeft, ChevronRight, Download, Clock, Home, ImageIcon, Layers } from 'lucide-react'
import Link from 'next/link'
import { UploadPanel } from './components/UploadPanel'
import { GeneratePanel } from './components/GeneratePanel'
import { LogoPanel } from './components/LogoPanel'
import { AIHelperSidebar } from './components/AIHelperSidebar'
import { ImageStudioToolbar } from './components/ImageStudioToolbar'
import { useImageUpload } from './hooks/useImageUpload'
import { useImageAnalysis } from './hooks/useImageAnalysis'
import { useParameters } from './hooks/useParameters'
import { useFavorites, FavoritesModal } from './components/SimpleFavorites'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ParameterHistoryPanel } from './components/ParameterHistoryPanel'
import { AnalysisCards } from './components/AnalysisCards/AnalysisCards'
import { useStyleAutoDetection } from './hooks/useStyleAutoDetection'
import { useCameraAutoDetection } from './hooks/useCameraAutoDetection'

export default function ImageStudioPage() {
  const uploadState = useImageUpload()
  const { analyzeImage, analyzing } = useImageAnalysis()
  const { saveParameters, loadParameters, hasStoredParams } = useParameters()
  
  const { favorites, toggleFavorite, isFavorite, clearAll } = useFavorites()
  const [showFavorites, setShowFavorites] = useState(false)
  const [showParameterHistory, setShowParameterHistory] = useState(false)

  const [analysisResults, setAnalysisResults] = useState<{
    subjects: any[]
    scene: any | null
    style: any | null
  }>({
    subjects: [],
    scene: null,
    style: null
  })

  const [showAIHelper, setShowAIHelper] = useState(false)
  const [showUploadSection, setShowUploadSection] = useState(true)
  const [activeTab, setActiveTab] = useState<'generate' | 'logo'>('generate')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; prompt?: string; timestamp?: number }>>([])
  
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [selectedStylePreset, setSelectedStylePreset] = useState('Realistic')
  const [stylePopoverOpen, setStylePopoverOpen] = useState(false)
  const [ratiosPopoverOpen, setRatiosPopoverOpen] = useState(false)
  const [imageCount, setImageCount] = useState(1)
  const [negativePrompt, setNegativePrompt] = useState('')
  const [mainPrompt, setMainPromptState] = useState('')

  // Wrapper to debug state changes
  const setMainPrompt = (value: string) => {
    console.log('[v0] setMainPrompt called with:', value?.substring(0, 50) + '...')
    console.log('[v0] Current mainPrompt before update:', mainPrompt?.substring(0, 50) + '...')
    setMainPromptState(value)
    // Force log after setState
    setTimeout(() => {
      console.log('[v0] mainPrompt should now be updated')
    }, 100)
  }
  const [seed, setSeed] = useState<number | null>(null)
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K')
  const [selectedModel, setSelectedModel] = useState<'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'>('gemini-2.5-flash-image')

  // Debug: Log whenever mainPrompt changes
  useEffect(() => {
    console.log('[v0] *** mainPrompt STATE CHANGED to:', mainPrompt?.substring(0, 50) + '...')
  }, [mainPrompt])

  const stylePresets = [
    { value: 'Realistic', label: 'Realistic', thumbnail: '/realistic-photograph.jpg', description: 'Photorealistic details, natural lighting' },
    { value: 'Cartoon Style', label: 'Cartoon Style', thumbnail: '/cartoon-style.jpg', description: 'Bold outlines, simple colors' },
    { value: 'Pixar', label: 'Pixar', thumbnail: '/pixar-3d-animation.jpg', description: '3D animated, vibrant colors' },
    { value: 'PhotoReal', label: 'PhotoReal', thumbnail: '/photorealistic-cgi.jpg', description: 'Ultra-detailed CGI rendering' },
    { value: 'Anime', label: 'Anime', thumbnail: '/anime-style-character.png', description: 'Japanese anime, expressive eyes' },
    { value: 'Oil Painting', label: 'Oil Painting', thumbnail: '/abstract-oil-painting.png', description: 'Visible brush strokes, texture' },
    { value: 'Watercolor', label: 'Watercolor', thumbnail: '/watercolor-painting-still-life.png', description: 'Soft textures, fluid transitions' },
    { value: '3D Render', label: '3D Render', thumbnail: '/abstract-3d-render.png', description: 'Soft 3D realism, appealing shapes' },
    { value: 'Sketch', label: 'Sketch', thumbnail: '/pencil-sketch.png', description: 'Hand-drawn pencil textures' },
    { value: 'Pencil Sketch', label: 'Pencil Sketch', thumbnail: '/pencil-sketch-drawing.jpg', description: 'Detailed pencil drawing, cross-hatching, shading' },
    { value: 'Comic Book', label: 'Comic Book', thumbnail: '/comic-book-art.png', description: 'Bold style, halftone patterns' },
    { value: 'Studio Ghibli', label: 'Studio Ghibli', thumbnail: '/studio-ghibli-style.jpg', description: 'Hand-painted, pastoral nature' },
    { value: 'Makoto Shinkai', label: 'Makoto Shinkai', thumbnail: '/makoto-shinkai-anime.jpg', description: 'Soft 3D, expressive lighting' },
    { value: 'Disney Modern 3D', label: 'Disney Modern 3D', thumbnail: '/disney-3d-animation.jpg', description: 'High-finish animation, glossy' },
    { value: 'Sony Spider-Verse', label: 'Sony Spider-Verse', thumbnail: '/spider-verse-style.jpg', description: 'Mixed media, comic book look' },
    { value: 'Laika', label: 'Laika', thumbnail: '/laika-stop-motion.jpg', description: 'Handcrafted textures, moody' },
    { value: 'Cartoon Saloon', label: 'Cartoon Saloon', thumbnail: '/cartoon-saloon-style.jpg', description: 'Flat decorative, Celtic motifs' },
    { value: 'Studio Trigger', label: 'Studio Trigger', thumbnail: '/studio-trigger-anime.jpg', description: 'Neon palettes, explosive motion' },
    { value: 'Ufotable', label: 'Ufotable', thumbnail: '/ufotable-anime.jpg', description: 'Hyper-polished, VFX glow trails' },
    { value: 'Kyoto Animation', label: 'Kyoto Animation', thumbnail: '/kyoto-animation.jpg', description: 'Slice-of-life realism, delicate' },
  ]

  const [selectedCameraAngle, setSelectedCameraAngle] = useState('')
  const [selectedCameraLens, setSelectedCameraLens] = useState('')
  const [styleStrength, setStyleStrength] = useState<'subtle' | 'moderate' | 'strong'>('moderate')
  const [referenceImage, setReferenceImage] = useState<any | null>(null)
  const [analysisMode, setAnalysisMode] = useState<'fast' | 'quality'>('fast')
  
  const generatePanelRef = useRef<{ triggerGenerate: () => void; isGenerating: boolean }>(null)

  // Ref to track which images are currently being analyzed
  const analyzingRef = useRef<Set<string>>(new Set())
  const analysisResultsRef = useRef(analysisResults)
  // Track if we've ever had images uploaded (to only reset when images are removed, not on initial load)
  const hadImagesRef = useRef(false)

  // Keep ref in sync with state
  useEffect(() => {
    analysisResultsRef.current = analysisResults
  }, [analysisResults])

  const handleClearSubjectAnalysis = () => {
    setAnalysisResults(prev => ({
      ...prev,
      subjects: []
    }))
  }

  const handleClearSceneAnalysis = () => {
    setAnalysisResults(prev => ({
      ...prev,
      scene: null
    }))
  }

  const handleClearStyleAnalysis = () => {
    setAnalysisResults(prev => ({
      ...prev,
      style: null
    }))
  }

  const handleRestoreParameters = (params?: any) => {
    const paramsToRestore = params || loadParameters()
    if (paramsToRestore) {
      if (paramsToRestore.mainPrompt) setMainPrompt(paramsToRestore.mainPrompt)
      if (paramsToRestore.aspectRatio) setAspectRatio(paramsToRestore.aspectRatio)
      if (paramsToRestore.selectedStylePreset) setSelectedStylePreset(paramsToRestore.selectedStylePreset)
      if (paramsToRestore.imageCount) setImageCount(paramsToRestore.imageCount)
      if (paramsToRestore.negativePrompt) setNegativePrompt(paramsToRestore.negativePrompt)
      if (paramsToRestore.selectedCameraAngle) setSelectedCameraAngle(paramsToRestore.selectedCameraAngle)
      if (paramsToRestore.selectedCameraLens) setSelectedCameraLens(paramsToRestore.selectedCameraLens)
      if (paramsToRestore.styleStrength) setStyleStrength(paramsToRestore.styleStrength)
      if (paramsToRestore.analysisMode) setAnalysisMode(paramsToRestore.analysisMode)
      if (paramsToRestore.seed !== undefined) setSeed(paramsToRestore.seed)
      if (paramsToRestore.imageSize) setImageSize(paramsToRestore.imageSize)
      if (paramsToRestore.selectedModel) setSelectedModel(paramsToRestore.selectedModel)

      console.log('[v0] Restored parameters:', paramsToRestore)
    }
  }

  const handleGenerate = () => {
    if (generatePanelRef.current?.triggerGenerate) {
      generatePanelRef.current.triggerGenerate()
    }
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const navigateLightbox = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : generatedImages.length - 1))
    } else {
      setLightboxIndex((prev) => (prev < generatedImages.length - 1 ? prev + 1 : 0))
    }
  }

  const handleDownloadFromLightbox = () => {
    const imageUrl = generatedImages[lightboxIndex]?.url
    if (!imageUrl) return

    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `generated-image-${lightboxIndex + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleResetAll = useCallback(() => {
    setMainPrompt('')
    setNegativePrompt('')
    setAspectRatio('1:1')
    setSelectedStylePreset('Realistic')
    setImageCount(1)
    setSelectedCameraAngle('')
    setSelectedCameraLens('')
    setStyleStrength('moderate')
    setSeed(null)
    setImageSize('1K')
    setSelectedModel('gemini-2.5-flash-image')
    setAnalysisResults({
      subjects: [],
      scene: null,
      style: null
    })
    setGeneratedImages([])
    console.log('[v0] Reset all parameters to defaults')
  }, [])

  useEffect(() => {
    const autoAnalyze = async () => {
      console.log('[v0] Auto-analyze triggered', {
        subjectCount: uploadState.subjectImages.length,
        hasScene: !!uploadState.sceneImage,
        hasStyle: !!uploadState.styleImage
      })

      // Analyze subject images
      for (const img of uploadState.subjectImages) {
        if (img.file) {
          const analyzeKey = `subject-${img.id}-${analysisMode}`

          // Check using ref to avoid stale closure
          const currentResults = analysisResultsRef.current
          const existingAnalysis = currentResults.subjects.find(s => s.id === img.id)
          const needsAnalysis = !existingAnalysis || existingAnalysis.mode !== analysisMode
          const isCurrentlyAnalyzing = analyzingRef.current.has(analyzeKey)

          if (needsAnalysis && !isCurrentlyAnalyzing) {
            try {
              analyzingRef.current.add(analyzeKey)
              console.log(`[v0] Analyzing subject ${img.id} in ${analysisMode} mode`)
              const analysis = await analyzeImage(img.file, 'subject', analysisMode)
              console.log(`[v0] Subject analysis complete for ${img.id}:`, analysis?.substring(0, 100))
              setAnalysisResults(prev => ({
                ...prev,
                subjects: [
                  ...prev.subjects.filter(s => s.id !== img.id),
                  { id: img.id, analysis, mode: analysisMode }
                ]
              }))
            } catch (error) {
              console.error('[v0] Auto-analyze subject failed:', error)
            } finally {
              analyzingRef.current.delete(analyzeKey)
            }
          }
        }
      }

      if (uploadState.sceneImage?.file) {
        const analyzeKey = `scene-${analysisMode}`
        const currentResults = analysisResultsRef.current
        const needsAnalysis = !currentResults.scene || currentResults.scene.mode !== analysisMode
        const isCurrentlyAnalyzing = analyzingRef.current.has(analyzeKey)

        if (needsAnalysis && !isCurrentlyAnalyzing) {
          try {
            analyzingRef.current.add(analyzeKey)
            console.log(`[v0] Analyzing scene in ${analysisMode} mode`)
            const analysis = await analyzeImage(uploadState.sceneImage.file, 'scene', analysisMode)
            console.log(`[v0] Scene analysis complete:`, analysis?.substring(0, 100))
            setAnalysisResults(prev => ({
              ...prev,
              scene: { analysis, mode: analysisMode }
            }))
          } catch (error) {
            console.error('[v0] Auto-analyze scene failed:', error)
          } finally {
            analyzingRef.current.delete(analyzeKey)
          }
        }
      }

      if (uploadState.styleImage?.file) {
        const analyzeKey = `style-${analysisMode}-${selectedStylePreset}`
        const currentResults = analysisResultsRef.current
        const needsAnalysis = !currentResults.style || currentResults.style.mode !== analysisMode
        const isCurrentlyAnalyzing = analyzingRef.current.has(analyzeKey)

        if (needsAnalysis && !isCurrentlyAnalyzing) {
          try {
            analyzingRef.current.add(analyzeKey)
            console.log(`[v0] Analyzing style in ${analysisMode} mode`)
            const analysis = await analyzeImage(uploadState.styleImage.file, 'style', analysisMode, selectedStylePreset)
            console.log(`[v0] Style analysis complete:`, analysis?.substring(0, 100))
            setAnalysisResults(prev => ({
              ...prev,
              style: { analysis, mode: analysisMode }
            }))
          } catch (error) {
            console.error('[v0] Auto-analyze style failed:', error)
          } finally {
            analyzingRef.current.delete(analyzeKey)
          }
        }
      }

      const hasImages = uploadState.subjectImages.length > 0 || !!uploadState.sceneImage || !!uploadState.styleImage

      // Track if we've had images
      if (hasImages) {
        hadImagesRef.current = true
      }

      // Only reset when images are explicitly removed (not on initial load with no images)
      if (!hasImages && hadImagesRef.current) {
        handleResetAll()
        hadImagesRef.current = false
      }
    }

    autoAnalyze()
  }, [uploadState.subjectImages, uploadState.sceneImage, uploadState.styleImage, analysisMode, selectedStylePreset, handleResetAll, analyzeImage])

  const detectedStyle = useStyleAutoDetection(
    analysisResults.style?.analysis || null,
    stylePresets
  )

  useEffect(() => {
    if (detectedStyle) {
      setSelectedStylePreset(detectedStyle)
    }
  }, [detectedStyle])

  const { detectedAngle, detectedLens, detectedRatio } = useCameraAutoDetection(
    analysisResults.scene?.analysis || null
  )

  useEffect(() => {
    if (detectedRatio) setAspectRatio(detectedRatio)
    if (detectedAngle) setSelectedCameraAngle(detectedAngle)
    if (detectedLens) setSelectedCameraLens(detectedLens)
  }, [detectedRatio, detectedAngle, detectedLens])

  const combinedPrompt = `${mainPrompt} ${negativePrompt}`
  const hasPrompt = mainPrompt.trim() !== ''

  const styleValues = stylePresets.map(p => p.value)
  const aspectRatioOptions = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '21:9']
  const cameraAngleOptions = [
    'Eye-level shot',
    'Low-angle shot',
    'High-angle shot',
    'Aerial view',
    'Dutch angle',
    'Over-the-shoulder shot',
    'Point-of-view shot',
    "Bird's-eye view",
    "Worm's-eye view",
  ]
  const cameraLensOptions = [
    '14mm ultra-wide',
    '16mm fisheye',
    '24mm wide-angle',
    '35mm standard',
    '50mm prime',
    '85mm portrait',
    '135mm telephoto',
    '200mm super-telephoto',
    'Macro lens',
  ]

  const normalizeValue = (
    value: string | undefined,
    options: string[],
    synonyms: Record<string, string> = {}
  ) => {
    if (!value) return undefined
    const trimmed = value.trim()
    if (!trimmed) return undefined

    const lower = trimmed.toLowerCase()
    const direct = options.find(option => option.toLowerCase() === lower)
    if (direct) return direct

    if (synonyms[lower]) return synonyms[lower]

    const simplified = lower.replace(/[^a-z0-9]/g, '')
    const simplifiedMatch = options.find(option => option.toLowerCase().replace(/[^a-z0-9]/g, '') === simplified)
    if (simplifiedMatch) return simplifiedMatch

    const partial = options.find(option => option.toLowerCase().includes(lower))
    if (partial) return partial

    return undefined
  }

  const styleSynonyms: Record<string, string> = {
    'laika stop-motion': 'Laika',
    'laika stop motion': 'Laika',
    'sony spiderverse': 'Sony Spider-Verse',
    'sony spider verse': 'Sony Spider-Verse',
    'photo real': 'PhotoReal',
    'photoreal': 'PhotoReal',
    'photo realistic': 'PhotoReal',
    'photo-realistic': 'PhotoReal',
    'pixar style': 'Pixar',
    'studio ghibli style': 'Studio Ghibli',
    'studio trigger style': 'Studio Trigger',
    'kyoto animation style': 'Kyoto Animation',
    'cartoon style art': 'Cartoon Style',
    'cartoon-style': 'Cartoon Style',
    'anime style': 'Anime',
    '3d render style': '3D Render',
    'comic book style': 'Comic Book',
    'pencil sketch style': 'Pencil Sketch',
    'watercolor style': 'Watercolor',
  }

  const cameraAngleSynonyms: Record<string, string> = {
    'eye level': 'Eye-level shot',
    'eye-level': 'Eye-level shot',
    'eye level shot': 'Eye-level shot',
    'eyelevel shot': 'Eye-level shot',
    'eyelevel': 'Eye-level shot',
    'low angle': 'Low-angle shot',
    'low-angle': 'Low-angle shot',
    'low angle shot': 'Low-angle shot',
    'high angle': 'High-angle shot',
    'high-angle': 'High-angle shot',
    'high angle shot': 'High-angle shot',
    'birdseye': "Bird's-eye view",
    'birds eye': "Bird's-eye view",
    'bird eye': "Bird's-eye view",
    'bird-eye': "Bird's-eye view",
    'aerial': 'Aerial view',
    'over the shoulder': 'Over-the-shoulder shot',
    'over-the-shoulder': 'Over-the-shoulder shot',
    'point of view': 'Point-of-view shot',
    'pov': 'Point-of-view shot',
    'worms eye': "Worm's-eye view",
    'worm eye': "Worm's-eye view",
    'dutch': 'Dutch angle',
  }

  const cameraLensSynonyms: Record<string, string> = {
    '14mm': '14mm ultra-wide',
    '14 mm': '14mm ultra-wide',
    'ultra wide': '14mm ultra-wide',
    'ultra-wide': '14mm ultra-wide',
    '16mm': '16mm fisheye',
    '16 mm': '16mm fisheye',
    'fisheye': '16mm fisheye',
    '24mm': '24mm wide-angle',
    'wide angle': '24mm wide-angle',
    'wide-angle': '24mm wide-angle',
    '35mm': '35mm standard',
    'standard': '35mm standard',
    'standard lens': '35mm standard',
    '50mm': '50mm prime',
    '50 mm': '50mm prime',
    'prime': '50mm prime',
    'prime lens': '50mm prime',
    '85mm': '85mm portrait',
    'portrait': '85mm portrait',
    'portrait lens': '85mm portrait',
    'telephoto lens': '135mm telephoto',
    'telephoto': '135mm telephoto',
    '135mm': '135mm telephoto',
    '200mm': '200mm super-telephoto',
    '200 mm': '200mm super-telephoto',
    'super telephoto': '200mm super-telephoto',
    'super-telephoto': '200mm super-telephoto',
    'macro': 'Macro lens',
    'tilt-shift': '50mm prime',
    'tilt shift': '50mm prime',
  }

  const styleStrengthSynonyms: Record<string, 'subtle' | 'moderate' | 'strong'> = {
    subtle: 'subtle',
    soft: 'subtle',
    light: 'subtle',
    gentle: 'subtle',
    moderate: 'moderate',
    balanced: 'moderate',
    natural: 'moderate',
    standard: 'moderate',
    strong: 'strong',
    bold: 'strong',
    intense: 'strong',
    dramatic: 'strong',
  }

  const handleApplyAISuggestions = (suggestions: any) => {
    console.log('[v0] ===== handleApplyAISuggestions CALLED =====')
    console.log('[v0] Received suggestions:', JSON.stringify(suggestions, null, 2))

    if (!suggestions) {
      console.warn('[v0] No suggestions provided, returning early')
      return
    }

    // Apply prompt - always set even if empty to allow clearing
    if (suggestions.prompt !== undefined) {
      console.log('[v0] Setting mainPrompt to:', suggestions.prompt?.substring(0, 50) + '...')
      setMainPrompt(suggestions.prompt)
    }

    // Apply negative prompt
    if (suggestions.negativePrompt !== undefined) {
      console.log('[v0] Setting negativePrompt to:', suggestions.negativePrompt?.substring(0, 50) + '...')
      setNegativePrompt(suggestions.negativePrompt)
    }

    // Apply style
    const normalizedStyle = normalizeValue(suggestions.style, styleValues, styleSynonyms)
    if (normalizedStyle) {
      console.log('[v0] Setting style to:', normalizedStyle)
      setSelectedStylePreset(normalizedStyle)
    } else if (suggestions.style && suggestions.style !== 'None') {
      console.warn('[v0] Unrecognized style suggestion:', suggestions.style)
    }

    // Apply aspect ratio
    const normalizedAspectRatio = normalizeValue(suggestions.aspectRatio, aspectRatioOptions)
    if (normalizedAspectRatio) {
      console.log('[v0] Setting aspectRatio to:', normalizedAspectRatio)
      setAspectRatio(normalizedAspectRatio)
    } else if (suggestions.aspectRatio) {
      console.warn('[v0] Unrecognized aspect ratio suggestion:', suggestions.aspectRatio)
    }

    // Apply camera angle
    const normalizedCameraAngle = normalizeValue(suggestions.cameraAngle, cameraAngleOptions, cameraAngleSynonyms)
    if (normalizedCameraAngle) {
      console.log('[v0] Setting cameraAngle to:', normalizedCameraAngle)
      setSelectedCameraAngle(normalizedCameraAngle)
    } else if (suggestions.cameraAngle && suggestions.cameraAngle !== 'None') {
      console.warn('[v0] Unrecognized camera angle suggestion:', suggestions.cameraAngle, '- clearing')
      setSelectedCameraAngle('')
    }

    // Apply camera lens
    const normalizedCameraLens = normalizeValue(suggestions.cameraLens, cameraLensOptions, cameraLensSynonyms)
    if (normalizedCameraLens) {
      console.log('[v0] Setting cameraLens to:', normalizedCameraLens)
      setSelectedCameraLens(normalizedCameraLens)
    } else if (suggestions.cameraLens && suggestions.cameraLens !== 'None') {
      console.warn('[v0] Unrecognized camera lens suggestion:', suggestions.cameraLens, '- clearing')
      setSelectedCameraLens('')
    }

    // Apply style strength
    if (suggestions.styleStrength) {
      const strengthKey = suggestions.styleStrength.toLowerCase()
      const normalizedStrength = styleStrengthSynonyms[strengthKey]
      if (normalizedStrength) {
        console.log('[v0] Setting styleStrength to:', normalizedStrength)
        setStyleStrength(normalizedStrength)
      } else {
        console.warn('[v0] Unrecognized style strength suggestion:', suggestions.styleStrength)
      }
    }

    // Apply resolution/image size
    if (suggestions.resolution) {
      const validResolutions = ['1K', '2K', '4K']
      const upperRes = suggestions.resolution.toUpperCase()
      if (validResolutions.includes(upperRes)) {
        console.log('[v0] Setting imageSize to:', upperRes)
        setImageSize(upperRes as '1K' | '2K' | '4K')
      } else {
        console.warn('[v0] Unrecognized resolution suggestion:', suggestions.resolution)
      }
    }

    console.log('[v0] ===== AI suggestions applied successfully =====')
    console.log('[v0] Applied values:', {
      prompt: suggestions.prompt?.substring(0, 30) + '...',
      negativePrompt: suggestions.negativePrompt?.substring(0, 30) + '...',
      style: normalizedStyle,
      aspectRatio: normalizedAspectRatio,
      cameraAngle: normalizedCameraAngle,
      cameraLens: normalizedCameraLens,
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-950 via-black to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-2 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Welcome Card in Header */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                }}
              >
                <Wand2 className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-sm font-medium text-white">Image Studio</span>
            </div>

            {/* Tab Navigation in Header */}
            <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                  activeTab === 'generate'
                    ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Image Generator
              </button>
              <button
                onClick={() => setActiveTab('logo')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                  activeTab === 'logo'
                    ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Logo Generator
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20">PNG</span>
              </button>
            </div>

            <Link href="/">
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-white flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Home</span>
              </Button>
            </Link>
            <Button
              onClick={() => setShowParameterHistory(true)}
              variant="ghost"
              className="text-zinc-400 hover:text-white flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm">History</span>
            </Button>
            {hasStoredParams && (
              <Button
                onClick={() => handleRestoreParameters()}
                className="px-4 py-2 bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black hover:from-[#dbb56e] hover:to-[#c99850] font-medium flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Restore Parameters
              </Button>
            )}
            <Button
              onClick={() => setShowFavorites(true)}
              variant="ghost"
              className="text-zinc-400 hover:text-white flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm">Favorites ({favorites.length})</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-3 pb-2">
        {/* ImageStudioToolbar Component - Only show for generate tab */}
        {activeTab === 'generate' && (
        <ImageStudioToolbar
          showUploadSection={showUploadSection}
          onToggleUpload={() => setShowUploadSection(!showUploadSection)}
          analysisMode={analysisMode}
          onAnalysisModeChange={setAnalysisMode}
          imageCount={imageCount}
          onImageCountChange={setImageCount}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          ratiosPopoverOpen={ratiosPopoverOpen}
          onRatiosPopoverOpenChange={setRatiosPopoverOpen}
          selectedStylePreset={selectedStylePreset}
          onStylePresetChange={setSelectedStylePreset}
          stylePopoverOpen={stylePopoverOpen}
          onStylePopoverOpenChange={setStylePopoverOpen}
          stylePresets={stylePresets}
          onGenerate={handleGenerate}
          isGenerating={generatePanelRef.current?.isGenerating || false}
          selectedCameraAngle={selectedCameraAngle}
          onCameraAngleChange={setSelectedCameraAngle}
          selectedCameraLens={selectedCameraLens}
          onCameraLensChange={setSelectedCameraLens}
          styleStrength={styleStrength}
          onStyleStrengthChange={setStyleStrength}
        />
        )}

        {/* Upload Section (Collapsible) - Only show for generate tab */}
        {activeTab === 'generate' && showUploadSection && (
          <div className="mb-8">
            <UploadPanel
              subjectImages={uploadState.subjectImages}
              sceneImage={uploadState.sceneImage}
              styleImage={uploadState.styleImage}
              isDragging={uploadState.isDragging}
              setIsDragging={uploadState.setIsDragging}
              addSubjectImages={uploadState.addSubjectImages}
              setSceneImageFile={uploadState.setSceneImageFile}
              setStyleImageFile={uploadState.setStyleImageFile}
              removeSubjectImage={uploadState.removeSubjectImage}
              toggleSubjectSelection={uploadState.toggleSubjectSelection}
              clearSceneImage={uploadState.clearSceneImage}
              clearStyleImage={uploadState.clearStyleImage}
              clearAllImages={uploadState.clearAllImages}
              onClearAll={handleResetAll}
            />
          </div>
        )}

        {activeTab === 'generate' && analyzing && (
          <Card className="bg-zinc-900 border-zinc-800 p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#c99850] border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-300">Analyzing uploaded images...</p>
            </div>
          </Card>
        )}

        {/* Generate Section - Only show for generate tab */}
        {activeTab === 'generate' && (
        <div id="generate-section">
          <GeneratePanel
            ref={generatePanelRef}
            subjectImages={uploadState.subjectImages}
            sceneAnalysis={analysisResults.scene}
            styleAnalysis={analysisResults.style}
            analysisResults={analysisResults}
            onClearSubjectAnalysis={handleClearSubjectAnalysis}
            onClearSceneAnalysis={handleClearSceneAnalysis}
            onClearStyleAnalysis={handleClearStyleAnalysis}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            selectedStylePreset={selectedStylePreset}
            setSelectedStylePreset={setSelectedStylePreset}
            imageCount={imageCount}
            setImageCount={setImageCount}
            selectedCameraAngle={selectedCameraAngle}
            selectedCameraLens={selectedCameraLens}
            styleStrength={styleStrength}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            referenceImage={referenceImage}
            setReferenceImage={setReferenceImage}
            mainPrompt={mainPrompt}
            setMainPrompt={setMainPrompt}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            onParametersSave={(params) => saveParameters({ ...params, analysisMode, seed, imageSize, selectedModel })}
            onClearPrompt={() => setMainPrompt('')}
            onRestoreParameters={handleRestoreParameters}
            generatedImages={generatedImages}
            imageSize={imageSize}
            setImageSize={setImageSize}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            setGeneratedImages={(images) => {
              console.log('[v0] page.tsx setGeneratedImages called with', images.length, 'images')
              setGeneratedImages(images)
            }}
            onOpenLightbox={openLightbox}
            seed={seed}
            setSeed={setSeed}
          />
        </div>
        )}

        {/* Logo Generator Section - Only show for logo tab */}
        {activeTab === 'logo' && (
          <LogoPanel
            externalPrompt={mainPrompt}
            externalNegativePrompt={negativePrompt}
          />
        )}
      </main>

      {/* AI Helper floating button and sidebar */}
      {!showAIHelper && (
        <button
          onClick={() => setShowAIHelper(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-linear-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700] hover:from-[#FFED4E] hover:via-[#FFD700] hover:to-[#FFA500] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
          title="AI Prompt Helper"
        >
          <Sparkles className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
        </button>
      )}

      <AIHelperSidebar
        isOpen={showAIHelper}
        onClose={() => setShowAIHelper(false)}
        currentPromptSettings={{
          currentPrompt: mainPrompt,
          currentNegativePrompt: negativePrompt,
          currentStyle: selectedStylePreset,
          currentCameraAngle: selectedCameraAngle,
          currentCameraLens: selectedCameraLens,
          currentAspectRatio: aspectRatio,
          styleStrength,
        }}
        onApplySuggestions={handleApplyAISuggestions}
      />

      {/* Favorites modal overlay */}
      {showFavorites && (
        <FavoritesModal
          favorites={favorites}
          onClose={() => setShowFavorites(false)}
          onRemove={toggleFavorite}
          onClearAll={clearAll}
          onRestoreParameters={handleRestoreParameters}
        />
      )}

      {/* Parameter History Panel */}
      {showParameterHistory && (
        <ParameterHistoryPanel
          isOpen={showParameterHistory}
          onClose={() => setShowParameterHistory(false)}
          onRestoreParameters={handleRestoreParameters}
        />
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw]! max-h-[95vh]! w-[95vw] h-[95vh] p-0 bg-black border-zinc-800 flex items-center justify-center">
          {!generatedImages || generatedImages.length === 0 ? (
            <div className="text-white text-center p-8">
              <p>No images to display</p>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center p-8">
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Download button */}
              <button
                onClick={handleDownloadFromLightbox}
                className="absolute top-4 right-16 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Download image"
              >
                <Download className="w-6 h-6" />
              </button>

              {/* Previous button */}
              {generatedImages.length > 1 && (
                <button
                  onClick={() => navigateLightbox("prev")}
                  className="absolute left-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              {/* Image */}
              <div className="w-full h-full flex items-center justify-center p-8">
                {generatedImages[lightboxIndex] ? (
                  <img
                    src={generatedImages[lightboxIndex].url || "/placeholder.svg"}
                    alt={`Generated image ${lightboxIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <p className="text-white">No image selected</p>
                )}
              </div>

              {/* Next button */}
              {generatedImages.length > 1 && (
                <button
                  onClick={() => navigateLightbox("next")}
                  className="absolute right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}

              {/* Image counter */}
              {generatedImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                  {lightboxIndex + 1} / {generatedImages.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
