/**
 * useQuestionnaireFlow Hook
 *
 * Manages the questionnaire state, navigation, and answer processing
 */

import { useState, useCallback, useMemo } from 'react'
import {
  WIZARD_QUESTIONS,
  WizardAnswers,
  calculatePresetScores,
  getTopPresets,
  buildConfigFromAnswers,
} from './questionnaire-data'

export interface UseQuestionnaireFlowReturn {
  // State
  currentStep: number
  totalSteps: number
  answers: WizardAnswers
  isComplete: boolean
  currentQuestion: typeof WIZARD_QUESTIONS[0] | null
  extrusionDepth: number
  tiltAngle: number

  // Navigation
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  canGoNext: boolean
  canGoPrev: boolean

  // Answers
  setAnswer: (questionId: string, value: string | string[] | undefined) => void
  getAnswer: (questionId: string) => string | string[] | number | undefined
  toggleMultiAnswer: (questionId: string, optionId: string) => void
  setAnswersFromAnalysis: (analysisAnswers: WizardAnswers) => void
  setExtrusionDepth: (value: number) => void
  setTiltAngle: (value: number) => void

  // Results
  getRecommendedPresets: () => Array<{ presetId: string; score: number }>
  getConfigFromAnswers: () => Record<string, any>
  resetWizard: () => void
}

export function useQuestionnaireFlow(): UseQuestionnaireFlowReturn {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<WizardAnswers>({})
  const [extrusionDepth, setExtrusionDepth] = useState(50)
  const [tiltAngle, setTiltAngle] = useState(0)

  const totalSteps = WIZARD_QUESTIONS.length
  const isComplete = currentStep >= totalSteps

  // Find next valid step (skipping questions with skipIf returning true)
  const findNextValidStep = useCallback((fromStep: number, direction: 'forward' | 'backward'): number => {
    let step = fromStep
    const increment = direction === 'forward' ? 1 : -1
    const limit = direction === 'forward' ? WIZARD_QUESTIONS.length : -1

    while (step !== limit) {
      const question = WIZARD_QUESTIONS[step]
      if (question && question.skipIf) {
        if (question.skipIf(answers)) {
          step += increment
          continue
        }
      }
      return step
    }
    return step
  }, [answers])

  const currentQuestion = useMemo(() => {
    if (currentStep >= 0 && currentStep < WIZARD_QUESTIONS.length) {
      return WIZARD_QUESTIONS[currentStep]
    }
    return null
  }, [currentStep])

  // Check if current step has a valid answer
  const canGoNext = useMemo(() => {
    if (!currentQuestion) return false

    const answer = answers[currentQuestion.id]

    if (!currentQuestion.required) return true

    if (currentQuestion.type === 'text') {
      return typeof answer === 'string' && answer.trim().length > 0
    }

    if (currentQuestion.type === 'multi') {
      return Array.isArray(answer) && answer.length > 0
    }

    return typeof answer === 'string' && answer.length > 0
  }, [currentQuestion, answers])

  const canGoPrev = currentStep > 0

  // Navigation
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= totalSteps) {
      setCurrentStep(step)
    }
  }, [totalSteps])

  const nextStep = useCallback(() => {
    if (canGoNext && currentStep < totalSteps) {
      const nextValidStep = findNextValidStep(currentStep + 1, 'forward')
      setCurrentStep(nextValidStep)
    }
  }, [canGoNext, currentStep, totalSteps, findNextValidStep])

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      const prevValidStep = findNextValidStep(currentStep - 1, 'backward')
      setCurrentStep(Math.max(0, prevValidStep))
    }
  }, [canGoPrev, currentStep, findNextValidStep])

  // Answer management
  const setAnswer = useCallback((questionId: string, value: string | string[] | undefined) => {
    setAnswers((prev) => {
      if (value === undefined) {
        // Remove the answer key when value is undefined (deselect)
        const { [questionId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [questionId]: value }
    })
  }, [])

  const getAnswer = useCallback(
    (questionId: string) => answers[questionId],
    [answers]
  )

  const toggleMultiAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId]
      const currentArray = Array.isArray(current) ? current : []

      // Find the question to check maxSelections
      const question = WIZARD_QUESTIONS.find((q) => q.id === questionId)
      const maxSelections = question?.maxSelections || Infinity

      if (currentArray.includes(optionId)) {
        // Remove if already selected
        return { ...prev, [questionId]: currentArray.filter((id) => id !== optionId) }
      } else {
        // Add if not at max
        if (currentArray.length < maxSelections) {
          return { ...prev, [questionId]: [...currentArray, optionId] }
        }
      }
      return prev
    })
  }, [])

  // Results
  const getRecommendedPresets = useCallback(() => {
    const scores = calculatePresetScores(answers)
    return getTopPresets(scores, 5) // Changed from 4 to 5 for more variations
  }, [answers])

  const getConfigFromAnswers = useCallback(() => {
    const config = buildConfigFromAnswers({ ...answers, extrusionDepth, tiltAngle })
    return config
  }, [answers, extrusionDepth, tiltAngle])

  const resetWizard = useCallback(() => {
    setCurrentStep(0)
    setAnswers({})
    setExtrusionDepth(50)
    setTiltAngle(0)
  }, [])

  // Set all answers at once from analysis results
  const setAnswersFromAnalysis = useCallback((analysisAnswers: WizardAnswers) => {
    setAnswers(analysisAnswers)
  }, [])

  return {
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
    getAnswer,
    toggleMultiAnswer,
    setAnswersFromAnalysis,
    setExtrusionDepth,
    setTiltAngle,
    getRecommendedPresets,
    getConfigFromAnswers,
    resetWizard,
  }
}
