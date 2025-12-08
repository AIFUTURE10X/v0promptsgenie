"use client"

/**
 * SubjectImageGrid Component
 *
 * Grid display for subject images with selection and removal controls
 */

import { Button } from '@/components/ui/button'
import { X, Check, Upload } from 'lucide-react'
import type { UploadedImage } from '../../types'

interface SubjectImageGridProps {
  subjectImages: UploadedImage[]
  onToggleSelection: (id: string) => void
  onRemove: (id: string) => void
}

export function SubjectImageGrid({
  subjectImages,
  onToggleSelection,
  onRemove,
}: SubjectImageGridProps) {
  if (subjectImages.length === 0) {
    return (
      <div>
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#c99850] to-[#dbb56e] border-2 border-[#f4d698] flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-black" />
        </div>
        <p className="text-zinc-300 mb-2">Drag & drop subject images here</p>
        <p className="text-xs text-zinc-500">or click the "Add Subjects" button above</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {subjectImages.map((img) => (
        <div
          key={img.id}
          className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
            img.selected
              ? 'border-[#c99850] shadow-lg shadow-[#c99850]/20'
              : 'border-zinc-700'
          }`}
        >
          <img
            src={img.preview || "/placeholder.svg"}
            alt="Subject"
            className="w-full h-32 object-cover"
          />

          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onToggleSelection(img.id)}
              className="bg-zinc-800 hover:bg-zinc-700"
            >
              {img.selected ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Selected
                </>
              ) : (
                'Select'
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemove(img.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Selection Badge */}
          {img.selected && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#c99850] flex items-center justify-center">
              <Check className="w-4 h-4 text-black" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
