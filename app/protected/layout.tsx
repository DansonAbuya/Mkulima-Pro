import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session?.user) {
    return redirect('/auth/login')
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row overflow-hidden">
      <DashboardNav user={session.user} />
      <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
    </div>
  )
}
