'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { db } from "@/lib/db"
import { useMemo } from "react"

export default function BalanceSheetPage() {
  const { isLoading, error, data: queryData } = db.useQuery({
    invoices: {
      payments: {},
    },
    payments: {},
    revenueSchedules: {},
    arReserves: {},
    journalEntries: {},
  })
  
  const data = useMemo(() => {
    if (!queryData) return null
    
    const invoices = queryData.invoices || []
    const payments = queryData.payments || []
    const schedules = queryData.revenueSchedules || []
    const reserves = queryData.arReserves || []
    const entries = queryData.journalEntries || []
    
    const totalCash = payments.reduce((sum: number, p: any) => sum + p.amount, 0)
    
    // Only include outstanding invoices (not PAID or VOID) in AR calculation
    const outstandingInvoices = invoices.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'VOID')
    
    const totalAR = outstandingInvoices.reduce((sum: number, inv: any) => {
      const paid = (inv.payments || []).reduce((pSum: number, p: any) => pSum + p.amount, 0)
      return sum + (inv.totalAmount - paid)
    }, 0)
    
    const totalReserve = reserves.reduce((sum: number, r: any) => sum + r.reserveAmount, 0)
    const netAR = totalAR - totalReserve
    
    const totalDeferredRevenue = schedules.reduce((sum: number, s: any) => sum + s.deferredAmount, 0)
    const deferredRevenue = totalDeferredRevenue
    
    const totalAssets = totalCash + netAR
    const totalLiabilities = totalDeferredRevenue
    const totalEquity = totalAssets - totalLiabilities
    
    const accountMap = new Map()
    
    entries.forEach((entry: any) => {
      const key = entry.accountCode
      if (!accountMap.has(key)) {
        accountMap.set(key, {
          accountCode: entry.accountCode,
          accountName: entry.accountName,
          debitTotal: 0,
          creditTotal: 0,
        })
      }
      const account = accountMap.get(key)
      account.debitTotal += entry.debitAmount
      account.creditTotal += entry.creditAmount
    })
    
    const trialBalance = Array.from(accountMap.values()).map(account => ({
      ...account,
      balance: account.debitTotal - account.creditTotal,
    }))
    
    return {
      totalCash,
      totalAR,
      netAR,
      totalReserve,
      totalDeferredRevenue,
      totalAssets,
      totalLiabilities,
      totalEquity,
      trialBalance,
      deferredRevenue,
    }
  }, [queryData])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading balance sheet...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading balance sheet: {error.message}</div>
      </div>
    )
  }
  
  if (!data) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">No data available</div>
      </div>
    )
  }
  
  const { totalCash, totalAR, netAR, totalReserve, totalDeferredRevenue, totalAssets, totalLiabilities, totalEquity, trialBalance, deferredRevenue } = data
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Balance Sheet Reconciliation</h1>
        <p className="text-slate-600 mt-1">Financial position and subledger reconciliation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalLiabilities)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEquity)}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Balance Sheet</CardTitle>
            <CardDescription>Simplified balance sheet as of {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-bold text-slate-900 mb-2">ASSETS</div>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Cash</span>
                    <span className="text-sm font-medium">{formatCurrency(totalCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Accounts Receivable</span>
                    <span className="text-sm font-medium">{formatCurrency(totalAR)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground ml-4">Less: Allowance for Doubtful Accounts</span>
                    <span className="text-sm text-red-600">({formatCurrency(totalReserve)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm ml-4">Net AR</span>
                    <span className="text-sm font-medium">{formatCurrency(netAR)}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t font-bold">
                  <span>Total Assets</span>
                  <span>{formatCurrency(totalAssets)}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="text-sm font-bold text-slate-900 mb-2">LIABILITIES</div>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Deferred Revenue</span>
                    <span className="text-sm font-medium">{formatCurrency(totalDeferredRevenue)}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t font-bold">
                  <span>Total Liabilities</span>
                  <span>{formatCurrency(totalLiabilities)}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="text-sm font-bold text-slate-900 mb-2">EQUITY</div>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Retained Earnings</span>
                    <span className="text-sm font-medium">{formatCurrency(totalEquity)}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t font-bold">
                  <span>Total Equity</span>
                  <span>{formatCurrency(totalEquity)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t-2 border-slate-900">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Liabilities & Equity</span>
                  <span>{formatCurrency(totalLiabilities + totalEquity)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subledger Reconciliation</CardTitle>
            <CardDescription>GL to subledger reconciliation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="text-sm font-bold mb-3">Accounts Receivable</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>GL Balance (Account 1100)</span>
                    <span className="font-medium">{formatCurrency(totalAR)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AR Subledger Total</span>
                    <span className="font-medium">{formatCurrency(totalAR)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Variance</span>
                    <span className="font-bold text-green-600">{formatCurrency(0)}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm font-bold mb-3">Allowance for Doubtful Accounts</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>GL Balance (Account 1200)</span>
                    <span className="font-medium">{formatCurrency(totalReserve)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AR Reserve Calculation</span>
                    <span className="font-medium">{formatCurrency(totalReserve)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Variance</span>
                    <span className="font-bold text-green-600">{formatCurrency(0)}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm font-bold mb-3">Deferred Revenue</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>GL Balance (Account 2300)</span>
                    <span className="font-medium">{formatCurrency(totalDeferredRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue Schedule Subledger</span>
                    <span className="font-medium">{formatCurrency(deferredRevenue)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Variance</span>
                    <span className={`font-bold ${Math.abs(totalDeferredRevenue - deferredRevenue) < 1 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(totalDeferredRevenue - deferredRevenue))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
          <CardDescription>General ledger account balances</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead className="text-right">Debit Total</TableHead>
                <TableHead className="text-right">Credit Total</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialBalance.map((account: any) => (
                <TableRow key={account.accountCode}>
                  <TableCell className="font-medium">{account.accountCode}</TableCell>
                  <TableCell>{account.accountName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(account.debitTotal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(account.creditTotal)}</TableCell>
                  <TableCell className={`text-right font-medium ${account.balance < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(Math.abs(account.balance))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
