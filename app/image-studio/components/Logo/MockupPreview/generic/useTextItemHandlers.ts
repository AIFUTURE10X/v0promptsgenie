"use client"

/**
 * Text Item Handlers Hook
 *
 * Handles multiple text items CRUD operations for mockups.
 * Extracted from GenericMockup to keep components under 300 lines.
 */

import { useCallback } from 'react'
import type { TextItem, TextEffect, Position } from './mockup-types'
import { createTextItem } from '../text-effects-config'

interface UseTextItemHandlersConfig {
  textItems: TextItem[]
  setTextItems: React.Dispatch<React.SetStateAction<TextItem[]>>
  selectedTextId: string | null
  setSelectedTextId: React.Dispatch<React.SetStateAction<string | null>>
  setEditableBrandName: React.Dispatch<React.SetStateAction<string>>
  setBrandFont: React.Dispatch<React.SetStateAction<string>>
  setBrandColor: React.Dispatch<React.SetStateAction<string>>
  setBrandScale: React.Dispatch<React.SetStateAction<number>>
  setBrandEffect: React.Dispatch<React.SetStateAction<TextEffect>>
  setBrandRotation: React.Dispatch<React.SetStateAction<number>>
  setBrandPosition: React.Dispatch<React.SetStateAction<Position>>
}

export function useTextItemHandlers({
  textItems,
  setTextItems,
  selectedTextId,
  setSelectedTextId,
  setEditableBrandName,
  setBrandFont,
  setBrandColor,
  setBrandScale,
  setBrandEffect,
  setBrandRotation,
  setBrandPosition,
}: UseTextItemHandlersConfig) {
  const handleAddText = useCallback(() => {
    const newItem = createTextItem({
      content: `Text ${textItems.length + 1}`,
      position: { x: 50, y: 65 + (textItems.length * 8) % 30 },
    })
    setTextItems(prev => [...prev, newItem])
    setSelectedTextId(newItem.id)
  }, [textItems.length, setTextItems, setSelectedTextId])

  const handleRemoveText = useCallback((id: string) => {
    setTextItems(prev => prev.filter(item => item.id !== id))
    if (selectedTextId === id) setSelectedTextId(null)
  }, [selectedTextId, setTextItems, setSelectedTextId])

  const handleSelectText = useCallback((id: string) => {
    setSelectedTextId(id)
    const item = textItems.find(t => t.id === id)
    if (item) {
      setEditableBrandName(item.content)
      setBrandFont(item.font)
      setBrandColor(item.color)
      setBrandScale(item.scale)
      setBrandEffect(item.effect)
      setBrandRotation(item.rotation)
      setBrandPosition(item.position)
    }
  }, [textItems, setSelectedTextId, setEditableBrandName, setBrandFont, setBrandColor, setBrandScale, setBrandEffect, setBrandRotation, setBrandPosition])

  const handleUpdateSelectedText = useCallback((updates: Partial<TextItem>) => {
    if (!selectedTextId) return
    setTextItems(prev => prev.map(item =>
      item.id === selectedTextId ? { ...item, ...updates } : item
    ))
  }, [selectedTextId, setTextItems])

  const handleUpdateTextContent = useCallback((id: string, content: string) => {
    setTextItems(prev => prev.map(item =>
      item.id === id ? { ...item, content } : item
    ))
  }, [setTextItems])

  return {
    handleAddText,
    handleRemoveText,
    handleSelectText,
    handleUpdateSelectedText,
    handleUpdateTextContent,
  }
}
