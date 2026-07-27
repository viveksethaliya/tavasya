'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function MessageDialog({ name, message }: { name: string, message: string }) {
  const isLong = message.length > 80 || message.includes('\n')

  return (
    <Dialog>
      <div className="space-y-1">
        <p className="text-slate-700 text-sm line-clamp-2 whitespace-pre-wrap break-words">
          {message}
        </p>
        {isLong && (
          <DialogTrigger className="text-xs font-semibold text-[#F3BA43] hover:text-[#324E64] transition-colors focus:outline-none text-left">
            Read full message
          </DialogTrigger>
        )}
      </div>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-[#324E64]">Message from {name}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 p-5 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 text-sm whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto break-words shadow-inner">
          {message}
        </div>
      </DialogContent>
    </Dialog>
  )
}
