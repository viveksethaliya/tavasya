'use client'

import React from 'react'
import { updateSeoSettings, updatePageSeo } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MediaPickerModal } from '@/features/media/components/media-picker-modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface SiteSettings {
  default_seo_title: string | null
  default_meta_description: string | null
  default_robots: string | null
  twitter_handle: string | null
  organization_schema_json: string | null
  default_og_image_id: string | null
  favicon_id: string | null
}

interface Page {
  route_key: string
  seo_title: string | null
  meta_description: string | null
  canonical_url: string | null
  robots: string | null
  keywords: string | null
}

interface SeoSettingsFormProps {
  settings: SiteSettings | null
  pages: Page[]
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Home',
  about: 'About',
  contact: 'Contact',
  'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms & Conditions',
}

export function SeoSettingsForm({ settings, pages }: SeoSettingsFormProps) {
  const [pending, setPending] = React.useState(false)
  const [ogImageId, setOgImageId] = React.useState<string | null>(settings?.default_og_image_id ?? null)
  const [faviconId, setFaviconId] = React.useState<string | null>(settings?.favicon_id ?? null)

  async function handleGlobalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    if (ogImageId) formData.set('default_og_image_id', ogImageId)
    if (faviconId) formData.set('favicon_id', faviconId)
    const res = await updateSeoSettings(formData)
    if (res.success) toast.success('SEO settings saved')
    else toast.error(res.error?.message ?? 'Failed to save')
    setPending(false)
  }

  const PAGE_ROUTE_KEYS = ['home', 'about', 'contact', 'privacy-policy', 'terms-and-conditions']

  return (
    <Tabs defaultValue="global" className="space-y-6">
      <TabsList className="bg-[#F0F2F5] p-1 rounded-xl h-auto flex-wrap gap-1">
        <TabsTrigger value="global" className="rounded-lg data-[state=active]:bg-[#324E64] data-[state=active]:text-white">
          Global Defaults
        </TabsTrigger>
        {PAGE_ROUTE_KEYS.map((key) => (
          <TabsTrigger key={key} value={key} className="rounded-lg data-[state=active]:bg-[#324E64] data-[state=active]:text-white">
            {PAGE_LABELS[key]}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Global Defaults */}
      <TabsContent value="global">
        <form onSubmit={handleGlobalSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="default_seo_title">Default SEO Title</Label>
            <Input id="default_seo_title" name="default_seo_title" defaultValue={settings?.default_seo_title ?? ''} placeholder="Meridian Machine Works — Industrial Machinery" />
            <p className="text-xs text-slate-400">Used as fallback on pages without a specific SEO title.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_meta_description">Default Meta Description</Label>
            <Textarea id="default_meta_description" name="default_meta_description" defaultValue={settings?.default_meta_description ?? ''} placeholder="Premium industrial machinery and precision machining solutions." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_robots">Default Robots</Label>
              <Select name="default_robots" defaultValue={settings?.default_robots ?? 'index,follow'}>
                <SelectTrigger id="default_robots"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="index,follow">index, follow</SelectItem>
                  <SelectItem value="noindex,follow">noindex, follow</SelectItem>
                  <SelectItem value="noindex,nofollow">noindex, nofollow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_handle">Twitter Handle</Label>
              <Input id="twitter_handle" name="twitter_handle" defaultValue={settings?.twitter_handle ?? ''} placeholder="@meridianmachines" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default OG Image</Label>
              <MediaPickerModal value={ogImageId} onChange={setOgImageId} />
              <p className="text-xs text-slate-400">Fallback social share image</p>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              <MediaPickerModal value={faviconId} onChange={setFaviconId} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_schema_json">Organization Schema JSON</Label>
            <Textarea
              id="organization_schema_json"
              name="organization_schema_json"
              defaultValue={settings?.organization_schema_json ?? ''}
              placeholder='{"@type": "Organization", "name": "Meridian Machine Works", ...}'
              className="font-mono text-xs min-h-[120px]"
            />
            <p className="text-xs text-slate-400">JSON-LD organization schema. Must be valid JSON.</p>
          </div>

          <Button type="submit" disabled={pending} className="bg-[#324E64] hover:bg-[#324E64]/90">
            {pending ? 'Saving...' : 'Save Global SEO'}
          </Button>
        </form>
      </TabsContent>

      {/* Per-page SEO */}
      {PAGE_ROUTE_KEYS.map((routeKey) => {
        const page = pages.find((p) => p.route_key === routeKey)
        return (
          <TabsContent key={routeKey} value={routeKey}>
            <PageSeoForm routeKey={routeKey} page={page ?? null} />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

function PageSeoForm({ routeKey, page }: { routeKey: string; page: Page | null }) {
  const [pending, setPending] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    const res = await updatePageSeo(routeKey, {
      seo_title: fd.get('seo_title') as string || undefined,
      meta_description: fd.get('meta_description') as string || undefined,
      canonical_url: fd.get('canonical_url') as string || undefined,
      robots: fd.get('robots') as string || undefined,
      keywords: fd.get('keywords') as string || undefined,
    })
    if (res.success) toast.success(`${PAGE_LABELS[routeKey]} SEO saved`)
    else toast.error(res.error?.message ?? 'Failed to save')
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor={`seo_title_${routeKey}`}>SEO Title</Label>
        <Input id={`seo_title_${routeKey}`} name="seo_title" defaultValue={page?.seo_title ?? ''} placeholder="Leave blank to use global default" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`meta_description_${routeKey}`}>Meta Description</Label>
        <Textarea id={`meta_description_${routeKey}`} name="meta_description" defaultValue={page?.meta_description ?? ''} placeholder="Leave blank to use global default" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`canonical_url_${routeKey}`}>Canonical URL</Label>
        <Input id={`canonical_url_${routeKey}`} name="canonical_url" defaultValue={page?.canonical_url ?? ''} placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`robots_${routeKey}`}>Robots</Label>
          <Select name="robots" defaultValue={page?.robots ?? 'index,follow'}>
            <SelectTrigger id={`robots_${routeKey}`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="index,follow">index, follow</SelectItem>
              <SelectItem value="noindex,follow">noindex, follow</SelectItem>
              <SelectItem value="noindex,nofollow">noindex, nofollow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`keywords_${routeKey}`}>Keywords</Label>
          <Input id={`keywords_${routeKey}`} name="keywords" defaultValue={page?.keywords ?? ''} placeholder="comma, separated" />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="bg-[#324E64] hover:bg-[#324E64]/90">
        {pending ? 'Saving...' : `Save ${PAGE_LABELS[routeKey]} SEO`}
      </Button>
    </form>
  )
}
