"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Sparkles, Type, Palette, Layout, Layers, Wand2, Image as ImageIcon, Paintbrush } from 'lucide-react'
import {
  DotMatrixConfig,
  DEFAULT_DOT_MATRIX_CONFIG,
  DOT_SIZE_OPTIONS,
  DOT_SPACING_OPTIONS,
  DOT_SHAPE_OPTIONS,
  PATTERN_STYLE_OPTIONS,
  PATTERN_COVERAGE_OPTIONS,
  TEXT_COLOR_PRESETS,
  DOT_COLOR_PRESETS,
  BACKGROUND_OPTIONS,
  METALLIC_FINISH_OPTIONS,
  FONT_STYLE_OPTIONS,
  TEXT_WEIGHT_OPTIONS,
  LETTER_SPACING_OPTIONS,
  TEXT_CASE_OPTIONS,
  BRAND_POSITION_OPTIONS,
  LOGO_ORIENTATION_OPTIONS,
  SWOOSH_STYLE_OPTIONS,
  SWOOSH_POSITION_OPTIONS,
  SPARKLE_OPTIONS,
  SHADOW_STYLE_OPTIONS,
  DEPTH_LEVEL_OPTIONS,
  LIGHTING_OPTIONS,
  BEVEL_OPTIONS,
  PERSPECTIVE_OPTIONS,
  ICON_STYLE_OPTIONS,
  INDUSTRY_PRESETS,
  ColorOption,
} from '../../constants/dot-matrix-config'
import { buildDotMatrixPrompt, buildDotMatrixNegativePrompt, buildPromptPreview } from '../../utils/dot-matrix-prompt-builder'
import { GOLD_GRADIENT } from '../../constants/logo-constants'

// NEW COMPONENTS
import { FancyFontGrid } from './FancyFontGrid'
import { LetterColorPicker, LetterColorConfig } from './LetterColorPicker'
import { MaterialSelector, MaterialType } from './MaterialSelector'
import { ExpandedColorPicker } from './ExpandedColorPicker'
import { DepthSlider, DepthLevel } from './DepthSlider'
import { TextEffectsPanel, TextOutline, GlowEffect, TextTexture, LetterEffect } from './TextEffectsPanel'
import { IconSelector, IconStyle as ExtendedIconStyle, IconPosition } from './IconSelector'

interface DotMatrixConfiguratorProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (prompt: string, negativePrompt: string) => void
}

export function DotMatrixConfigurator({ isOpen, onClose, onGenerate }: DotMatrixConfiguratorProps) {
  const [config, setConfig] = useState<DotMatrixConfig>(DEFAULT_DOT_MATRIX_CONFIG)

  const updateConfig = useCallback(<K extends keyof DotMatrixConfig>(
    key: K,
    value: DotMatrixConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  // Toggle function: if current value equals clicked value, set to null; otherwise set to clicked value
  const toggleConfig = useCallback(<K extends keyof DotMatrixConfig>(
    key: K,
    value: DotMatrixConfig[K]
  ) => {
    setConfig(prev => {
      const currentVal = prev[key]
      // For ColorOption objects, compare by value property
      if (currentVal && typeof currentVal === 'object' && 'value' in currentVal &&
          value && typeof value === 'object' && 'value' in value) {
        return { ...prev, [key]: (currentVal as ColorOption).value === (value as ColorOption).value ? null : value }
      }
      // For primitive values
      return { ...prev, [key]: currentVal === value ? null : value }
    })
  }, [])

  const applyIndustryPreset = useCallback((presetId: string) => {
    const preset = INDUSTRY_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setConfig(prev => ({ ...prev, ...preset.config }))
    }
  }, [])

  const handleGenerate = () => {
    if (!config.brandName.trim()) return
    const prompt = buildDotMatrixPrompt(config)
    const negativePrompt = buildDotMatrixNegativePrompt(config)
    onGenerate(prompt, negativePrompt)
    onClose()
  }

  const handleReset = () => {
    setConfig({ ...DEFAULT_DOT_MATRIX_CONFIG })
  }

  const previewText = buildPromptPreview(config)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[960px] w-[60vw] max-h-[90vh] flex flex-col overflow-hidden bg-zinc-900 border-zinc-700 text-white p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <span className="text-xl">⚫</span>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">Dot Matrix 3D Configurator</DialogTitle>
                <p className="text-xs text-zinc-400 mt-0.5">Design your perfect halftone logo</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <Tabs defaultValue="brand" className="w-full">
            <TabsList className="w-full px-4 bg-zinc-900/50 border-b border-zinc-800 rounded-none justify-start gap-1 h-auto py-2 sticky top-0 z-10 flex-wrap">
              <TabsTrigger value="brand" className="data-[state=active]:bg-zinc-800 text-xs px-3 py-1.5 gap-1.5">
                <Type className="w-3.5 h-3.5" /> Brand
              </TabsTrigger>
              <TabsTrigger value="dots" className="data-[state=active]:bg-zinc-800 text-xs px-3 py-1.5 gap-1.5">
                <span className="text-sm">⚫</span> Dots
              </TabsTrigger>
              <TabsTrigger value="colors" className="data-[state=active]:bg-zinc-800 text-xs px-3 py-1.5 gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Colors
              </TabsTrigger>
              <TabsTrigger value="typography" className="data-[state=active]:bg-zinc-800 text-xs px-3 py-1.5 gap-1.5">
                <Type className="w-3.5 h-3.5" /> Fonts
              </TabsTrigger>
              <TabsTrigger value="materials" className="data-[state=active]:bg-zinc-800 text-xs px-3 py-1.5 gap-1.5">
                <Paintbrush className="w-3.5 h-3.5" /> Materials
              </TabsTrigger>
              <TabsTrigger value="layout" className="data-[state=active]:bg-zinc-800 text-xs px-3 py-1.5 gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Icons
              </TabsTrigger>
              <TabsTrigger value="effects" className="data-[state=active]:bg-zinc-800 text-xs px-3 py-1.5 gap-1.5">
                <Layers className="w-3.5 h-3.5" /> 3D/FX
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-zinc-800 text-xs px-3 py-1.5 gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Advanced
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* BRAND TAB */}
              <TabsContent value="brand" className="mt-0 space-y-6">
                {/* Industry Quick Presets */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    Industry Quick Start
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRY_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyIndustryPreset(preset.id)}
                        className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{preset.icon}</span>
                          <div>
                            <div className="text-xs font-medium text-white">{preset.name}</div>
                            <div className="text-[10px] text-zinc-500">{preset.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Brand Name *</label>
                  <Input
                    value={config.brandName}
                    onChange={(e) => updateConfig('brandName', e.target.value)}
                    placeholder="Enter your brand name..."
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-11"
                  />
                </div>

                {/* Tagline */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Tagline (optional)</label>
                  <Input
                    value={config.tagline}
                    onChange={(e) => updateConfig('tagline', e.target.value)}
                    placeholder='e.g., "Let us connect the dots"'
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                {/* Use Initials Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateConfig('useInitials', !config.useInitials)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      config.useInitials ? 'bg-purple-600' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        config.useInitials ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <div>
                    <span className="text-sm text-zinc-300">Use Initials Only</span>
                    <p className="text-xs text-zinc-500">
                      Show "{config.brandName.split(/\s+/).map(w => w.charAt(0).toUpperCase()).join('')}" instead of full name
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* DOTS TAB */}
              <TabsContent value="dots" className="mt-0 space-y-6">
                {/* Dot Size */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Dot Size</label>
                  <div className="flex flex-wrap gap-2">
                    {DOT_SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('dotSize', opt.value)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          config.dotSize === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        <div className="text-xs font-medium">{opt.label}</div>
                        <div className="text-[10px] text-zinc-500">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dot Spacing */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Dot Spacing</label>
                  <div className="flex flex-wrap gap-2">
                    {DOT_SPACING_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('dotSpacing', opt.value)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          config.dotSpacing === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        <div className="text-xs font-medium">{opt.label}</div>
                        <div className="text-[10px] text-zinc-500">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dot Shape */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Dot Shape</label>
                  <div className="flex gap-2">
                    {DOT_SHAPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('dotShape', opt.value)}
                        className={`px-4 py-3 rounded-lg border transition-colors flex flex-col items-center ${
                          config.dotShape === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        <span className="text-xl mb-1">{opt.icon}</span>
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pattern Style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Pattern Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PATTERN_STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('patternStyle', opt.value)}
                        className={`px-3 py-2 rounded-lg border transition-colors text-left ${
                          config.patternStyle === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        <div className="text-xs font-medium">{opt.label}</div>
                        <div className="text-[10px] text-zinc-500">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pattern Coverage */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Pattern Coverage</label>
                  <div className="flex flex-wrap gap-2">
                    {PATTERN_COVERAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('patternCoverage', opt.value)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                          config.patternCoverage === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dot Gradient Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateConfig('dotGradient', !config.dotGradient)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      config.dotGradient ? 'bg-purple-600' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        config.dotGradient ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-zinc-300">Dot Gradient (dots fade from large to small)</span>
                </div>
              </TabsContent>

              {/* COLORS TAB */}
              <TabsContent value="colors" className="mt-0 space-y-6">
                {/* Per-Letter Color Picker - NEW */}
                <LetterColorPicker
                  brandName={config.brandName}
                  letterColors={config.letterColors}
                  onLetterColorsChange={(colors) => updateConfig('letterColors', colors)}
                />

                {/* Expanded Dot Color Picker - NEW */}
                <ExpandedColorPicker
                  label="Dot Matrix Color"
                  selectedColor={config.dotColor}
                  onSelectColor={(color) => updateConfig('dotColor', color)}
                  customColor={config.customDotColor}
                  onCustomColorChange={(hex) => updateConfig('customDotColor', hex)}
                  showCustomInput={true}
                />

                {/* Text/Metallic Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Text Metallic Finish</label>
                  <div className="flex flex-wrap gap-2">
                    {METALLIC_FINISH_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('metallicFinish', opt.value)}
                        className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                          config.metallicFinish === opt.value
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-zinc-600"
                          style={{ background: `linear-gradient(135deg, ${opt.color} 0%, #fff 50%, ${opt.color} 100%)` }}
                        />
                        <span className="text-xs text-white">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <ExpandedColorPicker
                  label="Accent Color (sparkles, highlights)"
                  selectedColor={config.accentColor}
                  onSelectColor={(color) => updateConfig('accentColor', color)}
                  showCustomInput={false}
                />

                {/* Background */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Background</label>
                  <div className="flex flex-wrap gap-2">
                    {BACKGROUND_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('backgroundColor', opt.value)}
                        className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                          config.backgroundColor === opt.value
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded border border-zinc-600"
                          style={{
                            background: opt.value === 'transparent'
                              ? `repeating-conic-gradient(#404040 0% 25%, #606060 0% 50%) 50%/8px 8px`
                              : opt.preview
                          }}
                        />
                        <span className="text-xs text-white">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* TYPOGRAPHY TAB - Enhanced with Fancy Fonts */}
              <TabsContent value="typography" className="mt-0 space-y-6">
                {/* Fancy Font Grid - NEW */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Type className="w-4 h-4 text-purple-400" />
                    Fancy Font Styles
                  </label>
                  <FancyFontGrid
                    brandName={config.brandName || 'BRAND'}
                    selectedFont={config.fancyFontId}
                    onSelectFont={(fontId) => updateConfig('fancyFontId', fontId)}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-700 pt-4">
                  <p className="text-xs text-zinc-500 mb-4">Additional Typography Options</p>
                </div>

                {/* Text Weight */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Text Weight</label>
                  <div className="flex gap-2">
                    {TEXT_WEIGHT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('textWeight', opt.value)}
                        className={`px-4 py-2 rounded-lg border text-xs transition-colors ${
                          config.textWeight === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter Spacing */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Letter Spacing</label>
                  <div className="flex gap-2">
                    {LETTER_SPACING_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('letterSpacing', opt.value)}
                        className={`px-4 py-2 rounded-lg border text-xs transition-colors ${
                          config.letterSpacing === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Case */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Text Case</label>
                  <div className="flex gap-2">
                    {TEXT_CASE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('textCase', opt.value)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          config.textCase === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        <div className="text-xs font-medium">{opt.label}</div>
                        <div className="text-[10px] text-zinc-500">{opt.example}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* MATERIALS TAB - NEW */}
              <TabsContent value="materials" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 text-purple-400" />
                    Material / Surface Type
                  </label>
                  <p className="text-xs text-zinc-500">
                    Choose the surface material for your logo text
                  </p>
                </div>

                <MaterialSelector
                  selectedMaterial={config.materialType as MaterialType | null}
                  onSelectMaterial={(material) => updateConfig('materialType', material)}
                />
              </TabsContent>

              {/* LAYOUT/ICONS TAB - Renamed to Icons */}
              <TabsContent value="layout" className="mt-0 space-y-6">
                {/* Icon Selector - NEW */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    Icon / Symbol Integration
                  </label>
                  <p className="text-xs text-zinc-500">
                    Add an icon or symbol to your logo
                  </p>
                </div>

                <IconSelector
                  selectedIcon={config.extendedIconStyle as ExtendedIconStyle | null}
                  selectedPosition={config.iconPosition as IconPosition | null}
                  onIconChange={(icon) => updateConfig('extendedIconStyle', icon)}
                  onPositionChange={(position) => updateConfig('iconPosition', position)}
                />

                {/* Divider */}
                <div className="border-t border-zinc-700 pt-4">
                  <p className="text-xs text-zinc-500 mb-4">Layout Options</p>
                </div>

                {/* Logo Orientation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Logo Orientation</label>
                  <div className="flex gap-2">
                    {LOGO_ORIENTATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('logoOrientation', opt.value)}
                        className={`px-4 py-2 rounded-lg border text-xs transition-colors ${
                          config.logoOrientation === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tilt Angle Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-300">Tilt Angle</label>
                    <span className="text-xs text-zinc-500">{config.tiltAngle}°</span>
                  </div>
                  <Slider
                    value={[config.tiltAngle]}
                    onValueChange={(v: number[]) => updateConfig('tiltAngle', v[0])}
                    min={-30}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>-30° (left)</span>
                    <span>0° (straight)</span>
                    <span>+30° (right)</span>
                  </div>
                </div>
              </TabsContent>

              {/* EFFECTS TAB - Enhanced with DepthSlider */}
              <TabsContent value="effects" className="mt-0 space-y-6">
                {/* 3D Depth Slider - NEW */}
                <DepthSlider
                  depthAmount={config.depthAmount}
                  onDepthChange={(amount) => updateConfig('depthAmount', amount)}
                  depthLevel={config.depthLevel as DepthLevel | null}
                  onDepthLevelChange={(level) => updateConfig('depthLevel', level)}
                />

                {/* Lighting Direction */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Lighting Direction</label>
                  <div className="flex gap-2">
                    {LIGHTING_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('lightingDirection', opt.value)}
                        className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                          config.lightingDirection === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-xs">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bevel Style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Bevel Style</label>
                  <div className="flex gap-2">
                    {BEVEL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('bevelStyle', opt.value)}
                        className={`px-4 py-2 rounded-lg border text-xs transition-colors ${
                          config.bevelStyle === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Perspective */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Perspective</label>
                  <div className="flex gap-2">
                    {PERSPECTIVE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('perspective', opt.value)}
                        className={`px-4 py-2 rounded-lg border text-xs transition-colors ${
                          config.perspective === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sparkle Intensity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Sparkle Effects</label>
                  <div className="flex gap-2">
                    {SPARKLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('sparkleIntensity', opt.value)}
                        className={`px-4 py-2 rounded-lg border text-xs transition-colors ${
                          config.sparkleIntensity === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shadow Style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Shadow</label>
                  <div className="flex flex-wrap gap-2">
                    {SHADOW_STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('shadowStyle', opt.value)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                          config.shadowStyle === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reflection Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateConfig('hasReflection', !config.hasReflection)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      config.hasReflection ? 'bg-purple-600' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        config.hasReflection ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-zinc-300">Mirror Reflection</span>
                </div>
              </TabsContent>

              {/* ADVANCED TAB - NEW */}
              <TabsContent value="advanced" className="mt-0 space-y-6">
                {/* Text Effects Panel - NEW */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Text Effects
                  </label>
                  <p className="text-xs text-zinc-500">
                    Add outlines, glow, textures, and special letter effects
                  </p>
                </div>

                <TextEffectsPanel
                  textOutline={config.textOutline as TextOutline | null}
                  glowEffect={config.glowEffect as GlowEffect | null}
                  textTexture={config.textTexture as TextTexture | null}
                  letterEffect={config.letterEffect as LetterEffect | null}
                  glowIntensity={config.glowIntensity}
                  onTextOutlineChange={(outline) => updateConfig('textOutline', outline)}
                  onGlowEffectChange={(glow) => updateConfig('glowEffect', glow)}
                  onTextTextureChange={(texture) => updateConfig('textTexture', texture)}
                  onLetterEffectChange={(effect) => updateConfig('letterEffect', effect)}
                  onGlowIntensityChange={(intensity) => updateConfig('glowIntensity', intensity)}
                />

                {/* Divider */}
                <div className="border-t border-zinc-700 pt-4">
                  <p className="text-xs text-zinc-500 mb-4">Decorative Elements</p>
                </div>

                {/* Swoosh Style */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Swoosh / Arc Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SWOOSH_STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleConfig('swooshStyle', opt.value)}
                        className={`px-3 py-2 rounded-lg border transition-colors text-left ${
                          config.swooshStyle === opt.value
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                      >
                        <div className="text-xs font-medium">{opt.label}</div>
                        <div className="text-[10px] text-zinc-500">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Swoosh Position */}
                {config.swooshStyle && config.swooshStyle !== 'none' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Swoosh Position</label>
                    <div className="flex flex-wrap gap-2">
                      {SWOOSH_POSITION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleConfig('swooshPosition', opt.value)}
                          className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                            config.swooshPosition === opt.value
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer with Preview & Actions */}
        <div className="border-t border-zinc-800 px-6 py-4 bg-zinc-900/80 shrink-0">
          {/* Settings Preview */}
          <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
            <div className="text-[10px] text-zinc-500 mb-1">Preview Summary</div>
            <div className="text-xs text-zinc-300">{previewText}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-zinc-400 hover:text-white"
            >
              Reset to Defaults
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!config.brandName.trim()}
                className="px-6 font-semibold text-black disabled:opacity-50"
                style={{ background: GOLD_GRADIENT }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Logo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
