export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-livrili-prussian">Livrili</h1>
          <p className="mt-2 text-sm text-gray-600">Algeria&apos;s #1 B2B Marketplace</p>
        </div>
        {children}
      </div>
    </div>
  )
}