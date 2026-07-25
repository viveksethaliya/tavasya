"use client"

import * as React from "react"
import { getMediaList } from "../actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RiImageLine } from "@remixicon/react"

interface MediaItem {
  id: string
  file_url: string
  file_name: string
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

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true)
      getMediaList().then((res) => {
        if (res.success && res.data) {
          setMedia(res.data)
        }
        setLoading(false)
      })
    }
  }, [open])

  const handleSelect = (id: string) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="w-full cursor-pointer">
          {trigger || (
            <Button type="button" variant="outline" className="w-full justify-start pointer-events-none">
              <RiImageLine className="mr-2 h-4 w-4" />
              {value ? "Change Image" : "Select Image"}
            </Button>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="text-center text-muted-foreground p-8">Loading media...</div>
          ) : media.length === 0 ? (
            <div className="text-center text-muted-foreground p-8 border border-dashed rounded-md bg-muted/20">
              No media found. Uploading will be available in Phase 8.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <div 
                  key={item.id} 
                  className={`relative aspect-square border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors ${value === item.id ? 'border-primary ring-2 ring-primary ring-offset-2' : ''}`}
                  onClick={() => handleSelect(item.id)}
                >
                  {/* Since we don't have next/image optimized for remote URLs easily yet, just use a standard img tag for the admin preview */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.file_url} alt={item.file_name} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
