'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { RiAddLine, RiEdit2Line, RiDeleteBinLine, RiSearchLine, RiFilter3Line } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { IconButton } from '@/components/ui/icon-button'
import { EmptyState } from '@/components/ui/empty-state'
import { toast } from 'sonner'
import { deleteProduct } from '../actions'

// Define a minimal type for what we need, matching the DB schema
export interface ProductData {
  id: string
  name: string
  sku: string | null
  category: string | null
  status: 'draft' | 'published'
}

interface AdminProductsTableProps {
  initialProducts: ProductData[]
}

type SortField = 'name' | 'sku' | 'status'
type SortOrder = 'asc' | 'desc'

export function AdminProductsTable({ initialProducts }: AdminProductsTableProps) {
  const [products, setProducts] = useState<ProductData[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Extract unique categories for the filter
  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map(p => p.category).filter(Boolean) as string[])
    return Array.from(cats).sort()
  }, [initialProducts])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products]

    // 1. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
      )
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    // 3. Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter)
    }

    // 4. Sort
    result.sort((a, b) => {
      let aValue = a[sortField] || ''
      let bValue = b[sortField] || ''
      
      // Fallbacks for nulls
      if (aValue === null) aValue = ''
      if (bValue === null) bValue = ''

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [products, searchQuery, statusFilter, categoryFilter, sortField, sortOrder])

  const handleDelete = async (id: string) => {
    const res = await deleteProduct(id)
    if (res.success) {
      toast.success('Product deleted successfully')
      setProducts(prev => prev.filter(p => p.id !== id))
    } else {
      toast.error(res.error?.message || 'Failed to delete product')
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return <span className="ml-1 text-xs text-[#F3BA43]">{sortOrder === 'asc' ? '▲' : '▼'}</span>
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#324E64] tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your machinery and equipment catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#324E64] hover:bg-[#324E64]/90 w-full sm:w-auto shadow-sm">
            <RiAddLine className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search by name or SKU..."
            className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-3 flex-col sm:flex-row">
          <div className="flex items-center gap-2">
            <RiFilter3Line className="h-5 w-5 text-slate-400 hidden sm:block" />
            <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val) }}>
              <SelectTrigger className="w-full sm:w-[140px] bg-slate-50/50 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={categoryFilter} onValueChange={(val) => { if (val) setCategoryFilter(val) }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-50/50 h-10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      {products.length === 0 ? (
        <EmptyState 
          title="No products yet" 
          description="You haven't created any products. Start by adding your first machine."
          action={
            <Link href="/admin/products/new">
              <Button className="bg-[#324E64] hover:bg-[#324E64]/90">Create Product</Button>
            </Link>
          }
        />
      ) : filteredAndSortedProducts.length === 0 ? (
        <EmptyState 
          title="No results found" 
          description="Try adjusting your search or filters to find what you're looking for."
          action={
            <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); }}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead 
                  className="font-semibold text-slate-700 px-6 py-4 cursor-pointer hover:text-[#324E64] transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Name {getSortIcon('name')}
                </TableHead>
                <TableHead 
                  className="font-semibold text-slate-700 px-6 py-4 cursor-pointer hover:text-[#324E64] transition-colors"
                  onClick={() => handleSort('sku')}
                >
                  SKU {getSortIcon('sku')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 px-6 py-4">Category</TableHead>
                <TableHead 
                  className="font-semibold text-slate-700 px-6 py-4 cursor-pointer hover:text-[#324E64] transition-colors"
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIcon('status')}
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700 px-6 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id} className="group hover:bg-slate-50 transition-colors border-slate-100">
                  <TableCell className="font-semibold text-slate-800 px-6 py-4">{product.name}</TableCell>
                  <TableCell className="text-slate-500 font-mono text-sm px-6 py-4">{product.sku || "-"}</TableCell>
                  <TableCell className="px-6 py-4">
                    {product.category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge 
                      variant={product.status === "published" ? "default" : "secondary"}
                      className={product.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-none' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 shadow-none'}
                    >
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2 px-6 py-4">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <IconButton 
                        aria-label="Edit product" 
                        icon={<RiEdit2Line className="h-4 w-4" />} 
                        className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm"
                      />
                    </Link>
                    <ConfirmDialog
                      title="Delete Product"
                      description={`Are you sure you want to delete ${product.name}? This action cannot be undone.`}
                      destructive
                      confirmText="Delete"
                      onConfirm={() => handleDelete(product.id)}
                      trigger={
                        <IconButton 
                          aria-label="Delete product" 
                          variant="destructive" 
                          icon={<RiDeleteBinLine className="h-4 w-4" />}
                          className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        />
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
