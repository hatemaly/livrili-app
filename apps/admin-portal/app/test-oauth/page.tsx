'use client'

import { useState } from 'react'
import { supabase } from '@livrili/database'

export default function TestOAuthPage() {
  const [authUrl, setAuthUrl] = useState('')
  const [error, setError] = useState('')

  const testOAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3001/auth/callback',
          skipBrowserRedirect: true, // Don't redirect, just get the URL
        },
      })

      if (error) {
        setError(error.message)
        console.error('OAuth error:', error)
      } else if (data?.url) {
        setAuthUrl(data.url)
        console.log('OAuth URL:', data.url)
      }
    } catch (err) {
      console.error('Error:', err)
      setError(String(err))
    }
  }

  const testDirectOAuth = () => {
    // Direct Supabase OAuth URL
    const directUrl = `https://yklrjzlidixjlbhppltf.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent('http://localhost:3001/auth/callback')}`
    window.open(directUrl, '_blank')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testOAuth}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test OAuth URL Generation
          </button>
        </div>

        <div>
          <button
            onClick={testDirectOAuth}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Direct Supabase OAuth
          </button>
        </div>

        {authUrl && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="font-semibold">Generated OAuth URL:</p>
            <p className="text-xs break-all mt-2">{authUrl}</p>
            <a
              href={authUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Open OAuth URL
            </a>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-100 rounded">
          <h2 className="font-semibold mb-2">Debug Info:</h2>
          <ul className="text-sm space-y-1">
            <li>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</li>
            <li>Current Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</li>
            <li>Expected Callback: http://localhost:3001/auth/callback</li>
          </ul>
        </div>
      </div>
    </div>
  )
}