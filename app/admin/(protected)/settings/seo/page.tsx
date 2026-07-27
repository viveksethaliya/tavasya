import { getSiteSettings, getPages } from '@/features/settings/queries'
import { SeoSettingsForm } from '@/features/settings/components/seo-settings-form'

export const dynamic = 'force-dynamic'

export default async function SeoSettingsPage() {
  const [settingsResult, pagesResult] = await Promise.all([getSiteSettings(), getPages()])
  const { data: settings, error: settingsError } = settingsResult
  const { data: pages, error: pagesError } = pagesResult
  const error = settingsError ?? pagesError

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">SEO Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Global metadata defaults and per-page SEO overrides.</p>
      </div>
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
          <p className="font-semibold">Failed to load settings</p>
          <p className="text-sm mt-1 text-red-600">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <SeoSettingsForm settings={settings} pages={pages} />
        </div>
      )}
    </div>
  )
}
