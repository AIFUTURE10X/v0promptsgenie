"use client"

import { useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Upload, X, Check, ChevronDown, Info } from 'lucide-react'
import type { UploadedImage } from '../types'

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
  const sceneInputRef = useRef<HTMLInputElement>(null)
  const styleInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'subject' | 'scene' | 'style'
  ) => {
    const files = e.target.files
    if (!files) return

    if (type === 'subject') {
      addSubjectImages(files)
    } else if (type === 'scene' && files[0]) {
      setSceneImageFile(files[0])
    } else if (type === 'style' && files[0]) {
      setStyleImageFile(files[0])
    }

    // Reset input
    e.target.value = ''
  }

  const handleClearAll = () => {
    if (clearAllImages) {
      clearAllImages()
    }
    if (onClearAll) {
      onClearAll()
    }
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
                  onChange={(e) => handleFileInput(e, 'subject')}
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
                {subjectImages.length === 0 ? (
                  <div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c99850] to-[#dbb56e] border-2 border-[#f4d698] flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-black" />
                    </div>
                    <p className="text-zinc-300 mb-2">Drag & drop subject images here</p>
                    <p className="text-xs text-zinc-500">or click the "Add Subjects" button above</p>
                  </div>
                ) : (
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
                            onClick={() => toggleSubjectSelection(img.id)}
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
                            onClick={() => removeSubjectImage(img.id)}
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
                )}
              </div>
            </Card>

            {/* Scene & Style Images */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Scene Image */}
              <Card className="bg-zinc-800 border-zinc-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Scene/Background</h3>
                    <p className="text-sm text-zinc-400">Optional scene reference</p>
                  </div>
                  {!sceneImage && (
                    <Button
                      size="sm"
                      onClick={() => sceneInputRef.current?.click()}
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
                    ref={sceneInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileInput(e, 'scene')}
                  />
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'scene')}
                  onClick={() => !sceneImage && sceneInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-[#c99850] bg-[#c99850]/10'
                      : 'border-[#c99850]/50 hover:border-[#c99850]'
                  } ${!sceneImage ? 'cursor-pointer' : ''}`}
                >
                  {sceneImage ? (
                    <div className="relative group">
                      <img
                        src={sceneImage.preview || "/placeholder.svg"}
                        alt="Scene"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={clearSceneImage}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c99850] to-[#dbb56e] border-2 border-[#f4d698] flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-6 h-6 text-black" />
                      </div>
                      <p className="text-xs text-zinc-400">Drop scene image here</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Style Image */}
              <Card className="bg-zinc-800 border-zinc-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Style Reference</h3>
                    <p className="text-sm text-zinc-400">Optional artistic style</p>
                  </div>
                  {!styleImage && (
                    <Button
                      size="sm"
                      onClick={() => styleInputRef.current?.click()}
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
                    ref={styleInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileInput(e, 'style')}
                  />
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'style')}
                  onClick={() => !styleImage && styleInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-[#c99850] bg-[#c99850]/10'
                      : 'border-[#c99850]/50 hover:border-[#c99850]'
                  } ${!styleImage ? 'cursor-pointer' : ''}`}
                >
                  {styleImage ? (
                    <div className="relative group">
                      <img
                        src={styleImage.preview || "/placeholder.svg"}
                        alt="Style"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={clearStyleImage}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c99850] to-[#dbb56e] border-2 border-[#f4d698] flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-6 h-6 text-black" />
                      </div>
                      <p className="text-xs text-zinc-400">Drop style image here</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
