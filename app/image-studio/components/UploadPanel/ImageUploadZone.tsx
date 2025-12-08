"use client"

/**
 * ImageUploadZone Component
 *
 * Reusable drop zone for scene and style images
 */

import { useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'
import type { UploadedImage } from '../../types'

interface ImageUploadZoneProps {
  title: string
  subtitle: string
  image: UploadedImage | null
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (file: File) => void
  onClear: () => void
}

export function ImageUploadZone({
  title,
  subtitle,
  image,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onClear,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      onFileSelect(files[0])
    }
    e.target.value = ''
  }

  return (
    <Card className="bg-zinc-800 border-zinc-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-zinc-400">{subtitle}</p>
        </div>
        {!image && (
          <Button
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-black"
            style={{
              background: "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
            }}
          >
            <Upload className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !image && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-[#c99850] bg-[#c99850]/10'
            : 'border-[#c99850]/50 hover:border-[#c99850]'
        } ${!image ? 'cursor-pointer' : ''}`}
      >
        {image ? (
          <div className="relative group">
            <img
              src={image.preview || "/placeholder.svg"}
              alt={title}
              className="w-full h-40 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onClear()
                }}
              >
                <X className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#c99850] to-[#dbb56e] border-2 border-[#f4d698] flex items-center justify-center mx-auto mb-2">
              <Upload className="w-6 h-6 text-black" />
            </div>
            <p className="text-xs text-zinc-400">Drop {title.toLowerCase()} here</p>
          </div>
        )}
      </div>
    </Card>
  )
}
