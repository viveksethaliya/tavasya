import { getCollections } from "@/features/collections/queries"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function CollectionsPage() {
  const collections = await getCollections({ publishedOnly: true })

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Our Collections</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse our curated collections of precision machinery and equipment tailored for your specific industry needs.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No collections available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.slug}`} className="group block">
              <div className="border rounded-lg overflow-hidden bg-card shadow-sm transition-shadow hover:shadow-md flex flex-col h-full">
                <div className="aspect-[16/10] bg-muted/30 w-full flex items-center justify-center text-muted-foreground">
                  {/* Placeholder for Collection Image */}
                  [Image: {collection.name}]
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {collection.name}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                    {collection.description || "View products in this collection."}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {collection.product_count} Products
                    </span>
                    <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                      View Collection &rarr;
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
