"use client"

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// ============================================
// TYPES
// ============================================

export type FontCategory =
  | 'luxury' | 'script' | 'modern' | 'retro'
  | 'display' | 'tech' | 'art-deco' | 'gothic'
  | 'grunge' | 'bold'

export interface FancyFontStyle {
  id: string
  name: string
  category: FontCategory
  description: string
  promptDescription: string
  fallbackPreview: string // CSS font-family fallback
  tags: string[]
}

// ============================================
// FONT DATA (40+ styles)
// ============================================

export const FANCY_FONT_STYLES: FancyFontStyle[] = [
  // LUXURY
  {
    id: 'didot',
    name: 'Didot',
    category: 'luxury',
    description: 'Classic luxury fashion typography',
    promptDescription: 'elegant Didot high-contrast luxury serif typography with thin serifs',
    fallbackPreview: "'Didot', 'Playfair Display', 'Times New Roman', serif",
    tags: ['elegant', 'fashion', 'premium', 'high-contrast']
  },
  {
    id: 'bodoni',
    name: 'Bodoni',
    category: 'luxury',
    description: 'Elegant high contrast serif',
    promptDescription: 'sophisticated Bodoni serif typography with dramatic thick-thin contrast',
    fallbackPreview: "'Bodoni MT', 'Playfair Display', serif",
    tags: ['elegant', 'classic', 'dramatic']
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    category: 'luxury',
    description: 'Sophisticated transitional serif',
    promptDescription: 'refined Playfair Display elegant serif with subtle curves',
    fallbackPreview: "'Playfair Display', 'Georgia', serif",
    tags: ['sophisticated', 'refined', 'editorial']
  },
  {
    id: 'cormorant',
    name: 'Cormorant',
    category: 'luxury',
    description: 'Refined elegant Garamond-style',
    promptDescription: 'graceful Cormorant Garamond-style elegant serif typography',
    fallbackPreview: "'Cormorant Garamond', 'Garamond', serif",
    tags: ['graceful', 'refined', 'classic']
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    category: 'luxury',
    description: 'Ancient Roman luxury',
    promptDescription: 'majestic Cinzel Roman-inspired capital letters with elegant serifs',
    fallbackPreview: "'Cinzel', 'Trajan Pro', serif",
    tags: ['roman', 'ancient', 'majestic', 'capitals']
  },
  {
    id: 'trajan',
    name: 'Trajan Pro',
    category: 'luxury',
    description: 'Premium cinematic serif',
    promptDescription: 'premium Trajan Pro Roman column-inspired capitals, movie poster style',
    fallbackPreview: "'Trajan Pro', 'Cinzel', serif",
    tags: ['cinematic', 'premium', 'movie', 'capitals']
  },

  // SCRIPT
  {
    id: 'great-vibes',
    name: 'Great Vibes',
    category: 'script',
    description: 'Flowing elegant script',
    promptDescription: 'flowing Great Vibes elegant cursive script with dramatic flourishes',
    fallbackPreview: "'Great Vibes', 'Brush Script MT', cursive",
    tags: ['flowing', 'elegant', 'cursive', 'flourishes']
  },
  {
    id: 'pacifico',
    name: 'Pacifico',
    category: 'script',
    description: 'Casual brush script',
    promptDescription: 'casual Pacifico retro brush script with friendly curves',
    fallbackPreview: "'Pacifico', 'Brush Script MT', cursive",
    tags: ['casual', 'brush', 'retro', 'friendly']
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    category: 'script',
    description: 'Lively bouncy cursive',
    promptDescription: 'lively Dancing Script bouncy cursive with playful baseline',
    fallbackPreview: "'Dancing Script', cursive",
    tags: ['lively', 'bouncy', 'playful']
  },
  {
    id: 'alex-brush',
    name: 'Alex Brush',
    category: 'script',
    description: 'Romantic calligraphy',
    promptDescription: 'romantic Alex Brush flowing calligraphy script',
    fallbackPreview: "'Alex Brush', cursive",
    tags: ['romantic', 'calligraphy', 'wedding']
  },
  {
    id: 'allura',
    name: 'Allura',
    category: 'script',
    description: 'Wedding-style formal script',
    promptDescription: 'formal Allura wedding invitation calligraphy script',
    fallbackPreview: "'Allura', cursive",
    tags: ['formal', 'wedding', 'invitation']
  },
  {
    id: 'sacramento',
    name: 'Sacramento',
    category: 'script',
    description: 'Thin elegant monoline script',
    promptDescription: 'thin Sacramento elegant monoline script with consistent stroke',
    fallbackPreview: "'Sacramento', cursive",
    tags: ['thin', 'monoline', 'elegant']
  },

  // MODERN
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'modern',
    description: 'Clean geometric sans-serif',
    promptDescription: 'clean Montserrat geometric sans-serif with urban modern feel',
    fallbackPreview: "'Montserrat', 'Arial', sans-serif",
    tags: ['clean', 'geometric', 'urban', 'versatile']
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'modern',
    description: 'Friendly geometric modern',
    promptDescription: 'friendly Poppins geometric sans-serif with perfect circles',
    fallbackPreview: "'Poppins', 'Arial', sans-serif",
    tags: ['friendly', 'geometric', 'rounded']
  },
  {
    id: 'raleway',
    name: 'Raleway',
    category: 'modern',
    description: 'Elegant thin modern',
    promptDescription: 'elegant Raleway thin weight modern sans-serif',
    fallbackPreview: "'Raleway', 'Arial', sans-serif",
    tags: ['elegant', 'thin', 'sophisticated']
  },
  {
    id: 'futura',
    name: 'Futura',
    category: 'modern',
    description: 'Classic geometric Bauhaus',
    promptDescription: 'classic Futura Bauhaus geometric sans-serif with perfect shapes',
    fallbackPreview: "'Futura', 'Century Gothic', sans-serif",
    tags: ['bauhaus', 'geometric', 'classic', 'iconic']
  },
  {
    id: 'avant-garde',
    name: 'Avant Garde',
    category: 'modern',
    description: 'Bold geometric display',
    promptDescription: 'bold ITC Avant Garde geometric sans-serif with tight letter spacing',
    fallbackPreview: "'Avant Garde', 'Century Gothic', sans-serif",
    tags: ['bold', 'geometric', 'tight']
  },

  // RETRO
  {
    id: 'bebas-neue',
    name: 'Bebas Neue',
    category: 'retro',
    description: 'Tall condensed impact',
    promptDescription: 'tall Bebas Neue condensed all-caps headline typography',
    fallbackPreview: "'Bebas Neue', 'Impact', sans-serif",
    tags: ['tall', 'condensed', 'impact', 'headline']
  },
  {
    id: 'oswald',
    name: 'Oswald',
    category: 'retro',
    description: 'Strong condensed headline',
    promptDescription: 'strong Oswald condensed gothic headline typography',
    fallbackPreview: "'Oswald', 'Arial Narrow', sans-serif",
    tags: ['strong', 'condensed', 'gothic']
  },
  {
    id: 'righteous',
    name: 'Righteous',
    category: 'retro',
    description: '70s groovy rounded',
    promptDescription: 'groovy Righteous 1970s rounded retro display typography',
    fallbackPreview: "'Righteous', sans-serif",
    tags: ['70s', 'groovy', 'rounded', 'retro']
  },
  {
    id: 'alfa-slab',
    name: 'Alfa Slab One',
    category: 'retro',
    description: 'Bold chunky slab serif',
    promptDescription: 'bold Alfa Slab One chunky vintage slab serif',
    fallbackPreview: "'Alfa Slab One', 'Rockwell', serif",
    tags: ['bold', 'chunky', 'slab', 'vintage']
  },
  {
    id: 'cooper-black',
    name: 'Cooper Black',
    category: 'retro',
    description: 'Friendly rounded vintage',
    promptDescription: 'friendly Cooper Black rounded vintage serif with soft curves',
    fallbackPreview: "'Cooper Black', serif",
    tags: ['friendly', 'rounded', 'vintage', 'soft']
  },

  // DISPLAY
  {
    id: 'lobster',
    name: 'Lobster',
    category: 'display',
    description: 'Bold connected script',
    promptDescription: 'bold Lobster connected script display with retro charm',
    fallbackPreview: "'Lobster', cursive",
    tags: ['bold', 'connected', 'retro', 'script']
  },
  {
    id: 'paytone-one',
    name: 'Paytone One',
    category: 'display',
    description: 'Rounded bold display',
    promptDescription: 'rounded Paytone One bold display with friendly curves',
    fallbackPreview: "'Paytone One', sans-serif",
    tags: ['rounded', 'bold', 'friendly']
  },
  {
    id: 'bangers',
    name: 'Bangers',
    category: 'display',
    description: 'Comic action style',
    promptDescription: 'comic Bangers action-style display typography, superhero vibe',
    fallbackPreview: "'Bangers', cursive",
    tags: ['comic', 'action', 'superhero', 'fun']
  },
  {
    id: 'fredoka-one',
    name: 'Fredoka One',
    category: 'display',
    description: 'Playful soft rounded',
    promptDescription: 'playful Fredoka One soft rounded friendly display',
    fallbackPreview: "'Fredoka One', sans-serif",
    tags: ['playful', 'soft', 'rounded', 'friendly']
  },
  {
    id: 'bungee',
    name: 'Bungee',
    category: 'display',
    description: 'Layered chromatic display',
    promptDescription: 'bold Bungee layered display with urban signage style',
    fallbackPreview: "'Bungee', cursive",
    tags: ['layered', 'urban', 'signage', 'bold']
  },

  // TECH
  {
    id: 'orbitron',
    name: 'Orbitron',
    category: 'tech',
    description: 'Sci-fi geometric',
    promptDescription: 'futuristic Orbitron sci-fi geometric display with sharp edges',
    fallbackPreview: "'Orbitron', sans-serif",
    tags: ['sci-fi', 'geometric', 'futuristic', 'space']
  },
  {
    id: 'audiowide',
    name: 'Audiowide',
    category: 'tech',
    description: 'Wide tech racing',
    promptDescription: 'wide Audiowide tech racing typography with speed lines feel',
    fallbackPreview: "'Audiowide', cursive",
    tags: ['wide', 'racing', 'speed', 'tech']
  },
  {
    id: 'exo-2',
    name: 'Exo 2',
    category: 'tech',
    description: 'Modern technological',
    promptDescription: 'modern Exo 2 technological geometric sans-serif',
    fallbackPreview: "'Exo 2', sans-serif",
    tags: ['modern', 'technological', 'geometric']
  },
  {
    id: 'rajdhani',
    name: 'Rajdhani',
    category: 'tech',
    description: 'Digital tech condensed',
    promptDescription: 'digital Rajdhani condensed tech typography with angular cuts',
    fallbackPreview: "'Rajdhani', sans-serif",
    tags: ['digital', 'condensed', 'angular']
  },
  {
    id: 'oxanium',
    name: 'Oxanium',
    category: 'tech',
    description: 'Cyber futuristic',
    promptDescription: 'cyber Oxanium futuristic display with digital aesthetic',
    fallbackPreview: "'Oxanium', cursive",
    tags: ['cyber', 'futuristic', 'digital']
  },
  {
    id: 'share-tech',
    name: 'Share Tech Mono',
    category: 'tech',
    description: 'Monospace code style',
    promptDescription: 'technical Share Tech monospace code-style typography',
    fallbackPreview: "'Share Tech Mono', 'Courier New', monospace",
    tags: ['monospace', 'code', 'technical']
  },

  // ART DECO
  {
    id: 'poiret-one',
    name: 'Poiret One',
    category: 'art-deco',
    description: 'Thin art deco geometric',
    promptDescription: 'thin Poiret One 1920s art deco geometric display',
    fallbackPreview: "'Poiret One', cursive",
    tags: ['thin', 'art-deco', '1920s', 'geometric']
  },
  {
    id: 'josefin-sans',
    name: 'Josefin Sans',
    category: 'art-deco',
    description: 'Elegant 1920s geometric',
    promptDescription: 'elegant Josefin Sans vintage 1920s geometric sans-serif',
    fallbackPreview: "'Josefin Sans', sans-serif",
    tags: ['elegant', '1920s', 'vintage', 'geometric']
  },
  {
    id: 'forum',
    name: 'Forum',
    category: 'art-deco',
    description: 'Roman-inspired deco',
    promptDescription: 'classical Forum Roman-inspired art deco serif',
    fallbackPreview: "'Forum', serif",
    tags: ['roman', 'classical', 'art-deco']
  },

  // GOTHIC
  {
    id: 'cinzel-decorative',
    name: 'Cinzel Decorative',
    category: 'gothic',
    description: 'Ornate ancient display',
    promptDescription: 'ornate Cinzel Decorative ancient Roman capitals with flourishes',
    fallbackPreview: "'Cinzel Decorative', serif",
    tags: ['ornate', 'ancient', 'flourishes', 'capitals']
  },
  {
    id: 'unifraktur',
    name: 'UnifrakturMaguntia',
    category: 'gothic',
    description: 'Traditional blackletter',
    promptDescription: 'traditional Fraktur blackletter gothic calligraphy',
    fallbackPreview: "'UnifrakturMaguntia', serif",
    tags: ['blackletter', 'gothic', 'medieval', 'calligraphy']
  },
  {
    id: 'pirata-one',
    name: 'Pirata One',
    category: 'gothic',
    description: 'Gothic pirate display',
    promptDescription: 'gothic Pirata One decorative blackletter display',
    fallbackPreview: "'Pirata One', cursive",
    tags: ['gothic', 'pirate', 'decorative']
  },

  // GRUNGE
  {
    id: 'permanent-marker',
    name: 'Permanent Marker',
    category: 'grunge',
    description: 'Hand-drawn marker',
    promptDescription: 'hand-drawn Permanent Marker casual handwriting style',
    fallbackPreview: "'Permanent Marker', cursive",
    tags: ['hand-drawn', 'marker', 'casual']
  },
  {
    id: 'rock-salt',
    name: 'Rock Salt',
    category: 'grunge',
    description: 'Rough hand scratchy',
    promptDescription: 'rough Rock Salt scratchy hand-drawn distressed typography',
    fallbackPreview: "'Rock Salt', cursive",
    tags: ['rough', 'scratchy', 'distressed']
  },
  {
    id: 'special-elite',
    name: 'Special Elite',
    category: 'grunge',
    description: 'Vintage typewriter',
    promptDescription: 'vintage Special Elite typewriter typography with ink irregularities',
    fallbackPreview: "'Special Elite', 'Courier New', monospace",
    tags: ['vintage', 'typewriter', 'irregular']
  },

  // BOLD
  {
    id: 'anton',
    name: 'Anton',
    category: 'bold',
    description: 'Ultra condensed impact',
    promptDescription: 'ultra Anton condensed impact headline typography',
    fallbackPreview: "'Anton', 'Impact', sans-serif",
    tags: ['ultra', 'condensed', 'impact', 'headline']
  },
  {
    id: 'black-ops-one',
    name: 'Black Ops One',
    category: 'bold',
    description: 'Military stencil',
    promptDescription: 'military Black Ops One stencil display typography',
    fallbackPreview: "'Black Ops One', cursive",
    tags: ['military', 'stencil', 'tactical']
  },
  {
    id: 'passion-one',
    name: 'Passion One',
    category: 'bold',
    description: 'Thick rounded display',
    promptDescription: 'thick Passion One rounded heavy display typography',
    fallbackPreview: "'Passion One', cursive",
    tags: ['thick', 'rounded', 'heavy']
  },
  {
    id: 'titan-one',
    name: 'Titan One',
    category: 'bold',
    description: 'Heavy friendly rounded',
    promptDescription: 'heavy Titan One friendly rounded slab display',
    fallbackPreview: "'Titan One', cursive",
    tags: ['heavy', 'friendly', 'rounded', 'slab']
  },
]

// ============================================
// CATEGORY CONFIG
// ============================================

export const FONT_CATEGORIES: { id: FontCategory; label: string; icon: string }[] = [
  { id: 'luxury', label: 'Luxury', icon: '👑' },
  { id: 'script', label: 'Script', icon: '✍️' },
  { id: 'modern', label: 'Modern', icon: '◼️' },
  { id: 'retro', label: 'Retro', icon: '📻' },
  { id: 'display', label: 'Display', icon: '🎨' },
  { id: 'tech', label: 'Tech', icon: '🤖' },
  { id: 'art-deco', label: 'Art Deco', icon: '🏛️' },
  { id: 'gothic', label: 'Gothic', icon: '⚔️' },
  { id: 'grunge', label: 'Grunge', icon: '🎸' },
  { id: 'bold', label: 'Bold', icon: '💪' },
]

// ============================================
// COMPONENT PROPS
// ============================================

interface FancyFontGridProps {
  brandName: string
  selectedFont: string | null
  onSelectFont: (fontId: string | null) => void
}

// ============================================
// COMPONENT
// ============================================

export function FancyFontGrid({ brandName, selectedFont, onSelectFont }: FancyFontGridProps) {
  const [activeCategory, setActiveCategory] = useState<FontCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredFont, setHoveredFont] = useState<FancyFontStyle | null>(null)

  const displayName = brandName || 'BRAND'

  const filteredFonts = useMemo(() => {
    let fonts = FANCY_FONT_STYLES

    if (activeCategory !== 'all') {
      fonts = fonts.filter(f => f.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      fonts = fonts.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.tags.some(t => t.includes(query))
      )
    }

    return fonts
  }, [activeCategory, searchQuery])

  const handleFontClick = (fontId: string) => {
    if (selectedFont === fontId) {
      onSelectFont(null)
    } else {
      onSelectFont(fontId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fonts..."
          className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-9"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {FONT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
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

      {/* Font Grid */}
      <div className="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredFonts.map((font) => (
          <button
            key={font.id}
            onClick={() => handleFontClick(font.id)}
            onMouseEnter={() => setHoveredFont(font)}
            onMouseLeave={() => setHoveredFont(null)}
            className={`relative p-3 rounded-lg border transition-all text-left group ${
              selectedFont === font.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800'
            }`}
          >
            {/* Font Preview */}
            <div
              className="text-base text-white truncate mb-1 leading-tight"
              style={{ fontFamily: font.fallbackPreview }}
            >
              {displayName}
            </div>

            {/* Font Name */}
            <div className="text-[10px] text-zinc-400 truncate">{font.name}</div>

            {/* Category Badge */}
            <div className="absolute top-1.5 right-1.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/80 text-zinc-400">
                {font.category}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Hover Preview Tooltip */}
      {hoveredFont && (
        <div className="fixed z-50 pointer-events-none" style={{
          left: '50%',
          bottom: '20%',
          transform: 'translateX(-50%)'
        }}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl min-w-[300px]">
            <div
              className="text-3xl text-white text-center mb-3"
              style={{ fontFamily: hoveredFont.fallbackPreview }}
            >
              {displayName}
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm font-medium text-white">{hoveredFont.name}</div>
              <div className="text-xs text-zinc-400">{hoveredFont.description}</div>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {hoveredFont.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Font Info */}
      {selectedFont && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300">Selected: </span>
              <span className="text-sm font-medium text-white">
                {FANCY_FONT_STYLES.find(f => f.id === selectedFont)?.name}
              </span>
            </div>
            <button
              onClick={() => onSelectFont(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredFonts.length === 0 && (
        <div className="text-center py-8 text-zinc-500 text-sm">
          No fonts found matching your search
        </div>
      )}
    </div>
  )
}

// Export helper to get font by ID
export function getFontById(id: string): FancyFontStyle | undefined {
  return FANCY_FONT_STYLES.find(f => f.id === id)
}
