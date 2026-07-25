import * as React from "react"
import { deleteBlog } from "@/features/blog/actions"
import { getBlogs } from "@/features/blog/queries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { RiAddLine, RiPencilLine, RiDeleteBinLine } from "@remixicon/react"
import { format } from "date-fns"
import Link from "next/link"

export default async function BlogAdminPage() {
  const blogs = await getBlogs()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
        <Link href="/admin/blog/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" />
            Add Post
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No blog posts found.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">
                    {blog.title}
                    <div className="text-xs text-muted-foreground font-normal">{blog.slug}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {blog.author_name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {blog.published_at ? format(new Date(blog.published_at), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/blog/${blog.id}`}>
                        <Button variant="ghost" size="icon">
                          <RiPencilLine className="h-4 w-4" />
                        </Button>
                      </Link>
                      <ConfirmDialog
                        title="Delete Post"
                        description={`Are you sure you want to delete "${blog.title}"? This action cannot be undone.`}
                        onConfirm={deleteBlog.bind(null, blog.id)}
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
