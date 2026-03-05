'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { LogOut, User, ChevronDown } from 'lucide-react'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium text-slate-900">{user.email}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-600" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-medium text-slate-900">{user.email}</p>
              <p className="text-xs text-slate-500 mt-1">Signed in</p>
            </div>
            <button
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
