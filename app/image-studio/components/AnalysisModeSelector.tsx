"use client"

import { Button } from "@/components/ui/button"
import { Zap, Sparkles } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AnalysisModeSelectorProps {
  mode: 'fast' | 'quality'
  onChange: (mode: 'fast' | 'quality') => void
}

export function AnalysisModeSelector({ mode, onChange }: AnalysisModeSelectorProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-4">
        <span className="text-xs text-zinc-400 whitespace-nowrap">Mode:</span>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onChange('fast')}
                className={`px-3 py-2 h-8 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  mode === 'fast'
                    ? 'bg-gradient-to-r from-[#c99850] to-[#dbb56e] text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <Zap className="w-3 h-3" />
                Fast
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom"
              className="bg-black border-[#c99850] text-[#c99850] text-xs max-w-[200px]"
            >
              Quick analysis with essential details for faster results
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onChange('quality')}
                className={`px-3 py-2 h-8 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  mode === 'quality'
                    ? 'bg-gradient-to-r from-[#c99850] to-[#dbb56e] text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Quality
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom"
              className="bg-black border-[#c99850] text-[#c99850] text-xs max-w-[200px]"
            >
              Detailed analysis with comprehensive descriptions and artistic insights
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
