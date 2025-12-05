"use client"

import { useState } from 'react'
import { Search, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

// ============================================
// TYPES
// ============================================

export type IconStyle =
  | 'none'
  // Abstract & Geometric
  | 'abstract-circle' | 'abstract-triangle' | 'abstract-hexagon' | 'abstract-wave'
  | 'geometric-cube' | 'geometric-pyramid' | 'geometric-diamond' | 'geometric-infinity'
  // Nature
  | 'leaf' | 'tree' | 'flower' | 'sun' | 'moon' | 'star' | 'mountain' | 'wave'
  // Technology
  | 'chip' | 'circuit' | 'code' | 'wifi' | 'cloud' | 'database' | 'rocket'
  // Business
  | 'chart' | 'briefcase' | 'handshake' | 'target' | 'trophy' | 'crown' | 'shield'
  // Communication
  | 'globe' | 'message' | 'mail' | 'phone' | 'megaphone'
  // Creative
  | 'palette' | 'camera' | 'music' | 'film' | 'pen' | 'lightbulb'
  // Symbols
  | 'heart' | 'fire' | 'lightning' | 'arrow-up' | 'arrow-right' | 'check' | 'plus'

export type IconPosition =
  | 'before-text'
  | 'after-text'
  | 'above-text'
  | 'below-text'
  | 'left-of-text'
  | 'right-of-text'
  | 'behind-text'
  | 'replace-first-letter'
  | 'integrated'

export interface IconOption {
  id: IconStyle
  label: string
  category: 'abstract' | 'nature' | 'tech' | 'business' | 'communication' | 'creative' | 'symbols'
  emoji: string
  promptDescription: string
}

export interface PositionOption {
  id: IconPosition
  label: string
  icon: string
  description: string
  promptDescription: string
}

// ============================================
// ICON OPTIONS
// ============================================

export const ICON_OPTIONS: IconOption[] = [
  { id: 'none', label: 'None', category: 'abstract', emoji: '—', promptDescription: '' },

  // Abstract & Geometric
  { id: 'abstract-circle', label: 'Circle', category: 'abstract', emoji: '⭕', promptDescription: 'abstract circular ring icon' },
  { id: 'abstract-triangle', label: 'Triangle', category: 'abstract', emoji: '△', promptDescription: 'abstract triangle icon' },
  { id: 'abstract-hexagon', label: 'Hexagon', category: 'abstract', emoji: '⬡', promptDescription: 'abstract hexagon icon' },
  { id: 'abstract-wave', label: 'Wave', category: 'abstract', emoji: '〰️', promptDescription: 'abstract flowing wave icon' },
  { id: 'geometric-cube', label: 'Cube', category: 'abstract', emoji: '🧊', promptDescription: 'geometric 3D cube icon' },
  { id: 'geometric-pyramid', label: 'Pyramid', category: 'abstract', emoji: '🔺', promptDescription: 'geometric pyramid icon' },
  { id: 'geometric-diamond', label: 'Diamond', category: 'abstract', emoji: '💎', promptDescription: 'geometric diamond shape icon' },
  { id: 'geometric-infinity', label: 'Infinity', category: 'abstract', emoji: '∞', promptDescription: 'infinity symbol icon' },

  // Nature
  { id: 'leaf', label: 'Leaf', category: 'nature', emoji: '🍃', promptDescription: 'natural leaf icon' },
  { id: 'tree', label: 'Tree', category: 'nature', emoji: '🌳', promptDescription: 'tree icon' },
  { id: 'flower', label: 'Flower', category: 'nature', emoji: '🌸', promptDescription: 'flower blossom icon' },
  { id: 'sun', label: 'Sun', category: 'nature', emoji: '☀️', promptDescription: 'sun rays icon' },
  { id: 'moon', label: 'Moon', category: 'nature', emoji: '🌙', promptDescription: 'crescent moon icon' },
  { id: 'star', label: 'Star', category: 'nature', emoji: '⭐', promptDescription: 'star icon' },
  { id: 'mountain', label: 'Mountain', category: 'nature', emoji: '🏔️', promptDescription: 'mountain peak icon' },
  { id: 'wave', label: 'Ocean Wave', category: 'nature', emoji: '🌊', promptDescription: 'ocean wave icon' },

  // Technology
  { id: 'chip', label: 'Chip', category: 'tech', emoji: '🔲', promptDescription: 'computer chip icon' },
  { id: 'circuit', label: 'Circuit', category: 'tech', emoji: '⚡', promptDescription: 'circuit board pattern icon' },
  { id: 'code', label: 'Code', category: 'tech', emoji: '💻', promptDescription: 'code brackets icon' },
  { id: 'wifi', label: 'WiFi', category: 'tech', emoji: '📶', promptDescription: 'wifi signal icon' },
  { id: 'cloud', label: 'Cloud', category: 'tech', emoji: '☁️', promptDescription: 'cloud computing icon' },
  { id: 'database', label: 'Database', category: 'tech', emoji: '🗄️', promptDescription: 'database storage icon' },
  { id: 'rocket', label: 'Rocket', category: 'tech', emoji: '🚀', promptDescription: 'rocket launch icon' },

  // Business
  { id: 'chart', label: 'Chart', category: 'business', emoji: '📈', promptDescription: 'growth chart icon' },
  { id: 'briefcase', label: 'Briefcase', category: 'business', emoji: '💼', promptDescription: 'briefcase icon' },
  { id: 'handshake', label: 'Handshake', category: 'business', emoji: '🤝', promptDescription: 'handshake partnership icon' },
  { id: 'target', label: 'Target', category: 'business', emoji: '🎯', promptDescription: 'target bullseye icon' },
  { id: 'trophy', label: 'Trophy', category: 'business', emoji: '🏆', promptDescription: 'trophy award icon' },
  { id: 'crown', label: 'Crown', category: 'business', emoji: '👑', promptDescription: 'royal crown icon' },
  { id: 'shield', label: 'Shield', category: 'business', emoji: '🛡️', promptDescription: 'protective shield icon' },

  // Communication
  { id: 'globe', label: 'Globe', category: 'communication', emoji: '🌐', promptDescription: 'world globe icon' },
  { id: 'message', label: 'Message', category: 'communication', emoji: '💬', promptDescription: 'chat message bubble icon' },
  { id: 'mail', label: 'Mail', category: 'communication', emoji: '✉️', promptDescription: 'email envelope icon' },
  { id: 'phone', label: 'Phone', category: 'communication', emoji: '📱', promptDescription: 'phone icon' },
  { id: 'megaphone', label: 'Megaphone', category: 'communication', emoji: '📢', promptDescription: 'megaphone announcement icon' },

  // Creative
  { id: 'palette', label: 'Palette', category: 'creative', emoji: '🎨', promptDescription: 'artist palette icon' },
  { id: 'camera', label: 'Camera', category: 'creative', emoji: '📷', promptDescription: 'camera icon' },
  { id: 'music', label: 'Music', category: 'creative', emoji: '🎵', promptDescription: 'music note icon' },
  { id: 'film', label: 'Film', category: 'creative', emoji: '🎬', promptDescription: 'film clapperboard icon' },
  { id: 'pen', label: 'Pen', category: 'creative', emoji: '🖊️', promptDescription: 'pen writing icon' },
  { id: 'lightbulb', label: 'Lightbulb', category: 'creative', emoji: '💡', promptDescription: 'lightbulb idea icon' },

  // Symbols
  { id: 'heart', label: 'Heart', category: 'symbols', emoji: '❤️', promptDescription: 'heart icon' },
  { id: 'fire', label: 'Fire', category: 'symbols', emoji: '🔥', promptDescription: 'fire flame icon' },
  { id: 'lightning', label: 'Lightning', category: 'symbols', emoji: '⚡', promptDescription: 'lightning bolt icon' },
  { id: 'arrow-up', label: 'Arrow Up', category: 'symbols', emoji: '⬆️', promptDescription: 'upward arrow icon' },
  { id: 'arrow-right', label: 'Arrow Right', category: 'symbols', emoji: '➡️', promptDescription: 'forward arrow icon' },
  { id: 'check', label: 'Check', category: 'symbols', emoji: '✓', promptDescription: 'checkmark icon' },
  { id: 'plus', label: 'Plus', category: 'symbols', emoji: '➕', promptDescription: 'plus symbol icon' },
]

export const ICON_CATEGORIES = [
  { id: 'abstract' as const, label: 'Abstract', icon: '◇' },
  { id: 'nature' as const, label: 'Nature', icon: '🌿' },
  { id: 'tech' as const, label: 'Tech', icon: '💻' },
  { id: 'business' as const, label: 'Business', icon: '💼' },
  { id: 'communication' as const, label: 'Comm', icon: '💬' },
  { id: 'creative' as const, label: 'Creative', icon: '🎨' },
  { id: 'symbols' as const, label: 'Symbols', icon: '✦' },
]

export const POSITION_OPTIONS: PositionOption[] = [
  { id: 'before-text', label: 'Before', icon: '◀ A', description: 'Icon before text', promptDescription: 'icon positioned before the text' },
  { id: 'after-text', label: 'After', icon: 'A ▶', description: 'Icon after text', promptDescription: 'icon positioned after the text' },
  { id: 'above-text', label: 'Above', icon: '▲', description: 'Icon above text', promptDescription: 'icon positioned above the text' },
  { id: 'below-text', label: 'Below', icon: '▼', description: 'Icon below text', promptDescription: 'icon positioned below the text' },
  { id: 'left-of-text', label: 'Left', icon: '◀', description: 'Icon on left side', promptDescription: 'icon on the left side of the text' },
  { id: 'right-of-text', label: 'Right', icon: '▶', description: 'Icon on right side', promptDescription: 'icon on the right side of the text' },
  { id: 'behind-text', label: 'Behind', icon: '▣', description: 'Icon as background', promptDescription: 'large icon behind the text as watermark' },
  { id: 'replace-first-letter', label: 'Replace 1st', icon: '★A', description: 'Replace first letter', promptDescription: 'icon replacing the first letter of the text' },
  { id: 'integrated', label: 'Integrated', icon: '⊛', description: 'Woven into design', promptDescription: 'icon seamlessly integrated into the logo design' },
]

// ============================================
// COMPONENT PROPS
// ============================================

interface IconSelectorProps {
  selectedIcon: IconStyle | null
  selectedPosition: IconPosition | null
  onIconChange: (icon: IconStyle | null) => void
  onPositionChange: (position: IconPosition | null) => void
}

// ============================================
// COMPONENT
// ============================================

export function IconSelector({
  selectedIcon,
  selectedPosition,
  onIconChange,
  onPositionChange,
}: IconSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | typeof ICON_CATEGORIES[number]['id']>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIcons = ICON_OPTIONS.filter(icon => {
    if (icon.id === 'none') return true
    if (activeCategory !== 'all' && icon.category !== activeCategory) return false
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return icon.label.toLowerCase().includes(query) ||
             icon.category.includes(query)
    }
    return true
  })

  const handleIconClick = (iconId: IconStyle) => {
    if (selectedIcon === iconId) {
      onIconChange(null)
      onPositionChange(null)
    } else if (iconId === 'none') {
      onIconChange(null)
      onPositionChange(null)
    } else {
      onIconChange(iconId)
      if (!selectedPosition) {
        onPositionChange('before-text')
      }
    }
  }

  const selectedIconInfo = ICON_OPTIONS.find(i => i.id === selectedIcon)

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search icons..."
          className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-8 text-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {ICON_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Icon Grid */}
      <div className="grid grid-cols-6 gap-1.5 max-h-[180px] overflow-y-auto p-1">
        {filteredIcons.map((icon) => (
          <button
            key={icon.id}
            onClick={() => handleIconClick(icon.id)}
            className={`p-2 rounded-lg border transition-all flex flex-col items-center ${
              selectedIcon === icon.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
            }`}
            title={icon.label}
          >
            <span className="text-xl">{icon.emoji}</span>
            <span className="text-[8px] text-zinc-400 truncate w-full text-center mt-0.5">
              {icon.label}
            </span>
          </button>
        ))}
      </div>

      {/* Position Selector (only when icon selected) */}
      {selectedIcon && selectedIcon !== 'none' && (
        <div className="space-y-2 pt-2 border-t border-zinc-700">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            Icon Position
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {POSITION_OPTIONS.map((pos) => (
              <button
                key={pos.id}
                onClick={() => onPositionChange(pos.id)}
                className={`p-2 rounded-lg border transition-all text-center ${
                  selectedPosition === pos.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="text-sm font-mono text-white">{pos.icon}</div>
                <div className="text-[9px] text-zinc-400">{pos.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Summary */}
      {selectedIconInfo && selectedIconInfo.id !== 'none' && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedIconInfo.emoji}</span>
              <div>
                <div className="text-sm font-medium text-white">{selectedIconInfo.label}</div>
                <div className="text-xs text-zinc-400">
                  {POSITION_OPTIONS.find(p => p.id === selectedPosition)?.description || 'Select position'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onIconChange(null)
                onPositionChange(null)
              }}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper exports
export function getIconById(id: IconStyle): IconOption | undefined {
  return ICON_OPTIONS.find(i => i.id === id)
}

export function getPositionById(id: IconPosition): PositionOption | undefined {
  return POSITION_OPTIONS.find(p => p.id === id)
}

export function getIconPromptDescription(iconId: IconStyle | null, positionId: IconPosition | null): string {
  if (!iconId || iconId === 'none') return ''

  const icon = ICON_OPTIONS.find(i => i.id === iconId)
  const position = POSITION_OPTIONS.find(p => p.id === positionId)

  if (!icon) return ''

  let prompt = `Include a ${icon.promptDescription}`
  if (position) {
    prompt += ` ${position.promptDescription}`
  }

  return prompt
}
