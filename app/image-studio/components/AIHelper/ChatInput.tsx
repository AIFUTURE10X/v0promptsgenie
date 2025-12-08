'use client'

import { Send, ImageIcon } from 'lucide-react'
import { useRef } from 'react'
import type { AIHelperMode } from '../../hooks/useAIHelper'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  mode: AIHelperMode
  isLoading: boolean
  hasImages: boolean
  onSend: () => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ChatInput({ input, setInput, mode, isLoading, hasImages, onSend, onImageUpload }: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="p-4 border-t border-[#c99850]/30">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
          title="Upload image"
        >
          <ImageIcon className="w-4 h-4 text-[#c99850]" />
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
            }
          }}
          placeholder={mode === 'logo'
            ? "Describe your logo idea... (e.g., 'tech startup with cyan dots')"
            : "Describe your image idea... (Shift+Enter for new line)"
          }
          className="flex-1 px-3 py-2 bg-zinc-800 border border-[#c99850]/30 rounded text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none min-h-20"
          disabled={isLoading}
          rows={3}
        />
        <button
          onClick={onSend}
          disabled={isLoading || (!input.trim() && !hasImages)}
          className="p-2 bg-linear-to-r from-[#c99850] to-[#dbb56e] hover:from-[#dbb56e] hover:to-[#f4d698] rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
        >
          <Send className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  )
}
