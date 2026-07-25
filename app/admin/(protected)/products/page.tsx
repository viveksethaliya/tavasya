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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Link href="/admin/products/new">
          <Button>
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || "-"}</TableCell>
                  <TableCell>{product.category || "-"}</TableCell>
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
                      description="Are you sure you want to delete this product? This action cannot be undone."
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
