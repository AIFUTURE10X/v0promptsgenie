"use client"

import { useState } from 'react'
import { Sparkles, Circle, Sun, Layers } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

// ============================================
// TYPES
// ============================================

export type TextOutline = 'none' | 'thin' | 'medium' | 'thick' | 'double' | 'neon-glow' | 'shadow-outline'
export type GlowEffect = 'none' | 'subtle' | 'medium' | 'intense' | 'neon' | 'aura' | 'pulse' | 'rainbow'
export type TextTexture = 'smooth' | 'rough' | 'cracked' | 'distressed' | 'stippled' | 'brushed' | 'hammered'
export type LetterEffect = 'none' | 'stacked' | 'shadow-cascade' | '3d-block' | 'outline-fill' | 'gradient-fill' | 'split' | 'glitch'

// ============================================
// OPTIONS
// ============================================

export interface EffectOption<T> {
  id: T
  label: string
  description: string
  icon?: string
  promptDescription: string
}

export const TEXT_OUTLINE_OPTIONS: EffectOption<TextOutline>[] = [
  { id: 'none', label: 'None', description: 'No outline', promptDescription: '' },
  { id: 'thin', label: 'Thin', description: 'Subtle thin outline', icon: '◯', promptDescription: 'with thin outline border' },
  { id: 'medium', label: 'Medium', description: 'Visible outline', icon: '◎', promptDescription: 'with medium outline stroke' },
  { id: 'thick', label: 'Thick', description: 'Bold heavy outline', icon: '⬤', promptDescription: 'with thick bold outline' },
  { id: 'double', label: 'Double', description: 'Two-line outline', icon: '◉', promptDescription: 'with double outline border' },
  { id: 'neon-glow', label: 'Neon Glow', description: 'Glowing neon outline', icon: '💫', promptDescription: 'with glowing neon outline effect' },
  { id: 'shadow-outline', label: 'Shadow', description: 'Shadow as outline', icon: '🌑', promptDescription: 'with shadow outline effect' },
]

export const GLOW_EFFECT_OPTIONS: EffectOption<GlowEffect>[] = [
  { id: 'none', label: 'None', description: 'No glow', promptDescription: '' },
  { id: 'subtle', label: 'Subtle', description: 'Soft ambient glow', icon: '✧', promptDescription: 'with subtle soft glow' },
  { id: 'medium', label: 'Medium', description: 'Visible glow aura', icon: '✦', promptDescription: 'with medium glow aura' },
  { id: 'intense', label: 'Intense', description: 'Strong bright glow', icon: '✴', promptDescription: 'with intense bright glow' },
  { id: 'neon', label: 'Neon', description: 'Electric neon glow', icon: '💡', promptDescription: 'with electric neon glow effect' },
  { id: 'aura', label: 'Aura', description: 'Colorful aura halo', icon: '🔮', promptDescription: 'with colorful aura halo effect' },
  { id: 'pulse', label: 'Pulse', description: 'Pulsing energy glow', icon: '💫', promptDescription: 'with pulsing energy glow' },
  { id: 'rainbow', label: 'Rainbow', description: 'Multi-color glow', icon: '🌈', promptDescription: 'with rainbow multi-color glow' },
]

export const TEXT_TEXTURE_OPTIONS: EffectOption<TextTexture>[] = [
  { id: 'smooth', label: 'Smooth', description: 'Clean smooth surface', promptDescription: 'with smooth clean surface' },
  { id: 'rough', label: 'Rough', description: 'Rough textured surface', promptDescription: 'with rough textured surface' },
  { id: 'cracked', label: 'Cracked', description: 'Cracked aged look', promptDescription: 'with cracked aged texture' },
  { id: 'distressed', label: 'Distressed', description: 'Worn weathered look', promptDescription: 'with distressed weathered texture' },
  { id: 'stippled', label: 'Stippled', description: 'Dotted texture', promptDescription: 'with stippled dotted texture' },
  { id: 'brushed', label: 'Brushed', description: 'Brushed metal look', promptDescription: 'with brushed linear texture' },
  { id: 'hammered', label: 'Hammered', description: 'Hammered metal', promptDescription: 'with hammered metal texture' },
]

export const LETTER_EFFECT_OPTIONS: EffectOption<LetterEffect>[] = [
  { id: 'none', label: 'None', description: 'No special effect', promptDescription: '' },
  { id: 'stacked', label: 'Stacked', description: 'Layered stacked letters', icon: '📚', promptDescription: 'with stacked layered letter effect' },
  { id: 'shadow-cascade', label: 'Cascade', description: 'Cascading shadow layers', icon: '📉', promptDescription: 'with cascading shadow layers' },
  { id: '3d-block', label: '3D Block', description: 'Solid 3D block letters', icon: '🧊', promptDescription: 'with solid 3D block letter style' },
  { id: 'outline-fill', label: 'Outline Fill', description: 'Outlined with inner fill', icon: '⬜', promptDescription: 'with outline and inner fill' },
  { id: 'gradient-fill', label: 'Gradient', description: 'Gradient color fill', icon: '🌈', promptDescription: 'with gradient color fill' },
  { id: 'split', label: 'Split', description: 'Split/sliced letters', icon: '✂️', promptDescription: 'with split sliced letter effect' },
  { id: 'glitch', label: 'Glitch', description: 'Digital glitch effect', icon: '📺', promptDescription: 'with digital glitch distortion effect' },
]

// ============================================
// COMPONENT PROPS
// ============================================

interface TextEffectsPanelProps {
  textOutline: TextOutline | null
  glowEffect: GlowEffect | null
  textTexture: TextTexture | null
  letterEffect: LetterEffect | null
  glowIntensity: number // 0-100
  onTextOutlineChange: (outline: TextOutline | null) => void
  onGlowEffectChange: (glow: GlowEffect | null) => void
  onTextTextureChange: (texture: TextTexture | null) => void
  onLetterEffectChange: (effect: LetterEffect | null) => void
  onGlowIntensityChange: (intensity: number) => void
}

// ============================================
// COMPONENT
// ============================================

export function TextEffectsPanel({
  textOutline,
  glowEffect,
  textTexture,
  letterEffect,
  glowIntensity,
  onTextOutlineChange,
  onGlowEffectChange,
  onTextTextureChange,
  onLetterEffectChange,
  onGlowIntensityChange,
}: TextEffectsPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('outline')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handleOptionToggle = <T,>(
    currentValue: T | null,
    newValue: T,
    onChange: (value: T | null) => void,
    noneValue: T
  ) => {
    if (currentValue === newValue) {
      onChange(noneValue)
    } else {
      onChange(newValue)
    }
  }

  return (
    <div className="space-y-3">
      {/* Text Outline Section */}
      <div className="border border-zinc-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('outline')}
          className={`w-full flex items-center justify-between p-3 transition-colors ${
            expandedSection === 'outline' ? 'bg-zinc-800' : 'bg-zinc-800/50 hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Text Outline</span>
            {textOutline && textOutline !== 'none' && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                {TEXT_OUTLINE_OPTIONS.find(o => o.id === textOutline)?.label}
              </span>
            )}
          </div>
          <span className="text-zinc-500">{expandedSection === 'outline' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'outline' && (
          <div className="p-3 bg-zinc-900/50 border-t border-zinc-700">
            <div className="grid grid-cols-4 gap-1.5">
              {TEXT_OUTLINE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionToggle(textOutline, opt.id, onTextOutlineChange, 'none')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    textOutline === opt.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {opt.icon && <div className="text-lg mb-0.5">{opt.icon}</div>}
                  <div className="text-[10px] text-white">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Glow Effect Section */}
      <div className="border border-zinc-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('glow')}
          className={`w-full flex items-center justify-between p-3 transition-colors ${
            expandedSection === 'glow' ? 'bg-zinc-800' : 'bg-zinc-800/50 hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Glow Effect</span>
            {glowEffect && glowEffect !== 'none' && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                {GLOW_EFFECT_OPTIONS.find(o => o.id === glowEffect)?.label}
              </span>
            )}
          </div>
          <span className="text-zinc-500">{expandedSection === 'glow' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'glow' && (
          <div className="p-3 bg-zinc-900/50 border-t border-zinc-700 space-y-3">
            <div className="grid grid-cols-4 gap-1.5">
              {GLOW_EFFECT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionToggle(glowEffect, opt.id, onGlowEffectChange, 'none')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    glowEffect === opt.id
                      ? 'border-yellow-500 bg-yellow-500/20'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {opt.icon && <div className="text-lg mb-0.5">{opt.icon}</div>}
                  <div className="text-[10px] text-white">{opt.label}</div>
                </button>
              ))}
            </div>

            {/* Glow Intensity Slider */}
            {glowEffect && glowEffect !== 'none' && (
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-zinc-400">Glow Intensity</span>
                  <span className="text-xs text-yellow-400 font-mono">{glowIntensity}%</span>
                </div>
                <Slider
                  value={[glowIntensity]}
                  onValueChange={(v) => onGlowIntensityChange(v[0])}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text Texture Section */}
      <div className="border border-zinc-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('texture')}
          className={`w-full flex items-center justify-between p-3 transition-colors ${
            expandedSection === 'texture' ? 'bg-zinc-800' : 'bg-zinc-800/50 hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Surface Texture</span>
            {textTexture && textTexture !== 'smooth' && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-300">
                {TEXT_TEXTURE_OPTIONS.find(o => o.id === textTexture)?.label}
              </span>
            )}
          </div>
          <span className="text-zinc-500">{expandedSection === 'texture' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'texture' && (
          <div className="p-3 bg-zinc-900/50 border-t border-zinc-700">
            <div className="grid grid-cols-4 gap-1.5">
              {TEXT_TEXTURE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionToggle(textTexture, opt.id, onTextTextureChange, 'smooth')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    textTexture === opt.id
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-[10px] text-white">{opt.label}</div>
                  <div className="text-[8px] text-zinc-500">{opt.description.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Letter Effect Section */}
      <div className="border border-zinc-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('letter')}
          className={`w-full flex items-center justify-between p-3 transition-colors ${
            expandedSection === 'letter' ? 'bg-zinc-800' : 'bg-zinc-800/50 hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">Letter Effect</span>
            {letterEffect && letterEffect !== 'none' && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                {LETTER_EFFECT_OPTIONS.find(o => o.id === letterEffect)?.label}
              </span>
            )}
          </div>
          <span className="text-zinc-500">{expandedSection === 'letter' ? '−' : '+'}</span>
        </button>

        {expandedSection === 'letter' && (
          <div className="p-3 bg-zinc-900/50 border-t border-zinc-700">
            <div className="grid grid-cols-4 gap-1.5">
              {LETTER_EFFECT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionToggle(letterEffect, opt.id, onLetterEffectChange, 'none')}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    letterEffect === opt.id
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {opt.icon && <div className="text-lg mb-0.5">{opt.icon}</div>}
                  <div className="text-[10px] text-white">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Effects Summary */}
      {(textOutline !== 'none' || glowEffect !== 'none' || textTexture !== 'smooth' || letterEffect !== 'none') && (
        <div className="p-2 bg-zinc-800/30 rounded-lg">
          <div className="text-[10px] text-zinc-500 mb-1">Active Effects:</div>
          <div className="flex flex-wrap gap-1">
            {textOutline && textOutline !== 'none' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                {TEXT_OUTLINE_OPTIONS.find(o => o.id === textOutline)?.label} Outline
              </span>
            )}
            {glowEffect && glowEffect !== 'none' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                {GLOW_EFFECT_OPTIONS.find(o => o.id === glowEffect)?.label} Glow
              </span>
            )}
            {textTexture && textTexture !== 'smooth' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-300">
                {TEXT_TEXTURE_OPTIONS.find(o => o.id === textTexture)?.label} Texture
              </span>
            )}
            {letterEffect && letterEffect !== 'none' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                {LETTER_EFFECT_OPTIONS.find(o => o.id === letterEffect)?.label} Effect
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper exports for prompt building
export function getTextOutlinePrompt(outline: TextOutline | null): string {
  if (!outline || outline === 'none') return ''
  return TEXT_OUTLINE_OPTIONS.find(o => o.id === outline)?.promptDescription || ''
}

export function getGlowEffectPrompt(glow: GlowEffect | null, intensity: number): string {
  if (!glow || glow === 'none') return ''
  const base = GLOW_EFFECT_OPTIONS.find(o => o.id === glow)?.promptDescription || ''
  if (intensity > 70) return base.replace('with', 'with intense')
  if (intensity < 40) return base.replace('with', 'with subtle')
  return base
}

export function getTextTexturePrompt(texture: TextTexture | null): string {
  if (!texture || texture === 'smooth') return ''
  return TEXT_TEXTURE_OPTIONS.find(o => o.id === texture)?.promptDescription || ''
}

export function getLetterEffectPrompt(effect: LetterEffect | null): string {
  if (!effect || effect === 'none') return ''
  return LETTER_EFFECT_OPTIONS.find(o => o.id === effect)?.promptDescription || ''
}
