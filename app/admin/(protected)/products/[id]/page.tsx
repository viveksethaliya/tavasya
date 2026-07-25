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

  let product
  try {
    product = await getProductById(id)
  } catch {
    notFound()
  }

  const [imagesRes, specsRes, featuresRes] = await Promise.all([
    getProductImages(id),
    getProductSpecs(id),
    getProductFeatures(id),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
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
