import React from 'react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header>Public Navbar Placeholder</header>
      <main className="flex-grow">{children}</main>
      <footer>Public Footer Placeholder</footer>
    </div>
  )
}
