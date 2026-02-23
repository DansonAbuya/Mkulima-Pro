'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthUser } from '@/lib/auth/session'

interface DashboardNavProps {
  user: AuthUser
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const userRole = user.role || 'farmer'
  const firstName = user.first_name || 'User'

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/protected', label: 'Dashboard' },
    { href: '/protected/advisory', label: 'Advisory' },
    { href: '/protected/finance', label: 'Finance' },
    { href: '/protected/marketplace', label: 'Marketplace' },
    { href: '/protected/logistics', label: 'Logistics' },
    { href: '/protected/weather', label: 'Weather' },
    { href: '/protected/groups', label: 'Groups' },
    { href: '/protected/analytics', label: 'Analytics' },
  ]

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <Link href="/protected" className="flex items-center">
          <Image src="/logo.png" alt="Mkulima Pro" width={120} height={36} className="h-7 w-auto object-contain" />
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <nav
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative top-16 lg:top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 transition-transform duration-300 z-30 overflow-y-auto`}
      >
        <div className="p-6">
          <Link href="/protected" className="hidden lg:flex lg:items-center mb-8">
            <Image src="/logo.png" alt="Mkulima Pro" width={140} height={40} className="h-8 w-auto object-contain" />
          </Link>

          <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="font-semibold text-gray-900">{firstName}</div>
            <div className="text-sm text-gray-600 capitalize">{userRole.replace('_', ' ')}</div>
            <div className="text-xs text-gray-500 mt-1 truncate">{user.email}</div>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-green-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-20" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
