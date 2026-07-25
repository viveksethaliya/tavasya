import { ProductForm } from "@/features/products/product-form"
import { getProductById } from "@/features/products/queries"
import { RiArrowLeftLine } from "@remixicon/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  let product
  try {
    product = await getProductById(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <RiArrowLeftLine className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
      </div>
      
      <div className="rounded-md border bg-card p-6">
        <ProductForm initialData={product} />
      </div>
    </div>
  )
}
