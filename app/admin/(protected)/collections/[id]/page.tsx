import { CollectionForm } from "@/features/collections/collection-form"
import { getCollectionById } from "@/features/collections/queries"
import { RiArrowLeftLine } from "@remixicon/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  let collection
  try {
    collection = await getCollectionById(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/collections">
          <Button variant="ghost" size="icon" aria-label="Back to collections">
            <RiArrowLeftLine className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Edit Collection</h1>
          <p className="text-sm text-slate-500 mt-0.5">{collection.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <CollectionForm initialData={collection} />
      </div>
    </div>
  )
}

