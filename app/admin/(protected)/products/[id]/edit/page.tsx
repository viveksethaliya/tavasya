import { ProductForm } from '@/features/products/product-form'
import { getProductById, getProducts } from '@/features/products/queries'
import { getProductImages, getProductSpecs, getProductFeatures } from '@/features/products/actions'
import { RiArrowLeftLine } from '@remixicon/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: product, notFound: isNotFound, error } = await getProductById(id)

  if (isNotFound) {
    notFound()
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" aria-label="Back to products">
              <RiArrowLeftLine className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Edit Product</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
          <p className="font-semibold">Failed to load product</p>
          <p className="text-sm mt-1 text-red-600">{error ?? 'An unexpected error occurred.'}</p>
        </div>
      </div>
    )
  }

  const [imagesRes, specsRes, featuresRes] = await Promise.all([
    getProductImages(id),
    getProductSpecs(id),
    getProductFeatures(id),
  ])

  return (
    <div className="space-y-6 xl:h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-4 shrink-0">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" aria-label="Back to products">
            <RiArrowLeftLine className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Edit Product</h1>
          <p className="text-sm text-slate-500 mt-0.5">{product.name}</p>
        </div>
      </div>

      <div className="mt-6 flex-grow overflow-hidden">
        <ProductForm
          initialData={product}
          initialImages={(imagesRes.data ?? []) as unknown as Parameters<typeof ProductForm>[0]['initialImages']}
          initialSpecs={specsRes.data ?? []}
          initialFeatures={featuresRes.data ?? []}
        />
      </div>
    </div>
  )
}


export async function generateStaticParams() {
  try {
    const products = await getProducts()
    return products.map((p) => ({ id: p.id }))
  } catch {
    return []
  }
}
