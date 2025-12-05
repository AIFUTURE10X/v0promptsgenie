"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Upload, Wand2, Settings, Check, ImageIcon, Loader2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AnalysisModeSelector } from './AnalysisModeSelector'
import { ToolbarHintBar } from './ToolbarHintBar'
import { useState } from 'react'

interface ToolbarProps {
  showUploadSection: boolean
  onToggleUpload: () => void
  analysisMode: 'fast' | 'quality'
  onAnalysisModeChange: (mode: 'fast' | 'quality') => void
  imageCount: number
  onImageCountChange: (count: number) => void
  aspectRatio: string
  onAspectRatioChange: (ratio: string) => void
  ratiosPopoverOpen: boolean
  onRatiosPopoverOpenChange: (open: boolean) => void
  selectedStylePreset: string
  onStylePresetChange: (style: string) => void
  stylePopoverOpen: boolean
  onStylePopoverOpenChange: (open: boolean) => void
  stylePresets: Array<{
    value: string
    label: string
    thumbnail: string
    description: string
  }>
  onGenerate: () => void
  isGenerating?: boolean
  selectedCameraAngle: string
  onCameraAngleChange: (angle: string) => void
  selectedCameraLens: string
  onCameraLensChange: (lens: string) => void
  styleStrength: 'subtle' | 'moderate' | 'strong'
  onStyleStrengthChange: (strength: 'subtle' | 'moderate' | 'strong') => void
}

export function ImageStudioToolbar({
  showUploadSection,
  onToggleUpload,
  analysisMode,
  onAnalysisModeChange,
  imageCount,
  onImageCountChange,
  aspectRatio,
  onAspectRatioChange,
  ratiosPopoverOpen,
  onRatiosPopoverOpenChange,
  selectedStylePreset,
  onStylePresetChange,
  stylePopoverOpen,
  onStylePopoverOpenChange,
  stylePresets,
  onGenerate,
  isGenerating = false,
  selectedCameraAngle,
  onCameraAngleChange,
  selectedCameraLens,
  onCameraLensChange,
  styleStrength,
  onStyleStrengthChange,
}: ToolbarProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  return (
    <>
      <ToolbarHintBar hoveredButton={hoveredButton} onHoverChange={setHoveredButton} />
      
      <TooltipProvider>
        <div className="flex gap-2 mb-3 p-1 bg-zinc-900 rounded-lg border border-zinc-800 flex-wrap">
          {/* 1. Upload Button */}
          <Button
            onClick={onToggleUpload}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              showUploadSection
                ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black'
                : 'bg-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>

          <div className="w-px bg-zinc-700 mx-2" />

          {/* Analysis Mode Selector */}
          <AnalysisModeSelector mode={analysisMode} onChange={onAnalysisModeChange} />

          <div className="w-px bg-zinc-700 mx-2" />

          <div className="flex items-center gap-2 px-4">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Images:</span>
            <div className="flex gap-1">
              <button
                onClick={() => onImageCountChange(1)}
                className={`w-8 h-8 rounded-md text-sm font-bold transition-colors ${
                  imageCount === 1
                    ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                1
              </button>
              <button
                onClick={() => onImageCountChange(2)}
                className={`w-8 h-8 rounded-md text-sm font-bold transition-colors ${
                  imageCount === 2
                    ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                2
              </button>
            </div>
          </div>

          <div className="w-px bg-zinc-700 mx-2" />

          {/* 3. Aspect Ratios Dropdown */}
          <Popover open={ratiosPopoverOpen} onOpenChange={onRatiosPopoverOpenChange}>
            <PopoverTrigger asChild>
              <Button className="px-6 py-3 font-medium flex items-center gap-2 bg-transparent text-zinc-400 hover:text-white">
                <ImageIcon className="w-4 h-4" />
                Ratios: {aspectRatio}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              side="bottom"
              align="center" 
              sideOffset={12}
              avoidCollisions={false}
              className="w-[600px] bg-zinc-900 border-zinc-800 p-3"
            >
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-[#c99850]">Aspect Ratios:</h3>
                <p className="text-xs text-white/60 mt-1">Current: {aspectRatio}</p>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { value: '1:1', label: '1:1', description: 'Square' },
                  { value: '16:9', label: '16:9', description: 'Landscape' },
                  { value: '9:16', label: '9:16', description: 'Portrait' },
                  { value: '4:3', label: '4:3', description: 'Standard' },
                  { value: '3:4', label: '3:4', description: 'Portrait' },
                  { value: '3:2', label: '3:2', description: 'Photo' },
                  { value: '2:3', label: '2:3', description: 'Portrait' },
                  { value: '21:9', label: '21:9', description: 'Cinematic' },
                  { value: '5:4', label: '5:4', description: 'Classic' },
                  { value: '4:5', label: '4:5', description: 'Instagram' },
                ].map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => {
                      onAspectRatioChange(ratio.value)
                      onRatiosPopoverOpenChange(false)
                    }}
                    className={`relative group rounded-lg overflow-hidden border transition-all p-3 ${
                      aspectRatio === ratio.value
                        ? 'border-[#c99850] bg-[#c99850]/10 border-2'
                        : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1.5">
                      <div 
                        className={`border-2 ${
                          aspectRatio === ratio.value 
                            ? 'border-[#c99850]' 
                            : 'border-white/30'
                        }`}
                        style={{
                          width: ratio.value === '9:16' || ratio.value === '3:4' || ratio.value === '2:3' || ratio.value === '4:5' ? '20px' : ratio.value === '21:9' ? '42px' : '34px',
                          height: ratio.value === '16:9' || ratio.value === '4:3' || ratio.value === '3:2' || ratio.value === '5:4' ? '20px' : ratio.value === '21:9' ? '18px' : '34px',
                        }}
                      />
                    </div>
                    <div className={`text-xs font-bold mb-0.5 ${
                      aspectRatio === ratio.value
                        ? 'text-[#c99850]'
                        : 'text-white'
                    }`}>
                      {ratio.label}
                    </div>
                    <div className="text-[10px] text-white/50">
                      {ratio.description}
                    </div>
                    {aspectRatio === ratio.value && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#c99850] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-black" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px bg-zinc-700 mx-2" />

          {/* 4. Image Styles Popover with Grid */}
          <Popover open={stylePopoverOpen} onOpenChange={onStylePopoverOpenChange}>
            <PopoverTrigger asChild>
              <Button 
                className="px-6 py-3 font-medium flex items-center gap-2 bg-transparent text-zinc-400 hover:text-white"
                onMouseEnter={() => setHoveredButton('style')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <Sparkles className="w-4 h-4" />
                Style: {selectedStylePreset}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              side="bottom"
              align="center" 
              sideOffset={12}
              alignOffset={0}
              avoidCollisions={false}
              className="w-[760px] bg-zinc-950 border-zinc-800 p-4"
            >
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-zinc-400 mb-2">Style:</h3>
                <input
                  type="text"
                  value={selectedStylePreset}
                  readOnly
                  className="w-full px-3 py-2 bg-zinc-900 border border-[#c99850]/30 rounded text-[#c99850] text-sm focus:outline-none focus:ring-1 focus:ring-[#c99850]"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {stylePresets.map((preset) => (
                  <Tooltip key={preset.value} delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          onStylePresetChange(preset.value)
                          onStylePopoverOpenChange(false)
                        }}
                        className={`relative rounded-lg overflow-hidden transition-all min-h-[75px] ${
                          selectedStylePreset === preset.value
                            ? 'bg-linear-to-br from-[#c99850] to-[#b8923d] ring-2 ring-[#c99850]'
                            : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800'
                        }`}
                      >
                        <div className={`px-3 py-3 text-left ${
                          selectedStylePreset === preset.value
                            ? 'text-black'
                            : 'text-[#c99850]'
                        }`}>
                          <div className="text-sm font-semibold leading-tight wrap-break-word">
                            {preset.label}
                          </div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    
                    <TooltipContent 
                      side="right" 
                      className="bg-black border-2 border-[#c99850] p-3 max-w-[280px]"
                      sideOffset={10}
                    >
                      <div className="space-y-2">
                        {/* Preview Image */}
                        <img 
                          src={preset.thumbnail || `/placeholder.svg?height=90&width=120&query=${encodeURIComponent(preset.label + ' art style example')}`}
                          alt={preset.label}
                          className="w-full h-[90px] object-cover rounded border border-[#c99850]/30"
                        />
                        
                        {/* Style Title */}
                        <div className="text-[#c99850] text-sm font-bold">
                          {preset.label}
                        </div>
                        
                        {/* Description */}
                        {preset.description && (
                          <div className="text-zinc-300 text-xs leading-relaxed">
                            {preset.description}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px bg-zinc-700 mx-2" />

          {/* 5. Generate Button */}
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`px-6 py-3 font-medium flex items-center gap-2 bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black hover:from-[#dbb56e] hover:to-[#c99850] transition-all ${
              isGenerating ? 'animate-pulse cursor-not-allowed opacity-80' : ''
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate
              </>
            )}
          </Button>

          <div className="w-px bg-zinc-700 mx-2" />

          {/* 6. Advanced Settings Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                className="px-6 py-3 font-medium flex items-center gap-2 bg-transparent text-zinc-400 hover:text-white"
                onMouseEnter={() => setHoveredButton('advanced')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <Settings className="w-4 h-4" />
                Advanced
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[800px] bg-zinc-900 border-zinc-800 p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#c99850]">Advanced Settings</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#c99850] mb-2 block">
                      Camera Angle (optional)
                    </label>
                    <select
                      value={selectedCameraAngle}
                      onChange={(e) => onCameraAngleChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs bg-zinc-800 text-white border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/30"
                    >
                      <option value="">None</option>
                      <option value="Eye-level shot">Eye-level shot</option>
                      <option value="Low-angle shot">Low-angle shot</option>
                      <option value="High-angle shot">High-angle shot</option>
                      <option value="Aerial view">Aerial view</option>
                      <option value="Dutch angle">Dutch angle</option>
                      <option value="Over-the-shoulder shot">Over-the-shoulder</option>
                      <option value="Point-of-view shot">Point-of-view</option>
                      <option value="Bird's-eye view">Bird's-eye view</option>
                      <option value="Worm's-eye view">Worm's-eye view</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-[#c99850] mb-2 block">
                      Camera Lens (optional)
                    </label>
                    <select
                      value={selectedCameraLens}
                      onChange={(e) => onCameraLensChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs bg-zinc-800 text-white border border-[#c99850]/30 focus:outline-none focus:ring-2 focus:ring-[#c99850]/30"
                    >
                      <option value="">None</option>
                      <option value="14mm ultra-wide">14mm ultra-wide</option>
                      <option value="16mm fisheye">16mm fisheye</option>
                      <option value="24mm wide-angle">24mm wide-angle</option>
                      <option value="35mm standard">35mm standard</option>
                      <option value="50mm prime">50mm prime</option>
                      <option value="85mm portrait">85mm portrait</option>
                      <option value="135mm telephoto">135mm telephoto</option>
                      <option value="200mm super-telephoto">200mm super</option>
                      <option value="Macro lens">Macro lens</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#c99850] mb-2 block">
                    Style Strength
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onStyleStrengthChange('subtle')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                        styleStrength === 'subtle'
                          ? 'bg-[#c99850] text-black border-[#c99850]'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-[#c99850]/30'
                      }`}
                    >
                      Subtle
                    </button>
                    <button
                      onClick={() => onStyleStrengthChange('moderate')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                        styleStrength === 'moderate'
                          ? 'bg-[#c99850] text-black border-[#c99850]'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-[#c99850]/30'
                      }`}
                    >
                      Moderate
                    </button>
                    <button
                      onClick={() => onStyleStrengthChange('strong')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                        styleStrength === 'strong'
                          ? 'bg-[#c99850] text-black border-[#c99850]'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-[#c99850]/30'
                      }`}
                    >
                      Strong
                    </button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </TooltipProvider>
    </>
  )
}
