import * as React from "react"
import { deleteCollection } from "@/features/collections/actions"
import { getCollections } from "@/features/collections/queries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { IconButton } from "@/components/ui/icon-button"
import { RiAddLine, RiEdit2Line, RiDeleteBinLine } from "@remixicon/react"
import Link from "next/link"
export default async function CollectionsAdminPage() {
  const collections = await getCollections()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Collections</h1>
          <p className="text-sm text-slate-500 mt-1">Group products into categorized collections.</p>
        </div>
        <Link href="/admin/collections/new">
          <Button className="bg-[#324E64] hover:bg-[#324E64]/90 w-full sm:w-auto">
            <RiAddLine className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#F0F2F5]">
            <TableRow className="hover:bg-[#F0F2F5]">
              <TableHead className="font-semibold text-[#324E64]">Name</TableHead>
              <TableHead className="font-semibold text-[#324E64]">Slug</TableHead>
              <TableHead className="font-semibold text-[#324E64]">Products</TableHead>
              <TableHead className="font-semibold text-[#324E64]">Status</TableHead>
              <TableHead className="text-right font-semibold text-[#324E64]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No collections found.
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{collection.name}</TableCell>
                  <TableCell className="text-slate-500">{collection.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{collection.product_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={collection.status === "published" ? "default" : "secondary"}>
                      {collection.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/collections/${collection.id}`}>
                      <IconButton aria-label="Edit collection" icon={<RiEdit2Line className="h-4 w-4" />} />
                    </Link>
                    <ConfirmDialog
                      title="Delete Collection"
                      description={`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`}
                      destructive
                      confirmText="Delete"
                      onConfirm={deleteCollection.bind(null, collection.id)}
                      trigger={<IconButton aria-label="Delete collection" variant="destructive" icon={<RiDeleteBinLine className="h-4 w-4" />} />}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
