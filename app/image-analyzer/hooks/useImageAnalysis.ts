import { useState } from 'react'

export type AnalysisResult = {
  text: string
  loading: boolean
}

export function useImageAnalysis() {
  const [subjectAnalysis, setSubjectAnalysis] = useState<AnalysisResult>({ text: "", loading: false })
  const [sceneAnalysis, setSceneAnalysis] = useState<AnalysisResult>({ text: "", loading: false })
  const [styleAnalysis, setStyleAnalysis] = useState<AnalysisResult>({ text: "", loading: false })

  const analyzeImage = async (
    imageFile: File,
    type: 'subject' | 'scene' | 'style',
    promptMode: 'fast' | 'quality'
  ) => {
    const setter = type === 'subject' ? setSubjectAnalysis : 
                   type === 'scene' ? setSceneAnalysis : setStyleAnalysis
    
    setter({ text: "", loading: true })

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(imageFile)
      })

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64.split(',')[1], 
          type, 
          mode: promptMode 
        }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setter({ text: data.analysis || '', loading: false })
      return data.analysis
    } catch (error) {
      setter({ text: 'Analysis failed', loading: false })
      throw error
    }
  }

  return {
    subjectAnalysis,
    sceneAnalysis,
    styleAnalysis,
    analyzeImage,
    setSubjectAnalysis,
    setSceneAnalysis,
    setStyleAnalysis,
  }
}
