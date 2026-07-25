"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import {
  RiSendPlaneFill,
  RiSettings3Line,
  RiAddLine,
  RiDeleteBinLine,
} from "@remixicon/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function ComponentsDevPage() {
  return (
    <div className="min-h-screen bg-background p-8 md:p-12 space-y-16 max-w-6xl mx-auto">
      <div className="space-y-4 border-b pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Design System Components</h1>
        <p className="text-muted-foreground text-lg">
          Development preview of all Tier 1 UI primitives (Phase 4).
        </p>
      </div>

      {/* Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button>
            <RiSendPlaneFill className="mr-2 h-4 w-4" /> With Icon
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 items-end pt-4">
          <IconButton aria-label="Settings" icon={<RiSettings3Line className="h-4 w-4" />} />
          <IconButton aria-label="Add" icon={<RiAddLine className="h-4 w-4" />} />
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      {/* Forms */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Form Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input Field</label>
            <Input placeholder="Enter something..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Dropdown</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Option 1</SelectItem>
                <SelectItem value="2">Option 2</SelectItem>
                <SelectItem value="3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Textarea</label>
            <Textarea placeholder="Type your message here." />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Accept terms and conditions
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <label htmlFor="airplane-mode" className="text-sm font-medium leading-none">
              Airplane Mode
            </label>
          </div>
        </div>
      </section>

      {/* Interactive Overlays */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Overlays & Dialogs</h2>
        <div className="flex gap-4">
          <ConfirmDialog
            title="Delete product?"
            description="This action cannot be undone. This will permanently delete the product from the server."
            destructive
            onConfirm={() => toast.error("Product deleted")}
            trigger={<Button variant="destructive"><RiDeleteBinLine className="mr-2 h-4 w-4" /> Delete</Button>}
            confirmText="Delete permanently"
          />
          <Button variant="outline" onClick={() => toast.success("Event has been created!")}>
            Show Toast
          </Button>
        </div>
      </section>

      {/* Data Display */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Data Display (Table)</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell><Badge variant="outline">Paid</Badge></TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">INV002</TableCell>
                <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                <TableCell>PayPal</TableCell>
                <TableCell className="text-right">$150.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>

      {/* Tabs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Tabs</h2>
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="p-4 border rounded-md mt-2">
            Account settings go here.
          </TabsContent>
          <TabsContent value="password" className="p-4 border rounded-md mt-2">
            Change your password here.
          </TabsContent>
        </Tabs>
      </section>

      {/* Feedback states */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Feedback States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skeleton Loader</h3>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Empty State</h3>
            <EmptyState
              title="No products found"
              description="Get started by creating a new product."
              action={<Button>Add Product</Button>}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
