import { useState } from 'react'

export function useGenerationParams() {
  const [promptMode, setPromptMode] = useState<"fast" | "quality">("fast")
  const [imageCount, setImageCount] = useState<1 | 2>(1)
  const [aspectRatio, setAspectRatio] = useState<string>("1:1")
  const [negativePrompt, setNegativePrompt] = useState<string>("")
  const [styleStrength, setStyleStrength] = useState<"subtle" | "moderate" | "strong">("moderate")
  const [selectedStylePreset, setSelectedStylePreset] = useState<string>("Realistic")
  const [selectedCameraAngle, setSelectedCameraAngle] = useState<string>("")
  const [selectedCameraLens, setSelectedCameraLens] = useState<string>("")
  const [manualPrompt, setManualPrompt] = useState<string>("")
  const [manualCombinedPrompt, setManualCombinedPrompt] = useState<string>("")

  const resetToDefaults = () => {
    setPromptMode("fast")
    setImageCount(1)
    setAspectRatio("1:1")
    setNegativePrompt("")
    setStyleStrength("moderate")
    setSelectedStylePreset("Realistic")
    setSelectedCameraAngle("")
    setSelectedCameraLens("")
    setManualPrompt("")
    setManualCombinedPrompt("")
  }

  return {
    promptMode,
    setPromptMode,
    imageCount,
    setImageCount,
    aspectRatio,
    setAspectRatio,
    negativePrompt,
    setNegativePrompt,
    styleStrength,
    setStyleStrength,
    selectedStylePreset,
    setSelectedStylePreset,
    selectedCameraAngle,
    setSelectedCameraAngle,
    selectedCameraLens,
    setSelectedCameraLens,
    manualPrompt,
    setManualPrompt,
    manualCombinedPrompt,
    setManualCombinedPrompt,
    resetToDefaults,
  }
}
