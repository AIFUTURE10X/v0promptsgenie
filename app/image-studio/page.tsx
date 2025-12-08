"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Sparkles, ImageIcon } from 'lucide-react'
import { UploadPanel } from './components/UploadPanel'
import { MockupPhotoGenerator } from './components/Logo/MockupPreview/MockupPhotoGenerator'
import { ProductMockupsPanel } from './components/Logo/MockupPreview/ProductMockupsPanel'
import { ImageStudioHeader } from './components/ImageStudioHeader'
import { ImageLightbox } from './components/ImageLightbox'
import { GeneratePanel } from './components/GeneratePanel'
import { LogoPanel } from './components/LogoPanel'
import { AIHelperSidebar } from './components/AIHelperSidebar'
import type { DotMatrixConfig } from './constants/dot-matrix-config'
import { ImageStudioToolbar } from './components/ImageStudioToolbar'
import { useImageUpload } from './hooks/useImageUpload'
import { useImageAnalysis } from './hooks/useImageAnalysis'
import { useParameters } from './hooks/useParameters'
import { useFavorites, FavoritesModal } from './components/SimpleFavorites'
import { ParameterHistoryPanel } from './components/ParameterHistoryPanel'
import { useStyleAutoDetection } from './hooks/useStyleAutoDetection'
import { useCameraAutoDetection } from './hooks/useCameraAutoDetection'
import { useAutoAnalysis } from './hooks/useAutoAnalysis'
import { useAISuggestionsHandler } from './hooks/useAISuggestionsHandler'
import { useImageStudioState } from './hooks/useImageStudioState'
import { useLightboxHandlers } from './hooks/useLightboxHandlers'
import { useParameterHandlers } from './hooks/useParameterHandlers'
import { stylePresets } from './constants/camera-options'

export default function ImageStudioPage() {
  const uploadState = useImageUpload()
  const { analyzeImage, analyzing } = useImageAnalysis()
  const { saveParameters, loadParameters, hasStoredParams } = useParameters()
  const { favorites, toggleFavorite, isFavorite, clearAll } = useFavorites()

  // Use extracted state hook
  const state = useImageStudioState()
  const generatePanelRef = useRef<{ triggerGenerate: () => void; isGenerating: boolean }>(null)
  const [showPhotoGenerator, setShowPhotoGenerator] = useState(false)

  // Use extracted parameter handlers
  const { handleRestoreParameters, handleResetAll } = useParameterHandlers({
    loadParameters,
    setMainPrompt: state.setMainPrompt,
    setAspectRatio: state.setAspectRatio,
    setSelectedStylePreset: state.setSelectedStylePreset,
    setImageCount: state.setImageCount,
    setNegativePrompt: state.setNegativePrompt,
    setSelectedCameraAngle: state.setSelectedCameraAngle,
    setSelectedCameraLens: state.setSelectedCameraLens,
    setStyleStrength: state.setStyleStrength,
    setAnalysisMode: state.setAnalysisMode,
    setSeed: state.setSeed,
    setImageSize: state.setImageSize,
    setSelectedModel: state.setSelectedModel,
    setAnalysisResults: state.setAnalysisResults,
    setGeneratedImages: state.setGeneratedImages,
  })

  // Use extracted lightbox handlers
  const { openLightbox, closeLightbox, navigateLightbox, handleDownloadFromLightbox } = useLightboxHandlers({
    generatedImages: state.generatedImages,
    setLightboxOpen: state.setLightboxOpen,
    setLightboxIndex: state.setLightboxIndex,
    lightboxIndex: state.lightboxIndex,
  })

  const handleGenerate = () => {
    if (generatePanelRef.current?.triggerGenerate) {
      generatePanelRef.current.triggerGenerate()
    }
  }

  // Use extracted hook for automatic image analysis
  const { clearSubjectAnalysis, clearSceneAnalysis, clearStyleAnalysis } = useAutoAnalysis({
    subjectImages: uploadState.subjectImages,
    sceneImage: uploadState.sceneImage,
    styleImage: uploadState.styleImage,
    analysisMode: state.analysisMode,
    selectedStylePreset: state.selectedStylePreset,
    analyzeImage,
    onAnalysisUpdate: state.setAnalysisResults,
    onResetAll: handleResetAll,
  })

  const handleClearSubjectAnalysis = useCallback(() => clearSubjectAnalysis(), [clearSubjectAnalysis])
  const handleClearSceneAnalysis = useCallback(() => clearSceneAnalysis(), [clearSceneAnalysis])
  const handleClearStyleAnalysis = useCallback(() => clearStyleAnalysis(), [clearStyleAnalysis])

  const detectedStyle = useStyleAutoDetection(state.analysisResults.style?.analysis || null, stylePresets)

  useEffect(() => {
    if (detectedStyle) state.setSelectedStylePreset(detectedStyle)
  }, [detectedStyle, state.setSelectedStylePreset])

  const { detectedAngle, detectedLens, detectedRatio } = useCameraAutoDetection(state.analysisResults.scene?.analysis || null)

  useEffect(() => {
    if (detectedRatio) state.setAspectRatio(detectedRatio)
    if (detectedAngle) state.setSelectedCameraAngle(detectedAngle)
    if (detectedLens) state.setSelectedCameraLens(detectedLens)
  }, [detectedRatio, detectedAngle, detectedLens, state.setAspectRatio, state.setSelectedCameraAngle, state.setSelectedCameraLens])

  const hasPrompt = state.mainPrompt.trim() !== ''

  // Use extracted hook for AI suggestions handling
  const handleApplyAISuggestions = useAISuggestionsHandler({
    setMainPrompt: state.setMainPrompt,
    setNegativePrompt: state.setNegativePrompt,
    setSelectedStylePreset: state.setSelectedStylePreset,
    setAspectRatio: state.setAspectRatio,
    setSelectedCameraAngle: state.setSelectedCameraAngle,
    setSelectedCameraLens: state.setSelectedCameraLens,
    setStyleStrength: state.setStyleStrength,
    setImageSize: state.setImageSize,
  })

  // Handle logo config from AI Helper
  const handleApplyLogoConfig = useCallback((config: Partial<DotMatrixConfig>) => {
    console.log('[v0] ===== handleApplyLogoConfig CALLED =====')
    console.log('[v0] Received logo config:', config)
    state.setPendingLogoConfig(config)
    state.setActiveTab('logo')
    console.log('[v0] Switched to logo tab with pending config')
  }, [state.setPendingLogoConfig, state.setActiveTab])

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-950 via-black to-zinc-950">
      <ImageStudioHeader
        activeTab={state.activeTab}
        onTabChange={state.setActiveTab}
        favoritesCount={favorites.length}
        hasStoredParams={hasStoredParams}
        onShowHistory={() => state.setShowParameterHistory(true)}
        onRestoreParameters={handleRestoreParameters}
        onShowFavorites={() => state.setShowFavorites(true)}
      />

      <main className="max-w-7xl mx-auto px-6 pt-3 pb-2">
        {state.activeTab === 'generate' && (
          <ImageStudioToolbar
            showUploadSection={state.showUploadSection}
            onToggleUpload={() => state.setShowUploadSection(!state.showUploadSection)}
            analysisMode={state.analysisMode}
            onAnalysisModeChange={state.setAnalysisMode}
            imageCount={state.imageCount}
            onImageCountChange={state.setImageCount}
            aspectRatio={state.aspectRatio}
            onAspectRatioChange={state.setAspectRatio}
            ratiosPopoverOpen={state.ratiosPopoverOpen}
            onRatiosPopoverOpenChange={state.setRatiosPopoverOpen}
            selectedStylePreset={state.selectedStylePreset}
            onStylePresetChange={state.setSelectedStylePreset}
            stylePopoverOpen={state.stylePopoverOpen}
            onStylePopoverOpenChange={state.setStylePopoverOpen}
            stylePresets={stylePresets}
            onGenerate={handleGenerate}
            isGenerating={generatePanelRef.current?.isGenerating || false}
            selectedCameraAngle={state.selectedCameraAngle}
            onCameraAngleChange={state.setSelectedCameraAngle}
            selectedCameraLens={state.selectedCameraLens}
            onCameraLensChange={state.setSelectedCameraLens}
            styleStrength={state.styleStrength}
            onStyleStrengthChange={state.setStyleStrength}
          />
        )}

        {state.activeTab === 'generate' && state.showUploadSection && (
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

        {state.activeTab === 'generate' && analyzing && (
          <Card className="bg-zinc-900 border-zinc-800 p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#c99850] border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-300">Analyzing uploaded images...</p>
            </div>
          </Card>
        )}

        {state.activeTab === 'generate' && (
          <div id="generate-section">
            <GeneratePanel
              ref={generatePanelRef}
              subjectImages={uploadState.subjectImages}
              sceneAnalysis={state.analysisResults.scene}
              styleAnalysis={state.analysisResults.style}
              analysisResults={state.analysisResults}
              onClearSubjectAnalysis={handleClearSubjectAnalysis}
              onClearSceneAnalysis={handleClearSceneAnalysis}
              onClearStyleAnalysis={handleClearStyleAnalysis}
              aspectRatio={state.aspectRatio}
              setAspectRatio={state.setAspectRatio}
              selectedStylePreset={state.selectedStylePreset}
              setSelectedStylePreset={state.setSelectedStylePreset}
              imageCount={state.imageCount}
              setImageCount={state.setImageCount}
              selectedCameraAngle={state.selectedCameraAngle}
              selectedCameraLens={state.selectedCameraLens}
              styleStrength={state.styleStrength}
              negativePrompt={state.negativePrompt}
              setNegativePrompt={state.setNegativePrompt}
              referenceImage={state.referenceImage}
              setReferenceImage={state.setReferenceImage}
              mainPrompt={state.mainPrompt}
              setMainPrompt={state.setMainPrompt}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              onParametersSave={(params) => saveParameters({ ...params, analysisMode: state.analysisMode, seed: state.seed, imageSize: state.imageSize, selectedModel: state.selectedModel })}
              onClearPrompt={() => state.setMainPrompt('')}
              onRestoreParameters={handleRestoreParameters}
              generatedImages={state.generatedImages}
              imageSize={state.imageSize}
              setImageSize={state.setImageSize}
              selectedModel={state.selectedModel}
              setSelectedModel={state.setSelectedModel}
              setGeneratedImages={(images) => {
                console.log('[v0] page.tsx setGeneratedImages called with', images.length, 'images')
                state.setGeneratedImages(images)
              }}
              onOpenLightbox={openLightbox}
              seed={state.seed}
              setSeed={state.setSeed}
            />
          </div>
        )}

        {state.activeTab === 'logo' && (
          <LogoPanel
            externalPrompt={state.mainPrompt}
            externalNegativePrompt={state.negativePrompt}
            pendingLogoConfig={state.pendingLogoConfig}
            onClearPendingConfig={() => state.setPendingLogoConfig(null)}
          />
        )}

        {state.activeTab === 'mockups' && (
          <Card className="bg-zinc-900/90 border border-zinc-800 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
            <ProductMockupsPanel />
          </Card>
        )}
      </main>

      {/* Generate Product Photos Button - only show in Logo tab */}
      {state.activeTab === 'logo' && (
        <button
          onClick={() => setShowPhotoGenerator(true)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-linear-to-br from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-pink-500 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
          title="Generate Product Photos for Mockups"
        >
          <ImageIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      )}

      {!state.showAIHelper && (
        <button
          onClick={() => state.setShowAIHelper(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-linear-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700] hover:from-[#FFED4E] hover:via-[#FFD700] hover:to-[#FFA500] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
          title="AI Prompt Helper"
        >
          <Sparkles className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
        </button>
      )}

      <AIHelperSidebar
        isOpen={state.showAIHelper}
        onClose={() => state.setShowAIHelper(false)}
        currentPromptSettings={{
          currentPrompt: state.mainPrompt,
          currentNegativePrompt: state.negativePrompt,
          currentStyle: state.selectedStylePreset,
          currentCameraAngle: state.selectedCameraAngle,
          currentCameraLens: state.selectedCameraLens,
          currentAspectRatio: state.aspectRatio,
          styleStrength: state.styleStrength,
        }}
        onApplySuggestions={handleApplyAISuggestions}
        onApplyLogoConfig={handleApplyLogoConfig}
      />

      {state.showFavorites && (
        <FavoritesModal
          favorites={favorites}
          onClose={() => state.setShowFavorites(false)}
          onRemove={toggleFavorite}
          onClearAll={clearAll}
          onRestoreParameters={handleRestoreParameters}
        />
      )}

      {state.showParameterHistory && (
        <ParameterHistoryPanel
          isOpen={state.showParameterHistory}
          onClose={() => state.setShowParameterHistory(false)}
          onRestoreParameters={handleRestoreParameters}
        />
      )}

      <ImageLightbox
        isOpen={state.lightboxOpen}
        images={state.generatedImages}
        currentIndex={state.lightboxIndex}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
        onDownload={handleDownloadFromLightbox}
      />

      {/* Product Photo Generator Modal */}
      {showPhotoGenerator && (
        <MockupPhotoGenerator onClose={() => setShowPhotoGenerator(false)} />
      )}
    </div>
  )
}
