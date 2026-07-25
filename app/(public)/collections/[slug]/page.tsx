import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getCollectionBySlug } from "@/features/collections/queries"
import { getMediaById } from "@/features/media/queries"
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react"

export default async function CollectionDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  let collection
  
  try {
    collection = await getCollectionBySlug(params.slug, { publishedOnly: true })
  } catch (_) {
    notFound()
  }

  // Resolve cover images for products in this collection
  const productsWithImages = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (collection.products || []).map(async (product: any) => {
      let imageUrl = '/Factory Image.png'
      if (product.cover_image_id) {
        try {
          const media = await getMediaById(product.cover_image_id)
          if (media?.url) imageUrl = media.url
        } catch (_) {}
      }
      return { ...product, imageUrl }
    })
  )

  return (
    <div className="bg-white">
      <div className="bg-[#1E3448] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Link href="/collections" className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-white mb-8">
            <RiArrowLeftLine className="mr-2 h-4 w-4" /> Back to Collections
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{collection.name}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            {collection.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-bold text-[#324E64]">Machines in this collection</h2>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {productsWithImages.length} {productsWithImages.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {productsWithImages.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No products found</h3>
            <p className="mt-2 text-sm text-slate-500">There are no machines currently assigned to this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
            {productsWithImages.map((product) => (
              <div key={product.id} className="group flex flex-col bg-slate-50 rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold text-[#324E64]">
                    <Link href={`/products/${product.slug}`}>
                      <span className="absolute inset-0" />
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-600 line-clamp-2">
                    {product.description || product.short_description}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#F3BA43] flex items-center group-hover:text-[#324E64] transition-colors">
                      View Machine <RiArrowRightLine className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
