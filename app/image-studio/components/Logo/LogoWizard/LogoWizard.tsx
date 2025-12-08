"use client"

/**
 * LogoWizard Component
 *
 * Main wizard container that guides users through logo creation
 * with a step-by-step questionnaire flow, including optional logo reference upload
 */

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Sparkles, Settings, Upload } from 'lucide-react'
import { WizardProgressBar } from './WizardProgress'
import { QuestionCard } from './QuestionCard'
import { useQuestionnaireFlow } from './questions/useQuestionnaireFlow'
import { VariationResults } from './variations/VariationResults'
import { LogoReferenceStep } from './LogoReferenceStep'
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

  const {
    currentStep,
    totalSteps,
    answers,
    isComplete,
    currentQuestion,
    extrusionDepth,
    tiltAngle,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    setAnswer,
    toggleMultiAnswer,
    setExtrusionDepth,
    setTiltAngle,
    getRecommendedPresets,
    getConfigFromAnswers,
    resetWizard,
    setAnswersFromAnalysis,
  } = useQuestionnaireFlow()

  if (!isOpen) return null

  // Handle analysis complete - skip to variations
  const handleAnalysisComplete = (analysis: AnalysisResult, brandName: string) => {
    const wizardAnswers = mapAnalysisToWizardAnswers(analysis, brandName)
    const config = mapAnalysisToConfig(analysis, brandName)
    const presets = getPresetsFromAnalysis(analysis)

    // Set the answers in the questionnaire flow (for consistency)
    setAnswersFromAnalysis(wizardAnswers)

    // Store analysis results for variations
    setAnalysisConfig(config)
    setAnalysisPresets(presets)

    // Skip to results
    setShowReferenceStep(false)
    setShowResults(true)
  }

  // Handle skip reference step - go to questionnaire
  const handleSkipReference = () => {
    setShowReferenceStep(false)
  }

  // Handle start over - go back to reference step
  const handleStartOver = () => {
    resetWizard()
    setShowResults(false)
    setShowReferenceStep(true)
    setAnalysisPresets(null)
    setAnalysisConfig(null)
  }

  // Show variation results when complete
  if (showResults || isComplete) {
    // Use analysis presets if available, otherwise use questionnaire-based presets
    const recommendedPresets = analysisPresets || getRecommendedPresets()
    const baseConfig = analysisConfig || getConfigFromAnswers()

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
            <div className="flex items-center gap-3">
              {/* Back button */}
              <button
                onClick={() => {
                  // If we came from analysis, go back to reference step
                  // Otherwise go back to questionnaire
                  if (analysisPresets) {
                    setShowResults(false)
                    setShowReferenceStep(true)
                    setAnalysisPresets(null)
                    setAnalysisConfig(null)
                  } else {
                    setShowResults(false)
                  }
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="p-2 rounded-lg bg-linear-to-r from-purple-500 to-pink-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Your Logo Variations</h2>
                <p className="text-xs text-zinc-400">
                  Choose a style to customize further
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartOver}
                className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Content */}
          <div className="p-6">
            <VariationResults
              recommendedPresets={recommendedPresets}
              baseConfig={baseConfig}
              onSelectVariation={(presetId) => {
                onSelectPreset(presetId, baseConfig)
                onClose()
              }}
              onGenerateNow={onGenerateNow ? (presetId, config) => {
                onGenerateNow(presetId, config)
                onClose()
              } : undefined}
            />
          </div>
        </div>
      </div>
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
              onSkip={handleSkipReference}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-linear-to-r from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Logo Wizard</h2>
              <p className="text-xs text-zinc-400">
                Answer a few questions to get personalized suggestions
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

        {/* Progress Bar with Clickable Steps */}
        <div className="px-6 pt-4">
          <WizardProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            onStepClick={goToStep}
          />
        </div>

        {/* Question Content */}
        <div className="px-6 py-8 min-h-[300px]">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onAnswer={(value) => setAnswer(currentQuestion.id, value)}
              onToggleMulti={(optionId) => toggleMultiAnswer(currentQuestion.id, optionId)}
              extrusionDepth={extrusionDepth}
              onExtrusionChange={setExtrusionDepth}
              tiltAngle={tiltAngle}
              onTiltAngleChange={setTiltAngle}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <button
            onClick={() => {
              if (currentStep === 0) {
                // Go back to reference step
                setShowReferenceStep(true)
              } else {
                prevStep()
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-white hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-sm text-zinc-500">
            {currentStep + 1} / {totalSteps}
          </span>

          <button
            onClick={() => {
              if (currentStep === totalSteps - 1) {
                setShowResults(true)
              } else {
                nextStep()
              }
            }}
            disabled={!canGoNext}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              canGoNext
                ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <Sparkles className="w-4 h-4" />
                See Results
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
