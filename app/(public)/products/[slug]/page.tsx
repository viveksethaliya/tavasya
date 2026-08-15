import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { PRODUCTS, getProductBySlug } from "@/data/products"
import { RiCheckDoubleLine, RiArrowLeftLine, RiFocus2Line } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Metadata } from "next"

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: product.name,
    description: product.shortDescription,
  }
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const product = getProductBySlug(slug)

  if (!product) notFound()

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-8">
        <Link href="/products" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#324E64] mb-8">
          <RiArrowLeftLine className="mr-2 h-4 w-4" /> Back to Products
        </Link>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-16">
          {/* Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center p-8">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain object-center p-8"
              priority
            />
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-[#324E64] sm:text-4xl">{product.name}</h1>

            <div className="mt-6">
              <h2 className="sr-only">Description</h2>
              <p className="text-base text-slate-600 leading-8">{product.longDescription}</p>
            </div>

            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-[#324E64]">Key Features</h3>
                <ul className="mt-4 space-y-3">
                  {product.keyFeatures.map((feature, idx) => (
                    <li key={idx} className="flex gap-x-3 text-sm text-slate-600">
                      <RiCheckDoubleLine className="h-5 w-5 flex-none text-[#F3BA43]" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.applications && product.applications.length > 0 && (
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-[#324E64]">Applications</h3>
                <ul className="mt-4 space-y-3">
                  {product.applications.map((app, idx) => (
                    <li key={idx} className="flex gap-x-3 text-sm text-slate-600">
                      <RiFocus2Line className="h-5 w-5 flex-none text-[#F3BA43]" aria-hidden="true" />
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.notes && Object.keys(product.notes).length > 0 && (
              <div className="mt-10 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <h3 className="text-sm font-semibold text-[#324E64]">Additional Notes</h3>
                <dl className="mt-2 text-sm text-slate-600 space-y-2">
                  {Object.entries(product.notes).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <dt className="font-medium capitalize">{key.replace('_', ' ')}:</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-10 flex">
              <Link href="/contact" className="w-full">
                <Button className="w-full bg-[#324E64] hover:bg-[#324E64]/90 text-white py-6 text-lg rounded-xl shadow-lg shadow-[#324E64]/20 hover:shadow-xl hover:shadow-[#324E64]/30 hover:-translate-y-1 transition-all duration-300">
                  Request a Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
