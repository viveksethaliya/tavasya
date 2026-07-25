import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RiArrowLeftLine, RiLockLine } from '@remixicon/react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
      <div className="text-center max-w-sm mx-auto px-6">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <RiLockLine className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#324E64] mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm mb-8">
          You do not have permission to access the admin panel. Please sign in with an admin account.
        </p>
        <Link href="/admin/login">
          <Button className="bg-[#324E64] hover:bg-[#324E64]/90">
            <RiArrowLeftLine className="mr-2 h-4 w-4" /> Go to Login
          </Button>
        </Link>
      </div>
    </div>
  )
}
