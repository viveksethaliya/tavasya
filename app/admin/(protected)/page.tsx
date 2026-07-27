import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { RiBox3Line, RiStackLine, RiArticleLine, RiMessage3Line, RiAddLine, RiArrowRightLine } from '@remixicon/react'
import { Badge } from '@/components/ui/badge'

async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: publishedProducts },
    { count: totalCollections },
    { count: totalBlogs },
    { count: totalInquiries },
    { count: newInquiries },
    { data: recentProducts },
    { data: recentBlogs },
    { data: recentInquiries },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('collections').select('*', { count: 'exact', head: true }),
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('products').select('id, name, status, created_at, category').order('created_at', { ascending: false }).limit(6),
    supabase.from('blogs').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('contact_submissions').select('id, name, status, created_at').order('created_at', { ascending: false }).limit(6),
  ])

  return {
    totalProducts: totalProducts ?? 0,
    publishedProducts: publishedProducts ?? 0,
    totalCollections: totalCollections ?? 0,
    totalBlogs: totalBlogs ?? 0,
    totalInquiries: totalInquiries ?? 0,
    newInquiries: newInquiries ?? 0,
    recentProducts: recentProducts ?? [],
    recentBlogs: recentBlogs ?? [],
    recentInquiries: recentInquiries ?? [],
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
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Collections',
      value: stats.totalCollections,
      sub: 'product categories',
      icon: RiStackLine,
      href: '/admin/collections',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Inquiries',
      value: stats.totalInquiries,
      sub: `${stats.newInquiries} unread messages`,
      icon: RiMessage3Line,
      href: '/admin/inquiries',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Blog Posts',
      value: stats.totalBlogs,
      sub: 'total articles published',
      icon: RiArticleLine,
      href: '/admin/blog',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-100',
    },
  ]

  return (
    <div className="space-y-10 w-full pb-10">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#324E64] tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-2">Here's a detailed look at what's happening in your business right now.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products/new" className="px-4 py-2 bg-[#F3BA43] hover:bg-[#F3BA43]/90 text-[#324E64] font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2">
            <RiAddLine className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="group outline-none">
            <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group-focus-visible:ring-2 ring-offset-2 ring-[#324E64]`}>
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${card.bgColor}`} />
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                  <p className="text-5xl font-black text-[#324E64] tracking-tight">{card.value}</p>
                  <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 block" /> {card.sub}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${card.bgColor} ${card.borderColor} border`}>
                  <card.icon className={`h-7 w-7 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/admin/inquiries" className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#F3BA43] hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center relative">
              <RiMessage3Line className="h-6 w-6 text-amber-600" />
              {stats.newInquiries > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-[#324E64] transition-colors">Review Inquiries</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{stats.newInquiries > 0 ? `${stats.newInquiries} pending review` : 'All caught up'}</p>
            </div>
          </div>
          <RiArrowRightLine className="h-5 w-5 text-slate-300 group-hover:text-[#F3BA43] transition-colors" />
        </Link>

        <Link href="/admin/products/new" className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#F3BA43] hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <RiBox3Line className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-[#324E64] transition-colors">New Product</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Add to catalog</p>
            </div>
          </div>
          <RiAddLine className="h-5 w-5 text-slate-300 group-hover:text-[#F3BA43] transition-colors" />
        </Link>

        <Link href="/admin/collections/new" className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#F3BA43] hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <RiStackLine className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-[#324E64] transition-colors">New Collection</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Group products</p>
            </div>
          </div>
          <RiAddLine className="h-5 w-5 text-slate-300 group-hover:text-[#F3BA43] transition-colors" />
        </Link>

        <Link href="/admin/blog/new" className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#F3BA43] hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <RiArticleLine className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-[#324E64] transition-colors">New Blog Post</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Publish article</p>
            </div>
          </div>
          <RiAddLine className="h-5 w-5 text-slate-300 group-hover:text-[#F3BA43] transition-colors" />
        </Link>
      </div>

      {/* Main Grid: Data Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Recent Inquiries (Takes more space) */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#324E64]">Recent Inquiries</h2>
              <p className="text-xs text-slate-400 mt-1">Latest messages from the contact form</p>
            </div>
            <Link href="/admin/inquiries" className="text-sm font-semibold text-[#F3BA43] hover:text-[#324E64] transition-colors flex items-center gap-1 bg-[#F3BA43]/10 px-4 py-2 rounded-lg">
              View all
            </Link>
          </div>
          {stats.recentInquiries.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-400 flex-grow flex items-center justify-center">No inquiries received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-4">Name</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <Link href="/admin/inquiries" className="font-semibold text-slate-800 hover:text-[#324E64] block">
                          {inq.name}
                        </Link>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant={inq.status === 'new' ? 'default' : inq.status === 'replied' ? 'outline' : 'secondary'} className={inq.status === 'new' ? 'bg-blue-500 hover:bg-blue-600' : ''}>
                          {inq.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-slate-500">
                        {new Date(inq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Products (Side column) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#324E64]">Products</h2>
              <p className="text-xs text-slate-400 mt-1">Recently added items</p>
            </div>
            <Link href="/admin/products" className="text-sm font-semibold text-[#324E64] hover:text-[#F3BA43] transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">
              Manage
            </Link>
          </div>
          {stats.recentProducts.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400 flex-grow flex items-center justify-center">No products yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100 flex-grow">
              {stats.recentProducts.map((product) => (
                <li key={product.id}>
                  <Link href={`/admin/products/${product.id}/edit`} className="flex items-center justify-between px-8 py-4 hover:bg-slate-50 transition-colors group">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px] group-hover:text-[#324E64] transition-colors">{product.name}</p>
                      {product.category && <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>}
                    </div>
                    <Badge variant={product.status === 'published' ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {product.status}
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
