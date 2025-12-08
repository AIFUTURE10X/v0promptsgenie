"use client"

import { useState, useEffect } from 'react'

interface ToolbarHintBarProps {
  hoveredButton: string | null
  onHoverChange: (button: string | null) => void
}

export function ToolbarHintBar({ hoveredButton, onHoverChange }: ToolbarHintBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(hoveredButton !== null)
  }, [hoveredButton])

  const hints: Record<string, { icon: JSX.Element; text: string }> = {
    style: {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
        </svg>
      ),
      text: "Choose your image style: Realistic, Anime, 3D Render, Comic Book, Pencil Sketch..."
    },
    advanced: {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M23 12h-6m-6 0H5" />
          <circle cx="12" cy="12" r="8" opacity="0.2" fill="currentColor" />
        </svg>
      ),
      text: "Fine-tune your generation with camera angles, lenses & style strength settings"
    }
  }

  const currentHint = hoveredButton ? hints[hoveredButton] : null

  return (
    <div className="h-0 overflow-visible flex items-center justify-center relative z-10">
      <div
        className={`absolute top-14 transition-all duration-200 ${
          visible && currentHint ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        onMouseEnter={() => hoveredButton && onHoverChange(hoveredButton)}
        onMouseLeave={() => onHoverChange(null)}
      >
        <div className="flex items-center justify-center gap-3 px-6 py-3 bg-black/90 backdrop-blur-md border-2 border-[#D4AF37] rounded-lg shadow-lg shadow-[#D4AF37]/20">
          <div className="text-[#D4AF37] shrink-0">
            {currentHint?.icon}
          </div>
          <p className="text-sm text-[#D4AF37] font-medium leading-relaxed">
            {currentHint?.text}
          </p>
        </div>
      </div>
    </div>
  )
}
