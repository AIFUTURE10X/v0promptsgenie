"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { useLogoGeneration } from '../../hooks/useLogoGeneration'
import { useLogoPanelHandlers } from '../../hooks/useLogoPanelHandlers'
import { useLogoPanelState } from '../../hooks/useLogoPanelState'
import { useFavorites } from '../SimpleFavorites'

import { LogoPromptSection } from '../Logo/LogoPromptSection'
import { LogoStyleSelector } from '../Logo/LogoStyleSelector'
import { LogoAdvancedSettings } from '../Logo/LogoAdvancedSettings'
import { LogoPreviewPanel, type LogoFilterStyle } from '../Logo/LogoPreviewPanel'
import { LogoActionButtons } from '../Logo/LogoActionButtons'
import { LogoHistoryPanel, useLogoHistory } from '../Logo/LogoHistory'

import { LogoPanelHeader } from './LogoPanelHeader'
import { LogoPanelModals } from './LogoPanelModals'
import { LogoModeSection } from './LogoModeSection'
import { LogoGenerateSection } from './LogoGenerateSection'
import type { DotMatrixConfig } from '../../constants/dot-matrix-config'
import { isTextOnlyLogo, buildTextOnlyNegativePrompt, REPLICATION_PROMPT, INSPIRE_PROMPT } from '../../utils/logo-prompt-helpers'

interface LogoPanelProps {
  onLogoGenerated?: (url: string) => void
  externalPrompt?: string
  externalNegativePrompt?: string
  pendingLogoConfig?: Partial<DotMatrixConfig> | null
  onClearPendingConfig?: () => void
}

export function LogoPanel({
  onLogoGenerated,
  externalPrompt,
  externalNegativePrompt,
  pendingLogoConfig,
  onClearPendingConfig
}: LogoPanelProps) {
  // Use extracted state hook
  const state = useLogoPanelState({
    externalPrompt,
    externalNegativePrompt,
    pendingLogoConfig
  })

  const { addToHistory } = useLogoHistory()

  const {
    isGenerating, error, generatedLogo, generateLogo, clearLogo, downloadLogo, setLogo
  } = useLogoGeneration()

  const { toggleFavorite, isFavorite, isToggling: isFavoriteToggling } = useFavorites()

  const {
    isRemovingLogoBg, isUpscaling, isExportingSvg, copied: handlerCopied, isRemovingRefBg,
    handleRemoveLogoBackground, handleUpscale, handleCopyToClipboard, handleExportSvg, handleRemoveRefBackground
  } = useLogoPanelHandlers({ generatedLogo, setLogo, bgRemovalMethod: state.bgRemovalMethod, onLogoGenerated, addToHistory })

  // Track color filter from LogoPreviewPanel for mockups
  const [logoFilter, setLogoFilter] = useState<LogoFilterStyle>({})

  const handleGenerate = async () => {
    if (state.removeBackgroundOnly && state.referenceImage) {
      return handleRemoveRefBackground(state.referenceImage)
    }
    if (!state.prompt.trim() && !state.referenceImage) return

    try {
      // Determine prompt and style based on reference mode
      const isReplicate = state.referenceImage && state.referenceMode === 'replicate'
      const effectivePrompt = state.prompt.trim() || (isReplicate ? REPLICATION_PROMPT : INSPIRE_PROMPT)
      const combinedStyle = isReplicate ? '' : state.getCombinedStyle()

      // Build negative prompt with text-only handling
      let finalNegativePrompt = state.negativePrompt.trim()
      if (isTextOnlyLogo(effectivePrompt)) {
        finalNegativePrompt = buildTextOnlyNegativePrompt(finalNegativePrompt)
      }

      const logo = await generateLogo({
        prompt: effectivePrompt,
        negativePrompt: finalNegativePrompt || undefined,
        style: combinedStyle,
        referenceImage: state.referenceImage?.file,
        bgRemovalMethod: state.bgRemovalMethod,
        resolution: state.resolution,
        seed: state.seedLocked ? state.seedValue : undefined
      })

      if (logo.seed !== undefined) state.setSeedValue(logo.seed)

      addToHistory({
        imageUrl: logo.url,
        prompt: state.prompt.trim() || (state.referenceImage ? '[Reference Image]' : effectivePrompt),
        negativePrompt: state.negativePrompt.trim() || undefined,
        seed: logo.seed,
        style: combinedStyle,
        presetId: state.selectedPresetId,
        config: state.referenceImage ? {
          referenceMode: state.referenceMode,
          wasReplication: isReplicate,
          resolution: state.resolution,
          bgRemovalMethod: state.bgRemovalMethod
        } : undefined
      })

      onLogoGenerated?.(logo.url)
      toast.info("If you don't like this logo, generate again for a better result!", { duration: 5000, position: 'top-center' })
    } catch (err) {
      // Error handled by hook
    }
  }

  const handleToggleFavorite = () => {
    if (!generatedLogo) return
    toggleFavorite(generatedLogo.url, {
      style: generatedLogo.style,
      params: { prompt: generatedLogo.prompt, bgRemovalMethod: generatedLogo.bgRemovalMethod, seed: generatedLogo.seed }
    })
  }

  const handleClearAll = () => { state.handleClearAll(); clearLogo() }

  return (
    <Card className="bg-zinc-900/90 border border-zinc-800 p-4">
      <LogoPanelHeader
        logoMode={state.logoMode}
        setLogoMode={state.setLogoMode}
        onClearAll={handleClearAll}
      />

      <div className="flex gap-4">
        <div className="flex-1 space-y-3">
          <LogoModeSection
            logoMode={state.logoMode}
            setLogoMode={state.setLogoMode}
            removeBackgroundOnly={state.removeBackgroundOnly}
            isGenerating={isGenerating}
            isRemovingRefBg={isRemovingRefBg}
            onOpenWizard={() => state.setShowLogoWizard(true)}
            onApplyPreset={(presetPrompt, presetNegative, concept, renderStyles) => {
              state.setPrompt(presetPrompt)
              if (presetNegative) state.setNegativePrompt(presetNegative)
              state.setSelectedConcept(concept)
              state.setSelectedRenders(renderStyles)
            }}
            onOpenDotMatrixConfigurator={() => state.setShowDotMatrixConfigurator(true)}
            onOpenUnifiedConfigurator={(presetId) => {
              state.setSelectedPresetId(presetId)
              state.setShowUnifiedConfigurator(true)
            }}
            onOpenUnifiedConfiguratorWithConfig={(presetId, config) => {
              state.setSelectedPresetId(presetId)
              state.setWizardConfig(config)
              state.setShowUnifiedConfigurator(true)
            }}
          />

          <LogoPromptSection
            prompt={state.prompt}
            setPrompt={state.setPrompt}
            negativePrompt={state.negativePrompt}
            setNegativePrompt={state.setNegativePrompt}
            referenceImage={state.referenceImage}
            setReferenceImage={state.setReferenceImage}
            referenceMode={state.referenceMode}
            setReferenceMode={state.setReferenceMode}
            removeBackgroundOnly={state.removeBackgroundOnly}
            setRemoveBackgroundOnly={state.setRemoveBackgroundOnly}
            isGenerating={isGenerating}
            isRemovingBackground={isRemovingRefBg}
          />

          {!state.removeBackgroundOnly && state.logoMode === 'expert' && (
            <LogoStyleSelector
              selectedConcept={state.selectedConcept}
              setSelectedConcept={state.setSelectedConcept}
              selectedRenders={state.selectedRenders}
              setSelectedRenders={state.setSelectedRenders}
              isGenerating={isGenerating}
            />
          )}

          <LogoAdvancedSettings
            showAdvanced={state.showAdvanced}
            setShowAdvanced={state.setShowAdvanced}
            resolution={state.resolution}
            setResolution={state.setResolution}
            seedLocked={state.seedLocked}
            setSeedLocked={state.setSeedLocked}
            seedValue={state.seedValue}
            setSeedValue={state.setSeedValue}
            bgRemovalMethod={state.bgRemovalMethod}
            setBgRemovalMethod={state.setBgRemovalMethod}
            isGenerating={isGenerating}
            isRemovingBackground={isRemovingRefBg}
          />

          <LogoGenerateSection
            isGenerating={isGenerating}
            isRemovingRefBg={isRemovingRefBg}
            removeBackgroundOnly={state.removeBackgroundOnly}
            hasPrompt={!!state.prompt.trim()}
            hasReferenceImage={!!state.referenceImage}
            onGenerate={handleGenerate}
            onOpenBatchGenerator={() => {
              const combinedStyle = state.getCombinedStyle()
              state.setBatchOptions({
                prompt: state.prompt.trim() || 'Modern professional logo design',
                negativePrompt: state.negativePrompt.trim() || undefined,
                style: combinedStyle,
                bgRemovalMethod: state.bgRemovalMethod,
                resolution: state.resolution,
                baseSeed: state.seedLocked ? state.seedValue : undefined,
              })
              state.setShowBatchGenerator(true)
            }}
            error={error}
          />

          {generatedLogo && (
            <LogoActionButtons
              generatedLogo={generatedLogo}
              onShowTextEditor={() => state.setShowTextEditor(true)}
              onToggleEraserMode={() => state.setIsEraserMode(!state.isEraserMode)}
              isEraserMode={state.isEraserMode}
              onDownload={() => downloadLogo(generatedLogo)}
              onExportSvg={handleExportSvg}
              isExportingSvg={isExportingSvg}
              onCopyToClipboard={handleCopyToClipboard}
              copied={handlerCopied}
              onUpscale={handleUpscale}
              isUpscaling={isUpscaling}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite(generatedLogo.url)}
              isFavoriteToggling={isFavoriteToggling(generatedLogo.url)}
              onRemoveBackground={handleRemoveLogoBackground}
              isRemovingBackground={isRemovingLogoBg}
              onShowMockup={() => state.setShowMockupPreview(true)}
              onShowRealFontOverlay={() => state.setShowRealFontOverlay(true)}
            />
          )}

          <LogoHistoryPanel
            onUseSettings={(item) => {
              state.setPrompt(item.prompt)
              if (item.negativePrompt) state.setNegativePrompt(item.negativePrompt)
              if (item.seed) {
                state.setSeedValue(item.seed)
                state.setSeedLocked(true)
              }
              if (item.presetId) state.setSelectedPresetId(item.presetId)
            }}
            onLoadImage={(item) => {
              // Load the image into the preview panel
              setLogo({
                url: item.imageUrl,
                prompt: item.prompt,
                style: item.style || '',
                bgRemovalMethod: item.config?.bgRemovalMethod || 'none',
                timestamp: item.timestamp,
                seed: item.seed
              })
              // Also load the settings
              state.setPrompt(item.prompt)
              if (item.negativePrompt) state.setNegativePrompt(item.negativePrompt)
              if (item.seed) {
                state.setSeedValue(item.seed)
                state.setSeedLocked(true)
              }
              if (item.presetId) state.setSelectedPresetId(item.presetId)
              toast.success('Image loaded! You can now preview on mockups.', { duration: 3000 })
            }}
            onCompare={(items) => {
              state.setComparisonItems(items)
              state.setShowComparisonView(true)
            }}
          />

          {!generatedLogo && (
            <p className="text-[10px] text-zinc-500 text-center">
              AI-powered transparent PNG with clean edges
            </p>
          )}
        </div>

        <LogoPreviewPanel
          generatedLogo={generatedLogo}
          onClearLogo={clearLogo}
          onPreviewMockups={generatedLogo ? () => state.setShowMockupPreview(true) : undefined}
          onFilterChange={setLogoFilter}
        />
      </div>

      <LogoPanelModals
        showTextEditor={state.showTextEditor} setShowTextEditor={state.setShowTextEditor}
        isEraserMode={state.isEraserMode} setIsEraserMode={state.setIsEraserMode}
        showDotMatrixConfigurator={state.showDotMatrixConfigurator} setShowDotMatrixConfigurator={state.setShowDotMatrixConfigurator}
        pendingLogoConfig={pendingLogoConfig} onClearPendingConfig={onClearPendingConfig}
        showUnifiedConfigurator={state.showUnifiedConfigurator} setShowUnifiedConfigurator={state.setShowUnifiedConfigurator}
        selectedPresetId={state.selectedPresetId} setSelectedPresetId={state.setSelectedPresetId}
        wizardConfig={state.wizardConfig} setWizardConfig={state.setWizardConfig}
        showLogoWizard={state.showLogoWizard} setShowLogoWizard={state.setShowLogoWizard} setLogoMode={state.setLogoMode}
        showBatchGenerator={state.showBatchGenerator} setShowBatchGenerator={state.setShowBatchGenerator}
        batchOptions={state.batchOptions} setBatchOptions={state.setBatchOptions}
        showMockupPreview={state.showMockupPreview} setShowMockupPreview={state.setShowMockupPreview}
        showComparisonView={state.showComparisonView} setShowComparisonView={state.setShowComparisonView}
        comparisonItems={state.comparisonItems} setComparisonItems={state.setComparisonItems}
        showRealFontOverlay={state.showRealFontOverlay} setShowRealFontOverlay={state.setShowRealFontOverlay}
        generatedLogo={generatedLogo} setLogo={setLogo}
        bgRemovalMethod={state.bgRemovalMethod} resolution={state.resolution}
        seedLocked={state.seedLocked} seedValue={state.seedValue} setSeedValue={state.setSeedValue}
        setPrompt={state.setPrompt} setNegativePrompt={state.setNegativePrompt}
        setSelectedConcept={state.setSelectedConcept} setSelectedRenders={state.setSelectedRenders}
        generateLogo={generateLogo} addToHistory={addToHistory}
        onLogoGenerated={onLogoGenerated} prompt={state.prompt}
        logoFilter={logoFilter}
      />
    </Card>
  )
}
