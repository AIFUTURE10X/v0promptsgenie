"use client"

import { Check } from 'lucide-react'
import {
  LogoConcept,
  RenderStyle,
  LOGO_CONCEPTS,
  RENDER_STYLES
} from '../../constants/logo-constants'

interface LogoStyleSelectorProps {
  selectedConcept: LogoConcept | null
  setSelectedConcept: (concept: LogoConcept | null) => void
  selectedRenders: RenderStyle[]
  setSelectedRenders: (renders: RenderStyle[]) => void
  isGenerating: boolean
}

export function LogoStyleSelector({
  selectedConcept,
  setSelectedConcept,
  selectedRenders,
  setSelectedRenders,
  isGenerating,
}: LogoStyleSelectorProps) {
  // Toggle function for concept - click again to deselect
  const toggleConcept = (concept: LogoConcept) => {
    setSelectedConcept(selectedConcept === concept ? null : concept)
  }

  // Toggle function for multi-select rendering styles
  const toggleRenderStyle = (style: RenderStyle) => {
    if (selectedRenders.includes(style)) {
      setSelectedRenders(selectedRenders.filter(s => s !== style))
    } else {
      setSelectedRenders([...selectedRenders, style])
    }
  }

  return (
    <div className="space-y-3">
      {/* Concept Style Row */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Logo Concept</label>
        <div className="grid grid-cols-6 gap-1">
          {LOGO_CONCEPTS.map((concept) => (
            <button
              key={concept.value}
              onClick={() => toggleConcept(concept.value)}
              disabled={isGenerating}
              className={`
                flex flex-col items-center p-1.5 rounded-lg border transition-all
                ${selectedConcept === concept.value
                  ? 'border-[#c99850] bg-[#c99850]/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-base" style={{ color: concept.color }}>{concept.icon}</span>
              <span className={`text-[9px] font-medium ${selectedConcept === concept.value ? 'text-[#dbb56e]' : 'text-white'}`}>
                {concept.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Rendering Style Row - Multi-select */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Rendering Style <span className="text-zinc-500">(multi-select)</span></label>
        <div className="grid grid-cols-6 gap-1">
          {RENDER_STYLES.map((render) => {
            const isSelected = selectedRenders.includes(render.value)
            return (
              <button
                key={render.value}
                onClick={() => toggleRenderStyle(render.value)}
                disabled={isGenerating}
                className={`
                  flex flex-col items-center p-1.5 rounded-lg border transition-all relative
                  ${isSelected
                    ? 'border-[#c99850] bg-[#c99850]/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                  }
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#c99850] rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-black" />
                  </span>
                )}
                <span
                  className="text-base"
                  style={render.gradient
                    ? { background: render.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                    : { color: render.color }
                  }
                >
                  {render.icon}
                </span>
                <span className={`text-[9px] font-medium ${isSelected ? 'text-[#dbb56e]' : 'text-white'}`}>
                  {render.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Preview of combined style */}
      {(selectedConcept || selectedRenders.length > 0) && (
        <div className="text-[10px] text-zinc-500 text-center">
          Style: <span className="text-[#dbb56e]">
            {[
              selectedConcept ? LOGO_CONCEPTS.find(c => c.value === selectedConcept)?.label : null,
              ...selectedRenders.map(r => RENDER_STYLES.find(rs => rs.value === r)?.label)
            ].filter(Boolean).join(' + ') || 'None selected'}
          </span>
        </div>
      )}
    </div>
  )
}
