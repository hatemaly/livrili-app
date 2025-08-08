import { verifyAuthToken } from '@livrili/auth/src/server/jwt-utils'

// Re-export with the expected name for backward compatibility
export const verifySupabaseToken = verifyAuthToken

// Re-export the type
export type { AuthTokenPayload } from '@livrili/auth/src/server/types'