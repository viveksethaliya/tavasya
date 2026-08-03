import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogBySlug, getRelatedBlogs } from "@/features/blog/queries"
import { getMediaById } from "@/features/media/queries"
import { format } from "date-fns"
import { RiArrowLeftLine } from "@remixicon/react"
import { Metadata, ResolvingMetadata } from "next"
import { RichTextRenderer } from "@/components/marketing/rich-text-renderer"
import { BlogCard } from "@/components/marketing/blog-card"

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
  _: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params
  try {
    const blog = await getBlogBySlug(params.slug, { publishedOnly: true })
    
    // Resolve cover image for SEO
    let coverImageUrl = undefined
    if (blog.cover_image_id) {
      try {
        const media = await getMediaById(blog.cover_image_id)
        if (media?.file_url) coverImageUrl = media.file_url
      } catch (_) {}
    }

    return {
      title: blog.title,
      description: blog.excerpt,
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        images: coverImageUrl ? [coverImageUrl] : undefined,
      },
    }
  } catch (e) {
    return {
      title: 'Blog Not Found',
    }
  }
}

export default async function BlogDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  let blog
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let relatedBlogs: any[] = []
  
  try {
    blog = await getBlogBySlug(params.slug, { publishedOnly: true })
    relatedBlogs = await getRelatedBlogs(blog.id, 3)
  } catch (_) {
    notFound()
  }

  // Resolve cover image
  let coverImageUrl = null
  if (blog.cover_image_id) {
    try {
      const media = await getMediaById(blog.cover_image_id)
      if (media?.file_url) coverImageUrl = media.file_url
    } catch (_) {}
  }

  // Resolve related blog images
  const relatedBlogsWithImages = await Promise.all(
    relatedBlogs.map(async (related) => {
      let imageUrl = null
      if (related.cover_image_id) {
        try {
          const media = await getMediaById(related.cover_image_id)
          if (media?.file_url) imageUrl = media.file_url
        } catch (_) {}
      }
      return { ...related, imageUrl }
    })
  )

  return (
    <div className="bg-white min-h-screen">
      {/* Premium Hero Section */}
      <div className="bg-[#1E3448] pt-16 pb-24 sm:pt-24 sm:pb-32 relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#324E64] via-[#1E3448] to-[#1E3448]"></div>
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-slate-300 hover:text-[#F3BA43] mb-8 transition-colors group">
            <RiArrowLeftLine className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
          </Link>
          <div className="flex items-center justify-center gap-x-4 text-sm mb-6">
            <time dateTime={blog.published_at || blog.created_at} className="text-[#F3BA43] font-semibold tracking-wide uppercase">
              {format(new Date(blog.published_at || blog.created_at), 'MMMM d, yyyy')}
            </time>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-sm mb-8 leading-tight">
            {blog.title}
          </h1>
          <p className="text-base font-medium text-slate-300">
            By <span className="text-white">{(blog as any).author_name || blog.author || 'Tavasya Engineering'}</span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-8 mt-12 sm:-mt-24 relative z-10 pb-16">
        {coverImageUrl && (
          <figure className="mb-16">
            <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-50 overflow-hidden shadow-lg ring-1 ring-slate-900/10">
              <Image
                src={coverImageUrl}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </figure>
        )}

        <RichTextRenderer 
          content={blog.content} 
          className="prose-slate lg:prose-lg mx-auto prose-headings:text-[#324E64] prose-a:text-[#F3BA43]" 
        />
      </div>

      {/* Related Blogs */}
      {relatedBlogsWithImages.length > 0 && (
        <div className="bg-slate-50 mt-12 py-24 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-[#324E64] sm:text-4xl">Related Articles</h2>
              <p className="mt-4 text-lg text-slate-600">Discover more insights and updates.</p>
            </div>
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {relatedBlogsWithImages.map((related) => (
                <BlogCard key={related.id} post={{
                  title: related.title,
                  slug: related.slug,
                  excerpt: related.excerpt,
                  published_at: related.published_at || related.created_at,
                  imageUrl: related.imageUrl,
                  author_name: (related as any).author_name || related.author
                }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
