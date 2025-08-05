'use client'

import { api } from '@/lib/trpc'
import { Button } from '@livrili/ui'

export default function ApiTestPage() {
  const session = api.auth.getSession.useQuery()
  const signInMutation = api.auth.signIn.useMutation()
  const productsList = api.products.list.useQuery({ page: 1, limit: 10 })
  const tagsList = api.tags.list.useQuery({ limit: 10 })
  const popularTags = api.tags.getPopular.useQuery({ limit: 5 })

  const handleTestSignIn = async () => {
    try {
      const result = await signInMutation.mutateAsync({
        username: 'test@example.com',
        password: 'password123',
      })
      console.log('Sign in result:', result)
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="p-4 bg-gray-100 rounded">
            <pre>{JSON.stringify(session.data, null, 2)}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Test Sign In</h2>
          <Button onClick={handleTestSignIn} disabled={signInMutation.isPending}>
            {signInMutation.isPending ? 'Signing in...' : 'Test Sign In'}
          </Button>
          {signInMutation.data && (
            <div className="mt-4 p-4 bg-green-100 rounded">
              <pre>{JSON.stringify(signInMutation.data, null, 2)}</pre>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Products List</h2>
          <div className="p-4 bg-gray-100 rounded">
            {productsList.isPending ? (
              <p>Loading products...</p>
            ) : productsList.error ? (
              <div className="text-red-600">
                <p>Error: {productsList.error.message}</p>
                <pre>{JSON.stringify(productsList.error, null, 2)}</pre>
              </div>
            ) : (
              <pre>{JSON.stringify(productsList.data, null, 2)}</pre>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Tags List</h2>
          <div className="p-4 bg-gray-100 rounded">
            {tagsList.isPending ? (
              <p>Loading tags...</p>
            ) : tagsList.error ? (
              <div className="text-red-600">
                <p>Error: {tagsList.error.message}</p>
                <pre>{JSON.stringify(tagsList.error, null, 2)}</pre>
              </div>
            ) : (
              <pre>{JSON.stringify(tagsList.data, null, 2)}</pre>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
          <div className="p-4 bg-gray-100 rounded">
            {popularTags.isPending ? (
              <p>Loading popular tags...</p>
            ) : popularTags.error ? (
              <div className="text-red-600">
                <p>Error: {popularTags.error.message}</p>
                <pre>{JSON.stringify(popularTags.error, null, 2)}</pre>
              </div>
            ) : (
              <pre>{JSON.stringify(popularTags.data, null, 2)}</pre>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 p-4 bg-blue-100 rounded">
        <p className="text-sm">
          The API is integrated into the Next.js app at <code>/api/trpc</code>.
          <br />
          Admin Portal API: http://localhost:3001/api/trpc
          <br />
          Retail Portal API: http://localhost:3002/api/trpc
        </p>
      </div>
    </div>
  )
}