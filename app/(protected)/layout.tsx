'use client'

import Link from "next/link"
import { LayoutDashboard, Users, FileText, DollarSign, BarChart3, Settings, User } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserMenu } from "@/components/layout/user-menu"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
        <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl">
          <div className="p-6 border-b border-slate-700/50">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">OTC Platform</h1>
            <p className="text-sm text-slate-400 mt-1">Vibe-Coded AI Company</p>
          </div>
          <nav className="px-3 flex-1 overflow-y-auto py-4">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <LayoutDashboard className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/tiers"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <Settings className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Subscription Tiers</span>
            </Link>
            <Link
              href="/customers"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Customers</span>
            </Link>
            <Link
              href="/contracts"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Contracts</span>
            </Link>
            <Link
              href="/billing/invoices"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <DollarSign className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Invoices</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <User className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Profile</span>
            </Link>
            
            <div className="mt-6 mb-3 px-3 text-xs font-bold text-purple-300 uppercase tracking-wider">
              Reports
            </div>
            
            <Link
              href="/reports/ar-aging"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <BarChart3 className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">AR Aging</span>
            </Link>
            <Link
              href="/reports/revenue-recognition"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <BarChart3 className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Revenue Recognition</span>
            </Link>
            <Link
              href="/reports/balance-sheet"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <BarChart3 className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Balance Sheet</span>
            </Link>
            <Link
              href="/reports/pnl-flux"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-1 group"
            >
              <BarChart3 className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">P&L Flux Analysis</span>
            </Link>
          </nav>
        </aside>
        
        <div className="flex-1 flex flex-col">
          <header className="glass-effect border-b border-slate-200/50 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-end">
              <UserMenu />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
