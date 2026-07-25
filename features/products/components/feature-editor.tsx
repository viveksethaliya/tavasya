'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { IconButton } from '@/components/ui/icon-button'
import { Button } from '@/components/ui/button'
import { RiDeleteBinLine, RiAddLine, RiDraggable } from '@remixicon/react'

export interface Feature {
  id?: string
  feature_text: string
}

interface FeatureEditorProps {
  value: Feature[]
  onChange: (features: Feature[]) => void
}

export function FeatureEditor({ value, onChange }: FeatureEditorProps) {
  const addRow = () => onChange([...value, { feature_text: '' }])
  const removeRow = (index: number) => onChange(value.filter((_, i) => i !== index))
  const updateRow = (index: number, text: string) => {
    const updated = [...value]
    updated[index] = { ...updated[index], feature_text: text }
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4 border-dashed border-2 rounded-xl">
          No features yet. Add bullet points below.
        </p>
      ) : (
        <div className="space-y-2">
          {value.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <RiDraggable className="h-4 w-4 text-slate-300 cursor-grab flex-shrink-0" />
              <span className="text-[#F3BA43] font-bold text-lg leading-none flex-shrink-0">•</span>
              <Input
                placeholder="e.g. High-speed precision spindle"
                value={feature.feature_text}
                onChange={(e) => updateRow(i, e.target.value)}
                className="h-9 text-sm flex-1"
              />
              <IconButton
                aria-label="Remove feature"
                variant="destructive"
                icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
                className="h-9 w-9 flex-shrink-0"
                onClick={() => removeRow(i)}
              />
            </div>
          ))}
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="mt-2">
        <RiAddLine className="mr-1.5 h-4 w-4" /> Add Feature
      </Button>
    </div>
  )
}
