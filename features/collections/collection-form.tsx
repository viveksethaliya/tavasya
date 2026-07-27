"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { collectionSchema, CollectionFormValues } from "./schema"
import { createCollection, updateCollection } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ProductAssignmentPicker } from "./product-assignment-picker"
import { MediaPickerModal } from "@/features/media/components/media-picker-modal"

interface CollectionFormProps {
  initialData?: CollectionFormValues & { id: string }
}

export function CollectionForm({ initialData }: CollectionFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData?.id)

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      image_id: "",
      status: "draft",
      sort_order: 0,
      products: [],
      seo_title: "",
      meta_description: "",
      canonical_url: "",
      og_image_id: "",
      robots: "index,follow",
      keywords: "",
    },
  })

  async function onSubmit(data: CollectionFormValues) {
    const action = initialData ? updateCollection.bind(null, initialData.id) : createCollection
    const result = await action(data)

    if (!result.success) {
      if (result.error?.fieldErrors) {
        Object.entries(result.error.fieldErrors).forEach(([field, errors]) => {
          form.setError(field as keyof CollectionFormValues, { message: (errors as string[])?.[0] })
        })
      } else {
        toast.error(result.error?.message || "Something went wrong")
      }
      return
    }

    toast.success(isEditing ? "Collection updated successfully" : "Collection created successfully")
    router.push("/admin/collections")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
        <div className="flex flex-col xl:grid xl:grid-cols-3 gap-8 xl:h-full">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="xl:col-span-2 space-y-8 xl:overflow-y-auto xl:pr-4 xl:pb-20 custom-scrollbar">
            
            {/* General Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#324E64]">General Information</h2>
                <p className="text-sm text-slate-500">Core details about your collection.</p>
              </div>
              <div className="p-6 space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Name *</FormLabel>
                    <FormControl><Input placeholder="Summer Sale" className="bg-slate-50" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Slug (Optional)</FormLabel>
                    <FormControl><Input placeholder="Leave blank to auto-generate" className="bg-slate-50" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe the collection..." className="min-h-[120px] bg-slate-50" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="image_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Collection Cover Image</FormLabel>
                    <FormControl><MediaPickerModal value={field.value} onChange={field.onChange} /></FormControl>
                    <FormDescription className="text-xs">Select an image from the media library to represent this collection.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Products Assignment Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#324E64]">Assigned Products</h2>
                <p className="text-sm text-slate-500">Search for products and drag to reorder them.</p>
              </div>
              <div className="p-6">
                <FormField control={form.control} name="products" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ProductAssignmentPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* SEO Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#324E64]">Search Engine Optimization</h2>
                <p className="text-sm text-slate-500">Control how this collection appears on Google and social media.</p>
              </div>
              <div className="p-6 space-y-6">
                <FormField control={form.control} name="seo_title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">SEO Title</FormLabel>
                    <FormControl><Input placeholder="Custom title for search engines" className="bg-slate-50" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="meta_description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Meta Description</FormLabel>
                    <FormControl><Textarea placeholder="Brief description for search results" className="min-h-[100px] bg-slate-50" {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="canonical_url" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Canonical URL</FormLabel>
                      <FormControl><Input placeholder="https://example.com/..." className="bg-slate-50" {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="keywords" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Keywords</FormLabel>
                      <FormControl><Input placeholder="keyword1, keyword2" className="bg-slate-50" {...field} value={field.value || ""} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="robots" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Robots Meta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "index,follow"}>
                      <FormControl><SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="index,follow">Index, Follow</SelectItem>
                        <SelectItem value="noindex,follow">No-Index, Follow</SelectItem>
                        <SelectItem value="noindex,nofollow">No-Index, No-Follow</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="og_image_id" render={({ field }) => (
                  <FormItem className="pt-4 border-t border-slate-100">
                    <FormLabel className="text-slate-700 font-semibold">OG / Social Share Image</FormLabel>
                    <FormControl><MediaPickerModal value={field.value} onChange={field.onChange} /></FormControl>
                    <FormDescription className="text-xs mt-2">Overrides the primary collection image for social sharing.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="xl:col-span-1">
            <div className="space-y-6 xl:h-full xl:overflow-y-auto xl:pr-2 xl:pb-20 custom-scrollbar">
              
              {/* Actions Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-[#324E64] hover:bg-[#324E64]/90 text-white shadow-lg shadow-[#324E64]/20 py-6 text-lg">
                  {form.formState.isSubmitting ? "Saving..." : isEditing ? "Update Collection" : "Create Collection"}
                </Button>
                <Button type="button" variant="outline" className="w-full py-6" onClick={() => router.push("/admin/collections")}>
                  Discard Changes
                </Button>
              </div>

              {/* Organization Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-[#324E64]">Organization</h2>
                </div>
                <div className="p-6 space-y-6">
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="bg-slate-50"><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="sort_order" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Sort Order</FormLabel>
                      <FormControl><Input type="number" className="bg-slate-50" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} /></FormControl>
                      <FormDescription className="text-xs">Determines display order. Higher numbers appear last.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </form>
    </Form>
  )
}
