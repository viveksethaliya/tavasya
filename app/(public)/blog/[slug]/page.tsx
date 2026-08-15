import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BLOG_POSTS, getBlogBySlug } from "@/data/blog"
import { format } from "date-fns"
import { RiArrowLeftLine } from "@remixicon/react"
import { Metadata } from "next"
import { RichTextRenderer } from "@/components/marketing/rich-text-renderer"
import { BlogCard } from "@/components/marketing/blog-card"

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const post = getBlogBySlug(slug)
  if (!post) return { title: 'Blog Not Found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  }
}

export default async function BlogDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const post = getBlogBySlug(slug)
  if (!post) notFound()

  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-[#1E3448] pt-16 pb-24 sm:pt-24 sm:pb-32 relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#324E64] via-[#1E3448] to-[#1E3448]"></div>
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-slate-300 hover:text-[#F3BA43] mb-8 transition-colors group">
            <RiArrowLeftLine className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
          </Link>
          <div className="flex items-center justify-center gap-x-4 text-sm mb-6">
            <time dateTime={post.publishedAt} className="text-[#F3BA43] font-semibold tracking-wide uppercase">
              {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
            </time>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-sm mb-8 leading-tight">
            {post.title}
          </h1>
          <p className="text-base font-medium text-slate-300">
            By <span className="text-white">{post.author}</span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 lg:px-8 mt-12 sm:-mt-24 relative z-10 pb-16">
        {post.imageUrl && (
          <figure className="mb-16">
            <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-50 overflow-hidden shadow-lg ring-1 ring-slate-900/10">
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" priority />
            </div>
          </figure>
        )}

        <RichTextRenderer
          content={post.content}
          className="prose-slate lg:prose-lg mx-auto prose-headings:text-[#324E64] prose-a:text-[#F3BA43]"
        />
      </div>

      {related.length > 0 && (
        <div className="bg-slate-50 mt-12 py-24 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-[#324E64] sm:text-4xl">Related Articles</h2>
              <p className="mt-4 text-lg text-slate-600">Discover more insights and updates.</p>
            </div>
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {related.map((rel) => (
                <BlogCard key={rel.slug} post={{
                  title: rel.title,
                  slug: rel.slug,
                  excerpt: rel.excerpt,
                  published_at: rel.publishedAt,
                  imageUrl: rel.imageUrl ?? null,
                  author_name: rel.author,
                }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
