'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { getMediaList, uploadMedia, updateMediaMeta, deleteMedia } from '../actions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { IconButton } from '@/components/ui/icon-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  RiDeleteBinLine,
  RiUploadLine,
  RiSearchLine,
  RiLayoutGridFill,
  RiListCheck,
  RiFileCopyLine,
  RiUploadCloud2Line
} from '@remixicon/react'

interface MediaItem {
  id: string
  file_url: string
  file_name: string
  alt_text: string | null
  mime_type: string | null
  size_bytes: number | null
  created_at: string
}

type ViewMode = 'grid' | 'table'
type SortOption = 'newest' | 'oldest' | 'largest' | 'smallest' | 'name_asc' | 'name_desc'

export function MediaLibraryGrid() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null)
  const [editingAlt, setEditingAlt] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async (query: string = '') => {
    setLoading(true)
    setError(null)
    const res = await getMediaList(query)
    if (res.success) {
      setMedia(res.data as MediaItem[])
    } else {
      setError((res as { error?: { message?: string } }).error?.message ?? 'Failed to load media.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchMedia, searchQuery])

  useEffect(() => {
    if (activeMedia) {
      setEditingAlt(activeMedia.alt_text || '')
    } else {
      setEditingAlt('')
    }
  }, [activeMedia])

  const sortedMedia = useMemo(() => {
    const sorted = [...media]
    switch (sortBy) {
      case 'newest': sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break
      case 'oldest': sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break
      case 'largest': sorted.sort((a, b) => (b.size_bytes || 0) - (a.size_bytes || 0)); break
      case 'smallest': sorted.sort((a, b) => (a.size_bytes || 0) - (b.size_bytes || 0)); break
      case 'name_asc': sorted.sort((a, b) => a.file_name.localeCompare(b.file_name)); break
      case 'name_desc': sorted.sort((a, b) => b.file_name.localeCompare(a.file_name)); break
    }
    return sorted
  }, [media, sortBy])

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file)
      const img = new window.Image()
      img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.width, height: img.height }) }
      img.onerror = () => { URL.revokeObjectURL(url); resolve({ width: 0, height: 0 }) }
      img.src = url
    })
  }

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    setUploading(true)
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const { width, height } = await getImageDimensions(file)
      const fd = new FormData()
      fd.append('file', file)
      if (width && height) {
        fd.append('width', width.toString())
        fd.append('height', height.toString())
      }
      const res = await uploadMedia(fd)
      if (res.success) successCount++
      else failCount++
    }

    if (successCount > 0) toast.success(`Uploaded ${successCount} image(s)`)
    if (failCount > 0) toast.error(`Failed to upload ${failCount} image(s)`)
    
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    fetchMedia(searchQuery)
  }

  const handleSaveAlt = async (id: string, newAlt: string) => {
    const res = await updateMediaMeta(id, newAlt)
    if (res.success) {
      toast.success('Alt text saved')
      setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, alt_text: newAlt } : m)))
      if (activeMedia?.id === id) setActiveMedia(prev => prev ? { ...prev, alt_text: newAlt } : null)
    } else {
      toast.error(res.error?.message ?? 'Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await deleteMedia(id)
    if (res.success) {
      toast.success('Media deleted')
      setMedia((prev) => prev.filter((m) => m.id !== id))
      if (activeMedia?.id === id) setActiveMedia(null)
    } else {
      toast.error(res.error?.message ?? 'Failed to delete')
    }
  }

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('URL copied to clipboard!')
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false) }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files) }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Upload Zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload media"
        className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
          isDragOver 
            ? 'border-[#324E64] bg-[#324E64]/5 shadow-[0_0_20px_rgba(50,78,100,0.1)] scale-[1.01]' 
            : 'border-slate-200 bg-white/50 hover:bg-white hover:border-[#324E64]/40 hover:shadow-sm'
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
            e.preventDefault(); fileInputRef.current?.click()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*" onChange={(e) => { if(e.target.files) handleUploadFiles(e.target.files) }} />
        
        {uploading ? (
           <div className="flex flex-col items-center justify-center animate-pulse">
             <RiUploadCloud2Line className="h-12 w-12 text-[#324E64] mb-4 animate-bounce" />
             <p className="text-lg font-medium text-[#324E64]">Uploading magical assets...</p>
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4 shadow-inner">
              <RiUploadLine className="h-8 w-8 text-[#324E64]/70" />
            </div>
            <p className="text-lg font-medium text-slate-800">
              Click or drag & drop to upload
            </p>
            <p className="text-sm text-slate-500 mt-2">JPEG, PNG, WebP, SVG — Upload multiple at once</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full max-w-md">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search media..."
            className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={(val) => { if (val) setSortBy(val as SortOption) }}>
            <SelectTrigger className="w-[160px] bg-slate-50/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="largest">Largest Size</SelectItem>
              <SelectItem value="smallest">Smallest Size</SelectItem>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button 
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#324E64]' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('grid')}
            >
              <RiLayoutGridFill className="h-5 w-5" />
            </button>
            <button 
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#324E64]' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('table')}
            >
              <RiListCheck className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
             <Skeleton key={i} className="aspect-square rounded-2xl bg-slate-200/50" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Error Loading Media"
          description={error}
          action={<Button variant="outline" onClick={() => fetchMedia(searchQuery)}>Try Again</Button>}
        />
      ) : sortedMedia.length === 0 ? (
        <EmptyState
          title="No media found"
          description="Try a different search or upload a new image."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {sortedMedia.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => setActiveMedia(item)}
            >
              <div className="aspect-square relative bg-slate-100 flex items-center justify-center">
                <Image
                  src={item.file_url}
                  alt={item.alt_text ?? item.file_name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                 <p className="text-white text-sm font-medium truncate drop-shadow-md">{item.file_name}</p>
                 <p className="text-white/80 text-xs drop-shadow-md">{formatBytes(item.size_bytes)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[80px]">Preview</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMedia.map((item) => (
                <TableRow key={item.id} className="group hover:bg-slate-50 cursor-pointer" onClick={() => setActiveMedia(item)}>
                  <TableCell>
                    <div className="h-12 w-12 relative rounded-md overflow-hidden bg-slate-100">
                      <Image src={item.file_url} alt={item.file_name} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">{item.file_name}</TableCell>
                  <TableCell className="text-slate-500">{formatBytes(item.size_bytes)}</TableCell>
                  <TableCell className="text-slate-500">{item.created_at ? format(new Date(item.created_at), 'MMM d, yyyy') : 'Unknown'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setActiveMedia(item); }}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={!!activeMedia} onOpenChange={(open) => !open && setActiveMedia(null)}>
        <DialogContent className="w-[80vw] h-[80vh] sm:max-w-[80vw] max-w-[80vw] overflow-hidden p-0 border border-slate-200 shadow-2xl rounded-3xl bg-white">
          {activeMedia && (
            <div className="flex flex-col md:flex-row h-full">
              {/* Image Preview Side */}
              <div className="relative w-full md:w-[55%] bg-slate-50 border-r border-slate-100 flex items-center justify-center h-full">
                <Image
                  src={activeMedia.file_url}
                  alt={activeMedia.alt_text ?? activeMedia.file_name}
                  fill
                  className="object-contain p-8 drop-shadow-sm"
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
              </div>
              
              {/* Details Side */}
              <div className="w-full md:w-[45%] p-8 flex flex-col gap-6 overflow-y-auto bg-white">
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-800 break-words leading-tight">{activeMedia.file_name}</DialogTitle>
                  <DialogDescription className="text-slate-500 mt-2">
                    Uploaded on {activeMedia.created_at ? format(new Date(activeMedia.created_at), 'PPP') : 'Unknown Date'}
                  </DialogDescription>
                </div>
                
                <div className="space-y-5">
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Size</span>
                      <span className="font-semibold text-slate-700">{formatBytes(activeMedia.size_bytes)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Type</span>
                      <span className="font-semibold text-slate-700">{activeMedia.mime_type || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file_url" className="text-slate-700 font-medium">File URL</Label>
                    <div className="flex gap-2">
                      <Input id="file_url" value={activeMedia.file_url} readOnly className="bg-slate-50 text-slate-500 font-mono text-xs focus-visible:ring-0" />
                      <IconButton 
                        icon={<RiFileCopyLine className="h-4 w-4" />} 
                        onClick={() => copyToClipboard(activeMedia.file_url)}
                        aria-label="Copy URL"
                        className="shrink-0 bg-[#324E64]/10 text-[#324E64] hover:bg-[#324E64]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alt_text" className="text-slate-700 font-medium">Alt Text (SEO)</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="alt_text" 
                        value={editingAlt} 
                        onChange={(e) => setEditingAlt(e.target.value)}
                        placeholder="Describe the image..." 
                        className="focus-visible:ring-[#324E64]/30"
                      />
                      <Button onClick={() => handleSaveAlt(activeMedia.id, editingAlt)} className="bg-[#324E64] hover:bg-[#324E64]/90 text-white shrink-0">
                        Save
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100">
                  <ConfirmDialog
                    title="Delete Image Permanently"
                    description="This action cannot be undone. Any references to this image on the storefront will be broken."
                    destructive
                    confirmText="Delete Image"
                    onConfirm={() => handleDelete(activeMedia.id)}
                    trigger={
                      <Button variant="destructive" className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-0 shadow-none">
                        <RiDeleteBinLine className="h-4 w-4 mr-2" /> Delete permanently
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
