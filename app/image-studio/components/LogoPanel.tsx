"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles, Loader2, Eraser, RotateCcw } from 'lucide-react'
import { useLogoGeneration, BgRemovalMethod } from '../hooks/useLogoGeneration'
import { useFavorites } from './SimpleFavorites'
import { TextOverlayEditor } from './TextOverlayEditor'

import { LogoPromptSection } from './Logo/LogoPromptSection'
import { LogoStyleSelector } from './Logo/LogoStyleSelector'
import { LogoAdvancedSettings } from './Logo/LogoAdvancedSettings'
import { LogoPreviewPanel } from './Logo/LogoPreviewPanel'
import { LogoActionButtons } from './Logo/LogoActionButtons'
import { EraserToolModal } from './Logo/EraserToolModal'
import { LogoPresetSelector } from './Logo/LogoPresetSelector'
import { DotMatrixConfigurator } from './Logo/DotMatrixConfigurator'

import {
  LogoConcept,
  RenderStyle,
  LogoResolution,
  LOGO_CONCEPTS,
  RENDER_STYLES,
  GOLD_GRADIENT
} from '../constants/logo-constants'

interface LogoPanelProps {
  onLogoGenerated?: (url: string) => void
  externalPrompt?: string
  externalNegativePrompt?: string
}

export function LogoPanel({ onLogoGenerated, externalPrompt, externalNegativePrompt }: LogoPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')

  // Sync external prompts from AI Helper
  useEffect(() => {
    if (externalPrompt !== undefined && externalPrompt !== prompt) {
      setPrompt(externalPrompt)
    }
  }, [externalPrompt])

  useEffect(() => {
    if (externalNegativePrompt !== undefined && externalNegativePrompt !== negativePrompt) {
      setNegativePrompt(externalNegativePrompt)
    }
  }, [externalNegativePrompt])

  const [selectedConcept, setSelectedConcept] = useState<LogoConcept | null>(null)
  const [selectedRenders, setSelectedRenders] = useState<RenderStyle[]>([])
  const [bgRemovalMethod, setBgRemovalMethod] = useState<BgRemovalMethod>('pixelcut')
  const [resolution, setResolution] = useState<LogoResolution>('1K')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)
  const [referenceImage, setReferenceImage] = useState<{ file: File; preview: string } | null>(null)
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [isExportingSvg, setIsExportingSvg] = useState(false)
  const [removeBackgroundOnly, setRemoveBackgroundOnly] = useState(false)
  const [isRemovingBackground, setIsRemovingBackground] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [seedLocked, setSeedLocked] = useState(false)
  const [seedValue, setSeedValue] = useState<number | undefined>()
  const [isEraserMode, setIsEraserMode] = useState(false)
  const [isRemovingLogoBg, setIsRemovingLogoBg] = useState(false)
  const [showDotMatrixConfigurator, setShowDotMatrixConfigurator] = useState(false)

  const {
    isGenerating,
    error,
    generatedLogo,
    generateLogo,
    clearLogo,
    downloadLogo,
    setLogo
  } = useLogoGeneration()

  const { toggleFavorite, isFavorite, isToggling: isFavoriteToggling } = useFavorites()

  const handleRemoveBackground = async () => {
    if (!referenceImage) return

    setIsRemovingBackground(true)
    try {
      const formData = new FormData()
      formData.append('image', referenceImage.file)
      formData.append('bgRemovalMethod', bgRemovalMethod)

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to remove background (${response.status})`)
      }

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      if (!data.image) throw new Error('No image returned from API')

      setLogo({
        url: data.image,
        prompt: 'Background removed',
        style: 'flat' as any,
        bgRemovalMethod,
        timestamp: Date.now()
      })

      onLogoGenerated?.(data.image)
    } catch (err) {
      console.error('[LogoPanel] Background removal error:', err)
    } finally {
      setIsRemovingBackground(false)
    }
  }

  // Remove background from a generated logo
  const handleRemoveLogoBackground = async () => {
    if (!generatedLogo) return

    setIsRemovingLogoBg(true)
    try {
      // Convert data URL to blob for the API
      const response = await fetch(generatedLogo.url)
      const blob = await response.blob()
      const file = new File([blob], 'logo.png', { type: 'image/png' })

      const formData = new FormData()
      formData.append('image', file)
      formData.append('bgRemovalMethod', bgRemovalMethod)

      const apiResponse = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to remove background (${apiResponse.status})`)
      }

      const data = await apiResponse.json()
      if (data.error) throw new Error(data.error)
      if (!data.image) throw new Error('No image returned from API')

      // Update the logo with the transparent version
      setLogo({
        ...generatedLogo,
        url: data.image,
        bgRemovalMethod,
        timestamp: Date.now()
      })

      onLogoGenerated?.(data.image)
    } catch (err) {
      console.error('[LogoPanel] Logo background removal error:', err)
      alert(`Background removal failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsRemovingLogoBg(false)
    }
  }

  const handleGenerate = async () => {
    if (removeBackgroundOnly && referenceImage) {
      return handleRemoveBackground()
    }

    if (!prompt.trim() && !referenceImage) return

    try {
      const styleParts = [selectedConcept, ...selectedRenders].filter(Boolean)
      const combinedStyle = (styleParts.length > 0 ? styleParts.join('+') : 'modern') as any
      const effectivePrompt = prompt.trim() || 'Recreate this logo with the same style and design elements'

      const logo = await generateLogo({
        prompt: effectivePrompt,
        negativePrompt: negativePrompt.trim() || undefined,
        style: combinedStyle,
        referenceImage: referenceImage?.file,
        bgRemovalMethod,
        resolution,
        seed: seedLocked ? seedValue : undefined
      })

      if (logo.seed !== undefined) {
        setSeedValue(logo.seed)
      }
      onLogoGenerated?.(logo.url)
    } catch (err) {
      // Error handled by hook
    }
  }

  const handleUpscale = async (targetResolution: '2K' | '4K', method: 'ai' | 'fast' = 'ai') => {
    if (!generatedLogo) return

    setIsUpscaling(true)
    try {
      const formData = new FormData()
      formData.append('imageBase64', generatedLogo.url)
      formData.append('targetResolution', targetResolution)
      formData.append('method', method)

      const response = await fetch('/api/upscale-logo', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to upscale (${response.status})`)
      }

      const data = await response.json()
      if (data.error) throw new Error(data.error)
      if (!data.image) throw new Error('No image returned from API')

      if (data.message) {
        alert(data.message)
        return
      }

      setLogo({ ...generatedLogo, url: data.image })
    } catch (err) {
      console.error('[LogoPanel] Upscale error:', err)
      alert(`Upscale failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsUpscaling(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (!generatedLogo) return

    try {
      const response = await fetch(generatedLogo.url)
      const blob = await response.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleExportSvg = async () => {
    if (!generatedLogo) return

    setIsExportingSvg(true)
    try {
      const formData = new FormData()
      formData.append('imageBase64', generatedLogo.url)
      formData.append('mode', 'auto')
      formData.append('colorCount', '16')

      const response = await fetch('/api/vectorize-logo', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to convert to SVG')
      }

      const svgContent = await response.text()
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const sanitizedPrompt = generatedLogo.prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30)
      link.download = `logo-${sanitizedPrompt}-${Date.now()}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export SVG:', err)
    } finally {
      setIsExportingSvg(false)
    }
  }

  const handleToggleFavorite = () => {
    if (!generatedLogo) return
    toggleFavorite(generatedLogo.url, {
      style: generatedLogo.style,
      params: {
        prompt: generatedLogo.prompt,
        bgRemovalMethod: generatedLogo.bgRemovalMethod,
        seed: generatedLogo.seed
      }
    })
  }

  const handleClearAll = () => {
    // Reset all state to initial values
    setPrompt('')
    setNegativePrompt('')
    setSelectedConcept(null)
    setSelectedRenders([])
    setBgRemovalMethod('pixelcut')
    setResolution('1K')
    setShowAdvanced(false)
    setCopied(false)
    setReferenceImage(null)
    setShowTextEditor(false)
    setIsExportingSvg(false)
    setRemoveBackgroundOnly(false)
    setIsRemovingBackground(false)
    setIsUpscaling(false)
    setSeedLocked(false)
    setSeedValue(undefined)
    setIsEraserMode(false)
    setIsRemovingLogoBg(false)
    clearLogo()
  }

  return (
    <Card className="bg-zinc-900/90 border border-zinc-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#dbb56e]" />
          <h2 className="text-sm font-semibold text-white">Logo Generator</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#c99850]/20 text-[#dbb56e] border border-[#c99850]/30">
            PNG + SVG
          </span>
        </div>
        <Button
          onClick={handleClearAll}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Main Layout: Controls Left, Preview Right */}
      <div className="flex gap-4">
        {/* Left Side - Controls */}
        <div className="flex-1 space-y-3">
          {/* Quick Presets - Hidden when "Remove background only" is checked */}
          {!removeBackgroundOnly && (
            <LogoPresetSelector
              onApplyPreset={(presetPrompt, presetNegative, concept, renderStyles) => {
                setPrompt(presetPrompt)
                if (presetNegative) setNegativePrompt(presetNegative)
                setSelectedConcept(concept)
                setSelectedRenders(renderStyles)
              }}
              onOpenDotMatrixConfigurator={() => setShowDotMatrixConfigurator(true)}
              disabled={isGenerating || isRemovingBackground}
            />
          )}

          <LogoPromptSection
            prompt={prompt}
            setPrompt={setPrompt}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            referenceImage={referenceImage}
            setReferenceImage={setReferenceImage}
            removeBackgroundOnly={removeBackgroundOnly}
            setRemoveBackgroundOnly={setRemoveBackgroundOnly}
            isGenerating={isGenerating}
            isRemovingBackground={isRemovingBackground}
          />

          {/* Style Selectors - Hidden when "Remove background only" is checked */}
          {!removeBackgroundOnly && (
            <LogoStyleSelector
              selectedConcept={selectedConcept}
              setSelectedConcept={setSelectedConcept}
              selectedRenders={selectedRenders}
              setSelectedRenders={setSelectedRenders}
              isGenerating={isGenerating}
            />
          )}

          <LogoAdvancedSettings
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            resolution={resolution}
            setResolution={setResolution}
            seedLocked={seedLocked}
            setSeedLocked={setSeedLocked}
            seedValue={seedValue}
            setSeedValue={setSeedValue}
            bgRemovalMethod={bgRemovalMethod}
            setBgRemovalMethod={setBgRemovalMethod}
            isGenerating={isGenerating}
            isRemovingBackground={isRemovingBackground}
          />

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isRemovingBackground || (removeBackgroundOnly ? !referenceImage : (!prompt.trim() && !referenceImage))}
            className="w-full h-9 text-sm font-semibold text-black disabled:opacity-50"
            style={{ background: GOLD_GRADIENT }}
          >
            {isGenerating || isRemovingBackground ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                {isRemovingBackground ? 'Removing Background...' : 'Generating...'}
              </>
            ) : removeBackgroundOnly ? (
              <>
                <Eraser className="w-4 h-4 mr-1.5" />
                Remove Background
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Generate Logo
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          {generatedLogo && (
            <LogoActionButtons
              generatedLogo={generatedLogo}
              onShowTextEditor={() => setShowTextEditor(true)}
              onToggleEraserMode={() => setIsEraserMode(!isEraserMode)}
              isEraserMode={isEraserMode}
              onDownload={() => downloadLogo(generatedLogo)}
              onExportSvg={handleExportSvg}
              isExportingSvg={isExportingSvg}
              onCopyToClipboard={handleCopyToClipboard}
              copied={copied}
              onUpscale={handleUpscale}
              isUpscaling={isUpscaling}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite(generatedLogo.url)}
              isFavoriteToggling={isFavoriteToggling(generatedLogo.url)}
              onRemoveBackground={handleRemoveLogoBackground}
              isRemovingBackground={isRemovingLogoBg}
            />
          )}

          {/* Info */}
          {!generatedLogo && (
            <p className="text-[10px] text-zinc-500 text-center">
              AI-powered transparent PNG with clean edges
            </p>
          )}
        </div>

        {/* Right Side - Preview Panel */}
        <LogoPreviewPanel generatedLogo={generatedLogo} onClearLogo={clearLogo} />
      </div>

      {/* Text Overlay Editor Modal */}
      {showTextEditor && generatedLogo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <TextOverlayEditor
            logoUrl={generatedLogo.url}
            onClose={() => setShowTextEditor(false)}
            onExport={(dataUrl) => {
              const link = document.createElement('a')
              link.href = dataUrl
              link.download = `logo-with-text-${Date.now()}.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              setShowTextEditor(false)
            }}
          />
        </div>
      )}

      {/* Eraser Tool Modal */}
      {isEraserMode && generatedLogo && (
        <EraserToolModal
          generatedLogo={generatedLogo}
          onClose={() => setIsEraserMode(false)}
          onUpdateLogo={setLogo}
        />
      )}

      {/* Dot Matrix Configurator Modal */}
      <DotMatrixConfigurator
        isOpen={showDotMatrixConfigurator}
        onClose={() => setShowDotMatrixConfigurator(false)}
        onGenerate={async (generatedPrompt, generatedNegativePrompt) => {
          // Set the prompt and negative prompt from the configurator
          setPrompt(generatedPrompt)
          setNegativePrompt(generatedNegativePrompt)
          // Set style to modern + 3d-metallic for dot matrix logos
          setSelectedConcept('modern')
          setSelectedRenders(['3d-metallic'])
          // Close the modal
          setShowDotMatrixConfigurator(false)

          // Auto-generate immediately with the new prompt
          try {
            const logo = await generateLogo({
              prompt: generatedPrompt,
              negativePrompt: generatedNegativePrompt || undefined,
              style: 'modern+3d-metallic' as any,
              bgRemovalMethod,
              resolution,
              seed: seedLocked ? seedValue : undefined
            })
            if (logo.seed !== undefined) {
              setSeedValue(logo.seed)
            }
            onLogoGenerated?.(logo.url)
          } catch (err) {
            // Error handled by hook
          }
        }}
      />
    </Card>
  )
}
