"use client"

/**
 * ImageStudioMegaMenu Component
 *
 * Single dropdown mega menu that opens when clicking "Image Studio".
 * Three columns: Image Generator, Logo Studio (Logo + Mockups), Background Remover
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Wand2, Settings } from 'lucide-react'
import { ImageGeneratorItem, LogoStudioItems, BgRemoverItem, AppTrackerItem } from './MegaMenuItems'

export type ActiveTab = 'generate' | 'logo' | 'mockups' | 'bg-remover' | 'settings'

interface ImageStudioMegaMenuProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

export function ImageStudioMegaMenu({ activeTab, onTabChange }: ImageStudioMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const handleSelect = useCallback((id: ActiveTab) => {
    onTabChange(id)
    setIsOpen(false)
  }, [onTabChange])

  const getActiveLabel = () => {
    switch (activeTab) {
      case 'generate': return 'Image Generator'
      case 'logo': return 'Logo Generator'
      case 'mockups': return 'Product Mockups'
      case 'bg-remover': return 'Background Remover'
      case 'settings': return 'Settings'
      default: return 'Image Studio'
    }
  }

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
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
          style={{ background: "linear-gradient(135deg, #c99850 0%, #dbb56e 50%, #c99850 100%)" }}
        >
          <Wand2 className="w-3 h-3 text-black" />
        </div>
        <span>Image Studio</span>
        <span className="text-zinc-500 mx-1">|</span>
        <span className="text-zinc-400">{getActiveLabel()}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[900px] z-50">
          <div className="border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200" style={{ backgroundColor: '#555555' }}>
            {/* 4-column grid */}
            <div className="grid grid-cols-4 gap-4 p-4">
              {/* Column 1: Image Generator */}
              <div>
                <div className="px-1 py-1.5 mb-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Create</span>
                </div>
                <ImageGeneratorItem isActive={activeTab === 'generate'} onClick={() => handleSelect('generate')} />
              </div>

              {/* Column 2: Logo Studio */}
              <div>
                <div className="px-1 py-1.5 mb-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Logo Studio</span>
                </div>
                <LogoStudioItems
                  activeTab={activeTab}
                  onSelectLogo={() => handleSelect('logo')}
                  onSelectMockups={() => handleSelect('mockups')}
                />
              </div>

              {/* Column 3: Background Remover */}
              <div>
                <div className="px-1 py-1.5 mb-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Edit</span>
                </div>
                <BgRemoverItem isActive={activeTab === 'bg-remover'} onClick={() => handleSelect('bg-remover')} />
              </div>

              {/* Column 4: App Tracker */}
              <div>
                <div className="px-1 py-1.5 mb-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Tools</span>
                </div>
                <AppTrackerItem />
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-zinc-800/50 border-t border-zinc-700/50 flex items-center justify-between">
              <p className="text-xs text-white">Logo Studio apps work together for complete brand design</p>
              <button
                onClick={() => handleSelect('settings')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#dbb56e] text-black font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
