"use client"

/**
 * ConditionalTooltip Component
 *
 * A wrapper that only renders tooltips when the showTooltips setting is enabled.
 * Use this instead of the raw Tooltip component to respect user preferences.
 */

import { ReactNode, ReactElement } from 'react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useAppSettings } from '../hooks/useAppSettings'

interface ConditionalTooltipProps {
  children: ReactElement
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  delayDuration?: number
}

export function ConditionalTooltip({
  children,
  content,
  side = 'top',
  sideOffset = 4,
  delayDuration = 200,
}: ConditionalTooltipProps) {
  const { settings } = useAppSettings()

  // If tooltips are disabled, just render the children without the tooltip wrapper
  if (!settings.ui.showTooltips) {
    return children
  }

  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset}>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
