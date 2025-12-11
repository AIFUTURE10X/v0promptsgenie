"use client"

/**
 * ImageStudioMegaMenu Component
 *
 * Single dropdown mega menu that opens when clicking "Image Studio".
 * Three columns: Image Generator, Logo Studio (Logo + Mockups), Background Remover
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Wand2, ImageIcon, Layers, Package, Check, Eraser } from 'lucide-react'

// ============ Types ============

export type ActiveTab = 'generate' | 'logo' | 'mockups' | 'bg-remover'

// ============ Component ============

interface ImageStudioMegaMenuProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

export function ImageStudioMegaMenu({
  activeTab,
  onTabChange
}: ImageStudioMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  // Handle item selection
  const handleSelect = useCallback((id: ActiveTab) => {
    onTabChange(id)
    setIsOpen(false)
  }, [onTabChange])

  // Get display label based on active tab
  const getActiveLabel = () => {
    switch (activeTab) {
      case 'generate':
        return 'Image Generator'
      case 'logo':
        return 'Logo Generator'
      case 'mockups':
        return 'Product Mockups'
      case 'bg-remover':
        return 'Background Remover'
      default:
        return 'Image Studio'
    }
  }

  const isLogoStudioActive = activeTab === 'logo' || activeTab === 'mockups'

  // Handle mouse enter/leave for hover behavior
  const handleMouseEnter = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isOpen
            ? 'bg-zinc-800 text-white border border-zinc-600'
            : 'bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:text-white border border-zinc-700'
        }`}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #c99850 0%, #dbb56e 50%, #c99850 100%)",
          }}
        >
          <Wand2 className="w-3 h-3 text-black" />
        </div>
        <span>Image Studio</span>
        <span className="text-zinc-500 mx-1">|</span>
        <span className="text-zinc-400">{getActiveLabel()}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Mega Menu Dropdown - centered */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[720px] z-50">
          <div className="border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200" style={{ backgroundColor: '#555555' }}>
            {/* 3-column grid */}
            <div className="grid grid-cols-3 gap-4 p-4">

              {/* Column 1: Image Generator */}
              <div>
                <div className="px-1 py-1.5 mb-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Create
                  </span>
                </div>
                <button
                  onClick={() => handleSelect('generate')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all group border ${
                    activeTab === 'generate'
                      ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] border-[#dbb56e] shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700/80 hover:border-zinc-600'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activeTab === 'generate' ? 'bg-black/20' : 'bg-zinc-700'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" style={{ color: activeTab === 'generate' ? '#000' : '#3b82f6' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        activeTab === 'generate' ? 'text-black' : 'text-white'
                      }`}>
                        Image Generator
                      </span>
                      {activeTab === 'generate' && <Check className="w-4 h-4 text-black" />}
                    </div>
                    <p className={`text-xs mt-0.5 ${
                      activeTab === 'generate' ? 'text-black/70' : 'text-white/70'
                    }`}>
                      AI images from prompts
                    </p>
                  </div>
                </button>
              </div>

              {/* Column 2: Logo Studio (Logo + Mockups connected) */}
              <div>
                <div className="px-1 py-1.5 mb-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Logo Studio
                  </span>
                </div>
                <div className={`rounded-lg border overflow-hidden ${
                  isLogoStudioActive
                    ? 'border-[#dbb56e] shadow-lg shadow-amber-500/20'
                    : 'border-zinc-700'
                }`}>
                  {/* Logo Generator */}
                  <button
                    onClick={() => handleSelect('logo')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group ${
                      activeTab === 'logo'
                        ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e]'
                        : 'bg-zinc-800/80 hover:bg-zinc-700/80'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        activeTab === 'logo' ? 'bg-black/20' : 'bg-zinc-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" style={{ color: activeTab === 'logo' ? '#5c3d1e' : '#dbb56e' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${
                          activeTab === 'logo' ? 'text-black' : 'text-white'
                        }`}>
                          Logo Generator
                        </span>
                        {activeTab === 'logo' && <Check className="w-3.5 h-3.5 text-black" />}
                      </div>
                      <p className={`text-[11px] ${
                        activeTab === 'logo' ? 'text-black/70' : 'text-white/70'
                      }`}>
                        3D logos & effects
                      </p>
                    </div>
                  </button>

                  {/* Divider */}
                  <div className={`h-px ${isLogoStudioActive ? 'bg-black/20' : 'bg-zinc-700'}`} />

                  {/* Product Mockups */}
                  <button
                    onClick={() => handleSelect('mockups')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group ${
                      activeTab === 'mockups'
                        ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e]'
                        : 'bg-zinc-800/80 hover:bg-zinc-700/80'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        activeTab === 'mockups' ? 'bg-black/20' : 'bg-zinc-700'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" style={{ color: activeTab === 'mockups' ? '#000' : '#a855f7' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${
                          activeTab === 'mockups' ? 'text-black' : 'text-white'
                        }`}>
                          Product Mockups
                        </span>
                        {activeTab === 'mockups' && <Check className="w-3.5 h-3.5 text-black" />}
                      </div>
                      <p className={`text-[11px] ${
                        activeTab === 'mockups' ? 'text-black/70' : 'text-white/70'
                      }`}>
                        T-shirts, mugs & more
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Column 3: Background Remover */}
              <div>
                <div className="px-1 py-1.5 mb-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Edit
                  </span>
                </div>
                <button
                  onClick={() => handleSelect('bg-remover')}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all group border ${
                    activeTab === 'bg-remover'
                      ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] border-[#dbb56e] shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700/80 hover:border-zinc-600'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activeTab === 'bg-remover' ? 'bg-black/20' : 'bg-zinc-700'
                    }`}
                  >
                    <Eraser className="w-4 h-4" style={{ color: activeTab === 'bg-remover' ? '#000' : '#f43f5e' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        activeTab === 'bg-remover' ? 'text-black' : 'text-white'
                      }`}>
                        BG Remover
                      </span>
                      {activeTab === 'bg-remover' && <Check className="w-4 h-4 text-black" />}
                    </div>
                    <p className={`text-xs mt-0.5 ${
                      activeTab === 'bg-remover' ? 'text-black/70' : 'text-white/70'
                    }`}>
                      Remove backgrounds
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 bg-zinc-800/50 border-t border-zinc-700/50">
              <p className="text-xs text-white text-center">
                Logo Studio apps work together for complete brand design
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
