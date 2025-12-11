"use client"

/**
 * BgRemoverPreview Component
 *
 * Side-by-side preview showing original vs processed image.
 * Uses checkerboard pattern to show transparency.
 */

import { Loader2, ImageIcon } from 'lucide-react'

interface BgRemoverPreviewProps {
  original: string | undefined
  processed: string | null | undefined
  status: 'pending' | 'processing' | 'complete' | 'error' | undefined
  error?: string
}

// CSS checkerboard pattern for transparency
const checkerboardStyle = {
  backgroundImage: `
    linear-gradient(45deg, #374151 25%, transparent 25%),
    linear-gradient(-45deg, #374151 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #374151 75%),
    linear-gradient(-45deg, transparent 75%, #374151 75%)
  `,
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
  backgroundColor: '#1f2937',
}

export function BgRemoverPreview({ original, processed, status, error }: BgRemoverPreviewProps) {
  if (!original) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl bg-zinc-800/50 border border-zinc-700">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Select an image to preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 mb-3">
      {/* Original */}
      <div className="rounded-lg overflow-hidden border border-zinc-700">
        <div className="px-2 py-1.5 bg-zinc-800 border-b border-zinc-700">
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Original
          </span>
        </div>
        <div className="p-3 bg-zinc-800/50 flex items-center justify-center min-h-[220px]">
          <img
            src={original}
            alt="Original"
            className="max-w-full max-h-[200px] object-contain rounded"
          />
        </div>
      </div>

      {/* Result */}
      <div className="rounded-lg overflow-hidden border border-zinc-700">
        <div className="px-2 py-1.5 bg-zinc-800 border-b border-zinc-700">
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Result
          </span>
        </div>
        <div
          className="p-3 flex items-center justify-center min-h-[220px]"
          style={checkerboardStyle}
        >
          {status === 'pending' && (
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-700/80 flex items-center justify-center mx-auto mb-1.5">
                <ImageIcon className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-xs text-zinc-400">Click &quot;Remove Background&quot;</p>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#dbb56e] animate-spin mx-auto mb-1.5" />
              <p className="text-xs text-zinc-300">Removing background...</p>
            </div>
          )}

          {status === 'complete' && processed && (
            <img
              src={processed}
              alt="Result"
              className="max-w-full max-h-[200px] object-contain rounded"
            />
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-1.5">
                <span className="text-lg">⚠️</span>
              </div>
              <p className="text-xs text-red-400">{error || 'Processing failed'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
