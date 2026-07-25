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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  initialData?: ProductFormValues & { id: string }
  initialImages?: GalleryImage[]
  initialSpecs?: Spec[]
  initialFeatures?: Feature[]
}

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
    if (productId) {
      await Promise.all([
        upsertSpecifications(productId, specs.filter(s => s.spec_key && s.spec_value)),
        upsertFeatures(productId, features.filter(f => f.feature_text)),
      ])
    }

    toast.success(isEditing ? 'Product updated' : 'Product created')
    router.push('/admin/products')
    router.refresh()
  }

  async function handleSeoSave() {
    if (!initialData?.id) return
    const { seo_title, meta_description, canonical_url, robots, keywords } = form.getValues()
    // og_image_id isn't in the main schema - get separately
    const res = await updateProductSeo(initialData.id, { seo_title: seo_title ?? '', meta_description: meta_description ?? '', canonical_url: canonical_url ?? '', robots: robots ?? '', keywords: keywords ?? '' })
    if (res.success) toast.success('SEO saved')
    else toast.error(res.error?.message ?? 'Failed to save SEO')
  }

  const CATEGORIES = ['CNC Machining', 'Hydraulic Press', 'Conveyor Systems', 'Robotic Welding', 'Material Handling', 'Other']

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="info">
          <TabsList className="mb-6 bg-[#F0F2F5] p-1 rounded-xl h-auto flex-wrap gap-1">
            {[
              { value: 'info', label: 'Info' },
              { value: 'images', label: 'Images', disabled: !isEditing },
              { value: 'specs', label: 'Specifications' },
              { value: 'features', label: 'Features' },
              { value: 'seo', label: 'SEO' },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                className="rounded-lg data-[state=active]:bg-[#324E64] data-[state=active]:text-white"
              >
                {tab.label}
                {tab.disabled && <span className="ml-1 text-xs opacity-50">(save first)</span>}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name *</FormLabel>
                <FormControl><Input placeholder="CNC Machining Center MX-500" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl><Input placeholder="Leave blank to auto-generate" {...field} value={field.value || ''} /></FormControl>
                  <FormDescription className="text-xs">Auto-generated from name if empty</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl><Input placeholder="CNC-MX-500" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="short_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl><Textarea placeholder="A brief 1–2 sentence summary shown on product cards." className="min-h-[80px]" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Description</FormLabel>
                <FormControl><Textarea placeholder="Detailed product information shown on the product detail page." className="min-h-[160px]" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="is_featured" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-[#F0F2F5]">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Product</FormLabel>
                  <FormDescription>Featured products appear in the homepage highlight section.</FormDescription>
                </div>
              </FormItem>
            )} />
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            {isEditing ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Add images from the media library. Star ⭐ an image to set it as the primary (shown on listing cards and OG image).</p>
                <ProductImageGallery
                  productId={initialData!.id}
                  initialImages={initialImages}
                  primaryImageId={null}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-2xl">
                <p className="text-sm">Save the product first, then come back to add images.</p>
              </div>
            )}
          </TabsContent>

          {/* Specs Tab */}
          <TabsContent value="specs" className="space-y-4">
            <p className="text-sm text-slate-500">Technical specifications shown as a data table on the product page.</p>
            <SpecificationEditor value={specs} onChange={setSpecs} />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <p className="text-sm text-slate-500">Marketing feature highlights shown as a bullet list on the product page.</p>
            <FeatureEditor value={features} onChange={setFeatures} />
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <FormField control={form.control} name="seo_title" render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title</FormLabel>
                <FormControl><Input placeholder="Leave blank to use product name" {...field} value={field.value || ''} /></FormControl>
                <FormDescription className="text-xs">Recommended: max 60 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="meta_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Description</FormLabel>
                <FormControl><Textarea placeholder="Leave blank to use short description" {...field} value={field.value || ''} /></FormControl>
                <FormDescription className="text-xs">Recommended: max 160 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="canonical_url" render={({ field }) => (
              <FormItem>
                <FormLabel>Canonical URL</FormLabel>
                <FormControl><Input placeholder="https://..." {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="keywords" render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords</FormLabel>
                <FormControl><Input placeholder="cnc machining, precision milling, ..." {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="robots" render={({ field }) => (
              <FormItem>
                <FormLabel>Robots</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'index,follow'}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="index,follow">index, follow</SelectItem>
                    <SelectItem value="noindex,follow">noindex, follow</SelectItem>
                    <SelectItem value="noindex,nofollow">noindex, nofollow</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {/* OG Image */}
            <FormItem>
              <FormLabel>OG / Social Share Image</FormLabel>
              <MediaPickerModal value={null} onChange={(id) => form.setValue('og_image_id' as keyof ProductFormValues, id as never)} />
              <FormDescription className="text-xs">Leave blank to use the primary product image.</FormDescription>
            </FormItem>
            {isEditing && (
              <Button type="button" variant="outline" onClick={handleSeoSave}>Save SEO</Button>
            )}
          </TabsContent>
        </Tabs>

        {/* Form actions */}
        <div className="flex gap-4 border-t pt-6 mt-6">
          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#324E64] hover:bg-[#324E64]/90">
            {form.formState.isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
