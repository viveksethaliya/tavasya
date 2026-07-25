import { getBlogBySlug, getRelatedBlogs } from "@/features/blog/queries"
import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { RiArrowLeftLine } from "@remixicon/react"
import { RichTextRenderer } from "@/components/marketing/rich-text-renderer"
import { BlogCard } from "@/components/marketing/blog-card"
import { SeoJsonLd } from "@/components/marketing/seo-json-ld"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const blog = await getBlogBySlug(slug, { publishedOnly: true })
    return {
      title: blog.seo_title || `${blog.title} | Meridian Machine Works`,
      description: blog.meta_description || blog.excerpt,
    }
  } catch {
    return { title: 'Blog Not Found' }
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let blog
  try {
    blog = await getBlogBySlug(slug, { publishedOnly: true })
  } catch {
    notFound()
  }

  const relatedBlogs = await getRelatedBlogs(blog.id)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "image": blog.cover_image_id ? [blog.cover_image_id] : [],
    "datePublished": blog.published_at,
    "dateModified": blog.updated_at,
    "author": [{
        "@type": "Person",
        "name": blog.author_name || "Meridian Team"
    }]
  }

  return (
    <>
      <SeoJsonLd schema={jsonLd} />
      
      <article className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <div className="mb-8">
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <RiArrowLeftLine className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        <header className="mb-10 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary balance-text">
            {blog.title}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-muted-foreground text-sm">
            {blog.author_name && <span>By {blog.author_name}</span>}
            {blog.author_name && blog.published_at && <span>•</span>}
            {blog.published_at && (
              <time dateTime={blog.published_at}>
                {format(new Date(blog.published_at), "MMMM d, yyyy")}
              </time>
            )}
          </div>
        </header>

        {blog.cover_image_id && (
          <div className="aspect-[21/9] w-full bg-muted mb-12 rounded-lg overflow-hidden flex items-center justify-center text-muted-foreground shadow-sm">
            [Cover Image: {blog.cover_image_id}]
          </div>
        )}

        <div className="mx-auto max-w-3xl">
          <RichTextRenderer content={blog.content} />
        </div>
      </article>

      {relatedBlogs.length > 0 && (
        <section className="bg-muted/30 py-16 border-t">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBlogs.map(related => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
