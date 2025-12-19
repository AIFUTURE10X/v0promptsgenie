"use client"

import { Settings2, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react'
import { BgRemovalMethod } from '../../hooks/useLogoGeneration'
import {
  LogoResolution,
  RESOLUTION_OPTIONS,
  BG_REMOVAL_METHODS
} from '../../constants/logo-constants'
import { ASPECT_RATIO_OPTIONS } from '../../constants/toolbar-options'

interface LogoAdvancedSettingsProps {
  showAdvanced: boolean
  setShowAdvanced: (show: boolean) => void
  resolution: LogoResolution
  setResolution: (res: LogoResolution) => void
  seedLocked: boolean
  setSeedLocked: (locked: boolean) => void
  seedValue: number | undefined
  setSeedValue: (value: number | undefined) => void
  bgRemovalMethod: BgRemovalMethod
  setBgRemovalMethod: (method: BgRemovalMethod) => void
  aspectRatio: string
  setAspectRatio: (ratio: string) => void
  isGenerating: boolean
  isRemovingBackground: boolean
}

export function LogoAdvancedSettings({
  showAdvanced,
  setShowAdvanced,
  resolution,
  setResolution,
  seedLocked,
  setSeedLocked,
  seedValue,
  setSeedValue,
  bgRemovalMethod,
  setBgRemovalMethod,
  aspectRatio,
  setAspectRatio,
  isGenerating,
  isRemovingBackground,
}: LogoAdvancedSettingsProps) {
  return (
    <>
      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
      >
        <Settings2 className="w-3 h-3" />
        Advanced Settings
        {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Advanced Settings Panel */}
      {showAdvanced && (
        <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-2">
          {/* Resolution Setting */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400">Resolution</label>
            <div className="grid grid-cols-3 gap-1">
              {RESOLUTION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setResolution(option.value)}
                  disabled={isGenerating || isRemovingBackground}
                  className={`
                    flex flex-col items-center py-2 px-3 rounded-lg border transition-all
                    ${resolution === option.value
                      ? 'border-[#c99850] bg-linear-to-b from-[#c99850] to-[#a67c3d] text-black'
                      : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 text-white'
                    }
                    ${(isGenerating || isRemovingBackground) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-sm font-semibold">{option.value}</span>
                  <span className={`text-[9px] ${resolution === option.value ? 'text-black/70' : 'text-zinc-500'}`}>
                    ~{option.value === '1K' ? '1024' : option.value === '2K' ? '2048' : '4096'}px
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-zinc-500">
              Switch to Gemini 3 Pro for 2K/4K resolution
            </p>
          </div>

          {/* Aspect Ratio Setting */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-1">
              {ASPECT_RATIO_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAspectRatio(option.value)}
                  disabled={isGenerating || isRemovingBackground}
                  className={`
                    flex flex-col items-center py-1.5 px-1 rounded-lg border transition-all
                    ${aspectRatio === option.value
                      ? 'border-[#c99850] bg-linear-to-b from-[#c99850] to-[#a67c3d] text-black'
                      : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 text-white'
                    }
                    ${(isGenerating || isRemovingBackground) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-[10px] font-semibold">{option.label}</span>
                  <span className={`text-[8px] ${aspectRatio === option.value ? 'text-black/70' : 'text-zinc-500'}`}>
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Seed Lock Setting */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400">Seed Lock</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSeedLocked(!seedLocked)}
                disabled={isGenerating || isRemovingBackground}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs
                  ${seedLocked
                    ? 'border-[#c99850] bg-[#c99850]/10 text-[#dbb56e]'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 text-zinc-400'
                  }
                  ${(isGenerating || isRemovingBackground) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {seedLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {seedLocked ? 'Locked' : 'Unlocked'}
              </button>
              <input
                type="number"
                value={seedValue ?? ''}
                onChange={(e) => setSeedValue(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="Auto"
                disabled={isGenerating || isRemovingBackground}
                className="flex-1 px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-[#c99850] placeholder:text-zinc-600"
              />
            </div>
            <p className="text-[9px] text-zinc-500">
              {seedLocked
                ? 'Generation will use the seed above for reproducible results'
                : seedValue
                  ? `Last seed: ${seedValue} (click Lock to reuse)`
                  : 'Lock seed to reproduce similar logos at different resolutions'}
            </p>
          </div>

          {/* Background Removal Method */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400">Background Removal</label>
            <select
              value={bgRemovalMethod}
              onChange={(e) => setBgRemovalMethod(e.target.value as BgRemovalMethod)}
              disabled={isGenerating}
              className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-[#c99850]"
            >
              {BG_REMOVAL_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label} - {method.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </>
  )
}
