'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormValues } from './schema'
import { createProduct, updateProduct, upsertSpecifications, upsertFeatures, updateProductSeo } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ProductImageGallery } from './components/product-image-gallery'
import { SpecificationEditor, type Spec } from './components/specification-editor'
import { FeatureEditor, type Feature } from './components/feature-editor'
import { MediaPickerModal } from '@/features/media/components/media-picker-modal'

interface GalleryImage {
  id: string
  media_id: string
  sort_order: number
  media: { id: string; file_url: string; file_name: string; alt_text: string | null } | null
}

interface ProductFormProps {
  initialData?: ProductFormValues & { id: string; primary_image_id?: string | null }
  initialImages?: GalleryImage[]
  initialSpecs?: Spec[]
  initialFeatures?: Feature[]
}

const CATEGORIES = ['CNC Machining', 'Hydraulic Press', 'Conveyor Systems', 'Robotic Welding', 'Material Handling', 'Other']

export function ProductForm({ initialData, initialImages = [], initialSpecs = [], initialFeatures = [] }: ProductFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData?.id)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: '', slug: '', sku: '', short_description: '', description: '',
      category: '', status: 'draft', is_featured: false, sort_order: 0,
    },
  })

  const [specs, setSpecs] = React.useState<Spec[]>(initialSpecs)
  const [features, setFeatures] = React.useState<Feature[]>(initialFeatures)

  async function onSubmit(data: ProductFormValues) {
    const action = initialData ? updateProduct.bind(null, initialData.id) : createProduct
    const result = await action(data)
    if (!result.success) {
      if (result.error?.fieldErrors) {
        Object.entries(result.error.fieldErrors).forEach(([field, errors]) => {
          form.setError(field as keyof ProductFormValues, { message: (errors as string[])?.[0] })
        })
      } else {
        toast.error(result.error?.message || 'Something went wrong')
      }
      return
    }

    const productId = initialData?.id ?? ('data' in result ? (result.data as { id: string })?.id : undefined)
    
    // Save Specs, Features, SEO
    if (productId) {
      const { seo_title, meta_description, canonical_url, robots, keywords, og_image_id } = form.getValues()
      const [specResult, featureResult, seoResult] = await Promise.all([
        upsertSpecifications(productId, specs.filter(s => s.spec_key && s.spec_value)),
        upsertFeatures(productId, features.filter(f => f.feature_text)),
        updateProductSeo(productId, { 
          seo_title: seo_title ?? '', 
          meta_description: meta_description ?? '', 
          canonical_url: canonical_url ?? '', 
          robots: robots ?? '', 
          keywords: keywords ?? '',
          og_image_id: og_image_id || null
        })
      ])
      
      if (!specResult.success) {
        toast.error(specResult.error?.message || 'Failed to save specifications')
        return
      }

      if (!featureResult.success) {
        toast.error(featureResult.error?.message || 'Failed to save features')
        return
      }
      
      if (!seoResult.success) {
        toast.error(seoResult.error?.message || 'Failed to save SEO metadata')
      }
    }

    toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully')
    router.push('/admin/products')
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
                <p className="text-sm text-slate-500">Core details about your product.</p>
              </div>
              <div className="p-6 space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Product Name *</FormLabel>
                    <FormControl><Input placeholder="CNC Machining Center MX-500" className="bg-slate-50" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">URL Slug</FormLabel>
                      <FormControl><Input placeholder="Leave blank to auto-generate" className="bg-slate-50" {...field} value={field.value || ''} /></FormControl>
                      <FormDescription className="text-xs">Auto-generated from name if empty.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">SKU</FormLabel>
                      <FormControl><Input placeholder="CNC-MX-500" className="bg-slate-50 font-mono" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="short_description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Short Description</FormLabel>
                    <FormControl><Textarea placeholder="A brief 1–2 sentence summary shown on product cards." className="min-h-[80px] bg-slate-50" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Full Description</FormLabel>
                    <FormControl><Textarea placeholder="Detailed product information shown on the product detail page." className="min-h-[200px] bg-slate-50" {...field} value={field.value || ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Media Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#324E64]">Media</h2>
                  <p className="text-sm text-slate-500">Manage images for this product.</p>
                </div>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100">
                      Add images from the media library. <strong>Star ⭐</strong> an image to set it as the primary cover image. Drag to reorder.
                    </p>
                    <ProductImageGallery
                      productId={initialData!.id}
                      initialImages={initialImages}
                      primaryImageId={initialData?.primary_image_id ?? null}
                    />
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-500 font-medium">Save the product first, then come back to add images.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#324E64]">Specifications</h2>
                <p className="text-sm text-slate-500">Technical data shown in a table.</p>
              </div>
              <div className="p-6">
                <SpecificationEditor value={specs} onChange={setSpecs} />
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#324E64]">Features</h2>
                <p className="text-sm text-slate-500">Marketing highlights shown as bullet points.</p>
              </div>
              <div className="p-6">
                <FeatureEditor value={features} onChange={setFeatures} />
              </div>
            </div>

            {/* SEO Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-[#324E64]">Search Engine Optimization</h2>
                <p className="text-sm text-slate-500">Control how this product appears on Google and social media.</p>
              </div>
              <div className="p-6 space-y-6">
                <FormField control={form.control} name="seo_title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">SEO Title</FormLabel>
                    <FormControl><Input placeholder="Leave blank to use product name" className="bg-slate-50" {...field} value={field.value || ''} /></FormControl>
                    <FormDescription className="text-xs">Recommended: max 60 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="meta_description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Meta Description</FormLabel>
                    <FormControl><Textarea placeholder="Leave blank to use short description" className="min-h-[100px] bg-slate-50" {...field} value={field.value || ''} /></FormControl>
                    <FormDescription className="text-xs">Recommended: max 160 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="canonical_url" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Canonical URL</FormLabel>
                      <FormControl><Input placeholder="https://..." className="bg-slate-50" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="keywords" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Keywords</FormLabel>
                      <FormControl><Input placeholder="cnc, milling, etc..." className="bg-slate-50" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="robots" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Robots Meta</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'index,follow'}>
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
                
                <FormItem className="pt-4 border-t border-slate-100">
                  <FormLabel className="text-slate-700 font-semibold">OG / Social Share Image</FormLabel>
                  <MediaPickerModal value={form.watch('og_image_id') || null} onChange={(id) => form.setValue('og_image_id', id || null)} />
                  <FormDescription className="text-xs mt-2">Overrides the primary product image for social sharing.</FormDescription>
                </FormItem>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="xl:col-span-1">
            <div className="space-y-6 xl:h-full xl:overflow-y-auto xl:pr-2 xl:pb-20 custom-scrollbar">
              
              {/* Actions Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-[#324E64] hover:bg-[#324E64]/90 text-white shadow-lg shadow-[#324E64]/20 py-6 text-lg">
                  {form.formState.isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                </Button>
                <Button type="button" variant="outline" className="w-full py-6" onClick={() => router.push('/admin/products')}>
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
                        <FormControl><SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl><SelectTrigger className="bg-slate-50"><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="sort_order" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Sort Order</FormLabel>
                      <FormControl><Input type="number" className="bg-slate-50" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} /></FormControl>
                      <FormDescription className="text-xs">Higher numbers appear last.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Visibility Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-[#324E64]">Visibility</h2>
                </div>
                <div className="p-6">
                  <FormField control={form.control} name="is_featured" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-slate-200 p-4 bg-slate-50 transition-colors hover:bg-slate-100 cursor-pointer">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" /></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-slate-700 font-semibold cursor-pointer">Featured Product</FormLabel>
                        <FormDescription className="text-xs text-slate-500">Feature this product in highlight sections.</FormDescription>
                      </div>
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
