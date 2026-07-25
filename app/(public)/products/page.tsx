import { getProducts } from "@/features/products/queries"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ProductsPage() {
  const products = await getProducts({ publishedOnly: true })

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
      <div className="space-y-4 mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Our Products</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our range of high-precision industrial machinery, designed for reliability and performance.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No products available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
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
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h2>
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
  )
}
