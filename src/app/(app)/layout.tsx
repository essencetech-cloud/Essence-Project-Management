export const dynamic = 'force-dynamic'

import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
