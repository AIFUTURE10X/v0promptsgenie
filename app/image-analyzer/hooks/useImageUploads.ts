import { useState, useRef } from 'react'

export type UploadedImage = {
  id: string
  file: File
  preview: string
  selected: boolean
  analysis?: string
}

export function useImageUploads() {
  const [subjectImages, setSubjectImages] = useState<UploadedImage[]>([])
  const [sceneImage, setSceneImage] = useState<UploadedImage | null>(null)
  const [styleImage, setStyleImage] = useState<UploadedImage | null>(null)
  const [referenceImage, setReferenceImage] = useState<UploadedImage | null>(null)

  const subjectInputRef = useRef<HTMLInputElement>(null)
  const sceneInputRef = useRef<HTMLInputElement>(null)
  const styleInputRef = useRef<HTMLInputElement>(null)
  const referenceInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (
    files: FileList | null,
    type: 'subject' | 'scene' | 'style' | 'reference'
  ) => {
    if (!files || files.length === 0) return

    const newImages: UploadedImage[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      selected: false,
    }))

    switch (type) {
      case 'subject':
        setSubjectImages((prev) => [...prev, ...newImages])
        break
      case 'scene':
        setSceneImage(newImages[0])
        break
      case 'style':
        setStyleImage(newImages[0])
        break
      case 'reference':
        setReferenceImage(newImages[0])
        break
    }
  }

  const removeImage = (id: string, type: 'subject' | 'scene' | 'style' | 'reference') => {
    switch (type) {
      case 'subject':
        setSubjectImages((prev) => prev.filter((img) => img.id !== id))
        break
      case 'scene':
        setSceneImage(null)
        break
      case 'style':
        setStyleImage(null)
        break
      case 'reference':
        setReferenceImage(null)
        break
    }
  }

  const clearAllImages = () => {
    subjectImages.forEach(img => URL.revokeObjectURL(img.preview))
    if (sceneImage) URL.revokeObjectURL(sceneImage.preview)
    if (styleImage) URL.revokeObjectURL(styleImage.preview)
    if (referenceImage) URL.revokeObjectURL(referenceImage.preview)
    
    setSubjectImages([])
    setSceneImage(null)
    setStyleImage(null)
    setReferenceImage(null)
  }

  return {
    subjectImages,
    sceneImage,
    styleImage,
    referenceImage,
    subjectInputRef,
    sceneInputRef,
    styleInputRef,
    referenceInputRef,
    handleImageUpload,
    removeImage,
    clearAllImages,
    setSubjectImages,
    setSceneImage,
    setStyleImage,
    setReferenceImage,
  }
}
