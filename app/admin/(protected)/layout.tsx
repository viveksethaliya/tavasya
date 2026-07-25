import React from 'react'
import { requireAdmin } from '@/server/auth/requireAdmin'
import { signOut } from '@/server/auth/actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforce admin session
  await requireAdmin()

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col shadow-xl flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Meridian Admin</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {/* Placeholders for navigation */}
          <div className="block px-4 py-2 rounded text-gray-400 opacity-50 cursor-not-allowed">
            Dashboard
          </div>
          <div className="block px-4 py-2 rounded text-gray-400 opacity-50 cursor-not-allowed">
            Products
          </div>
          <div className="block px-4 py-2 rounded text-gray-400 opacity-50 cursor-not-allowed">
            Collections
          </div>
          <div className="block px-4 py-2 rounded text-gray-400 opacity-50 cursor-not-allowed">
            Blog
          </div>
          <div className="block px-4 py-2 rounded text-gray-400 opacity-50 cursor-not-allowed">
            Media
          </div>
          <div className="block px-4 py-2 rounded text-gray-400 opacity-50 cursor-not-allowed">
            Settings
          </div>
        </nav>
        
        <div className="p-4 mt-auto border-t border-gray-800">
          <form action={signOut}>
            <button 
              type="submit"
              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      
      <main className="flex-grow p-8 bg-white m-4 rounded-lg shadow-sm overflow-auto">
        {children}
      </main>
    </div>
  )
}
