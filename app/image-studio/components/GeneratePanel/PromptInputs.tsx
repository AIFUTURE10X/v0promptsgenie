"use client"

interface PromptInputsProps {
  mainPrompt: string
  negativePrompt: string
  onMainPromptChange: (value: string) => void
  onNegativePromptChange: (value: string) => void
}

export function PromptInputs({
  mainPrompt,
  negativePrompt,
  onMainPromptChange,
  onNegativePromptChange,
}: PromptInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-bold text-white mb-2 block">
          Main Prompt (type here or use combined analysis)
        </label>
        <textarea
          value={mainPrompt}
          onChange={(e) => onMainPromptChange(e.target.value)}
          placeholder="Describe the image you want... or leave empty to use combined analysis"
          className="w-full h-24 px-4 py-3 rounded-lg text-sm bg-zinc-800 text-white placeholder:text-white/50 border-2 border-[#c99850]/50 hover:border-[#c99850] focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-white mb-2 block">
          Negative Prompt (exclude unwanted elements)
        </label>
        <textarea
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          placeholder="e.g. blurry, low quality, distorted"
          className="w-full h-24 px-4 py-3 rounded-lg text-sm bg-zinc-800 text-white placeholder:text-white/50 border-2 border-[#c99850]/50 hover:border-[#c99850] focus:outline-none focus:ring-2 focus:ring-[#c99850]/50 resize-none"
        />
      </div>
    </div>
  )
}
