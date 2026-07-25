import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogBySlug, getRelatedBlogs } from "@/features/blog/queries"
import { getMediaById } from "@/features/media/queries"
import { format } from "date-fns"
import { RiArrowLeftLine } from "@remixicon/react"
import { Metadata, ResolvingMetadata } from "next"

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
        if (media?.url) coverImageUrl = media.url
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
      if (media?.url) coverImageUrl = media.url
    } catch (_) {}
  }

  // Format content for simple markdown rendering if needed, 
  // For now we assume blog.content is HTML or simple text.
  // We'll render it safely using a div and prose classes.

  return (
    <div className="bg-white px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-slate-700">
        <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#324E64] mb-8 transition-colors">
          <RiArrowLeftLine className="mr-2 h-4 w-4" /> Back to Blog
        </Link>
        <p className="text-base font-semibold leading-7 text-[#F3BA43]">
          {format(new Date(blog.published_at || blog.created_at), 'MMMM d, yyyy')}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#324E64] sm:text-4xl">
          {blog.title}
        </h1>
        <p className="mt-4 text-sm font-medium text-slate-500">
          By {blog.author || 'Tavasya Engineering'}
        </p>

        {coverImageUrl && (
          <figure className="mt-10 mb-10">
            <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-50 overflow-hidden shadow-sm">
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

        <div 
          className="mt-10 max-w-2xl prose prose-slate lg:prose-lg mx-auto prose-headings:text-[#324E64] prose-a:text-[#F3BA43]"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <div className="mx-auto max-w-3xl mt-24 border-t border-slate-100 pt-16">
          <h2 className="text-2xl font-bold tracking-tight text-[#324E64] mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBlogs.map((related) => (
              <Link 
                key={related.id} 
                href={`/blog/${related.slug}`}
                className="group flex flex-col"
              >
                <h3 className="text-sm font-bold text-[#324E64] group-hover:text-[#F3BA43] transition-colors line-clamp-2">
                  {related.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  {format(new Date(related.published_at), 'MMM d, yyyy')}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
