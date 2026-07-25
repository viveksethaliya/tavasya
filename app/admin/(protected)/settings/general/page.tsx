import { getSiteSettings } from '@/features/settings/queries'
import { GeneralSettingsForm } from '@/features/settings/components/general-settings-form'

export const dynamic = 'force-dynamic'

export default async function GeneralSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">General Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Company info, contact details, and social links.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <GeneralSettingsForm settings={settings} />
      </div>
    </div>
  )
}
