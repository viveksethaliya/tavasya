import { getSiteSettings, getPages } from '@/features/settings/queries'
import { SeoSettingsForm } from '@/features/settings/components/seo-settings-form'

export const dynamic = 'force-dynamic'

export default async function SeoSettingsPage() {
  const [settings, pages] = await Promise.all([getSiteSettings(), getPages()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">SEO Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Global metadata defaults and per-page SEO overrides.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <SeoSettingsForm settings={settings} pages={pages} />
      </div>
    </div>
  )
}
