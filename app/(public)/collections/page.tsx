import Link from "next/link"
import { getCollections } from "@/features/collections/queries"
import { RiFolder3Line, RiArrowRightLine } from "@remixicon/react"

export default async function CollectionsPage() {
  const collections = await getCollections({ publishedOnly: true })

  return (
    <div className="bg-white">
      <div className="bg-[#1E3448] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Machine Collections</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            Browse our processing solutions categorized by application and industry needs.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        {collections.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-100">
            <RiFolder3Line className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No collections available</h3>
            <p className="mt-2 text-sm text-slate-500">Check back later for curated machine sets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link 
                key={collection.id} 
                href={`/collections/${collection.slug}`}
                className="group flex flex-col bg-slate-50 rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex flex-1 flex-col p-8">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                    <RiFolder3Line className="h-6 w-6 text-[#F3BA43]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#324E64] group-hover:text-[#F3BA43] transition-colors">
                    {collection.name}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-600 line-clamp-3">
                    {collection.description}
                  </p>
                  <div className="mt-8 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-500">
                      {collection.product_count} {collection.product_count === 1 ? 'Product' : 'Products'}
                    </span>
                    <span className="font-semibold text-[#324E64] flex items-center group-hover:text-[#F3BA43] transition-colors">
                      Browse <RiArrowRightLine className="ml-1 h-4 w-4" />
                    </span>
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
