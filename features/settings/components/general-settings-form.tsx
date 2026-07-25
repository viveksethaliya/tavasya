'use client'

import React from 'react'
import { updateGeneralSettings } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface SiteSettings {
  site_name: string | null
  company_legal_name: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  social_links: Record<string, string> | null
}

export function GeneralSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [pending, setPending] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateGeneralSettings(formData)
    if (res.success) toast.success('Settings saved')
    else toast.error(res.error?.message ?? 'Failed to save')
    setPending(false)
  }

  const socials = (settings?.social_links as Record<string, string>) ?? {}

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="site_name">Site Name *</Label>
        <Input id="site_name" name="site_name" defaultValue={settings?.site_name ?? ''} placeholder="Meridian Machine Works" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company_legal_name">Company Legal Name</Label>
        <Input id="company_legal_name" name="company_legal_name" defaultValue={settings?.company_legal_name ?? ''} placeholder="Meridian Machine Works Pvt. Ltd." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input id="contact_email" name="contact_email" type="email" defaultValue={settings?.contact_email ?? ''} placeholder="contact@meridian.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input id="contact_phone" name="contact_phone" defaultValue={settings?.contact_phone ?? ''} placeholder="+1 (555) 000-0000" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={settings?.address ?? ''} placeholder="123 Industrial Blvd, Detroit, MI 48201" className="min-h-[80px]" />
      </div>

      <div className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-semibold text-[#324E64]">Social Links</h3>
        <div className="space-y-3">
          {[
            { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...' },
            { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
            { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
          ].map((s) => (
            <div key={s.key} className="space-y-2">
              <Label htmlFor={`social_${s.key}`}>{s.label}</Label>
              <Input id={`social_${s.key}`} name={`social_${s.key}`} defaultValue={socials[s.key] ?? ''} placeholder={s.placeholder} />
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={pending} className="bg-[#324E64] hover:bg-[#324E64]/90">
        {pending ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  )
}
