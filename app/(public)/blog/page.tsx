import { getBlogs } from "@/features/blog/queries"
import { BlogCard } from "@/components/marketing/blog-card"

export const metadata = {
  title: "Blog | Meridian Machine Works",
  description: "Read the latest news, insights, and updates from Meridian Machine Works.",
}

export default async function BlogListingPage() {
  const blogs = await getBlogs({ publishedOnly: true })

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">News & Insights</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay up to date with the latest industry trends, product announcements, and technical guides.
        </p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No blog posts published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} post={blog} />
          ))}
        </div>
      )}
    </div>
  )
}
