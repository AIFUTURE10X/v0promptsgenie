"use client"

export type GenerationModel = 'gemini-2.5-flash-preview-image' | 'gemini-3-pro-image-preview'
export type ImageSize = '1K' | '2K' | '4K'

interface ModelSelectorProps {
  selectedModel: GenerationModel
  onModelChange: (model: GenerationModel) => void
  imageSize: ImageSize
  onImageSizeChange: (size: ImageSize) => void
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  imageSize,
  onImageSizeChange,
}: ModelSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Model Selector */}
      <div className="bg-zinc-800 rounded-lg p-3 border-2 border-[#c99850]/50">
        <label className="text-xs font-bold text-white mb-2 block">
          AI Model
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onModelChange('gemini-2.5-flash-preview-image')
              if (imageSize !== '1K') {
                onImageSizeChange('1K')
              }
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedModel === 'gemini-2.5-flash-preview-image'
                ? 'bg-[#c99850] text-black'
                : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
            }`}
          >
            <div className="font-bold">Gemini 2.5 Flash</div>
            <div className="text-[10px] opacity-70">Fast, 1K only</div>
          </button>
          <button
            onClick={() => onModelChange('gemini-3-pro-image-preview')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedModel === 'gemini-3-pro-image-preview'
                ? 'bg-[#c99850] text-black'
                : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
            }`}
          >
            <div className="font-bold">Gemini 3 Pro</div>
            <div className="text-[10px] opacity-70">Quality, 2K/4K</div>
          </button>
        </div>
      </div>

      {/* Resolution Selector */}
      <div className="bg-zinc-800 rounded-lg p-3 border-2 border-[#c99850]/50">
        <label className="text-xs font-bold text-white mb-2 block">
          Resolution
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onImageSizeChange('1K')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              imageSize === '1K'
                ? 'bg-[#c99850] text-black'
                : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
            }`}
          >
            <div className="font-bold">1K</div>
            <div className="text-[10px] opacity-70">~1024px</div>
          </button>
          <button
            onClick={() => onImageSizeChange('2K')}
            disabled={selectedModel === 'gemini-2.5-flash-preview-image'}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              imageSize === '2K'
                ? 'bg-[#c99850] text-black'
                : selectedModel === 'gemini-2.5-flash-preview-image'
                  ? 'bg-zinc-900/50 text-white/30 cursor-not-allowed border border-zinc-700'
                  : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
            }`}
          >
            <div className="font-bold">2K</div>
            <div className="text-[10px] opacity-70">~2048px</div>
          </button>
          <button
            onClick={() => onImageSizeChange('4K')}
            disabled={selectedModel === 'gemini-2.5-flash-preview-image'}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              imageSize === '4K'
                ? 'bg-[#c99850] text-black'
                : selectedModel === 'gemini-2.5-flash-preview-image'
                  ? 'bg-zinc-900/50 text-white/30 cursor-not-allowed border border-zinc-700'
                  : 'bg-zinc-900 text-white/70 hover:bg-zinc-700 border border-[#c99850]/30'
            }`}
          >
            <div className="font-bold">4K</div>
            <div className="text-[10px] opacity-70">~4096px</div>
          </button>
        </div>
        {selectedModel === 'gemini-2.5-flash-preview-image' && (
          <p className="text-[10px] text-white/50 mt-2">
            Switch to Gemini 3 Pro for 2K/4K resolution
          </p>
        )}
      </div>
    </div>
  )
}
