'use client'

import { useState, useMemo } from 'react'
import { usePageTitle } from '../../../hooks/use-page-title'
import { Button, DataTable, Modal } from '@livrili/ui'
import { api } from '@/lib/trpc'
import { UserForm } from '@/components/users/user-form'
import { PasswordChangeForm } from '@/components/users/password-change-form'
import { UserFiltersComponent } from '@/components/users/user-filters'
import type { User, UserFilters, CreateUserData, UpdateUserData } from '@/types/user'

export default function UsersPage() {
  usePageTitle('Users Management - Livrili Admin Portal')
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
    retailer_id: '',
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null)

  const { data: users, isLoading, refetch } = api.users.list.useQuery()
  const { data: retailers } = api.retailers.getAll.useQuery({
    limit: 1000,
    status: 'active',
  })
  const { data: userStats } = api.users.getStats.useQuery()

  const createUserMutation = api.users.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreateModalOpen(false)
    },
    onError: (error) => {
      console.error('Failed to create user:', error.message)
    },
  })

  const updateUserMutation = api.users.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingUser(null)
    },
    onError: (error) => {
      console.error('Failed to update user:', error.message)
    },
  })

  const updatePasswordMutation = api.users.updatePassword.useMutation({
    onSuccess: () => {
      setPasswordChangeUser(null)
    },
    onError: (error) => {
      console.error('Failed to update password:', error.message)
    },
  })

  const handleCreateUser = (data: CreateUserData) => {
    createUserMutation.mutate(data)
  }

  const handleUpdateUser = (data: UpdateUserData) => {
    if (!editingUser) return
    updateUserMutation.mutate({
      id: editingUser.id,
      data,
    })
  }

  const handlePasswordChange = (password: string) => {
    if (!passwordChangeUser) return
    updatePasswordMutation.mutate({
      id: passwordChangeUser.id,
      password,
    })
  }

  const handleToggleStatus = (user: User) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { is_active: !user.is_active },
    })
  }

  const filteredUsers = useMemo(() => {
    if (!users) return []

    return users.filter((user: User) => {
      const matchesSearch = !filters.search || 
        user.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.retailers?.business_name?.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesRole = !filters.role || user.role === filters.role
      const matchesStatus = !filters.status || 
        (filters.status === 'active' && user.is_active) ||
        (filters.status === 'inactive' && !user.is_active)
      const matchesRetailer = !filters.retailer_id || user.retailer_id === filters.retailer_id

      return matchesSearch && matchesRole && matchesStatus && matchesRetailer
    })
  }, [users, filters])

  const columns = [
    {
      key: 'user',
      header: 'User',
      accessor: (user: User) => (
        <div>
          <p className="font-medium text-gray-900">{user.full_name || user.username}</p>
          <p className="text-sm text-gray-500">@{user.username}</p>
          {user.phone && (
            <p className="text-sm text-gray-500">{user.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (user: User) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : user.role === 'retailer'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      ),
    },
    {
      key: 'retailer',
      header: 'Retailer',
      accessor: (user: User) => (
        user.retailers ? (
          <div>
            <p className="text-sm font-medium text-gray-900">{user.retailers.business_name}</p>
          </div>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (user: User) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      accessor: (user: User) => (
        <div className="text-sm">
          {user.last_login_at ? (
            <div>
              <p>{new Date(user.last_login_at).toLocaleDateString()}</p>
              <p className="text-gray-500">({user.login_count} times)</p>
            </div>
          ) : (
            <span className="text-gray-500">Never</span>
          )}
        </div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      accessor: (user: User) => (
        new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (user: User) => (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingUser(user)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPasswordChangeUser(user)}
          >
            Password
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(user)}
            disabled={updateUserMutation.isPending}
            className={user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {user.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage user accounts and permissions
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-livrili-prussian hover:bg-livrili-prussian/90"
          >
            Add New User
          </Button>
        </div>

        {/* Stats Cards */}
        {userStats && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{userStats.byRole.admin}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Retailers</p>
                  <p className="text-2xl font-bold text-blue-600">{userStats.byRole.retailer}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <UserFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        retailers={retailers?.retailers || []}
      />

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={filteredUsers}
          columns={columns}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyMessage="No users found matching the current filters."
        />
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
        size="lg"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createUserMutation.isPending}
          retailers={retailers?.retailers || []}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
        size="lg"
      >
        {editingUser && (
          <UserForm
            user={editingUser}
            onSubmit={handleUpdateUser}
            onCancel={() => setEditingUser(null)}
            isLoading={updateUserMutation.isPending}
            retailers={retailers?.retailers || []}
          />
        )}
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={!!passwordChangeUser}
        onClose={() => setPasswordChangeUser(null)}
        title="Change Password"
        size="md"
      >
        {passwordChangeUser && (
          <PasswordChangeForm
            onSubmit={handlePasswordChange}
            onCancel={() => setPasswordChangeUser(null)}
            isLoading={updatePasswordMutation.isPending}
            userName={passwordChangeUser.full_name || passwordChangeUser.username}
          />
        )}
      </Modal>
    </div>
  )
}