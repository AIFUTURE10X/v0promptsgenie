"use client"

/**
 * Image Studio Side Effects Hook
 *
 * Handles auto-detection effects for style, camera, and aspect ratio.
 * Extracted from page.tsx to keep files under 300 lines.
 */

import { useEffect, useCallback } from 'react'
import { useStyleAutoDetection } from './useStyleAutoDetection'
import { useCameraAutoDetection } from './useCameraAutoDetection'
import { useAutoAnalysis } from './hooks/useAutoAnalysis'
import { stylePresets } from '../constants/camera-options'

interface AnalysisResults {
  subject?: { analysis: string | null }
  scene?: { analysis: string | null }
  style?: { analysis: string | null }
}

interface ImageUploadState {
  subjectImages: Array<{ url: string }>
  sceneImage: { url: string } | null
  styleImage: { url: string } | null
}

interface UseImageStudioEffectsConfig {
  analysisResults: AnalysisResults
  uploadState: ImageUploadState
  analysisMode: string
  selectedStylePreset: string
  analyzeImage: (image: any, mode: string) => Promise<any>
  setSelectedStylePreset: (preset: string) => void
  setAspectRatio: (ratio: string) => void
  setSelectedCameraAngle: (angle: string) => void
  setSelectedCameraLens: (lens: string) => void
  setAnalysisResults: (results: any) => void
  onResetAll: () => void
}

export function useImageStudioEffects(config: UseImageStudioEffectsConfig) {
  const {
    analysisResults,
    uploadState,
    analysisMode,
    selectedStylePreset,
    analyzeImage,
    setSelectedStylePreset,
    setAspectRatio,
    setSelectedCameraAngle,
    setSelectedCameraLens,
    setAnalysisResults,
    onResetAll,
  } = config

  // Auto-detect style from analysis
  const detectedStyle = useStyleAutoDetection(
    analysisResults.style?.analysis || null,
    stylePresets
  )

  // Apply detected style
  useEffect(() => {
    if (detectedStyle) setSelectedStylePreset(detectedStyle)
  }, [detectedStyle, setSelectedStylePreset])

  // Auto-detect camera settings from scene analysis
  const { detectedAngle, detectedLens, detectedRatio } = useCameraAutoDetection(
    analysisResults.scene?.analysis || null
  )

  // Apply detected camera settings
  useEffect(() => {
    if (detectedRatio) setAspectRatio(detectedRatio)
    if (detectedAngle) setSelectedCameraAngle(detectedAngle)
    if (detectedLens) setSelectedCameraLens(detectedLens)
  }, [detectedRatio, detectedAngle, detectedLens, setAspectRatio, setSelectedCameraAngle, setSelectedCameraLens])

  // Auto-analyze uploaded images
  const { clearSubjectAnalysis, clearSceneAnalysis, clearStyleAnalysis } = useAutoAnalysis({
    subjectImages: uploadState.subjectImages,
    sceneImage: uploadState.sceneImage,
    styleImage: uploadState.styleImage,
    analysisMode,
    selectedStylePreset,
    analyzeImage,
    onAnalysisUpdate: setAnalysisResults,
    onResetAll,
  })

  const handleClearSubjectAnalysis = useCallback(() => clearSubjectAnalysis(), [clearSubjectAnalysis])
  const handleClearSceneAnalysis = useCallback(() => clearSceneAnalysis(), [clearSceneAnalysis])
  const handleClearStyleAnalysis = useCallback(() => clearStyleAnalysis(), [clearStyleAnalysis])

  return {
    handleClearSubjectAnalysis,
    handleClearSceneAnalysis,
    handleClearStyleAnalysis,
  }
}
