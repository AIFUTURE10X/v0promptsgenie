"use client"

import { useState, useEffect } from 'react'
import type { DotMatrixConfig } from '../constants/dot-matrix-config'

export interface AnalysisResultsState {
  subjects: any[]
  scene: any | null
  style: any | null
}

export interface GeneratedImage {
  url: string
  prompt?: string
  timestamp?: number
}

export interface ImageStudioState {
  // Favorites & History UI
  showFavorites: boolean
  setShowFavorites: (show: boolean) => void
  showParameterHistory: boolean
  setShowParameterHistory: (show: boolean) => void

  // Analysis results
  analysisResults: AnalysisResultsState
  setAnalysisResults: (results: AnalysisResultsState) => void

  // UI state
  showAIHelper: boolean
  setShowAIHelper: (show: boolean) => void
  showUploadSection: boolean
  setShowUploadSection: (show: boolean) => void
  activeTab: 'generate' | 'logo' | 'mockups'
  setActiveTab: (tab: 'generate' | 'logo' | 'mockups') => void
  pendingLogoConfig: Partial<DotMatrixConfig> | null
  setPendingLogoConfig: (config: Partial<DotMatrixConfig> | null) => void

  // Lightbox state
  lightboxOpen: boolean
  setLightboxOpen: (open: boolean) => void
  lightboxIndex: number
  setLightboxIndex: (index: number) => void
  generatedImages: GeneratedImage[]
  setGeneratedImages: (images: GeneratedImage[]) => void

  // Generation parameters
  aspectRatio: string
  setAspectRatio: (ratio: string) => void
  selectedStylePreset: string
  setSelectedStylePreset: (preset: string) => void
  stylePopoverOpen: boolean
  setStylePopoverOpen: (open: boolean) => void
  ratiosPopoverOpen: boolean
  setRatiosPopoverOpen: (open: boolean) => void
  imageCount: number
  setImageCount: (count: number) => void
  negativePrompt: string
  setNegativePrompt: (prompt: string) => void
  mainPrompt: string
  setMainPrompt: (prompt: string) => void
  seed: number | null
  setSeed: (seed: number | null) => void
  imageSize: '1K' | '2K' | '4K'
  setImageSize: (size: '1K' | '2K' | '4K') => void
  selectedModel: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'
  setSelectedModel: (model: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview') => void

  // Camera settings
  selectedCameraAngle: string
  setSelectedCameraAngle: (angle: string) => void
  selectedCameraLens: string
  setSelectedCameraLens: (lens: string) => void
  styleStrength: 'subtle' | 'moderate' | 'strong'
  setStyleStrength: (strength: 'subtle' | 'moderate' | 'strong') => void
  referenceImage: any | null
  setReferenceImage: (image: any | null) => void
  analysisMode: 'fast' | 'quality'
  setAnalysisMode: (mode: 'fast' | 'quality') => void
}

export function useImageStudioState(): ImageStudioState {
  // Favorites & History UI
  const [showFavorites, setShowFavorites] = useState(false)
  const [showParameterHistory, setShowParameterHistory] = useState(false)

  // Analysis results
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultsState>({
    subjects: [],
    scene: null,
    style: null
  })

  // UI state
  const [showAIHelper, setShowAIHelper] = useState(false)
  const [showUploadSection, setShowUploadSection] = useState(true)
  const [activeTab, setActiveTab] = useState<'generate' | 'logo' | 'mockups'>('generate')
  const [pendingLogoConfig, setPendingLogoConfig] = useState<Partial<DotMatrixConfig> | null>(null)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])

  // Generation parameters
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [selectedStylePreset, setSelectedStylePreset] = useState('Realistic')
  const [stylePopoverOpen, setStylePopoverOpen] = useState(false)
  const [ratiosPopoverOpen, setRatiosPopoverOpen] = useState(false)
  const [imageCount, setImageCount] = useState(1)
  const [negativePrompt, setNegativePrompt] = useState('')
  const [mainPromptState, setMainPromptState] = useState('')

  // Debug wrapper for main prompt
  const setMainPrompt = (value: string) => {
    console.log('[v0] setMainPrompt called with:', value?.substring(0, 50) + '...')
    console.log('[v0] Current mainPrompt before update:', mainPromptState?.substring(0, 50) + '...')
    setMainPromptState(value)
    setTimeout(() => {
      console.log('[v0] mainPrompt should now be updated')
    }, 100)
  }

  const [seed, setSeed] = useState<number | null>(null)
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K')
  const [selectedModel, setSelectedModel] = useState<'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'>('gemini-2.5-flash-image')

  // Debug: Log whenever mainPrompt changes
  useEffect(() => {
    console.log('[v0] *** mainPrompt STATE CHANGED to:', mainPromptState?.substring(0, 50) + '...')
  }, [mainPromptState])

  // Camera settings
  const [selectedCameraAngle, setSelectedCameraAngle] = useState('')
  const [selectedCameraLens, setSelectedCameraLens] = useState('')
  const [styleStrength, setStyleStrength] = useState<'subtle' | 'moderate' | 'strong'>('moderate')
  const [referenceImage, setReferenceImage] = useState<any | null>(null)
  const [analysisMode, setAnalysisMode] = useState<'fast' | 'quality'>('fast')

  return {
    // Favorites & History UI
    showFavorites, setShowFavorites,
    showParameterHistory, setShowParameterHistory,

    // Analysis results
    analysisResults, setAnalysisResults,

    // UI state
    showAIHelper, setShowAIHelper,
    showUploadSection, setShowUploadSection,
    activeTab, setActiveTab,
    pendingLogoConfig, setPendingLogoConfig,

    // Lightbox state
    lightboxOpen, setLightboxOpen,
    lightboxIndex, setLightboxIndex,
    generatedImages, setGeneratedImages,

    // Generation parameters
    aspectRatio, setAspectRatio,
    selectedStylePreset, setSelectedStylePreset,
    stylePopoverOpen, setStylePopoverOpen,
    ratiosPopoverOpen, setRatiosPopoverOpen,
    imageCount, setImageCount,
    negativePrompt, setNegativePrompt,
    mainPrompt: mainPromptState, setMainPrompt,
    seed, setSeed,
    imageSize, setImageSize,
    selectedModel, setSelectedModel,

    // Camera settings
    selectedCameraAngle, setSelectedCameraAngle,
    selectedCameraLens, setSelectedCameraLens,
    styleStrength, setStyleStrength,
    referenceImage, setReferenceImage,
    analysisMode, setAnalysisMode,
  }
}
