import { getCollectionBySlug } from "@/features/collections/queries"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RiArrowLeftLine } from "@remixicon/react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const collection = await getCollectionBySlug(slug, { publishedOnly: true })
    return {
      title: collection.seo_title || `${collection.name} | Meridian Machine Works`,
      description: collection.meta_description || collection.description,
    }
  } catch {
    return { title: 'Collection Not Found' }
  }
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let collection
  try {
    collection = await getCollectionBySlug(slug, { publishedOnly: true })
  } catch {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
      <div className="mb-8">
        <Link href="/collections" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <RiArrowLeftLine className="mr-2 h-4 w-4" />
          Back to Collections
        </Link>
      </div>

      <div className="space-y-4 mb-16 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {collection.description}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-8">Products in this Collection</h2>
        {collection.products.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No products found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collection.products.map((product: { id: string; name: string; slug: string; category?: string | null; short_description?: string | null }) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                <div className="border rounded-lg overflow-hidden bg-card shadow-sm transition-shadow hover:shadow-md flex flex-col h-full">
                  <div className="aspect-video bg-muted/30 w-full flex items-center justify-center text-muted-foreground">
                    {/* Placeholder for Product Primary Image */}
                    [Image: {product.name}]
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-2">
                      {product.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent mr-2">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow">
                      {product.short_description || "Click to view product details."}
                    </p>
                    <Button variant="outline" className="w-full mt-auto">
                      View Details
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
