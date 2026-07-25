import { BlogForm } from "@/features/blog/components/blog-form"
import { RiArrowLeftLine } from "@remixicon/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon" aria-label="Back to blog">
            <RiArrowLeftLine className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Create Blog Post</h1>
          <p className="text-sm text-slate-500 mt-0.5">Write a new article for the blog.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <BlogForm />
      </div>
    </div>
  )
}
