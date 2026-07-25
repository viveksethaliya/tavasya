import { CollectionForm } from "@/features/collections/collection-form"
import { RiArrowLeftLine } from "@remixicon/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/collections">
          <Button variant="ghost" size="icon">
            <RiArrowLeftLine className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create Collection</h1>
      </div>
      
      <div className="rounded-md border bg-card p-6">
        <CollectionForm />
      </div>
    </div>
  )
}
