'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { IconButton } from '@/components/ui/icon-button'
import { Button } from '@/components/ui/button'
import { RiDeleteBinLine, RiAddLine, RiDraggable } from '@remixicon/react'

export interface Spec {
  id?: string
  spec_key: string
  spec_value: string
}

interface SpecificationEditorProps {
  value: Spec[]
  onChange: (specs: Spec[]) => void
}

export function SpecificationEditor({ value, onChange }: SpecificationEditorProps) {
  const addRow = () => onChange([...value, { spec_key: '', spec_value: '' }])
  const removeRow = (index: number) => onChange(value.filter((_, i) => i !== index))
  const updateRow = (index: number, field: 'spec_key' | 'spec_value', val: string) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: val }
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center text-xs font-medium text-slate-500 px-1 mb-1">
        <span className="w-5" />
        <span>Specification Name</span>
        <span>Value</span>
        <span className="w-8" />
      </div>
      {value.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4 border-dashed border-2 rounded-xl">
          No specifications yet. Add key-value rows below.
        </p>
      ) : (
        <div className="space-y-2">
          {value.map((spec, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
              <RiDraggable className="h-4 w-4 text-slate-300 cursor-grab" />
              <Input
                placeholder="e.g. Spindle Speed"
                value={spec.spec_key}
                onChange={(e) => updateRow(i, 'spec_key', e.target.value)}
                className="h-9 text-sm"
              />
              <Input
                placeholder="e.g. 12,000 RPM"
                value={spec.spec_value}
                onChange={(e) => updateRow(i, 'spec_value', e.target.value)}
                className="h-9 text-sm"
              />
              <IconButton
                aria-label="Remove specification"
                variant="destructive"
                icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
                className="h-9 w-9"
                onClick={() => removeRow(i)}
              />
            </div>
          ))}
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="mt-2">
        <RiAddLine className="mr-1.5 h-4 w-4" /> Add Specification
      </Button>
    </div>
  )
}
