import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Loader2, ChevronDown, Trash2, GripHorizontal } from 'lucide-react'

type CardType = "subject" | "scene" | "style" | "combined"

interface AnalysisCardProps {
  type: CardType
  title: string
  description: string
  analysis: { text: string; loading: boolean }
  height: number
  isEditing: boolean
  editText: string
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onCopy: () => void
  onClear: () => void
  onEditTextChange: (text: string) => void
  onResizeStart: (e: React.MouseEvent) => void
  copiedCard: string | null
}

const GOLD_GRADIENT = "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)"

export function AnalysisCard({
  type,
  title,
  description,
  analysis,
  height,
  isEditing,
  editText,
  onEdit,
  onSave,
  onCancel,
  onCopy,
  onClear,
  onEditTextChange,
  onResizeStart,
  copiedCard,
}: AnalysisCardProps) {
  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col relative"
      style={{ height: `${height}px` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <Tooltip>
            <TooltipTrigger>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </TooltipTrigger>
            <TooltipContent>{description}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex gap-1">
          {analysis.text && !isEditing && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-7 text-xs text-zinc-400 hover:text-white"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCopy}
                className="h-7 text-xs text-zinc-400 hover:text-white"
              >
                {copiedCard === type ? 'Copied!' : 'Copy'}
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button
                size="sm"
                onClick={onSave}
                className="h-7 text-xs text-black"
                style={{ background: GOLD_GRADIENT }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="h-7 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="h-7 text-xs text-zinc-400 hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto text-sm text-zinc-300 mb-4">
        {analysis.loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-[#c99850]" />
          </div>
        )}
        {!analysis.loading && !analysis.text && !isEditing && (
          <p className="text-zinc-500 text-center mt-8">No analysis yet</p>
        )}
        {!analysis.loading && isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            className="w-full h-full bg-zinc-800 text-white p-2 rounded border border-zinc-700 resize-none focus:outline-none focus:border-[#c99850]"
          />
        ) : (
          analysis.text && <p className="whitespace-pre-wrap">{analysis.text}</p>
        )}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-center cursor-ns-resize hover:bg-zinc-800/50 transition-colors"
        onMouseDown={onResizeStart}
      >
        <GripHorizontal className="w-5 h-5 text-[#c99850]/50" />
      </div>
    </div>
  )
}
