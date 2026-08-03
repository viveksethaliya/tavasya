'use client'

import React from 'react'
import Image from 'next/image'
import { getMediaList, uploadMedia } from '../actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { RiImageLine, RiUploadLine, RiCheckLine, RiCloseLine } from '@remixicon/react'

interface MediaItem {
  id: string
  file_url: string
  file_name: string
  alt_text: string | null
}

interface MediaPickerModalProps {
  value?: string | null
  onChange: (id: string, item?: MediaItem) => void
  trigger?: React.ReactNode
}

export function MediaPickerModal({ value, onChange, trigger }: MediaPickerModalProps) {
  const [open, setOpen] = React.useState(false)
  const [media, setMedia] = React.useState<MediaItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [tab, setTab] = React.useState<'library' | 'upload'>('library')
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Find the currently selected item for preview
  const selectedItem = media.find((m) => m.id === value)

  const fetchMedia = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getMediaList()
    if (res.success && res.data) {
      setMedia(res.data as MediaItem[])
    } else {
      setError((res as { error?: { message?: string } }).error?.message ?? 'Failed to load media.')
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    if (open || (value && media.length === 0)) {
      fetchMedia()
    }
  }, [open, value, media.length, fetchMedia])

  const handleSelect = (id: string) => {
    onChange(id, media.find((m) => m.id === id))
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file)
      const img = new window.Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ width: 0, height: 0 })
      }
      img.src = url
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { width, height } = await getImageDimensions(file)
    const fd = new FormData()
    fd.append('file', file)
    if (width && height) {
      fd.append('width', width.toString())
      fd.append('height', height.toString())
    }
    const res = await uploadMedia(fd)
    if (res.success && res.data) {
      toast.success('Uploaded')
      const newItem = res.data as MediaItem
      setMedia((prev) => [newItem, ...prev])
      onChange(newItem.id, newItem)
      setOpen(false)
    } else {
      toast.error(res.error?.message ?? 'Upload failed')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        // Ensure trigger element is a valid React Element to use with render prop
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <div 
          role="button" 
          tabIndex={0} 
          className="cursor-pointer w-full text-left focus:outline-none block"
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          <div className="relative w-full border rounded-xl overflow-hidden bg-slate-50 hover:border-[#324E64]/50 transition-colors">
            {selectedItem ? (
              <div className="relative aspect-video group">
                <Image
                  src={selectedItem.file_url}
                  alt={selectedItem.alt_text ?? selectedItem.file_name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <span className="text-white text-sm font-medium">Change</span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <RiCloseLine className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <RiImageLine className="h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-400">Select Image</p>
              </div>
            )}
          </div>
        </div>
      )}

      <DialogContent className="sm:max-w-7xl max-h-[400vh] flex flex-col p-0 font-sans">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Select Media</DialogTitle>
          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              size="sm"
              variant={tab === 'library' ? 'default' : 'outline'}
              onClick={() => setTab('library')}
            >
              <RiImageLine className="mr-1.5 h-4 w-4" /> Library
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tab === 'upload' ? 'default' : 'outline'}
              onClick={() => setTab('upload')}
            >
              <RiUploadLine className="mr-1.5 h-4 w-4" /> Upload New
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'upload' ? (
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload media"
              className="border-2 border-dashed border-[#324E64]/30 rounded-2xl p-12 text-center cursor-pointer hover:border-[#324E64]/60 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleUpload} />
              <RiUploadLine className="h-12 w-12 mx-auto text-[#324E64]/40 mb-4" />
              <p className="text-sm font-medium text-[#324E64]">
                {uploading ? 'Uploading...' : 'Click to select or drag & drop'}
              </p>
              <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP, SVG — max 10 MB</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
              <p className="font-medium text-sm">Error Loading Media</p>
              <p className="text-sm mt-1">{error}</p>
              <Button type="button" variant="outline" className="mt-4 border-red-200 text-red-600 hover:bg-red-100" onClick={fetchMedia}>
                Try Again
              </Button>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <RiImageLine className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No images yet. Upload one first.</p>
              <Button type="button" variant="outline" className="mt-4" onClick={() => setTab('upload')}>
                Upload Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {media.map((item) => {
                const selected = value === item.id
                return (
                  <div
                    key={item.id}
                    className={`relative aspect-square border-2 rounded-xl overflow-hidden cursor-pointer transition-all ${selected
                      ? 'border-[#F3BA43] ring-2 ring-[#F3BA43]/50 shadow-md'
                      : 'border-transparent hover:border-[#324E64]/40'
                      }`}
                    onClick={() => handleSelect(item.id)}
                  >
                    <Image
                      src={item.file_url}
                      alt={item.alt_text ?? item.file_name}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                    {selected && (
                      <div className="absolute inset-0 bg-[#F3BA43]/20 flex items-center justify-center">
                        <div className="bg-[#F3BA43] rounded-full p-1">
                          <RiCheckLine className="h-4 w-4 text-[#324E64]" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
