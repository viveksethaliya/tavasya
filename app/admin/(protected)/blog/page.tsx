import * as React from "react"
import { deleteBlog } from "@/features/blog/actions"
import { getBlogs } from "@/features/blog/queries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { IconButton } from "@/components/ui/icon-button"
import { RiAddLine, RiEdit2Line, RiDeleteBinLine } from "@remixicon/react"
import { format } from "date-fns"
import Link from "next/link"

export default async function BlogAdminPage() {
  const { data: blogs, error } = await getBlogs()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Blog Posts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your articles, news, and guides.</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="bg-[#324E64] hover:bg-[#324E64]/90 w-full sm:w-auto">
            <RiAddLine className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">
          <p className="font-semibold">Failed to load blog posts</p>
          <p className="text-sm mt-1 text-red-600">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F0F2F5]">
              <TableRow className="hover:bg-[#F0F2F5]">
                <TableHead className="font-semibold text-[#324E64] px-6 py-4">Title</TableHead>
                <TableHead className="font-semibold text-[#324E64] px-6 py-4">Author</TableHead>
                <TableHead className="font-semibold text-[#324E64] px-6 py-4">Published Date</TableHead>
                <TableHead className="font-semibold text-[#324E64] px-6 py-4">Status</TableHead>
                <TableHead className="text-right font-semibold text-[#324E64] px-6 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No blog posts found.
                  </TableCell>
                </TableRow>
              ) : (
                blogs.map((blog) => (
                  <TableRow key={blog.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900 px-6 py-4">
                      {blog.title}
                      <div className="text-xs text-slate-500 font-normal">{blog.slug}</div>
                    </TableCell>
                    <TableCell className="text-slate-500 px-6 py-4">
                      {blog.author_name || "-"}
                    </TableCell>
                    <TableCell className="text-slate-500 px-6 py-4">
                      {blog.published_at ? format(new Date(blog.published_at), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                        {blog.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2 px-6 py-4">
                      <Link href={`/admin/blog/${blog.id}/edit`}>
                        <IconButton aria-label="Edit post" icon={<RiEdit2Line className="h-4 w-4" />} />
                      </Link>
                      <ConfirmDialog
                        title="Delete Post"
                        description={`Are you sure you want to delete "${blog.title}"? This action cannot be undone.`}
                        destructive
                        confirmText="Delete"
                        onConfirm={deleteBlog.bind(null, blog.id)}
                        trigger={<IconButton aria-label="Delete post" variant="destructive" icon={<RiDeleteBinLine className="h-4 w-4" />} />}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
