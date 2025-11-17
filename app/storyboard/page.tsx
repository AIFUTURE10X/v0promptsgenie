"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Home,
  ImageIcon,
  Film,
  Plus,
  Trash2,
  Download,
  Save,
  Sparkles,
  Copy,
  ChevronDown,
  ChevronUp,
  Upload,
  Grid3x3,
  List,
  Presentation,
  X,
  Loader2,
  ZoomIn,
  Send,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import Link from "next/link"
import { generateText } from "ai"

type Scene = {
  id: string
  number: number
  title: string
  description: string
  imageUrl: string | null
  cameraAngle: string
  cameraMovement: string
  duration: string
  notes: string
  isGenerating?: boolean
}

type ViewMode = "grid" | "list" | "presentation"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function StoryboardPage() {
  const [projectTitle, setProjectTitle] = useState("Untitled Project")
  const [projectDescription, setProjectDescription] = useState("")
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false)
  const [storyboardId, setStoryboardId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [savedStoryboards, setSavedStoryboards] = useState<any[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: "1",
      number: 1,
      title: "Opening Scene",
      description: "",
      imageUrl: null,
      cameraAngle: "",
      cameraMovement: "",
      duration: "",
      notes: "",
    },
  ])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set())
  const [lightboxImage, setLightboxImage] = useState<{
    url: string
    title: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const handleReferenceImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setReferenceImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const saveProject = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch("/api/storyboard/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: storyboardId,
          title: projectTitle,
          description: projectDescription,
          referenceImage: referenceImage, // Save reference image
          scenes: scenes.map((scene) => ({
            sceneNumber: scene.number,
            title: scene.title,
            description: scene.description,
            imageUrl: scene.imageUrl,
            cameraAngle: scene.cameraAngle,
            cameraMovement: scene.cameraMovement,
            duration: scene.duration,
            notes: scene.notes,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStoryboardId(data.storyboardId)
        setSaveMessage("Saved successfully!")
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        throw new Error(data.error || "Failed to save")
      }
    } catch (error) {
      console.error("[v0] Error saving storyboard:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setSaveMessage(`Failed to save: ${errorMessage}`)
      setTimeout(() => setSaveMessage(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const addScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      number: scenes.length + 1,
      title: `Scene ${scenes.length + 1}`,
      description: "",
      imageUrl: null,
      cameraAngle: "",
      cameraMovement: "",
      duration: "",
      notes: "",
    }
    setScenes([...scenes, newScene])
  }

  const deleteScene = (id: string) => {
    const updatedScenes = scenes.filter((s) => s.id !== id).map((s, idx) => ({ ...s, number: idx + 1 }))
    setScenes(updatedScenes)
    if (selectedScene === id) setSelectedScene(null)
  }

  const duplicateScene = (id: string) => {
    const scene = scenes.find((s) => s.id === id)
    if (scene) {
      const newScene = {
        ...scene,
        id: Date.now().toString(),
        number: scenes.length + 1,
        title: `${scene.title} (Copy)`,
      }
      setScenes([...scenes, newScene])
    }
  }

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes((prevScenes) => prevScenes.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const toggleSceneExpand = (id: string) => {
    setExpandedScenes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleImageUpload = (sceneId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      updateScene(sceneId, { imageUrl: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const generateSceneImageWithReference = async (sceneId: string, refImage: string) => {
    const scene = scenes.find((s) => s.id === sceneId)
    if (!scene) {
      console.error("[v0] Scene not found:", sceneId)
      return
    }

    const prompt = scene.description || scene.title
    if (!prompt || prompt.trim().length === 0) {
      return
    }

    updateScene(sceneId, { isGenerating: true })

    try {
      const enhancedPrompt = `Based on the reference image, create a storyboard scene: ${prompt}${scene.cameraAngle ? `. Camera angle: ${scene.cameraAngle}` : ""}. Maintain the style, characters, and setting from the reference image but show this specific scene/moment/angle.`

      console.log("[v0] Generating image-to-image for scene:", sceneId)
      console.log("[v0] Prompt:", enhancedPrompt)

      const requestBody = {
        prompt: enhancedPrompt,
        count: 1,
        aspectRatio: "16:9",
        referenceImage: refImage,
      }

      console.log("[v0] Sending request with reference image")

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Response data received")

      if (data.images && data.images.length > 0 && data.images[0]) {
        console.log("[v0] Image received, updating scene")
        updateScene(sceneId, {
          imageUrl: data.images[0],
          isGenerating: false,
        })
        console.log("[v0] Scene updated successfully")
      } else {
        throw new Error("No images returned from API")
      }
    } catch (error) {
      console.error("[v0] Generation failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      alert(`Failed to generate image: ${errorMessage}`)
      updateScene(sceneId, { isGenerating: false })
    }
  }

  const generateSceneImage = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId)
    if (!scene) {
      console.error("[v0] Scene not found:", sceneId)
      return
    }

    const prompt = scene.description || scene.title
    if (!prompt || prompt.trim().length === 0) {
      alert("Please add a scene description or title first")
      return
    }

    updateScene(sceneId, { isGenerating: true })

    try {
      const enhancedPrompt = referenceImage
        ? `Based on the reference image, create a storyboard scene: ${prompt}${scene.cameraAngle ? `. Camera angle: ${scene.cameraAngle}` : ""}. Maintain the style, characters, and setting from the reference image but show this specific scene/moment/angle.`
        : `Create a cinematic storyboard scene: ${prompt}${scene.cameraAngle ? `. Camera angle: ${scene.cameraAngle}` : ""}. High quality, detailed, professional storyboard style.`

      console.log("[v0] Generating image for scene:", sceneId)
      console.log("[v0] Mode:", referenceImage ? "image-to-image" : "text-to-image")
      console.log("[v0] Prompt:", enhancedPrompt)

      const requestBody = {
        prompt: enhancedPrompt,
        count: 1,
        aspectRatio: "16:9",
        ...(referenceImage && { referenceImage: referenceImage }),
      }

      console.log("[v0] Sending request")

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Response data received")

      if (data.images && data.images.length > 0 && data.images[0]) {
        console.log("[v0] Image received, updating scene")
        updateScene(sceneId, {
          imageUrl: data.images[0],
          isGenerating: false,
        })
        console.log("[v0] Scene updated successfully")
      } else {
        throw new Error("No images returned from API")
      }
    } catch (error) {
      console.error("[v0] Generation failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      alert(`Failed to generate image: ${errorMessage}`)
      updateScene(sceneId, { isGenerating: false })
    }
  }

  // Generate All Scenes logic updated
  const generateAllScenes = async () => {
    console.log("[v0] Generate All clicked")

    const scenesToGenerate = scenes.filter((scene) => {
      const hasDescription = scene.description && scene.description.trim().length > 0
      return hasDescription && !scene.imageUrl
    })

    console.log("[v0] Total scenes:", scenes.length)
    console.log("[v0] Scenes needing generation:", scenesToGenerate.length)
    console.log(
      "[v0] Scene details:",
      scenesToGenerate.map((s) => ({ id: s.id, title: s.title, hasDesc: !!s.description })),
    )

    if (scenesToGenerate.length === 0) {
      alert("All scenes already have images or are missing descriptions")
      return
    }

    console.log("[v0] Starting sequential generation...")
    for (const scene of scenesToGenerate) {
      console.log("[v0] Generating scene:", scene.id, scene.title)
      await generateSceneImage(scene.id)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Add a small delay between generations
    }
    console.log("[v0] Generate All completed")
  }

  const exportProject = () => {
    const data = {
      title: projectTitle,
      description: projectDescription,
      referenceImage: referenceImage, // Export reference image
      scenes: scenes,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectTitle.replace(/\s+/g, "-")}-storyboard.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importProject = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json,.json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (!data.title || !data.scenes || !Array.isArray(data.scenes)) {
          alert("Invalid storyboard file format")
          return
        }

        setProjectTitle(data.title)
        setProjectDescription(data.description || "")
        setReferenceImage(data.referenceImage || null) // Import reference image
        setScenes(
          data.scenes.map((scene: any, index: number) => ({
            id: scene.id || Date.now().toString() + index,
            number: scene.number || index + 1,
            title: scene.title || `Scene ${index + 1}`,
            description: scene.description || "",
            imageUrl: scene.imageUrl || null,
            cameraAngle: scene.cameraAngle || "",
            cameraMovement: scene.cameraMovement || "",
            duration: scene.duration || "",
            notes: scene.notes || "",
          })),
        )
        setStoryboardId(null)
        alert("Storyboard imported successfully!")
      } catch (error) {
        console.error("[v0] Import error:", error)
        alert("Failed to import storyboard. Please check the file format.")
      }
    }
    input.click()
  }

  const fetchSavedStoryboards = async () => {
    setIsLoadingList(true)
    try {
      const response = await fetch("/api/storyboard/list")
      if (!response.ok) throw new Error("Failed to fetch storyboards")
      const data = await response.json()
      if (data.success) {
        setSavedStoryboards(data.storyboards)
      }
    } catch (error) {
      console.error("[v0] Error fetching storyboards:", error)
      alert("Failed to load storyboards list")
    } finally {
      setIsLoadingList(false)
    }
  }

  const loadStoryboard = async (id: string) => {
    try {
      const response = await fetch(`/api/storyboard/load?id=${id}`)
      if (!response.ok) throw new Error("Failed to load storyboard")
      const data = await response.json()

      if (data.success) {
        setStoryboardId(data.storyboard.id)
        setProjectTitle(data.storyboard.title)
        setProjectDescription(data.storyboard.description || "")
        setReferenceImage(data.storyboard.referenceImage || null) // Load reference image
        setScenes(
          data.scenes.map((scene: any) => ({
            id: scene.id,
            number: scene.sceneNumber,
            title: scene.title,
            description: scene.description,
            imageUrl: scene.imageUrl,
            cameraAngle: scene.cameraAngle,
            cameraMovement: scene.cameraMovement,
            duration: scene.duration,
            notes: scene.notes,
          })),
        )
        setShowLoadModal(false)
        alert("Storyboard loaded successfully!")
      }
    } catch (error) {
      console.error("[v0] Error loading storyboard:", error)
      alert("Failed to load storyboard")
    }
  }

  const openLoadModal = () => {
    setShowLoadModal(true)
    fetchSavedStoryboards()
  }

  const handleChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setChatInput("")
    setIsChatLoading(true)

    try {
      // Build storyboard context for AI
      const storyboardContext = `
PROJECT: ${projectTitle}
DESCRIPTION: ${projectDescription || "No description"}
TOTAL SCENES: ${scenes.length}
REFERENCE IMAGE: ${referenceImage ? "Yes" : "No"}

SCENES:
${scenes
  .map(
    (scene) => `

Scene ${scene.number}: ${scene.title}
- Description: ${scene.description || "No description"}
- Camera Angle: ${scene.cameraAngle || "Not set"}
- Camera Movement: ${scene.cameraMovement || "Not set"}
- Duration: ${scene.duration || "Not set"}
- Has Image: ${scene.imageUrl ? "Yes" : "No"}
- Notes: ${scene.notes || "None"}
`,
  )
  .join("\n")}
`

      const systemPrompt = `You are a storyboard and branding expert assistant. You help users with:
- Branding guidance and consistency across scenes
- Storytelling and narrative flow suggestions
- Scene composition and camera work advice  
- Character and visual consistency
- Pacing and timing recommendations
- Creative direction for their storyboard project

Current storyboard context:
${storyboardContext}

Provide helpful, concise advice tailored to their specific project. Be conversational and actionable.`

      const response = await generateText({
        model: "openai/gpt-4o-mini",
        system: systemPrompt,
        prompt: userMessage,
      })

      setChatMessages((prev) => [...prev, { role: "assistant", content: response.text }])

      // Auto-scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error) {
      console.error("[v0] Chat error:", error)
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsChatLoading(false)
    }
  }

  const clearChatHistory = () => {
    if (confirm("Clear all chat history?")) {
      setChatMessages([])
    }
  }

  const clearAll = () => {
    if (
      confirm(
        "Are you sure you want to clear everything? This will reset the entire storyboard to its default state. This action cannot be undone.",
      )
    ) {
      // Reset to initial state
      setProjectTitle("Untitled Project")
      setProjectDescription("")
      setIsTitleEditing(false)
      setIsDescriptionEditing(false)
      setStoryboardId(null)
      setReferenceImage(null)
      setScenes([
        {
          id: "1",
          number: 1,
          title: "Opening Scene",
          description: "",
          imageUrl: null,
          cameraAngle: "",
          cameraMovement: "",
          duration: "",
          notes: "",
        },
      ])
      setSelectedScene(null)
      setExpandedScenes(new Set())
      setLightboxImage(null)
      setChatMessages([])
      setSaveMessage("Project cleared")
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-4 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <img src="/logo.png" alt="PromptsGenie Logo" className="h-9 w-auto" />
            <p className="text-xs text-zinc-400 mt-1">AI-Powered Creative Tools</p>
          </div>

          <nav className="flex items-center gap-2">
            <Link href="/">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-black font-medium relative overflow-hidden text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                }}
              >
                <Home className="w-4 h-4 relative z-10 text-black" />
                Home
              </button>
            </Link>

            <Link href="/image-analyzer">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-black font-medium relative overflow-hidden text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                }}
              >
                <ImageIcon className="w-4 h-4 relative z-10 text-black" />
                Image Analyzer
              </button>
            </Link>

            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-black font-medium relative overflow-hidden text-sm"
              style={{
                background: "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
              }}
            >
              <Film className="w-4 h-4 relative z-10 text-black" />
              Storyboard
            </button>
          </nav>

          <div className="w-[180px]"></div>
        </div>
      </header>

      <main className="p-4 relative">
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="fixed bottom-6 right-6 z-40 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
          }}
          title="AI Storyboard Assistant"
        >
          {showChatbot ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </button>

        {showChatbot && (
          <div className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="bg-zinc-800 px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" style={{ color: "#c99850" }} />
                <div>
                  <h3 className="font-bold text-sm">Storyboard Assistant</h3>
                  <p className="text-xs text-zinc-500">Branding & Storytelling Help</p>
                </div>
              </div>
              <button
                onClick={clearChatHistory}
                className="text-zinc-400 hover:text-white text-xs"
                title="Clear chat history"
              >
                Clear
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-zinc-500 mt-8">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                  <p className="text-sm mb-2">Storyboard Assistant</p>
                  <p className="text-xs">
                    Ask me about branding, scenes, storytelling, or creative direction for your project.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 ${
                        msg.role === "user" ? "text-black" : "bg-zinc-800 text-zinc-100 border border-zinc-700"
                      }`}
                      style={
                        msg.role === "user"
                          ? {
                              background:
                                "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                            }
                          : {}
                      }
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#c99850" }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="border-t border-zinc-800 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleChatMessage()
                    }
                  }}
                  placeholder="Ask about branding, scenes, storytelling..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "rgba(201, 152, 80, 0.5)" } as React.CSSProperties}
                  disabled={isChatLoading}
                />
                <button
                  onClick={handleChatMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="disabled:bg-zinc-700 disabled:text-zinc-500 text-black rounded-lg px-4 py-2 transition-colors"
                  style={
                    !chatInput.trim() || isChatLoading
                      ? {}
                      : {
                          background:
                            "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                        }
                  }
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-600 mt-2">Press Enter to send</p>
            </div>
          </div>
        )}

        <div className="bg-zinc-900 rounded-lg p-4 mb-4 border border-zinc-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {isTitleEditing ? (
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  onBlur={() => setIsTitleEditing(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsTitleEditing(false)
                  }}
                  className="text-xl font-bold bg-zinc-800 border rounded px-2 py-1 outline-none w-full mb-1 text-white"
                  style={{ borderColor: "#c99850" }}
                  placeholder="Project Title"
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setIsTitleEditing(true)}
                  className="text-xl font-bold cursor-pointer transition-colors w-full mb-1 text-white group flex items-center gap-2"
                  style={{ "--hover-color": "#c99850" } as React.CSSProperties}
                >
                  {projectTitle || "Untitled Project"}
                  <span className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    (click to edit)
                  </span>
                </div>
              )}

              {isDescriptionEditing ? (
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  onBlur={() => setIsDescriptionEditing(false)}
                  className="text-xs text-zinc-300 bg-zinc-800 border rounded px-2 py-1.5 outline-none w-full resize-none"
                  style={{ borderColor: "#c99850" }}
                  placeholder="Add project description..."
                  rows={2}
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setIsDescriptionEditing(true)}
                  className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors group"
                >
                  {projectDescription || "Add project description..."}{" "}
                  <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                    (click to edit)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={importProject}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-white bg-transparent text-xs"
              >
                <Upload className="w-3 h-3 mr-1" />
                Import
              </Button>
              <Button
                onClick={exportProject}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-white bg-transparent text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <Button
                onClick={saveProject}
                size="sm"
                className="text-xs text-black"
                style={{
                  background:
                    "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Save {saveMessage && <span className="ml-1">✓</span>}
                  </>
                )}
              </Button>
              <Button
                onClick={openLoadModal}
                variant="outline"
                size="sm"
                className="border-zinc-700 text-white bg-transparent text-xs"
              >
                <Upload className="w-3 h-3 mr-1" />
                Load
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="border-red-700 text-red-400 hover:bg-red-900/20 bg-transparent text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 mr-4 pr-4 border-r border-zinc-700">
                {referenceImage ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="relative w-16 h-16 rounded-lg overflow-hidden border-2"
                      style={{ borderColor: "#c99850" }}
                    >
                      <img
                        src={referenceImage || "/placeholder.svg"}
                        alt="Reference"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setReferenceImage(null)}
                        className="absolute top-0 right-0 bg-black/80 hover:bg-black p-0.5 rounded-bl"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <div className="text-xs">
                      <div className="text-zinc-400">Reference Image</div>
                      <button
                        onClick={() => {
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) handleReferenceImageUpload(file)
                          }
                          input.click()
                        }}
                        className="hover:underline"
                        style={{ color: "#c99850" }}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = "image/*"
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) handleReferenceImageUpload(file)
                      }
                      input.click()
                    }}
                    size="sm"
                    className="text-xs text-black"
                    style={{
                      background:
                        "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                    }}
                  >
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Upload Reference Image
                  </Button>
                )}
              </div>

              <Button
                onClick={addScene}
                size="sm"
                className="text-xs text-black"
                style={{
                  background:
                    "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Scene
              </Button>
              <Button
                onClick={generateAllScenes}
                size="sm"
                className="text-xs text-black border transition-all"
                style={{
                  background: "rgba(201, 152, 80, 0.2)",
                  borderColor: "#c99850",
                }}
                disabled={!referenceImage && !scenes.some((s) => s.imageUrl)}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate All Scenes
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 bg-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "text-black" : "text-zinc-400 hover:text-white"}`}
                  style={
                    viewMode === "grid"
                      ? {
                          background:
                            "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                        }
                      : {}
                  }
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${viewMode === "list" ? "text-black" : "text-zinc-400 hover:text-white"}`}
                  style={
                    viewMode === "list"
                      ? {
                          background:
                            "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                        }
                      : {}
                  }
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("presentation")}
                  className={`p-1.5 rounded ${viewMode === "presentation" ? "text-black" : "text-zinc-400 hover:text-white"}`}
                  style={
                    viewMode === "presentation"
                      ? {
                          background:
                            "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                        }
                      : {}
                  }
                >
                  <Presentation className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-xs text-zinc-500">{scenes.length} Scenes</div>
            </div>
          </div>
        </div>

        {showLoadModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h2 className="text-lg font-bold">Load Storyboard</h2>
                <button
                  onClick={() => setShowLoadModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingList ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#FF8C1A] animate-spin" />
                  </div>
                ) : savedStoryboards.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    <p>No saved storyboards found.</p>
                    <p className="text-sm mt-2">Create and save a storyboard to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedStoryboards.map((sb) => (
                      <div
                        key={sb.id}
                        onClick={() => loadStoryboard(sb.id)}
                        className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 cursor-pointer transition-colors border border-zinc-700 hover:border-[#FF8C1A]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-white">{sb.title}</h3>
                          <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                            {sb.sceneCount} scenes
                          </span>
                        </div>
                        {sb.description && <p className="text-sm text-zinc-400 mb-2">{sb.description}</p>}
                        <div className="text-xs text-zinc-500">
                          Last updated: {new Date(sb.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-black border-zinc-800">
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={lightboxImage?.url || "/placeholder.svg"}
                alt={lightboxImage?.title || "Scene image"}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <DialogClose className="absolute top-4 right-4 bg-black/80 hover:bg-black p-2 rounded-full border border-zinc-700">
                <X className="w-5 h-5 text-white" />
              </DialogClose>
              {lightboxImage?.title && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg border border-zinc-700">
                  <p className="text-sm text-white">{lightboxImage.title}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {viewMode === "grid" && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-[#FF8C1A]/50 transition-all"
              >
                <div className="relative aspect-video bg-zinc-800">
                  {scene.isGenerating ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 text-[#FF8C1A] animate-spin" />
                    </div>
                  ) : scene.imageUrl ? (
                    <>
                      <img
                        src={scene.imageUrl || "/placeholder.svg"}
                        alt={scene.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setLightboxImage({ url: scene.imageUrl!, title: scene.title })}
                      />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={() => setLightboxImage({ url: scene.imageUrl!, title: scene.title })}
                      >
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => generateSceneImage(scene.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-black transition-colors"
                          style={{
                            background:
                              "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                          }}
                        >
                          <Sparkles className="w-3 h-3" />
                          Generate
                        </button>
                        <button
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = "image/*"
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) handleImageUpload(scene.id, file)
                            }
                            input.click()
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-zinc-300 transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          Upload
                        </button>
                      </div>
                    </div>
                  )}
                  <div
                    className="absolute top-1.5 left-1.5 text-black text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                    }}
                  >
                    {scene.number}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${scene.title}"?`)) {
                        deleteScene(scene.id)
                      }
                    }}
                    className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-600 p-1.5 rounded-full transition-all hover:scale-110"
                    title="Delete scene"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  {scene.imageUrl && (
                    <button
                      onClick={() => updateScene(scene.id, { imageUrl: null })}
                      className="absolute top-1.5 right-10 bg-black/60 hover:bg-black/80 p-1 rounded-full"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-3">
                  <input
                    type="text"
                    value={scene.title}
                    onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                    className="text-sm font-bold bg-transparent border-none outline-none w-full mb-1 text-white"
                    placeholder="Scene Title"
                  />
                  <div className="mb-2">
                    <label className="text-[10px] text-zinc-500 block mb-1">
                      Scene Description (for AI generation)
                    </label>
                    <textarea
                      value={scene.description}
                      onChange={(e) => updateScene(scene.id, { description: e.target.value })}
                      className="text-xs text-zinc-300 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 outline-none w-full resize-none focus:border-[#c99850]"
                      placeholder="Describe what happens in this scene..."
                      rows={2}
                    />
                  </div>

                  <button
                    onClick={() => toggleSceneExpand(scene.id)}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#FF8C1A] mb-2"
                  >
                    {expandedScenes.has(scene.id) ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                    {expandedScenes.has(scene.id) ? "Hide" : "Show"} Details
                  </button>

                  {expandedScenes.has(scene.id) && (
                    <div className="space-y-1.5 mb-2 pt-2 border-t border-zinc-800">
                      <div>
                        <label className="text-xs text-zinc-500 block mb-0.5">Camera Angle</label>
                        <select
                          value={scene.cameraAngle}
                          onChange={(e) => updateScene(scene.id, { cameraAngle: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="">Select...</option>
                          <option value="wide">Wide Shot</option>
                          <option value="medium">Medium</option>
                          <option value="closeup">Close-up</option>
                          <option value="overhead">Overhead</option>
                          <option value="low-angle">Low Angle</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-500 block mb-0.5">Movement</label>
                        <select
                          value={scene.cameraMovement}
                          onChange={(e) => updateScene(scene.id, { cameraMovement: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="">Select...</option>
                          <option value="static">Static</option>
                          <option value="pan">Pan</option>
                          <option value="tilt">Tilt</option>
                          <option value="zoom">Zoom</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-500 block mb-0.5">Duration (sec)</label>
                        <input
                          type="text"
                          value={scene.duration}
                          onChange={(e) => updateScene(scene.id, { duration: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                          placeholder="e.g., 5"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-500 block mb-0.5">Notes</label>
                        <textarea
                          value={scene.notes}
                          onChange={(e) => updateScene(scene.id, { notes: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white resize-none"
                          placeholder="Notes..."
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => duplicateScene(scene.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-[#FF8C1A]/50 transition-all"
              >
                <div className="relative aspect-video bg-zinc-800">
                  {scene.isGenerating ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-5 h-5 text-[#FF8C1A] animate-spin" />
                    </div>
                  ) : scene.imageUrl ? (
                    <>
                      <img
                        src={scene.imageUrl || "/placeholder.svg"}
                        alt={scene.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setLightboxImage({ url: scene.imageUrl!, title: scene.title })}
                      />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        onClick={() => setLightboxImage({ url: scene.imageUrl!, title: scene.title })}
                      >
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => generateSceneImage(scene.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-black transition-colors"
                          style={{
                            background:
                              "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                          }}
                        >
                          <Sparkles className="w-3 h-3" />
                          Generate
                        </button>
                        <button
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = "image/*"
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) handleImageUpload(scene.id, file)
                            }
                            input.click()
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-zinc-300 transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          Upload
                        </button>
                      </div>
                    </div>
                  )}
                  <div
                    className="absolute top-1.5 left-1.5 text-black text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                    }}
                  >
                    {scene.number}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${scene.title}"?`)) {
                        deleteScene(scene.id)
                      }
                    }}
                    className="absolute top-1.5 right-1.5 bg-red-600/90 hover:bg-red-600 p-1.5 rounded-full transition-all hover:scale-110"
                    title="Delete scene"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  {scene.imageUrl && (
                    <button
                      onClick={() => updateScene(scene.id, { imageUrl: null })}
                      className="absolute top-1.5 right-10 bg-black/60 hover:bg-black/80 p-1 rounded-full"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-3">
                  <input
                    type="text"
                    value={scene.title}
                    onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                    className="text-sm font-bold bg-transparent border-none outline-none w-full mb-1 text-white"
                    placeholder="Scene Title"
                  />
                  <div className="mb-2">
                    <label className="text-[10px] text-zinc-500 block mb-1">Scene Description</label>
                    <textarea
                      value={scene.description}
                      onChange={(e) => updateScene(scene.id, { description: e.target.value })}
                      className="text-xs text-zinc-300 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 outline-none w-full resize-none focus:border-[#c99850]"
                      placeholder="Describe what happens..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-0.5">Angle</label>
                      <select
                        value={scene.cameraAngle}
                        onChange={(e) => updateScene(scene.id, { cameraAngle: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-[10px] text-white"
                      >
                        <option value="">Select...</option>
                        <option value="wide">Wide</option>
                        <option value="medium">Medium</option>
                        <option value="closeup">Close-up</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-0.5">Movement</label>
                      <select
                        value={scene.cameraMovement}
                        onChange={(e) => updateScene(scene.id, { cameraMovement: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-[10px] text-white"
                      >
                        <option value="">Select...</option>
                        <option value="static">Static</option>
                        <option value="pan">Pan</option>
                        <option value="tilt">Tilt</option>
                        <option value="zoom">Zoom</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-0.5">Duration</label>
                      <input
                        type="text"
                        value={scene.duration}
                        onChange={(e) => updateScene(scene.id, { duration: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-[10px] text-white"
                        placeholder="sec"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => duplicateScene(scene.id)}
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-400 text-xs flex-1 px-2 h-7"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "presentation" && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
            <div className="max-w-5xl mx-auto">
              {scenes.map((scene, index) => (
                <div key={scene.id} className="mb-12 last:mb-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="text-black text-lg font-bold px-4 py-2 rounded-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                      }}
                    >
                      Scene {scene.number}
                    </div>
                    <h3 className="text-3xl font-bold">{scene.title || "Untitled Scene"}</h3>
                  </div>

                  {scene.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden relative group cursor-pointer">
                      <img
                        src={scene.imageUrl || "/placeholder.svg"}
                        alt={scene.title}
                        className="w-full"
                        onClick={() => setLightboxImage({ url: scene.imageUrl!, title: scene.title })}
                      />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        onClick={() => setLightboxImage({ url: scene.imageUrl!, title: scene.title })}
                      >
                        <ZoomIn className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  )}

                  {scene.description && <p className="text-lg text-zinc-300 mb-4">{scene.description}</p>}

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {scene.cameraAngle && (
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="text-xs text-zinc-500 mb-1">Camera Angle</div>
                        <div className="text-sm font-medium">{scene.cameraAngle}</div>
                      </div>
                    )}
                    {scene.cameraMovement && (
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="text-xs text-zinc-500 mb-1">Movement</div>
                        <div className="text-sm font-medium">{scene.cameraMovement}</div>
                      </div>
                    )}
                    {scene.duration && (
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="text-xs text-zinc-500 mb-1">Duration</div>
                        <div className="text-sm font-medium">{scene.duration}s</div>
                      </div>
                    )}
                  </div>

                  {scene.notes && (
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <div className="text-xs text-zinc-500 mb-2">Notes</div>
                      <p className="text-sm text-zinc-300">{scene.notes}</p>
                    </div>
                  )}

                  {index < scenes.length - 1 && <div className="border-t border-zinc-800 mt-8" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
