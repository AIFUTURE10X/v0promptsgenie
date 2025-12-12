"use client"

/**
 * Menu item components for ImageStudioMegaMenu
 */

import { Check, ImageIcon, Layers, Package, Eraser, LayoutGrid } from 'lucide-react'
import type { ActiveTab } from './ImageStudioMegaMenu'

interface MenuItemProps {
  isActive: boolean
  onClick: () => void
}

// Image Generator menu item
export function ImageGeneratorItem({ isActive, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all group border ${
        isActive
          ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] border-[#dbb56e] shadow-lg shadow-amber-500/20'
          : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700/80 hover:border-zinc-600'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-black/20' : 'bg-zinc-700'}`}>
        <ImageIcon className="w-4 h-4" style={{ color: isActive ? '#000' : '#3b82f6' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isActive ? 'text-black' : 'text-white'}`}>Image Generator</span>
          {isActive && <Check className="w-4 h-4 text-black" />}
        </div>
        <p className={`text-xs mt-0.5 ${isActive ? 'text-black/70' : 'text-white/70'}`}>AI images from prompts</p>
      </div>
    </button>
  )
}

// Logo Studio items (Logo + Mockups)
interface LogoStudioItemsProps {
  activeTab: ActiveTab
  onSelectLogo: () => void
  onSelectMockups: () => void
}

export function LogoStudioItems({ activeTab, onSelectLogo, onSelectMockups }: LogoStudioItemsProps) {
  const isLogoActive = activeTab === 'logo'
  const isMockupsActive = activeTab === 'mockups'
  const isLogoStudioActive = isLogoActive || isMockupsActive

  return (
    <div className={`rounded-lg border overflow-hidden ${isLogoStudioActive ? 'border-[#dbb56e] shadow-lg shadow-amber-500/20' : 'border-zinc-700'}`}>
      {/* Logo Generator */}
      <button
        onClick={onSelectLogo}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group ${
          isLogoActive ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e]' : 'bg-zinc-800/80 hover:bg-zinc-700/80'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isLogoActive ? 'bg-black/20' : 'bg-zinc-700'}`}>
          <Layers className="w-3.5 h-3.5" style={{ color: isLogoActive ? '#5c3d1e' : '#dbb56e' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${isLogoActive ? 'text-black' : 'text-white'}`}>Logo Generator</span>
            {isLogoActive && <Check className="w-3.5 h-3.5 text-black" />}
          </div>
          <p className={`text-[11px] ${isLogoActive ? 'text-black/70' : 'text-white/70'}`}>3D logos & effects</p>
        </div>
      </button>

      {/* Divider */}
      <div className={`h-px ${isLogoStudioActive ? 'bg-black/20' : 'bg-zinc-700'}`} />

      {/* Product Mockups */}
      <button
        onClick={onSelectMockups}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group ${
          isMockupsActive ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e]' : 'bg-zinc-800/80 hover:bg-zinc-700/80'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isMockupsActive ? 'bg-black/20' : 'bg-zinc-700'}`}>
          <Package className="w-3.5 h-3.5" style={{ color: isMockupsActive ? '#000' : '#a855f7' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${isMockupsActive ? 'text-black' : 'text-white'}`}>Product Mockups</span>
            {isMockupsActive && <Check className="w-3.5 h-3.5 text-black" />}
          </div>
          <p className={`text-[11px] ${isMockupsActive ? 'text-black/70' : 'text-white/70'}`}>T-shirts, mugs & more</p>
        </div>
      </button>
    </div>
  )
}

// Background Remover menu item
export function BgRemoverItem({ isActive, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all group border ${
        isActive
          ? 'bg-linear-to-r from-[#c99850] to-[#dbb56e] border-[#dbb56e] shadow-lg shadow-amber-500/20'
          : 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700/80 hover:border-zinc-600'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-black/20' : 'bg-zinc-700'}`}>
        <Eraser className="w-4 h-4" style={{ color: isActive ? '#000' : '#f43f5e' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isActive ? 'text-black' : 'text-white'}`}>BG Remover</span>
          {isActive && <Check className="w-4 h-4 text-black" />}
        </div>
        <p className={`text-xs mt-0.5 ${isActive ? 'text-black/70' : 'text-white/70'}`}>Remove backgrounds</p>
      </div>
    </button>
  )
}

// App Tracker link item
export function AppTrackerItem() {
  return (
    <a
      href="/app-tracker"
      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all group border bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700/80 hover:border-zinc-600"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-zinc-700">
        <LayoutGrid className="w-4 h-4" style={{ color: '#22c55e' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">App Tracker</span>
        </div>
        <p className="text-xs mt-0.5 text-white/70">Track your apps & ideas</p>
      </div>
    </a>
  )
}
