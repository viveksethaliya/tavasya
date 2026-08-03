'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { IconButton } from '@/components/ui/icon-button'
import { MediaPickerModal } from '@/features/media/components/media-picker-modal'
import { addProductImage, removeProductImage, setPrimaryImage } from '../actions'
import { toast } from 'sonner'
import { RiDeleteBinLine, RiStarLine, RiStarFill, RiAddLine, RiDraggable } from '@remixicon/react'
import { updateProductImageOrder } from '../actions'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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


interface SortableImageItemProps {
  img: GalleryImage;
  isPrimary: boolean;
  loading: string | null;
  handleSetPrimary: (id: string) => void;
  handleRemove: (imgId: string, mediaId: string) => void;
}

function SortableImageItem({ img, isPrimary, loading, handleSetPrimary, handleRemove }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group rounded-xl overflow-hidden border-2 transition-all ${isPrimary ? 'border-[#F3BA43] shadow-md' : 'border-slate-100'}`}>
      <div {...attributes} {...listeners} className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1.5 rounded-md cursor-grab shadow-sm">
        <RiDraggable className="h-4 w-4 text-slate-600" />
      </div>
      <div className="aspect-square relative bg-slate-50">
        <Image
          src={img.media!.file_url}
          alt={img.media!.alt_text ?? img.media!.file_name}
          fill
          className="object-cover"
          sizes="200px"
        />
      </div>
      {isPrimary && (
        <div className="absolute bottom-2 left-2 bg-[#F3BA43] text-[#324E64] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
          <RiStarFill className="h-3 w-3" /> Primary
        </div>
      )}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
  );
}

export function ProductImageGallery({ productId, initialImages, primaryImageId, onPrimaryChange }: ProductImageGalleryProps) {
  const router = useRouter()
  const [images, setImages] = React.useState<GalleryImage[]>(initialImages)
  const [primaryId, setPrimaryId] = React.useState<string | null>(primaryImageId)
  const [loading, setLoading] = React.useState<string | null>(null)

    const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)
      const newImages = arrayMove(images, oldIndex, newIndex)
      setImages(newImages)
      
      // Update order in DB
      setLoading('reorder')
      await updateProductImageOrder(productId, newImages.map(img => img.id))
      setLoading(null)
    }
  }

  const handleAddImage = async (mediaId: string, mediaItem?: any) => {
    if (images.some((img) => img.media_id === mediaId)) {
      toast.warning('This image is already in the gallery')
      return
    }
    setLoading('add')
    const res = await addProductImage(productId, mediaId)
    if (res.success && res.data) {
      toast.success('Image added')
      
      const newImage: GalleryImage = {
        id: res.data.id,
        media_id: mediaId,
        sort_order: images.length,
        media: mediaItem ? {
          id: mediaItem.id,
          file_url: mediaItem.file_url,
          file_name: mediaItem.file_name,
          alt_text: mediaItem.alt_text
        } : null
      }
      setImages(prev => [...prev, newImage])
      router.refresh()
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => {
              if (!img.media) return null
              const isPrimary = primaryId === img.media_id
              return (
                <SortableImageItem key={img.id} img={img} isPrimary={isPrimary} loading={loading} handleSetPrimary={handleSetPrimary} handleRemove={handleRemove} />
              )
            })}

            {/* Add image button */}
            <div className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center hover:border-[#324E64]/40 transition-colors">
              <MediaPickerModal
                onChange={handleAddImage}
                trigger={
                  <button type="button" className="flex flex-col items-center gap-2 text-slate-400 hover:text-[#324E64] transition-colors w-full h-full justify-center">
                    <RiAddLine className="h-8 w-8" />
                    <span className="text-xs font-medium">Add Image</span>
                  </button>
                }
              />
            </div>
          </div>
        </SortableContext>
      </DndContext>

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-xl text-slate-400">
          <p className="text-sm">No images yet. Add images from the media library above.</p>
        </div>
      )}
    </div>
  )
}
