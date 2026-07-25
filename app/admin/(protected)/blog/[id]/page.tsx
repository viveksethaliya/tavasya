import { BlogForm } from '@/features/blog/components/blog-form'
import { getBlogById } from '@/features/blog/queries'
import { RiArrowLeftLine } from '@remixicon/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let blog
  try {
    blog = await getBlogById(id)
  } catch {
    notFound()
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
