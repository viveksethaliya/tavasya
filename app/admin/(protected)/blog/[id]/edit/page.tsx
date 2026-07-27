import { BlogForm } from '@/features/blog/components/blog-form'
import { getBlogById } from '@/features/blog/queries'
import { RiArrowLeftLine } from '@remixicon/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: blog, notFound: isNotFound, error } = await getBlogById(id)

  if (isNotFound) {
    notFound()
  }

  if (error || !blog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon" aria-label="Back to blog">
              <RiArrowLeftLine className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Edit Blog Post</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
          <p className="font-semibold">Failed to load blog post</p>
          <p className="text-sm mt-1 text-red-600">{error ?? 'An unexpected error occurred.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon" aria-label="Back to blog">
            <RiArrowLeftLine className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Edit Blog Post</h1>
          <p className="text-sm text-slate-500 mt-0.5 truncate max-w-md">{blog.title}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <BlogForm initialData={blog} />
      </div>
    </div>
  )
}
