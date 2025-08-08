// Types
export * from './types'

// Client-side exports
export * from './client/hooks'
export * from './client/context'
export * from './client/storage'

// Components
export * from './components'

// Hooks exports  
export { useSupabaseAuth } from './hooks/use-supabase-auth'
export type { UseSupabaseAuthReturn } from './hooks/use-supabase-auth'

// Server-side exports (for Node.js environments only)
export * from './server/types'

// Re-exports for convenience
export { useAuth } from './client/hooks'
export { AuthProvider } from './client/context'