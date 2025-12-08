"use client"

/**
 * UploadPanel Component
 *
 * Main panel for uploading subject, scene, and style images
 */

import { useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Upload, X, ChevronDown, Info } from 'lucide-react'
import type { UploadedImage } from '../../types'
import { SubjectImageGrid } from './SubjectImageGrid'
import { ImageUploadZone } from './ImageUploadZone'

interface UploadPanelProps {
  subjectImages: UploadedImage[]
  sceneImage: UploadedImage | null
  styleImage: UploadedImage | null
  isDragging: boolean
  setIsDragging: (isDragging: boolean) => void
  addSubjectImages: (files: FileList) => void
  setSceneImageFile: (file: File) => void
  setStyleImageFile: (file: File) => void
  removeSubjectImage: (id: string) => void
  toggleSubjectSelection: (id: string) => void
  clearSceneImage: () => void
  clearStyleImage: () => void
  clearAllImages?: () => void
  onClearAll?: () => void
}

export function UploadPanel({
  subjectImages,
  sceneImage,
  styleImage,
  isDragging,
  setIsDragging,
  addSubjectImages,
  setSceneImageFile,
  setStyleImageFile,
  removeSubjectImage,
  toggleSubjectSelection,
  clearSceneImage,
  clearStyleImage,
  clearAllImages,
  onClearAll,
}: UploadPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const subjectInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent, type: 'subject' | 'scene' | 'style') => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (!files.length) return

    if (type === 'subject') {
      addSubjectImages(files)
    } else if (type === 'scene' && files[0]) {
      setSceneImageFile(files[0])
    } else if (type === 'style' && files[0]) {
      setStyleImageFile(files[0])
    }
  }

  const handleSubjectFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      addSubjectImages(files)
    }
    e.target.value = ''
  }

  const handleClearAll = () => {
    if (clearAllImages) clearAllImages()
    if (onClearAll) onClearAll()
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">Image References</h2>
            <p className="text-sm text-zinc-400">Upload subjects, scenes, and style references</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-zinc-400 transition-transform ${
              isCollapsed ? '-rotate-90' : ''
            }`}
          />
        </button>

        {!isCollapsed && (
          <div className="p-6 pt-0 space-y-6">
            {/* Subject Images Section */}
            <Card className="bg-zinc-800 border-zinc-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Subject Images</h3>
                    <p className="text-sm text-zinc-400">Upload one or more subjects to include in your generation</p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-zinc-400 hover:text-[#c99850] transition-colors">
                        <Info className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs bg-black border-[#c99850] text-[#c99850]">
                      <p className="text-sm">
                        Upload multiple subjects to combine them in your generation.
                        Select which subjects to include by clicking on them.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  {(subjectImages.length > 0 || sceneImage || styleImage) && clearAllImages && (
                    <Button
                      onClick={handleClearAll}
                      variant="outline"
                      className="font-semibold text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-600"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                  <Button
                    onClick={() => subjectInputRef.current?.click()}
                    className="font-semibold text-black"
                    style={{
                      background: "linear-gradient(135deg, #c99850 0%, #dbb56e 25%, #f4d698 50%, #dbb56e 75%, #c99850 100%)",
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Subjects
                  </Button>
                </div>
                <input
                  ref={subjectInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleSubjectFileInput}
                />
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'subject')}
                onClick={() => subjectImages.length === 0 && subjectInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-[#c99850] bg-[#c99850]/10'
                    : 'border-[#c99850]/50 hover:border-[#c99850]'
                } ${subjectImages.length === 0 ? 'cursor-pointer' : ''}`}
              >
                <SubjectImageGrid
                  subjectImages={subjectImages}
                  onToggleSelection={toggleSubjectSelection}
                  onRemove={removeSubjectImage}
                />
              </div>
            </Card>

            {/* Scene & Style Images */}
            <div className="grid md:grid-cols-2 gap-6">
              <ImageUploadZone
                title="Scene/Background"
                subtitle="Optional scene reference"
                image={sceneImage}
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'scene')}
                onFileSelect={setSceneImageFile}
                onClear={clearSceneImage}
              />

              <ImageUploadZone
                title="Style Reference"
                subtitle="Optional artistic style"
                image={styleImage}
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'style')}
                onFileSelect={setStyleImageFile}
                onClear={clearStyleImage}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
