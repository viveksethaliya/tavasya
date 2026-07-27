import Link from "next/link"
import Image from "next/image"
import { getBlogs } from "@/features/blog/queries"
import { getMediaById } from "@/features/media/queries"
import { format } from "date-fns"
import { RiArticleLine } from "@remixicon/react"

export default async function BlogPage() {
  const { data: blogs, error } = await getBlogs({ publishedOnly: true })

  // If there's an error, we can gracefully render the empty state or an error state.
  // The existing empty state handles length === 0, so we default to an empty array on error.
  const validBlogs = error ? [] : blogs;

  // Resolve cover images if available
  const blogsWithImages = await Promise.all(
    validBlogs.map(async (blog) => {
      let imageUrl = null
      if (blog.cover_image_id) {
        try {
          const media = await getMediaById(blog.cover_image_id)
          if (media?.url) imageUrl = media.url
        } catch (_) {}
      }
      return { ...blog, imageUrl }
    })
  )

  return (
    <div className="bg-white">
      <div className="bg-[#1E3448] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Insights & News</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            Stay updated with the latest trends in agro-food processing, engineering innovations, and company news.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        {blogsWithImages.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-100">
            <RiArticleLine className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No articles available</h3>
            <p className="mt-2 text-sm text-slate-500">Check back later for new insights and updates.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {blogsWithImages.map((post) => (
              <article key={post.id} className="flex flex-col items-start justify-between group">
                <div className="relative w-full">
                  <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2] overflow-hidden">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50 border border-slate-100">
                        <RiArticleLine className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-900/10" />
                </div>
                <div className="max-w-xl w-full">
                  <div className="mt-8 flex items-center gap-x-4 text-xs">
                    <time dateTime={post.published_at || post.created_at} className="text-slate-500">
                      {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                    </time>
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-bold leading-6 text-[#324E64] group-hover:text-[#F3BA43] transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="relative mt-8 flex items-center gap-x-4">
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-slate-900">
                        <span className="absolute inset-0" />
                        {post.author || 'Tavasya Engineering'}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
