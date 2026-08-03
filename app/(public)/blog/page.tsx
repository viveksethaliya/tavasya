import { getBlogs } from "@/features/blog/queries"
import { getMediaById } from "@/features/media/queries"
import { RiArticleLine } from "@remixicon/react"
import { BlogCard } from "@/components/marketing/blog-card"

export default async function BlogPage() {
  const { data: blogs, error } = await getBlogs({ publishedOnly: true })
  const validBlogs = error ? [] : blogs;

  // Resolve cover images if available
  const blogsWithImages = await Promise.all(
    validBlogs.map(async (blog) => {
      let imageUrl = null
      if (blog.cover_image_id) {
        try {
          const media = await getMediaById(blog.cover_image_id)
          if (media?.file_url) imageUrl = media.file_url
        } catch (_) {}
      }
      return { ...blog, imageUrl }
    })
  )

  return (
    <div className="bg-white min-h-screen">
      <div className="relative isolate overflow-hidden bg-[#1E3448] py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#324E64] via-[#1E3448] to-[#1E3448]"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-sm">
            Insights & News
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto font-medium">
            Stay updated with the latest trends in agro-food processing, engineering innovations, and company news.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        {blogsWithImages.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
            <RiArticleLine className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No articles available</h3>
            <p className="mt-2 text-sm text-slate-500">Check back later for new insights and updates.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {blogsWithImages.map((post) => (
              <BlogCard key={post.id} post={{
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                published_at: post.published_at || post.created_at,
                imageUrl: post.imageUrl,
                author_name: (post as any).author_name || (post as any).author
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
