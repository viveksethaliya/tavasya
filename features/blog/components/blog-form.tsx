"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { blogSchema, BlogFormValues } from "../schema"
import { createBlog, updateBlog } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import DOMPurify from "isomorphic-dompurify"
import dynamic from "next/dynamic"
import { MediaPickerModal } from "@/features/media/components/media-picker-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RiEyeLine } from "@remixicon/react"

const RichTextEditor = dynamic(() => import("./rich-text-editor").then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="min-h-[200px] flex items-center justify-center border rounded-md">Loading editor...</div> })

interface BlogFormProps {
  initialData?: BlogFormValues & { id: string }
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter()
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle")
  const [blogId, setBlogId] = React.useState<string | undefined>(initialData?.id)

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image_id: "",
      author_name: "",
      status: "draft",
      published_at: "",
      seo_title: "",
      meta_description: "",
      canonical_url: "",
      og_image_id: "",
      robots: "index,follow",
      keywords: "",
    },
  })

  const formRef = React.useRef(form)
  React.useEffect(() => {
    formRef.current = form
  }, [form])
  
  const blogIdRef = React.useRef(blogId)
  React.useEffect(() => {
    blogIdRef.current = blogId
  }, [blogId])

  React.useEffect(() => {
    const interval = setInterval(async () => {
      const currentForm = formRef.current
      if (!currentForm.formState.isDirty) return
      
      const data = currentForm.getValues()
      if (data.status !== "draft") return
      if (!data.title || data.title.length < 2) return

      setSaveStatus("saving")
      const currentId = blogIdRef.current
      const action = currentId ? updateBlog.bind(null, currentId) : createBlog
      
      try {
        const result = await action(data)
        if (result.success) {
          setSaveStatus("saved")
          currentForm.reset(data, { keepValues: true })
          if (!currentId && result.data?.id) {
            setBlogId(result.data.id)
            window.history.replaceState(null, '', `/admin/blog/${result.data.id}/edit`)
          }
          setTimeout(() => {
            setSaveStatus(prev => prev === "saved" ? "idle" : prev)
          }, 3000)
        } else {
          setSaveStatus("error")
        }
      } catch (err) {
        setSaveStatus("error")
      }
    }, 15000)
    
    return () => clearInterval(interval)
  }, [])

  async function onSubmit(data: BlogFormValues) {
    const currentId = blogIdRef.current
    const action = currentId ? updateBlog.bind(null, currentId) : createBlog
    
    const result = await action(data)

    if (!result.success) {
      if (result.error?.fieldErrors) {
        Object.entries(result.error.fieldErrors).forEach(([field, errors]) => {
          form.setError(field as keyof BlogFormValues, { message: (errors as string[])?.[0] })
        })
      } else {
        toast.error(result.error?.message || "Something went wrong")
      }
      return
    }

    toast.success(currentId ? "Blog post updated" : "Blog post created")
    router.push("/admin/blog")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value || ""} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short summary for blog cards..." className="min-h-[100px]" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4 pt-8 border-t">
              <h3 className="text-lg font-medium">SEO & Meta</h3>
              <FormField
                control={form.control}
                name="seo_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave blank to use post title" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Leave blank to use excerpt" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave blank to auto-generate" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="canonical_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canonical URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="robots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Robots</FormLabel>
                    <FormControl>
                      <Input placeholder="index,follow" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="comma, separated, keywords" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-md space-y-4 border">
              <h3 className="font-semibold">Publishing</h3>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="published_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Date override (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_image_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <MediaPickerModal value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="og_image_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Share (OG) Image</FormLabel>
                  <FormControl>
                    <MediaPickerModal value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>Leave empty to use Cover Image</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-t pt-6">
          <Button type="submit" disabled={form.formState.isSubmitting || saveStatus === "saving"} className="bg-[#324E64] hover:bg-[#324E64]/90">
            {form.formState.isSubmitting || saveStatus === "saving" ? "Saving..." : "Save Post"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
            Cancel
          </Button>

          <div className="text-sm ml-2 text-slate-500 font-medium transition-opacity">
            {saveStatus === "saving" && <span className="animate-pulse">Auto-saving...</span>}
            {saveStatus === "saved" && <span className="text-emerald-600">Saved as draft</span>}
            {saveStatus === "error" && <span className="text-red-500">Auto-save failed</span>}
          </div>
          
          <Dialog>
            <DialogTrigger render={<Button type="button" variant="secondary" className="ml-auto flex items-center gap-2" />}>
              <RiEyeLine className="h-4 w-4" />
              Preview Post
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#324E64]">Preview: {form.watch('title') || 'Untitled Post'}</DialogTitle>
              </DialogHeader>
              <div className="bg-white p-8 sm:p-12 mt-4 rounded-xl border border-slate-100 shadow-sm">
                <article className="prose prose-slate prose-lg max-w-none mx-auto">
                  <h1>{form.watch('title') || 'Your blog title will appear here'}</h1>
                  {form.watch('excerpt') && (
                    <p className="lead text-slate-500">{form.watch('excerpt')}</p>
                  )}
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.watch('content') || '<p>Start writing to see preview...</p>') }} />
                </article>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </Form>
  )
}
