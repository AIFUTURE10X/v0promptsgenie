"use client"

/**
 * Wizard Questionnaire View Component
 *
 * Shows the step-by-step questionnaire flow.
 * Extracted from LogoWizard.tsx to keep files under 300 lines.
 */

import { ChevronLeft, ChevronRight, Sparkles, Settings, X } from 'lucide-react'
import { WizardProgressBar } from './WizardProgress'
import { QuestionCard } from './QuestionCard'
import type { Question } from './questions/useQuestionnaireFlow'

interface WizardQuestionnaireViewProps {
  currentStep: number
  totalSteps: number
  currentQuestion: Question | undefined
  answer: string | string[] | undefined
  extrusionDepth: number
  tiltAngle: number
  canGoNext: boolean
  onGoToStep: (step: number) => void
  onAnswer: (questionId: string, value: string) => void
  onToggleMulti: (questionId: string, optionId: string) => void
  onExtrusionChange: (depth: number) => void
  onTiltAngleChange: (angle: number) => void
  onBack: () => void
  onNext: () => void
  onSwitchToExpert: () => void
  onClose: () => void
}

export function WizardQuestionnaireView({
  currentStep,
  totalSteps,
  currentQuestion,
  answer,
  extrusionDepth,
  tiltAngle,
  canGoNext,
  onGoToStep,
  onAnswer,
  onToggleMulti,
  onExtrusionChange,
  onTiltAngleChange,
  onBack,
  onNext,
  onSwitchToExpert,
  onClose,
}: WizardQuestionnaireViewProps) {
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
            onStepClick={onGoToStep}
          />
        </div>

        {/* Question Content */}
        <div className="px-6 py-8 min-h-[300px]">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              answer={answer}
              onAnswer={(value) => onAnswer(currentQuestion.id, value)}
              onToggleMulti={(optionId) => onToggleMulti(currentQuestion.id, optionId)}
              extrusionDepth={extrusionDepth}
              onExtrusionChange={onExtrusionChange}
              tiltAngle={tiltAngle}
              onTiltAngleChange={onTiltAngleChange}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-white hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-sm text-zinc-500">
            {currentStep + 1} / {totalSteps}
          </span>

          <button
            onClick={onNext}
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
