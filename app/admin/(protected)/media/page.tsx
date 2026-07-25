import { MediaLibraryGrid } from '@/features/media/components/media-library-grid'

export const dynamic = 'force-dynamic'

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Media Library</h1>
          <p className="text-sm text-slate-500 mt-1">Upload and manage images for products, collections, and blog posts.</p>
        </div>
      </div>
      <MediaLibraryGrid />
    </div>
  )
}
