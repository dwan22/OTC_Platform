'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { db } from '@/lib/instant'
import { User, Mail, Shield, Clock, Users } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  
  // Check if current user is admin
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  // Fetch all users if admin (using InstantDB admin API)
  const { data: allUsers, isLoading: usersLoading } = db.useQuery(
    isAdmin ? { $users: {} } : null
  )

  if (!user) return null

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">User Profile</h1>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-12">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-slate-900" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user.email}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-300">Authenticated User</p>
                  {isAdmin && (
                    <span className="px-2 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Mail className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="text-slate-900 font-medium mt-1">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Shield className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-600">User ID</p>
                  <p className="text-slate-900 font-mono text-sm mt-1">{user.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Clock className="h-5 w-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-600">Created At</p>
                  <p className="text-slate-900 mt-1">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-600">Status</p>
                  <p className="text-green-900 font-medium mt-1">Authenticated ✓</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🎉 Authentication Working!</h3>
              <p className="text-blue-800 text-sm">
                Your InstantDB authentication is set up correctly. You're viewing this page because you're authenticated.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Section - Show All Users */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-yellow-500 px-8 py-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-yellow-900" />
                <div>
                  <h2 className="text-2xl font-bold text-yellow-900">Admin Panel</h2>
                  <p className="text-yellow-800 text-sm mt-1">All registered users</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Loading users...</p>
                </div>
              ) : allUsers?.$users && allUsers.$users.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Total Users: {allUsers.$users.length}
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">User ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Created</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.$users.map((u: any) => (
                          <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="font-medium text-slate-900">{u.email}</span>
                                {u.email === user.email && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                    You
                                  </span>
                                )}
                                {u.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {u.id}
                              </code>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Object Debug Info */}
        {!isAdmin && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">User Object</h3>
            <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded overflow-x-auto font-mono">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
