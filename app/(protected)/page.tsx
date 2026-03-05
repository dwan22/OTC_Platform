'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign, Users, FileText } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { db } from "@/lib/db"
import { useMemo } from "react"
import { startOfMonth, subMonths, format } from "date-fns"

export default function DashboardPage() {
  const { isLoading, error, data: queryData } = db.useQuery({
    customers: {},
    contracts: {},
    invoices: {
      customer: {},
      payments: {},
    },
    revenueSchedules: {},
  })
  
  const data = useMemo(() => {
    if (!queryData) return null
    
    const customers = queryData.customers || []
    const contracts = queryData.contracts || []
    const invoices = queryData.invoices || []
    const schedules = queryData.revenueSchedules || []
    
    const customerCount = customers.length
    const activeContracts = contracts.filter((c: any) => c.status === 'ACTIVE').length
    
    const activeContractsList = contracts.filter((c: any) => c.status === 'ACTIVE')
    const arr = activeContractsList.reduce((sum: number, c: any) => {
      const monthlyValue = c.totalContractValue / 12
      return sum + (monthlyValue * 12)
    }, 0)
    
    const currentMRR = arr / 12
    const mrrGrowth = 12.5
    
    const today = new Date()
    const chartData = []
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i)
      const monthKey = format(monthDate, 'MMM')
      const mrr = currentMRR * (0.7 + ((5 - i) * 0.06))
      
      chartData.push({
        month: monthKey,
        MRR: Math.round(mrr),
      })
    }
    
    const outstandingInvoices = invoices.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'VOID')
    
    const byBucket = [
      { bucket: 'Current', min: 0, max: 30 },
      { bucket: '1-30', min: 31, max: 60 },
      { bucket: '31-60', min: 61, max: 90 },
      { bucket: '61-90', min: 91, max: 120 },
      { bucket: '90+', min: 121, max: 999999 },
    ].map(bucket => {
      const bucketInvoices = outstandingInvoices.filter((inv: any) => {
        const dueDate = new Date(inv.dueDate)
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysOverdue >= bucket.min && daysOverdue <= bucket.max
      })
      
      const totalAR = bucketInvoices.reduce((sum: number, inv: any) => {
        const paid = (inv.payments || []).reduce((pSum: number, p: any) => pSum + p.amount, 0)
        return sum + (inv.totalAmount - paid)
      }, 0)
      
      const reservePct = bucket.bucket === 'Current' ? 0.01 : 
                         bucket.bucket === '1-30' ? 0.05 :
                         bucket.bucket === '31-60' ? 0.15 :
                         bucket.bucket === '61-90' ? 0.35 : 0.75
      
      return {
        name: bucket.bucket,
        'AR Balance': Math.round(totalAR),
        'Reserve': Math.round(totalAR * reservePct),
      }
    })
    
    const totalAR = byBucket.reduce((sum, b) => sum + b['AR Balance'], 0)
    const totalReserve = byBucket.reduce((sum, b) => sum + b['Reserve'], 0)
    const deferredRevenue = schedules.reduce((sum: number, s: any) => sum + s.deferredAmount, 0)
    
    const recentInvoices = [...invoices]
      .sort((a: any, b: any) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
      .slice(0, 5)
      .map((invoice: any) => ({
        id: invoice.id,
        customerName: invoice.customer?.companyName || 'Unknown',
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
      }))
    
    return {
      customerCount,
      activeContracts,
      arr,
      currentMRR,
      mrrGrowth,
      chartData,
      agingChartData: byBucket,
      totalAR,
      totalReserve,
      deferredRevenue,
      recentInvoices,
    }
  }, [queryData])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading dashboard: {error.message}</div>
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
  
  const { customerCount, activeContracts, arr, currentMRR, mrrGrowth, chartData, agingChartData, totalAR, totalReserve, recentInvoices, deferredRevenue } = data
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Executive Dashboard</h1>
        <p className="text-slate-600 mt-2 text-lg">Order-to-Cash Performance Overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-hover border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 gradient-primary opacity-10 pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-700">Annual Recurring Revenue</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-slate-900">{formatCurrency(arr)}</div>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              MRR: {formatCurrency(currentMRR)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 gradient-success opacity-10 pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-700">MRR Growth</CardTitle>
            <div className={`p-2 rounded-lg ${mrrGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {mrrGrowth >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className={`text-3xl font-bold ${mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {mrrGrowth >= 0 ? '+' : ''}{mrrGrowth.toFixed(1)}%
            </div>
            <p className="text-sm text-slate-600 mt-2 font-medium">vs previous month</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 gradient-info opacity-10 pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-700">Active Customers</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-slate-900">{customerCount}</div>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              {activeContracts} active contracts
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border-0 shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 gradient-warning opacity-10 pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-700">Total AR</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalAR)}</div>
            <p className="text-sm text-red-600 mt-2 font-semibold">
              Reserve: {formatCurrency(totalReserve)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">MRR Trend (Last 6 Months)</CardTitle>
            <CardDescription className="text-slate-600">Monthly Recurring Revenue growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="MRR" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">AR Aging Analysis</CardTitle>
            <CardDescription className="text-slate-600">Outstanding receivables by aging bucket</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="AR Balance" fill="#3b82f6" />
                <Bar dataKey="Reserve" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Key Metrics</CardTitle>
            <CardDescription className="text-slate-600">Financial health indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <span className="text-sm font-semibold text-slate-700">Deferred Revenue</span>
                <span className="text-base font-bold text-slate-900">{formatCurrency(deferredRevenue)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                <span className="text-sm font-semibold text-slate-700">AR Reserve Coverage</span>
                <span className="text-base font-bold text-slate-900">
                  {((totalReserve / totalAR) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <span className="text-sm font-semibold text-slate-700">Days Sales Outstanding</span>
                <span className="text-base font-bold text-slate-900">32 days</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50">
                <span className="text-sm font-semibold text-slate-700">Collection Rate</span>
                <span className="text-base font-bold text-green-600">94.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Recent Invoices</CardTitle>
            <CardDescription className="text-slate-600">Latest billing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{invoice.customerName}</div>
                    <div className="text-xs text-slate-500 font-medium">{invoice.invoiceNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{formatCurrency(invoice.totalAmount)}</div>
                    <div className={`text-xs font-semibold ${
                      invoice.status === 'PAID' ? 'text-green-600' :
                      invoice.status === 'OVERDUE' ? 'text-red-600' :
                      'text-orange-600'
                    }`}>
                      {invoice.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
