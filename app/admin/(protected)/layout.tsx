'use server'

import React from 'react'
import { Inter } from 'next/font/google'
import { requireAdmin } from '@/server/auth/requireAdmin'
import AdminSidebar from './_components/admin-sidebar'

const inter = Inter({ subsets: ['latin'] })

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className={`min-h-screen flex bg-[#F0F2F5] ${inter.className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        div[data-slot="dialog-content"],
        div[data-slot="select-content"],
        div[data-slot="dialog-overlay"],
        section[data-sonner-toaster] {
          font-family: ${inter.style.fontFamily} !important;
        }
      `}} />
      <AdminSidebar />
      <main className="flex-grow p-6 lg:p-10 overflow-auto">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
