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
      <div className="flex h-screen">
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold">OTC Platform</h1>
            <p className="text-sm text-slate-400 mt-1">Vibe-Coded AI Company</p>
          </div>
          <nav className="px-3 flex-1 overflow-y-auto">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/customers"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <Users className="h-5 w-5" />
              <span>Customers</span>
            </Link>
            <Link
              href="/contracts"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <FileText className="h-5 w-5" />
              <span>Contracts</span>
            </Link>
            <Link
              href="/tiers"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <Settings className="h-5 w-5" />
              <span>Subscription Tiers</span>
            </Link>
            <Link
              href="/billing/invoices"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <DollarSign className="h-5 w-5" />
              <span>Invoices</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            
            <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Reports
            </div>
            
            <Link
              href="/reports/ar-aging"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <BarChart3 className="h-5 w-5" />
              <span>AR Aging</span>
            </Link>
            <Link
              href="/reports/revenue-recognition"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Revenue Recognition</span>
            </Link>
            <Link
              href="/reports/balance-sheet"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Balance Sheet</span>
            </Link>
            <Link
              href="/reports/pnl-flux"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors mb-1"
            >
              <BarChart3 className="h-5 w-5" />
              <span>P&L Flux Analysis</span>
            </Link>
          </nav>
        </aside>
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-end">
              <UserMenu />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto bg-slate-50">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
