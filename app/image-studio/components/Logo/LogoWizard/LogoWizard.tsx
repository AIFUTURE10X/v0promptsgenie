"use client"

/**
 * LogoWizard Component
 *
 * Main wizard container that guides users through logo creation
 * with a step-by-step questionnaire flow, including optional logo reference upload.
 * Refactored: Views extracted to separate components.
 */

import { useState } from 'react'
import { X, Settings, Upload } from 'lucide-react'
import { useQuestionnaireFlow } from './questions/useQuestionnaireFlow'
import { LogoReferenceStep } from './LogoReferenceStep'
import { WizardResultsView } from './WizardResultsView'
import { WizardQuestionnaireView } from './WizardQuestionnaireView'
import {
  mapAnalysisToWizardAnswers,
  mapAnalysisToConfig,
  getPresetsFromAnalysis,
  AnalysisResult,
} from './useLogoAnalysisWizard'

interface LogoWizardProps {
  isOpen: boolean
  onClose: () => void
  onSelectPreset: (presetId: string, config: Record<string, any>) => void
  onGenerateNow?: (presetId: string, config: Record<string, any>) => void
  onSwitchToExpert: () => void
}

export function LogoWizard({
  isOpen,
  onClose,
  onSelectPreset,
  onGenerateNow,
  onSwitchToExpert,
}: LogoWizardProps) {
  const [showResults, setShowResults] = useState(false)
  const [showReferenceStep, setShowReferenceStep] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisPresets, setAnalysisPresets] = useState<Array<{ presetId: string; score: number }> | null>(null)
  const [analysisConfig, setAnalysisConfig] = useState<Record<string, any> | null>(null)

  const flow = useQuestionnaireFlow()

  if (!isOpen) return null

  // Handle analysis complete - skip to variations
  const handleAnalysisComplete = (analysis: AnalysisResult, brandName: string) => {
    const wizardAnswers = mapAnalysisToWizardAnswers(analysis, brandName)
    const config = mapAnalysisToConfig(analysis, brandName)
    const presets = getPresetsFromAnalysis(analysis)

    flow.setAnswersFromAnalysis(wizardAnswers)
    setAnalysisConfig(config)
    setAnalysisPresets(presets)
    setShowReferenceStep(false)
    setShowResults(true)
  }

  // Handle start over - go back to reference step
  const handleStartOver = () => {
    flow.resetWizard()
    setShowResults(false)
    setShowReferenceStep(true)
    setAnalysisPresets(null)
    setAnalysisConfig(null)
  }

  // Show variation results when complete
  if (showResults || flow.isComplete) {
    const recommendedPresets = analysisPresets || flow.getRecommendedPresets()
    const baseConfig = analysisConfig || flow.getConfigFromAnswers()

    return (
      <WizardResultsView
        recommendedPresets={recommendedPresets}
        baseConfig={baseConfig}
        hasAnalysisPresets={!!analysisPresets}
        onBack={() => {
          if (analysisPresets) {
            setShowResults(false)
            setShowReferenceStep(true)
            setAnalysisPresets(null)
            setAnalysisConfig(null)
          } else {
            setShowResults(false)
          }
        }}
        onStartOver={handleStartOver}
        onClose={onClose}
        onSelectVariation={(presetId) => {
          onSelectPreset(presetId, baseConfig)
          onClose()
        }}
        onGenerateNow={onGenerateNow ? (presetId, config) => {
          onGenerateNow(presetId, config)
          onClose()
        } : undefined}
      />
    )
  }

  // Show reference step (Step 0) - optional logo upload
  if (showReferenceStep) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-linear-to-r from-purple-500 to-pink-500">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Logo Wizard</h2>
                <p className="text-xs text-zinc-400">
                  Upload a reference or answer questions to get started
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onSwitchToExpert}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Expert Mode
              </button>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Reference Step Content */}
          <div className="px-6 py-8">
            <LogoReferenceStep
              onAnalysisComplete={handleAnalysisComplete}
              onSkip={() => setShowReferenceStep(false)}
              analyzing={analyzing}
              setAnalyzing={setAnalyzing}
            />
          </div>
        </div>
      </div>
    )
  }

  // Show questionnaire
  return (
    <WizardQuestionnaireView
      currentStep={flow.currentStep}
      totalSteps={flow.totalSteps}
      currentQuestion={flow.currentQuestion}
      answer={flow.answers[flow.currentQuestion?.id || '']}
      extrusionDepth={flow.extrusionDepth}
      tiltAngle={flow.tiltAngle}
      canGoNext={flow.canGoNext}
      onGoToStep={flow.goToStep}
      onAnswer={flow.setAnswer}
      onToggleMulti={flow.toggleMultiAnswer}
      onExtrusionChange={flow.setExtrusionDepth}
      onTiltAngleChange={flow.setTiltAngle}
      onBack={() => {
        if (flow.currentStep === 0) {
          setShowReferenceStep(true)
        } else {
          flow.prevStep()
        }
      }}
      onNext={() => {
        if (flow.currentStep === flow.totalSteps - 1) {
          setShowResults(true)
        } else {
          flow.nextStep()
        }
      }}
      onSwitchToExpert={onSwitchToExpert}
      onClose={onClose}
    />
  )
}
