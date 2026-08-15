import Link from "next/link"
import Image from "next/image"
import { PRODUCTS } from "@/data/products"
import { RiArrowRightLine, RiDatabase2Line } from "@remixicon/react"
import { Button } from "@/components/ui/button"

export default function ProductsPage() {
  return (
    <div className="bg-white">
      <div className="bg-[#1E3448] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Our Products</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            Discover our high-performance agro-food cleaning and sorting machines, engineered for precision and reliability.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        {PRODUCTS.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-100">
            <RiDatabase2Line className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No products available</h3>
            <p className="mt-2 text-sm text-slate-500">Check back later for new machine releases.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
            {PRODUCTS.map((product) => (
              <div key={product.slug} className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-200">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 p-8 flex items-center justify-center">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain object-center group-hover:scale-110 transition-transform duration-700 ease-in-out p-4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#324E64] transition-colors">
                    <Link href={`/products/${product.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3BA43] rounded-sm inline-block">
                      <span className="absolute inset-0 z-10" />
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-500 line-clamp-3">
                    {product.shortDescription}
                  </p>
                  <div className="mt-6 flex items-center justify-between z-20 relative">
                    <span className="text-sm font-semibold text-[#F3BA43] flex items-center group-hover:text-[#324E64] transition-colors">
                      View Details <RiArrowRightLine className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#324E64]">Need a custom solution?</h2>
          <p className="mt-4 text-slate-600">Our engineering team can design machines tailored to your specific processing line.</p>
          <div className="mt-8">
            <Link href="/contact" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#324E64] rounded-md inline-block">
              <Button className="bg-[#324E64] hover:bg-[#324E64]/90 text-white px-8">Contact Engineering</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
