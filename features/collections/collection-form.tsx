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

    toast.success(initialData ? "Collection updated" : "Collection created")
    router.push("/admin/collections")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Sale" {...field} />
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
                  <FormLabel>Slug (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Leave blank to auto-generate" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the collection..." className="min-h-[120px]" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Collection Image from Media Library */}
            <FormField
              control={form.control}
              name="image_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection Image</FormLabel>
                  <FormControl>
                    <MediaPickerModal value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>Select an image from the media library.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
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
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Products</FormLabel>
                  <FormDescription>Search for products to add to this collection, and drag to reorder them.</FormDescription>
                  <FormControl>
                    <ProductAssignmentPicker 
                      value={field.value} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4 border-t pt-6">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Collection"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/collections")}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
