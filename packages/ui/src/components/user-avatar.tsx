'use client'

import { useState } from 'react'

interface UserAvatarProps {
  user: {
    fullName?: string | null
    username?: string | null
    email?: string | null
    oauthProfile?: any
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  
  // Try to get avatar URL from OAuth profile
  const avatarUrl = user.oauthProfile?.avatar_url || user.oauthProfile?.picture

  // Get initials for fallback
  const getInitials = () => {
    if (user.fullName) {
      return user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return '?'
  }

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl'
  }

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={user.fullName || user.username || 'User avatar'}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-livrili-prussian text-white flex items-center justify-center font-medium ${sizeClasses[size]} ${className}`}
    >
      {getInitials()}
    </div>
  )
}