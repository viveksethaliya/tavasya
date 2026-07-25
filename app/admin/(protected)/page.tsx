import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { RiBox3Line, RiStackLine, RiArticleLine, RiAddLine, RiArrowRightLine } from '@remixicon/react'
import { Badge } from '@/components/ui/badge'

async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: publishedProducts },
    { count: totalCollections },
    { count: totalBlogs },
    { data: recentProducts },
    { data: recentBlogs },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('collections').select('*', { count: 'exact', head: true }),
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('id, name, status, created_at, category').order('created_at', { ascending: false }).limit(5),
    supabase.from('blogs').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return {
    totalProducts: totalProducts ?? 0,
    publishedProducts: publishedProducts ?? 0,
    totalCollections: totalCollections ?? 0,
    totalBlogs: totalBlogs ?? 0,
    recentProducts: recentProducts ?? [],
    recentBlogs: recentBlogs ?? [],
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      sub: `${stats.publishedProducts} published`,
      icon: RiBox3Line,
      href: '/admin/products',
      color: 'bg-[#324E64]',
    },
    {
      label: 'Collections',
      value: stats.totalCollections,
      sub: 'product groups',
      icon: RiStackLine,
      href: '/admin/collections',
      color: 'bg-[#2D6A4F]',
    },
    {
      label: 'Blog Posts',
      value: stats.totalBlogs,
      sub: 'total articles',
      icon: RiArticleLine,
      href: '/admin/blog',
      color: 'bg-[#6B3FA0]',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#324E64] tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="group">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="text-4xl font-black text-[#324E64] mt-1">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
                <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-base font-semibold text-[#324E64] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'New Product', href: '/admin/products/new' },
            { label: 'New Collection', href: '/admin/collections/new' },
            { label: 'New Blog Post', href: '/admin/blog/new' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F0F2F5] hover:bg-[#F3BA43]/20 border border-transparent hover:border-[#F3BA43]/40 transition-all group"
            >
              <span className="text-sm font-medium text-[#324E64]">{action.label}</span>
              <RiAddLine className="h-4 w-4 text-[#324E64] group-hover:text-[#F3BA43] transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-[#324E64]">Recent Products</h2>
            <Link href="/admin/products" className="text-xs text-[#F3BA43] hover:underline flex items-center gap-1">
              View all <RiArrowRightLine className="h-3 w-3" />
            </Link>
          </div>
          {stats.recentProducts.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">No products yet.</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {stats.recentProducts.map((product) => (
                <li key={product.id}>
                  <Link href={`/admin/products/${product.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{product.name}</p>
                      {product.category && <p className="text-xs text-slate-400">{product.category}</p>}
                    </div>
                    <Badge variant={product.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                      {product.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-[#324E64]">Recent Blog Posts</h2>
            <Link href="/admin/blog" className="text-xs text-[#F3BA43] hover:underline flex items-center gap-1">
              View all <RiArrowRightLine className="h-3 w-3" />
            </Link>
          </div>
          {stats.recentBlogs.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">No blog posts yet.</div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {stats.recentBlogs.map((blog) => (
                <li key={blog.id}>
                  <Link href={`/admin/blog/${blog.id}/edit`} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                    <p className="text-sm font-medium text-slate-800 truncate max-w-[220px]">{blog.title}</p>
                    <Badge variant={blog.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                      {blog.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
