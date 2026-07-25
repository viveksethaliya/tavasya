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
  onChange: (id: string) => void
  trigger?: React.ReactNode
}

export function MediaPickerModal({ value, onChange, trigger }: MediaPickerModalProps) {
  const [open, setOpen] = React.useState(false)
  const [media, setMedia] = React.useState<MediaItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [tab, setTab] = React.useState<'library' | 'upload'>('library')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Find the currently selected item for preview
  const selectedItem = media.find((m) => m.id === value)

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true)
      getMediaList().then((res) => {
        if (res.success && res.data) setMedia(res.data as MediaItem[])
        setLoading(false)
      })
    }
  }, [open])

  const handleSelect = (id: string) => {
    onChange(id)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await uploadMedia(fd)
    if (res.success && res.data) {
      toast.success('Uploaded')
      const newItem = res.data as MediaItem
      setMedia((prev) => [newItem, ...prev])
      onChange(newItem.id)
      setOpen(false)
    } else {
      toast.error(res.error?.message ?? 'Upload failed')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<div className="cursor-pointer" />}>
          {trigger || (
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
          )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
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
              className="border-2 border-dashed border-[#324E64]/30 rounded-2xl p-12 text-center cursor-pointer hover:border-[#324E64]/60 transition-colors"
              onClick={() => fileInputRef.current?.click()}
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
                    className={`relative aspect-square border-2 rounded-xl overflow-hidden cursor-pointer transition-all ${
                      selected
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
