import Link from 'next/link'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col bg-green-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-10 border-b border-green-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="Mkulima Pro" width={140} height={40} className="h-8 w-auto object-contain" priority />
          </Link>
        </div>
      </header>

      {/* Scrollable Auth Content */}
      <main className="flex-1 overflow-y-auto pt-7">
        {children}
      </main>
    </div>
  )
}
