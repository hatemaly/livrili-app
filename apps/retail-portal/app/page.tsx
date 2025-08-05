import { Button } from '@livrili/ui'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm">
        <h1 className="text-3xl font-bold text-center mb-4">
          Welcome to Livrili
        </h1>
        <p className="text-center text-base text-muted-foreground mb-8">
          Algeria&apos;s #1 B2B Marketplace
        </p>
        <div className="flex flex-col gap-4">
          <Link href="/login">
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="w-full" size="lg">
              Register Your Business
            </Button>
          </Link>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          Connecting retailers and suppliers across Algeria
        </p>
      </div>
    </main>
  )
}