/**
 * Token storage utilities for client-side authentication
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/**
 * Store authentication token
 */
export function storeAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    // Store in cookie for SSR support
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Strict`
    
    // Also store in localStorage for easy access
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  // Try to get from cookie first
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === TOKEN_KEY) {
      return value || null
    }
  }

  // Fallback to localStorage
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Remove authentication token
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    // Remove cookie
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    
    // Remove from localStorage
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Store user data
 */
export function storeUserData(user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/**
 * Get user data
 */
export function getUserData(): any | null {
  if (typeof window === 'undefined') {
    return null
  }

  const data = localStorage.getItem(USER_KEY)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  }
  return null
}

/**
 * Remove user data
 */
export function removeUserData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Clear all auth data
 */
export function clearAuthData(): void {
  removeAuthToken()
  removeUserData()
}