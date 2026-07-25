'use client'

import React from 'react'
import Image from 'next/image'
import { IconButton } from '@/components/ui/icon-button'
import { MediaPickerModal } from '@/features/media/components/media-picker-modal'
import { addProductImage, removeProductImage, setPrimaryImage } from '../actions'
import { toast } from 'sonner'
import { RiDeleteBinLine, RiStarLine, RiStarFill, RiAddLine } from '@remixicon/react'

interface GalleryImage {
  id: string // product_images.id
  media_id: string
  sort_order: number
  media: {
    id: string
    file_url: string
    file_name: string
    alt_text: string | null
  } | null
}

interface ProductImageGalleryProps {
  productId: string
  initialImages: GalleryImage[]
  primaryImageId: string | null
  onPrimaryChange?: (mediaId: string) => void
}

export function ProductImageGallery({ productId, initialImages, primaryImageId, onPrimaryChange }: ProductImageGalleryProps) {
  const [images, setImages] = React.useState<GalleryImage[]>(initialImages)
  const [primaryId, setPrimaryId] = React.useState<string | null>(primaryImageId)
  const [loading, setLoading] = React.useState<string | null>(null)

  const handleAddImage = async (mediaId: string) => {
    if (images.some((img) => img.media_id === mediaId)) {
      toast.warning('This image is already in the gallery')
      return
    }
    setLoading('add')
    const res = await addProductImage(productId, mediaId)
    if (res.success) {
      toast.success('Image added')
      // Refresh by re-fetching would be ideal; for now optimistic update
      window.location.reload()
    } else {
      toast.error(res.error?.message ?? 'Failed to add image')
    }
    setLoading(null)
  }

  const handleRemove = async (productImageId: string, mediaId: string) => {
    setLoading(productImageId)
    const res = await removeProductImage(productImageId, productId)
    if (res.success) {
      toast.success('Image removed')
      setImages((prev) => prev.filter((img) => img.id !== productImageId))
      if (primaryId === mediaId) setPrimaryId(null)
    } else {
      toast.error(res.error?.message ?? 'Failed to remove')
    }
    setLoading(null)
  }

  const handleSetPrimary = async (mediaId: string) => {
    setLoading('primary-' + mediaId)
    const res = await setPrimaryImage(productId, mediaId)
    if (res.success) {
      toast.success('Primary image set')
      setPrimaryId(mediaId)
      onPrimaryChange?.(mediaId)
    } else {
      toast.error(res.error?.message ?? 'Failed')
    }
    setLoading(null)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => {
          if (!img.media) return null
          const isPrimary = primaryId === img.media_id
          return (
            <div key={img.id} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${isPrimary ? 'border-[#F3BA43] shadow-md' : 'border-slate-100'}`}>
              <div className="aspect-square relative bg-slate-50">
                <Image
                  src={img.media.file_url}
                  alt={img.media.alt_text ?? img.media.file_name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              {isPrimary && (
                <div className="absolute top-2 left-2 bg-[#F3BA43] text-[#324E64] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <RiStarFill className="h-3 w-3" /> Primary
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isPrimary && (
                  <IconButton
                    aria-label="Set as primary"
                    icon={<RiStarLine className="h-3.5 w-3.5" />}
                    className="h-7 w-7 bg-white shadow-sm text-[#F3BA43] hover:text-[#F3BA43]"
                    onClick={() => handleSetPrimary(img.media_id)}
                    disabled={loading !== null}
                  />
                )}
                <IconButton
                  aria-label="Remove image"
                  variant="destructive"
                  icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
                  className="h-7 w-7"
                  onClick={() => handleRemove(img.id, img.media_id)}
                  disabled={loading !== null}
                />
              </div>
            </div>
          )
        })}

        {/* Add image button */}
        <div className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center hover:border-[#324E64]/40 transition-colors">
          <MediaPickerModal
            onChange={handleAddImage}
            trigger={
              <button type="button" className="flex flex-col items-center gap-2 text-slate-400 hover:text-[#324E64] transition-colors">
                <RiAddLine className="h-8 w-8" />
                <span className="text-xs font-medium">Add Image</span>
              </button>
            }
          />
        </div>
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-xl text-slate-400">
          <p className="text-sm">No images yet. Add images from the media library above.</p>
        </div>
      )}
    </div>
  )
}
