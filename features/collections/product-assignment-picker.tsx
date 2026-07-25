"use client"

import * as React from "react"
import { searchProducts, getProductsByIds } from "./actions"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RiDragMove2Line, RiCloseLine, RiSearchLine } from "@remixicon/react"

interface ProductItem {
  id: string
  name: string
  sku?: string | null
}

interface ProductAssignmentPickerProps {
  value?: string[]
  onChange: (value: string[]) => void
}

function SortableItem({ product, onRemove }: { product: ProductItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 mb-2 bg-card border rounded-md shadow-sm">
      <div {...attributes} {...listeners} className="cursor-grab hover:text-primary active:cursor-grabbing text-muted-foreground p-1">
        <RiDragMove2Line className="w-5 h-5" />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-medium text-sm truncate">{product.name}</p>
        {product.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
      </div>
      <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(product.id)} className="text-muted-foreground hover:text-destructive">
        <RiCloseLine className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function ProductAssignmentPicker({ value = [], onChange }: ProductAssignmentPickerProps) {
  const [items, setItems] = React.useState<ProductItem[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<ProductItem[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load initial products based on the value (IDs)
  React.useEffect(() => {
    if (value.length > 0 && items.length === 0) {
      getProductsByIds(value).then(res => {
        if (res.success && res.data) {
          setItems(res.data)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Handle search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        searchProducts(searchQuery).then(res => {
          if (res.success && res.data) {
            setSearchResults(res.data)
          }
          setIsSearching(false)
        })
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update form state
        onChange(newItems.map(i => i.id))
        return newItems
      })
    }
  }

  const handleAddProduct = (product: ProductItem) => {
    if (!items.some(i => i.id === product.id)) {
      const newItems = [...items, product]
      setItems(newItems)
      onChange(newItems.map(i => i.id))
    }
    setSearchQuery("")
    setSearchResults([])
  }

  const handleRemoveProduct = (id: string) => {
    const newItems = items.filter(i => i.id !== id)
    setItems(newItems)
    onChange(newItems.map(i => i.id))
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <RiSearchLine className="h-4 w-4" />
        </div>
        <Input
          placeholder="Search products to add..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {/* Search Results Dropdown */}
        {searchQuery.length >= 2 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
            {isSearching ? (
              <div className="p-3 text-sm text-muted-foreground">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(product => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                  onClick={() => handleAddProduct(product)}
                >
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    {product.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
                  </div>
                  {items.some(i => i.id === product.id) ? (
                    <span className="text-xs font-semibold text-primary">Added</span>
                  ) : (
                    <Button type="button" variant="secondary" size="sm">Add</Button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-muted-foreground">No products found.</div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground p-6 text-center border rounded-md border-dashed bg-muted/20">
            No products assigned yet. Search and add products above.
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map(product => (
                <SortableItem key={product.id} product={product} onRemove={handleRemoveProduct} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
