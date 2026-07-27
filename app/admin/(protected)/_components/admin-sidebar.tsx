'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/server/auth/actions'
import {
  RiDashboardLine,
  RiBox3Line,
  RiStackLine,
  RiArticleLine,
  RiImageLine,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiMenuLine,
  RiCloseLine,
  RiMessage3Line,
} from '@remixicon/react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: RiDashboardLine, exact: true },
  { label: 'Inquiries', href: '/admin/inquiries', icon: RiMessage3Line },
  { label: 'Products', href: '/admin/products', icon: RiBox3Line },
  { label: 'Collections', href: '/admin/collections', icon: RiStackLine },
  { label: 'Blog', href: '/admin/blog', icon: RiArticleLine },
  { label: 'Media', href: '/admin/media', icon: RiImageLine },
]

const settingsItems = [
  { label: 'General', href: '/admin/settings/general', icon: RiSettings3Line },
  { label: 'SEO', href: '/admin/settings/seo', icon: RiSettings3Line },
]

function NavLink({ item, isActive, setMobileOpen }: { item: typeof navItems[0], isActive: (href: string, exact?: boolean) => boolean, setMobileOpen: (open: boolean) => void }) {
  const active = isActive(item.href, item.exact)
  return (
    <Link
      href={item.href}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-[#F3BA43] text-[#324E64] shadow-sm'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      {item.label}
    </Link>
  )
}

function SidebarContent({ isActive, setMobileOpen }: { isActive: (href: string, exact?: boolean) => boolean, setMobileOpen: (open: boolean) => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F3BA43] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-[#324E64] font-black text-xs">M</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-sm tracking-tight leading-none">Meridian</h2>
            <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={isActive} setMobileOpen={setMobileOpen} />
        ))}

        <div className="pt-4 mt-4 border-t border-white/10">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settings</p>
          {settingsItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-[#F3BA43] text-[#324E64] shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-white/10">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-150"
          >
            <RiLogoutBoxLine className="h-5 w-5 flex-shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const isActive = React.useCallback((href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }, [pathname])

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#324E64] text-white rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <RiCloseLine className="h-5 w-5" /> : <RiMenuLine className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1E3448] flex-col flex-shrink-0 min-h-screen shadow-xl">
        <SidebarContent isActive={isActive} setMobileOpen={setMobileOpen} />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#1E3448] flex flex-col shadow-xl transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isActive={isActive} setMobileOpen={setMobileOpen} />
      </aside>
    </>
  )
}
