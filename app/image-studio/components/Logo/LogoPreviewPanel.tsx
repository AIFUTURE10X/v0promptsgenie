"use client"

import { Button } from '@/components/ui/button'
import { Trash2, ImageIcon } from 'lucide-react'
import { GeneratedLogo } from '../../hooks/useLogoGeneration'
import { transparencyGridStyle } from '../../constants/logo-constants'

interface LogoPreviewPanelProps {
  generatedLogo: GeneratedLogo | null
  onClearLogo: () => void
}

export function LogoPreviewPanel({ generatedLogo, onClearLogo }: LogoPreviewPanelProps) {
  if (!generatedLogo) {
    return (
      <div className="w-[500px] shrink-0">
        <div
          className="h-full min-h-[280px] rounded-lg border border-dashed border-zinc-700 flex flex-col items-center justify-center p-4"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <ImageIcon className="w-10 h-10 text-zinc-700 mb-2" />
          <p className="text-xs text-zinc-600 text-center">
            Your generated logo will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[500px] shrink-0">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-400">Generated Logo</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearLogo}
            className="h-5 px-1.5 text-zinc-500 hover:text-white text-[10px]"
          >
            <Trash2 className="w-3 h-3 mr-0.5" />
            Clear
          </Button>
        </div>

        {/* Logo on transparency grid */}
        <div
          className="relative rounded-lg overflow-hidden border border-zinc-700"
          style={transparencyGridStyle}
        >
          <div className="h-[420px] flex items-center justify-center relative p-4">
            <img
              src={generatedLogo.url}
              alt="Generated logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {/* Preview on different backgrounds */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="h-32 rounded-lg bg-white flex items-center justify-center border border-zinc-700">
            <img src={generatedLogo.url} alt="On white" className="w-full h-full object-contain" style={{ transform: 'scale(1.5)' }} />
          </div>
          <div className="h-32 rounded-lg bg-black flex items-center justify-center border border-zinc-700">
            <img src={generatedLogo.url} alt="On black" className="w-full h-full object-contain" style={{ transform: 'scale(1.5)' }} />
          </div>
          <div className="h-32 rounded-lg flex items-center justify-center border border-zinc-700" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <img src={generatedLogo.url} alt="On gradient" className="w-full h-full object-contain" style={{ transform: 'scale(1.5)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
