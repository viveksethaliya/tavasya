import { getProductBySlug } from "@/features/products/queries"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RiArrowLeftLine } from "@remixicon/react"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const product = await getProductBySlug(slug, { publishedOnly: true })
    return {
      title: product.seo_title || `${product.name} | Meridian Machine Works`,
      description: product.meta_description || product.short_description,
    }
  } catch {
    return { title: 'Product Not Found' }
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let product
  try {
    product = await getProductBySlug(slug, { publishedOnly: true })
  } catch {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
      <div className="mb-8">
        <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <RiArrowLeftLine className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        <div className="space-y-6">
          <div className="aspect-square bg-muted/20 rounded-xl flex items-center justify-center text-muted-foreground border">
            [Product Image Gallery]
          </div>
        </div>

        <div className="space-y-8 flex flex-col justify-center">
          <div>
            {product.category && (
              <p className="text-sm font-bold uppercase tracking-widest text-accent mb-2">
                {product.category}
              </p>
            )}
            <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">
              {product.name}
            </h1>
            {product.sku && (
              <p className="text-sm text-muted-foreground mb-6 font-mono">
                SKU: {product.sku}
              </p>
            )}
          </div>

          <div className="prose prose-slate dark:prose-invert">
            <p className="text-lg leading-relaxed">
              {product.short_description}
            </p>
            {product.description && (
              <div className="mt-6 whitespace-pre-wrap">
                {product.description}
              </div>
            )}
          </div>

          <div className="pt-6 border-t">
            <Button size="lg" className="w-full md:w-auto px-8">
              Request a Quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
