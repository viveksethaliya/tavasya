import { CollectionForm } from "@/features/collections/collection-form"
import { RiArrowLeftLine } from "@remixicon/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/collections">
          <Button variant="ghost" size="icon" aria-label="Back to collections">
            <RiArrowLeftLine className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Create Collection</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create a new product group.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <CollectionForm />
      </div>
    </div>
  )
}
