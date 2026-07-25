import type { Metadata } from 'next'
import { Hanken_Grotesk } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const hanken = Hanken_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | Meridian Machine Works',
    default: 'Meridian Machine Works',
  },
  description: 'Premium industrial machinery, precision machining solutions, and automated systems for modern manufacturing.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meridian-machine-works.com',
  }
}

export const viewport = {
  themeColor: '#324E64',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${hanken.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
