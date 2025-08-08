import { SupabaseClient } from '@supabase/supabase-js'
import { verifyPassword, hashPassword } from './password-utils'
import type { 
  AuthUser, 
  LoginResult, 
  ValidationResult, 
  LoginAttempt,
} from './types'

export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Authenticate user with Supabase Auth (recommended)
   * This method uses Supabase's built-in authentication
   */
  async loginWithSupabase(
    email: string,
    password: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<LoginResult> {
    try {
      // Use Supabase Auth for authentication
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.user || !data.session) {
        await this.logLoginAttempt('unknown', ipAddress, false, 'login', userAgent)
        return {
          success: false,
          message: 'Invalid email or password',
        }
      }

      // Get user data from our users table
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        // Log failed attempt for auditing
        await this.logLoginAttempt('unknown', ipAddress, false, 'login', userAgent)
        return {
          success: false,
          message: 'User not found in system',
        }
      }

      // Update last login
      await this.updateLastLogin(userData.id)

      // Log successful login
      await this.logLoginAttempt(userData.id, ipAddress, true, 'login', userAgent)

      return {
        success: true,
        user: userData,
        token: data.session.access_token,
        expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
        requiresPasswordChange: userData.must_change_password || false,
      }
    } catch (error) {
      console.error('Supabase login error:', error)
      return {
        success: false,
        message: 'An error occurred during login',
      }
    }
  }

  /**
   * Legacy authentication with username/password (deprecated)
   * Note: Use loginWithSupabase instead for new implementations
   */
  async loginWithCredentials(
    username: string,
    password: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<LoginResult> {
    try {
      // Fetch user by username
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (userError || !user) {
        // Log failed attempt for non-existent user
        await this.logLoginAttempt('unknown', ipAddress, false, 'login', userAgent)
        return {
          success: false,
          message: 'Invalid username or password',
        }
      }

      // Verify password
      let passwordValid = false
      
      // Check if user has new password_hash
      if (user.password_hash) {
        passwordValid = await verifyPassword(password, user.password_hash)
      } 
      // Fallback to temp_password for migration
      else if (user.temp_password && password === user.temp_password) {
        passwordValid = true
        user.must_change_password = true
      }

      if (!passwordValid) {
        // Log failed attempt for auditing
        await this.logLoginAttempt(user.id, ipAddress, false, 'login', userAgent)
        return {
          success: false,
          message: 'Invalid username or password',
        }
      }

      // For legacy auth, we recommend migrating to Supabase Auth

      // Update last login
      await this.updateLastLogin(user.id)

      // Log successful login
      await this.logLoginAttempt(user.id, ipAddress, true, 'login', userAgent)

      return {
        success: true,
        user,
        // Note: No token returned for legacy auth - should use Supabase Auth instead
        requiresPasswordChange: user.must_change_password || false,
        message: 'Legacy authentication - please migrate to Supabase Auth',
      }
    } catch (error) {
      console.error('Legacy login error:', error)
      return {
        success: false,
        message: 'An error occurred during login',
      }
    }
  }

  /**
   * Validate Supabase token
   */
  async validateSupabaseToken(token: string): Promise<ValidationResult> {
    try {
      // Verify token with Supabase
      const { data: { user }, error } = await this.supabase.auth.getUser(token)

      if (error || !user) {
        return { valid: false, error: 'Invalid token' }
      }

      // Get user data from our users table
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        return { valid: false, error: 'User not found or inactive' }
      }

      return {
        valid: true,
        user: userData,
      }
    } catch (error) {
      console.error('Token validation error:', error)
      return { valid: false, error: 'Token validation failed' }
    }
  }

  /**
   * Legacy token validation (deprecated)
   */
  async validateToken(token: string): Promise<ValidationResult> {
    return this.validateSupabaseToken(token)
  }

  /**
   * Logout user using Supabase Auth
   */
  async logoutSupabase(ipAddress: string, userAgent?: string): Promise<boolean> {
    try {
      // Get current user first for logging
      const { data: { user } } = await this.supabase.auth.getUser()
      
      // Sign out from Supabase
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        console.error('Error signing out:', error)
        return false
      }

      // Log logout if we have user info
      if (user) {
        const { data: userData } = await this.supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (userData) {
          await this.logLoginAttempt(
            userData.id,
            ipAddress,
            true,
            'logout',
            userAgent
          )
        }
      }

      return true
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }

  /**
   * Legacy logout (deprecated)
   */
  async logout(token: string, ipAddress: string, userAgent?: string): Promise<boolean> {
    return this.logoutSupabase(ipAddress, userAgent)
  }

  /**
   * Change user password using Supabase Auth
   */
  async changePasswordSupabase(
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Use Supabase's password update method
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, message: error.message }
      }

      // Get current user and update our users table
      const { data: { user } } = await this.supabase.auth.getUser()
      if (user) {
        await this.supabase
          .from('users')
          .update({
            must_change_password: false,
            password_changed_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      }

      return { success: true }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, message: 'An error occurred' }
    }
  }

  /**
   * Legacy password change (deprecated)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    
    try {
      // Fetch user
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        return { success: false, message: 'User not found' }
      }

      // Verify current password
      let passwordValid = false
      
      if (user.password_hash) {
        passwordValid = await verifyPassword(currentPassword, user.password_hash)
      } else if (user.temp_password && currentPassword === user.temp_password) {
        passwordValid = true
      }

      if (!passwordValid) {
        return { success: false, message: 'Current password is incorrect' }
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword)

      // Update user password
      const { error: updateError } = await this.supabase
        .from('users')
        .update({
          password_hash: newPasswordHash,
          temp_password: null,
          must_change_password: false,
          password_changed_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating password:', updateError)
        return { success: false, message: 'Failed to update password' }
      }

      return { success: true }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, message: 'An error occurred' }
    }
  }

  // Private helper methods

  private async updateLastLogin(userId: string): Promise<void> {
    await this.supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
      })
      .eq('id', userId)
  }

  private async logLoginAttempt(
    userId: string,
    ipAddress: string,
    success: boolean,
    action: 'login' | 'logout' | 'password_change' = 'login',
    userAgent?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('login_attempts')
        .insert({
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
          success,
          action,
        })
    } catch (error) {
      console.error('Error logging login attempt:', error)
    }
  }
}