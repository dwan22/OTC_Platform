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
      <div className="flex h-screen bg-slate-50">
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl border-r border-slate-800">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-semibold tracking-tight text-white">OTC Platform</h1>
            <p className="text-xs text-slate-400 mt-1 font-light">Order to Cash Management</p>
          </div>
          <nav className="px-3 flex-1 overflow-y-auto py-4">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              href="/tiers"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <Settings className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Subscription Tiers</span>
            </Link>
            <Link
              href="/customers"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <Users className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Customers</span>
            </Link>
            <Link
              href="/contracts"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <FileText className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Contracts</span>
            </Link>
            <Link
              href="/billing/invoices"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <DollarSign className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Invoices</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <User className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Profile</span>
            </Link>
            
            <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reports
            </div>
            
            <Link
              href="/reports/ar-aging"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">AR Aging</span>
            </Link>
            <Link
              href="/reports/revenue-recognition"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Revenue Recognition</span>
            </Link>
            <Link
              href="/reports/balance-sheet"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Balance Sheet</span>
            </Link>
            <Link
              href="/reports/pnl-flux"
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors duration-200 mb-0.5 group"
            >
              <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">P&L Flux Analysis</span>
            </Link>
          </nav>
        </aside>
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-3.5 shadow-sm">
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
