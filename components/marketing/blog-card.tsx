import Link from "next/link"
import { format } from "date-fns"
import { RiArrowRightLine } from "@remixicon/react"

interface BlogCardProps {
  post: {
    title: string
    slug: string
    excerpt?: string | null
    published_at?: string | null
    cover_image_id?: string | null
  }
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} aria-label={`Read article: ${post.title}`} className="group flex flex-col h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[16/9] w-full bg-muted/50 overflow-hidden relative flex items-center justify-center text-muted-foreground">
        {/* Placeholder for Cover Image */}
        {post.cover_image_id ? (
          <span className="text-sm">Image {post.cover_image_id}</span>
        ) : (
          <span className="text-sm">No Image</span>
        )}
      </div>
      <div className="flex flex-col flex-grow p-6">
        {post.published_at && (
          <time dateTime={post.published_at} className="text-sm text-muted-foreground mb-3 font-medium">
            {format(new Date(post.published_at), "MMMM d, yyyy")}
          </time>
        )}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
          {post.excerpt || "Read full post..."}
        </p>
        <div className="flex items-center text-sm font-semibold text-primary mt-auto group-hover:translate-x-1 transition-transform">
          Read Article <RiArrowRightLine className="ml-1 w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}
