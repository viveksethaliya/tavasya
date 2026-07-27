import * as React from "react"
import { getProducts as fetchProducts } from "@/features/products/queries"
import { AdminProductsTable } from "@/features/products/components/admin-products-table"

export default async function AdminProductsPage() {
  const products = await fetchProducts({ publishedOnly: false })

  // Map to the minimal shape required by the table
  const tableData = products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    status: p.status as 'draft' | 'published'
  }))

  return <AdminProductsTable initialProducts={tableData} />
}
