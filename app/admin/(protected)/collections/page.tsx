import * as React from "react"
import { deleteCollection } from "@/features/collections/actions"
import { getCollections } from "@/features/collections/queries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { RiAddLine, RiPencilLine, RiDeleteBinLine } from "@remixicon/react"
import Link from "next/link"

export default async function CollectionsAdminPage() {
  const collections = await getCollections()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <Link href="/admin/collections/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" />
            Add Collection
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No collections found.
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">{collection.name}</TableCell>
                  <TableCell className="text-muted-foreground">{collection.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{collection.product_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={collection.status === "published" ? "default" : "secondary"}>
                      {collection.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/collections/${collection.id}`}>
                        <Button variant="ghost" size="icon">
                          <RiPencilLine className="h-4 w-4" />
                        </Button>
                      </Link>
                      <ConfirmDialog
                        title="Delete Collection"
                        description={`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`}
                        onConfirm={deleteCollection.bind(null, collection.id)}
                        trigger={
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <RiDeleteBinLine className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
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
