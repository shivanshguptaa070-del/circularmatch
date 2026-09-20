import React, { useState } from 'react'
import { Layers } from 'lucide-react'

export const MATERIAL_IMAGE_MAP: Record<string, string> = {
  'mild-steel': '/materials/mild-steel.jpg',
  'cotton-textile': '/materials/cotton-textile.jpg',
  'cardboard-paper': '/materials/cardboard-paper.jpg',
  'pet-flakes': '/materials/pet-flakes.jpg',
  'al-scrap': '/materials/al-scrap.jpg',
  'wood-waste': '/materials/wood-waste.jpg',
}

/**
 * Returns a high-resolution photorealistic AI image path matching the material description or category.
 */
export function getMaterialImage(material?: string, category?: string, customImage?: string): string {
  if (customImage && customImage.trim() !== '') {
    return customImage
  }

  const matLower = (material || '').toLowerCase()
  const catLower = (category || '').toLowerCase()

  // 1. Keyword matching on material name
  if (matLower.includes('steel') || matLower.includes('iron') || matLower.includes('ms scrap') || matLower.includes('fabrication')) {
    return MATERIAL_IMAGE_MAP['mild-steel']
  }
  if (matLower.includes('cotton') || matLower.includes('textile') || matLower.includes('fabric') || matLower.includes('cloth') || matLower.includes('garment')) {
    return MATERIAL_IMAGE_MAP['cotton-textile']
  }
  if (matLower.includes('cardboard') || matLower.includes('paper') || matLower.includes('corrugated') || matLower.includes('kraft') || matLower.includes('occ')) {
    return MATERIAL_IMAGE_MAP['cardboard-paper']
  }
  if (matLower.includes('pet') || matLower.includes('plastic') || matLower.includes('polymer') || matLower.includes('flake') || matLower.includes('bottle')) {
    return MATERIAL_IMAGE_MAP['pet-flakes']
  }
  if (matLower.includes('alu') || matLower.includes('extrusion') || matLower.includes('6061') || matLower.includes('6063')) {
    return MATERIAL_IMAGE_MAP['al-scrap']
  }
  if (matLower.includes('wood') || matLower.includes('pallet') || matLower.includes('timber') || matLower.includes('sawdust') || matLower.includes('biomass')) {
    return MATERIAL_IMAGE_MAP['wood-waste']
  }

  // 2. Keyword matching on category
  if (catLower.includes('metal')) {
    return MATERIAL_IMAGE_MAP['mild-steel']
  }
  if (catLower.includes('textile')) {
    return MATERIAL_IMAGE_MAP['cotton-textile']
  }
  if (catLower.includes('paper') || catLower.includes('cardboard')) {
    return MATERIAL_IMAGE_MAP['cardboard-paper']
  }
  if (catLower.includes('plastic')) {
    return MATERIAL_IMAGE_MAP['pet-flakes']
  }
  if (catLower.includes('wood') || catLower.includes('biomass')) {
    return MATERIAL_IMAGE_MAP['wood-waste']
  }

  return MATERIAL_IMAGE_MAP['pet-flakes']
}

interface MaterialThumbnailProps {
  material?: string
  category?: string
  src?: string
  alt?: string
  className?: string
  sizeClassName?: string
}

/**
 * Resilient Material Thumbnail that automatically picks the right AI-generated material image
 * and gracefully falls back to a clean gradient if an external image fails.
 */
export function MaterialThumbnail({
  material,
  category,
  src,
  alt = '',
  className = '',
  sizeClassName = 'h-10 w-10',
}: MaterialThumbnailProps) {
  const [hasError, setHasError] = useState(false)
  const resolvedSrc = getMaterialImage(material, category, src)

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 ring-1 ring-emerald-200/60 ${sizeClassName} ${className}`}
      >
        <Layers className="h-4 w-4 opacity-70" />
      </div>
    )
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt || material || 'Material waste lot'}
      onError={(e) => {
        // Fallback to local default image before showing icon fallback
        const target = e.currentTarget
        if (target.src !== MATERIAL_IMAGE_MAP['pet-flakes']) {
          target.src = MATERIAL_IMAGE_MAP['pet-flakes']
        } else {
          setHasError(true)
        }
      }}
      className={`rounded-lg object-cover ring-1 ring-slate-200 transition-transform duration-300 ${sizeClassName} ${className}`}
      loading="lazy"
    />
  )
}
