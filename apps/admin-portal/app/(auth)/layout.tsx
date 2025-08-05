import { GuestGuard } from '@/components/guards/guest-guard'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </GuestGuard>
  )
}