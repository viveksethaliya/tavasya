'use client'

import React from 'react'
import Image from 'next/image'
import { getMediaList, uploadMedia, updateMediaMeta, deleteMedia } from '../actions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { IconButton } from '@/components/ui/icon-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  RiDeleteBinLine,
  RiUploadLine,
  RiCheckLine,
  RiEdit2Line,
  RiImageLine,
} from '@remixicon/react'

interface MediaItem {
  id: string
  file_url: string
  file_name: string
  alt_text: string | null
  mime_type: string | null
  size_bytes: number | null
}

export function MediaLibraryGrid() {
  const [media, setMedia] = React.useState<MediaItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingAlt, setEditingAlt] = React.useState('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const fetchMedia = React.useCallback(async () => {
    setLoading(true)
    const res = await getMediaList()
    if (res.success) setMedia(res.data as MediaItem[])
    setLoading(false)
  }, [])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMedia()
  }, [fetchMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await uploadMedia(fd)
    if (res.success) {
      toast.success('Image uploaded')
      fetchMedia()
    } else {
      toast.error(res.error?.message ?? 'Upload failed')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSaveAlt = async (id: string) => {
    const res = await updateMediaMeta(id, editingAlt)
    if (res.success) {
      toast.success('Alt text saved')
      setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, alt_text: editingAlt } : m)))
    } else {
      toast.error(res.error?.message ?? 'Failed to save')
    }
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    const res = await deleteMedia(id)
    if (res.success) {
      toast.success('Media deleted')
      setMedia((prev) => prev.filter((m) => m.id !== id))
    } else {
      toast.error(res.error?.message ?? 'Failed to delete')
    }
  }

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-[#324E64]/30 rounded-2xl p-8 text-center hover:border-[#324E64]/60 transition-colors cursor-pointer bg-white"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (!file) return
          setUploading(true)
          const fd = new FormData()
          fd.append('file', file)
          const res = await uploadMedia(fd)
          if (res.success) { toast.success('Image uploaded'); fetchMedia() }
          else toast.error(res.error?.message ?? 'Upload failed')
          setUploading(false)
        }}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        <RiUploadLine className="h-10 w-10 mx-auto text-[#324E64]/40 mb-3" />
        <p className="text-sm font-medium text-[#324E64]">
          {uploading ? 'Uploading...' : 'Click or drag & drop to upload'}
        </p>
        <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP, SVG, GIF — max 10 MB</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <EmptyState
          title="No media uploaded"
          description="Upload your first image to get started."
          action={
            <Button onClick={() => fileInputRef.current?.click()}>
              <RiUploadLine className="mr-2 h-4 w-4" /> Upload Image
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="aspect-square relative bg-slate-50">
                <Image
                  src={item.file_url}
                  alt={item.alt_text ?? item.file_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>

              {/* Actions overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton
                  aria-label="Edit alt text"
                  icon={<RiEdit2Line className="h-3.5 w-3.5" />}
                  className="h-7 w-7 bg-white shadow-sm"
                  onClick={() => { setEditingId(item.id); setEditingAlt(item.alt_text ?? '') }}
                />
                <ConfirmDialog
                  title="Delete Image"
                  description="Are you sure? This cannot be undone. Images currently in use will be blocked."
                  destructive
                  confirmText="Delete"
                  onConfirm={() => handleDelete(item.id)}
                  trigger={
                    <IconButton
                      aria-label="Delete image"
                      variant="destructive"
                      icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
                      className="h-7 w-7"
                    />
                  }
                />
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs text-slate-600 truncate font-medium">{item.file_name}</p>
                <p className="text-xs text-slate-400">{formatBytes(item.size_bytes)}</p>
                {/* Alt text edit inline */}
                {editingId === item.id ? (
                  <div className="mt-2 flex gap-1">
                    <Input
                      value={editingAlt}
                      onChange={(e) => setEditingAlt(e.target.value)}
                      placeholder="Alt text..."
                      className="h-7 text-xs"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAlt(item.id) }}
                    />
                    <IconButton
                      aria-label="Save alt text"
                      icon={<RiCheckLine className="h-3.5 w-3.5" />}
                      className="h-7 w-7 flex-shrink-0 bg-[#324E64] text-white hover:bg-[#324E64]/90"
                      onClick={() => handleSaveAlt(item.id)}
                    />
                  </div>
                ) : (
                  item.alt_text ? (
                    <p className="text-xs text-slate-400 truncate mt-0.5 italic">&quot;{item.alt_text}&quot;</p>
                  ) : (
                    <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                      <RiImageLine className="h-3 w-3" /> No alt text
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
