import { Button } from '@livrili/ui'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account has been created successfully. Our team will review your
            application and activate your account within 24-48 hours.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            You will receive an email notification once your account is approved.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link href="/login">
            <Button className="w-full" size="lg">
              Back to Login
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}