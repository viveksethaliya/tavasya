import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { RiArrowRightLine, RiArticleLine } from "@remixicon/react"

interface BlogCardProps {
  post: {
    title: string
    slug: string
    excerpt?: string | null
    published_at?: string | null
    imageUrl?: string | null
    author_name?: string | null
  }
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="flex flex-col items-start justify-between group h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-200">
      <div className="relative w-full">
        <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-50 object-cover sm:aspect-[2/1] lg:aspect-[3/2] overflow-hidden shadow-sm">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center border border-slate-100 rounded-2xl bg-slate-50">
              <RiArticleLine className="h-12 w-12 text-slate-300" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/5 pointer-events-none" />
      </div>
      <div className="flex flex-col flex-grow w-full max-w-xl p-6">
        <div className="flex items-center gap-x-4 text-xs">
          <time dateTime={post.published_at || new Date().toISOString()} className="text-slate-500 font-medium tracking-wide uppercase">
            {post.published_at ? format(new Date(post.published_at), 'MMM d, yyyy') : 'Recently'}
          </time>
        </div>
        <div className="group relative flex-grow">
          <h3 className="mt-3 text-xl font-bold leading-7 text-[#324E64] group-hover:text-[#F3BA43] transition-colors duration-300 line-clamp-2">
            <Link href={`/blog/${post.slug}`}>
              <span className="absolute inset-0" />
              {post.title}
            </Link>
          </h3>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
            {post.excerpt || "Read the full article to learn more."}
          </p>
        </div>
        <div className="relative mt-8 flex items-center justify-between gap-x-4 w-full">
          <div className="text-sm leading-6">
            <p className="font-semibold text-[#324E64]">
              {post.author_name || 'Tavasya Engineering'}
            </p>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#F3BA43] group-hover:translate-x-1 transition-transform duration-300">
            Read <RiArrowRightLine className="ml-1 w-4 h-4" />
          </div>
        </div>
      </div>
    </article>
  )
}
