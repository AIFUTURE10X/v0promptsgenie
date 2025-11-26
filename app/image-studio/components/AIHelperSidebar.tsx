/**
 * ≡ƒöÆ PROTECTED: AI HELPER SIDEBAR
 * 
 * This file is part of the AI Helper feature and should not be modified without explicit approval.
 * 
 * APPROVAL REQUIRED: Use phrase "APPROVE SIGNIFICANT CHANGE"
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Trash2, Send, ImageIcon, Copy, Check, Edit2 } from 'lucide-react'
import { useAIHelper } from '../hooks/useAIHelper'

interface AIHelperSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPromptSettings?: {
    currentPrompt?: string
    currentNegativePrompt?: string
    currentStyle?: string
    currentCameraAngle?: string
    currentCameraLens?: string
    currentAspectRatio?: string
    styleStrength?: string
    promptMode?: string
  }
  onApplySuggestions?: (suggestions: any) => void
}

export function AIHelperSidebar({ 
  isOpen, 
  onClose, 
  currentPromptSettings = {},
  onApplySuggestions 
}: AIHelperSidebarProps) {
  const [input, setInput] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editedSuggestions, setEditedSuggestions] = useState<any>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { 
    messages, 
    uploadedImages, 
    isLoading, 
    sendMessage, 
    addImage, 
    removeImage, 
    clearHistory,
    updateMessageSuggestions
  } = useAIHelper()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() && uploadedImages.length === 0) return
    if (isLoading) return
    
    const userInput = input.trim() || 'Help me create a prompt based on this reference image'
    setInput('')
    await sendMessage(userInput, currentPromptSettings)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload image files only')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 10MB`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        addImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleEditStart = (idx: number, suggestions: any) => {
    console.log('[v0] Edit mode started for message', idx)
    console.log('[v0] Original suggestions:', suggestions)
    
    // Create a complete copy of ALL suggestions fields
    const fullCopy = {
      prompt: suggestions.prompt || '',
      negativePrompt: suggestions.negativePrompt || '',
      style: suggestions.style || '',
      aspectRatio: suggestions.aspectRatio || '1:1',
      cameraAngle: suggestions.cameraAngle || 'None',
      cameraLens: suggestions.cameraLens || 'None',
      styleStrength: suggestions.styleStrength || 'moderate'
    }
    
    console.log('[v0] Initialized edit state with:', fullCopy)
    setEditingIndex(idx)
    setEditedSuggestions(fullCopy)
  }

  const handleEditCancel = () => {
    console.log('[v0] Edit cancelled')
    setEditingIndex(null)
    setEditedSuggestions({})
  }

  const handleEditSave = (idx: number) => {
    console.log('[v0] ===== APPLY CHANGES CLICKED =====')
    console.log('[v0] Message index:', idx)
    console.log('[v0] editedSuggestions contains all fields:', editedSuggestions)
    
    if (!onApplySuggestions) {
      console.error('[v0] ERROR: onApplySuggestions callback is undefined!')
      alert('Error: Apply callback is not connected. Please refresh the page.')
      return
    }
    
    try {
      console.log('[v0] Calling onApplySuggestions with edited suggestions')
      onApplySuggestions(editedSuggestions)
      console.log('[v0] Applied successfully')
      
      console.log('[v0] Updating message suggestions with edited values')
      updateMessageSuggestions(idx, editedSuggestions)
      
      setEditingIndex(null)
      setEditedSuggestions({})
    } catch (error) {
      console.error('[v0] ERROR in handleEditSave:', error)
      alert(`Error applying settings: ${error}`)
    }
  }

  const handleApplyClick = (suggestions: any, idx: number) => {
    console.log('[v0] ===== APPLY BUTTON CLICKED =====')
    console.log('[v0] Clicked on message index:', idx)
    console.log('[v0] Suggestions to apply:', JSON.stringify(suggestions, null, 2))
    console.log('[v0] onApplySuggestions callback exists?', !!onApplySuggestions)
    console.log('[v0] onApplySuggestions type:', typeof onApplySuggestions)
    
    if (!onApplySuggestions) {
      console.error('[v0] ERROR: onApplySuggestions callback is undefined!')
      alert('Error: Apply callback is not connected. Please refresh the page.')
      return
    }
    
    try {
      console.log('[v0] Calling onApplySuggestions now...')
      onApplySuggestions(suggestions)
      console.log('[v0] onApplySuggestions call completed successfully')
    } catch (error) {
      console.error('[v0] ERROR in handleApplyClick:', error)
      alert(`Error applying settings: ${error}`)
    }
  }

  const updateEditedField = (field: string, value: string) => {
    console.log('[v0] Field updated:', field, '=', value)
    setEditedSuggestions((prev: any) => ({ ...prev, [field]: value }))
  }

  const STYLE_OPTIONS = [
    "3D Render", "Anime", "Cartoon Saloon", "Cartoon Style", "Comic Book", 
    "Disney Modern 3D", "Kyoto Animation", "Laika", "Makoto Shinkai", 
    "Oil Painting", "Pencil Sketch", "PhotoReal", "Pixar", "Realistic", 
    "Sketch", "Sony Spider-Verse", "Studio Ghibli", "Studio Trigger", 
    "Ufotable", "Watercolor"
  ]

  const ASPECT_RATIO_OPTIONS = [
    { value: "1:1", label: "1:1 Square" },
    { value: "16:9", label: "16:9 Landscape" },
    { value: "9:16", label: "9:16 Portrait" },
    { value: "4:3", label: "4:3 Classic" },
    { value: "3:4", label: "3:4 Portrait" },
  ]

  const CAMERA_ANGLE_OPTIONS = [
    "None", "eye-level", "low-angle", "high-angle", "bird's-eye", "dutch-angle"
  ]

  const CAMERA_LENS_OPTIONS = [
    "None", "wide-angle", "telephoto", "macro", "fisheye"
  ]

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-zinc-900 border-l border-[#c99850]/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#c99850]/30">
        <h3 className="text-lg font-bold text-[#c99850]">AI Prompt Helper</h3>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (confirm('Clear all AI Helper messages? This will remove all chat history.')) {
                await clearHistory()
              }
            }}
            className="p-2 hover:bg-zinc-800 rounded transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4 text-[#c99850]" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-[#c99850]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-zinc-500 text-sm mt-8">
            <p className="mb-2">≡ƒæï Hi! I'm your AI prompt assistant.</p>
            <p>
              Tell me what image you want to create and I'll help you craft the perfect prompt with optimal camera
              settings. You can also upload images to help me understand your vision better.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  msg.role === 'user' ? 'bg-[#c99850] text-black' : 'bg-zinc-800 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>

            {/* Suggestion Card */}
            {msg.suggestions && (
              <div className="mt-2 bg-zinc-800 border border-[#c99850]/30 rounded-lg p-3 space-y-2">
                {idx === messages.filter(m => m.suggestions).length - 1 && messages.filter(m => m.suggestions).length > 1 && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#c99850]/20">
                    <span className="px-2 py-1 text-xs font-bold bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black rounded">
                      LATEST
                    </span>
                    <span className="text-xs text-zinc-400">Most recent suggestions</span>
                  </div>
                )}
                {editingIndex === idx ? (
                  <>
                    {/* Editable Prompt */}
                    <div>
                      <label className="text-xs font-bold text-[#c99850] block mb-1">Prompt:</label>
                      <textarea
                        value={editedSuggestions.prompt || ''}
                        onChange={(e) => updateEditedField('prompt', e.target.value)}
                        className="w-full px-2 py-1.5 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Editable Negative Prompt */}
                    <div>
                      <label className="text-xs font-bold text-[#c99850] block mb-1">Negative Prompt:</label>
                      <textarea
                        value={editedSuggestions.negativePrompt || ''}
                        onChange={(e) => updateEditedField('negativePrompt', e.target.value)}
                        className="w-full px-2 py-1.5 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white resize-none"
                        rows={2}
                      />
                    </div>

                    {/* Editable Settings Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#c99850]/20">
                      <div>
                        <label className="text-xs font-bold text-[#c99850] block mb-1">Style:</label>
                        <select
                          value={editedSuggestions.style || '3D Render'}
                          onChange={(e) => updateEditedField('style', e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white"
                        >
                          {STYLE_OPTIONS.map(style => (
                            <option key={style} value={style}>{style}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#c99850] block mb-1">Aspect Ratio:</label>
                        <select
                          value={editedSuggestions.aspectRatio || '1:1'}
                          onChange={(e) => updateEditedField('aspectRatio', e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white"
                        >
                          {ASPECT_RATIO_OPTIONS.map(ratio => (
                            <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#c99850] block mb-1">Camera Angle:</label>
                        <select
                          value={editedSuggestions.cameraAngle || 'None'}
                          onChange={(e) => updateEditedField('cameraAngle', e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white"
                        >
                          {CAMERA_ANGLE_OPTIONS.map(angle => (
                            <option key={angle} value={angle}>{angle}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#c99850] block mb-1">Camera Lens:</label>
                        <select
                          value={editedSuggestions.cameraLens || 'None'}
                          onChange={(e) => updateEditedField('cameraLens', e.target.value)}
                          className="w-full px-2 py-1 bg-zinc-900 border border-[#c99850]/30 rounded text-xs text-white"
                        >
                          {CAMERA_LENS_OPTIONS.map(lens => (
                            <option key={lens} value={lens}>{lens}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Edit Mode Actions */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditSave(idx)}
                        className="flex-1 px-3 py-1.5 bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black text-xs font-bold rounded hover:from-[#dbb56e] hover:to-[#f4d698] transition-all"
                      >
                        Apply Changes
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="px-3 py-1.5 bg-zinc-700 text-white text-xs font-bold rounded hover:bg-zinc-600 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#c99850]">Prompt:</label>
                        <button
                          onClick={() => handleCopy(msg.suggestions!.prompt, `prompt-${idx}`)}
                          className="text-[#c99850] hover:text-[#dbb56e] transition-colors"
                          title="Copy prompt"
                        >
                          {copiedField === `prompt-${idx}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-300">{msg.suggestions.prompt}</p>
                    </div>

                    {/* Negative Prompt */}
                    {msg.suggestions.negativePrompt && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#c99850]">Negative Prompt:</label>
                          <button
                            onClick={() => handleCopy(msg.suggestions!.negativePrompt!, `neg-${idx}`)}
                            className="text-[#c99850] hover:text-[#dbb56e] transition-colors"
                            title="Copy negative prompt"
                          >
                            {copiedField === `neg-${idx}` ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-300">{msg.suggestions.negativePrompt}</p>
                      </div>
                    )}

                    {/* Settings Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#c99850]/20">
                      <div>
                        <label className="text-xs font-bold text-[#c99850]">Style:</label>
                        <p className="text-xs text-zinc-300">{msg.suggestions.style}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#c99850]">Aspect Ratio:</label>
                        <p className="text-xs text-zinc-300">{msg.suggestions.aspectRatio || '1:1'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#c99850]">Camera Angle:</label>
                        <p className="text-xs text-zinc-300">{msg.suggestions.cameraAngle}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#c99850]">Camera Lens:</label>
                        <p className="text-xs text-zinc-300">{msg.suggestions.cameraLens}</p>
                      </div>
                    </div>

                    {/* Edit and Apply buttons */}
                    {onApplySuggestions && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditStart(idx, msg.suggestions)}
                          className="flex-1 px-3 py-1.5 bg-zinc-700 text-white text-xs font-bold rounded hover:bg-zinc-600 transition-all flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit Settings
                        </button>
                        <button
                          onClick={() => handleApplyClick(msg.suggestions, idx)}
                          className="flex-1 px-3 py-1.5 bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black text-xs font-bold rounded hover:from-[#dbb56e] hover:to-[#f4d698] transition-all"
                        >
                          Apply All
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#c99850] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#c99850] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#c99850] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="px-4 py-2 border-t border-[#c99850]/30 bg-zinc-950">
          <div className="flex gap-2 overflow-x-auto">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative shrink-0 w-16 h-16 rounded overflow-hidden border border-[#c99850]/30">
                <img src={img || "/placeholder.svg"} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[#c99850]/30">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            title="Upload image"
          >
            <ImageIcon className="w-4 h-4 text-[#c99850]" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Describe your image idea... (Shift+Enter for new line, Enter to send)"
            className="flex-1 px-3 py-2 bg-zinc-800 border border-[#c99850]/30 rounded text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none min-h-[80px]"
            disabled={isLoading}
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && uploadedImages.length === 0)}
            className="p-2 bg-linear-to-r from-[#c99850] to-[#dbb56e] hover:from-[#dbb56e] hover:to-[#f4d698] rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            <Send className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  )
}
