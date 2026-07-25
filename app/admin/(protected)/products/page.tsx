import * as React from "react"
import { deleteProduct } from "@/features/products/actions"
import { getProducts as fetchProducts } from "@/features/products/queries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { RiAddLine, RiEdit2Line, RiDeleteBinLine } from "@remixicon/react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { IconButton } from "@/components/ui/icon-button"
import { EmptyState } from "@/components/ui/empty-state"

export default async function AdminProductsPage() {
  const products = await fetchProducts({ publishedOnly: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your machinery and equipment catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#324E64] hover:bg-[#324E64]/90 w-full sm:w-auto">
            <RiAddLine className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState 
          title="No products found" 
          description="You haven't created any products yet."
          action={
            <Link href="/admin/products/new">
              <Button>Create Product</Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F0F2F5]">
              <TableRow className="hover:bg-[#F0F2F5]">
                <TableHead className="font-semibold text-[#324E64]">Name</TableHead>
                <TableHead className="font-semibold text-[#324E64]">SKU</TableHead>
                <TableHead className="font-semibold text-[#324E64]">Category</TableHead>
                <TableHead className="font-semibold text-[#324E64]">Status</TableHead>
                <TableHead className="text-right font-semibold text-[#324E64]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                  <TableCell className="text-slate-500">{product.sku || "-"}</TableCell>
                  <TableCell className="text-slate-500">{product.category || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === "published" ? "default" : "secondary"}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/products/${product.id}`}>
                      <IconButton aria-label="Edit product" icon={<RiEdit2Line className="h-4 w-4" />} />
                    </Link>
                    <ConfirmDialog
                      title="Delete Product"
                      description={`Are you sure you want to delete ${product.name}? This action cannot be undone.`}
                      destructive
                      confirmText="Delete"
                      onConfirm={deleteProduct.bind(null, product.id)}
                      trigger={<IconButton aria-label="Delete product" variant="destructive" icon={<RiDeleteBinLine className="h-4 w-4" />} />}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
