"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Wand2, Heart, Settings, Clock, Home } from 'lucide-react'
import { NavigationMegaMenu } from './Navigation'

interface ImageStudioHeaderProps {
  activeTab: 'generate' | 'logo' | 'mockups'
  onTabChange: (tab: 'generate' | 'logo' | 'mockups') => void
  favoritesCount: number
  hasStoredParams: boolean
  onShowHistory: () => void
  onRestoreParameters: () => void
  onShowFavorites: () => void
  /** Optional callback for sub-menu actions */
  onMenuAction?: (action: string) => void
}

export function ImageStudioHeader({
  activeTab,
  onTabChange,
  favoritesCount,
  hasStoredParams,
  onShowHistory,
  onRestoreParameters,
  onShowFavorites,
  onMenuAction,
}: ImageStudioHeaderProps) {
  return (
    <header className="border-b border-zinc-800 px-6 py-2 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Welcome Card in Header */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
              }}
            >
              <Wand2 className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-sm font-medium text-white">Image Studio</span>
          </div>

          {/* Navigation Mega Menu */}
          <NavigationMegaMenu
            activeTab={activeTab}
            onTabChange={onTabChange}
            onAction={onMenuAction}
          />

          <Link href="/">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Home</span>
            </Button>
          </Link>
          <Button
            onClick={onShowHistory}
            variant="ghost"
            className="text-zinc-400 hover:text-white flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm">History</span>
          </Button>
          {hasStoredParams && (
            <Button
              onClick={onRestoreParameters}
              className="px-4 py-2 bg-linear-to-r from-[#c99850] to-[#dbb56e] text-black hover:from-[#dbb56e] hover:to-[#c99850] font-medium flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Restore Parameters
            </Button>
          )}
          <Button
            onClick={onShowFavorites}
            variant="ghost"
            className="text-zinc-400 hover:text-white flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">Favorites ({favoritesCount})</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
