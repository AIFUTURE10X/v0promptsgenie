'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Download, Upload, FileSpreadsheet, Info, Plus, Trash2, ChevronDown, Zap, Edit3 } from 'lucide-react'

interface BatchPrompt {
  id: string
  text: string
}

interface BatchModePanelProps {
  isActive: boolean
  onBatchGenerate: (prompts: string[]) => void
}

export function BatchModePanel({ isActive, onBatchGenerate }: BatchModePanelProps) {
  const [showGuide, setShowGuide] = useState(true)
  const [prompts, setPrompts] = useState<BatchPrompt[]>([
    { id: '1', text: '' }
  ])

  if (!isActive) return null

  const validPrompts = prompts.filter(p => p.text.trim().length > 0)
  const maxPrompts = 20

  const handleAddPrompt = () => {
    if (prompts.length < maxPrompts) {
      setPrompts([...prompts, { id: Date.now().toString(), text: '' }])
    }
  }

  const handleRemovePrompt = (id: string) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter(p => p.id !== id))
    }
  }

  const handlePromptChange = (id: string, text: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, text } : p))
  }

  const handleClearAll = () => {
    setPrompts([{ id: '1', text: '' }])
  }

  const handleGenerateAll = () => {
    const validPromptTexts = prompts
      .map(p => p.text.trim())
      .filter(text => text.length > 0)
    
    if (validPromptTexts.length > 0) {
      onBatchGenerate(validPromptTexts)
    }
  }

  return (
    <div className="space-y-4 border border-border rounded-lg p-4 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground font-medium">Batch Mode</h3>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <Switch checked={isActive} disabled />
      </div>

      {/* Batch Mode Activated Banner */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-blue-400">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Batch Mode Activated</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="text-blue-400 hover:text-blue-300"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
            {showGuide ? 'Hide' : 'Show'} Guide
          </Button>
        </div>
        <p className="text-xs text-blue-300">
          💡 Enter multiple prompts below (max {maxPrompts}). Each prompt will generate 1 image(s).
        </p>
      </div>

      {/* Batch Tools */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-border text-foreground"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-xs mr-2">1</span>
          <Download className="h-4 w-4 mr-2" />
          Download Excel Template
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-border text-foreground"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-xs mr-2">2</span>
          <Upload className="h-4 w-4 mr-2" />
          Batch Upload Images
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-border text-foreground"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-xs mr-2">3</span>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Import Excel
        </Button>
      </div>

      {/* Advanced Settings Collapsed */}
      <details className="border-t border-border pt-4">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center justify-between">
          Advanced Settings
          <ChevronDown className="h-4 w-4" />
        </summary>
      </details>

      {/* Prompt Section */}
      <div className="space-y-4 border-t border-border pt-4">
        <h4 className="text-foreground font-medium">Prompt</h4>

        {/* Prompt Counter and Actions */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Batch Prompts ({validPrompts.length}/{maxPrompts} valid prompts)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPrompt}
              disabled={prompts.length >= maxPrompts}
              className="border-border text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Guide */}
        {showGuide && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <div className="flex gap-2">
              <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-300">How to use batch generation:</p>
                <ol className="text-xs text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Fill in the first prompt</li>
                  <li>Click "Add Prompt" button above to add more prompts (up to {maxPrompts})</li>
                  <li>Fill in all your prompts</li>
                  <li>Click "Generate All" to process all prompts concurrently</li>
                </ol>
                <p className="text-xs text-blue-400 mt-2">
                  Current: {validPrompts.length} valid prompts out of {prompts.length} total
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Inputs */}
        <div className="space-y-3">
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">
                  Prompt {index + 1}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  {prompts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePrompt(prompt.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                value={prompt.text}
                onChange={(e) => handlePromptChange(prompt.id, e.target.value)}
                placeholder={`Enter prompt ${index + 1}...`}
                className="min-h-20 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          ))}
        </div>

        {/* Generate All Button */}
        <Button
          onClick={handleGenerateAll}
          disabled={validPrompts.length === 0}
          className="w-full bg-amber-500 text-black hover:bg-amber-500/90"
        >
          Generate All ({validPrompts.length} {validPrompts.length === 1 ? 'prompt' : 'prompts'})
        </Button>
      </div>
    </div>
  )
}
