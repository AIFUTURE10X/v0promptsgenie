"use client"

/**
 * ImageStudioHeader Component
 *
 * Main header with:
 * - Home button (always first)
 * - Image Studio mega menu dropdown
 * - Context-specific buttons (only when Image Generator active)
 * - Account manager (right side)
 */

import Link from 'next/link'
import { Home } from 'lucide-react'
import { ImageStudioMegaMenu } from './Navigation'
import { HeaderContextButtons } from './HeaderContextButtons'
import { AccountManager } from './AccountManager'

interface ImageStudioHeaderProps {
  activeTab: 'generate' | 'logo' | 'mockups' | 'bg-remover' | 'settings'
  onTabChange: (tab: 'generate' | 'logo' | 'mockups' | 'bg-remover' | 'settings') => void
  favoritesCount: number
  hasStoredParams: boolean
  onShowHistory: () => void
  onRestoreParameters: () => void
  onShowFavorites: () => void
}

export function ImageStudioHeader({
  activeTab,
  onTabChange,
  favoritesCount,
  hasStoredParams,
  onShowHistory,
  onRestoreParameters,
  onShowFavorites,
}: ImageStudioHeaderProps) {
  return (
    <header className="border-b border-zinc-800 px-6 py-2 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left spacer for balance */}
        <div className="w-20" />

        {/* Center: Home + Image Studio Mega Menu */}
        <div className="flex items-center gap-3">
          {/* Home Button - Always First (Gold Style) */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:text-white border border-zinc-700"
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #c99850 0%, #dbb56e 50%, #c99850 100%)",
              }}
            >
              <Home className="w-3 h-3 text-black" />
            </div>
            <span>Home</span>
          </Link>

          {/* Image Studio Mega Menu */}
          <ImageStudioMegaMenu
            activeTab={activeTab}
            onTabChange={onTabChange}
          />

          {/* Context-specific buttons (only for Image Generator) */}
          {activeTab === 'generate' && (
            <HeaderContextButtons
              favoritesCount={favoritesCount}
              hasStoredParams={hasStoredParams}
              onShowHistory={onShowHistory}
              onRestoreParameters={onRestoreParameters}
              onShowFavorites={onShowFavorites}
            />
          )}
        </div>

        {/* Right: Account Manager */}
        <div className="w-20 flex justify-end">
          <AccountManager />
        </div>
      </div>
    </header>
  )
}
