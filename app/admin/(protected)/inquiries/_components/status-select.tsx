'use client'

import React, { useTransition } from 'react'
import { updateInquiryStatus } from '@/features/contact/actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { RiLoader4Line } from '@remixicon/react'

export function StatusSelect({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = React.useState(currentStatus)

  const handleStatusChange = (val: string | null) => {
    if (!val) return
    const newStatus = val as 'new' | 'read' | 'replied' | 'archived'
    setStatus(newStatus)
    startTransition(async () => {
      const res = await updateInquiryStatus(id, newStatus)
      if (res.success) {
        toast.success('Status updated')
      } else {
        toast.error('Failed to update status')
        setStatus(currentStatus)
      }
    })
  }

  return (
    <div className="relative flex items-center gap-2 justify-end">
      <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger className="h-9 text-xs font-medium w-32 bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new"><span className="text-blue-600 font-semibold">New</span></SelectItem>
          <SelectItem value="read"><span className="text-slate-600 font-semibold">Read</span></SelectItem>
          <SelectItem value="replied"><span className="text-green-600 font-semibold">Replied</span></SelectItem>
          <SelectItem value="archived"><span className="text-orange-600 font-semibold">Archived</span></SelectItem>
        </SelectContent>
      </Select>
      <div className="w-4 flex items-center justify-center">
        {isPending && <RiLoader4Line className="h-4 w-4 animate-spin text-slate-400" />}
      </div>
    </div>
  )
}
