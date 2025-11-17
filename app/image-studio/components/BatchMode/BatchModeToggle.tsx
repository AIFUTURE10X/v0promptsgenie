'use client'

import { Button } from '@/components/ui/button'
import { Layers } from 'lucide-react'

interface BatchModeToggleProps {
  isActive: boolean
  onToggle: () => void
}

export function BatchModeToggle({ isActive, onToggle }: BatchModeToggleProps) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="default"
      onClick={onToggle}
      className={isActive ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' : 'border-border text-foreground'}
    >
      <Layers className="h-4 w-4 mr-2" />
      Batch Mode
    </Button>
  )
}
