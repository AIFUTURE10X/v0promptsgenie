"use client"

import React from "react"

import { Home, ImageIcon, Film, Sparkles, Upload, User, Palette, ChevronUp, Loader2, RotateCcw, GripHorizontal, Zap, Sparkle, ChevronLeft, ChevronRight, X, Download, ChevronDown, Trash2, History } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { saveToHistory } from "@/lib/history"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import HistoryGrid from "@/components/history-grid"
import { useImageAnalysis } from './hooks/useImageAnalysis'
import { useImageUploads } from './hooks/useImageUploads'
import { useGenerationParams } from './hooks/useGenerationParams'
import { AnalysisCard } from './components/AnalysisCard'

type UploadedImage = {
  id: string
  file: File
  preview: string
  selected: boolean
  analysis?: string // Analysis text for this specific image
}

type AnalysisResult = {
  text: string
  loading: boolean
}

// Removed UploadedImage type definition here as it's now above

type CardType = "subject" | "scene" | "style" | "combined"

const DEFAULT_CARD_HEIGHT = 280

const getCleanStyleName = (style: string): string => {
  if (!style) return "Realistic"

  // Remove any markdown formatting, extra parameters, or conversational text
  const cleaned = style
    .replace(/\*\*/g, "") // Remove markdown bold
    .split("--")[0] // Remove anything after --
    .split("style_strength")[0] // Remove technical parameters
    .split("aspect_ratio")[0]
    .split(",")[0] // Take only first part if comma-separated
    .trim()

  // If it's too long or contains suspicious patterns, just return preset name
  if (cleaned.length > 50 || cleaned.includes("let me know") || cleaned.includes("need any")) {
    return "Custom Style"
  }

  return cleaned
}

const GOLD_GRADIENT = "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)"

export default function ImageAnalyzerPage() {
  const analysisHook = useImageAnalysis()
  const uploadsHook = useImageUploads()
  const paramsHook = useGenerationParams()

  // Destructuring from the hooks
  const {
    subjectImages,
    setSubjectImages,
    sceneImage,
    setSceneImage,
    styleImage,
    setStyleImage,
    referenceImage,
    setReferenceImage,
    handleFileUpload,
    handleReferenceImageUpload,
    handleRemoveReferenceImage,
    handleRemoveImage,
    handleSelectSubject,
    analyzeImage,
    subjectAnalysis,
    sceneAnalysis,
    styleAnalysis,
    setSubjectAnalysis,
    setSceneAnalysis,
    setStyleAnalysis,
    isDragging,
    setIsDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClick,
    handleUpload,
    animatingImages,
    setAnimatingImages,
  } = uploadsHook

  const {
    cardHeights,
    setCardHeights,
    resizingCard,
    setResizingCard,
    resizeStartY,
    setResizeStartY,
    resizeStartHeight,
    setResizeStartHeight,
    editingCard,
    setEditingCard,
    editText,
    setEditText,
    copiedCard,
    setCopiedCard,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    handleResetHeights,
    handleCopyAll,
    handleCopy,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    renderCard,
    useEffectResize, // From analysisHook
    useEffectStyleDropdown, // From analysisHook
    styleDropdownRef,
    showStyleDropdown,
    setShowStyleDropdown,
    styleAutoUpdated,
    setStyleAutoUpdated,
  } = analysisHook

  const {
    promptMode,
    setPromptMode,
    imageCount,
    setImageCount,
    aspectRatio,
    setAspectRatio,
    generatedImages,
    setGeneratedImages,
    isGenerating,
    setIsGenerating,
    generationError,
    setGenerationError,
    negativePrompt,
    setNegativePrompt,
    styleStrength,
    setStyleStrength,
    showAdvancedControls,
    setShowAdvancedControls,
    manualPrompt,
    setManualPrompt,
    manualCombinedPrompt,
    setManualCombinedPrompt,
    lightboxOpen,
    setLightboxOpen,
    lightboxIndex,
    setLightboxIndex,
    lightboxImages,
    setLightboxImages,
    showHistory,
    setShowHistory,
    historyData,
    setHistoryData,
    isLoadingHistory,
    setIsLoadingHistory,
    historyTab,
    setHistoryTab,
    aiHelperHistoryData,
    setAiHelperHistoryData,
    isLoadingAiHelperHistory,
    setIsLoadingAiHelperHistory,
    showAnalysisCards,
    setShowAnalysisCards,
    showImageGenerator,
    setShowImageGenerator,
    showUploadImages,
    setShowUploadImages,
    showGeneratorControls,
    setShowGeneratorControls,
    showPromptSettings,
    setShowPromptSettings,
    showPromptHelper,
    setShowPromptHelper,
    aiHelperImages,
    setAiHelperImages,
    selectedStylePreset,
    setSelectedStylePreset,
    selectedCameraAngle,
    setSelectedCameraAngle,
    selectedCameraLens,
    setSelectedCameraLens,
    includePromptInFilename,
    setIncludePromptInFilename,
    aiHelperSessionId,
    historyRefreshTrigger,
    setHistoryRefreshTrigger,
    promptHelperMessages,
    setPromptHelperMessages,
    promptHelperInput,
    setPromptHelperInput,
    isPromptHelperLoading,
    setIsPromptHelperLoading,
    editingSuggestionIndex,
    setEditingSuggestionIndex,
    editedSuggestion,
    setEditedSuggestion,
    handlePromptModeChange,
    fetchHistory,
    saveToHistory,
    deleteImageHistory,
    deleteAiHelperSession,
    loadAiHelperHistory,
    saveAiHelperMessage,
    clearAiHelperHistory,
    getCombinedPrompt,
    handleGenerateImage,
    handleReusePrompt,
    handleHistoryImageClick,
    styleOptions,
    handleAiHelperImageUpload,
    handleRemoveAiHelperImage,
    sendMessageToHelper,
    generatePromptSuggestion,
    handleEditSuggestion,
    handleSaveEditedSuggestion,
    handleCancelEditSuggestion,
    handleApplyAISuggestion,
    applyPromptSuggestions,
    handleDownloadImage,
    handleDownloadFromLightbox,
    openLightbox,
    closeLightbox,
    navigateLightbox,
    loadImageMetadata,
    handleClearAll,
    setHistoryTab,
    showSecondSubject,
    setShowSecondSubject,
    handleImageAnalysis,
  } = paramsHook

  const subjectInputRef = useRef<HTMLInputElement>(null)
  const sceneInputRef = useRef<HTMLInputElement>(null)
  const styleInputRef = useRef<HTMLInputElement>(null)
  const referenceInputRef = useRef<HTMLInputElement>(null)

  const compressImageIfNeeded = async (blob: Blob): Promise<Blob> => {
    const maxSizeBytes = 4 * 1024 * 1024 // 4MB limit for Gemini API

    if (blob.size <= maxSizeBytes) {
      return blob // No compression needed
    }

    console.log(`[v0] Image too large (${(blob.size / 1024 / 1024).toFixed(2)}MB), compressing...`)

    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Resize to max 2048px on longest side
        const maxDimension = 2048
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              console.log(`[v0] Image compressed from ${(blob.size / 1024 / 1024).toFixed(2)}MB to ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`)
              resolve(compressedBlob)
            } else {
              console.warn('[v0] Compression failed, using original')
              resolve(blob)
            }
          },
          'image/jpeg',
          0.85
        )
      }
      img.onerror = () => {
        console.warn('[v0] Image load error, using original')
        resolve(blob)
      }
      img.src = URL.createObjectURL(blob)
    })
  }

  const deleteImageHistory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this history entry?")) {
      return
    }

    try {
      const response = await fetch(`/api/image-analysis/delete?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refresh the history list
        fetchHistory()
        // Trigger HistoryGrid refresh
        setHistoryRefreshTrigger(prev => prev + 1)
      } else {
        alert("Failed to delete history entry")
      }
    } catch (error) {
      console.error("Error deleting history:", error)
      alert("Failed to delete history entry")
    }
  }

  const deleteAiHelperSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this chat session?")) {
      return
    }

    try {
      // Delete all messages in this session
      const response = await fetch(`/api/ai-helper/delete?session_id=${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refresh the history list
        loadAiHelperHistory()
      } else {
        alert("Failed to delete chat session")
      }
    } catch (error) {
      console.error("Error deleting chat session:", error)
      alert("Failed to delete chat session")
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadAiHelperHistory()
    }
  }, [])

  const loadAiHelperHistory = async () => {
    try {
      setIsLoadingAiHelperHistory(true)
      const response = await fetch(`/api/ai-helper/list`) // Removed sessionId from query, backend should handle fetching all
      if (response.ok) {
        const data = await response.json()
        // Load current session messages into chat
        setPromptHelperMessages(
          (data.data || [])
            .filter((msg: any) => msg.session_id === aiHelperSessionId)
            .map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              suggestions: msg.suggestions,
            })),
        )
        // Load all history for history view
        setAiHelperHistoryData(data.data || [])
      }
    } catch (error) {
      console.error("Failed to load AI helper history:", error)
    } finally {
      setIsLoadingAiHelperHistory(false)
    }
  }

  const saveAiHelperMessage = async (
    role: "user" | "assistant",
    content: string,
    suggestions?: any,
    images?: string[],
    imageAnalysis?: string,
  ) => {
    try {
      console.log("[v0 AI HELPER SAVE] Saving to ai_helper_history table:", {
        role,
        contentPreview: content.substring(0, 100),
        sessionId: aiHelperSessionId,
        imageCount: images?.length || 0,
        hasImageAnalysis: !!imageAnalysis,
        hasSuggestions: !!suggestions,
      })

      const response = await fetch("/api/ai-helper/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: aiHelperSessionId,
          role,
          content,
          suggestions,
          images, // Include images here
          imageAnalysis, // Include image analysis here
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0 AI HELPER SAVE] Failed:", errorData)
        throw new Error(errorData.error || "Save failed")
      }

      const result = await response.json()
      console.log("[v0 AI HELPER SAVE] Success - saved to ai_helper_history table")
    } catch (error) {
      console.error("[v0 AI HELPER SAVE] Error:", error)
      throw error
    }
  }

  const clearAiHelperHistory = async () => {
    try {
      await fetch(`/api/ai-helper/delete?session_id=${aiHelperSessionId}`, { // Specify session_id to delete only current session
        method: "DELETE",
      })
      setPromptHelperMessages([])
      setAiHelperImages([]) // Also clear client-side uploaded images
      // Update the history view as well if it's showing AI Helper chats
      if (historyTab === "ai-helper") {
        loadAiHelperHistory()
      }
    } catch (error) {
      console.error("Failed to clear AI helper history:", error)
    }
  }

  const handleFileUpload = async (file: File, type: "subject" | "scene" | "style") => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    const preview = URL.createObjectURL(file)

    if (type === "subject") {
      const newSubject: UploadedImage = {
        id: `subject-${Date.now()}-${Math.random()}`,
        file,
        preview,
        selected: true, // Auto-select new subjects
        analysis: undefined
      }
      
      setSubjectImages(prev => [...prev, newSubject])
      setAnimatingImages((prev) => ({ ...prev, subject: true }))
      setTimeout(() => {
        setAnimatingImages((prev) => ({ ...prev, subject: false }))
      }, 3000)
      
      analyzeImage(file, "subject", undefined, newSubject.id)
    } else if (type === "scene") {
      const uploadedImage = { id: `scene-${Date.now()}`, file, preview, selected: true }
      setSceneImage(uploadedImage)
      setSceneAnalysis({ text: "", loading: true })
      setAnimatingImages((prev) => ({ ...prev, scene: true }))
      setTimeout(() => {
        setAnimatingImages((prev) => ({ ...prev, scene: false }))
      }, 3000)
      analyzeImage(file, "scene")
    } else {
      const uploadedImage = { id: `style-${Date.now()}`, file, preview, selected: true }
      setStyleImage(uploadedImage)
      setStyleAnalysis({ text: "", loading: true })
      setAnimatingImages((prev) => ({ ...prev, style: true }))
      setTimeout(() => {
        setAnimatingImages((prev) => ({ ...prev, style: false }))
      }, 3000)
      analyzeImage(file, "style")
    }
  }

  const handleReferenceImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    const preview = URL.createObjectURL(file)
    setReferenceImage({ id: `${Date.now()}`, file, preview, selected: true }) // Add id and selected property
  }

  const handleRemoveReferenceImage = () => {
    if (referenceImage?.preview) {
      URL.revokeObjectURL(referenceImage.preview)
    }
    setReferenceImage(null)
  }

  const handleRemoveImage = (type: "subject" | "scene" | "style", subjectId?: string) => {
    if (type === "subject" && subjectId) {
      setSubjectImages(prev => {
        const toRemove = prev.find(img => img.id === subjectId)
        if (toRemove) {
          URL.revokeObjectURL(toRemove.preview)
        }
        
        const remaining = prev.filter(img => img.id !== subjectId)
        
        // If we removed the selected one, auto-select the first remaining
        if (remaining.length > 0 && !remaining.some(img => img.selected)) {
          remaining[0] = { ...remaining[0], selected: true }
        }
        
        return remaining
      })
    } else if (type === "scene" && sceneImage) {
      URL.revokeObjectURL(sceneImage.preview)
      setSceneImage(null)
      setSceneAnalysis({ text: "", loading: false })
    } else if (type === "style" && styleImage) {
      URL.revokeObjectURL(styleImage.preview)
      setStyleImage(null)
      setStyleAnalysis({ text: "", loading: false })
    }
  }

  const mapAnalysisToStyle = (analysisText: string): string | null => {
    const text = analysisText.toLowerCase()

    // Map keywords to style presets
    const styleMapping: Record<string, string[]> = {
      "Cartoon Style": ["cartoon", "comic book", "comic-book", "illustration", "vibrant", "bold colors"],
      "Comic Book": ["comic book", "comic-book", "halftone", "ink", "graphic novel"],
      Anime: ["anime", "manga", "japanese animation"],
      "Studio Ghibli": ["ghibli", "studio ghibli", "hand-painted", "pastoral"],
      "Makoto Shinkai": ["shinkai", "makoto shinkai", "soft lighting"],
      "Disney Modern 3D": ["disney", "pixar-like", "family-friendly"],
      "Sony Spider-Verse": ["spider-verse", "spiderverse", "mixed media"],
      Pixar: ["pixar", "3d animated", "appealing shapes"],
      PhotoReal: ["photorealistic", "photo-realistic", "photograph", "realistic photo"],
      Realistic: ["realistic", "lifelike", "natural"],
      "Oil Painting": ["oil painting", "oil paint", "brushstrokes", "painted"],
      Watercolor: ["watercolor", "watercolour", "wash", "soft edges"],
      "3D Render": ["3d render", "3d rendered", "cgi", "computer generated"],
      Sketch: ["sketch", "pencil", "line art", "drawing"],
      "Laika Stop-Motion": ["laika", "stop-motion", "stop motion", "tactile"],
      "Cartoon Saloon": ["cartoon saloon", "storybook", "flat decorative"],
      "Studio Trigger": ["trigger", "studio trigger", "neon colors"],
      Ufotable: ["ufotable", "vfx", "glow effects"],
      "Kyoto Animation": ["kyoto animation", "kyoani", "glossy eyes"],
    }

    // Check for matches (prioritize more specific styles first)
    for (const [style, keywords] of Object.entries(styleMapping)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return style
        }
      }
    }

    return null
  }

  const analyzeImage = async (file: File, type: "subject" | "scene" | "style", mode?: "fast" | "quality", subjectId?: string) => {
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("type", type)
      // Use provided mode or fall back to state
      formData.append("mode", mode || promptMode)

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()

      if (type === "subject" && subjectId) {
        setSubjectImages(prev => prev.map(img => 
          img.id === subjectId ? { ...img, analysis: data.analysis } : img
        ))
        setShowAnalysisCards(true)
        setShowImageGenerator(true)
      } else if (type === "scene") {
        setSceneAnalysis({ text: data.analysis, loading: false })
      } else {
        setStyleAnalysis({ text: data.analysis, loading: false })

        // Try to map the analysis to a style preset
        const detectedStyle = mapAnalysisToStyle(data.analysis)
        if (detectedStyle) {
          console.log("[v0] Auto-detected style from analysis:", detectedStyle)
          setSelectedStylePreset(detectedStyle)
          setStyleAutoUpdated(true)
          // Clear the animation after 2 seconds
          setTimeout(() => setStyleAutoUpdated(false), 2000)
        }
      }
    } catch (error) {
      console.error("Analysis error:", error)
      const errorResult = { text: "Analysis failed. Please try again.", loading: false }

      if (type === "subject" && subjectId) {
        setSubjectImages(prev => prev.map(img => 
          img.id === subjectId ? { ...img, analysis: errorResult.text } : img
        ))
      } else if (type === "scene") {
        setSceneAnalysis(errorResult)
      } else {
        setStyleAnalysis(errorResult)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent, cardType?: "subject" | "scene" | "style") => {
    e.preventDefault()
    e.stopPropagation()
    if (cardType) {
      setIsDragging(prev => ({ ...prev, [cardType]: true }))
    }
  }

  const handleDragLeave = (e: React.DragEvent, cardType?: "subject" | "scene" | "style") => {
    e.preventDefault()
    e.stopPropagation()
    if (cardType) {
      setIsDragging(prev => ({ ...prev, [cardType]: false }))
    }
  }

  const handleDrop = (e: React.DragEvent, type: "subject" | "scene" | "style") => {
    e.preventDefault()
    e.stopPropagation()
    if (type) {
      setIsDragging(prev => ({ ...prev, [type]: false }))
    }

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file, type)
    }
  }

  // Added handleClick function for subject images to handle selection and uploading
  const handleClick = (type: "subject" | "scene" | "style", id?: string) => {
    if (type === "subject" && id) {
      handleSelectSubject(id)
    } else if (type === "subject") {
      subjectInputRef.current?.click()
    } else if (type === "scene") {
      sceneInputRef.current?.click()
    } else {
      styleInputRef.current?.click()
    }
  }

  // Added handleUpload function for subject images to handle uploads on click
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "subject" | "scene" | "style", id?: string) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (type === "subject" && id) {
      // Find the subject to replace
      const subjectToReplace = subjectImages.find(img => img.id === id)
      if (!subjectToReplace) return

      const file = files[0]
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }

      const preview = URL.createObjectURL(file)
      URL.revokeObjectURL(subjectToReplace.preview) // Revoke old preview URL

      setSubjectImages(prev => prev.map(img =>
        img.id === id ? { ...img, file, preview } : img
      ))
      setSubjectAnalysis({ text: "", loading: true })
      analyzeImage(file, "subject", undefined, id) // Pass id to analyzeImage
    } else if (type === "scene") {
      handleFileUpload(files[0], "scene")
    } else if (type === "style") {
      handleFileUpload(files[0], "style")
    }
    e.target.value = "" // Clear the input
  }

  const handleSelectSubject = (id: string) => {
    setSubjectImages(prev => 
      prev.map(img => 
        img.id === id 
          ? { ...img, selected: !img.selected } // Toggle the clicked subject
          : img // Keep others unchanged
      )
    )
  }

  const getCombinedPrompt = () => {
    if (manualCombinedPrompt) {
      return manualCombinedPrompt
    }
    const parts = []
    
    // Combine all selected subject analyses
    const selectedSubjects = subjectImages.filter(img => img.selected && img.analysis)
    if (selectedSubjects.length > 0) {
      const combinedSubjectAnalysis = selectedSubjects.map(img => img.analysis).join(". ")
      parts.push(combinedSubjectAnalysis)
    }
    
    if (sceneAnalysis.text) parts.push(sceneAnalysis.text)
    if (styleAnalysis.text) parts.push(styleAnalysis.text)
    return parts.join(" ")
  }

  const handleCopyAll = async () => {
    const combined = getCombinedPrompt()
    if (combined) {
      await navigator.clipboard.writeText(combined)
      setCopiedCard("combined")
      setTimeout(() => setCopiedCard(null), 2000)
    }
  }

  const handleCopy = async (type: "subject" | "scene" | "style") => {
    let text = ""
    if (type === "subject") {
      // Copy analysis of the selected subject
      const selectedSubject = subjectImages.find(s => s.selected)
      if (selectedSubject && selectedSubject.analysis) {
        text = selectedSubject.analysis
      }
    } else if (type === "scene") {
      text = sceneAnalysis.text
    } else if (type === "style") {
      text = styleAnalysis.text
    }

    if (text) {
      await navigator.clipboard.writeText(text)
      setCopiedCard(type)
      setTimeout(() => setCopiedCard(null), 2000)
    }
  }

  const handleEdit = (type: "subject" | "scene" | "style" | "combined") => {
    setEditingCard(type)
    if (type === "subject") {
      // Edit analysis of the selected subject
      const selectedSubject = subjectImages.find(s => s.selected)
      if (selectedSubject && selectedSubject.analysis) {
        setEditText(selectedSubject.analysis)
      }
    } else if (type === "scene") {
      setEditText(sceneAnalysis.text)
    } else if (type === "style") {
      setEditText(styleAnalysis.text)
    } else if (type === "combined") {
      setEditText(getCombinedPrompt())
    }
  }

  const handleSaveEdit = () => {
    if (editingCard === "subject") {
      // Save edit for the selected subject's analysis
      const selectedSubject = subjectImages.find(s => s.selected)
      if (selectedSubject) {
        setSubjectImages(prev => prev.map(img => 
          img.id === selectedSubject.id ? { ...img, analysis: editText } : img
        ))
      }
    } else if (editingCard === "scene") {
      setSceneAnalysis({ text: editText, loading: false })
    } else if (editingCard === "style") {
      setStyleAnalysis({ text: editText, loading: false })
    } else if (editingCard === "combined") {
      setManualCombinedPrompt(editText)
    }
    setEditingCard(null)
    setEditText("")
  }

  const handleCancelEdit = () => {
    setEditingCard(null)
    setEditText("")
  }

  const handleResizeStart = (e: React.MouseEvent, cardType: CardType) => {
    e.preventDefault()
    setResizingCard(cardType)
    setResizeStartY(e.clientY)
    setResizeStartHeight(cardHeights[cardType])
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingCard) return

    const deltaY = e.clientY - resizeStartY
    const newHeight = Math.max(200, resizeStartHeight + deltaY)

    setCardHeights((prev) => ({
      ...prev,
      [resizingCard]: newHeight,
    }))
  }

  const handleResizeEnd = () => {
    setResizingCard(null)
  }

  const handleResetHeights = () => {
    setCardHeights({
      subject: DEFAULT_CARD_HEIGHT,
      scene: DEFAULT_CARD_HEIGHT,
      style: DEFAULT_CARD_HEIGHT,
      combined: DEFAULT_CARD_HEIGHT,
    })
  }

  const handleClearAll = () => {
    if (subjectImages.some(img => img.preview)) {
      subjectImages.forEach(img => URL.revokeObjectURL(img.preview))
    }
    if (sceneImage?.preview) URL.revokeObjectURL(sceneImage.preview)
    if (styleImage?.preview) URL.revokeObjectURL(styleImage.preview)
    if (referenceImage?.preview) URL.revokeObjectURL(referenceImage.preview)

    setSubjectImages([]) // Clear all subjects
    setSceneImage(null)
    setStyleImage(null)
    setReferenceImage(null)

    setSubjectAnalysis({ text: "", loading: false })
    setSceneAnalysis({ text: "", loading: false })
    setStyleAnalysis({ text: "", loading: false })
    setManualCombinedPrompt("")

    setEditingCard(null)
    setEditText("")

    setCardHeights({
      subject: DEFAULT_CARD_HEIGHT,
      scene: DEFAULT_CARD_HEIGHT,
      style: DEFAULT_CARD_HEIGHT,
      combined: DEFAULT_CARD_HEIGHT,
    })

    setGeneratedImages([])

    setManualPrompt("")
    setNegativePrompt("")
    setAspectRatio("1:1")
    setImageCount(1)
    setSelectedStylePreset("Realistic")
    setSelectedCameraAngle("")
    setSelectedCameraLens("")
    setStyleStrength("moderate")

    // Clear AI helper conversation
    setPromptHelperMessages([])
    setAiHelperImages([]) // Clear AI helper uploaded images
    clearAiHelperHistory() // Clear history from backend
    setAiHelperHistoryData([]) // Clear history view state
    setHistoryTab("images") // Reset to default tab

    // Reset the second subject card visibility
    setShowSecondSubject(false)

    // Reset history trigger
    setHistoryRefreshTrigger(0)
  }

  const handlePromptModeChange = async (mode: "fast" | "quality") => {
    setPromptMode(mode)

    setManualCombinedPrompt("")

    // Re-analyze all uploaded images with the new mode, passing mode directly
    if (subjectImages.length > 0) {
      // Iterate through all subjects and re-analyze
      for (const subject of subjectImages) {
        setSubjectImages(prev => prev.map(img => 
          img.id === subject.id ? { ...img, analysis: undefined } : img
        )) // Clear analysis to show loading
        setSubjectAnalysis({ text: subjectAnalysis.text, loading: true }) // Show loading state for general subject card
        await analyzeImage(subject.file, "subject", mode, subject.id)
      }
    }
    if (sceneImage) {
      setSceneAnalysis({ text: sceneAnalysis.text, loading: true })
      await analyzeImage(sceneImage.file, "scene", mode)
    }
    if (styleImage) {
      setStyleAnalysis({ text: styleAnalysis.text, loading: true })
      await analyzeImage(styleImage.file, "style", mode)
    }
  }

  // Updated renderCard to handle multiple subject images
  const renderCard = (cardType: CardType) => {
    switch (cardType) {
      case "subject":
        // Render subject analysis card
        const selectedSubject = subjectImages.find(s => s.selected)
        const subjectAnalysisText = selectedSubject?.analysis ?? "" // Use analysis from selected subject
        const subjectLoading = subjectImages.some(img => img.id === selectedSubject?.id && img.analysis === undefined); // Check if the selected subject is still loading

        return (
          <div className="relative" style={{ height: `${cardHeights.subject}px` }}>
            <div className="h-full bg-black rounded-lg p-6 flex flex-col border border-[#c99850]/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#c99850]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" style={{ color: "#c99850" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#c99850] mb-1 truncate">Subject Analysis</h3>
                  <p className="text-xs text-[#c99850]/70 truncate">Analyzes the main subject</p>
                </div>
                {selectedSubject && subjectAnalysisText && !subjectLoading && (
                  <div className="flex flex-wrap gap-1.5 items-start">
                    {editingCard === "subject" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={handleSaveEdit}
                        >
                          ✓ Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={handleCancelEdit}
                        >
                          ✕ Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={async () => {
                            if (selectedSubject) {
                              // Trigger analysis for the selected subject
                              setSubjectImages(prev => prev.map(img => 
                                img.id === selectedSubject.id ? { ...img, analysis: undefined } : img
                              )); // Clear analysis to show loading
                              await analyzeImage(selectedSubject.file, "subject", undefined, selectedSubject.id);
                            }
                          }}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Regenerate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={() => handleEdit("subject")}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={() => handleCopy("subject")}
                        >
                          {copiedCard === "subject" ? "✓ Copied!" : "📋 Copy"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-start justify-center overflow-hidden pt-2">
                {subjectLoading ? ( // Use loading state from selected subject
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-[#c99850]/60 mx-auto mb-2 animate-spin" />
                    <p className="text-xs text-[#c99850]/70">Analyzing...</p>
                  </div>
                ) : subjectAnalysisText ? (
                  editingCard === "subject" ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full h-full text-xs text-[#c99850] bg-[#c99850]/10 rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#c99850]/30"
                    />
                  ) : (
                    <div className="w-full text-xs text-[#c99850]/80 leading-relaxed px-1">{subjectAnalysisText}</div>
                  )
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-[#c99850]/40 mx-auto mb-2" />
                    <p className="text-xs text-[#c99850]/70">Upload an image to analyze</p>
                  </div>
                )}
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-6 cursor-ns-resize bg-[#c99850]/20 hover:bg-[#c99850]/30 transition-all flex items-center justify-center rounded-b-lg ${
                resizingCard === "subject" ? "bg-[#c99850]/40" : ""
              }`}
              onMouseDown={(e) => handleResizeStart(e, "subject")}
            >
              <GripHorizontal className="w-5 h-5 text-[#c99850]/50" />
            </div>
          </div>
        )

      case "scene":
        return (
          <div className="relative" style={{ height: `${cardHeights.scene}px` }}>
            <div className="h-full bg-black rounded-lg p-6 flex flex-col border border-[#c99850]/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#c99850]/10 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-4 h-4" style={{ color: "#c99850" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#c99850] mb-1 truncate">Scene Analysis</h3>
                  <p className="text-xs text-[#c99850]/70 truncate">Analyzes the environment</p>
                </div>
                {sceneAnalysis.text && !sceneAnalysis.loading && (
                  <div className="flex flex-wrap gap-1.5 items-start">
                    {editingCard === "scene" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={handleSaveEdit}
                        >
                          ✓ Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={handleCancelEdit}
                        >
                          ✕ Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={async () => {
                            if (sceneImage) {
                              setSceneAnalysis({ text: sceneAnalysis.text, loading: true })
                              await analyzeImage(sceneImage.file, "scene")
                            }
                          }}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Regenerate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={() => handleEdit("scene")}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={() => handleCopy("scene")}
                        >
                          {copiedCard === "scene" ? "✓ Copied!" : "📋 Copy"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-start justify-center overflow-hidden pt-2">
                {sceneAnalysis.loading ? (
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-[#c99850]/60 mx-auto mb-2 animate-spin" />
                    <p className="text-xs text-[#c99850]/70">Analyzing...</p>
                  </div>
                ) : sceneAnalysis.text ? (
                  editingCard === "scene" ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full h-full text-xs text-[#c99850] bg-[#c99850]/10 rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#c99850]/30"
                    />
                  ) : (
                    <div className="w-full text-xs text-[#c99850]/80 leading-relaxed px-1">{sceneAnalysis.text}</div>
                  )
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-[#c99850]/40 mx-auto mb-2" />
                    <p className="text-xs text-[#c99850]/70">Upload an image to analyze</p>
                  </div>
                )}
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-6 cursor-ns-resize bg-[#c99850]/20 hover:bg-[#c99850]/30 transition-all flex items-center justify-center rounded-b-lg ${
                resizingCard === "scene" ? "bg-[#c99850]/40" : ""
              }`}
              onMouseDown={(e) => handleResizeStart(e, "scene")}
            >
              <GripHorizontal className="w-5 h-5 text-[#c99850]/50" />
            </div>
          </div>
        )

      case "style":
        return (
          <div className="relative" style={{ height: `${cardHeights.style}px` }}>
            <div className="h-full bg-black rounded-lg p-6 flex flex-col border border-[#c99850]/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#c99850]/10 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-4 h-4" style={{ color: "#c99850" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#c99850] mb-1 truncate">Style Analysis</h3>
                  <p className="text-xs text-[#c99850]/70 truncate">Identifies artistic style</p>
                </div>
                {styleAnalysis.text && !styleAnalysis.loading && (
                  <div className="flex flex-wrap gap-1.5 items-start">
                    {editingCard === "style" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={handleSaveEdit}
                        >
                          ✓ Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={handleCancelEdit}
                        >
                          ✕ Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={async () => {
                            if (styleImage) {
                              setStyleAnalysis({ text: styleAnalysis.text, loading: true })
                              await analyzeImage(styleImage.file, "style")
                            }
                          }}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Regenerate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={() => handleEdit("style")}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-black"
                          style={{
                            background: GOLD_GRADIENT,
                          }}
                          onClick={() => handleCopy("style")}
                        >
                          {copiedCard === "style" ? "✓ Copied!" : "📋 Copy"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-start justify-center overflow-hidden pt-2">
                {styleAnalysis.loading ? (
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-[#c99850]/60 mx-auto mb-2 animate-spin" />
                    <p className="text-xs text-[#c99850]/70">Analyzing...</p>
                  </div>
                ) : styleAnalysis.text ? (
                  editingCard === "style" ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full h-full text-xs text-[#c99850] bg-[#c99850]/10 rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#c99850]/30"
                    />
                  ) : (
                    <div className="w-full text-xs text-[#c99850]/80 leading-relaxed px-1">{styleAnalysis.text}</div>
                  )
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-[#c99850]/40 mx-auto mb-2" />
                    <p className="text-xs text-[#c99850]/70">Upload an image to analyze</p>
                  </div>
                )}
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-6 cursor-ns-resize bg-[#c99850]/20 hover:bg-[#c99850]/30 transition-all flex items-center justify-center rounded-b-lg ${
                resizingCard === "style" ? "bg-[#c99850]/40" : ""
              }`}
              onMouseDown={(e) => handleResizeStart(e, "style")}
            >
              <GripHorizontal className="w-5 h-5 text-[#c99850]/50" />
            </div>
          </div>
        )

      case "combined":
        return (
          <div className="relative" style={{ height: `${cardHeights.combined}px` }}>
            <div className="h-full bg-black rounded-lg p-6 flex flex-col border border-[#c99850]/20">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#c99850]">Combined Prompt</h3>
                  <p className="text-xs text-[#c99850]/70 whitespace-nowrap">
                    {getCombinedPrompt() ? "Combined analysis ready" : "Upload images to auto-generate"}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {editingCard === "combined" ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-1.5 text-[10px] text-black"
                        style={{
                          background: GOLD_GRADIENT,
                        }}
                        onClick={handleSaveEdit}
                      >
                        ✓ Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-1.5 text-[10px] text-black"
                        style={{
                          background: GOLD_GRADIENT,
                        }}
                        onClick={handleCancelEdit}
                      >
                        ✕ Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-1.5 text-[10px] text-black"
                        style={{
                          background: GOLD_GRADIENT,
                        }}
                        onClick={() => handleEdit("combined")}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-1.5 text-[10px] text-black"
                        style={{
                          background: GOLD_GRADIENT,
                        }}
                        onClick={handleCopyAll}
                        disabled={!getCombinedPrompt()}
                      >
                        {copiedCard === "combined" ? "✓ Copied!" : "📋 Copy"}
                      </Button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (
                            confirm(
                              "Clear all generator controls, images, and prompts? This will reset everything to defaults.",
                            )
                          ) {
                            handleClearAll()
                          }
                        }}
                        className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors"
                        title="Clear all generator controls and AI Helper history"
                      >
                        Clear All
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 flex items-start justify-center overflow-hidden pt-2">
                {editingCard === "combined" ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full h-full text-xs text-[#c99850] bg-[#c99850]/10 rounded p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#c99850]/30"
                    placeholder="Type your combined prompt here..."
                  />
                ) : getCombinedPrompt() ? (
                  <div className="w-full text-xs text-[#c99850]/80 leading-relaxed px-1">{getCombinedPrompt()}</div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-[#c99850]/40 mx-auto mb-2" />
                    <p className="text-xs text-[#c99850]/70">Upload images to auto-generate prompts</p>
                  </div>
                )}
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 h-6 cursor-ns-resize bg-[#c99850]/20 hover:bg-[#c99850]/30 transition-all flex items-center justify-center rounded-b-lg ${
                resizingCard === "combined" ? "bg-[#c99850]/40" : ""
              }`}
              onMouseDown={(e) => handleResizeStart(e, "combined")}
            >
              <GripHorizontal className="w-5 h-5 text-[#c99850]/50" />
            </div>
          </div>
        )
    }
  }

  useEffect(() => {
    if (resizingCard) {
      document.addEventListener("mousemove", handleResizeMove)
      document.addEventListener("mouseup", handleResizeEnd)

      return () => {
        document.removeEventListener("mousemove", handleResizeMove)
        document.removeEventListener("mouseup", handleResizeEnd)
      }
    }
  }, [resizingCard])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setShowStyleDropdown(false)
      }
    }

    if (showStyleDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showStyleDropdown])

  useEffect(() => {
    if (showHistory && historyData.length === 0) {
      fetchHistory()
    }
  }, [showHistory])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const navigateLightbox = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : generatedImages.length - 1))
    } else {
      setLightboxIndex((prev) => (prev < generatedImages.length - 1 ? prev + 1 : 0))
    }
  }

  const loadImageMetadata = useCallback(async (url: string, index: number) => {
    try {
      // Load dimensions and file size in parallel
      const [dimensions, fileSizeMB] = await Promise.all([
        // Load dimensions
        new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image()
          img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight })
          }
          img.onerror = () => {
            resolve({ width: 0, height: 0 })
          }
          img.src = url
        }),

        // Calculate file size
        (async () => {
          try {
            let sizeInBytes = 0

            if (url.startsWith("data:")) {
              const base64 = url.split(",")[1]
              if (base64) {
                const padding = (base64.match(/=/g) || []).length
                sizeInBytes = (base64.length * 3) / 4 - padding
              }
            } else {
              const response = await fetch(url)
              const blob = await response.blob()
              sizeInBytes = blob.size
            }

            return sizeInBytes / (1024 * 1024) // Convert to MB
          } catch (error) {
            console.error("[v0] Error calculating file size:", error)
            return 0
          }
        })(),
      ])

      // Single state update with all metadata
      setGeneratedImages((prev) => {
        const updated = [...prev]
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            dimensions,
            fileSizeMB,
          }
        }
        return updated
      })
    } catch (error) {
      console.error("[v0] Error loading image metadata:", error)
    }
  }, [])

  const handleDownloadFromLightbox = useCallback(() => {
    const imageUrl = generatedImages[lightboxIndex]?.url
    if (!imageUrl) return

    let filename: string

    if (includePromptInFilename) {
      const stylePrefix = selectedStylePreset
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()

      const combinedText = getCombinedPrompt() || manualPrompt || "image"
      const cleanText = combinedText
        .substring(0, 80)
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()

      filename = `${stylePrefix}-${cleanText}.png`
    } else {
      filename = `generated-image-${lightboxIndex + 1}.png`
    }

    const link = document.createElement("a")
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [generatedImages, lightboxIndex, includePromptInFilename, manualPrompt, selectedStylePreset]) // Added manualPrompt and selectedStylePreset

  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox()
      } else if (e.key === "ArrowLeft") {
        navigateLightbox("prev")
      } else if (e.key === "ArrowRight") {
        navigateLightbox("next")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen, generatedImages.length])

  const handleDownloadImage = useCallback(
    (imageUrl: string, index: number) => {
      let filename: string

      if (includePromptInFilename) {
        const stylePrefix = selectedStylePreset
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase()

        const combinedText = getCombinedPrompt() || manualPrompt || "image"
        const cleanText = combinedText
          .substring(0, 80)
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase()

        filename = `${stylePrefix}-${cleanText}.png`
      } else {
        filename = `generated-image-${index + 1}.png`
      }

      const link = document.createElement("a")
      link.href = imageUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [includePromptInFilename, manualPrompt, selectedStylePreset],
  ) // Added manualPrompt and selectedStylePreset

  // Refactored this to use sendMessageToHelper for consistency
  const sendMessageToHelper = async (userInputText: string) => {
    const displayMessage = userInputText.trim() || "📷 [Image uploaded]"
    const userMessage = { role: "user" as const, content: displayMessage }
    setPromptHelperMessages((prev) => [...prev, userMessage])
    setPromptHelperInput("")
    setIsPromptHelperLoading(true)

    const currentImages = [...aiHelperImages]
    try {
      await saveAiHelperMessage(
        "user",
        displayMessage,
        undefined,
        currentImages.length > 0 ? currentImages : undefined,
      )
      console.log("[v0] User message saved to database with images")
    } catch (saveError) {
      console.error("[v0] WARNING: Failed to save user message:", saveError)
    }

    let imageAnalysisContext = ""
    let combinedImageAnalysis = "" // Initialize combinedImageAnalysis

    // Process uploaded images
    if (aiHelperImages.length > 0) {
      console.log("[v0] ===== PROCESSING IMAGES =====")
      console.log("[v0] Total images to analyze:", aiHelperImages.length)

      const analyses: Array<{ index: number; analysis: string; error?: boolean }> = []

      for (let index = 0; index < aiHelperImages.length; index++) {
        const imageNumber = index + 1
        console.log(`[v0] ----- IMAGE ${imageNumber}/${aiHelperImages.length} -----`)

        try {
          const imageUrl = aiHelperImages[index]
          console.log(`[v0] Image ${imageNumber} URL type:`, imageUrl.substring(0, 30))

          // Convert data URL to blob
          const response = await fetch(imageUrl)
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`)
          }

          const originalBlob = await response.blob()
          console.log(`[v0] Image ${imageNumber} original size: ${(originalBlob.size / 1024 / 1024).toFixed(2)}MB`)

          const blob = await compressImageIfNeeded(originalBlob)
          console.log(`[v0] Image ${imageNumber} final size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`)

          const file = new File([blob], `reference-image-${imageNumber}.jpg`, { type: blob.type })

          // Create form data
          const formData = new FormData()
          formData.append("image", file)
          formData.append("type", "subject")
          formData.append("mode", "quality")

          console.log(`[v0] Image ${imageNumber}: Sending to analyze-image API...`)

          const analysisResponse = await fetch("/api/analyze-image", {
            method: "POST",
            body: formData,
          })

          console.log(`[v0] Image ${imageNumber} response:`, {
            status: analysisResponse.status,
            ok: analysisResponse.ok,
          })

          if (analysisResponse.ok) {
            const data = await analysisResponse.json()

            if (data.analysis) {
              console.log(`[v0] Image ${imageNumber} SUCCESS - Analysis length:`, data.analysis.length)
              analyses.push({
                index: imageNumber,
                analysis: data.analysis,
                error: false,
              })
            } else {
              console.error(`[v0] Image ${imageNumber} ERROR: No analysis in response`)
              analyses.push({
                index: imageNumber,
                analysis: "No analysis returned from API",
                error: true,
              })
            }
          } else {
            const errorText = await analysisResponse.text()
            let errorData
            try {
              errorData = JSON.parse(errorText)
            } catch {
              errorData = { error: errorText }
            }

            console.error(`[v0] Image ${imageNumber} API ERROR:`, {
              status: analysisResponse.status,
              error: errorData,
            })

            const errorMsg = errorData.error || errorData.details || errorText || "Unknown error"
            analyses.push({
              index: imageNumber,
              analysis: `API Error: ${errorMsg}`,
              error: true,
            })
          }
        } catch (error) {
          console.error(`[v0] Image ${imageNumber} EXCEPTION:`, error)
          analyses.push({
            index: imageNumber,
            analysis: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            error: true,
          })
        }
      }

      console.log("[v0] ===== IMAGE ANALYSIS COMPLETE =====")
      console.log("[v0] Results:", {
        total: analyses.length,
        successful: analyses.filter((a) => !a.error).length,
        failed: analyses.filter((a) => a.error).length,
      })

      // Build context from analyses
      if (analyses.length > 0) {
        const successfulAnalyses = analyses.filter((a) => !a.error)
        const failedAnalyses = analyses.filter((a) => a.error)

        if (successfulAnalyses.length > 0) {
          combinedImageAnalysis = successfulAnalyses.map((a) => `[IMAGE ${a.index}]: ${a.analysis}`).join("\n\n")

          imageAnalysisContext = `

=== REFERENCE IMAGES ANALYSIS ===
${successfulAnalyses.map((a) => `[IMAGE ${a.index}] - DETAILED CHARACTER/SUBJECT DESCRIPTION:
${a.analysis}`).join("\n\n")}

CRITICAL INSTRUCTIONS: The user has uploaded ${successfulAnalyses.length} reference image(s). When they mention "this character", "the image", "image ${successfulAnalyses[0]?.index}", etc., they want you to REPLICATE THE EXACT CHARACTER/SUBJECT from the analysis above. You MUST:
1. Extract ALL specific visual details from the image analysis
2. Include character-defining features: facial features, clothing, accessories, body type, pose
3. Preserve unique characteristics: hairstyle, facial hair, jewelry, color schemes, proportions
4. Maintain the character's personality and expression
5. Be extremely detailed and specific in your prompts

DO NOT create generic descriptions. Recreate THIS SPECIFIC CHARACTER accurately.`

          console.log("[v0] Image analysis context built:", {
            length: imageAnalysisContext.length,
            preview: imageAnalysisContext.substring(0, 200) + "...",
          })
        }

        if (failedAnalyses.length > 0) {
          imageAnalysisContext += `\n\nWARNING: ${failedAnalyses.length} image(s) failed to analyze:\n${failedAnalyses.map((a) => `- Image ${a.index}: ${a.analysis}`).join("\n")}`
        }
      }

      // Clear images after processing
      setAiHelperImages([])
    }

    const fullMessage = userInputText + imageAnalysisContext
    console.log("[v0] Final message:", {
      totalLength: fullMessage.length,
      hasImageContext: imageAnalysisContext.length > 0,
      imageContextLength: imageAnalysisContext.length,
      messagePreview: fullMessage.substring(0, 300) + "...",
    })

    console.log("[v0] ===== CALLING GENERATE PROMPT SUGGESTION =====")
    await generatePromptSuggestion(fullMessage)

    try {
      // Save assistant response with its content and suggestions only
      if (!isPromptHelperLoading) {
        // This part is tricky, the response will come from generatePromptSuggestion.
        // We need to ensure the latest messages state is used.
      }
    } catch (saveError) {
      console.error("[v0] WARNING: Failed to save assistant message:", saveError)
    } finally {
      setIsPromptHelperLoading(false)
    }
  }

  // Renamed and modified to directly call the AI model
  const generatePromptSuggestion = async (userMessage: string) => {
    try {
      const response = await fetch("/api/generate-prompt-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          currentPrompt: manualPrompt, // Use manualPrompt for current prompt
          currentNegativePrompt: negativePrompt,
          currentStyle: selectedStylePreset,
          currentCameraAngle: selectedCameraAngle,
          currentCameraLens: selectedCameraLens,
          currentAspectRatio: aspectRatio,
          styleStrength,
          promptMode,
          conversationHistory: promptHelperMessages, // Pass entire conversation history for context
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Create an assistant message object with suggestions
        const assistantMessage = {
          role: "assistant" as const,
          content: data.message,
          suggestions: data.suggestions,
        }
        setPromptHelperMessages((prev) => [...prev, assistantMessage])
        // Pass suggestions to saveAiHelperMessage
        await saveAiHelperMessage("assistant", data.message, data.suggestions)
      } else {
        // Handle API errors more gracefully
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred." }))
        const errorMessage = {
          role: "assistant" as const,
          content: `Error: ${errorData.error || response.statusText}. Please try again.`,
        }
        setPromptHelperMessages((prev) => [...prev, errorMessage])
        // Save error message to database
        await saveAiHelperMessage("assistant", errorMessage.content)
      }
    } catch (error) {
      console.error("Error generating suggestion:", error)
      const errorMessage = {
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again.",
      }
      setPromptHelperMessages((prev) => [...prev, errorMessage])
      // Save error message to database
      await saveAiHelperMessage("assistant", errorMessage.content)
    } finally {
      setIsPromptHelperLoading(false)
    }
  }

  const handleEditSuggestion = (
    index: number,
    suggestions: {
      prompt: string
      negativePrompt?: string
      cameraAngle: string
      cameraLens: string
      style: string
      aspectRatio?: string
    },
  ) => {
    if (suggestions) {
      setEditingSuggestionIndex(index)
      setEditedSuggestion({
        prompt: suggestions.prompt || "",
        negativePrompt: suggestions.negativePrompt || "",
        style: suggestions.style || "",
        aspectRatio: suggestions.aspectRatio || aspectRatio,
      })
    }
  }

  const handleSaveEditedSuggestion = () => {
    if (editingSuggestionIndex === null) return

    setPromptHelperMessages((prev) => {
      const updated = [...prev]
      const msg = updated[editingSuggestionIndex]
      if (msg.suggestions) {
        msg.suggestions = {
          ...msg.suggestions,
          prompt: editedSuggestion.prompt,
          negativePrompt: editedSuggestion.negativePrompt,
          style: editedSuggestion.style,
          aspectRatio: editedSuggestion.aspectRatio,
        }
      }
      // Save the updated message to the database
      saveAiHelperMessage(msg.role, msg.content, msg.suggestions)
      return updated
    })

    setEditingSuggestionIndex(null)
    setEditedSuggestion({
      prompt: "",
      negativePrompt: "",
      style: "",
      aspectRatio: "",
    })
  }

  const handleCancelEditSuggestion = () => {
    setEditingSuggestionIndex(null)
    setEditedSuggestion({
      prompt: "",
      negativePrompt: "",
      style: "",
      aspectRatio: "",
    })
  }

  const handleApplyAISuggestion = (suggestions: {
    prompt: string
    negativePrompt?: string
    cameraAngle: string
    cameraLens: string
    style: string
    aspectRatio?: string
  }) => {
    console.log("[v0] ============ APPLYING AI SUGGESTIONS ============")
    console.log("[v0] Full suggestions object:", suggestions)
    console.log("[v0] Current aspect ratio BEFORE:", aspectRatio)
    console.log("[v0] Current style BEFORE:", selectedStylePreset)
    console.log("[v0] Suggested aspect ratio:", suggestions.aspectRatio)
    console.log("[v0] Suggested style:", suggestions.style)

    // Apply prompt and negative prompt
    setManualPrompt(suggestions.prompt || "")
    setNegativePrompt(suggestions.negativePrompt || "")

    if (suggestions.style) {
      const suggestedStyle = suggestions.style.trim()
      console.log("[v0] Raw style suggestion:", suggestedStyle)

      // Check if the suggested style exists in the dropdown options
      const styleExists = styleOptions.find(
        opt => opt.value === suggestedStyle || opt.label === suggestedStyle
      )

      if (styleExists) {
        // Style exists in dropdown - apply it with force update
        console.log("[v0] Style found in dropdown:", styleExists.value)
        setSelectedStylePreset("")
        setTimeout(() => {
          setSelectedStylePreset(styleExists.value)
          setStyleAutoUpdated(true)
          setTimeout(() => setStyleAutoUpdated(false), 2000)
          console.log("[v0] Style applied:", styleExists.value)
        }, 50)
      } else {
        // Style doesn't exist in dropdown - add to prompt instead
        console.log("[v0] Style NOT in dropdown, adding to prompt:", suggestedStyle)
        const styleText = `${suggestedStyle} style`
        const currentPrompt = suggestions.prompt || ""

        // Check if style text is already in prompt
        if (!currentPrompt.toLowerCase().includes(suggestedStyle.toLowerCase())) {
          const enhancedPrompt = `${styleText}, ${currentPrompt}`
          setManualPrompt(enhancedPrompt)
          console.log("[v0] Enhanced prompt with style:", enhancedPrompt)
        }

        // Set to Realistic as default since suggested style doesn't exist
        setSelectedStylePreset("")
        setTimeout(() => {
          setSelectedStylePreset("Realistic")
          console.log("[v0] Style set to default: Realistic")
        }, 50)
      }
    }

    // Apply camera settings
    if (suggestions.cameraAngle && suggestions.cameraAngle !== "None") {
      setSelectedCameraAngle(suggestions.cameraAngle)
    }
    if (suggestions.cameraLens && suggestions.cameraLens !== "None") {
      setSelectedCameraLens(suggestions.cameraLens)
    }

    if (suggestions.aspectRatio) {
      const ratio = suggestions.aspectRatio
      console.log("[v0] Applying aspect ratio:", ratio)
      setAspectRatio("")
      setTimeout(() => {
        setAspectRatio(ratio)
        console.log("[v0] Aspect ratio applied:", ratio)
      }, 50)
    }

    console.log("[v0] ============ FINISHED APPLYING SUGGESTIONS ============")
  }

  const applyPromptSuggestions = (suggestions: {
    prompt: string
    negativePrompt?: string
    cameraAngle: string
    cameraLens: string
    style: string
    aspectRatio?: string
  }) => {
    if (suggestions.prompt && suggestions.prompt !== "None") {
      setManualPrompt(suggestions.prompt)
    }
    if (suggestions.cameraAngle && suggestions.cameraAngle !== "None") {
      setSelectedCameraAngle(suggestions.cameraAngle)
    }
    if (suggestions.cameraLens && suggestions.cameraLens !== "None") {
      setSelectedCameraLens(suggestions.cameraLens)
    }
    if (suggestions.style && suggestions.style !== "None") {
      setSelectedStylePreset(suggestions.style)
    }
    if (suggestions.aspectRatio) {
      setAspectRatio(suggestions.aspectRatio)
    }
  }

  const handleGenerateImage = async () => {
    console.log("[v0 CLIENT] === Starting image generation ===")

    const combinedAnalysis = getCombinedPrompt()
    let finalPrompt = ""

    if (manualPrompt.trim() && combinedAnalysis) {
      // If both manual prompt and analysis exist, combine them
      finalPrompt = `${combinedAnalysis}. ${manualPrompt.trim()}`
    } else if (manualPrompt.trim()) {
      // Only manual prompt
      finalPrompt = manualPrompt.trim()
    } else if (combinedAnalysis) {
      // Only analysis
      finalPrompt = combinedAnalysis
    } else {
      console.log("[v0 CLIENT] ERROR: No prompt available")
      alert("Please enter a prompt or upload and analyze images first")
      return
    }

    console.log("[v0 CLIENT] Final prompt:", finalPrompt)

    setIsGenerating(true)
    setGeneratedImages([])
    setGenerationError(null) // Reset error on new generation
    setShowHistory(false) // Close history when generating

    try {
      let enhancedPrompt = finalPrompt

      if (selectedStylePreset && selectedStylePreset !== "Realistic") {
        enhancedPrompt = `${enhancedPrompt}, in ${selectedStylePreset.toLowerCase()} style`
      }

      if (selectedCameraAngle) {
        enhancedPrompt = `${enhancedPrompt}, ${selectedCameraAngle.toLowerCase()}`
      }

      if (selectedCameraLens) {
        enhancedPrompt = `${enhancedPrompt}, shot with ${selectedCameraLens.toLowerCase()}`
      }

      if (styleStrength === "subtle") {
        enhancedPrompt = `With subtle, understated styling: ${enhancedPrompt}`
      } else if (styleStrength === "strong") {
        enhancedPrompt = `With bold, pronounced styling: ${enhancedPrompt}`
      }

      if (negativePrompt.trim()) {
        enhancedPrompt += `. Avoid: ${negativePrompt.trim()}`
      }

      console.log("[v0 CLIENT] Enhanced prompt:", enhancedPrompt)

      let referenceImageBase64 = null
      if (referenceImage) {
        console.log("[v0 CLIENT] Converting reference image to base64")
        const reader = new FileReader()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(referenceImage.file)
        })
        referenceImageBase64 = dataUrl.split(",")[1]
        console.log("[v0 CLIENT] Reference image converted, base64 length:", referenceImageBase64.length)
      }

      console.log("[v0 CLIENT] Making API request to /api/generate-image")
      console.log("[v0 CLIENT] Request body:", {
        prompt: enhancedPrompt,
        count: imageCount,
        aspectRatio: aspectRatio,
        hasReferenceImage: !!referenceImageBase64,
      })

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          count: imageCount,
          aspectRatio: aspectRatio,
          referenceImage: referenceImageBase64,
        }),
      })

      console.log("[v0 CLIENT] Response status:", response.status)
      console.log("[v0 CLIENT] Response ok:", response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("[v0 CLIENT] API error response:", errorData)
        let userMessage = errorData.error || `HTTP ${response.status}: Image generation failed`

        if (response.status === 429) {
          userMessage =
            "API quota exceeded. Please wait a few minutes before trying again. Check your Gemini API quota at https://aistudio.google.com/app/apikey"
        }

        throw new Error(userMessage)
      }

      const data = await response.json()
      console.log("[v0 CLIENT] API response data:", data)

      if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
        console.error("[v0 CLIENT] No images in response:", data)
        throw new Error("No images returned from API")
      }

      const imagesWithMetadata = data.images.map((imageUrl: string) => ({
        url: imageUrl,
        ratio: aspectRatio,
        style: selectedStylePreset || "Realistic",
        dimensions: undefined, // Will be loaded after image loads
      }))

      console.log("[v0 CLIENT] Successfully received", data.images.length, "images")
      setGeneratedImages(imagesWithMetadata)

      setShowImageGenerator(true)

      // FIX: saveToHistory now correctly passes generatedImages directly
      // Pass current prompt and settings to history
      saveToHistory(
        finalPrompt, // Use the base prompt before enhancements for history
        aspectRatio,
        imagesWithMetadata, // Pass full objects with metadata
      )
      console.log("[v0 CLIENT] === Image generation complete ===")
    } catch (error) {
      console.error("[v0 CLIENT] Image generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Image generation failed. Please try again."
      setGenerationError(errorMessage)
      alert(`Failed to generate image: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReusePrompt = (prompt: string, aspectRatio: string) => {
    setShowHistory(false)
    setManualPrompt(prompt)
    setAspectRatio(aspectRatio)
  }

  const handleHistoryImageClick = (images: string[], index: number) => {
    setGeneratedImages(
      images.map((url) => ({
        url,
        ratio: "Unknown",
        style: "Unknown",
        dimensions: undefined,
      })),
    )
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const styleOptions = [
    { value: "Realistic", label: "Realistic" },
    { value: "Cartoon Style", label: "Cartoon Style" },
    { value: "Pixar", label: "Pixar" },
    { value: "PhotoReal", label: "PhotoReal" },
    { value: "Anime", label: "Anime" },
    { value: "Oil Painting", label: "Oil Painting" },
    { value: "Watercolor", label: "Watercolor" },
    { value: "3D Render", label: "3D Render" },
    { value: "Sketch", label: "Sketch" },
    { value: "Comic Book", label: "Comic Book" },
    {
      value: "Studio Ghibli",
      label: "Studio Ghibli",
      description: "Hand-painted, pastoral nature, painterly backgrounds, warm palettes, cozy-to-epic scale",
    },
    {
      value: "Makoto Shinkai",
      label: "Makoto Shinkai",
      description: "Soft 3D realism, appealing shapes, expressive lighting, family-friendly palettes",
    },
    {
      value: "Disney Modern 3D",
      label: "Disney Modern 3D",
      description: "High-finish character animation, musical staging, glossy materials, broad appeal",
    },
    {
      value: "Sony Spider-Verse",
      label: "Sony Spider-Verse",
      description: "Mixed media/comic-book look: halftones, bold outlines, variable frame rates, graphic VFX",
    },
    {
      value: "Laika Stop-Motion",
      label: "Laika",
      description: "Tactile handcrafted textures, moody lighting, intricate miniature sets",
    },
    {
      value: "Cartoon Saloon",
      label: "Cartoon Saloon",
      description: "Storybook/flat decorative shapes, Celtic motifs, watercolor textures, strong graphic design",
    },
    {
      value: "Studio Trigger",
      label: "Studio Trigger",
      description: "Exaggerated silhouettes, neon palettes, explosive motion and stylization",
    },
    {
      value: "Ufotable",
      label: "Ufotable",
      description: "Hyper-polished compositing, VFX glow trails, dramatic contrast and camera work",
    },
    {
      value: "Kyoto Animation",
      label: "Kyoto Animation",
      description: "Polished slice-of-life realism, delicate lighting, glossy eyes, meticulous everyday detail",
    },
  ]

  const handleAiHelperImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload image files only")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 10MB`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setAiHelperImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = "" // Clear the input to allow uploading the same file again
  }

  const handleRemoveAiHelperImage = (index: number) => {
    setAiHelperImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Refactored this to use sendMessageToHelper for consistency
  const handlePromptHelperChat = async () => {
    if (!promptHelperInput.trim() && aiHelperImages.length === 0) {
      console.log("[v0] No input or images to process")
      return
    }
    if (isPromptHelperLoading) return

    const userInputText = promptHelperInput.trim() || "Help me create a prompt based on this reference image"

    // Use sendMessageToHelper to handle message sending and image analysis
    await sendMessageToHelper(userInputText)
  }

  const handleCopyPrompt = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copied to clipboard!`)
    } catch (error) {
      console.error("[v0] Copy failed:", error)
      alert("Failed to copy to clipboard")
    }
  }

  const fetchHistory = async () => {
    try {
      console.log("[v0] Fetching image generation history...")
      setIsLoadingHistory(true)
      
      const response = await fetch("/api/image-analysis/history")
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] History fetch failed:", errorData)
        throw new Error(errorData.error || "Failed to fetch history")
      }
      
      const data = await response.json()
      console.log("[v0] History loaded successfully:", {
        recordCount: data.history?.length || 0,
        hasData: !!data.history
      })
      
      setHistoryData(data.history || [])
    } catch (error) {
      console.error("[v0] Error fetching history:", error)
      setHistoryData([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const saveToHistory = async (prompt: string, aspectRatio: string, images: any[]) => {
    console.log("[v0 IMAGE GENERATION SAVE] Saving to image_analysis_history table:", {
      promptPreview: prompt.substring(0, 50),
      aspectRatio,
      imageCount: images.length,
    })
    console.log("[v0 IMAGE GENERATION SAVE] This is for GENERATED IMAGES, not AI chat")

    try {
      const response = await fetch("/api/image-analysis/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Changed column names to match backend structure
          subjectImageUrl: subjectImages.find(s => s.selected)?.preview, // Use selected subject preview
          sceneImageUrl: sceneImage?.preview,
          styleImageUrl: styleImage?.preview,
          subjectAnalysis: subjectAnalysis.text,
          sceneAnalysis: sceneAnalysis.text,
          styleAnalysis: styleAnalysis.text,
          main_prompt: prompt, // Changed from 'prompt' to 'main_prompt'
          negative_prompt: negativePrompt, // Changed from 'negativePrompt' to 'negative_prompt'
          aspect_ratio: aspectRatio, // Changed from 'aspectRatio' to 'aspect_ratio'
          selected_style: selectedStylePreset, // Changed from 'stylePreset' to 'selected_style'
          style_strength: styleStrength, // Changed from 'styleStrength' to 'style_strength'
          camera_angle: selectedCameraAngle, // Changed from 'cameraAngle' to 'camera_angle'
          camera_lens: selectedCameraLens, // Changed from 'cameraLens' to 'camera_lens'
          prompt_mode: promptMode, // Changed from 'promptMode' to 'prompt_mode'
          image_count: imageCount, // Changed from 'imageCount' to 'image_count'
          generated_images: images.map((img) => ({
            image_url: typeof img === "string" ? img : img.url, // Changed from 'url' to 'image_url'
            width: typeof img === "object" ? img.dimensions?.width : undefined,
            height: typeof img === "object" ? img.dimensions?.height : undefined,
            file_size_mb: typeof img === "object" ? img.fileSizeMB : undefined, // Changed from 'fileSizeMB' to 'file_size_mb'
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0 IMAGE GENERATION SAVE] Failed:", errorData)
        throw new Error(errorData.details || errorData.error)
      }

      const result = await response.json()
      console.log("[v0 IMAGE GENERATION SAVE] Success - saved to image_analysis_history table")

      // Refresh history list
      fetchHistory()
      // Also refresh AI Helper history if it's visible
      if (historyTab === "ai-helper") {
        loadAiHelperHistory()
      }
      setHistoryRefreshTrigger(prev => prev + 1)
      
    } catch (error) {
      console.error("[v0] Error in saveToHistory:", error)
      alert(`Warning: Failed to save to history: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* <input ref={subjectInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "subject")} /> */}
      <input
        ref={subjectInputRef}
        type="file"
        accept="image/*"
        multiple // Allow multiple files
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : []
          files.forEach(file => handleFileUpload(file, "subject"))
          e.target.value = "" // Clear the input
        }}
      />
      <input
        ref={sceneInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "scene")}
      />
      <input
        ref={styleInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "style")}
      />
      <input
        ref={referenceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleReferenceImageUpload(e.target.files[0])}
      />

      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <img src="/logo.png" alt="PromptsGenie Logo" className="h-10 w-auto" />
            <p className="text-xs text-zinc-400 mt-1">AI-Powered Creative Tools</p>
          </div>

          <nav className="flex items-center gap-2">
            <Link href="/">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-black font-medium relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                }}
              >
                <Home className="w-4 h-4 relative z-10 text-black" />
                <span className="text-sm relative z-10">Home</span>
              </button>
            </Link>

            <Link href="/image-analyzer">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-black font-medium relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                }}
              >
                <ImageIcon className="w-4 h-4 relative z-10 text-black" />
                <span className="text-sm relative z-10">Image Analyzer</span>
              </button>
            </Link>

            <Link href="/storyboard">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-black font-medium relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                }}
              >
                <Film className="w-4 h-4 relative z-10 text-black" />
                <span className="text-sm relative z-10">Storyboard Creator</span>
              </button>
            </Link>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-black font-medium relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
              }}
            >
              <span className="text-sm relative z-10">Coming Soon</span>
            </button>
          </nav>

          <div className="w-[180px]"></div>
        </div>
      </header>

      <main className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              onClick={() => handlePromptModeChange("fast")}
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                promptMode === "fast" ? "text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              style={
                promptMode === "fast"
                  ? {
                      background: GOLD_GRADIENT,
                    }
                  : {}
              }
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Fast</span>
            </Button>
            <Button
              onClick={() => handlePromptModeChange("quality")}
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                promptMode === "quality" ? "text-black" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              style={
                promptMode === "quality"
                  ? {
                      background: GOLD_GRADIENT,
                    }
                  : {}
              }
            >
              <Sparkle className="w-4 h-4" />
              <span className="text-sm font-medium">Quality</span>
            </Button>
            <div className="ml-2 flex items-center text-xs text-zinc-500">
              {promptMode === "fast" ? "⚡ Quick analysis" : "✨ Detailed analysis"}
            </div>
          </div>

          <Button
            onClick={handleResetHeights}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Reset Card Sizes</span>
          </Button>
        </div>

        <div
          className={`grid ${showUploadImages ? "grid-cols-[280px_1fr]" : "grid-cols-[80px_1fr]"} gap-6 transition-all duration-300`}
        >
          {/* Left column: Upload panel */}
          <div className="flex flex-col gap-6">
            <div className={`bg-[#c99850] rounded-lg transition-all duration-300 ${showUploadImages ? "p-3" : "p-3"}`}>
              {showUploadImages ? (
                <>
                  {/* Expanded view - full upload areas */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-black">Upload Images</h2>
                    <button
                      onClick={() => setShowUploadImages(false)}
                      className="p-1 hover:bg-black/10 rounded transition-colors"
                      aria-label="Collapse upload section"
                    >
                      <ChevronRight className="w-5 h-5 text-black" />
                    </button>
                  </div>

                  <div className="max-h-[700px] overflow-y-auto scrollbar-hide overscroll-contain touch-pan-y">
                    <div className="flex flex-col gap-4">
                      {/* SUBJECT Cards Section */}
                      <div className="w-full px-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold tracking-wider text-black">SUBJECT</span>
                          <label className="cursor-pointer w-7 h-7 rounded-full bg-black text-yellow-400 flex items-center justify-center text-lg font-bold hover:bg-gray-800 transition">
                            +
                            <input
                              type="file"
                              accept="image/*"
                              multiple // Allow multiple files
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files ? Array.from(e.target.files) : []
                                files.forEach(file => handleFileUpload(file, "subject"))
                                e.target.value = "" // Clear the input
                              }}
                            />
                          </label>
                        </div>

                        {subjectImages.map((subject) => (
                          <div
                            key={subject.id}
                            className={`relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                              subject.selected ? 'border-yellow-400' : 'border-transparent'
                            }`}
                            onClick={() => handleClick("subject", subject.id)}
                          >
                            {/* Hidden file input for replacing an image */}
                            <input
                              type="file"
                              ref={(el) => {
                                // Assign ref if this is the selected subject, to allow programmatic click
                                if (subject.selected && el) {
                                  subjectInputRef.current = el
                                }
                              }}
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUpload(e, "subject", subject.id)}
                            />
                            <img
                              src={subject.preview || "/placeholder.svg"}
                              alt="Subject"
                              className={`w-full h-full object-cover ${
                                animatingImages.subject ? "animate-rotate-upload" : ""
                              }`}
                            />

                            <div
                              className="absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer hover:scale-110"
                              style={{
                                backgroundColor: subject.selected ? "#ffd600" : "rgba(0,0,0,0.5)",
                                color: subject.selected ? "#000" : "#fff",
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectSubject(subject.id)
                              }}
                            >
                              {subject.selected && "✓"}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveImage("subject", subject.id)
                              }}
                              className="absolute bottom-2 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                              aria-label="Remove subject image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {subjectImages.length === 0 && (
                          <label
                            className={`w-full aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
                              isDragging.subject ? "border-yellow-400 bg-yellow-50" : "border-black/20 bg-[#e8d4b8]"
                            }`}
                            onDrop={(e) => handleDrop(e, "subject")}
                            onDragOver={handleDragOver}
                            onDragEnter={() => setIsDragging((prev) => ({ ...prev, subject: true }))}
                            onDragLeave={(e) => handleDragLeave(e, "subject")}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              multiple // Allow multiple files
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files ? Array.from(e.target.files) : []
                                files.forEach(file => handleFileUpload(file, "subject"))
                                e.target.value = "" // Clear the input
                              }}
                            />
                            <Upload className="w-6 h-6 text-black/50 mb-2" />
                            <h4 className="text-sm font-bold text-black mb-1">Upload Subject</h4>
                            <p className="text-xs text-black/70">Drag or click • Max 10MB</p>
                          </label>
                        )}
                      </div>

                      {/* SCENE Card */}
                      <div className="w-full px-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" style={{ color: "#c99850" }} />
                            <h3 className="text-sm font-bold text-black">SCENE</h3>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-black/20" />
                            <div className="w-2 h-2 rounded-full bg-black/20" />
                          </div>
                        </div>
                        <div
                          className={`aspect-square border-2 border-dashed rounded-lg p-4 flex items-center justify-center transition-all ${
                            isDragging.scene ? "border-yellow-400 bg-yellow-50" : "border-black/40 bg-[#c99850]"
                          } hover:bg-[#d4a85f] cursor-pointer`}
                          onDragOver={(e) => handleDragOver(e, "scene")}
                          onDragLeave={(e) => handleDragLeave(e, "scene")}
                          onDrop={(e) => handleDrop(e, "scene")}
                          onClick={() => handleClick("scene")}
                        >
                          <div className="flex flex-col items-center justify-center text-center w-full">
                            {sceneImage ? (
                              <>
                                <div className="relative w-full">
                                  <img
                                    src={sceneImage.preview || "/placeholder.svg"}
                                    alt="Scene"
                                    className={`w-full h-full object-cover rounded mb-2 aspect-square ${
                                      animatingImages.scene ? "animate-rotate-upload" : ""
                                    }`}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveImage("scene")
                                    }}
                                    className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                                    aria-label="Remove scene image"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-xs text-black/70 mt-2">Click to replace</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-black/50 mb-2" />
                                <h4 className="text-sm font-bold text-black mb-1">Upload Scene</h4>
                                <p className="text-xs text-black/70 mb-1">Drag or click</p>
                                <p className="text-xs text-black/60">Max 10MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* STYLE Card */}
                      <div className="w-full px-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4" style={{ color: "#c99850" }} />
                            <h3 className="text-sm font-bold text-black">STYLE</h3>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-black/20" />
                            <div className="w-2 h-2 rounded-full bg-black/20" />
                          </div>
                        </div>
                        <div
                          className={`aspect-square border-2 border-dashed rounded-lg p-4 flex items-center justify-center transition-all ${
                            isDragging.style ? "border-yellow-400 bg-yellow-50" : "border-black/40 bg-[#c99850]"
                          } hover:bg-[#d4a85f] cursor-pointer`}
                          onDragOver={(e) => handleDragOver(e, "style")}
                          onDragLeave={(e) => handleDragLeave(e, "style")}
                          onDrop={(e) => handleDrop(e, "style")}
                          onClick={() => handleClick("style")}
                        >
                          <div className="flex flex-col items-center justify-center text-center w-full">
                            {styleImage ? (
                              <>
                                <div className="relative w-full">
                                  <img
                                    src={styleImage.preview || "/placeholder.svg"}
                                    alt="Style"
                                    className={`w-full h-full object-cover rounded mb-2 aspect-square ${
                                      animatingImages.style ? "animate-rotate-upload" : ""
                                    }`}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveImage("style")
                                    }}
                                    className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                                    aria-label="Remove style image"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-xs text-black/70 mt-2">Click to replace</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-black/50 mb-2" />
                                <h4 className="text-sm font-bold text-black mb-1">Upload Style</h4>
                                <p className="text-xs text-black/70 mb-1">Drag or click</p>
                                <p className="text-xs text-black/60">Max 10MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Collapsed view - icon sidebar */}
                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={() => setShowUploadImages(true)}
                      className="p-2 hover:bg-black/10 rounded transition-colors w-full flex justify-center"
                      aria-label="Expand upload section"
                    >
                      <ChevronLeft className="w-5 h-5 text-black" />
                    </button>

                    {/* Subject icons - Render one for each subject uploaded */}
                    {subjectImages.map((subject, index) => (
                      <button
                        key={subject.id}
                        onClick={() => {
                          setShowUploadImages(true)
                          setTimeout(() => handleClick("subject", subject.id), 100)
                        }}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all relative ${
                          subject.selected
                            ? 'border-2 border-yellow-400 bg-yellow-500'
                            : 'border-2 border-dashed border-black/40 bg-[#c99850] hover:bg-[#d4a85f]'
                        }`}
                        aria-label={`Select subject image ${index + 1}`}
                      >
                        {subject.selected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-black">✓</div>
                        )}
                        <User className="w-6 h-6" style={{ color: subject.selected ? "#000" : "#000" }} />
                      </button>
                    ))}

                    {/* Scene icon */}
                    <button
                      onClick={() => {
                        setShowUploadImages(true)
                        setTimeout(() => handleClick("scene"), 100)
                      }}
                      className="w-12 h-12 border-2 border-dashed border-black/40 rounded-lg bg-[#c99850] hover:bg-[#d4a85f] transition-colors flex items-center justify-center"
                      aria-label="Upload scene"
                    >
                      <ImageIcon className="w-6 h-6" style={{ color: "#c99850" }} />
                    </button>

                    {/* Style icon */}
                    <button
                      onClick={() => {
                        setShowUploadImages(true)
                        setTimeout(() => handleClick("style"), 100)
                      }}
                      className="w-12 h-12 border-2 border-dashed border-black/40 rounded-lg bg-[#c99850] hover:bg-[#d4a85f] transition-colors flex items-center justify-center"
                      aria-label="Upload style"
                    >
                      <Palette className="w-6 h-6" style={{ color: "#c99850" }} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right column: Analysis cards + Image Generator */}
          <div className="flex flex-col gap-6">
            <div className="bg-zinc-900 rounded-lg p-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowAnalysisCards(!showAnalysisCards)}
                      className="w-full flex items-center justify-between mb-4 hover:bg-zinc-800 rounded-lg p-2 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white">Analysis Cards</h2>
                        <span className="text-xs text-zinc-400">
                          ({subjectAnalysis.text || sceneAnalysis.text || styleAnalysis.text ? "Active" : "Empty"})
                        </span>
                      </div>
                      <ChevronUp
                        className={`w-5 h-5 text-zinc-400 transition-transform ${
                          showAnalysisCards ? "rotate-0" : "rotate-180"
                        }`}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to {showAnalysisCards ? "collapse" : "expand"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {showAnalysisCards && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-[#c99850] text-center mb-2 uppercase tracking-wide">
                        Subject Analysis
                      </h3>
                      {renderCard("subject")}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#c99850] text-center mb-2 uppercase tracking-wide">
                        Scene Analysis
                      </h3>
                      {renderCard("scene")}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#c99850] text-center mb-2 uppercase tracking-wide">
                        Style Analysis
                      </h3>
                      {renderCard("style")}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#c99850] text-center mb-2 uppercase tracking-wide">
                        Combined Prompt
                      </h3>
                      {renderCard("combined")}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900 rounded-lg p-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowImageGenerator(!showImageGenerator)}
                      className="w-full flex items-center justify-between mb-4 hover:bg-zinc-800 rounded-lg p-2 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white">Image Generator</h2>
                        <span className="text-xs text-zinc-400">
                          ({generatedImages.length > 0 ? `${generatedImages.length} generated` : "Ready"})
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPromptHelper(!showPromptHelper)
                          }}
                          className="ml-2 px-3 py-1 bg-[#c99850] hover:bg-[#d4a85f] text-black font-medium text-xs rounded transition-colors"
                        >
                          ✨ AI Helper
                        </button>
                        <span className="text-xs text-zinc-400">(Is an Expert in Your Prompting & Settings)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (
                              confirm(
                                "Clear all AI Helper messages? This will remove all chat history.",
                              )
                            ) {
                              clearAiHelperHistory() // Use backend clear
                            }
                          }}
                          className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors"
                          title="Clear AI Helper chat history"
                        >
                          Clear All
                        </button>
                        <ChevronUp
                          className={`w-5 h-5 text-zinc-400 transition-transform ${
                            showImageGenerator ? "rotate-0" : "rotate-180"
                          }`}
                        />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to {showImageGenerator ? "collapse" : "expand"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {showImageGenerator && (
                <>
                  <div className="bg-black rounded-lg border border-[#c99850]/20 mb-4">
                    {/* Collapsible header */}
                    <button
                      onClick={() => setShowGeneratorControls(!showGeneratorControls)}
                      className="w-full flex items-center justify-between p-3 hover:bg-zinc-800 transition-colors rounded-t-lg"
                    >
                      <span className="text-xs font-bold text-[#c99850]">Generator Controls</span>
                      <ChevronUp
                        className={`w-4 h-4 text-[#c99850] transition-transform ${
                          showGeneratorControls ? "rotate-0" : "rotate-180"
                        }`}
                      />
                    </button>

                    {/* Controls content */}
                    {showGeneratorControls && (
                      <div className="p-4 pt-0">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 relative" ref={styleDropdownRef}>
                            <label className="text-xs font-medium text-[#c99850] mb-1.5 block">Style:</label>
                            <button
                              onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                              className={`w-full px-3 py-2 rounded-lg text-sm bg-zinc-800 text-[#c99850] border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/30 flex items-center justify-between hover:bg-zinc-700 transition-colors ${
                                styleAutoUpdated ? "animate-pulse ring-2 ring-[#c99850]" : ""
                              }`}
                            >
                              <span>{selectedStylePreset}</span>
                              <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Custom dropdown menu with grid */}
                            {showStyleDropdown && (
                              <div className="absolute z-50 mt-1 w-[800px] bg-zinc-900 border border-[#c99850]/30 rounded-lg shadow-lg max-h-[500px] overflow-y-auto">
                                <div className="grid grid-cols-4 gap-2 p-3">
                                  {styleOptions.map((option) => {
                                    const tooltipStyles = {
                                      Realistic: {
                                        image: "photorealistic-character-portrait-lifelike-details",
                                        query: "photorealistic portrait character",
                                      },
                                      "Cartoon Style": {
                                        image: "cartoon-style-character-simple-shapes-bold-lines",
                                        query: "cartoon style character simple shapes bold outlines",
                                      },
                                      Pixar: {
                                        image: "pixar-3d-character-expressive-appealing",
                                        query: "Pixar 3D animated character expressive appealing",
                                      },
                                      PhotoReal: {
                                        image: "photorealistic-character-high-detail-texture",
                                        query: "photorealistic character high detail textures",
                                      },
                                      Anime: {
                                        image: "anime-character-big-eyes-colorful-hair",
                                        query: "anime character big eyes colorful hair",
                                      },
                                      "Oil Painting": {
                                        image: "oil-painting-character-brushstrokes-texture",
                                        query: "oil painting character visible brushstrokes",
                                      },
                                      Watercolor: {
                                        image: "watercolor-character-soft-edges-blending",
                                        query: "watercolor painting character soft edges",
                                      },
                                      "3D Render": {
                                        image: "3d-rendered-character-smooth-materials",
                                        query: "3D rendered character smooth materials",
                                      },
                                      Sketch: {
                                        image: "pencil-sketch-character-line-art",
                                        query: "pencil sketch character line art",
                                      },
                                      "Comic Book": {
                                        image: "comic-book-character-ink-halftones",
                                        query: "comic book character ink lines halftones",
                                      },
                                      "Studio Ghibli": {
                                        image: "studio-ghibli-anime-character-girl-with-flowing-ha",
                                        query: "Studio Ghibli anime character girl",
                                      },
                                      "Makoto Shinkai": {
                                        image: "makoto-shinkai-anime-character-soft-lighting",
                                        query: "Makoto Shinkai anime character soft lighting",
                                      },
                                      "Disney Modern 3D": {
                                        image: "disney-3d-animated-character-glossy-materials",
                                        query: "Disney 3D animated character",
                                      },
                                      "Sony Spider-Verse": {
                                        image: "spider-verse-comic-style-character-halftones",
                                        query: "Spider-Verse comic book character halftones",
                                      },
                                      "Laika Stop-Motion": {
                                        image: "laika-stop-motion-character-tactile-texture",
                                        query: "Laika stop-motion puppet character",
                                      },
                                      "Cartoon Saloon": {
                                        image: "cartoon-saloon-storybook-character-flat-shapes",
                                        query: "Cartoon Saloon storybook character",
                                      },
                                      "Studio Trigger": {
                                        image: "studio-trigger-anime-character-neon-colors",
                                        query: "Studio Trigger anime character neon",
                                      },
                                      Ufotable: {
                                        image: "ufotable-anime-character-vfx-glow-effects",
                                        query: "Ufotable anime character VFX glow",
                                      },
                                      "Kyoto Animation": {
                                        image: "kyoani-anime-character-glossy-eyes-detailed",
                                        query: "Kyoto Animation character glossy eyes",
                                      },
                                    }

                                    return (
                                      <TooltipProvider key={option.value}>
                                        <Tooltip delayDuration={200}>
                                          <TooltipTrigger asChild>
                                            <button
                                              onClick={() => {
                                                setSelectedStylePreset(option.value)
                                                setShowStyleDropdown(false)
                                              }}
                                              className={`p-2 rounded-lg text-xs text-left transition-colors border ${
                                                selectedStylePreset === option.value
                                                  ? "bg-[#c99850] text-black border-[#c99850]"
                                                  : "bg-zinc-800 text-[#c99850] hover:bg-zinc-700 border-[#c99850]/20"
                                              }`}
                                            >
                                              <div className="font-bold mb-0.5">{option.label}</div>
                                              {option.description && (
                                                <div className="text-[9px] opacity-70 line-clamp-2">
                                                  {option.description}
                                                </div>
                                              )}
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent
                                            side="right"
                                            className="p-2 bg-zinc-900 border border-[#c99850]/30 max-w-[140px]"
                                          >
                                            <div className="flex flex-col gap-2">
                                              <img
                                                src={`/${tooltipStyles[option.value].image}.jpg`}
                                                alt={`${option.label} style preview`}
                                                className="w-[120px] h-[90px] object-cover rounded"
                                              />
                                              <div className="text-xs text-[#c99850] font-bold">{option.label}</div>
                                              {option.description && (
                                                <div className="text-[10px] text-[#c99850]/70 whitespace-normal break-words">
                                                  {option.description}
                                                </div>
                                              )}
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-xs font-medium text-[#c99850] mb-1.5 block">Aspect ratio:</label>
                            <select
                              value={aspectRatio}
                              onChange={(e) => setAspectRatio(e.target.value)}
                              className="w-32 px-3 py-2 rounded-lg text-sm bg-zinc-800 text-[#c99850] border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/30 cursor-pointer [&>option]:bg-zinc-800 [&>option]:text-[#c99850]"
                            >
                              <option value="1:1">1:1</option>
                              <option value="16:9">16:9</option>
                              <option value="9:16">9:16</option>
                              <option value="4:3">4:3</option>
                              <option value="3:4">3:4</option>
                              <option value="3:2">3:2</option>
                              <option value="2:3">2:3</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-[#c99850] mb-1.5 block">Images:</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setImageCount(1)}
                                className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                                  imageCount === 1
                                    ? "bg-[#c99850] text-black"
                                    : "bg-zinc-800 text-[#c99850] hover:bg-zinc-700 border border-[#c99850]/30"
                                }`}
                              >
                                1
                              </button>
                              <button
                                onClick={() => setImageCount(2)}
                                className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                                  imageCount === 2
                                    ? "bg-[#c99850] text-black"
                                    : "bg-zinc-800 text-[#c99850] hover:bg-zinc-700 border border-[#c99850]/30"
                                }`}
                              >
                                2
                              </button>
                            </div>
                          </div>

                          <div className="flex items-end gap-2 mt-auto">
                            <Button
                              onClick={handleResetHeights}
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span className="text-sm">Reset Card Sizes</span>
                            </Button>

                            <Button
                              onClick={() => setShowHistory(!showHistory)}
                              variant="ghost"
                              size="sm"
                              className={`h-10 px-4 text-sm font-medium transition-colors ${
                                showHistory
                                  ? "bg-[#c99850] text-black hover:bg-[#d4a85f]"
                                  : "bg-zinc-800 text-[#c99850] hover:bg-zinc-700 border border-[#c99850]/30"
                              }`}
                            >
                              History
                            </Button>

                            <Button
                              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                              variant="ghost"
                              size="sm"
                              className="h-10 px-4 text-sm font-medium bg-zinc-800 text-[#c99850] hover:bg-zinc-700 border border-[#c99850]/30"
                            >
                              {showAdvancedControls ? "Hide Advanced" : "Show Advanced"}
                            </Button>

                            <Button
                              onClick={handleGenerateImage}
                              disabled={isGenerating || (!manualPrompt.trim() && !getCombinedPrompt())}
                              className="h-10 px-6 text-sm font-bold bg-[#c99850] text-black hover:bg-[#d4a85f] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  Generate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Main Prompt and Negative Prompt textareas */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Main Prompt */}
                          <div>
                            <label className="text-xs font-bold text-[#c99850] mb-2 block">
                              Main Prompt (type here or use combined analysis from images)
                            </label>
                            <textarea
                              value={manualPrompt}
                              onChange={(e) => setManualPrompt(e.target.value)}
                              placeholder="Describe the image you want to generate... or leave empty to use the combined analysis from uploaded images"
                              className="w-full h-24 px-4 py-3 rounded-lg text-sm bg-zinc-800 text-white placeholder:text-[#c99850]/50 border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/30 resize-none"
                            />
                          </div>

                          {/* Negative Prompt */}
                          <div>
                            <label className="text-xs font-bold text-[#c99850] mb-2 block">
                              Negative Prompt (exclude unwanted elements)
                            </label>
                            <textarea
                              value={negativePrompt}
                              onChange={(e) => setNegativePrompt(e.target.value)}
                              placeholder="e.g. blurry, low quality, distorted"
                              className="w-full h-24 px-4 py-3 rounded-lg text-sm bg-zinc-800 text-white placeholder:text-[#c99850]/50 border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/30 resize-none"
                            />
                          </div>
                        </div>

                        {showAdvancedControls && (
                          <div className="bg-zinc-800 rounded-lg p-3 mt-4 border border-[#c99850]/20">
                            <div className="grid grid-cols-3 gap-3">
                              {/* Camera Angle */}
                              <div>
                                <label className="text-[10px] font-medium text-[#c99850] mb-1 block">
                                  Camera Angle (optional)
                                </label>
                                <select
                                  value={selectedCameraAngle}
                                  onChange={(e) => setSelectedCameraAngle(e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg text-[10px] bg-zinc-800 text-[#c99850] border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/30 cursor-pointer [&>option]:bg-zinc-800 [&>option]:text-[#c99850]"
                                >
                                  <option value="">None</option>
                                  <option value="Eye-level shot">Eye-level shot</option>
                                  <option value="Low-angle shot">Low-angle shot</option>
                                  <option value="High-angle shot">High-angle shot</option>
                                  <option value="Aerial view">Aerial view</option>
                                  <option value="Dutch angle">Dutch angle</option>
                                  <option value="Over-the-shoulder shot">Over-the-shoulder shot</option>
                                  <option value="Point-of-view shot">Point-of-view shot</option>
                                  <option value="Bird's-eye view">Bird's-eye view</option>
                                  <option value="Worm's-eye view">Worm's-eye view</option>
                                </select>
                                <p className="text-[8px] text-[#c99850]/60 mt-1">
                                  Controls the camera perspective and composition
                                </p>
                              </div>

                              {/* Camera Lens */}
                              <div>
                                <label className="text-[10px] font-medium text-[#c99850] mb-1 block">
                                  Camera Lens (optional)
                                </label>
                                <select
                                  value={selectedCameraLens}
                                  onChange={(e) => setSelectedCameraLens(e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg text-[10px] bg-zinc-800 text-[#c99850] border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/30 cursor-pointer [&>option]:bg-zinc-800 [&>option]:text-[#c99850]"
                                >
                                  <option value="">None</option>
                                  <option value="14mm ultra-wide">14mm ultra-wide</option>
                                  <option value="16mm fisheye">16mm fisheye</option>
                                  <option value="24mm wide-angle">24mm wide-angle</option>
                                  <option value="35mm standard">35mm standard</option>
                                  <option value="50mm prime">50mm prime</option>
                                  <option value="85mm portrait">85mm portrait</option>
                                  <option value="135mm telephoto">135mm telephoto</option>
                                  <option value="200mm super-telephoto">200mm super-telephoto</option>
                                  <option value="Macro lens">Macro lens</option>
                                </select>
                                <p className="text-[8px] text-[#c99850]/60 mt-1">
                                  Influences depth of field and focal characteristics
                                </p>
                              </div>

                              {/* Style Strength */}
                              <div>
                                <label className="text-[10px] font-medium text-[#c99850] mb-1 block">
                                  Style Strength
                                </label>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setStyleStrength("subtle")}
                                    className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors border ${
                                      styleStrength === "subtle"
                                        ? "bg-[#c99850] text-black border-[#c99850]"
                                        : "bg-zinc-800 text-[#c99850] hover:bg-zinc-700 border-[#c99850]/30"
                                    }`}
                                  >
                                    Subtle
                                  </button>
                                  <button
                                    onClick={() => setStyleStrength("moderate")}
                                    className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors border ${
                                      styleStrength === "moderate"
                                        ? "bg-[#c99850] text-black border-[#c99850]"
                                        : "bg-zinc-800 text-[#c99850] hover:bg-zinc-700 border-[#c99850]/30"
                                    }`}
                                  >
                                    Moderate
                                  </button>
                                  <button
                                    onClick={() => setStyleStrength("strong")}
                                    className={`flex-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors border ${
                                      styleStrength === "strong"
                                        ? "bg-[#c99850] text-black border-[#c99850]"
                                        : "bg-zinc-800 text-[#c99850] hover:bg-zinc-700 border-[#c99850]/30"
                                    }`}
                                  >
                                    Strong
                                  </button>
                                </div>
                                <p className="text-[8px] text-[#c99850]/60 mt-1">
                                  Controls how strongly the style is applied to the generated image
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-zinc-800 rounded-lg p-3 mt-4 border border-[#c99850]/20">
                          <label className="text-xs font-bold text-[#c99850] mb-2 block">
                            Reference Image (optional - for image-to-image generation)
                          </label>
                          {referenceImage ? (
                            <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-2 border border-[#c99850]/20">
                              <img
                                src={referenceImage.preview || "/placeholder.svg"}
                                alt="Reference"
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="text-[10px] text-[#c99850] font-medium">{referenceImage.file.name}</p>
                                <p className="text-[8px] text-[#c99850]/60">
                                  {(referenceImage.file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                              <Button
                                onClick={handleRemoveReferenceImage}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] bg-[#c99850]/10 hover:bg-[#c99850]/20 text-[#c99850]"
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => referenceInputRef.current?.click()}
                              className="w-full border-2 border-dashed border-[#c99850]/30 rounded-lg p-3 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                            >
                              <Upload className="w-4 h-4 text-[#c99850]/60 mx-auto mb-1" />
                              <p className="text-[10px] text-[#c99850]/70">Click to upload reference image</p>
                              <p className="text-[8px] text-[#c99850]/60">JPEG, PNG, WebP (max 10MB)</p>
                            </button>
                          )}
                        </div>

                        {/* Note about reproducibility */}
                        <div className="bg-zinc-800 rounded p-2 border border-[#c99850]/20">
                          <p className="text-[8px] text-[#c99850]/70">
                            <strong>Note:</strong> Gemini API doesn't support seed control for reproducible results. To
                            get similar images, reuse the same prompt and reference image.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {showHistory ? (
                    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setHistoryTab("images")}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              historyTab === "images"
                                ? "bg-[#c99850] text-black"
                                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                            }`}
                          >
                            Image Generation
                          </button>
                          <button
                            onClick={() => {
                              setHistoryTab("ai-helper")
                              loadAiHelperHistory()
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                              historyTab === "ai-helper"
                                ? "bg-[#c99850] text-black"
                                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                            }`}
                          >
                            AI Helper Chats
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (historyTab === "images") {
                              fetchHistory()
                            } else {
                              loadAiHelperHistory()
                            }
                          }}
                          className="px-3 py-1 text-sm bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
                        >
                          Refresh
                        </button>
                      </div>

                      {historyTab === "images" ? (
                        // Image Generation History Tab
                        <>
                          <h3 className="text-lg font-semibold text-foreground">Generation History</h3>

                          {isLoadingHistory ? (
                            <div className="text-center py-8 text-muted-foreground">Loading history...</div>
                          ) : historyData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              No generation history yet. Start by generating some images!
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {historyData.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="border border-border rounded-lg p-4 bg-card hover:bg-card/80 transition-colors"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(item.created_at).toLocaleString()}
                                    </div>
                                    <button
                                      onClick={() => deleteImageHistory(item.id)}
                                      className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded"
                                      title="Delete this entry"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="font-medium mb-2 text-foreground">{item.main_prompt}</div>
                                  <div className="flex gap-2 flex-wrap mb-3">
                                    <span className="px-2 py-1 text-xs bg-primary/20 rounded">{item.aspect_ratio}</span>
                                    <span className="px-2 py-1 text-xs bg-primary/20 rounded">
                                      {item.selected_style}
                                    </span>
                                  </div>
                                  {item.generated_images && item.generated_images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                      {item.generated_images
                                        .filter((img: any) => img.image_url)
                                        .map((img: any) => (
                                          <img
                                            key={img.id}
                                            src={img.image_url || "/placeholder.svg"}
                                            alt="Generated"
                                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => {
                                              setGeneratedImages(
                                                item.generated_images.map((gi: any) => ({
                                                  url: gi.image_url,
                                                  ratio: gi.aspect_ratio,
                                                  style: gi.style,
                                                  dimensions:
                                                    gi.width && gi.height
                                                      ? { width: gi.width, height: gi.height }
                                                      : undefined,
                                                  fileSizeMB: gi.file_size_mb,
                                                })),
                                              )
                                              setLightboxIndex(item.generated_images.indexOf(img))
                                              setLightboxOpen(true)
                                            }}
                                          />
                                        ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        // AI Helper Chat History Tab
                        <>
                          <h3 className="text-lg font-semibold text-foreground">AI Helper Chat History</h3>

                          {isLoadingAiHelperHistory ? (
                            <div className="text-center py-8 text-muted-foreground">Loading chat history...</div>
                          ) : aiHelperHistoryData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              No chat history yet. Start a conversation with the AI Helper!
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {Object.entries(
                                aiHelperHistoryData.reduce((acc: any, msg: any) => {
                                  if (!acc[msg.session_id]) {
                                    acc[msg.session_id] = []
                                  }
                                  acc[msg.session_id].push(msg)
                                  return acc
                                }, {}),
                              ).map(([sessionId, messages]: [string, any]) => {
                                const sessionMessages = messages as any[]
                                // Find the first user message with content
                                const firstUserMessage = sessionMessages.find(
                                  (msg: any) => msg.role === "user" && msg.content && msg.content.trim(),
                                )
                                const userPrompt = firstUserMessage?.content || "Conversation"
                                const userImages = firstUserMessage?.images || []
                                const assistantMessage = sessionMessages.find((msg: any) => msg.role === "assistant")
                                const suggestions = assistantMessage?.suggestions

                                return (
                                  <div
                                    key={sessionId}
                                    className="border border-border rounded-lg p-4 bg-card hover:bg-card/80 transition-colors"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="text-sm text-muted-foreground">
                                        {new Date(sessionMessages[0].created_at).toLocaleString()}
                                      </div>
                                      <button
                                        onClick={() => deleteAiHelperSession(sessionId)}
                                        className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded"
                                        title="Delete this chat session"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* User's prompt - matching Image Generation History */}
                                    <div className="font-medium mb-2 text-foreground">{userPrompt}</div>

                                    {/* Metadata tags - matching Image Generation History */}
                                    <div className="flex gap-2 flex-wrap mb-3">
                                      {suggestions?.style && (
                                        <span className="px-2 py-1 text-xs bg-primary/20 rounded">
                                          {suggestions.style}
                                        </span>
                                      )}
                                      {suggestions?.aspectRatio && (
                                        <span className="px-2 py-1 text-xs bg-primary/20 rounded">
                                          {suggestions.aspectRatio}
                                        </span>
                                      )}
                                      {userImages.length > 0 && (
                                        <span className="px-2 py-1 text-xs bg-primary/20 rounded flex items-center gap-1">
                                          <ImageIcon className="w-3 h-3" />
                                          {userImages.length} image{userImages.length !== 1 ? "s" : ""}
                                        </span>
                                      )}
                                    </div>

                                    {/* User uploaded images - matching Image Generation History grid */}
                                    {userImages.length > 0 && (
                                      <div className="grid grid-cols-2 gap-2 mb-3">
                                        {userImages.map((imgUrl: string, imgIdx: number) => (
                                          <img
                                            key={imgUrl}
                                            src={imgUrl || "/placeholder.svg"}
                                            alt={`Uploaded ${imgIdx + 1}`}
                                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => {
                                              // Convert AI helper images to the format expected by the lightbox
                                              setGeneratedImages(
                                                userImages.map((url: string) => ({
                                                  url,
                                                  ratio: suggestions?.aspectRatio || "Unknown",
                                                  style: suggestions?.style || "Unknown",
                                                })),
                                              )
                                              setLightboxIndex(imgIdx)
                                              setLightboxOpen(true)
                                            }}
                                          />
                                        ))}
                                      </div>
                                    )}

                                    {/* AI Response */}
                                    {assistantMessage && (
                                      <div className="mt-3 pt-3 border-t border-border">
                                        <div className="text-sm text-muted-foreground mb-1 font-medium">AI Response:</div>
                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                          {assistantMessage.content}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Generated images display */}
                      {isGenerating && (
                        <div className="flex items-center justify-center py-6">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-[#c99850]/60 mx-auto mb-1.5 animate-spin" />
                            <p className="text-[10px] text-[#c99850]/70">
                              Generating {imageCount} {imageCount === 1 ? "image" : "images"}...
                            </p>
                          </div>
                        </div>
                      )}

                      {!isGenerating && generatedImages.length === 0 && !manualPrompt && !getCombinedPrompt() && (
                        <div className="text-center py-6 bg-black rounded-lg border border-[#c99850]/20">
                          <Sparkles className="w-8 h-8 text-[#c99850]/40 mx-auto mb-1.5" />
                          <p className="text-[10px] text-[#c99850]/70 mb-0.5">No images generated yet</p>
                          <p className="text-[8px] text-[#c99850]/60">
                            Upload and analyze images, then click Generate to create new images
                          </p>
                        </div>
                      )}

                      {generatedImages.length > 0 && (
                        <div className={`grid ${imageCount === 2 ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                          {generatedImages.map((imageData, index) => (
                            <div key={index} className="bg-black rounded-lg p-3 border-2 border-[#c99850]/20">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-bold text-[#c99850]">Generated Image {index + 1}</h3>
                                <button
                                  onClick={() => handleDownloadImage(imageData.url, index)}
                                  className="bg-[#c99850]/20 hover:bg-[#c99850]/30 text-[#c99850] px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors flex items-center gap-1"
                                >
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                  </svg>
                                  Download
                                </button>
                              </div>
                              <div
                                className="relative bg-black/50 rounded-lg overflow-hidden cursor-pointer hover:bg-black/70 transition-colors border border-[#c99850]/20 group"
                                onClick={() => openLightbox(index)}
                              >
                                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1 max-w-[calc(100%-1rem)]">
                                  <div className="bg-black/90 backdrop-blur-sm px-2.5 py-1.5 rounded text-[11px] font-medium text-[#c99850] border border-[#c99850]/40">
                                    {imageData.ratio}
                                  </div>
                                  <div className="bg-black/90 backdrop-blur-sm px-2.5 py-1.5 rounded text-[11px] font-medium text-[#c99850] border border-[#c99850]/40 truncate max-w-[200px]">
                                    {getCleanStyleName(imageData.style)}
                                  </div>
                                  {imageData.dimensions && (
                                    <div className="bg-black/90 backdrop-blur-sm px-2.5 py-1.5 rounded text-[11px] font-medium text-[#c99850] border border-[#c99850]/40">
                                      {imageData.dimensions.width}×{imageData.dimensions.height}
                                    </div>
                                  )}
                                  {imageData.fileSizeMB !== undefined && imageData.fileSizeMB !== null && (
                                    <div className="bg-black/90 backdrop-blur-sm px-2.5 py-1.5 rounded text-[11px] font-medium text-[#c99850] border border-[#c99850]/40">
                                      {imageData.fileSizeMB.toFixed(2)} MB
                                    </div>
                                  )}
                                </div>
                                <img
                                  src={imageData.url || "/placeholder.svg"}
                                  alt={`Generated image ${index + 1}`}
                                  className="w-full h-auto max-h-[350px] object-contain"
                                  onLoad={() => loadImageMetadata(imageData.url, index)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="!max-w-[70vw] !max-h-[70vh] w-[70vw] h-[70vh] p-0 bg-black border-zinc-800 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Download button */}
            <button
              onClick={handleDownloadFromLightbox}
              className="absolute top-4 right-16 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Download image"
            >
              <Download className="w-6 h-6" />
            </button>

            {/* Previous button */}
            {generatedImages.length > 1 && (
              <button
                onClick={() => navigateLightbox("prev")}
                className="absolute left-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Image */}
            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={generatedImages[lightboxIndex]?.url || "/placeholder.svg"}
                alt={`Generated image ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Next button */}
            {generatedImages.length > 1 && (
              <button
                onClick={() => navigateLightbox("next")}
                className="absolute right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {/* Image counter */}
            {generatedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                {lightboxIndex + 1} / {generatedImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Helper Button and its conditional rendering */}
      {!showPromptHelper && (
        <button
          onClick={() => setShowPromptHelper(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700] hover:from-[#FFED4E] hover:via-[#FFD700] hover:to-[#FFA500] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
          title="AI Prompt Helper"
        >
          <Sparkles className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
        </button>
      )}

      {showPromptHelper && (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-zinc-900 border-l border-[#c99850]/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#c99850]/30">
            <h3 className="text-lg font-bold text-[#c99850]">AI Prompt Helper</h3>
            <div className="flex gap-2">
              {/* Make header icons gold colored */}
              <button
                onClick={() => {
                  setHistoryTab("ai-helper") // Ensure tab is set correctly
                  setShowHistory(true) // Show history section
                  loadAiHelperHistory()
                }}
                className="p-2 hover:bg-zinc-800 rounded transition-colors"
                title="View chat history"
              >
                <History className="w-4 h-4 text-[#c99850]" />
              </button>
              <button
                onClick={async () => {
                  if (confirm("Clear all AI Helper messages? This will remove all chat history.")) {
                    await clearAiHelperHistory()
                  }
                }}
                className="p-2 hover:bg-zinc-800 rounded transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4 text-[#c99850]" />
              </button>
              <button
                onClick={() => setShowPromptHelper(false)}
                className="p-2 hover:bg-zinc-800 rounded transition-colors"
              >
                <X className="w-4 h-4 text-[#c99850]" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {promptHelperMessages.length === 0 &&
              !isPromptHelperLoading && ( // Show intro only if no messages and not loading
                <div className="text-center text-zinc-500 text-sm mt-8">
                  <p className="mb-2">👋 Hi! I'm your AI prompt assistant.</p>
                  <p>
                    Tell me what image you want to create and I'll help you craft the perfect prompt with optimal camera
                    settings. You can also upload images to help me understand your vision better.
                  </p>
                </div>
              )}

            {promptHelperMessages.map((msg, idx) => (
              <div key={idx}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      msg.role === "user" ? "bg-[#c99850] text-black" : "bg-zinc-800 text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>

                {/* Suggestion Card */}
                {msg.suggestions && (
                  <div className="mt-2 bg-zinc-800 border border-[#c99850]/30 rounded-lg p-3 space-y-2">
                    {editingSuggestionIndex === idx ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-[#c99850] mb-1 block">Edit Prompt:</label>
                          <textarea
                            value={editedSuggestion.prompt}
                            onChange={(e) => setEditedSuggestion((prev) => ({ ...prev, prompt: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white resize-none"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-[#c99850] mb-1 block">Edit Negative Prompt:</label>
                          <textarea
                            value={editedSuggestion.negativePrompt}
                            onChange={(e) =>
                              setEditedSuggestion((prev) => ({ ...prev, negativePrompt: e.target.value }))
                            }
                            className="w-full px-2 py-1.5 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white resize-none"
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-[#c99850] mb-1 block">Style:</label>
                          {/* CHANGE: Replaced limited 4 options with full styleOptions array */}
                          <select
                            value={editedSuggestion.style}
                            onChange={(e) => setEditedSuggestion((prev) => ({ ...prev, style: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white"
                          >
                            {styleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-[#c99850] mb-1 block">Aspect Ratio:</label>
                          <select
                            value={editedSuggestion.aspectRatio}
                            onChange={(e) => setEditedSuggestion((prev) => ({ ...prev, aspectRatio: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white"
                          >
                            <option value="1:1">1:1</option>
                            <option value="16:9">16:9</option>
                            <option value="9:16">9:16</option>
                            <option value="4:3">4:3</option>
                            <option value="3:4">3:4</option>
                            <option value="3:2">3:2</option>
                            <option value="2:3">2:3</option>
                          </select>
                        </div>

                        {(msg.suggestions.cameraAngle && msg.suggestions.cameraAngle !== "None") ||
                        (msg.suggestions.cameraLens && msg.suggestions.cameraLens !== "None") ||
                        msg.suggestions.styleStrength ? (
                          <div className="mt-3 mb-3 p-3 bg-[#c99850]/10 border-2 border-[#c99850]/30 rounded-lg">
                            <p className="text-xs text-[#c99850] font-bold flex items-center gap-2">
                              <span className="text-base">⚠️</span>
                              Camera Settings Must Be Added Manually
                            </p>
                            <p className="text-[10px] text-[#c99850]/80 mt-1">
                              The settings below are suggestions only. Add them to your prompt if needed.
                            </p>
                          </div>
                        ) : null}

                        {msg.suggestions.cameraAngle && msg.suggestions.cameraAngle !== "None" && (
                          <p className="text-xs text-zinc-400 mb-1">
                            <span className="text-[#c99850]/50">Camera Angle (reference):</span>{" "}
                            {msg.suggestions.cameraAngle}
                          </p>
                        )}
                        {msg.suggestions.cameraLens && msg.suggestions.cameraLens !== "None" && (
                          <p className="text-xs text-zinc-400 mb-1">
                            <span className="text-[#c99850]/50">Camera Lens (reference):</span>{" "}
                            {msg.suggestions.cameraLens}
                          </p>
                        )}
                        {msg.suggestions.styleStrength && (
                          <p className="text-xs text-zinc-400 mb-1">
                            <span className="text-[#c99850]/50">Style Strength (reference):</span>{" "}
                            {msg.suggestions.styleStrength}
                          </p>
                        )}

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={handleSaveEditedSuggestion}
                            className="flex-1 px-3 py-2 bg-zinc-700 text-white rounded-lg text-sm font-semibold hover:bg-zinc-600 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEditSuggestion}
                            className="flex-1 px-3 py-2 bg-[#c99850] text-black rounded-lg text-sm font-semibold hover:bg-[#d4a85f] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="space-y-2">
                        {msg.suggestions.prompt && msg.suggestions.prompt !== "None" && (
                          <div className="bg-[#c99850]/5 border border-[#c99850]/20 rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-[#c99850]">Suggested Prompt:</p>
                              <button
                                onClick={() => handleCopyPrompt(msg.suggestions.prompt, "Prompt")}
                                className="px-2 py-0.5 bg-[#c99850]/20 hover:bg-[#c99850]/30 text-[#c99850] rounded text-[10px] font-medium transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-xs text-white leading-relaxed">{msg.suggestions.prompt}</p>
                          </div>
                        )}

                        {msg.suggestions.negativePrompt && msg.suggestions.negativePrompt !== "None" && (
                          <div className="bg-[#c99850]/5 border border-[#c99850]/20 rounded-lg p-2">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-bold text-[#c99850]">Negative Prompt:</p>
                              <button
                                onClick={() => handleCopyPrompt(msg.suggestions.negativePrompt!, "Negative Prompt")}
                                className="px-2 py-0.5 bg-[#c99850]/20 hover:bg-[#c99850]/30 text-[#c99850] rounded text-[10px] font-medium transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-xs text-white leading-relaxed">{msg.suggestions.negativePrompt}</p>
                          </div>
                        )}

                        {msg.suggestions.style && msg.suggestions.style !== "None" && (
                          <p className="text-xs text-white mb-1">
                            <span className="text-[#c99850]/70">Style:</span> {msg.suggestions.style}
                          </p>
                        )}

                        {msg.suggestions.aspectRatio && (
                          <p className="text-xs text-white mb-1 font-medium">
                            <span className="text-[#c99850]/70">Aspect Ratio:</span> {msg.suggestions.aspectRatio}
                          </p>
                        )}

                        {(msg.suggestions.cameraAngle && msg.suggestions.cameraAngle !== "None") ||
                        (msg.suggestions.cameraLens && msg.suggestions.cameraLens !== "None") ||
                        msg.suggestions.styleStrength ? (
                          <div className="mt-3 mb-3 p-3 bg-[#c99850]/10 border-2 border-[#c99850]/30 rounded-lg">
                            <p className="text-xs text-[#c99850] font-bold flex items-center gap-2">
                              <span className="text-base">⚠️</span>
                              Camera Settings Must Be Added Manually
                            </p>
                            <p className="text-[10px] text-[#c99850]/80 mt-1">
                              The settings below are suggestions only. Add them to your prompt if needed.
                            </p>
                          </div>
                        ) : null}

                        {msg.suggestions.cameraAngle && msg.suggestions.cameraAngle !== "None" && (
                          <p className="text-xs text-zinc-400 mb-1">
                            <span className="text-[#c99850]/50">Camera Angle (reference):</span>{" "}
                            {msg.suggestions.cameraAngle}
                          </p>
                        )}
                        {msg.suggestions.cameraLens && msg.suggestions.cameraLens !== "None" && (
                          <p className="text-xs text-zinc-400 mb-1">
                            <span className="text-[#c99850]/50">Camera Lens (reference):</span>{" "}
                            {msg.suggestions.cameraLens}
                          </p>
                        )}
                        {msg.suggestions.styleStrength && (
                          <p className="text-xs text-zinc-400 mb-1">
                            <span className="text-[#c99850]/50">Style Strength (reference):</span>{" "}
                            {msg.suggestions.styleStrength}
                          </p>
                        )}

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleEditSuggestion(idx, msg.suggestions)}
                            className="flex-1 px-3 py-2 bg-zinc-700 text-white rounded-lg text-sm font-semibold hover:bg-zinc-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleApplyAISuggestion(msg.suggestions)}
                            className="flex-1 px-3 py-2 bg-[#c99850] text-black rounded-lg text-sm font-semibold hover:bg-[#d4a85f] transition-colors"
                          >
                            Apply All Settings
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isPromptHelperLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-[#c99850] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#c99850] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#c99850] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#c99850]/30">
            {aiHelperImages.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {aiHelperImages.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded border-2 border-[#c99850]/50">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute top-0 left-0 bg-[#c99850] text-black text-xs font-bold px-1.5 py-0.5 rounded-br">
                      {idx + 1}
                    </div>
                    <button
                      onClick={() => handleRemoveAiHelperImage(idx)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <textarea
                value={promptHelperInput}
                onChange={(e) => setPromptHelperInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isPromptHelperLoading) {
                    e.preventDefault()
                    sendMessageToHelper(promptHelperInput) // Changed to sendMessageToHelper
                  }
                }}
                placeholder="Describe your image idea... (Press Enter to send, Shift+Enter for new line)"
                className="flex-1 px-3 py-3 rounded-lg text-sm bg-zinc-800 text-white placeholder:text-zinc-500 border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/30 resize-none"
                disabled={isPromptHelperLoading}
                rows={3}
              />
              <div className="flex flex-col gap-2 self-end">
                <label className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium text-sm rounded transition-colors cursor-pointer flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAiHelperImageUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => sendMessageToHelper(promptHelperInput)} // Changed to sendMessageToHelper
                  disabled={isPromptHelperLoading || (!promptHelperInput.trim() && aiHelperImages.length === 0)}
                  className="px-4 py-2 bg-[#c99850] hover:bg-[#d4a85f] disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-medium text-sm rounded transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {/* Pass refreshTrigger to HistoryGrid component */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/95">
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close History
                </button>
              </div>
              <HistoryGrid
                onReusePrompt={(prompt, aspectRatio) => {
                  setManualPrompt(prompt)
                  setAspectRatio(aspectRatio)
                  setShowHistory(false)
                }}
                onImageClick={(images, index) => {
                  setGeneratedImages(
                    images.map((url) => ({
                      url,
                      ratio: "Unknown",
                      style: "Unknown",
                      dimensions: undefined,
                    })),
                  )
                  setLightboxIndex(index)
                  setLightboxOpen(true) // Open the lightbox when an image is clicked from history
                }}
                refreshTrigger={historyRefreshTrigger}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
RefreshTrigger}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
