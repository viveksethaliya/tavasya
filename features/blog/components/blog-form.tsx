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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { RiEyeLine, RiCloseLine, RiSettings3Line } from "@remixicon/react"
import { Badge } from "@/components/ui/badge"

const RichTextEditor = dynamic(() => import("./rich-text-editor").then(mod => mod.RichTextEditor), { ssr: false, loading: () => <div className="min-h-[200px] flex items-center justify-center border rounded-md">Loading editor...</div> })

interface BlogFormProps {
  initialData?: BlogFormValues & { id: string }
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter()
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null)
  const [timeAgo, setTimeAgo] = React.useState<string>("")
  const [blogId, setBlogId] = React.useState<string | undefined>(initialData?.id)
  const [showSeo, setShowSeo] = React.useState(false)
  const [pendingPublishData, setPendingPublishData] = React.useState<BlogFormValues | null>(null)

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

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [form.formState.isDirty])
  
  const content = form.watch("content") || ""
  const wordCount = React.useMemo(() => {
    const text = content.replace(/<[^>]*>?/gm, '')
    return text.split(/\s+/).filter(word => word.length > 0).length
  }, [content])
  const readingTime = Math.ceil(wordCount / 200) || 1
  
  const blogIdRef = React.useRef(blogId)
  React.useEffect(() => {
    blogIdRef.current = blogId
  }, [blogId])

  React.useEffect(() => {
    if (!lastSavedAt) return
    const updateTimeAgo = () => {
      const diffMs = Date.now() - lastSavedAt.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins === 0) setTimeAgo("just now")
      else setTimeAgo(`${diffMins}m ago`)
    }
    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000)
    return () => clearInterval(interval)
  }, [lastSavedAt])

  React.useEffect(() => {
    const interval = setInterval(async () => {
      const currentForm = formRef.current
      if (!currentForm.formState.isDirty) return
      
      const data = currentForm.getValues()
      if (data.status !== "draft") return
      if (!data.title || data.title.length < 2) return

      setSaveStatus("saving")
      const currentId = blogIdRef.current
      
      try {
        if (currentId) {
          const result = await updateBlog(currentId, data)
          if (result.success) {
            setSaveStatus("saved")
            setLastSavedAt(new Date())
            currentForm.reset(data, { keepValues: true })
            setTimeout(() => {
              setSaveStatus(prev => prev === "saved" ? "idle" : prev)
            }, 3000)
          } else {
            setSaveStatus("error")
          }
        } else {
          const result = await createBlog(data)
          if (result.success && result.data) {
            setSaveStatus("saved")
            setLastSavedAt(new Date())
            currentForm.reset(data, { keepValues: true })
            setBlogId(result.data.id)
            window.history.replaceState(null, '', `/admin/blog/${result.data.id}/edit`)
            setTimeout(() => {
              setSaveStatus(prev => prev === "saved" ? "idle" : prev)
            }, 3000)
          } else {
            setSaveStatus("error")
          }
        }
      } catch (err) {
        setSaveStatus("error")
      }
    }, 15000)
    
    return () => clearInterval(interval)
  }, [])

  async function onSubmit(data: BlogFormValues) {
    if (data.status === 'published' && initialData?.status !== 'published' && !pendingPublishData) {
      setPendingPublishData(data)
      return
    }

    setPendingPublishData(null)
    const currentId = blogIdRef.current
    const action = currentId ? updateBlog.bind(null, currentId) : createBlog
    
    try {
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

      setLastSavedAt(new Date())
      toast.success(currentId ? "Blog post updated" : "Blog post created")
      router.push("/admin/blog")
    } catch (error: any) {
      console.error("Save error:", error)
      toast.error(error?.message || "Failed to save post. The content might be too large.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full relative pb-20">
        
        {/* Sticky Action Bar */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-200 mb-8 -mx-6 lg:-mx-8 lg:px-8 flex items-center gap-4 shadow-sm rounded-t-2xl">
          <div className="flex-1 flex items-center gap-4">
            <h2 className="text-lg font-bold text-[#324E64] hidden sm:block">
              {form.watch('title') || 'Untitled Post'}
            </h2>
            <div className="text-sm text-slate-500 font-medium transition-opacity" aria-live="polite">
              {saveStatus === "saving" && <span className="animate-pulse flex items-center gap-2"><div className="h-2 w-2 bg-blue-500 rounded-full"></div>Auto-saving draft...</span>}
              {saveStatus === "saved" && <span className="text-emerald-600 flex items-center gap-2"><div className="h-2 w-2 bg-emerald-500 rounded-full"></div>Draft auto-saved</span>}
              {saveStatus === "error" && <span className="text-red-500 flex items-center gap-2"><div className="h-2 w-2 bg-red-500 rounded-full"></div>Auto-save failed</span>}
              {saveStatus === "idle" && lastSavedAt && <span className="flex items-center gap-2"><div className="h-2 w-2 bg-slate-300 rounded-full"></div>Last auto-saved {timeAgo}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger render={<Button type="button" variant="secondary" className="flex items-center gap-2" />}>
                <RiEyeLine className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </DialogTrigger>
              <DialogContent showCloseButton={false} className="max-w-none sm:max-w-none !w-screen !h-[100dvh] max-h-none !rounded-none m-0 !p-0 !gap-0 border-none flex flex-col bg-slate-100 overflow-hidden">
                <div className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 sticky top-0">
                  <DialogHeader>
                    <DialogTitle className="text-[#324E64] text-lg truncate">Preview: {form.watch('title') || 'Untitled Post'}</DialogTitle>
                  </DialogHeader>
                  <DialogClose render={<Button type="button" variant="ghost" size="icon" aria-label="Close Preview" />}>
                    <RiCloseLine className="h-6 w-6 text-slate-500" />
                  </DialogClose>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                  <div className="bg-white p-8 sm:p-16 max-w-4xl mx-auto rounded-2xl border border-slate-200 shadow-sm min-h-full">
                    <article className="prose prose-slate prose-lg max-w-none mx-auto prose-headings:text-[#324E64] prose-a:text-[#F3BA43]">
                      <h1>{form.watch('title') || 'Your blog title will appear here'}</h1>
                      {form.watch('excerpt') && (
                        <p className="lead text-slate-500">{form.watch('excerpt')}</p>
                      )}
                      {/* eslint-disable-next-line react/no-danger */}
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.watch('content') || '<p>Start writing to see preview...</p>') }} />
                    </article>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button type="button" variant="ghost" size="icon" onClick={() => router.push("/admin/blog")} className="sm:hidden" aria-label="Cancel">
              <RiCloseLine className="h-5 w-5 text-slate-500" />
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")} className="hidden sm:inline-flex">
              Cancel
            </Button>
            
            <div className="sm:hidden">
              <Drawer>
                <DrawerTrigger render={<Button type="button" variant="outline" size="icon" />}>
                  <RiSettings3Line className="h-5 w-5 text-slate-600" />
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                  <DrawerHeader>
                    <DrawerTitle>Post Settings</DrawerTitle>
                  </DrawerHeader>
                  <div className="overflow-y-auto p-4 space-y-6">
                    <SidebarContent form={form} showSeo={showSeo} setShowSeo={setShowSeo} />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting || saveStatus === "saving"} className="bg-[#324E64] hover:bg-[#324E64]/90">
              {form.formState.isSubmitting || (saveStatus === "saving" && !form.formState.isDirty) ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </div>

        <Dialog open={!!pendingPublishData} onOpenChange={(open) => !open && setPendingPublishData(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#324E64]">Publish Post?</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-slate-600">
              This post will become immediately visible to the public. Are you sure you want to proceed?
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setPendingPublishData(null)}>Cancel</Button>
              <Button type="button" onClick={() => pendingPublishData && onSubmit(pendingPublishData)} className="bg-[#F3BA43] hover:bg-[#F3BA43]/90 text-white font-semibold">Publish Post</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-2">
          
          <div className="xl:col-span-8 space-y-10">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormControl>
                    <Input 
                      placeholder="Post Title..." 
                      className="text-4xl sm:text-5xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto py-2 placeholder:text-slate-300 text-[#324E64]" 
                      {...field} 
                    />
                  </FormControl>
                  {!field.value && <span className="absolute top-2 left-[-1.5rem] text-red-500 text-4xl" aria-hidden="true">*</span>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="flex items-center gap-1 text-sm text-slate-500 mt-2 mb-6">
                  <span>tavasya.com/blog/</span>
                  <FormControl>
                    <Input 
                      placeholder="auto-generated-slug" 
                      className="h-7 border-transparent bg-transparent hover:border-slate-200 focus-visible:border-slate-300 px-2 py-0 -ml-2 text-slate-600 font-medium" 
                      {...field} 
                      value={field.value || ""} 
                    />
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
                  <div className="flex justify-end text-xs text-slate-400 mt-2 gap-2">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{readingTime} min read</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Excerpt</FormLabel>
                    <span className={`text-xs ${(field.value?.length || 0) > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                      {(field.value || "").length}/160
                    </span>
                  </div>
                  <FormControl>
                    <Textarea placeholder="Short summary for blog cards..." className="min-h-[100px]" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
          </div>

          <div className="xl:col-span-4 space-y-6 hidden sm:block">
            <SidebarContent form={form} showSeo={showSeo} setShowSeo={setShowSeo} />
          </div>
        </div>
      </form>
    </Form>
  )
}

function SidebarContent({ form, showSeo, setShowSeo }: { form: any, showSeo: boolean, setShowSeo: (val: boolean) => void }) {
  return (
    <>
      <div className="bg-white p-6 rounded-2xl space-y-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-[#324E64]">Publishing</h3>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="font-semibold h-10 w-full flex justify-between items-center">
                    <SelectValue placeholder="Select status">
                      <Badge variant={field.value === "published" ? "default" : "secondary"} className="pointer-events-none uppercase tracking-wider text-[10px]">
                        {field.value}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft"><Badge variant="secondary" className="uppercase tracking-wider text-[10px]">Draft</Badge></SelectItem>
                  <SelectItem value="published"><Badge variant="default" className="uppercase tracking-wider text-[10px]">Published</Badge></SelectItem>
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
              <FormDescription>Leave blank to default to current time when published.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl space-y-4 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-[#324E64]">Featured Image</h3>
        <p className="text-xs text-slate-500 mb-2">Shown at the top of the post and in blog listings.</p>
        <FormField
          control={form.control}
          name="cover_image_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MediaPickerModal value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="bg-white p-6 rounded-2xl space-y-4 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-[#324E64]">Social Share</h3>
        <p className="text-xs text-slate-500 mb-2">Image used for link previews.</p>
        <FormField
          control={form.control}
          name="og_image_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MediaPickerModal value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription className="text-xs mt-2">Leave empty to default to Featured Image</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl space-y-4 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-[#324E64]">Author</h3>
        <FormField
          control={form.control}
          name="author_name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="e.g. Jane Doe" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <button 
          type="button" 
          onClick={() => setShowSeo(!showSeo)} 
          className="flex items-center justify-between w-full text-left font-bold text-[#324E64] hover:text-[#F3BA43] transition-colors"
        >
          SEO Configuration
          <span className={`transform transition-transform duration-300 ${showSeo ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {!showSeo && <p className="text-xs text-slate-500 mt-1">Using post title & excerpt.</p>}
        
        {showSeo && (
          <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 font-sans">
              <div className="text-sm text-[#1a0dab] truncate font-medium">{form.watch('seo_title') || form.watch('title') || 'SEO Title'}</div>
              <div className="text-xs text-[#006621] truncate mt-0.5">tavasya.com/blog/{form.watch('slug') || 'your-slug'}</div>
              <div className="text-xs text-[#545454] line-clamp-2 mt-1 leading-snug">{form.watch('meta_description') || form.watch('excerpt') || 'Your meta description will appear here in search results. It helps users decide whether to click.'}</div>
            </div>

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
        )}
      </div>
    </>
  )
}
