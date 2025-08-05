/**
 * Retailer Authentication Router Usage Examples
 * 
 * This file demonstrates how to use the retailer authentication router
 * which implements the admin-managed password system for retailers.
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../src/root'

// Create TRPC client
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      // Add auth token to requests
      headers: () => {
        const token = localStorage.getItem('auth_token')
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})

// Example usage functions

/**
 * Login a retailer user with username and password
 */
export async function loginRetailer(username: string, password: string) {
  try {
    // Get device information (in a real app, this would come from browser APIs)
    const deviceInfo = {
      deviceType: 'desktop', // or 'mobile', 'tablet'
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other',
      os: navigator.platform.includes('Win') ? 'Windows' : 'Other',
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    }

    const result = await trpc.retailerAuth.login.mutate({
      username,
      password,
      deviceInfo,
    })

    if (result.success) {
      // Store auth token
      localStorage.setItem('auth_token', result.token)
      
      // Store user info
      localStorage.setItem('user_info', JSON.stringify(result.user))
      
      console.log('Login successful:', result.user)
      
      // Check if password change is required
      if (result.mustChangePassword) {
        console.log('Password change required - redirect to change password page')
        return { ...result, requiresPasswordChange: true }
      }
      
      return result
    }
  } catch (error) {
    console.error('Login failed:', error)
    
    // Handle specific error types
    if (error.data?.code === 'TOO_MANY_REQUESTS') {
      console.log('Account is locked:', error.data.cause?.locked_until)
      throw new Error('Account is temporarily locked. Please try again later.')
    }
    
    if (error.data?.code === 'UNAUTHORIZED') {
      const attemptsRemaining = error.data.cause?.attempts_remaining
      if (attemptsRemaining !== undefined) {
        throw new Error(`Invalid credentials. ${attemptsRemaining} attempts remaining.`)
      }
      throw new Error('Invalid username or password.')
    }
    
    throw new Error('Login failed. Please try again.')
  }
}

/**
 * Logout the current user
 */
export async function logoutRetailer() {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.log('No active session to logout')
      return
    }

    await trpc.retailerAuth.logout.mutate({ token })
    
    // Clear local storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    
    console.log('Logout successful')
    
    // Redirect to login page
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout failed:', error)
    
    // Clear local storage anyway
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }
}

/**
 * Validate the current auth token
 */
export async function validateCurrentSession() {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return { valid: false, error: 'No token found' }
    }

    const result = await trpc.retailerAuth.validateToken.query({ token })
    
    if (result.valid) {
      // Update stored user info
      localStorage.setItem('user_info', JSON.stringify(result.user))
      console.log('Session is valid:', result.user)
    } else {
      console.log('Session is invalid:', result.error)
      // Clear invalid token
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
    }
    
    return result
  } catch (error) {
    console.error('Token validation failed:', error)
    return { valid: false, error: 'Validation failed' }
  }
}

/**
 * Get current user session information
 */
export async function getCurrentSession() {
  try {
    const result = await trpc.retailerAuth.getSession.query()
    console.log('Current session:', result)
    return result
  } catch (error) {
    console.error('Failed to get session:', error)
    
    if (error.data?.code === 'UNAUTHORIZED') {
      // Clear invalid session
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      window.location.href = '/login'
    }
    
    throw error
  }
}

/**
 * Change password (for users who must change their temp password)
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const result = await trpc.retailerAuth.changePassword.mutate({
      currentPassword,
      newPassword,
    })
    
    console.log('Password changed successfully')
    return result
  } catch (error) {
    console.error('Password change failed:', error)
    
    if (error.data?.code === 'UNAUTHORIZED') {
      throw new Error('Current password is incorrect.')
    }
    
    throw new Error('Failed to change password. Please try again.')
  }
}

/**
 * Initialize auth system - check for existing session on page load
 */
export async function initializeAuth() {
  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    console.log('No existing session found')
    return null
  }
  
  // Validate existing token
  const validation = await validateCurrentSession()
  
  if (validation.valid) {
    console.log('Existing session is valid')
    return validation.user
  } else {
    console.log('Existing session is invalid')
    return null
  }
}

/**
 * Auth state management hook (for use with React or similar)
 */
export function createAuthStateManager() {
  let currentUser = null
  let isAuthenticated = false
  
  return {
    async login(username: string, password: string) {
      const result = await loginRetailer(username, password)
      if (result.success) {
        currentUser = result.user
        isAuthenticated = true
      }
      return result
    },
    
    async logout() {
      await logoutRetailer()
      currentUser = null
      isAuthenticated = false
    },
    
    async initialize() {
      const user = await initializeAuth()
      if (user) {
        currentUser = user
        isAuthenticated = true
      }
      return user
    },
    
    getCurrentUser() {
      return currentUser
    },
    
    isLoggedIn() {
      return isAuthenticated
    },
    
    requiresPasswordChange() {
      return currentUser?.must_change_password || false
    },
  }
}

// Usage example:
/*

// Initialize on app startup
const authManager = createAuthStateManager()

// On app load
authManager.initialize().then(user => {
  if (user) {
    console.log('User is already logged in:', user)
    
    if (authManager.requiresPasswordChange()) {
      // Redirect to password change page
      window.location.href = '/change-password'
    } else {
      // Redirect to dashboard
      window.location.href = '/dashboard'
    }
  } else {
    // Show login form
    showLoginForm()
  }
})

// On login form submission
async function handleLogin(username, password) {
  try {
    await authManager.login(username, password)
    
    if (authManager.requiresPasswordChange()) {
      window.location.href = '/change-password'
    } else {
      window.location.href = '/dashboard'
    }
  } catch (error) {
    showError(error.message)
  }
}

// On logout button click
async function handleLogout() {
  await authManager.logout()
  window.location.href = '/login'
}

*/