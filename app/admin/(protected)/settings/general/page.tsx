import { getSiteSettings } from '@/features/settings/queries'
import { GeneralSettingsForm } from '@/features/settings/components/general-settings-form'

export const dynamic = 'force-dynamic'

export default async function GeneralSettingsPage() {
  const { data: settings, error } = await getSiteSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">General Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Company info, contact details, and social links.</p>
      </div>
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
          <p className="font-semibold">Failed to load settings</p>
          <p className="text-sm mt-1 text-red-600">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <GeneralSettingsForm settings={settings} />
        </div>
      )}
    </div>
  )
}
