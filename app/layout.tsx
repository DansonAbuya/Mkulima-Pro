import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Mkulima Pro - Smart Farming Platform',
  description: 'Connecting Kenya\'s farmers with advisory, finance, marketplace, and logistics solutions',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Mkulima Pro' },
  // Favicon: app/icon.png | Apple touch: app/apple-icon.png (Next.js file convention). Logo in UI: /logo.png
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  )
}
