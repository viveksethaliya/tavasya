import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getProductBySlug } from "@/features/products/queries"
import { getMediaById } from "@/features/media/queries"
import { RiCheckDoubleLine, RiArrowLeftLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  let product
  
  try {
    product = await getProductBySlug(params.slug, { publishedOnly: true })
  } catch (_) {
    notFound()
  }

  // Resolve cover image
  let coverImageUrl = '/Factory Image.png'
  if (product.cover_image_id) {
    try {
      const media = await getMediaById(product.cover_image_id)
      if (media?.url) coverImageUrl = media.url
    } catch (_) {
      console.error("Failed to fetch image for product", product.id)
    }
  }

  // Resolve gallery images
  const galleryUrls: string[] = []
  if (product.image_ids && product.image_ids.length > 0) {
    for (const id of product.image_ids) {
      if (id === product.cover_image_id) continue // Skip cover image in gallery if already there
      try {
        const media = await getMediaById(id)
        if (media?.url) galleryUrls.push(media.url)
      } catch (_) {}
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-8">
        <Link href="/products" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#324E64] mb-8">
          <RiArrowLeftLine className="mr-2 h-4 w-4" /> Back to Products
        </Link>
        
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-16">
          {/* Image gallery */}
          <div className="flex flex-col">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src={coverImageUrl}
                alt={product.name}
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            {galleryUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {galleryUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={url}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            {product.sku && (
              <p className="text-sm font-medium tracking-wide text-[#F3BA43] uppercase mb-2">
                SKU: {product.sku}
              </p>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-[#324E64] sm:text-4xl">{product.name}</h1>
            
            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-slate-600 leading-8">
                {product.description || product.short_description}
              </div>
            </div>

            {/* Specifications / Features if available */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-[#324E64]">Technical Specifications</h3>
                <div className="mt-4 border-t border-slate-100">
                  <dl className="divide-y divide-slate-100">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-slate-900 capitalize">{key.replace(/_/g, ' ')}</dt>
                        <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            <div className="mt-10 flex">
              <Link href="/contact" className="w-full">
                <Button className="w-full bg-[#324E64] hover:bg-[#324E64]/90 text-white py-6 text-lg rounded-xl">
                  Request a Quote
                </Button>
              </Link>
            </div>
            
            <section aria-labelledby="policies-heading" className="mt-10">
              <h2 id="policies-heading" className="sr-only">
                Our Guarantees
              </h2>
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <dt className="flex items-center gap-x-3 text-sm font-semibold text-[#324E64]">
                    <RiCheckDoubleLine className="h-5 w-5 text-[#F3BA43]" />
                    Precision Engineered
                  </dt>
                  <dd className="mt-2 text-sm text-slate-600">Built to deliver exact cleaning and grading specs consistently.</dd>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <dt className="flex items-center gap-x-3 text-sm font-semibold text-[#324E64]">
                    <RiCheckDoubleLine className="h-5 w-5 text-[#F3BA43]" />
                    Lifetime Support
                  </dt>
                  <dd className="mt-2 text-sm text-slate-600">Dedicated service and maintenance from our expert team.</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
