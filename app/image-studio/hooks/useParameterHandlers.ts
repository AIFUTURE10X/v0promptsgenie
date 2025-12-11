"use client"

import { useCallback } from 'react'
import type { AnalysisResultsState } from './useImageStudioState'

interface UseParameterHandlersOptions {
  loadParameters: () => any
  setMainPrompt: (prompt: string) => void
  setAspectRatio: (ratio: string) => void
  setSelectedStylePreset: (preset: string) => void
  setImageCount: (count: number) => void
  setNegativePrompt: (prompt: string) => void
  setSelectedCameraAngle: (angle: string) => void
  setSelectedCameraLens: (lens: string) => void
  setStyleStrength: (strength: 'subtle' | 'moderate' | 'strong') => void
  setAnalysisMode: (mode: 'fast' | 'quality') => void
  setSeed: (seed: number | null) => void
  setImageSize: (size: '1K' | '2K' | '4K') => void
  setSelectedModel: (model: 'gemini-2.5-flash-preview-image' | 'gemini-3-pro-image') => void
  setAnalysisResults: (results: AnalysisResultsState) => void
  setGeneratedImages: (images: any[]) => void
}

export interface ParameterHandlers {
  handleRestoreParameters: (params?: any) => void
  handleResetAll: () => void
}

export function useParameterHandlers({
  loadParameters,
  setMainPrompt,
  setAspectRatio,
  setSelectedStylePreset,
  setImageCount,
  setNegativePrompt,
  setSelectedCameraAngle,
  setSelectedCameraLens,
  setStyleStrength,
  setAnalysisMode,
  setSeed,
  setImageSize,
  setSelectedModel,
  setAnalysisResults,
  setGeneratedImages,
}: UseParameterHandlersOptions): ParameterHandlers {

  const handleRestoreParameters = useCallback((params?: any) => {
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
  }, [
    loadParameters,
    setMainPrompt,
    setAspectRatio,
    setSelectedStylePreset,
    setImageCount,
    setNegativePrompt,
    setSelectedCameraAngle,
    setSelectedCameraLens,
    setStyleStrength,
    setAnalysisMode,
    setSeed,
    setImageSize,
    setSelectedModel,
  ])

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
    setSelectedModel('gemini-2.5-flash-preview-image')
    setAnalysisResults({
      subjects: [],
      scene: null,
      style: null
    })
    setGeneratedImages([])
    console.log('[v0] Reset all parameters to defaults')
  }, [
    setMainPrompt,
    setNegativePrompt,
    setAspectRatio,
    setSelectedStylePreset,
    setImageCount,
    setSelectedCameraAngle,
    setSelectedCameraLens,
    setStyleStrength,
    setSeed,
    setImageSize,
    setSelectedModel,
    setAnalysisResults,
    setGeneratedImages,
  ])

  return {
    handleRestoreParameters,
    handleResetAll,
  }
}
