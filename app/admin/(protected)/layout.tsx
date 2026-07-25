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
      <AdminSidebar />
      <main className="flex-grow p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
